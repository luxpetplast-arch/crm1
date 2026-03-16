const { test, expect } = require('@playwright/test');

test('simple test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
  console.log('✅ Simple test passed!');
});