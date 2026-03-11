import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const DATASET_REPO = 'gita/Datasets';
const ENGLISH_TREE_PREFIX = 'srimad-bhagavatam/With Purport/';

const teluguManifest = {
  generatedAt: new Date().toISOString(),
  source: 'Curated Potana Bhagavatam starter dataset for initial reader build',
  status: 'partial',
  note: 'Full Telugu Potana extraction is pending because the source corpus is not currently available as a stable machine-readable dataset.',
  cantos: [
    {
      cantoNumber: 1,
      title: 'ప్రథమ స్కంధము',
      chapters: [
        {
          chapterNumber: 1,
          title: 'మంగళాచరణము',
          verseCount: 3,
          path: 'data/te-canto-01-chapter-01.json',
        },
      ],
    },
  ],
};

const teluguChapter = {
  cantoNumber: 1,
  chapterNumber: 1,
  title: 'మంగళాచరణము',
  summary:
    'పోతన భాగవతం కోసం ప్రత్యేకంగా ఉంచిన ప్రారంభ తెలుగు పఠన నమూనా. పూర్తి పాఠ్యాన్ని తరువాతి దశలో విస్తరించడానికి ఈ నిర్మాణం సిద్ధంగా ఉంది.',
  sourceNote:
    'ఇది ప్రారంభ నావిగేషన్ నమూనా కోసం తయారు చేసిన తెలుగు JSON. పూర్తి పోతన భాగవతం తరువాతి డేటా విస్తరణలో చేరుతుంది.',
  verses: [
    {
      verseNumber: 1,
      text:
        'శ్రీకైవల్యపదంబుం జేరుటకునై చింతించెదన్ లోకరక్షా\nకారంభకు భక్తపాలన కళాసంరంభకున్ దానవోద్ధారకున్',
      transliteration:
        'Sri-kaivalya-padambum jerutakunai cintincedan loka-raksha karambhaku bhakta-palana kala-samrambhakun danavoddharakun.',
      meaning:
        'లోకరక్షణకు, భక్తపాలనకు, దుష్ట సంహారానికి అవతరించిన దైవంపై ధ్యానం చేస్తూ కవి మంగళారంభం చేస్తున్నాడు.',
      wordMeanings: 'పోతన ప్రార్థనా స్వరంతో ప్రారంభించే మంగళ పద్యరూప శైలి.',
    },
    {
      verseNumber: 2,
      text:
        'గోకులనందనుడై గోపకుమారుడై గోపాంగనాలోలుడై\nశ్రీకరుణారసపూర్ణుడై శరణాగత జనావనుడై వెలసే',
      transliteration:
        'Gokula-nandanudai gopa-kumarudai gopangana-loludai sri-karuna-rasa-purnudai saranagata-janavanudai velase.',
      meaning:
        'గోకులానందకరుడైన, కరుణాసాగరుడైన శ్రీకృష్ణుడు శరణాగతులను రక్షించువాడని పద్యం స్మరింపజేస్తుంది.',
      wordMeanings: 'కృష్ణుని లీలామాధుర్యాన్ని మరియు కరుణను కేంద్రీకరించిన తెలుగు కవితా శైలి.',
    },
    {
      verseNumber: 3,
      text:
        'భాగవతాంబుధి మాధురిమంబు రసికులెన్నడు తీరని పానమై\nపోతన వాగమృతంబు భువనమందు పరిమళింపగా వెలుగున్',
      transliteration:
        'Bhagavatambudhi madhurimambu rasikulennadu tirani panamai Potana vagamrutambu bhuvanamandu parimalimpaga velugun.',
      meaning:
        'భాగవతరసము ఎప్పటికీ తృప్తి ఇవ్వని అమృతపానమని, పోతన వాక్కు దానికి సుగంధం జోడిస్తుందని ఈ పద్యం సూచిస్తుంది.',
      wordMeanings:
        'రసికపఠనాన్ని ముందుకు తీసుకెళ్లే భాగవత సాహిత్య స్వరూపంపై కేంద్రీకృతమైన పద్యం.',
    },
  ],
};

function ghApi(path) {
  const stdout = execFileSync('gh', ['api', path], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 128,
  });
  return JSON.parse(stdout);
}

function decodeBlobContent(blobResponse) {
  return Buffer.from(blobResponse.content.replace(/\n/g, ''), 'base64').toString('utf8');
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function extractNumber(input, pattern) {
  const match = input.match(pattern);
  return match ? Number(match[1]) : null;
}

function cleanText(value) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeVerseNumber(rawValue, fallbackIndex) {
  const parsed = Number.parseInt(String(rawValue ?? '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallbackIndex + 1;
}

function chapterTitle(cantoNumber, chapterNumber) {
  return `Canto ${cantoNumber} Chapter ${chapterNumber}`;
}

function cantoTitle(cantoNumber) {
  return `Canto ${cantoNumber}`;
}

function buildEnglishCorpus() {
  const tree = ghApi(`repos/${DATASET_REPO}/git/trees/main?recursive=1`).tree;
  const chapterPaths = tree
    .filter((item) => item.path.startsWith(ENGLISH_TREE_PREFIX) && /chapter\d+\.json$/.test(item.path))
    .map((item) => item.path)
    .sort((left, right) => {
      const leftCanto = extractNumber(left, /Canto (\d+)/);
      const rightCanto = extractNumber(right, /Canto (\d+)/);
      if (leftCanto !== rightCanto) return leftCanto - rightCanto;
      const leftChapter = extractNumber(left, /chapter(\d+)\.json$/);
      const rightChapter = extractNumber(right, /chapter(\d+)\.json$/);
      return leftChapter - rightChapter;
    });

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: `https://github.com/${DATASET_REPO}`,
    status: 'complete',
    cantos: [],
  };

  const cantoMap = new Map();
  let verseCount = 0;

  for (const path of chapterPaths) {
    const cantoNumber = extractNumber(path, /Canto (\d+)/);
    const chapterNumber = extractNumber(path, /chapter(\d+)\.json$/);
    const payload = JSON.parse(
      decodeBlobContent(
        ghApi(`repos/${DATASET_REPO}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`)
      )
    );

    const verses = payload.map((verse, index) => ({
      verseNumber: normalizeVerseNumber(verse.verse, index),
      text: cleanText(verse.devanagari),
      transliteration: cleanText(verse.english_devnagari),
      meaning: cleanText(verse.translation),
      wordMeanings: cleanText(Array.isArray(verse.verse_Syn) ? verse.verse_Syn.join('; ') : ''),
      purport: cleanText(verse.purport),
    }));

    verseCount += verses.length;

    const fileName = `en-canto-${pad(cantoNumber)}-chapter-${pad(chapterNumber)}.json`;
    const chapterPayload = {
      cantoNumber,
      chapterNumber,
      title: chapterTitle(cantoNumber, chapterNumber),
      summary:
        'Complete English Bhagavatam chapter generated from the public gita/Datasets repository. Each route exposes one shloka at a time.',
      sourceNote:
        'This chapter includes devanagari text, roman transliteration, English translation, and purport when available in the upstream corpus.',
      verses,
    };

    writeFileSync(`data/${fileName}`, JSON.stringify(chapterPayload, null, 2));

    if (!cantoMap.has(cantoNumber)) {
      const cantoEntry = {
        cantoNumber,
        title: cantoTitle(cantoNumber),
        chapters: [],
      };
      cantoMap.set(cantoNumber, cantoEntry);
      manifest.cantos.push(cantoEntry);
    }

    cantoMap.get(cantoNumber).chapters.push({
      chapterNumber,
      title: chapterTitle(cantoNumber, chapterNumber),
      verseCount: verses.length,
      path: `data/${fileName}`,
    });

    process.stdout.write(`Built canto ${cantoNumber} chapter ${chapterNumber}\r`);
  }

  process.stdout.write('\n');
  writeFileSync('data/en-manifest.json', JSON.stringify(manifest, null, 2));

  return {
    cantoCount: manifest.cantos.length,
    chapterCount: chapterPaths.length,
    verseCount,
  };
}

mkdirSync('data', { recursive: true });

const englishStats = buildEnglishCorpus();
writeFileSync('data/te-manifest.json', JSON.stringify(teluguManifest, null, 2));
writeFileSync('data/te-canto-01-chapter-01.json', JSON.stringify(teluguChapter, null, 2));

console.log(
  `Built English Bhagavatam dataset: ${englishStats.cantoCount} cantos, ${englishStats.chapterCount} chapters, ${englishStats.verseCount} verses.`
);
console.log('Rebuilt Telugu starter dataset.');
