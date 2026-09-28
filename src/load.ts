import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { cvSchema, type Cv, type Lang } from './schema';

export const dataPath = (lang: Lang) =>
  resolve(import.meta.dirname, '..', 'data', `cv.${lang}.yaml`);

export function readRawCv(lang: Lang): unknown {
  return parse(readFileSync(dataPath(lang), 'utf8'));
}

export function loadCv(lang: Lang): Cv {
  const result = cvSchema.safeParse(readRawCv(lang));
  if (!result.success) {
    throw new Error(`data/cv.${lang}.yaml is invalid:\n${result.error.message}`);
  }
  return result.data;
}
