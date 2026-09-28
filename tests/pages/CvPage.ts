import type { Locator, Page } from '@playwright/test';
import type { Lang } from '../../src/schema';

export const sectionKeys = [
  'experience',
  'profile',
  'skills',
  'education',
  'certifications',
  'languages',
  'strengths',
] as const;

export type SectionKey = (typeof sectionKeys)[number];

export class CvPage {
  readonly name: Locator;
  readonly title: Locator;
  readonly languageSwitch: Locator;
  readonly downloadPdf: Locator;
  readonly email: Locator;
  readonly linkedin: Locator;
  readonly github: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByTestId('name');
    this.title = page.getByTestId('title');
    this.languageSwitch = page.getByTestId('language-switch');
    this.downloadPdf = page.getByTestId('download-pdf');
    this.email = page.getByTestId('contact-email');
    this.linkedin = page.getByTestId('contact-linkedin');
    this.github = page.getByTestId('contact-github');
  }

  async goto(lang: Lang) {
    await this.page.goto(`/${lang}/`);
    await this.page.evaluate(() => document.fonts.ready);
  }

  section(key: SectionKey): Locator {
    return this.page.getByTestId(`section-${key}`);
  }

  sectionHeading(key: SectionKey): Locator {
    return this.section(key).getByRole('heading', { level: 2 });
  }

  job(id: string): Locator {
    return this.page.getByTestId(`job-${id}`);
  }
}
