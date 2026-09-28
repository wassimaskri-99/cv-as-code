import { expect, test } from '@playwright/test';
import { loadCv, readRawCv } from '../../src/load';
import { cvSchema, languages } from '../../src/schema';

for (const lang of languages) {
  test(`data/cv.${lang}.yaml matches the schema`, () => {
    const result = cvSchema.safeParse(readRawCv(lang));

    expect(result.error?.issues ?? []).toEqual([]);
  });

  test(`data/cv.${lang}.yaml declares lang "${lang}"`, () => {
    expect(loadCv(lang).lang).toBe(lang);
  });
}

test.describe('French and English CVs have the same structure', () => {
  const fr = loadCv('fr');
  const en = loadCv('en');

  test('same jobs, in the same order', () => {
    expect(en.experience.map((job) => job.id)).toEqual(fr.experience.map((job) => job.id));
  });

  test('same number of bullets and tags for each job', () => {
    const shape = (cv: typeof fr) =>
      cv.experience.map((job) => ({
        id: job.id,
        bullets: job.bullets.length,
        tags: job.tags.length,
      }));

    expect(shape(en)).toEqual(shape(fr));
  });

  test('same skill groups with the same number of skills', () => {
    const shape = (cv: typeof fr) => cv.skills.map((group) => [group.id, group.items.length]);

    expect(shape(en)).toEqual(shape(fr));
  });

  test('same education, certifications, languages, strengths and profile length', () => {
    const shape = (cv: typeof fr) => ({
      education: cv.education.map((e) => e.id),
      certifications: cv.certifications.map((c) => c.id),
      languages: cv.languages.length,
      strengths: cv.strengths.length,
      profile: cv.profile.length,
    });

    expect(shape(en)).toEqual(shape(fr));
  });

  test('same facts that are not translated: name, contact, dates, years', () => {
    const facts = (cv: typeof fr) => ({
      name: cv.name,
      contact: cv.contact,
      jobDates: cv.experience.map((job) => [job.start, job.end]),
      educationDates: cv.education.map((e) => [e.start, e.end]),
      certificationYears: cv.certifications.map((c) => c.year),
    });

    expect(facts(en)).toEqual(facts(fr));
  });
});
