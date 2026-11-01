import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const results = (page: import("@playwright/test").Page) => page.locator("ol.results");

test("search by name from the header, then open a recipe", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Find a drink" }).fill("negroni");
  await page.getByRole("searchbox", { name: "Find a drink" }).press("Enter");
  await expect(page).toHaveURL(/\/recipes\?q=negroni/);
  await expect(page.locator("#results-h")).toContainText("for “negroni”");
  await results(page).getByRole("link", { name: "Negroni", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Negroni");
});

test("a ticked filter applies at once and keeps the place", async ({ page }) => {
  await page.goto("/recipes?q=negroni");
  const before = await page.locator("#results-h").textContent();
  await page.getByRole("group", { name: "Method" }).getByText("Stirred").click();
  await expect(page).toHaveURL(/method=stirred/);
  await expect(page.locator("#results-h")).not.toHaveText(before!);
  await expect(
    page.getByRole("group", { name: "Method" }).getByRole("checkbox", { name: /Stirred/ }),
  ).toBeChecked();
});

test("'/' focuses the search and can be turned off", async ({ page }) => {
  await page.goto("/recipes");
  await page.locator("body").press("/");
  await expect(page.locator("#q")).toBeFocused();
  await page.getByRole("button", { name: "Turn off" }).click();
  await page.locator("#results-h").click();
  await page.keyboard.press("/");
  await expect(page.locator("#q")).not.toBeFocused();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("ingredients match through the hierarchy, and an unknown one is explained", async ({
    page,
  }) => {
    await page.goto("/recipes");
    await page.getByLabel("With", { exact: true }).fill("whiskey");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(
      page.getByRole("group", { name: "Ingredients" }).getByRole("checkbox", { name: "Whiskey" }),
    ).toBeChecked();
    await page.getByLabel("With", { exact: true }).fill("Manhattan");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("We don't have “Manhattan” in the bar yet.")).toBeVisible();
    await page.goto("/recipes?include=whiskey&q=manhattan");
    await expect(results(page)).toContainText("Manhattan"); // rye counts as whiskey
    await page.goto("/recipes?include=bourbon-whiskey&q=manhattan");
    await expect(page.getByText("Nothing matches all of that.")).toBeVisible();
    await page.getByRole("link", { name: "Drop Bourbon Whiskey" }).click();
    await expect(results(page)).toContainText("Manhattan");
  });
});

for (const scheme of ["light", "dark"] as const) {
  for (const width of [1440, 360]) {
    test(`the search page passes axe in ${scheme} at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/recipes?include=whiskey&method=stirred");
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
