import { Page } from '@playwright/test';

export async function login(page: Page, email: string = 'admin@aziztrades.com', password: string = 'admin123') {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000); // Wait for auth to complete
}

export async function logout(page: Page) {
  // Click user menu or logout button
  const logoutButton = page.locator('button:has-text("Chiqish"), button:has-text("Logout")');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  }
}

export async function ensureLoggedIn(page: Page) {
  const currentUrl = page.url();
  if (currentUrl.includes('/login') || currentUrl === 'http://localhost:3000/') {
    await login(page);
  }
}
