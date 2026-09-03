# Fazl Mosque Centenary — website

The website for one hundred years of the Fazl Mosque, 1926 – 2026.
Ahmadiyya Muslim Community UK, External Affairs Department.

**These HTML files are the source of truth.** Edit them directly. Nothing generates them
and nothing overwrites them.

| | |
|---|---|
| Review site | <https://amaarac.github.io/1926Centenary-preview/> — updates a minute after each push |
| Live site | <https://www.ahmadiyyauk.org/1926Centenary/> — not yet published |

## Editing

Edit `index.html`, `story.html`, `visit.html` and `assets/index.*.css`, then commit and
push. GitHub Pages rebuilds automatically.

To check a change before pushing, open the file directly in a browser — **every path is
relative**, so the pages work from a local disk, from any folder, and on any server. Keep
it that way: a path beginning with `/` ties the site to one location and is the fault that
made an earlier handover look broken. The packaging script fails if it finds one.

## Sending it to IT

```bash
node scripts/package-for-hosting.mjs
```

Writes `dist-hosting/` and `1926Centenary-hosting.zip`. It copies these pages, removes the
three review-only things (`robots.txt`, the `noindex` tag, this README) and adds
`UPLOAD-THIS.txt` for the hosting team. **It does not reformat, rewrite paths, or change
your markup**, so what is approved on the review site is what goes live.

## The registration form

The form on the visit page is embedded from **Cognito Forms** and loads scripts from
`cognitoforms.com`. Two consequences worth remembering: those domains must not be blocked
by the host, and the form collects names and contact details, so it falls under the
community's privacy and data protection arrangements. Both are stated in `UPLOAD-THIS.txt`.

## History

The site was originally built with Astro, in a private repository that is now archived at
`AmaarAC/Fazl-Mosque-Centenary`. It holds the original source and the copy files shared
with the printed brochures and the invitation. **It no longer builds this site**, and its
build and publish scripts were deleted — run today they would overwrite these files with an
older version of the site.
