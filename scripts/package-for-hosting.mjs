/* ============================================================================
   PACKAGE THE SITE FOR THE WEB SERVER.

       node scripts/package-for-hosting.mjs

   → dist-hosting/                the folder IT uploads
   → 1926Centenary-hosting.zip    the same folder, zipped

   ⚠ THE HTML IN THIS REPOSITORY IS THE SOURCE OF TRUTH. Nothing is generated
   from anywhere else and nothing here is overwritten. This script COPIES the
   pages, removes the three things that exist only for the review site, and adds
   the note for IT. It never rewrites your markup, never reformats, and never
   touches the files in place.

   What it removes, and why each is review-only:
     robots.txt                 disallows everything, so the live site would be
                                invisible to search engines
     <meta name="robots">       the same instruction inside each page
     README.md, .nojekyll       repository and GitHub Pages furniture

   ⚠ IT DOES NOT CHANGE THE PATHS. Every path in these pages is relative
   (./assets/…, ./story.html), which is why the same files work on GitHub Pages
   at /1926Centenary-preview/ and on the live server at /1926Centenary/. That is
   a property worth keeping: it means what is approved on the review site is
   byte-for-byte what goes live, and it cannot be uploaded into the wrong folder.
   ============================================================================ */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const HOST = 'www.ahmadiyyauk.org';
const BASE = '/1926Centenary';
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'dist-hosting');
const ZIP = path.join(ROOT, '1926Centenary-hosting.zip');

/* Review-only furniture, dropped from the delivered folder. */
const DROP = new Set(['robots.txt', 'README.md', '.nojekyll', '.DS_Store', 'scripts', '.git', '.gitignore', '.claude', 'dist-hosting', 'gallery', path.basename(ZIP), path.basename(ZIP, '.zip')]);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const entry of fs.readdirSync(ROOT)) {
  if (DROP.has(entry)) continue;
  fs.cpSync(path.join(ROOT, entry), path.join(OUT, entry), { recursive: true });
}

/* Recursive: the story and visit pages live in their own folders so that the
   published URLs carry no .html extension. */
const pages = fs.readdirSync(OUT, { recursive: true }).filter((f) => f.endsWith('.html'));
if (!pages.length) {
  console.error('x no pages found — is this being run from the repository root?');
  process.exit(1);
}

/* Strip the noindex line. Matched loosely because the pages are hand-formatted
   and the tag may be written with or without a self-closing slash or line
   breaks around it; the check below proves the removal rather than assuming it. */
for (const page of pages) {
  const file = path.join(OUT, page);
  const html = fs.readFileSync(file, 'utf8');
  const stripped = html.replace(/[ \t]*<meta\s+name=["']robots["'][^>]*>\s*\n?/gi, '');
  fs.writeFileSync(file, stripped);
  if (/name=["']robots["']/i.test(stripped)) {
    console.error(`x ${page} still carries a robots tag`);
    process.exit(1);
  }
}

/* Every local file a page points at must exist in the delivered folder. A
   missing photograph is silent in HTML — the page simply renders a gap. */
const missing = [];
for (const page of pages) {
  const html = fs.readFileSync(path.join(OUT, page), 'utf8');
  /* Resolved against the page's own folder, because a page one level down
     reaches the shared assets as ../assets/… rather than ./assets/… */
  for (const m of html.matchAll(/(?:src|href)=["'](\.{1,2}\/[^"'#?]+)["']/g)) {
    const target = path.resolve(path.dirname(path.join(OUT, page)), m[1]);
    if (!target.startsWith(OUT + path.sep)) missing.push(`${page} → ${m[1]} (ESCAPES the delivered folder)`);
    else if (!fs.existsSync(target)) missing.push(`${page} → ${m[1]}`);
  }
  for (const m of html.matchAll(/(?:src|href)=["'](\/[^"'#?]+)["']/g)) {
    missing.push(`${page} → ${m[1]} (ABSOLUTE PATH: will break unless the site is at ${BASE}/)`);
  }
}
if (missing.length) {
  console.error('x broken references:\n  ' + [...new Set(missing)].join('\n  '));
  process.exit(1);
}

const NOTE = `FAZL MOSQUE CENTENARY WEBSITE
Ahmadiyya Muslim Community UK, External Affairs Department


1. INSTALLATION

Upload the contents of this folder to a directory named "${BASE.slice(1)}" at the
root of the domain, so that the following paths exist:

    ${HOST}${BASE}/index.html
    ${HOST}${BASE}/story/index.html
    ${HOST}${BASE}/visit/index.html
    ${HOST}${BASE}/assets/

The directory structure must be preserved exactly as delivered.

The site is then published at ${HOST}${BASE}/


2. DIRECTORY NAME AND LOCATION

All internal paths are relative, so the site does not depend on being installed
at any particular path. The directory name above is the intended address, but
the files will work correctly in any folder, and may also be opened directly
from a local disk for checking.


3. SERVER REQUIREMENTS

Content       Static files only. No PHP, database, or application runtime.
Protocol      HTTPS on ${HOST}
Caching       Files in assets/ are content-hashed and may be cached
              indefinitely. HTML files should be cached briefly or not at all.
Rewrites      None required. No custom MIME types.


4. THIRD-PARTY CONTENT

The registration form on the "visit" page is embedded from Cognito Forms and
loads scripts from cognitoforms.com and static.cognitoforms.com. These domains
must not be blocked. The form collects attendee names and contact details, and
is subject to the community's privacy and data protection arrangements.


5. CONTACT

External Affairs Department, Ahmadiyya Muslim Community UK.
`;
fs.writeFileSync(path.join(OUT, 'UPLOAD-THIS.txt'), NOTE);

fs.rmSync(ZIP, { force: true });
execSync(`zip -qr "${ZIP}" . -x ".DS_Store"`, { cwd: OUT });

const count = (dir) => fs.readdirSync(dir, { recursive: true }).filter((f) => !fs.statSync(path.join(dir, f)).isDirectory()).length;
console.log(`OK dist-hosting/   ${pages.length} pages, ${count(OUT)} files`);
console.log(`   ${path.basename(ZIP)}   ${(fs.statSync(ZIP).size / 1024 / 1024).toFixed(1)}MB`);
console.log(`   noindex and robots.txt removed; UPLOAD-THIS.txt added`);
