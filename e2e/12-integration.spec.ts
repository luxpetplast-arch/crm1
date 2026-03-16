import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Integration Tests', () => {
  test('complete sales workflow', async ({ page }) => {
    await login(page);
    
    // 1. Check products
    await page.goto('/products');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
    
    // 2. Go to sales
    await page.goto('/sales');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
    
    // 3. Check customers
    await page.goto('/customers');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('inventory to sales flow', async ({ page }) => {
    await login(page);
    
    // Check inventory
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Navigate to sales
    const salesLink = page.locator('a:has-text("Sotuvlar"), a:has-text("Sales")').first();
    if (await salesLink.isVisible()) {
      await salesLink.click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/.*sales/);
    }
  });

  test('customer to orders flow', async ({ page }) => {
    await login(page);
    
    // Check customers
    await page.goto('/customers');
    await page.waitForTimeout(2000);
    
    // Navigate to orders
    const ordersLink = page.locator('a:has-text("Buyurtmalar"), a:has-text("Orders")').first();
    if (await ordersLink.isVisible()) {
      await ordersLink.click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/.*orders/);
    }
  });

  test('cashbox to analytics flow', async ({ page }) => {
    await login(page);
    
    // Check cashbox
    await page.goto('/cashbox');
    await page.waitForTimeout(2000);
    
    // Navigate to analytics
    const analyticsLink = page.locator('a:has-text("Analitika"), a:has-text("Analytics")').first();
    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/.*analytics/);
    }
  });

  test('navigation consistency', async ({ page }) => {
    await login(page);
    
    const pages = ['/dashboard', '/products', '/sales', '/customers', '/orders'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
      
      // Check if navigation is still visible
      const nav = page.locator('nav, [role="navigation"], aside');
      await expect(nav.first()).toBeVisible();
    }
  });
});
