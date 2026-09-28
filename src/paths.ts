import { resolve } from 'node:path';
import type { Lang } from './schema';

export const rootDir = resolve(import.meta.dirname, '..');
export const distDir = resolve(rootDir, 'dist');
export const templatesDir = resolve(rootDir, 'templates');

// "ats": one column, plain text, the file to upload to job portals.
// "design": two columns with photo and tags, for the web, email and LinkedIn.
export const variants = ['ats', 'design'] as const;
export type Variant = (typeof variants)[number];

export const pdfFileName = (lang: Lang, variant: Variant) =>
  `Wassim_Askri_CV_QA_${lang.toUpperCase()}${variant === 'design' ? '_Design' : ''}.pdf`;
export const pdfPath = (lang: Lang, variant: Variant) =>
  resolve(distDir, lang, pdfFileName(lang, variant));
export const htmlPath = (lang: Lang, variant: Variant) =>
  resolve(distDir, lang, ...(variant === 'ats' ? ['ats'] : []), 'index.html');
