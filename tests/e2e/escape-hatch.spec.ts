import { expect, test } from '@playwright/test';

test('shows the timed Bootstrap modal after enough time on page', async ({ page }) => {
  await page.goto('/demo/');

  await expect(page.locator('#timeModal')).toHaveClass(/show/, { timeout: 6500 });
  await expect(page.getByRole('heading', { name: 'Need help now?' })).toBeVisible();
});

test('dismisses a Bootstrap modal from its close button', async ({ page }) => {
  await page.goto('/demo/');

  await expect(page.locator('#timeModal')).toHaveClass(/show/, { timeout: 6500 });
  await page.locator('#timeModal .btn-close').click();

  await expect(page.locator('#timeModal')).not.toHaveClass(/show/);
});

test('shows the pricing Bootstrap modal after the pricing table has been seen and passed', async ({
  page
}) => {
  await page.goto('/demo/');

  await page.locator('#pricing').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

  await expect(page.locator('#pricingModal')).toHaveClass(/show/, { timeout: 2000 });
  await expect(page.getByRole('heading', { name: 'Want a better offer?' })).toBeVisible();
});

test('shows the custom plan Bootstrap modal after hovering the custom plan card', async ({
  page
}) => {
  await page.goto('/demo/');

  await page.locator('#custom-plan').hover();

  await expect(page.locator('#customPlanModal')).toHaveClass(/show/, { timeout: 2000 });
  await expect(page.getByRole('heading', { name: 'Need a custom plan?' })).toBeVisible();
});

test('shows the exit Bootstrap modal when exit intent is detected', async ({ page }) => {
  await page.goto('/demo/');

  await page.evaluate(() => {
    document.dispatchEvent(
      new MouseEvent('mouseleave', {
        clientY: 4,
        bubbles: true
      })
    );
  });

  await expect(page.locator('#exitModal')).toHaveClass(/show/);
  await expect(page.getByRole('heading', { name: 'Wait, we have an offer.' })).toBeVisible();
});
