import { statSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { loadCv } from '../../src/load';
import { pdfPath, variants } from '../../src/paths';
import { languages } from '../../src/schema';
import { CvPage } from '../pages/CvPage';
import { readPdf } from '../support/pdf';

for (const lang of languages) {
  for (const variant of variants) {
    test.describe(`PDF (${lang}, ${variant})`, () => {
      const cv = loadCv(lang);
      const file = pdfPath(lang, variant);

      test('is under 1 MB', () => {
        expect(statSync(file).size).toBeLessThan(1024 * 1024);
      });

      test('has exactly one page', async () => {
        const { totalPages } = await readPdf(file);

        expect(totalPages).toBe(1);
      });

      test('contains the name and every job title', async () => {
        const { text } = await readPdf(file);

        expect(text).toContain(cv.name);
        for (const job of cv.experience) {
          expect(text).toContain(job.title);
        }
      });
    });
  }

  test(`the designed PDF fits on its page without cutting content off (${lang})`, async ({
    page,
  }) => {
    // The designed print layout is a fixed A4 box. If content grew taller, it
    // would be hidden and the PDF would still have one page, so measure it.
    // (The ATS version flows normally: overflow would show up as a second page.)
    await page.emulateMedia({ media: 'print' });
    await new CvPage(page).goto(lang);

    const { contentHeight, pageHeight } = await page
      .locator('.cv')
      .evaluate((el) => ({ contentHeight: el.scrollHeight, pageHeight: el.clientHeight }));

    expect(contentHeight).toBeLessThanOrEqual(pageHeight);
  });
}
