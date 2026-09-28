import type { Lang } from './schema';

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Escapes the text, then turns `**bold**` into <strong>. The only markup the data allows. */
export function inline(value: string): string {
  return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Same text without the `**` markers, for places where HTML is not allowed. */
export function plain(value: string): string {
  return value.replace(/\*\*(.+?)\*\*/g, '$1');
}

function formatMonth(value: string, lang: Lang): string {
  const [year, month] = value.split('-').map(Number);
  if (year === undefined || month === undefined) return value;
  const name = new Intl.DateTimeFormat(lang, { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${String(year)}`;
}

/** "04/2026 – Présent", "2019 – 2022". The numeric form parsers read most reliably. */
export function formatPeriodNumeric(start: string, end: string, present: string): string {
  const format = (value: string) =>
    value.length === 4 ? value : `${value.slice(5)}/${value.slice(0, 4)}`;
  return `${format(start)} – ${end === 'present' ? present : format(end)}`;
}

/** "Avril 2026 – Présent", "2019 – 2022". */
export function formatPeriod(start: string, end: string, lang: Lang, present: string): string {
  const format = (value: string) => (value.length === 4 ? value : formatMonth(value, lang));
  return `${format(start)} – ${end === 'present' ? present : format(end)}`;
}
