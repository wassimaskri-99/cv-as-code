import { resolve } from 'node:path';
import type { Lang } from './schema';

export const rootDir = resolve(import.meta.dirname, '..');
export const distDir = resolve(rootDir, 'dist');
export const templatesDir = resolve(rootDir, 'templates');

export const pdfFileName = (lang: Lang) => `Wassim_Askri_CV_${lang.toUpperCase()}.pdf`;
export const pdfPath = (lang: Lang) => resolve(distDir, lang, pdfFileName(lang));
export const htmlPath = (lang: Lang) => resolve(distDir, lang, 'index.html');
