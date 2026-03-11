# Bhagavatam Source Inventory

This file tracks online source options for Sanskrit, English, and Telugu Bhagavatam content for the planned static website.

## Recommended primary stack

### 1. Sanskrit base text

Preferred candidate: Sanskrit Wikisource

- URL example: [श्रीमद्भागवतपुराणम्/स्कन्धः १/अध्यायः ३](https://sa.wikisource.org/wiki/%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%80%E0%A4%AE%E0%A4%A6%E0%A5%8D%E0%A4%AD%E0%A4%BE%E0%A4%97%E0%A4%B5%E0%A4%A4%E0%A4%AA%E0%A5%81%E0%A4%B0%E0%A4%BE%E0%A4%A3%E0%A4%AE%E0%A5%8D/%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%A8%E0%A5%8D%E0%A4%A7%E0%A4%83_%E0%A5%A7/%E0%A4%85%E0%A4%A7%E0%A5%8D%E0%A4%AF%E0%A4%BE%E0%A4%AF%E0%A4%83_%E0%A5%A9)
- Why it matters: direct Sanskrit text in chapter-level pages
- Practical value: straightforward for scraping/normalization into canto/chapter/verse JSON
- Reuse note: Wikisource content is generally under CC BY-SA; attribution and share-alike obligations must be preserved
- License reference: [CC BY-SA on Wikisource](https://en.wikisource.org/wiki/CC-BY-SA-4.0)

Fallback candidate: WisdomLib Sanskrit

- URL: [Bhagavata Purana [sanskrit]](https://www.wisdomlib.org/hinduism/book/bhagavata-purana-sanskrit)
- Why it matters: complete indexed Sanskrit corpus with chapter pages
- Practical value: easier discovery and indexing than some other Sanskrit sites
- Risk: site-level reuse terms are less explicit than Wikisource; safer as a reference or fallback parser source than as the licensing anchor

### 2. English translation

Preferred candidate: WisdomLib, G. V. Tagare translation

- URL: [Bhagavata Purana](https://www.wisdomlib.org/hinduism/book/the-bhagavata-purana)
- Source notes visible on page: G. V. Tagare, 1950, full indexed online text
- Why it matters: full-book online navigation with chapter-level English text
- Practical value: closest to a complete machine-normalizable English layer currently found
- Risk: confirm downstream redistribution comfort before bundling large excerpts directly

Reference-only candidate: Vedabase

- URL: [Śrīmad-Bhāgavatam](https://vedabase.io/en/library/sb/)
- Why it matters: high-quality canto/chapter structure and rich verse-level presentation
- Practical value: useful as a reference for navigation structure, canto names, and QA
- Reuse blocker: the site states the content is used with permission of the Bhaktivedanta Book Trust and is all rights reserved, so this should not be mirrored into the local dataset without explicit permission

### 3. Telugu layer

Preferred candidate: telugubhagavatam.org

- URL: [పోతన తెలుగు భాగవతము](https://telugubhagavatam.org/)
- Canto listing: [గ్రంథము](https://telugubhagavatam.org/?tebha=)
- Why it matters: it claims to provide 9000+ Telugu verses, meanings, and supporting material
- Practical value: strongest Telugu-native digital corpus found for Bhagavatam reading
- Reuse note from site text: the homepage says users may copy, use, and share verses for non-commercial use; that is useful, but still weaker than a standard machine-readable open license, so attribution and conservative use are advised
- Modeling note: this is Potana Telugu Bhagavatam, which is the classical Telugu rendering, not necessarily a strict one-to-one modern translation of every Sanskrit page layout

## Other useful references

### Vedabase canto index

- URL: [Śrīmad-Bhāgavatam canto index](https://vedabase.io/en/library/sb/)
- Useful for:
  - canonical 12-canto labels
  - chapter ordering
  - QA against merged data

### Vedabase canto 1 example

- URL: [Canto 1: Creation](https://vedabase.io/en/library/sb/1/)
- Useful for:
  - chapter names
  - UI inspiration for canto/chapter browsing

## Source comparison

### Sanskrit

- Best reuse posture: Wikisource
- Best discoverability: WisdomLib
- Best study/reference UX: Vedabase

### English

- Best complete online corpus found: WisdomLib
- Best verse-level reader UX: Vedabase
- Best bundling posture from the sources checked: still needs a deliberate legal decision before mirroring the full English corpus

### Telugu

- Best full-text reading resource found: telugubhagavatam.org
- Best match for Telugu literary expectation: Potana Bhagavatam
- Key caveat: section structure differs from the canonical 12-canto alignment used by Sanskrit/English sites

## Data modeling implications

The merged content schema should not assume all three languages share identical hierarchy.

Suggested normalized model:

```json
{
  "cantoNumber": 1,
  "sectionKey": "canto-01",
  "chapterNumber": 1,
  "chapterTitle": {
    "sa": "questions-by-the-sages",
    "en": "Questions by the Sages",
    "te": "ఉపోద్ఘాతము"
  },
  "verses": [
    {
      "verseNumber": 1,
      "sanskrit": "",
      "transliteration": "",
      "english": "",
      "telugu": "",
      "notes": {
        "teluguSourceType": "potana-adaptation"
      }
    }
  ]
}
```

## Recommendation

For the first build iteration:

1. Use Sanskrit Wikisource as the canonical text source.
2. Use WisdomLib English as the working translation layer.
3. Use telugubhagavatam.org for the Telugu experience, but expose it in the UI as `Potana Telugu Bhagavatam`.
4. Keep Vedabase out of the bundled local dataset unless explicit reuse permission is obtained.

## What I found and what is still unresolved

Found:

- a full Sanskrit online corpus with reusable structure
- a full English online corpus with clear indexing
- a strong Telugu corpus with non-commercial sharing language on the homepage

Still unresolved:

- whether you want strict canonical verse alignment across all three languages, or a product experience that pairs canonical Sanskrit/English with a Telugu literary rendering that is only approximately aligned in some places
- whether we should bundle the full texts locally, or fetch approved sources at runtime and store only normalized metadata locally
