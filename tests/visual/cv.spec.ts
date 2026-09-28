import { expect, test } from '@playwright/test';
import { languages } from '../../src/schema';
import { CvPage } from '../pages/CvPage';

const viewports = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844 },
};

for (const [device, viewport] of Object.entries(viewports)) {
  test.describe(device, () => {
    test.use({ viewport });

    for (const lang of languages) {
      test(`CV page looks the same (${lang})`, async ({ page }) => {
        await new CvPage(page).goto(lang);

        await expect(page).toHaveScreenshot(`cv-${lang}-${device}.png`, { fullPage: true });
      });
    }
  });
}
