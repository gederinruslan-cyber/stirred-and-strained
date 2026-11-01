import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("a recipe page shows the spec, its strength for the country and where it is from", async ({
  page,
}) => {
  await page.goto("/recipes/negroni");
  await expect(page).toHaveTitle("Negroni · Stirred & Strained");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Negroni");
  await expect(page.locator(".recipe__meta")).toHaveText(/built · rocks glass/);
  await expect(page.locator(".lines li").first()).toHaveText(/Gin\s*30 ml/);
  // ADR 0004 for a US visitor (the e2e cookie): 30 ml each at 40%, 25% and 18%, built.
  await expect(page.locator(".strength")).toContainText("19.8% ABV · 1.4 standard drinks");
  await expect(page.locator(".strength")).toContainText(
    "after the ice, by Arnold's dilution model",
  );
  await expect(page.getByRole("link", { name: "Spec via iba-world.com" })).toHaveAttribute(
    "href",
    /^https:\/\/iba-world\.com\//,
  );
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(ld).toMatchObject({ "@type": "Recipe", name: "Negroni", recipeCategory: "Cocktail" });
  expect(ld.recipeIngredient[0]).toBe("30 ml Gin");

  await page.getByRole("link", { name: "Coffee Negroni →" }).click();
  await expect(page.getByText("A twist on the Negroni")).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the chosen unit is remembered on the next recipe and on the landing", async ({ page }) => {
    await page.goto("/recipes/negroni");
    await page.getByRole("radio", { name: "oz" }).check();
    await page.getByRole("button", { name: "Show" }).click();
    await expect(page.locator(".lines li").first()).toHaveText(/Gin\s*1 oz/);
    await page.goto("/recipes/daiquiri");
    await expect(page.locator(".lines li").first()).toHaveText(/2 oz/);
    await page.goto("/");
    await expect(
      page.getByRole("article", { name: "Negroni" }).getByRole("listitem").first(),
    ).toContainText("1 oz");
  });
});

test("an unknown recipe answers 404 with a way back", async ({ page }) => {
  const res = await page.goto("/recipes/no-such-drink");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We can't find that recipe.");
  await expect(page.getByRole("link", { name: "Back to the start" })).toBeVisible();
});

test.describe("a zero-proof session (age answer No)", () => {
  test.use({
    storageState: {
      cookies: [
        {
          name: "age",
          value: "zero|GB",
          domain: "127.0.0.1",
          path: "/",
          expires: -1,
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
        {
          name: "zero",
          value: "1",
          domain: "127.0.0.1",
          path: "/",
          expires: -1,
          httpOnly: false,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    },
  });

  test("never shows an alcoholic spec, and shows zero-proof ones in full", async ({ page }) => {
    const res = await page.goto("/recipes/negroni");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "That one's not on the zero-proof side of the bar.",
    );
    await expect(page.getByText("Campari")).toHaveCount(0);
    await page.goto("/recipes/shirley-temple");
    await expect(page.locator(".strength")).toHaveText("0% ABV · nothing to count");
  });
});

for (const scheme of ["light", "dark"] as const) {
  for (const width of [1440, 360]) {
    test(`a recipe page passes axe in ${scheme} at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/recipes/negroni");
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
