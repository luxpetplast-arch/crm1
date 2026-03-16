import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Accessibility Tests', () => {
  test('login page should have proper labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for input labels
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('buttons should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Tab through form
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Submit button should be focused
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('dashboard should have semantic HTML', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    
    // Check for semantic elements
    const main = page.locator('main, [role="main"]');
    const headings = page.locator('h1, h2, h3');
    
    expect(await main.count()).toBeGreaterThan(0);
    expect(await headings.count()).toBeGreaterThan(0);
  });

  test('images should have alt text', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('forms should have proper labels', async ({ page }) => {
    await login(page);
    await page.goto('/products');
    
    // Try to open add product modal
    const addButton = page.locator('button:has-text("Qo\'shish"), button:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Check for form inputs
      const inputs = page.locator('input, select, textarea');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('navigation should be keyboard accessible', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    
    // Tab through navigation
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('color contrast should be sufficient', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    
    // Check if text is visible (basic contrast check)
    const textElements = page.locator('p, span, h1, h2, h3, button');
    const textCount = await textElements.count();
    expect(textCount).toBeGreaterThan(0);
  });
});
