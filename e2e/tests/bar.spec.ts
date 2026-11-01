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
  await expect(status(page)).toHaveText("Added Bourbon Whiskey.");
  await expect(shelf(page).locator(".shelf__item")).toHaveText([
    /^Bourbon WhiskeySpirits ›.*Whiskey/,
  ]);

  await page.locator("summary", { hasText: "Spirits" }).click();
  const spirits = page.locator("details[open]");
  await spirits.getByLabel("Gin", { exact: true }).check();
  await spirits.getByLabel("Light Rum", { exact: true }).check();
  await spirits.getByRole("checkbox", { name: "Bourbon Whiskey on your bar" }).check();
  await spirits.getByRole("button", { name: "Add ticked" }).click();
  await expect(status(page)).toHaveText(
    "Added 2: Gin and Light Rum. Bourbon Whiskey was already there.",
  );

  await page.getByRole("button", { name: "Remove Gin" }).click();
  await expect(status(page)).toHaveText("Gin removed.");
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
  await expect(status(page)).toHaveText("Light Rum removed.");
  await page.reload();
  await expect(shelf(page).locator(".shelf__name")).toHaveText(["Bourbon Whiskey"]);
});

test("the landing demo's bottles start the bar", async ({ page }) => {
  await page.goto("/");
  await page.locator("#demo").getByRole("button", { name: "Start my bar" }).click();
  await expect(page).toHaveURL(/\/bar\?/);
  await expect(status(page)).toHaveText(/^Added \d+ to your bar\.$/);
  for (const name of ["Gin", "Sweet Vermouth", "Campari", "Lemon juice"]) {
    await expect(shelf(page).locator(".shelf__name", { hasText: name })).toBeVisible();
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a name that is not exact offers suggestions to pick from", async ({ page }) => {
    await page.goto("/bar");
    await addByName(page, "whisk");
    await expect(page.locator("#add-error")).toHaveText(
      "No exact match for “whisk”. Did you mean one of these?",
    );
    await expect(page.getByLabel("Bottle or ingredient")).toHaveValue("whisk");
    await page.getByRole("button", { name: "Add Rye whiskey" }).click();
    await expect(status(page)).toHaveText("Added Rye whiskey.");

    await addByName(page, "unobtainium");
    await expect(page.locator("#add-error")).toContainText("We don't have “unobtainium”");
  });
});

for (const scheme of ["light", "dark"] as const) {
  for (const width of [1440, 360]) {
    test(`My Bar passes axe, ${scheme} at ${width}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/bar");
      await addByName(page, "gin");
      await expect(status(page)).toBeVisible();
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
