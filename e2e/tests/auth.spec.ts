import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { freshEmail, mailedLink } from "./mail.ts";

const header = (page: Page) => page.locator("header.site-header");
/** Ours, not Next's route announcer (also an alert). */
const formError = (page: Page) => page.locator('#form-error[role="alert"]');
const signedIn = async (page: Page) => {
  await expect(header(page).getByRole("button", { name: "Sign out" })).toBeVisible();
  await expect(header(page).getByRole("link", { name: "Sign in" })).toHaveCount(0);
};
const signedOut = (page: Page) =>
  expect(header(page).getByRole("link", { name: "Sign in" })).toBeVisible();

test("sign up, confirm, sign out, sign in, forget and reset the password", async ({ page }) => {
  const email = freshEmail("ana");
  await page.goto("/recipes/negroni");
  await header(page).getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/sign-in?back=%2Frecipes%2Fnegroni");
  await page.getByRole("link", { name: "Create an account" }).click();

  // A short password is refused before anything is sent; the email stays, the password goes.
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("negroni");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("#password-error")).toHaveText("Use 10 to 128 characters.");
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await expect(page.getByLabel("Password")).toHaveValue("");
  await expect(page.getByLabel("Password")).toBeFocused();

  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check your email");
  await expect(page.getByText(`We sent a link to ${email}.`)).toBeVisible();

  const confirmLink = await mailedLink(email, /Confirm/);
  await page.goto(confirmLink);
  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Confirm and sign in" }).click();
  await expect(page).toHaveURL("/");
  await signedIn(page);
  const cookie = (await page.context().cookies()).find((c) => c.name === "session")!;
  expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/" });
  await page.goto("/sign-in");
  await expect(page).toHaveURL("/");

  // The link is spent.
  await page.goto(confirmLink);
  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Confirm and sign in" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("That link didn't work");

  await page.goto("/recipes/negroni");
  await header(page).getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/recipes/negroni");
  await signedOut(page);

  // An address with an account sees exactly what a new one does.
  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("someone-else-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText(`We sent a link to ${email}.`)).toBeVisible();

  await page.goto("/sign-in?back=/recipes/negroni");
  await page.getByLabel("Email").fill(email.toUpperCase());
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(formError(page)).toHaveText("That email and password don't match.");
  await expect(page.getByLabel("Email")).toHaveValue(email.toUpperCase());
  await expect(page.getByLabel("Password")).toHaveValue("");
  await expect(page.getByLabel("Password")).toBeFocused();
  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/recipes/negroni");
  await signedIn(page);
  await header(page).getByRole("button", { name: "Sign out" }).click();
  await signedOut(page);

  await page.goto("/sign-in");
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send the link" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check your email");
  await expect(page.getByText(`If ${email} has an account`)).toBeVisible();

  await page.goto(await mailedLink(email, /Reset/));
  await page.getByLabel("New password").fill("manhattan-1874");
  await page.getByRole("button", { name: "Save and sign in" }).click();
  await expect(page).toHaveURL("/");
  await signedIn(page);
  await header(page).getByRole("button", { name: "Sign out" }).click();
  await expect(header(page).getByRole("link", { name: "Sign in" })).toBeVisible();

  // The old password stops working; the new one signs in.
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("negroni-1919");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(formError(page)).toHaveText("That email and password don't match.");
  await page.getByLabel("Password").fill("manhattan-1874");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");
  await signedIn(page);
});

test("a confirm or reset page without a usable link says so at once", async ({ page }) => {
  await page.goto("/confirm?token=nope");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("That link didn't work");
  await expect(page.getByRole("link", { name: "Sign up again" })).toHaveAttribute(
    "href",
    "/sign-up",
  );
  await page.goto("/reset");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("That link didn't work");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("sign up, confirm, sign out and a failed sign-in render on the server", async ({ page }) => {
    const email = freshEmail("bo");
    await page.goto("/sign-up");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("old-fashioned-1");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check your email");

    await page.goto(await mailedLink(email, /Confirm/));
    await page.getByLabel("Password").fill("old-fashioned-1");
    await page.getByRole("button", { name: "Confirm and sign in" }).click();
    await expect(page).toHaveURL("/");
    await signedIn(page);
    await header(page).getByRole("button", { name: "Sign out" }).click();
    await signedOut(page);

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(formError(page)).toHaveText("That email and password don't match.");
    await expect(page.getByLabel("Email")).toHaveValue(email);
    await expect(page.getByLabel("Password")).toHaveValue("");
    await expect(page.getByLabel("Password")).toBeFocused();
  });
});

const SCREENS = ["/sign-in", "/sign-up", "/forgot", `/confirm?token=${"a".repeat(43)}`, "/reset"];
for (const scheme of ["light", "dark"] as const) {
  for (const width of [1440, 360]) {
    test(`account screens pass axe, ${scheme} at ${width}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 900 });
      for (const path of SCREENS) {
        await page.goto(path);
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(violations.map((v) => `${path}: ${v.id}`)).toEqual([]);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
      }
      // A failed sign-in, with its alert and invalid field.
      await page.goto("/sign-in");
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page.locator("#email-error")).toBeVisible();
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(violations.map((v) => v.id)).toEqual([]);
    });
  }
}
