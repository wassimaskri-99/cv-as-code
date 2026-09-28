import { readFileSync, statSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { extractText, getDocumentProxy } from 'unpdf';
import { loadCv } from '../../src/load';
import { pdfPath } from '../../src/paths';
import { languages } from '../../src/schema';
import { CvPage } from '../pages/CvPage';

async function readPdf(file: string) {
  const pdf = await getDocumentProxy(new Uint8Array(readFileSync(file)));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  return { totalPages, text: text.replace(/\s+/g, ' ') };
}

for (const lang of languages) {
  test.describe(`PDF (${lang})`, () => {
    const cv = loadCv(lang);
    const file = pdfPath(lang);

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

    test('fits on the page without cutting content off', async ({ page }) => {
      // The print layout is a fixed A4 box. If content grew taller, it would
      // be hidden and the PDF would still have one page, so measure it.
      await page.emulateMedia({ media: 'print' });
      await new CvPage(page).goto(lang);

      const { contentHeight, pageHeight } = await page
        .locator('.cv')
        .evaluate((el) => ({ contentHeight: el.scrollHeight, pageHeight: el.clientHeight }));

      expect(contentHeight).toBeLessThanOrEqual(pageHeight);
    });
  });
}
