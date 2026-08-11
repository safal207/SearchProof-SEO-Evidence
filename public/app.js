const translations = {
  en: {
    pageTitle: 'SearchProof — SEO Evidence',
    metaDescription: 'SearchProof turns SEO, Yandex readiness and AEO/GEO findings into evidence-backed optimization experiments.',
    heroTitle: 'SEO recommendations are cheap.<br><em>Evidence is the product.</em>',
    heroCopy: 'SearchProof converts a page audit or site crawl into a chain you can verify: URL → finding → evidence → change → metric → observed result.',
    auditFormLabel: 'Site crawl command preview', targetSite: 'Target site', copyCrawl: 'Copy site crawl command', copied: 'Copied', copyManually: 'Copy manually',
    urlHelp: 'v0.3.1 combines bounded same-origin crawl evidence with a search experiment lifecycle. Use <code>npm run audit -- URL</code> for a detailed single-page report.',
    demoReport: 'DEMO PAGE REPORT', evidenceDashboard: 'Evidence dashboard', fixtureNoClaims: 'Fixture data · no ranking claims', auditScores: 'Audit scores',
    prioritizedFindings: 'Prioritized findings', checksShown: (n) => `${n} checks shown`, hypothesisContract: 'Hypothesis contract', flowLabel: 'Optimization evidence flow',
    finding: 'Finding', evidence: 'Evidence', change: 'Change', metric: 'Metric', verification: 'Verification', baseline: 'Baseline', window: 'Window', result: 'Result',
    baselineHelp: 'What is observed before the change?', changeHelp: 'What exact implementation was made?', metricHelp: 'What should move if the hypothesis is useful?', windowHelp: 'When is it reasonable to re-check?', resultHelp: 'Observed value only — never invented uplift.',
    experimentTitle: 'From SEO change to measured observation.', deltaNotCausal: 'Observed delta ≠ causal attribution', yandexObservation: 'Yandex Webmaster observation',
    yandexObservationCopy: 'SearchProof can import TOTAL_SHOWS, TOTAL_CLICKS, AVG_SHOW_POSITION and AVG_CLICK_POSITION from the official Webmaster API and store them as provider evidence.',
    crawlTitle: 'From page checklist to search graph.', graphTitle: 'Internal-link graph', graphCopy: 'Bounded same-origin BFS records exact page-to-page edges instead of only counting links on one document.',
    duplicatesTitle: 'Duplicate clusters', duplicatesCopy: 'Titles, H1s and descriptions are grouped across crawled pages so intent overlap becomes reviewable evidence.',
    sitemapTitle: 'Sitemap vs crawl', sitemapCopy: 'Sitemap-only URLs are flagged as orphan-like candidates, while crawled pages missing from the sitemap are kept separate.',
    failuresTitle: 'Observed failures only', failuresCopy: 'A link is called broken only when SearchProof actually fetched the internal target and observed a failing status.',
    productRules: 'PRODUCT RULES', qaTitle: 'Built like a QA system for search.', observedTitle: 'Observed ≠ inferred', observedCopy: 'HTML evidence, crawler responses and measured search data stay separate from recommendations.',
    scoresTitle: 'Scores are heuristics', scoresCopy: 'SearchProof never presents its prioritization score as a score from Yandex, Google or an AI provider.', metricTitle: 'Every fix gets a metric', metricCopy: 'A recommendation without a verification path is incomplete.',
    aiTitle: 'AI Search without magic', aiCopy: 'AEO/GEO checks focus on entities and answer structures, not guaranteed citations.', footerLead: 'SearchProof v0.3.1 · Evidence-first technical SEO by',
    overall: 'Overall', technical: 'Technical SEO', content: 'Content', yandex: 'Yandex readiness', aeo_geo: 'AEO / GEO',
    pass: 'pass', warn: 'warn', error: 'error', info: 'info',
    next: 'Next', verifyWith: 'Verify with', manualReview: 'manual review',
    target: 'Target', changeEvidence: 'Change evidence', implementationLink: 'PR / implementation ↗', verificationWindow: 'Verification window', days: 'days', provider: 'Provider', observed: 'Observed', delta: 'Delta', pending: 'pending',
    fixture: 'fixture', noAttribution: 'no attribution claim', integritySuffix: 'Observed movement remains separate from causal attribution.',
    loadReportError: 'Could not load example report', loadExperimentError: 'Could not load experiment fixture',
    planned: 'planned', implemented: 'implemented', measuring: 'measuring', observedState: 'observed', closed: 'closed'
  },
  ru: {
    pageTitle: 'SearchProof — SEO-доказательства',
    metaDescription: 'SearchProof превращает SEO, Yandex и AEO/GEO-проверки в эксперименты с проверяемыми доказательствами.',
    heroTitle: 'SEO-рекомендации стоят дёшево.<br><em>Ценность — в доказательствах.</em>',
    heroCopy: 'SearchProof превращает аудит страницы или сайта в проверяемую цепочку: URL → проблема → доказательство → изменение → метрика → наблюдаемый результат.',
    auditFormLabel: 'Команда для обхода сайта', targetSite: 'Сайт для проверки', copyCrawl: 'Скопировать команду обхода', copied: 'Скопировано', copyManually: 'Скопируйте вручную',
    urlHelp: 'v0.3.1 объединяет ограниченный обход сайта в пределах одного origin и жизненный цикл SEO-эксперимента. Для подробного аудита одной страницы используйте <code>npm run audit -- URL</code>.',
    demoReport: 'ДЕМО-ОТЧЁТ СТРАНИЦЫ', evidenceDashboard: 'Панель доказательств', fixtureNoClaims: 'Тестовые данные · без заявлений о росте позиций', auditScores: 'Оценки аудита',
    prioritizedFindings: 'Приоритетные находки', checksShown: (n) => `Проверок показано: ${n}`, hypothesisContract: 'Контракт гипотезы', flowLabel: 'Цепочка доказательств оптимизации',
    finding: 'Проблема', evidence: 'Доказательство', change: 'Изменение', metric: 'Метрика', verification: 'Проверка', baseline: 'Baseline', window: 'Окно проверки', result: 'Результат',
    baselineHelp: 'Что наблюдалось до изменения?', changeHelp: 'Какое конкретно изменение было внедрено?', metricHelp: 'Какая метрика должна измениться, если гипотеза полезна?', windowHelp: 'Когда разумно провести повторную проверку?', resultHelp: 'Только наблюдаемое значение — никакого придуманного роста.',
    experimentTitle: 'От SEO-изменения к измеренному наблюдению.', deltaNotCausal: 'Наблюдаемое изменение ≠ доказанная причинность', yandexObservation: 'Наблюдение через Яндекс Вебмастер',
    yandexObservationCopy: 'SearchProof может импортировать TOTAL_SHOWS, TOTAL_CLICKS, AVG_SHOW_POSITION и AVG_CLICK_POSITION из официального Webmaster API и сохранять их как данные провайдера.',
    crawlTitle: 'От чек-листа страницы к поисковому графу.', graphTitle: 'Граф внутренних ссылок', graphCopy: 'Ограниченный BFS в пределах одного origin фиксирует точные связи между страницами, а не только количество ссылок.',
    duplicatesTitle: 'Кластеры дублей', duplicatesCopy: 'Title, H1 и description группируются по всему обходу, чтобы пересечение поисковых интентов становилось проверяемым фактом.',
    sitemapTitle: 'Sitemap и обход', sitemapCopy: 'URL только из Sitemap отмечаются как кандидаты на orphan-like страницы, а найденные обходом страницы вне Sitemap показываются отдельно.',
    failuresTitle: 'Только наблюдаемые ошибки', failuresCopy: 'Ссылка считается битой только после того, как SearchProof реально запросил внутренний URL и получил ошибочный статус.',
    productRules: 'ПРАВИЛА ПРОДУКТА', qaTitle: 'Построено как QA-система для поиска.', observedTitle: 'Наблюдаемое ≠ предполагаемое', observedCopy: 'HTML-доказательства, ответы crawler и измеренные поисковые данные отделены от рекомендаций.',
    scoresTitle: 'Оценки — это эвристики', scoresCopy: 'SearchProof никогда не выдаёт свой внутренний score за оценку Яндекса, Google или AI-провайдера.', metricTitle: 'У каждого исправления есть метрика', metricCopy: 'Рекомендация без способа последующей проверки считается незавершённой.',
    aiTitle: 'AI Search без магии', aiCopy: 'AEO/GEO-проверки оценивают сущности и структуру ответов, но не обещают цитирование AI-системами.', footerLead: 'SearchProof v0.3.1 · Evidence-first technical SEO · автор',
    overall: 'Итог', technical: 'Техническое SEO', content: 'Контент', yandex: 'Готовность к Яндексу', aeo_geo: 'AEO / GEO',
    pass: 'пройдено', warn: 'внимание', error: 'ошибка', info: 'инфо',
    next: 'Что делать', verifyWith: 'Проверить через', manualReview: 'ручную проверку',
    target: 'Целевая страница', changeEvidence: 'Доказательство изменения', implementationLink: 'PR / реализация ↗', verificationWindow: 'Окно проверки', days: 'дней', provider: 'Источник', observed: 'После', delta: 'Изменение', pending: 'ожидание',
    fixture: 'демо', noAttribution: 'без заявления о причинности', integritySuffix: 'Наблюдаемая динамика хранится отдельно от утверждений о причинности.',
    loadReportError: 'Не удалось загрузить демонстрационный отчёт', loadExperimentError: 'Не удалось загрузить демонстрационный эксперимент',
    planned: 'запланировано', implemented: 'внедрено', measuring: 'измерение', observedState: 'наблюдение', closed: 'закрыто'
  }
};

const findingCopyRu = {
  canonical: { message: 'Страница объявляет canonical URL', metric: 'canonical / состояние дублирующихся URL' },
  'internal-links': { message: 'На странице есть доступные для обхода внутренние ссылки', metric: 'обнаружение страниц / граф внутренних ссылок' },
  'structured-data': { message: 'Страница содержит структурированные данные JSON-LD', metric: 'покрытие машиночитаемыми сущностями' },
  'title-length': { message: 'Длина Title требует редакторской проверки', recommendation: 'Проверьте ясность и риск обрезания. Длина Title — редакторская эвристика, а не правило ранжирования.', metric: 'вид сниппета / наблюдение CTR' },
  'answer-structure': { message: 'Структуру ответов можно сделать явнее', recommendation: 'Добавьте действительно полезные видимые ответы на повторяющиеся вопросы и синхронизируйте разметку с видимым контентом.', metric: 'извлечение ответа / наблюдение AI-цитирования' }
};

const experimentCopyRu = {
  'demo-local-landing': {
    title: 'Локальный русскоязычный поисковый интент',
    hypothesis: 'Отдельная индексируемая русскоязычная landing page под конкретный интент может улучшить видимость по релевантным локальным запросам.',
    metaNote: 'Только демонстрационные данные. Эти значения не являются измеренными позициями, трафиком или доказанным ростом.'
  }
};

const severityOrder = { error: 0, warn: 1, info: 2, pass: 3 };
let currentLang = 'en';
let reportCache = null;
let experimentCache = null;

const t = (key) => translations[currentLang][key] ?? translations.en[key] ?? key;

function pickInitialLanguage() {
  const query = new URLSearchParams(location.search).get('lang');
  if (query === 'ru' || query === 'en') return query;
  const saved = localStorage.getItem('searchproof-language');
  if (saved === 'ru' || saved === 'en') return saved;
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function applyLanguage(lang, { persist = true } = {}) {
  currentLang = lang === 'ru' ? 'ru' : 'en';
  document.documentElement.lang = currentLang;
  document.title = t('pageTitle');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('metaDescription'));

  document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((node) => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel)); });
  document.querySelectorAll('.lang-button').forEach((button) => {
    const active = button.dataset.lang === currentLang;
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('is-active', active);
  });

  if (persist) localStorage.setItem('searchproof-language', currentLang);
  if (reportCache) { renderScores(reportCache.scores); renderFindings(reportCache.findings); }
  if (experimentCache) renderExperiment(experimentCache);
}

function scoreClass(value) {
  if (value >= 90) return 'score-good';
  if (value >= 70) return 'score-mid';
  return 'score-low';
}

function renderScores(scores) {
  const root = document.querySelector('#scores');
  const keys = ['overall', 'technical', 'content', 'yandex', 'aeo_geo'];
  root.innerHTML = keys.map((key) => `
    <article class="score-card ${scoreClass(scores[key])}">
      <span>${t(key)}</span><strong>${scores[key]}</strong><small>/100</small>
    </article>`).join('');
}

function localizeFinding(finding) {
  if (currentLang !== 'ru') return finding;
  const copy = findingCopyRu[finding.id] || {};
  let evidence = finding.evidence;
  if (finding.id === 'internal-links') evidence = evidence.replace(/internal/i, 'внутренних').replace(/external/i, 'внешних').replace(/links?/i, 'ссылок');
  if (finding.id === 'title-length') evidence = evidence.replace(/characters in this demonstration finding/i, 'символов в этой демонстрационной находке');
  return { ...finding, message: copy.message || finding.message, recommendation: copy.recommendation ?? finding.recommendation, metric: copy.metric || finding.metric, evidence };
}

function renderFindings(findings) {
  const sorted = [...findings].sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));
  document.querySelector('#finding-count').textContent = t('checksShown')(sorted.length);
  document.querySelector('#findings').innerHTML = sorted.map((source) => {
    const finding = localizeFinding(source);
    return `<article class="finding finding-${finding.severity}">
      <div class="finding-top"><span class="severity">${t(finding.severity)}</span><code>${finding.category}</code></div>
      <h4>${finding.message}</h4>
      <p class="evidence"><b>${t('evidence')}:</b> ${finding.evidence}</p>
      ${finding.recommendation ? `<p><b>${t('next')}:</b> ${finding.recommendation}</p>` : ''}
      <p class="metric"><b>${t('verifyWith')}:</b> ${finding.metric || t('manualReview')}</p>
    </article>`;
  }).join('');
}

function formatMetric(value) {
  return value == null ? 'n/a' : Number(value).toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 2 });
}

function renderExperiment(payload) {
  const root = document.querySelector('#experiment-board');
  const experiment = payload.experiment;
  const ruCopy = currentLang === 'ru' ? experimentCopyRu[experiment.id] : null;
  const latest = experiment.observations?.at(-1) || null;
  const rows = experiment.verification.metrics.map((metric) => {
    const baseline = experiment.baseline?.metrics?.[metric];
    const observed = latest?.metrics?.[metric];
    const delta = Number.isFinite(Number(baseline)) && Number.isFinite(Number(observed)) ? Number(observed) - Number(baseline) : null;
    return `<div class="metric-row">
      <span class="metric-name">${metric}</span>
      <span class="metric-value"><small>${t('baseline')}</small><b>${formatMetric(baseline)}</b></span>
      <b class="metric-arrow">→</b>
      <span class="metric-value"><small>${t('observed')}</small><b>${formatMetric(observed)}</b></span>
      <em><small>${t('delta')}</small>${delta == null ? t('pending') : `${delta > 0 ? '+' : ''}${formatMetric(delta)}`}</em>
    </div>`;
  }).join('');

  const fixtureLabel = currentLang === 'ru' && payload.meta.kind === 'fixture' ? t('fixture') : payload.meta.kind;
  const stateKey = experiment.state === 'observed' ? 'observedState' : experiment.state;
  const metaNote = ruCopy?.metaNote || payload.meta.note;
  root.innerHTML = `
    <article class="experiment-card">
      <div class="experiment-head"><div><span class="state">${t(stateKey)}</span><h3>${ruCopy?.title || experiment.title}</h3></div><span class="truth-badge">${fixtureLabel} · ${t('noAttribution')}</span></div>
      <p class="hypothesis">${ruCopy?.hypothesis || experiment.hypothesis}</p>
      <div class="experiment-grid">
        <div><small>${t('target')}</small><code title="${experiment.targetUrl}">${experiment.targetUrl}</code></div>
        <div><small>${t('changeEvidence')}</small><a href="${experiment.change.evidenceUrl}">${t('implementationLink')}</a></div>
        <div><small>${t('verificationWindow')}</small><strong>${experiment.verification.windowDays} ${t('days')}</strong></div>
        <div><small>${t('provider')}</small><strong>${experiment.baseline.source}</strong></div>
      </div>
      <div class="metric-table" role="table" aria-label="${t('verification')}">${rows}</div>
      <p class="integrity-note">${metaNote} ${t('integritySuffix')}</p>
    </article>`;
}

async function loadReport() {
  const response = await fetch('./example-report.json');
  if (!response.ok) throw new Error(`${t('loadReportError')}: HTTP ${response.status}`);
  reportCache = await response.json();
  renderScores(reportCache.scores);
  renderFindings(reportCache.findings);
}

async function loadExperiment() {
  const response = await fetch('./example-experiment.json');
  if (!response.ok) throw new Error(`${t('loadExperimentError')}: HTTP ${response.status}`);
  experimentCache = await response.json();
  renderExperiment(experimentCache);
}

const urlInput = document.querySelector('#url');
const command = document.querySelector('#command');
const button = document.querySelector('#command-button');

function updateCommand() {
  let value = urlInput.value.trim();
  try { value = new URL(value).href; } catch {}
  command.textContent = `npm run crawl -- ${value} --max-pages=50 --max-depth=3`;
}

urlInput.addEventListener('input', updateCommand);
button.addEventListener('click', async () => {
  updateCommand();
  try {
    await navigator.clipboard.writeText(command.textContent);
    button.textContent = t('copied');
    setTimeout(() => { button.textContent = t('copyCrawl'); }, 1200);
  } catch {
    button.textContent = t('copyManually');
  }
});

document.querySelectorAll('.lang-button').forEach((button) => {
  button.addEventListener('click', () => applyLanguage(button.dataset.lang));
});

applyLanguage(pickInitialLanguage(), { persist: false });
loadReport().catch((error) => { document.querySelector('#findings').innerHTML = `<p class="load-error">${error.message}</p>`; });
loadExperiment().catch((error) => { document.querySelector('#experiment-board').innerHTML = `<p class="load-error">${error.message}</p>`; });
