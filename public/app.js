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
  root.innerHTML = Object.entries(scoreLabels)
    .map(([key, label]) => `
      <article class="score-card ${scoreClass(scores[key])}">
        <span>${label}</span>
        <strong>${scores[key]}</strong>
        <small>/100</small>
      </article>
    `)
    .join('');
}

function renderFindings(findings) {
  const sorted = [...findings].sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));
  document.querySelector('#finding-count').textContent = `${sorted.length} checks shown`;
  document.querySelector('#findings').innerHTML = sorted.map((finding) => `
    <article class="finding finding-${finding.severity}">
      <div class="finding-top">
        <span class="severity">${finding.severity}</span>
        <code>${finding.category}</code>
      </div>
      <h4>${finding.message}</h4>
      <p class="evidence"><b>Evidence:</b> ${finding.evidence}</p>
      ${finding.recommendation ? `<p><b>Next:</b> ${finding.recommendation}</p>` : ''}
      <p class="metric"><b>Verify with:</b> ${finding.metric || 'manual review'}</p>
    </article>
  `).join('');
}

async function loadReport() {
  const response = await fetch('./example-report.json');
  if (!response.ok) throw new Error(`Could not load example report: HTTP ${response.status}`);
  const report = await response.json();
  renderScores(report.scores);
  renderFindings(report.findings);
}

const urlInput = document.querySelector('#url');
const command = document.querySelector('#command');
const button = document.querySelector('#command-button');

function updateCommand() {
  let value = urlInput.value.trim();
  try { value = new URL(value).href; } catch {}
  command.textContent = `npm run audit -- ${value}`;
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
