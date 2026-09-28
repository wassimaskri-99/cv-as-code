import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { htmlPath, pdfPath, variants } from './paths';
import { languages } from './schema';

const browser = await chromium.launch();
try {
  for (const lang of languages) {
    for (const variant of variants) {
      const page = await browser.newPage();
      await page.goto(pathToFileURL(htmlPath(lang, variant)).href);
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({
        path: pdfPath(lang, variant),
        printBackground: true,
        preferCSSPageSize: true,
      });
      await page.close();
      console.log(`built ${pdfPath(lang, variant)}`);
    }
  }
} finally {
  await browser.close();
}
