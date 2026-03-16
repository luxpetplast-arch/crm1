import { test, expect, Page } from '@playwright/test';

test.describe('Login Page Tests', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }: { page: Page }) => {
    await expect(page.locator('h1')).toContainText('AzizTrades ERP');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }: { page: Page }) => {
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    await expect(page.locator('.bg-red-100')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }: { page: Page }) => {
    await page.fill('input[type="email"]', 'admin@aziztrades.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*dashboard|\/$/);
  });

  test('should not allow empty email', async ({ page }: { page: Page }) => {
    await page.fill('input[type="password"]', 'admin123');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should not allow empty password', async ({ page }: { page: Page }) => {
    await page.fill('input[type="email"]', 'admin@aziztrades.com');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const passwordInput = page.locator('input[type="password"]');
    const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });
});
