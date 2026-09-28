import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { htmlPath, pdfPath } from './paths';
import { languages } from './schema';

const browser = await chromium.launch();
try {
  for (const lang of languages) {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath(lang)).href);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: pdfPath(lang), printBackground: true, preferCSSPageSize: true });
    await page.close();
    console.log(`built ${pdfPath(lang)}`);
  }
} finally {
  await browser.close();
}
