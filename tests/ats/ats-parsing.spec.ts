import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { formatPeriodNumeric, plain } from '../../src/format';
import { loadCv } from '../../src/load';
import { htmlPath, pdfPath } from '../../src/paths';
import { languages } from '../../src/schema';
import { readPdf } from '../support/pdf';

// These tests read the ATS PDF the way a parser does: as a flat stream of
// text. They catch what actually breaks parsing (missing text layer, garbled
// characters, columns read in the wrong order), not just how the page looks.

const firstWords = (value: string, count = 5) =>
  plain(value).split(/\s+/).slice(0, count).join(' ');

for (const lang of languages) {
  test.describe(`ATS PDF (${lang})`, () => {
    const cv = loadCv(lang);
    const file = pdfPath(lang, 'ats');

    test('has a real text layer, with digits', async () => {
      const { text } = await readPdf(file);

      expect(text.length).toBeGreaterThan(2000);
      expect(text).toMatch(/\d{4}/);
    });

    test('has no ligatures, replacement or private-use characters', async () => {
      const { raw } = await readPdf(file);
      // U+FB00–FB06 ligatures ("fi" as one glyph), U+FFFD, and the private-use area.
      const garbled = raw.match(/[ﬀ-ﬆ�-]/g) ?? [];

      expect(garbled).toEqual([]);
    });

    test('keeps accented characters intact', async () => {
      const { text } = await readPdf(file);

      for (const heading of Object.values({ e: cv.labels.experience, c: cv.labels.skills })) {
        expect(text).toContain(heading);
      }
      expect(text).toContain(cv.experience[0]?.company ?? '');
    });

    test('puts the contact details in the first 15% of the text', async () => {
      const { text } = await readPdf(file);
      const limit = text.length * 0.15;

      for (const value of [
        cv.contact.email,
        `linkedin.com/in/${cv.contact.linkedin}`,
        `github.com/${cv.contact.github}`,
      ]) {
        const index = text.indexOf(value);
        expect(index, value).toBeGreaterThanOrEqual(0);
        expect(index, value).toBeLessThan(limit);
      }
    });

    test('reads the sections in the expected order', async () => {
      const { text } = await readPdf(file);
      const order = [
        cv.labels.profile,
        cv.labels.skills,
        cv.labels.experience,
        cv.labels.education,
        cv.labels.certifications,
        cv.labels.languages,
        cv.labels.strengths,
      ];
      const offsets = order.map((heading) => text.indexOf(heading));

      expect(offsets.every((offset) => offset >= 0)).toBe(true);
      expect(offsets).toEqual(offsets.toSorted((a, b) => a - b));
    });

    test('keeps each job together: company, then its bullets, before the next job', async () => {
      const { text } = await readPdf(file);
      const starts = cv.experience.map((job) => text.indexOf(job.company));

      expect(starts.every((offset) => offset >= 0)).toBe(true);
      cv.experience.forEach((job, i) => {
        const end = starts[i + 1] ?? text.indexOf(cv.labels.education);
        for (const bullet of job.bullets) {
          const at = text.indexOf(firstWords(bullet), starts[i]);
          expect(at, `${job.id}: "${firstWords(bullet)}"`).toBeGreaterThan(starts[i] ?? -1);
          expect(at, `${job.id}: "${firstWords(bullet)}"`).toBeLessThan(end);
        }
      });
    });

    test('writes every period in one numeric format', async () => {
      const { text } = await readPdf(file);

      for (const { start, end } of [...cv.experience, ...cv.education]) {
        expect(text).toContain(formatPeriodNumeric(start, end, cv.labels.present));
      }
    });

    test('lists every skill as plain text', async () => {
      const { text } = await readPdf(file);

      for (const skill of cv.skills.flatMap((group) => group.items)) {
        expect(text).toContain(skill);
      }
    });

    test('the page it is printed from has no images, tables or icons', () => {
      const html = readFileSync(htmlPath(lang, 'ats'), 'utf8');

      expect(html).not.toMatch(/<(img|table|svg|i)[\s>]/);
    });
  });
}
