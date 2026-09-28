import { expect, test } from '@playwright/test';
import { loadCv } from '../../src/load';
import { CvPage } from '../pages/CvPage';

test('switches from French to English', async ({ page }) => {
  const cvPage = new CvPage(page);
  await cvPage.goto('fr');

  await cvPage.languageSwitch.click();

  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(cvPage.title).toHaveText(loadCv('en').title);
});

test('switches from English back to French', async ({ page }) => {
  const cvPage = new CvPage(page);
  await cvPage.goto('en');

  await cvPage.languageSwitch.click();

  await expect(page).toHaveURL(/\/fr\/$/);
  await expect(cvPage.title).toHaveText(loadCv('fr').title);
});

test('the site root opens the French CV', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/fr\/$/);
});
