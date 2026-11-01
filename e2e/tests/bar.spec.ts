import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { freshEmail, mailedLink } from "./mail.ts";

const status = (page: Page) => page.locator(".bar-status");
const shelf = (page: Page) => page.locator("form.shelf");
const addByName = async (page: Page, name: string) => {
  await page.getByLabel("Bottle or ingredient").fill(name);
  await page.getByRole("button", { name: "Add", exact: true }).click();
};

test("a signed-out shelf: add by name, a category at once, remove, then it moves in at sign-up", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("header.site-header")
    .getByRole("link", { name: "My Bar", exact: true })
    .click();
  await expect(page).toHaveURL("/bar");
  await expect(
    page.getByText("You're not signed in, so this bar lives on this device"),
  ).toBeVisible();
  await expect(page.getByText("Nothing on your shelf yet.")).toBeVisible();

  await addByName(page, "bourbon whiskey");
  await expect(status(page)).toContainText("Added Bourbon Whiskey.");
  await expect(shelf(page).locator(".shelf__item")).toHaveText([
    /^Bourbon WhiskeySpirits ›.*Whiskey/,
  ]);

  await page.locator("summary", { hasText: "Spirits" }).click();
  const spirits = page.locator("details[open]");
  await spirits.getByLabel("Gin", { exact: true }).check();
  await spirits.getByLabel("Light Rum", { exact: true }).check();
  await spirits.getByRole("checkbox", { name: "Bourbon Whiskey on your bar" }).check();
  await spirits.getByRole("button", { name: "Add ticked" }).click();
  await expect(status(page)).toContainText(
    "Added 2: Gin and Light Rum. Bourbon Whiskey was already there.",
  );

  await page.getByRole("button", { name: "Remove Gin" }).click();
  await expect(status(page)).toContainText("Gin removed.");
  await expect(page.getByRole("heading", { name: /On your shelf/ })).toContainText("2 ingredients");

  // Signing up moves the shelf into the new account and drops the cookie.
  const email = freshEmail("bar");
  await page.getByRole("link", { name: "Create an account" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.goto(await mailedLink(email, /Confirm/));
  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Confirm and sign in" }).click();
  await expect(page).toHaveURL("/");
  expect((await page.context().cookies()).some((c) => c.name === "shelf")).toBe(false);
  await page.goto("/bar");
  await expect(page.getByText("You're not signed in")).toHaveCount(0);
  await expect(shelf(page).locator(".shelf__name")).toHaveText(["Bourbon Whiskey", "Light Rum"]);

  // Signed in, the bar lives in the account.
  await page.getByRole("button", { name: "Remove Light Rum" }).click();
  await expect(status(page)).toContainText("Light Rum removed.");
  await page.reload();
  await expect(shelf(page).locator(".shelf__name")).toHaveText(["Bourbon Whiskey"]);
});

test("the landing demo's bottles start the bar", async ({ page }) => {
  await page.goto("/");
  await page.locator("#demo").getByRole("button", { name: "Start my bar" }).click();
  await expect(page).toHaveURL(/\/bar\?/);
  await expect(status(page)).toHaveText(/^Added \d+ to your bar\. You can make \d+ now\.$/);
  for (const name of ["Gin", "Sweet Vermouth", "Campari", "Lemon juice"]) {
    await expect(shelf(page).locator(".shelf__name", { hasText: name })).toBeVisible();
  }
});

const results = (page: Page) => page.locator("#results");
const startFromDemo = async (page: Page) => {
  await page.goto("/");
  await page.locator("#demo").getByRole("button", { name: "Start my bar" }).click();
  await expect(page).toHaveURL(/\/bar\?/);
};

test("beside the bar: every recipe it makes, what's one bottle away and what to buy next", async ({
  page,
}) => {
  // Gin, Sweet Vermouth, Campari and the usual (the demo's default shelf).
  await startFromDemo(page);
  await expect(status(page)).toContainText("You can make 7 now.");
  const make = results(page).locator("section", { has: page.locator("#make-h") });
  await expect(page.locator("#make-h")).toHaveText("You can make 7 recipes");
  await expect(make.locator(".result__name")).toHaveCount(7);
  await expect(make.locator(".result").filter({ hasText: "Negroni" })).toContainText("19.8% ABV");
  const away = results(page).locator("section", { has: page.locator("#away-h") });
  await expect(away.locator(".result").filter({ hasText: "Boulevardier" })).toContainText(
    "Bourbon Whiskey",
  );
  await expect(results(page).locator("#buy-h")).toBeVisible();
  await expect(results(page).locator(".table-card tbody tr").first()).toContainText(
    /\d+ more recipes?/,
  );

  await make.getByRole("link", { name: "Negroni", exact: true }).click();
  await expect(page).toHaveURL("/recipes/negroni");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("adding the missing bottle from the results moves its recipe to make now", async ({
    page,
  }) => {
    await startFromDemo(page);
    const away = results(page).locator("section", { has: page.locator("#away-h") });
    await away
      .locator(".result")
      .filter({ hasText: "Boulevardier" })
      .getByRole("button", { name: "Add Bourbon Whiskey" })
      .click();
    await expect(status(page)).toContainText("Added Bourbon Whiskey. You can make");
    const make = results(page).locator("section", { has: page.locator("#make-h") });
    await expect(make.getByRole("link", { name: "Boulevardier", exact: true })).toBeAttached();
  });

  test("a name that is not exact offers suggestions to pick from", async ({ page }) => {
    await page.goto("/bar");
    await addByName(page, "whisk");
    await expect(page.locator("#add-error")).toHaveText(
      "No exact match for “whisk”. Did you mean one of these?",
    );
    await expect(page.getByLabel("Bottle or ingredient")).toHaveValue("whisk");
    await page.getByRole("button", { name: "Add Rye whiskey" }).click();
    await expect(status(page)).toContainText("Added Rye whiskey.");

    await addByName(page, "unobtainium");
    await expect(page.locator("#add-error")).toContainText("We don't have “unobtainium”");
  });
});

for (const scheme of ["light", "dark"] as const) {
  for (const width of [1440, 360]) {
    test(`My Bar passes axe, ${scheme} at ${width}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 900 });
      await startFromDemo(page);
      await page.locator(".matches__more summary").first().click();
      await addByName(page, "whisk");
      await page.locator("summary", { hasText: "Spirits" }).click();
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(violations.map((v) => v.id)).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    });
  }
}
