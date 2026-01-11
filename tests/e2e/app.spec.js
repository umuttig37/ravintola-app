const { test, expect } = require("@playwright/test");

test("Etusivu latautuu", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Kampuksen rohkein lounaspaikka." })).toBeVisible();
});

test("Ruokalista näyttää annoksia", async ({ page }) => {
  await page.goto("/menu.html");
  await expect(page.getByRole("heading", { name: "Ravintolan ruokalista" })).toBeVisible();
  await expect(page.locator(".menu-card").first()).toBeVisible();
});

test("Tuote lisätään ostoskoriin", async ({ page }) => {
  await page.goto("/menu.html");
  await page.locator("button[data-add]").first().click();
  await page.goto("/cart.html");
  await expect(page.locator(".cart-item").first()).toBeVisible();
});

test("Kirjautumissivu sisaltaa lomakkeet", async ({ page }) => {
  await page.goto("/login.html");
  await expect(page.getByRole("heading", { name: "Kirjaudu tai rekisteröidy" })).toBeVisible();
  await expect(page.locator("#login-form")).toBeVisible();
  await expect(page.locator("#register-form")).toBeVisible();
});

test("Hallintasivu vaatii kirjautumisen", async ({ page }) => {
  await page.goto("/admin.html");
  await expect(page.locator("#admin-locked")).toBeVisible();
});
