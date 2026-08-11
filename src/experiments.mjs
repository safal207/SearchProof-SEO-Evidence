const clone = (value) => JSON.parse(JSON.stringify(value));

export const EXPERIMENT_STATES = ['planned', 'implemented', 'measuring', 'observed', 'closed'];

function assertNonEmpty(value, name) {
  if (!String(value || '').trim()) throw new Error(`${name} is required`);
}

function metricValue(metrics, key) {
  const value = metrics?.[key];
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

export function snapshotFromCrawl(report, { label = 'crawl-baseline' } = {}) {
  if (!report?.audit?.generatedAt || !report?.summary) throw new Error('A SearchProof crawl report is required');
  return {
    source: 'searchproof-crawl',
    label,
    capturedAt: report.audit.generatedAt,
    target: report.audit.startUrl,
    metrics: {
      pagesCrawled: report.summary.pagesCrawled,
      htmlPages: report.summary.htmlPages,
      internalEdges: report.summary.internalEdges,
      brokenInternalLinks: report.summary.brokenInternalLinks,
      duplicateTitleGroups: report.summary.duplicateTitleGroups,
      canonicalMismatches: report.summary.canonicalMismatches,
      orphanLikeUrls: report.summary.orphanLikeUrls
    },
    evidence: {
      productVersion: report.product?.version || '',
      findingIds: (report.findings || []).map((finding) => finding.id)
    }
  };
}

export function createExperiment({
  id,
  title,
  targetUrl,
  hypothesis,
  baseline,
  change = {},
  verification = {},
  createdAt = new Date().toISOString()
}) {
  assertNonEmpty(id, 'id');
  assertNonEmpty(title, 'title');
  assertNonEmpty(targetUrl, 'targetUrl');
  assertNonEmpty(hypothesis, 'hypothesis');

  return {
    schemaVersion: '1.0',
    id,
    title,
    targetUrl,
    hypothesis,
    state: change?.appliedAt ? 'implemented' : 'planned',
    createdAt,
    baseline: baseline || null,
    change: {
      description: change?.description || '',
      appliedAt: change?.appliedAt || null,
      evidenceUrl: change?.evidenceUrl || ''
    },
    verification: {
      metrics: Array.isArray(verification?.metrics) ? verification.metrics : [],
      windowDays: Number.isFinite(Number(verification?.windowDays)) ? Number(verification.windowDays) : null,
      notes: verification?.notes || ''
    },
    observations: [],
    integrity: {
      causalClaim: false,
      note: 'Observed metric movement is stored separately from causal attribution.'
    }
  };
}

export function setExperimentState(experiment, state) {
  if (!EXPERIMENT_STATES.includes(state)) throw new Error(`Unsupported experiment state: ${state}`);
  const next = clone(experiment);
  next.state = state;
  return next;
}

export function recordObservation(experiment, observation) {
  assertNonEmpty(observation?.source, 'observation.source');
  assertNonEmpty(observation?.capturedAt || observation?.period?.to, 'observation.capturedAt');
  if (!observation?.metrics || typeof observation.metrics !== 'object') throw new Error('observation.metrics is required');

  const next = clone(experiment);
  next.observations.push({
    source: observation.source,
    capturedAt: observation.capturedAt || observation.period.to,
    period: observation.period || null,
    scope: observation.scope || {},
    metrics: observation.metrics,
    evidence: observation.evidence || {},
    note: observation.note || ''
  });
  if (next.state === 'planned' || next.state === 'implemented') next.state = 'measuring';
  return next;
}

export function compareObservedMetric(experiment, metric, { source } = {}) {
  const baselineValue = metricValue(experiment?.baseline?.metrics, metric);
  const candidates = (experiment?.observations || [])
    .filter((item) => !source || item.source === source)
    .map((item) => ({ item, value: metricValue(item.metrics, metric) }))
    .filter((item) => item.value !== null)
    .sort((a, b) => String(a.item.capturedAt).localeCompare(String(b.item.capturedAt)));

  if (baselineValue === null || candidates.length === 0) {
    return {
      metric,
      baseline: baselineValue,
      latest: candidates.at(-1)?.value ?? null,
      delta: null,
      percentDelta: null,
      interpretation: 'insufficient-observed-data',
      causalClaim: false
    };
  }

  const latest = candidates.at(-1).value;
  const delta = latest - baselineValue;
  const percentDelta = baselineValue === 0 ? null : Number(((delta / baselineValue) * 100).toFixed(2));
  return {
    metric,
    baseline: baselineValue,
    latest,
    delta,
    percentDelta,
    interpretation: 'observed-delta-not-causal-attribution',
    causalClaim: false,
    latestCapturedAt: candidates.at(-1).item.capturedAt
  };
}
