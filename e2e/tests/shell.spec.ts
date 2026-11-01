import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const scheme of ["light", "dark"] as const) {
  test(`the shell has no accessibility violations in ${scheme} (desktop and 360 px)`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    for (const width of [1440, 360]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual(
        [],
      );
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
}

test("keyboard reaches the skip link first, then the header controls", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  const reached: string[] = [];
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press("Tab");
    reached.push(
      await page.evaluate(
        () =>
          document.activeElement?.getAttribute("aria-label") ??
          document.activeElement?.textContent?.trim() ??
          "",
      ),
    );
  }
  expect(reached).toEqual(expect.arrayContaining(["Dark theme", "Sign in", "Start my bar"]));
});

test("the theme follows the OS, switches at once and is remembered", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const paper = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await paper()).toBe("rgb(251, 245, 233)");
  await page.getByRole("button", { name: "Dark theme" }).click();
  expect(await paper()).toBe("rgb(27, 22, 18)");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Dark theme" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("preference forms work without JavaScript and only return to local pages", async ({
  request,
}) => {
  const save = (form: Record<string, string>) => request.post("/prefs", { form, maxRedirects: 0 });
  const dark = await save({ theme: "dark", back: "/?x=1" });
  expect(dark.status()).toBe(303);
  expect(dark.headers()["location"]).toBe("/?x=1");
  expect(dark.headers()["set-cookie"]).toContain("theme=dark");
  for (const back of [
    "//evil.example/",
    "/\t/evil.example",
    "/\n/evil.example",
    "/\\evil.example",
  ]) {
    const res = await save({ theme: "light", back });
    expect([res.status(), res.headers()["location"]]).toEqual([303, "/"]);
  }
});
