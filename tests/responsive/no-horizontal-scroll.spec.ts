import { expect, test } from '@playwright/test';
import { languages } from '../../src/schema';
import { CvPage } from '../pages/CvPage';

for (const lang of languages) {
  test(`has no horizontal scroll on a 375px phone (${lang})`, async ({ page }) => {
    await new CvPage(page).goto(lang);

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(clientWidth).toBe(375);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
}
