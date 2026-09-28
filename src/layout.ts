import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { templatesDir } from './paths';

const layout = readFileSync(resolve(templatesDir, 'layout.html'), 'utf8');

type LayoutValues = {
  lang: string;
  otherLang: string;
  alternateUrl: string;
  stylesheet: string;
  pageTitle: string;
  description: string;
  content: string;
};

/** Fills templates/layout.html. Values must already be HTML-escaped. */
export function fillLayout(values: LayoutValues): string {
  return layout.replace(
    /\{\{(\w+)\}\}/g,
    (match, key: string) => (values as Record<string, string>)[key] ?? match,
  );
}
