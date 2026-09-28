import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { loadCv } from './load';
import { distDir, htmlPath, templatesDir } from './paths';
import { renderCv } from './render';
import { languages } from './schema';

const require = createRequire(import.meta.url);
const fontsDir = resolve(dirname(require.resolve('@fontsource/lato/package.json')), 'files');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(resolve(distDir, 'assets', 'fonts'), { recursive: true });

copyFileSync(resolve(templatesDir, 'cv.css'), resolve(distDir, 'assets', 'cv.css'));
copyFileSync(resolve(templatesDir, 'assets', 'photo.jpg'), resolve(distDir, 'assets', 'photo.jpg'));
for (const weight of ['400', '700']) {
  copyFileSync(
    resolve(fontsDir, `lato-latin-${weight}-normal.woff2`),
    resolve(distDir, 'assets', 'fonts', `lato-${weight}.woff2`),
  );
}

for (const lang of languages) {
  const file = htmlPath(lang);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, renderCv(loadCv(lang)));
  console.log(`built ${file}`);
}

// The site root sends visitors to the French CV, with links to both.
writeFileSync(
  resolve(distDir, 'index.html'),
  `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=fr/" />
    <title>Wassim ASKRI – CV</title>
  </head>
  <body>
    <p><a href="fr/">CV en français</a> · <a href="en/" lang="en">CV in English</a></p>
  </body>
</html>
`,
);
