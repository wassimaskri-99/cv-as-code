import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { escapeHtml as esc, formatPeriod, inline, plain } from './format';
import { pdfFileName, templatesDir } from './paths';
import type { Cv, Job } from './schema';

const layout = readFileSync(resolve(templatesDir, 'layout.html'), 'utf8');

const tags = (items: string[]) =>
  `<ul class="tags">${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;

const section = (key: string, heading: string, body: string) =>
  `<section class="section" id="${key}" data-testid="section-${key}">
    <h2>${esc(heading)}</h2>
    ${body}
  </section>`;

function renderJob(job: Job, cv: Cv): string {
  return `<article class="entry" data-testid="job-${job.id}">
    <h3 data-testid="job-title">${esc(job.title)}</h3>
    <p class="entry-org">${esc(job.company)}</p>
    <p class="entry-meta">
      <span>${esc(formatPeriod(job.start, job.end, cv.lang, cv.labels.present))}</span>
      <span>${esc(job.location)}</span>
    </p>
    <ul class="bullets">${job.bullets.map((b) => `<li>${inline(b)}</li>`).join('')}</ul>
    ${tags(job.tags)}
  </article>`;
}

function renderHeader(cv: Cv): string {
  const { email, location, linkedin, github } = cv.contact;
  return `<header class="header" data-testid="header">
    <img class="photo" src="../assets/${esc(cv.photo)}" alt="${esc(cv.name)}" width="112" height="112" />
    <div>
      <h1 data-testid="name">${esc(cv.name)}</h1>
      <p class="title" data-testid="title">${esc(cv.title)}</p>
      <ul class="contact">
        <li><a data-testid="contact-email" href="mailto:${esc(email)}">${esc(email)}</a></li>
        <li data-testid="contact-location">${esc(location)}</li>
        <li><a data-testid="contact-linkedin" href="https://www.linkedin.com/in/${esc(linkedin)}/">linkedin.com/in/${esc(linkedin)}</a></li>
        <li><a data-testid="contact-github" href="https://github.com/${esc(github)}">github.com/${esc(github)}</a></li>
      </ul>
    </div>
  </header>`;
}

function renderSidebar(cv: Cv): string {
  const { labels } = cv;
  return [
    section('profile', labels.profile, cv.profile.map((p) => `<p>${inline(p)}</p>`).join('')),
    section(
      'skills',
      labels.skills,
      cv.skills
        .map(
          (group) =>
            `<div class="skill-group"><h3>${esc(group.name)}</h3>${tags(group.items)}</div>`,
        )
        .join(''),
    ),
    section(
      'education',
      labels.education,
      cv.education
        .map(
          (e) => `<article class="entry" data-testid="education-${e.id}">
            <h3>${esc(e.degree)}</h3>
            <p class="entry-org">${esc(e.school)}</p>
            <p class="entry-meta"><span>${esc(formatPeriod(e.start, e.end, cv.lang, labels.present))}</span></p>
          </article>`,
        )
        .join(''),
    ),
    section(
      'certifications',
      labels.certifications,
      `<ul class="bullets">${cv.certifications
        .map(
          (c) =>
            `<li><strong>${esc(c.name)}</strong> – ${esc(labels.obtainedIn)} ${String(c.year)}</li>`,
        )
        .join('')}</ul>`,
    ),
    section(
      'languages',
      labels.languages,
      `<ul class="bullets">${cv.languages
        .map((l) => `<li><strong>${esc(l.name)}:</strong> ${esc(l.level)}</li>`)
        .join('')}</ul>`,
    ),
    section(
      'strengths',
      labels.strengths,
      `<ul class="bullets">${cv.strengths.map((s) => `<li>${inline(s)}</li>`).join('')}</ul>`,
    ),
  ].join('');
}

export function renderCv(cv: Cv): string {
  const otherLang = cv.lang === 'fr' ? 'en' : 'fr';
  const content = `<nav class="toolbar" aria-label="${esc(cv.labels.otherLanguage)} / PDF">
      <a data-testid="language-switch" href="../${otherLang}/" hreflang="${otherLang}" lang="${otherLang}">${esc(cv.labels.otherLanguage)}</a>
      <a data-testid="download-pdf" href="${pdfFileName(cv.lang)}" download>${esc(cv.labels.downloadPdf)}</a>
    </nav>
    <main class="cv">
      ${renderHeader(cv)}
      <div class="columns">
        <div class="main-column">
          ${section('experience', cv.labels.experience, cv.experience.map((job) => renderJob(job, cv)).join(''))}
        </div>
        <div class="side-column">${renderSidebar(cv)}</div>
      </div>
    </main>`;

  const values: Record<string, string> = {
    lang: cv.lang,
    otherLang,
    pageTitle: esc(`${cv.name} – CV`),
    description: esc(plain(cv.title)),
    content,
  };
  return layout.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}
