import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { freshEmail, mailedLink } from "./mail.ts";

const PASSWORD = "negroni-1919";
const header = (page: Page) => page.locator("header.site-header");
const signUp = async (page: Page) => {
  const email = freshEmail("account");
  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.goto(await mailedLink(email, /Confirm/));
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Confirm and sign in" }).click();
  await expect(page).toHaveURL("/");
  return email;
};
const download = async (page: Page, name: string) => {
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name }).click(),
  ]);
  return { name: file.suggestedFilename(), text: await readFile((await file.path())!, "utf8") };
};
const erase = (page: Page) => page.getByRole("button", { name: "Delete my account" }).click();

test("download everything, then delete the account for good", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL("/sign-in?back=/account");
  const email = await signUp(page);
  await page.locator("#demo").getByRole("button", { name: "Start my bar" }).click();
  await expect(page.locator(".bar-status")).toContainText("to your bar");

  await header(page).getByRole("link", { name: "Account" }).click();
  await expect(page).toHaveURL("/account");
  await expect(page.getByText(`Signed in as ${email}.`)).toBeVisible();

  const json = await download(page, "Download as JSON");
  expect(json.name).toMatch(/^stirred-and-strained-\d{4}-\d{2}-\d{2}\.json$/);
  const data = JSON.parse(json.text);
  expect(data.account.email).toBe(email);
  expect(data.bar.map((b: { ingredient: { name: string } }) => b.ingredient.name)).toContain(
    "Campari",
  );
  const md = await download(page, "Download as Markdown");
  expect(md.name).toMatch(/\.md$/);
  expect(md.text).toContain("## Your bar");

  // Nothing is sent without the password and the tick; a wrong password deletes nothing.
  await erase(page);
  await expect(page.locator("#password-error")).toHaveText("Enter your password.");
  await expect(page.locator("#understand-error")).toHaveText(
    "Tick the box to confirm. Nothing was deleted.",
  );
  await expect(page.getByLabel("Your password")).toBeFocused();
  await page.getByLabel("Your password").fill("not-my-password");
  await page.getByRole("checkbox", { name: /I understand/ }).check();
  await erase(page);
  await expect(page.locator("#password-error")).toHaveText(
    "That's not your password. Nothing was deleted.",
  );
  await expect(page.getByRole("checkbox", { name: /I understand/ })).toBeChecked();

  await page.getByLabel("Your password").fill(PASSWORD);
  await erase(page);
  await expect(page).toHaveURL("/account/deleted");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your account is deleted");
  await expect(header(page).getByRole("link", { name: "Sign in" })).toBeVisible();
  expect((await page.context().cookies()).find((c) => c.name === "session")).toBeUndefined();

  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator('#form-error[role="alert"]')).toHaveText(
    "That email and password don't match.",
  );
});

test("the account pages pass axe in light and dark, at 1440 and 360", async ({ page }) => {
  const check = async (scheme: "light" | "dark", width: number) => {
    // Reduced motion: no colour transition still running when axe measures.
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      violations.map(
        (v) => `${v.id} (${scheme} ${width}): ${v.nodes.map((n) => n.target).join(", ")}`,
      ),
    ).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  };
  const each = async () => {
    for (const scheme of ["light", "dark"] as const) {
      for (const width of [1440, 360]) await check(scheme, width);
    }
  };
  await signUp(page);
  await page.goto("/account");
  await each();
  await erase(page);
  await expect(page.locator("#understand-error")).toBeVisible();
  await each();
  await page.getByLabel("Your password").fill(PASSWORD);
  await page.getByRole("checkbox", { name: /I understand/ }).check();
  await erase(page);
  await expect(page).toHaveURL("/account/deleted");
  await each();
});
