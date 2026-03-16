import { test as setup } from '@playwright/test';
import { login } from './helpers/auth';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await login(page);
  await page.waitForURL(/.*dashboard|\/$/);
  await page.context().storageState({ path: authFile });
});
