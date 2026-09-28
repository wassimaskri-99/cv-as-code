import { expect, test } from '@playwright/test';
import { loadCv } from '../../src/load';
import { plain } from '../../src/format';
import { languages } from '../../src/schema';
import { CvPage, sectionKeys } from '../pages/CvPage';

for (const lang of languages) {
  test.describe(`CV page (${lang})`, () => {
    const cv = loadCv(lang);
    let cvPage: CvPage;

    test.beforeEach(async ({ page }) => {
      cvPage = new CvPage(page);
      await cvPage.goto(lang);
    });

    test('shows the name and the title', async ({ page }) => {
      await expect(cvPage.name).toHaveText(cv.name);
      await expect(cvPage.title).toHaveText(cv.title);
      await expect(page).toHaveTitle(`${cv.name} – CV`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    });

    test('shows every section with its heading', async () => {
      for (const key of sectionKeys) {
        await expect(cvPage.section(key)).toBeVisible();
        await expect(cvPage.sectionHeading(key)).toHaveText(cv.labels[key]);
      }
    });

    test('shows every job with its title, company and bullets', async () => {
      for (const job of cv.experience) {
        const card = cvPage.job(job.id);

        await expect(card).toBeVisible();
        await expect(card.getByTestId('job-title')).toHaveText(job.title);
        await expect(card).toContainText(job.company);
        await expect(card.getByRole('listitem')).toContainText(job.bullets.map(plain));
      }
    });

    test('shows the certification', async () => {
      for (const certification of cv.certifications) {
        await expect(cvPage.section('certifications')).toContainText(certification.name);
      }
    });
  });
}
