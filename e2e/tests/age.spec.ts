import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("in the United Kingdom", () => {
  test.use({ locale: "en-GB" });

  test("asks 18 before any recipe, then returns to the page asked for", async ({ page }) => {
    await page.goto("/?unit=oz");
    await expect(page).toHaveURL(/\/age\?back=/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Are you 18 or over?");
    await expect(page.locator(".age-gate__body")).toContainText("the United Kingdom");
    await expect(page.getByText("Negroni")).toHaveCount(0);
    await expect(page.locator("footer")).toContainText("0300 123 1110");
    await page.getByRole("button", { name: "Yes, I'm 18 or over" }).click();
    await expect(page).toHaveURL(/\/\?unit=oz$/);
    await expect(page.getByRole("article", { name: "Negroni" })).toBeVisible();
    await page.goto("/");
    await expect(page).not.toHaveURL(/\/age/);
  });

  test("'No' shows 'come back when you're 18' in place of every page", async ({ page }) => {
    await page.goto("/recipes/negroni");
    await page.getByRole("button", { name: "No, I'm under 18" }).click();
    for (const path of ["/", "/recipes/negroni", "/recipes?q=negroni", "/age"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Come back when you're 18.");
      await expect(page.getByText("Campari")).toHaveCount(0);
      await expect(page.getByRole("banner").getByRole("link")).toHaveCount(0);
      await expect(page.getByRole("searchbox")).toHaveCount(0);
    }
    await expect(page.locator("footer")).toContainText("0300 123 1110");
  });
});

test("asks 21 in the United States and switches country without JavaScript", async ({
  browser,
}) => {
  const page = await browser.newPage({
    locale: "en-US",
    javaScriptEnabled: false,
    storageState: { cookies: [], origins: [] },
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Are you 21 or over?");
  await page.getByLabel("Country you're in").selectOption("DE");
  await page.getByRole("button", { name: "Use this country" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Are you 18 or over?");
  await expect(page.locator(".age-gate__body")).toContainText("Germany");
  await page.close();
});

for (const scheme of ["light", "dark"] as const) {
  for (const width of [1440, 360]) {
    test(`the gate and the under-age page pass axe in ${scheme} at ${width}px`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/age");
      const gate = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(gate.violations.map((v) => v.id)).toEqual([]);
      await page.getByRole("button", { name: /^No, I'm under/ }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^Come back when/);
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
