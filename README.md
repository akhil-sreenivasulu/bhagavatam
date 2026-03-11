# Bhagavatam

Static Bhagavatam reader scaffold with:

- one shloka per page navigation
- full English Bhagavatam dataset
- Telugu Potana Bhagavatam starter track
- canto/chapter/verse JSON manifests
- river-and-lotus visual design
- GitHub Pages deployment workflow

## Files

- [index.html](/Users/akhilsreenivasulu/Coding/march/bhagavatam/index.html): landing page
- [english.html](/Users/akhilsreenivasulu/Coding/march/bhagavatam/english.html): English Bhagavatam reader
- [telugu.html](/Users/akhilsreenivasulu/Coding/march/bhagavatam/telugu.html): Telugu Potana reader
- [app.js](/Users/akhilsreenivasulu/Coding/march/bhagavatam/app.js): shared navigation logic
- [styles.css](/Users/akhilsreenivasulu/Coding/march/bhagavatam/styles.css): river-and-lotus theme
- [data/](/Users/akhilsreenivasulu/Coding/march/bhagavatam/data): generated manifests and chapter JSON
- [scripts/build-data.mjs](/Users/akhilsreenivasulu/Coding/march/bhagavatam/scripts/build-data.mjs): English corpus generator plus Telugu starter builder

## Data model

Each route is addressed as:

```text
#/canto/chapter/verse
```

Each manifest groups chapters under cantos and each chapter file contains a `verses` array.

## Rebuild the JSON

```bash
node scripts/build-data.mjs
```

## Run locally

Serve the folder with any static server. Example:

```bash
python3 -m http.server 4173
```

## Deploy

This repo includes a GitHub Pages workflow at [.github/workflows/deploy-pages.yml](/Users/akhilsreenivasulu/Coding/march/bhagavatam/.github/workflows/deploy-pages.yml).

After the repository is pushed to `main` and GitHub Pages is configured to use GitHub Actions, the site will publish automatically.

## Notes

- The English reader uses a generated full-corpus dataset sourced from `gita/Datasets`.
- Telugu and English data are intentionally split into separate manifests because Potana Bhagavatam will not always align one-to-one with English source chapters.
- The Telugu Potana data in this repo is still partial while the English dataset is complete.
- Source research and licensing notes are documented in [SOURCES.md](/Users/akhilsreenivasulu/Coding/march/bhagavatam/SOURCES.md).
