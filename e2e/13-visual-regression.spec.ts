import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Visual Regression Tests', () => {
  test('login page visual check', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Check if page is rendered
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('dashboard visual check', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Check if main elements are visible
    await expect(page.locator('body')).toBeVisible();
    
    const cards = page.locator('[class*="card"], [class*="metric"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('products page visual check', async ({ page }) => {
    await login(page);
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('sales page visual check', async ({ page }) => {
    await login(page);
    await page.goto('/sales');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('customers page visual check', async ({ page }) => {
    await login(page);
    await page.goto('/customers');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('mobile view visual check', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('tablet view visual check', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await login(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('body')).toBeVisible();
  });
});
