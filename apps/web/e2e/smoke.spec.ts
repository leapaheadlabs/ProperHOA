import { test, expect } from "@playwright/test";

test("homepage loads and shows proper title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ProperHOA/);
});

test("navigation shows auth links when logged out", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Sign In")).toBeVisible();
  await expect(page.getByText("Get Started")).toBeVisible();
});

test("sign in page loads", async ({ page }) => {
  await page.goto("/auth/signin");
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});
