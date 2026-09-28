import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { distDir, htmlPath, pdfPath, variants } from '../../src/paths';
import { languages } from '../../src/schema';

const htmlFiles = () =>
  readdirSync(distDir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.html'))
    .map((file) => ({ file, html: readFileSync(join(distDir, file), 'utf8') }));

test('the build produced both versions, page and PDF, for every language', () => {
  for (const lang of languages) {
    for (const variant of variants) {
      expect(existsSync(htmlPath(lang, variant)), htmlPath(lang, variant)).toBe(true);
      expect(existsSync(pdfPath(lang, variant)), pdfPath(lang, variant)).toBe(true);
    }
  }
});

test('no TODO made it into the build', () => {
  const withTodo = htmlFiles().filter(({ html }) => /TODO/i.test(html));

  expect(withTodo.map(({ file }) => file)).toEqual([]);
});

test('no template placeholder or raw **bold** marker is left in the HTML', () => {
  const leftovers = htmlFiles().filter(({ html }) => /\{\{\w+\}\}|\*\*/.test(html));

  expect(leftovers.map(({ file }) => file)).toEqual([]);
});
