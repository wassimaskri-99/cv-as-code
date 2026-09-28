import { expect, test } from '@playwright/test';
import { loadCv, readRawCv } from '../../src/load';
import { languages } from '../../src/schema';
import { collectStrings } from '../support/walk';

const currentMonth = new Date().toISOString().slice(0, 7);
// "2022" compares as the start of that year, "present" as this month.
const comparable = (value: string) =>
  value === 'present' ? currentMonth : value.length === 4 ? `${value}-01` : value;

for (const lang of languages) {
  test.describe(`cv.${lang}.yaml content`, () => {
    const cv = loadCv(lang);
    const strings = collectStrings(readRawCv(lang));

    test('has no empty text', () => {
      const empty = strings.filter((s) => s.value.trim() === '').map((s) => s.path);

      expect(empty).toEqual([]);
    });

    test('has no TODO left', () => {
      const todos = strings.filter((s) => /TODO/i.test(s.value)).map((s) => s.path);

      expect(todos).toEqual([]);
    });

    test('has balanced **bold** markers', () => {
      const broken = strings.filter((s) => (s.value.match(/\*\*/g) ?? []).length % 2 !== 0);

      expect(broken.map((s) => s.path)).toEqual([]);
    });

    test('has valid job months', () => {
      const months = cv.experience
        .flatMap((job) => [job.start, job.end])
        .filter((value) => value !== 'present')
        .map((value) => Number(value.slice(5)));

      expect(months.every((month) => month >= 1 && month <= 12)).toBe(true);
    });

    test('has every period starting before it ends, and not in the future', () => {
      const periods = [...cv.experience, ...cv.education];

      for (const { start, end } of periods) {
        expect(comparable(start) <= comparable(end), `${start} → ${end}`).toBe(true);
        expect(comparable(start) <= currentMonth, `${start} is in the future`).toBe(true);
      }
    });

    test('lists jobs and education from newest to oldest', () => {
      const starts = (items: { start: string }[]) => items.map((item) => comparable(item.start));

      expect(starts(cv.experience)).toEqual(starts(cv.experience).toSorted().reverse());
      expect(starts(cv.education)).toEqual(starts(cv.education).toSorted().reverse());
    });

    test('has only one current job', () => {
      expect(cv.experience.filter((job) => job.end === 'present')).toHaveLength(1);
    });

    test('has a valid email', () => {
      expect(cv.contact.email).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i);
    });

    test('does not publish a phone number', () => {
      // The repo and site are public. Recruiters reach out by email or LinkedIn.
      expect(cv.contact.phone).toBeUndefined();
    });

    test('has LinkedIn and GitHub handles, not full URLs', () => {
      expect(cv.contact.linkedin).not.toContain('/');
      expect(cv.contact.github).not.toContain('/');
    });
  });
}
