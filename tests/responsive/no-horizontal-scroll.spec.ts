import { expect, test } from '@playwright/test';
import { variants } from '../../src/paths';
import { languages } from '../../src/schema';
import { CvPage } from '../pages/CvPage';

for (const lang of languages) {
  for (const variant of variants) {
    test(`has no horizontal scroll on a 375px phone (${lang}, ${variant})`, async ({ page }) => {
      await new CvPage(page).goto(lang, variant);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(clientWidth).toBe(375);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }
}
