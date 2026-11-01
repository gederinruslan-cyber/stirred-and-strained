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

  test("'No' gives the zero-proof side of the bar, locked", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "No, I'm under 18" }).click();
    await expect(page.getByText("Zero-proof: on")).toBeVisible();
    await expect(page.getByRole("switch")).toHaveCount(0);
    await expect(page.getByText("You're seeing the zero-proof side of the bar.")).toBeVisible();
    await expect(page.getByRole("article", { name: "Negroni" })).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: "Bourbon", exact: true })).toHaveCount(0);
    const res = await page.request.post("/prefs", {
      form: { zero: "off", back: "/" },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(303);
    await page.goto("/");
    await expect(page.getByText("Zero-proof: on")).toBeVisible();
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
    test(`the gate passes axe in ${scheme} at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/age");
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
