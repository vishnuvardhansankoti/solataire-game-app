import { test, expect } from '@playwright/test';

test.describe('PWA Offline (E2E)', () => {
  test('E2E-007: app shell loads after SW caches it', async ({ page, context }) => {
    // First load — allow SW to install and cache
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simulate offline
    await context.setOffline(true);

    // Navigate again — should serve from cache
    await page.reload();
    await expect(page.locator('[data-testid="stock-pile"]')).toBeVisible();

    // Restore
    await context.setOffline(false);
  });
});
