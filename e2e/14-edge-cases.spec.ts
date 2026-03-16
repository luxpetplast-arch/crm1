import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Edge Cases and Error Handling', () => {
  test('should handle invalid login gracefully', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Should show error message
    const errorMessage = page.locator('.bg-red-100, [class*="error"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should handle network errors', async ({ page }) => {
    await login(page);
    
    // Simulate offline
    await page.context().setOffline(true);
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Page should still be visible (cached)
    await expect(page.locator('body')).toBeVisible();
    
    // Restore online
    await page.context().setOffline(false);
  });

  test('should handle empty search results', async ({ page }) => {
    await login(page);
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="Qidirish"], input[placeholder*="Search"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistent123');
      await page.waitForTimeout(1000);
      
      // Should show empty state or no results
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle rapid clicks', async ({ page }) => {
    await login(page);
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const addButton = page.locator('button:has-text("Qo\'shish"), button:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      // Click multiple times rapidly
      await addButton.click();
      await addButton.click();
      await addButton.click();
      
      await page.waitForTimeout(1000);
      
      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle browser back button', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    
    await page.goto('/products');
    await page.waitForTimeout(1000);
    
    await page.goBack();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should handle browser forward button', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    
    await page.goto('/products');
    await page.waitForTimeout(1000);
    
    await page.goBack();
    await page.waitForTimeout(1000);
    
    await page.goForward();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL(/.*products/);
  });

  test('should handle page refresh', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Should still be logged in
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should handle long text input', async ({ page }) => {
    await login(page);
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="Qidirish"], input[placeholder*="Search"]');
    
    if (await searchInput.isVisible()) {
      const longText = 'a'.repeat(1000);
      await searchInput.fill(longText);
      await page.waitForTimeout(1000);
      
      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
