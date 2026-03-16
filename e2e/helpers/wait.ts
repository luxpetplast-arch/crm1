import { Page } from '@playwright/test';

export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

export async function waitForNavigation(page: Page, url: string, timeout = 10000) {
  await page.waitForURL(url, { timeout });
}

export async function waitForApiResponse(page: Page, urlPattern: string, timeout = 10000) {
  return await page.waitForResponse(
    (response: any) => response.url().includes(urlPattern) && response.status() === 200,
    { timeout }
  );
}

export async function waitForChartToRender(page: Page, timeout = 10000) {
  await page.waitForSelector('svg', { state: 'visible', timeout });
  await page.waitForTimeout(1000); // Additional wait for animation
}
