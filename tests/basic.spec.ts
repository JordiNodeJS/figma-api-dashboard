import { test, expect } from "@playwright/test";

test("Basic page load test", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page).toHaveTitle(/Create Next App/);
  await expect(
    page.getByRole("heading", { name: "Figma API Dashboard" })
  ).toBeVisible();
});
