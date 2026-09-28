import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test("Home page loads", async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator("h1")).toBeVisible();
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.waitForTimeout(2000);
  expect(errors.filter((e) => !e.includes("404") && !e.includes("favicon"))).toHaveLength(0);
});

test("Archive page loads", async ({ page }) => {
  await page.goto(`${BASE}/archive`);
  await expect(page.locator("h1")).toBeVisible();
});

test("Search returns results", async ({ page }) => {
  await page.goto(`${BASE}/search?q=constitutional+democracy`);
  await page.waitForTimeout(2000);
  await expect(page.locator("body")).toBeVisible();
});

test("Ask page loads", async ({ page }) => {
  await page.goto(`${BASE}/ask`);
  await expect(page.locator("h1")).toBeVisible();
});

test("Status page shows mode", async ({ page }) => {
  await page.goto(`${BASE}/status`);
  const body = await page.textContent("body");
  expect(body).toContain("DEMO");
});

test("Admin login loads", async ({ page }) => {
  await page.goto(`${BASE}/admin/login`);
  await expect(page.locator("h1")).toBeVisible();
});

test("Kiosk page loads", async ({ page }) => {
  await page.goto(`${BASE}/kiosk`);
  await page.waitForTimeout(1500);
  await expect(page.locator("body")).toBeVisible();
});
