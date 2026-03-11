const LANGUAGE = document.body.dataset.language || 'en';
const SIDEBAR_STATE_KEY = `bhagavatam-sidebar-collapsed-${LANGUAGE}`;

async function initReader() {
  const ui = UI_COPY[LANGUAGE];
  const sidebarEl = document.getElementById('sidebar');
  const sidebarToggleEl = document.getElementById('sidebarToggle');
  const chapterTitleEl = document.getElementById('chapterTitle');
  const chapterSummaryEl = document.getElementById('chapterSummary');
  const chapterMetaEl = document.getElementById('chapterMeta');
  const verseNavEl = document.getElementById('verseNav');
  const chapterNavEl = document.getElementById('chapterNav');
  const verseLocationEl = document.getElementById('verseLocation');
  const transliterationEl = document.getElementById('transliteration');
  const verseTextEl = document.getElementById('verseText');
  const verseMeaningEl = document.getElementById('verseMeaning');
  const wordMeaningsEl = document.getElementById('wordMeanings');
  const jumpGridEl = document.getElementById('jumpGrid');
  const jumpLabelEl = document.getElementById('jumpLabel');
  const prevVerseBtn = document.getElementById('prevVerse');
  const nextVerseBtn = document.getElementById('nextVerse');
  const cantoSelectEl = document.getElementById('cantoSelect');
  const chapterSelectEl = document.getElementById('chapterSelect');
  const verseSelectEl = document.getElementById('verseSelect');

  if (!sidebarEl) return;

  const manifest = await fetch(`data/${LANGUAGE}-manifest.json`).then((response) => response.json());
  const chapterCache = new Map();
  let currentChapter;
  let sidebarCollapsed = window.innerWidth <= 1080;

  try {
    const stored = window.localStorage.getItem(SIDEBAR_STATE_KEY);
    if (stored !== null) sidebarCollapsed = stored === 'true';
  } catch (error) {
    // Ignore storage access problems.
  }

  function parseHash() {
    const cleaned = window.location.hash.replace(/^#\/?/, '');
    const [canto, chapter, verse] = cleaned.split('/');
    return {
      cantoNumber: Number(canto) || null,
      chapterNumber: Number(chapter) || null,
      verseNumber: Number(verse) || null,
    };
  }

  function setHash(cantoNumber, chapterNumber, verseNumber) {
    window.location.hash = `/${cantoNumber}/${chapterNumber}/${verseNumber}`;
  }

  function getChapterEntry(cantoNumber, chapterNumber) {
    return manifest.cantos
      .find((canto) => canto.cantoNumber === cantoNumber)
      ?.chapters.find((chapter) => chapter.chapterNumber === chapterNumber);
  }

  function allChapterEntries() {
    return manifest.cantos.flatMap((canto) =>
      canto.chapters.map((chapter) => ({
        cantoNumber: canto.cantoNumber,
        cantoTitle: canto.title,
        ...chapter,
      }))
    );
  }

  async function loadChapter(path) {
    if (chapterCache.has(path)) return chapterCache.get(path);
    const data = await fetch(path).then((response) => response.json());
    chapterCache.set(path, data);
    return data;
  }

  function syncSidebarState() {
    document.querySelector('.page-shell')?.classList.toggle('sidebar-collapsed', sidebarCollapsed);
    if (sidebarToggleEl) {
      sidebarToggleEl.textContent = sidebarCollapsed ? ui.sidebarShow : ui.sidebarHide;
    }
    try {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarCollapsed));
    } catch (error) {
      // Ignore storage access problems.
    }
  }

  function renderSidebar(activeChapter) {
    sidebarEl.innerHTML = `
      <div class="sidebar-header">
        <p class="eyebrow">${ui.sidebarEyebrow}</p>
        <h2 class="sidebar-title">${ui.sidebarTitle}</h2>
        <p class="sidebar-subtitle">${ui.sidebarSubtitle}</p>
      </div>
      <div class="chapter-list">
        ${allChapterEntries()
          .map(
            (entry) => `
              <button
                class="chapter-button ${entry.path === activeChapter.path ? 'active' : ''}"
                type="button"
                data-canto="${entry.cantoNumber}"
                data-chapter="${entry.chapterNumber}"
              >
                <strong>${ui.cantoLabel} ${entry.cantoNumber} • ${ui.chapterLabel} ${entry.chapterNumber}</strong>
                <span>${entry.title}</span>
              </button>
            `
          )
          .join('')}
      </div>
    `;

    sidebarEl.querySelectorAll('[data-canto]').forEach((button) => {
      button.addEventListener('click', async () => {
        const cantoNumber = Number(button.dataset.canto);
        const chapterNumber = Number(button.dataset.chapter);
        const entry = getChapterEntry(cantoNumber, chapterNumber);
        if (!entry) return;
        const chapter = await loadChapter(entry.path);
        setHash(cantoNumber, chapterNumber, chapter.verses[0].verseNumber);
      });
    });
  }

  function renderHeader(chapterData, verse) {
    chapterTitleEl.textContent = chapterData.title;
    chapterSummaryEl.textContent = chapterData.summary;
    chapterMetaEl.innerHTML = `
      <span>${ui.cantoLabel} ${chapterData.cantoNumber}</span>
      <span>${ui.chapterLabel} ${chapterData.chapterNumber}</span>
      <span>${chapterData.verses.length} ${ui.verseCountLabel}</span>
    `;
    verseLocationEl.textContent =
      `${ui.cantoLabel} ${chapterData.cantoNumber} • ${ui.chapterLabel} ${chapterData.chapterNumber} • ${ui.verseLabel} ${verse.verseNumber}`;
  }

  function renderVerse(chapterData, verse) {
    verseTextEl.textContent = verse.text;
    transliterationEl.textContent = verse.transliteration || '';
    verseMeaningEl.textContent = verse.meaning || '';
    wordMeaningsEl.textContent = verse.purport || verse.wordMeanings || chapterData.sourceNote || '';
    jumpLabelEl.textContent = `${chapterData.verses.length} ${ui.jumpCountSuffix}`;

    jumpGridEl.innerHTML = chapterData.verses
      .map(
        (item) => `
          <a
            class="jump-link ${item.verseNumber === verse.verseNumber ? 'active' : ''}"
            href="#/${chapterData.cantoNumber}/${chapterData.chapterNumber}/${item.verseNumber}"
          >
            ${item.verseNumber}
          </a>
        `
      )
      .join('');
  }

  function renderDropdowns(chapterData, verse) {
    cantoSelectEl.innerHTML = manifest.cantos
      .map(
        (canto) => `
          <option value="${canto.cantoNumber}" ${canto.cantoNumber === chapterData.cantoNumber ? 'selected' : ''}>
            ${ui.cantoLabel} ${canto.cantoNumber} - ${canto.title}
          </option>
        `
      )
      .join('');

    const selectedCanto =
      manifest.cantos.find((item) => item.cantoNumber === chapterData.cantoNumber) || manifest.cantos[0];

    chapterSelectEl.innerHTML = selectedCanto.chapters
      .map(
        (chapter) => `
          <option value="${chapter.chapterNumber}" ${chapter.chapterNumber === chapterData.chapterNumber ? 'selected' : ''}>
            ${ui.chapterLabel} ${chapter.chapterNumber} - ${chapter.title}
          </option>
        `
      )
      .join('');

    verseSelectEl.innerHTML = chapterData.verses
      .map(
        (item) => `
          <option value="${item.verseNumber}" ${item.verseNumber === verse.verseNumber ? 'selected' : ''}>
            ${ui.verseLabel} ${item.verseNumber}
          </option>
        `
      )
      .join('');
  }

  function renderNav(chapterData, verse) {
    const chapterEntries = allChapterEntries();
    const chapterIndex = chapterEntries.findIndex((entry) => entry.path === chapterData.path);
    const verseIndex = chapterData.verses.findIndex((item) => item.verseNumber === verse.verseNumber);
    const prevVerse = chapterData.verses[verseIndex - 1];
    const nextVerse = chapterData.verses[verseIndex + 1];
    const prevChapter = chapterEntries[chapterIndex - 1] || chapterEntries[chapterEntries.length - 1];
    const nextChapter = chapterEntries[chapterIndex + 1] || chapterEntries[0];
    const prevTarget = prevVerse
      ? [chapterData.cantoNumber, chapterData.chapterNumber, prevVerse.verseNumber]
      : [prevChapter.cantoNumber, prevChapter.chapterNumber, prevChapter.verseCount];
    const nextTarget = nextVerse
      ? [chapterData.cantoNumber, chapterData.chapterNumber, nextVerse.verseNumber]
      : [nextChapter.cantoNumber, nextChapter.chapterNumber, 1];

    verseNavEl.innerHTML = `
      <a class="rail-link" href="#/${prevTarget[0]}/${prevTarget[1]}/${prevTarget[2]}">${ui.prevVerse}</a>
      <span class="chapter-chip">${ui.verseLabel} ${verse.verseNumber} / ${chapterData.verses.length}</span>
      <a class="rail-link" href="#/${nextTarget[0]}/${nextTarget[1]}/${nextTarget[2]}">${ui.nextVerse}</a>
    `;

    chapterNavEl.innerHTML = `
      <a class="rail-link" href="#/${prevChapter.cantoNumber}/${prevChapter.chapterNumber}/1">${ui.prevChapter}</a>
      <a class="rail-link" href="#/${nextChapter.cantoNumber}/${nextChapter.chapterNumber}/1">${ui.nextChapter}</a>
    `;

    prevVerseBtn.onclick = () => setHash(...prevTarget);
    nextVerseBtn.onclick = () => setHash(...nextTarget);
  }

  async function renderRoute() {
    const route = parseHash();
    const fallbackCanto = manifest.cantos[0];
    const fallbackChapter = fallbackCanto.chapters[0];
    const entry =
      getChapterEntry(route.cantoNumber, route.chapterNumber) || fallbackChapter;
    const chapterData = await loadChapter(entry.path);
    chapterData.path = entry.path;

    const verse =
      chapterData.verses.find((item) => item.verseNumber === route.verseNumber) || chapterData.verses[0];

    if (
      route.cantoNumber !== chapterData.cantoNumber ||
      route.chapterNumber !== chapterData.chapterNumber ||
      route.verseNumber !== verse.verseNumber
    ) {
      setHash(chapterData.cantoNumber, chapterData.chapterNumber, verse.verseNumber);
      return;
    }

    currentChapter = chapterData;
    renderSidebar(entry);
    renderHeader(chapterData, verse);
    renderVerse(chapterData, verse);
    renderDropdowns(chapterData, verse);
    renderNav(chapterData, verse);
  }

  function navigateRelative(direction) {
    if (!currentChapter) return;
    const route = parseHash();
    const index = currentChapter.verses.findIndex((item) => item.verseNumber === route.verseNumber);
    const target = currentChapter.verses[index + direction];
    if (target) {
      setHash(currentChapter.cantoNumber, currentChapter.chapterNumber, target.verseNumber);
      return;
    }

    const chapterEntries = allChapterEntries();
    const chapterIndex = chapterEntries.findIndex((entry) => entry.path === currentChapter.path);
    const nextChapter =
      chapterEntries[chapterIndex + direction] ||
      (direction > 0 ? chapterEntries[0] : chapterEntries[chapterEntries.length - 1]);
    const nextVerse = direction > 0 ? 1 : nextChapter.verseCount;
    setHash(nextChapter.cantoNumber, nextChapter.chapterNumber, nextVerse);
  }

  sidebarToggleEl?.addEventListener('click', () => {
    sidebarCollapsed = !sidebarCollapsed;
    syncSidebarState();
  });

  cantoSelectEl?.addEventListener('change', async () => {
    const cantoNumber = Number(cantoSelectEl.value);
    const canto = manifest.cantos.find((item) => item.cantoNumber === cantoNumber);
    if (!canto) return;
    const chapter = canto.chapters[0];
    setHash(cantoNumber, chapter.chapterNumber, 1);
  });

  chapterSelectEl?.addEventListener('change', () => {
    const cantoNumber = Number(cantoSelectEl.value);
    const chapterNumber = Number(chapterSelectEl.value);
    setHash(cantoNumber, chapterNumber, 1);
  });

  verseSelectEl?.addEventListener('change', () => {
    const cantoNumber = Number(cantoSelectEl.value);
    const chapterNumber = Number(chapterSelectEl.value);
    const verseNumber = Number(verseSelectEl.value);
    setHash(cantoNumber, chapterNumber, verseNumber);
  });

  window.addEventListener('keydown', (event) => {
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement?.tagName)) return;
    if (event.key === 'ArrowLeft') navigateRelative(-1);
    if (event.key === 'ArrowRight') navigateRelative(1);
  });

  syncSidebarState();
  window.addEventListener('hashchange', renderRoute);
  await renderRoute();
}

const UI_COPY = {
  en: {
    sidebarEyebrow: 'Forest Reader',
    sidebarTitle: 'Bhagavatam',
    sidebarSubtitle: 'English canto and chapter navigation with one shloka on each route.',
    sidebarShow: 'Show Sections',
    sidebarHide: 'Hide Sections',
    cantoLabel: 'Canto',
    chapterLabel: 'Chapter',
    verseLabel: 'Verse',
    verseCountLabel: 'verses',
    prevVerse: 'Previous Verse',
    nextVerse: 'Next Verse',
    prevChapter: 'Previous Chapter',
    nextChapter: 'Next Chapter',
    jumpCountSuffix: 'verses in this chapter',
  },
  te: {
    sidebarEyebrow: 'ప్రకృతి పఠనం',
    sidebarTitle: 'పోతన భాగవతం',
    sidebarSubtitle: 'తెలుగు పద్య నావిగేషన్, ఒక్కో పద్యానికి ఒక్కో పుట మార్గం.',
    sidebarShow: 'భాగాలు చూపు',
    sidebarHide: 'భాగాలు దాచు',
    cantoLabel: 'స్కంధము',
    chapterLabel: 'అధ్యాయం',
    verseLabel: 'పద్యము',
    verseCountLabel: 'పద్యాలు',
    prevVerse: 'మునుపటి పద్యము',
    nextVerse: 'తర్వాతి పద్యము',
    prevChapter: 'మునుపటి అధ్యాయం',
    nextChapter: 'తర్వాతి అధ్యాయం',
    jumpCountSuffix: 'ఈ అధ్యాయంలో పద్యాలు',
  },
};

initReader();
