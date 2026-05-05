import { test, expect } from '@playwright/test';

test.describe('Game Flow (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('E2E-001: game board renders on load', async ({ page }) => {
    // 7 tableau columns
    const columns = page.locator('[data-testid="tableau-column"]');
    await expect(columns).toHaveCount(7);

    // 4 foundations
    const foundations = page.locator('[data-testid="foundation-pile"]');
    await expect(foundations).toHaveCount(4);

    // Stock pile visible
    await expect(page.locator('[data-testid="stock-pile"]')).toBeVisible();

    // Waste pile visible
    await expect(page.locator('[data-testid="waste-pile"]')).toBeVisible();
  });

  test('E2E-002: clicking stock draws a card to waste', async ({ page }) => {
    const stock = page.locator('[data-testid="stock-pile"]');
    const waste = page.locator('[data-testid="waste-pile"]');

    // Before click: waste may be empty
    await stock.click();

    // After click: waste top card should be visible
    const wasteCard = waste.locator('[data-testid="card"]');
    await expect(wasteCard).toHaveCount({ minimum: 1 });
  });

  test('E2E-003: Ctrl+N starts a new game', async ({ page }) => {
    // Get initial score text
    const score = page.locator('[data-testid="score"]');
    await page.keyboard.press('Control+n');
    // After new game, score should reset to 0
    await expect(score).toHaveText('0');
  });

  test('E2E-004: Settings panel opens and closes', async ({ page }) => {
    const settingsBtn = page.locator('[aria-label="Settings"]');
    await settingsBtn.click();

    const panel = page.locator('[role="dialog"]').first();
    await expect(panel).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(panel).not.toBeVisible();
  });

  test('E2E-005: Header shows moves counter', async ({ page }) => {
    const moves = page.locator('[data-testid="moves"]');
    await expect(moves).toHaveText('0');
  });
});
