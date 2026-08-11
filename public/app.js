const scoreLabels = {
  overall: 'Overall',
  technical: 'Technical SEO',
  content: 'Content',
  yandex: 'Yandex readiness',
  aeo_geo: 'AEO / GEO'
};

const severityOrder = { error: 0, warn: 1, info: 2, pass: 3 };

function scoreClass(value) {
  if (value >= 90) return 'score-good';
  if (value >= 70) return 'score-mid';
  return 'score-low';
}

function renderScores(scores) {
  const root = document.querySelector('#scores');
  root.innerHTML = Object.entries(scoreLabels).map(([key, label]) => `
    <article class="score-card ${scoreClass(scores[key])}">
      <span>${label}</span><strong>${scores[key]}</strong><small>/100</small>
    </article>`).join('');
}

function renderFindings(findings) {
  const sorted = [...findings].sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));
  document.querySelector('#finding-count').textContent = `${sorted.length} checks shown`;
  document.querySelector('#findings').innerHTML = sorted.map((finding) => `
    <article class="finding finding-${finding.severity}">
      <div class="finding-top"><span class="severity">${finding.severity}</span><code>${finding.category}</code></div>
      <h4>${finding.message}</h4>
      <p class="evidence"><b>Evidence:</b> ${finding.evidence}</p>
      ${finding.recommendation ? `<p><b>Next:</b> ${finding.recommendation}</p>` : ''}
      <p class="metric"><b>Verify with:</b> ${finding.metric || 'manual review'}</p>
    </article>`).join('');
}

function formatMetric(value) {
  return value == null ? 'n/a' : Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function renderExperiment(payload) {
  const root = document.querySelector('#experiment-board');
  const experiment = payload.experiment;
  const latest = experiment.observations?.at(-1) || null;
  const rows = experiment.verification.metrics.map((metric) => {
    const baseline = experiment.baseline?.metrics?.[metric];
    const observed = latest?.metrics?.[metric];
    const delta = Number.isFinite(Number(baseline)) && Number.isFinite(Number(observed)) ? Number(observed) - Number(baseline) : null;
    return `<div class="metric-row"><span>${metric}</span><b>${formatMetric(baseline)}</b><b>→</b><b>${formatMetric(observed)}</b><em>${delta == null ? 'pending' : `${delta > 0 ? '+' : ''}${formatMetric(delta)}`}</em></div>`;
  }).join('');

  root.innerHTML = `
    <article class="experiment-card">
      <div class="experiment-head"><div><span class="state">${experiment.state}</span><h3>${experiment.title}</h3></div><span class="truth-badge">${payload.meta.kind} · no attribution claim</span></div>
      <p class="hypothesis">${experiment.hypothesis}</p>
      <div class="experiment-grid">
        <div><small>Target</small><code>${experiment.targetUrl}</code></div>
        <div><small>Change evidence</small><a href="${experiment.change.evidenceUrl}">PR / implementation ↗</a></div>
        <div><small>Verification window</small><strong>${experiment.verification.windowDays} days</strong></div>
        <div><small>Provider</small><strong>${experiment.baseline.source}</strong></div>
      </div>
      <div class="metric-table"><div class="metric-row metric-head"><span>Metric</span><b>Baseline</b><b></b><b>Observed</b><em>Delta</em></div>${rows}</div>
      <p class="integrity-note">${payload.meta.note} Observed movement remains separate from causal attribution.</p>
    </article>`;
}

async function loadReport() {
  const response = await fetch('./example-report.json');
  if (!response.ok) throw new Error(`Could not load example report: HTTP ${response.status}`);
  const report = await response.json();
  renderScores(report.scores);
  renderFindings(report.findings);
}

async function loadExperiment() {
  const response = await fetch('./example-experiment.json');
  if (!response.ok) throw new Error(`Could not load experiment fixture: HTTP ${response.status}`);
  renderExperiment(await response.json());
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
    const old = button.textContent;
    button.textContent = 'Copied';
    setTimeout(() => { button.textContent = old; }, 1200);
  } catch {
    button.textContent = 'Copy manually';
  }
});

loadReport().catch((error) => {
  document.querySelector('#findings').innerHTML = `<p class="load-error">${error.message}</p>`;
});
loadExperiment().catch((error) => {
  document.querySelector('#experiment-board').innerHTML = `<p class="load-error">${error.message}</p>`;
});
