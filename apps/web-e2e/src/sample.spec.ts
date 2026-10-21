import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './support/axe';

test('renders a static page with no accessibility violations', async ({ page }) => {
  await page.setContent(
    '<html lang="en"><title>Sample</title><main><h1>Daybook</h1></main></html>',
  );

  await expect(page.getByRole('heading', { name: 'Daybook' })).toBeVisible();
  await expectNoAxeViolations(page);
});
