import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { freshEmail, mailedLink } from "./mail.ts";

const signUp = async (page: Page) => {
  const email = freshEmail("marks");
  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.goto(await mailedLink(email, /Confirm/));
  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Confirm and sign in" }).click();
  await expect(page).toHaveURL("/");
};
const take = (page: Page) => page.getByRole("region", { name: "Your take" });
const status = (page: Page) => take(page).getByRole("status");
const rate = async (page: Page, stars: string, note?: string) => {
  await take(page).getByRole("radio", { name: stars }).check();
  if (note !== undefined) await take(page).getByLabel("Your note").fill(note);
  await take(page).getByRole("button", { name: "Save" }).click();
};

test("favourite, rate and note a recipe, undo a note, then find them in lists and filters", async ({
  page,
}) => {
  await page.goto("/recipes/negroni");
  await expect(take(page)).toContainText("Sign in to keep a favourite, a rating and a note.");
  await signUp(page);

  await page.goto("/recipes/negroni");
  await take(page).getByRole("button", { name: "Add to favourites" }).click();
  await expect(status(page)).toHaveText("Negroni is in your favourites.");
  await expect(take(page).getByRole("button", { name: "Remove from favourites" })).toBeVisible();

  await rate(page, "4 stars", "Less Campari next time, 25 ml");
  await expect(status(page)).toContainText("Saved your take on Negroni.");
  await expect(take(page).getByRole("radio", { name: "4 stars" })).toBeChecked();
  await expect(take(page).getByLabel("Your note")).toHaveValue("Less Campari next time, 25 ml");

  // A cleared note comes back with Undo.
  await take(page).getByLabel("Your note").fill("");
  await take(page).getByRole("button", { name: "Save" }).click();
  await expect(take(page).getByLabel("Your note")).toHaveValue("");
  await take(page).getByRole("button", { name: "Undo the note change" }).click();
  await expect(status(page)).toHaveText("Your note on Negroni is back as it was.");
  await expect(take(page).getByLabel("Your note")).toHaveValue("Less Campari next time, 25 ml");

  // Too long: refused with every character kept.
  const long = "x".repeat(1001);
  await take(page).getByLabel("Your note").fill(long);
  await take(page).getByRole("button", { name: "Save" }).click();
  await expect(take(page).getByText("Keep the note to 1000 characters or fewer.")).toBeVisible();
  await expect(take(page).getByLabel("Your note")).toHaveValue(long);

  await page.goto("/recipes/daiquiri");
  await rate(page, "3 stars");
  await expect(status(page)).toHaveText("Saved your take on Daiquiri.");

  await page.goto("/my-recipes");
  const favourites = page.getByRole("region", { name: "Favourites" });
  await expect(favourites.getByRole("link", { name: "Negroni" })).toBeVisible();
  await expect(favourites).toContainText("Your note: Less Campari next time, 25 ml");
  await expect(favourites).toContainText("in your favourites");
  await expect(page.getByRole("region", { name: "Rated or noted" })).toContainText("Daiquiri");

  await page.goto("/recipes?mark=rated4");
  await expect(page.locator("#results-h")).toHaveText("1 recipe");
  const row = page.locator("ol.results li").first();
  await expect(row.getByRole("link", { name: "Negroni" })).toBeVisible();
  await expect(row).toContainText("you rated it 4 of 5");
  await expect(page.getByRole("group", { name: "Yours" })).toContainText("Favourites");
});

test("signed out, search shows no Yours filter", async ({ page }) => {
  await page.goto("/recipes?mark=favourite");
  await expect(page.getByRole("group", { name: "Yours" })).toHaveCount(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the favourite button and the rating form post and come back", async ({ page }) => {
    await signUp(page);
    await page.goto("/recipes/margarita");
    await take(page).getByRole("button", { name: "Add to favourites" }).click();
    await expect(status(page)).toHaveText("Margarita is in your favourites.");
    await rate(page, "5 stars", "<b>salt</b> half the rim");
    await expect(status(page)).toContainText("Saved your take on Margarita.");
    await expect(take(page).getByLabel("Your note")).toHaveValue("<b>salt</b> half the rim");
    await page.goto("/my-recipes");
    await expect(page.getByRole("region", { name: "Favourites" })).toContainText(
      "Your note: <b>salt</b> half the rim",
    );
  });
});

for (const scheme of ["light", "dark"] as const) {
  for (const width of [1440, 360]) {
    test(`Your take passes axe, ${scheme} at ${width}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
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
      await page.goto("/recipes/negroni");
      await check();
      await signUp(page);
      await page.goto("/recipes/negroni");
      await take(page).getByRole("button", { name: "Add to favourites" }).click();
      await expect(status(page)).toBeVisible();
      await take(page).getByLabel("Your note").fill("x".repeat(1001));
      await take(page).getByRole("button", { name: "Save" }).click();
      await expect(take(page).getByText("Keep the note to 1000")).toBeVisible();
      await check();
      await rate(page, "4 stars", "Less Campari");
      await page.goto("/my-recipes");
      await check();
      await page.goto("/recipes?mark=favourite");
      await check();
    });
  }
}
