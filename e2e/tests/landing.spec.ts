import { expect, test, type Page } from "@playwright/test";

const makeList = (page: Page) => page.locator("#demo .demo__results > div").first();
const awayList = (page: Page) => page.locator("#demo .demo__results > div").nth(1);

test("the demo runs on the engine and updates live as bottles are ticked", async ({ page }) => {
  await page.goto("/");
  await expect(makeList(page)).toContainText("Negroni");
  await expect(awayList(page)).toContainText("Boulevardier");
  await expect(awayList(page)).toContainText("+ Bourbon Whiskey");

  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.getByRole("checkbox", { name: "Bourbon Whiskey", exact: true }).check();
  await expect(makeList(page)).toContainText("Boulevardier");
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
  await expect(page.locator("#demo [aria-live]")).toContainText("you can make");

  for (const name of ["Gin", "Bourbon Whiskey", "Sweet Vermouth", "Campari"]) {
    await page.getByRole("checkbox", { name, exact: true }).uncheck();
  }
  await page.getByRole("checkbox", { name: /Plus the usual/ }).uncheck();
  await expect(makeList(page)).toContainText("Tick a bottle or two");
});

test("a demo result opens its recipe", async ({ page }) => {
  await page.goto("/");
  await awayList(page).getByRole("link", { name: "Boulevardier" }).click();
  await expect(page).toHaveURL("/recipes/boulevardier");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Boulevardier");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the demo is a form that renders results on the server", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("checkbox", { name: "Light Rum", exact: true }).check();
    await page.getByRole("button", { name: "Show me" }).click();
    await expect(page).toHaveURL(/b=light-rum/);
    await expect(makeList(page)).toContainText("Daiquiri");
  });
});

test("the unit control changes every amount on the cards", async ({ page }) => {
  await page.goto("/");
  const negroni = page.getByRole("article", { name: "Negroni" });
  await expect(negroni.getByRole("listitem").first()).toContainText("30 ml");
  // Derived by ADR 0004 for the visitor's country (the e2e cookie says US).
  await expect(negroni).toContainText("19.8% ABV · 1.4 standard drinks");
  await page
    .getByRole("group", { name: "Units for these recipes" })
    .getByText("oz", { exact: true })
    .click();
  await expect(negroni.getByRole("listitem").first()).toContainText("1 oz");
  await expect(
    page.getByRole("article", { name: "Daiquiri" }).getByRole("listitem").first(),
  ).toContainText("2 oz");
});

test("there is no zero-proof mode: no switch, no band, no tag", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("switch")).toHaveCount(0);
  await expect(page.getByText(/zero-proof/i)).toHaveCount(0);
  await expect(page.getByRole("article", { name: "John Collins" })).toContainText("% ABV");
});
