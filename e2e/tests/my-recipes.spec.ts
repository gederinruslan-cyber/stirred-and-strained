import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { freshEmail, mailedLink } from "./mail.ts";

const signUp = async (page: Page, bottles: string[] = []) => {
  for (const name of bottles) {
    await page.goto("/bar");
    await page.getByLabel("Bottle or ingredient").fill(name);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.locator(".bar-status")).toContainText(`Added ${name}.`);
  }
  const email = freshEmail("mine");
  await page.goto("/sign-up?back=/my-recipes");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.goto(await mailedLink(email, /Confirm/));
  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Confirm and sign in" }).click();
  await expect(page).toHaveURL("/");
};
const line = async (page: Page, n: number, ingredient: string, amount: string, unit: string) => {
  await page.getByLabel(`Ingredient ${n}`, { exact: true }).fill(ingredient);
  await page.getByLabel(`Amount ${n}`, { exact: true }).fill(amount);
  await page.getByLabel(`Unit ${n}`, { exact: true }).selectOption(unit);
};
const writeNegroni = async (page: Page) => {
  await page.goto("/my-recipes");
  await page.getByRole("link", { name: "New recipe" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Ana's Negroni");
  await page.getByLabel("Method").selectOption("built");
  await page.getByLabel("Glass").selectOption({ label: "rocks glass" });
  await line(page, 1, "Gin", "1", "oz");
  await line(page, 2, "Campari", "30", "ml");
  await line(page, 3, "sweet vermouth", "3", "cl");
  await page.getByRole("button", { name: "Save recipe" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved Ana's Negroni.");
};

test("write a recipe, edit it, find it, make it from your bar, delete and undo", async ({
  page,
}) => {
  await signUp(page, ["Gin", "Campari", "Sweet Vermouth"]);
  await page.locator("header.site-header").getByRole("link", { name: "My recipes" }).click();
  await expect(page.getByText("No recipes of your own yet.")).toBeVisible();

  await writeNegroni(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ana's Negroni");
  await expect(page.locator(".recipe__head .tag--yours")).toHaveText("yours!");
  await expect(page.locator(".lines li").first()).toHaveText(/Gin\s*30 ml/);
  // ADR 0004 for a US visitor, like the house Negroni (30 ml gin there; 1 oz here).
  await expect(page.locator(".strength")).toContainText(/19\.\d% ABV · 1\.4 standard drinks/);
  await expect(page.locator(".steps li").first()).toHaveText("Fill a rocks glass with ice.");

  await page.getByRole("link", { name: "Edit recipe" }).click();
  await expect(page.getByLabel("Amount 1", { exact: true })).toHaveValue("1");
  await expect(page.getByLabel("Unit 1", { exact: true })).toHaveValue("oz");
  await page.getByLabel("Amount 2", { exact: true }).fill("25");
  await page.getByLabel("How to make it").fill("Stir it.\n<b>Garnish</b> with orange.");
  await page.getByRole("button", { name: "Save recipe" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved your changes to Ana's Negroni.");
  await expect(page.locator(".lines li").nth(1)).toHaveText(/Campari\s*25 ml/);
  await expect(page.locator(".steps li").nth(1)).toHaveText("<b>Garnish</b> with orange.");
  const history = page.locator("ol.history > li");
  await expect(history).toHaveCount(2);
  await expect(history.first()).toContainText("Edited · ");
  await history.nth(1).locator("summary").click();
  await expect(history.nth(1).locator(".lines li").nth(1)).toHaveText(/Campari\s*30 ml/);

  await page.getByRole("searchbox", { name: "Find a drink" }).fill("ana's");
  await page.getByRole("searchbox", { name: "Find a drink" }).press("Enter");
  const found = page.locator("ol.results .result").filter({ hasText: "Ana's Negroni" });
  await expect(found.locator(".tag--yours")).toBeVisible();
  await expect(found.locator(".photo-none")).toBeAttached();

  await page.goto("/bar");
  const make = page.locator('section[aria-labelledby="make-h"]');
  await make.getByRole("link", { name: "Ana's Negroni" }).click();
  await expect(page).toHaveURL(/\/my-recipes\/[0-9a-f-]{36}$/);

  await page.getByRole("button", { name: "Delete recipe" }).click();
  await expect(page).toHaveURL(/\/my-recipes\?deleted=/);
  await expect(page.getByRole("status")).toContainText("Deleted Ana's Negroni.");
  await expect(page.getByRole("heading", { name: "Deleted" })).toBeVisible();
  await page.getByRole("button", { name: "Undo deleting Ana's Negroni" }).click();
  await expect(page.getByRole("status")).toHaveText("Ana's Negroni is back.");
  await expect(page.getByRole("link", { name: "Ana's Negroni" })).toBeVisible();
});

test("a recipe that cannot be saved says what to fix and keeps what was typed", async ({
  page,
}) => {
  await signUp(page);
  await page.goto("/my-recipes/new");
  await page.getByLabel("Name", { exact: true }).fill("Mystery");
  await line(page, 1, "Unobtainium", "30", "ml");
  await line(page, 2, "Orange", "1", "piece");
  await page.getByRole("button", { name: "Save recipe" }).click();
  const summary = page.locator(".error-summary");
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("Fix 2 things before saving:");
  await expect(summary).toContainText("Choose a method.");
  await expect(summary).toContainText("We don't know “Unobtainium”. Pick one from the list.");
  await expect(page.getByLabel("Ingredient 1", { exact: true })).toHaveValue("Unobtainium");
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Mystery");

  await page.getByLabel("Method").selectOption("shaken");
  await page.getByLabel("Ingredient 1", { exact: true }).fill("");
  await page.getByLabel("Amount 1", { exact: true }).fill("");
  await page.getByRole("button", { name: "Save recipe" }).click();
  await expect(page.locator(".error-summary")).toContainText(
    "Add at least one line in ml, cl or oz so we can work out how strong it is.",
  );
});

test("signed out, My recipes asks you to sign in, and another user's recipe is not found", async ({
  page,
  browser,
}) => {
  await page.goto("/my-recipes");
  await expect(page.getByText("Your own recipes live in your account.")).toBeVisible();
  await page.goto("/my-recipes/new");
  await expect(page).toHaveURL("/sign-in?back=%2Fmy-recipes%2Fnew");

  await signUp(page);
  await writeNegroni(page);
  const url = new URL(page.url()).pathname;
  const bob = await browser.newContext({
    baseURL: new URL(page.url()).origin,
    storageState: {
      cookies: (await page.context().cookies()).filter((c) => c.name === "age"),
      origins: [],
    },
  });
  const other = await bob.newPage();
  await signUp(other);
  await other.goto(url);
  await expect(other.getByRole("heading", { name: "We can't find that recipe." })).toBeVisible();
  await bob.close();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the form saves and a bad line comes back with its error", async ({ page }) => {
    await signUp(page);
    await page.goto("/my-recipes/new");
    await page.getByLabel("Name", { exact: true }).fill("Plain Daiquiri");
    await page.getByLabel("Method").selectOption("shaken");
    await line(page, 1, "Light Rum", "60", "ml");
    await line(page, 2, "Lime juice", "", "ml");
    await page.getByRole("button", { name: "Save recipe" }).click();
    await expect(page.locator(".error-summary")).toContainText("Give an amount for Lime juice.");
    await page.getByLabel("Amount 2", { exact: true }).fill("0.75");
    await page.getByLabel("Unit 2", { exact: true }).selectOption("oz");
    await page.getByRole("button", { name: "Save recipe" }).click();
    await expect(page.getByRole("status")).toHaveText("Saved Plain Daiquiri.");
    await expect(page.locator(".lines li").nth(1)).toHaveText(/Lime juice\s*22 ml/);
  });
});

for (const scheme of ["light", "dark"] as const) {
  for (const width of [1440, 360]) {
    test(`My recipes passes axe, ${scheme} at ${width}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await signUp(page);
      await page.setViewportSize({ width, height: 900 });
      const check = async () => {
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(violations.map((v) => v.id)).toEqual([]);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
      };
      await page.goto("/my-recipes/new");
      await page.getByRole("button", { name: "Save recipe" }).click();
      await expect(page.locator(".error-summary")).toBeVisible();
      await check();
      await writeNegroni(page);
      await page.locator("ol.history summary").first().click();
      await check();
      await page.getByRole("button", { name: "Delete recipe" }).click();
      await expect(page.getByRole("heading", { name: "Deleted" })).toBeVisible();
      await check();
    });
  }
}
