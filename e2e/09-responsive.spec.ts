import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Responsive Design Tests', () => {
  const pages = [
    '/dashboard',
    '/products',
    '/sales',
    '/customers',
    '/orders',
    '/cashbox',
    '/analytics'
  ];

  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await login(page);
      });

      for (const pagePath of pages) {
        test(`should display ${pagePath} correctly`, async ({ page }) => {
          await page.goto(pagePath);
          await page.waitForTimeout(2000);
          
          // Check if page is visible
          await expect(page.locator('body')).toBeVisible();
          
          // Check if main content is visible
          const mainContent = page.locator('main, [role="main"], #root');
          await expect(mainContent.first()).toBeVisible();
        });
      }
    });
  }

  test('should handle orientation change', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    
    // Portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
    
    // Landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });
});
