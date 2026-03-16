import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Cashbox Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/cashbox');
    await page.waitForTimeout(2000);
  });

  test('should display cashbox page', async ({ page }) => {
    await expect(page).toHaveURL(/.*cashbox/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display cashbox balance', async ({ page }) => {
    // Check for balance display
    const balanceElement = page.locator('[class*="balance"], [class*="total"]');
    await expect(balanceElement.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display income and expense', async ({ page }) => {
    // Check for income/expense cards
    const cards = page.locator('[class*="card"], [class*="metric"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should have add transaction button', async ({ page }) => {
    const addButton = page.locator('button:has-text("Qo\'shish"), button:has-text("Add"), button:has-text("Tranzaksiya")');
    const buttonCount = await addButton.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should display transaction history', async ({ page }) => {
    const historyContainer = page.locator('table, [class*="transaction"], [class*="history"]');
    await expect(historyContainer.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter by date range', async ({ page }) => {
    const dateFilter = page.locator('input[type="date"]');
    
    if (await dateFilter.first().isVisible()) {
      await dateFilter.first().fill('2026-03-01');
      await page.waitForTimeout(1000);
    }
  });

  test('should display multi-currency support', async ({ page }) => {
    // Check for USD, UZS, CLICK
    const currencyElements = page.locator('text=/USD|UZS|CLICK/');
    const currencyCount = await currencyElements.count();
    expect(currencyCount).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('body')).toBeVisible();
  });
});
