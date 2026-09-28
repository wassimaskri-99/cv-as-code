import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { languages } from '../../src/schema';
import { CvPage } from '../pages/CvPage';

for (const lang of languages) {
  test(`has no critical or serious accessibility violations (${lang})`, async ({ page }) => {
    await new CvPage(page).goto(lang);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    // Only the rule id and the element count, so a failure reads in one line per rule.
    const blocking = results.violations
      .filter((v) => v.impact === 'critical' || v.impact === 'serious')
      .map((v) => `${v.id} (${String(v.nodes.length)}): ${v.help}`);

    expect(blocking).toEqual([]);
  });
}
