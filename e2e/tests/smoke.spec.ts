import { expect, test } from "@playwright/test";

const apiUrl = process.env.E2E_API_URL ?? "http://127.0.0.1:4300";

test("the stack is up: web serves the home page and the api is healthy", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const health = await request.get(`${apiUrl}/health`);
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: "ok", db: "up" });
});
