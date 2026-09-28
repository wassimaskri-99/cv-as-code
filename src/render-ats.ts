import { escapeHtml as esc, formatPeriodNumeric, inline, plain } from './format';
import { fillLayout } from './layout';
import type { Cv, Job } from './schema';

// The ATS version follows Jake's Resume / RenderCV "classic": one column in
// plain document order, no photo, no icons, no tables, skills as plain text.
// A parser reading the PDF text top to bottom gets the sections in this order.

const section = (key: string, heading: string, body: string) =>
  `<section data-testid="ats-section-${key}">
    <h2>${esc(heading)}</h2>
    ${body}
  </section>`;

const list = (items: string[]) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

function renderJob(job: Job, cv: Cv): string {
  return `<div class="entry">
    <div class="entry-head">
      <h3>${esc(job.title)}</h3>
      <span>${esc(formatPeriodNumeric(job.start, job.end, cv.labels.present))}</span>
    </div>
    <p class="entry-sub">${esc(job.company)} · ${esc(job.location)}</p>
    ${list(job.bullets.map(inline))}
    <p class="stack"><strong>${esc(cv.labels.techStack)}:</strong> ${esc(job.tags.join(', '))}</p>
  </div>`;
}

export function renderAtsCv(cv: Cv): string {
  const { labels, contact } = cv;
  const otherLang = cv.lang === 'fr' ? 'en' : 'fr';

  const content = `<main class="ats">
    <header>
      <h1>${esc(cv.name)}</h1>
      <p class="title">${esc(cv.title)}</p>
      <p class="contact">
        ${esc(contact.location)} · <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>
        · <a href="https://www.linkedin.com/in/${esc(contact.linkedin)}/">linkedin.com/in/${esc(contact.linkedin)}</a>
        · <a href="https://github.com/${esc(contact.github)}">github.com/${esc(contact.github)}</a>
      </p>
    </header>
    ${section('profile', labels.profile, `<p>${cv.profile.map(inline).join(' ')}</p>`)}
    ${section(
      'skills',
      labels.skills,
      cv.skills
        .map(
          (group) => `<p><strong>${esc(group.name)}:</strong> ${esc(group.items.join(', '))}</p>`,
        )
        .join(''),
    )}
    ${section('experience', labels.experience, cv.experience.map((job) => renderJob(job, cv)).join(''))}
    ${section(
      'education',
      labels.education,
      cv.education
        .map(
          (e) => `<div class="entry">
            <div class="entry-head">
              <h3>${esc(e.degree)}</h3>
              <span>${esc(formatPeriodNumeric(e.start, e.end, labels.present))}</span>
            </div>
            <p class="entry-sub">${esc(e.school)}</p>
          </div>`,
        )
        .join(''),
    )}
    ${section(
      'certifications',
      labels.certifications,
      list(
        cv.certifications.map(
          (c) => `<strong>${esc(c.name)}</strong> – ${esc(labels.obtainedIn)} ${String(c.year)}`,
        ),
      ),
    )}
    ${section(
      'languages',
      labels.languages,
      `<p>${cv.languages.map((l) => `<strong>${esc(l.name)}:</strong> ${esc(l.level)}`).join(' · ')}</p>`,
    )}
    ${section('strengths', labels.strengths, `<p>${cv.strengths.map(inline).join(' · ')}</p>`)}
  </main>`;

  return fillLayout({
    lang: cv.lang,
    otherLang,
    alternateUrl: `../../${otherLang}/ats/`,
    stylesheet: '../../assets/ats.css',
    pageTitle: esc(`${cv.name} – CV`),
    description: esc(plain(cv.title)),
    content,
  });
}
