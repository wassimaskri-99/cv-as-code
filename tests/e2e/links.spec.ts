import { expect, test } from '@playwright/test';
import { loadCv } from '../../src/load';
import { languages } from '../../src/schema';
import { CvPage } from '../pages/CvPage';

const { contact } = loadCv('fr');

test('the email link opens a mail to the right address', async ({ page }) => {
  const cvPage = new CvPage(page);
  await cvPage.goto('fr');

  await expect(cvPage.email).toHaveAttribute('href', `mailto:${contact.email}`);
});

test('the LinkedIn link points to the profile', async ({ page }) => {
  const cvPage = new CvPage(page);
  await cvPage.goto('fr');

  // LinkedIn answers bots with HTTP 999, so a live request proves nothing.
  // Checking the exact URL is the reliable part.
  await expect(cvPage.linkedin).toHaveAttribute(
    'href',
    `https://www.linkedin.com/in/${contact.linkedin}/`,
  );
});

test('the GitHub profile exists', async ({ page, request }) => {
  const cvPage = new CvPage(page);
  await cvPage.goto('fr');
  const profileUrl = `https://github.com/${contact.github}`;

  await expect(cvPage.github).toHaveAttribute('href', profileUrl);
  const response = await request.get(profileUrl);
  expect(response.status()).toBe(200);
});

for (const lang of languages) {
  test(`every internal link and asset loads (${lang})`, async ({ page, request }) => {
    const cvPage = new CvPage(page);
    await cvPage.goto(lang);

    const urls = await page
      .locator('a[href], link[href], img[src]')
      .evaluateAll((elements) =>
        elements
          .map((el) => (el as HTMLAnchorElement).href || (el as HTMLImageElement).src)
          .filter((url) => url.startsWith(location.origin)),
      );

    expect(urls.length).toBeGreaterThan(0);
    for (const url of new Set(urls)) {
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
    }
  });

  test(`the PDF download link serves a PDF (${lang})`, async ({ page, request }) => {
    const cvPage = new CvPage(page);
    await cvPage.goto(lang);
    const href = await cvPage.downloadPdf.getAttribute('href');

    const response = await request.get(new URL(href ?? '', page.url()).href);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/pdf');
  });
}
