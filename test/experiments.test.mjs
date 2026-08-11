import test from 'node:test';
import assert from 'node:assert/strict';
import { createExperiment, recordObservation, compareObservedMetric, snapshotFromCrawl, setExperimentState } from '../src/experiments.mjs';

test('snapshotFromCrawl preserves observed crawler metrics as evidence', () => {
  const snapshot = snapshotFromCrawl({
    product: { version: '0.2.0' },
    audit: { generatedAt: '2026-08-11T00:00:00.000Z', startUrl: 'https://example.com/' },
    summary: {
      pagesCrawled: 5,
      htmlPages: 4,
      internalEdges: 8,
      brokenInternalLinks: 1,
      duplicateTitleGroups: 2,
      canonicalMismatches: 1,
      orphanLikeUrls: 1
    },
    findings: [{ id: 'broken-internal-links' }, { id: 'duplicate-titles' }]
  });

  assert.equal(snapshot.source, 'searchproof-crawl');
  assert.equal(snapshot.metrics.pagesCrawled, 5);
  assert.equal(snapshot.metrics.brokenInternalLinks, 1);
  assert.deepEqual(snapshot.evidence.findingIds, ['broken-internal-links', 'duplicate-titles']);
});

test('experiment records observations but never turns a delta into a causal claim', () => {
  let experiment = createExperiment({
    id: 'exp-001',
    title: 'Improve category intent',
    targetUrl: 'https://example.com/category/',
    hypothesis: 'A clearer category page may improve search visibility.',
    baseline: {
      source: 'yandex-webmaster',
      capturedAt: '2026-08-01T00:00:00.000Z',
      metrics: { TOTAL_SHOWS: 100, TOTAL_CLICKS: 10 }
    },
    change: { description: 'Rewrite title and H1', appliedAt: '2026-08-05T00:00:00.000Z', evidenceUrl: 'https://github.com/example/repo/pull/1' },
    verification: { metrics: ['TOTAL_SHOWS', 'TOTAL_CLICKS'], windowDays: 14 }
  });

  assert.equal(experiment.state, 'implemented');
  experiment = recordObservation(experiment, {
    source: 'yandex-webmaster',
    capturedAt: '2026-08-20T00:00:00.000Z',
    metrics: { TOTAL_SHOWS: 125, TOTAL_CLICKS: 12 }
  });

  const comparison = compareObservedMetric(experiment, 'TOTAL_SHOWS', { source: 'yandex-webmaster' });
  assert.equal(experiment.state, 'measuring');
  assert.equal(comparison.delta, 25);
  assert.equal(comparison.percentDelta, 25);
  assert.equal(comparison.interpretation, 'observed-delta-not-causal-attribution');
  assert.equal(comparison.causalClaim, false);
  assert.equal(experiment.integrity.causalClaim, false);
});

test('experiment state rejects unsupported values', () => {
  const experiment = createExperiment({ id: 'x', title: 'x', targetUrl: 'https://example.com/', hypothesis: 'x' });
  assert.throws(() => setExperimentState(experiment, 'magic-uplift'), /Unsupported experiment state/);
});
