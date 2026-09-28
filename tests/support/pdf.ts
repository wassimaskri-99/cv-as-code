import { readFileSync } from 'node:fs';
import { extractText, getDocumentProxy } from 'unpdf';

/**
 * The PDF text layer, extracted with pdf.js (the same engine OpenResume's
 * parser uses). `raw` keeps the characters as-is; `text` collapses whitespace
 * so phrases that wrap across lines can still be found.
 */
export async function readPdf(file: string) {
  const pdf = await getDocumentProxy(new Uint8Array(readFileSync(file)));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  return { totalPages, raw: text, text: text.replace(/\s+/g, ' ') };
}
