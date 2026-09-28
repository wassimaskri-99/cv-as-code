import { z } from 'zod';

// "2026-04" for jobs, "2022" for education. Real date checks (valid month,
// start before end) live in the content tests, where failures read better.
const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, 'expected YYYY-MM');
const year = z.string().regex(/^\d{4}$/, 'expected YYYY');
const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-z0-9-]+$/, 'expected a kebab-case id');

export const languages = ['fr', 'en'] as const;
export type Lang = (typeof languages)[number];

export const cvSchema = z.strictObject({
  lang: z.enum(languages),
  name: text,
  title: text,
  photo: text,
  contact: z.strictObject({
    email: z.email(),
    // Optional on purpose: the public CV never shows a phone number.
    phone: z
      .string()
      .regex(/^\+\d[\d ]{7,}$/, 'expected an international number like +216 12345678')
      .optional(),
    location: text,
    linkedin: z.string().regex(/^[a-z0-9-]+$/, 'expected the LinkedIn handle only'),
    github: z.string().regex(/^[A-Za-z0-9-]+$/, 'expected the GitHub username only'),
  }),
  labels: z.strictObject({
    experience: text,
    profile: text,
    skills: text,
    education: text,
    certifications: text,
    languages: text,
    strengths: text,
    present: text,
    obtainedIn: text,
    downloadPdf: text,
    otherLanguage: text,
  }),
  experience: z
    .array(
      z.strictObject({
        id,
        title: text,
        company: text,
        start: yearMonth,
        end: z.union([yearMonth, z.literal('present')]),
        location: text,
        bullets: z.array(text).min(1),
        tags: z.array(text),
      }),
    )
    .min(1),
  profile: z.array(text).min(1),
  skills: z.array(z.strictObject({ id, name: text, items: z.array(text).min(1) })).min(1),
  education: z.array(z.strictObject({ id, degree: text, school: text, start: year, end: year })),
  certifications: z.array(z.strictObject({ id, name: text, year: z.number().int() })),
  languages: z.array(z.strictObject({ name: text, level: text })),
  strengths: z.array(text),
});

export type Cv = z.infer<typeof cvSchema>;
export type Job = Cv['experience'][number];
