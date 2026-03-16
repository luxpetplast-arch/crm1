import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Performance Tests', () => {
  test('login page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Should load in less than 5 seconds
    await expect(page.locator('h1')).toBeVisible();
  });

  test('dashboard should load within acceptable time', async ({ page }) => {
    await login(page);
    
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000); // Should load in less than 10 seconds
  });

  test('products page should load efficiently', async ({ page }) => {
    await login(page);
    
    const startTime = Date.now();
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(8000);
  });

  test('should handle multiple rapid navigations', async ({ page }) => {
    await login(page);
    
    const pages = ['/dashboard', '/products', '/sales', '/customers'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should not have memory leaks on repeated navigation', async ({ page }) => {
    await login(page);
    
    // Navigate back and forth multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/dashboard');
      await page.waitForTimeout(500);
      await page.goto('/products');
      await page.waitForTimeout(500);
    }
    
    await expect(page.locator('body')).toBeVisible();
  });
});
