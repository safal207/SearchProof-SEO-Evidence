import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAllQueriesHistoryUrl, buildPopularQueriesUrl, normalizeAllQueriesHistory, normalizePopularQueries } from '../src/yandex.mjs';

test('buildAllQueriesHistoryUrl uses official v4 path and repeated indicators', () => {
  const url = new URL(buildAllQueriesHistoryUrl({
    userId: 42,
    hostId: 'https:example.com:443',
    dateFrom: '2026-08-01',
    dateTo: '2026-08-07'
  }));

  assert.match(url.pathname, /\/v4\/user\/42\/hosts\/https%3Aexample\.com%3A443\/search-queries\/all\/history$/);
  assert.deepEqual(url.searchParams.getAll('query_indicator'), [
    'TOTAL_SHOWS', 'TOTAL_CLICKS', 'AVG_SHOW_POSITION', 'AVG_CLICK_POSITION'
  ]);
  assert.equal(url.searchParams.get('device_type_indicator'), 'ALL');
});

test('buildPopularQueriesUrl clamps limit and requests supported metrics', () => {
  const url = new URL(buildPopularQueriesUrl({ userId: 1, hostId: 'http:example.com:80', limit: 900 }));
  assert.equal(url.searchParams.get('limit'), '500');
  assert.equal(url.searchParams.get('order_by'), 'TOTAL_SHOWS');
  assert.equal(url.searchParams.getAll('query_indicator').length, 4);
});

test('normalizeAllQueriesHistory sums volume and weights positions by same-day volume', () => {
  const observation = normalizeAllQueriesHistory({
    indicators: {
      TOTAL_SHOWS: [
        { date: '2026-08-01', value: 100 },
        { date: '2026-08-02', value: 300 }
      ],
      TOTAL_CLICKS: [
        { date: '2026-08-01', value: 10 },
        { date: '2026-08-02', value: 30 }
      ],
      AVG_SHOW_POSITION: [
        { date: '2026-08-01', value: 10 },
        { date: '2026-08-02', value: 20 }
      ],
      AVG_CLICK_POSITION: [
        { date: '2026-08-01', value: 8 },
        { date: '2026-08-02', value: 12 }
      ]
    }
  }, { hostId: 'https:example.com:443', capturedAt: '2026-08-03T00:00:00Z' });

  assert.equal(observation.metrics.TOTAL_SHOWS, 400);
  assert.equal(observation.metrics.TOTAL_CLICKS, 40);
  assert.equal(observation.metrics.AVG_SHOW_POSITION, 17.5);
  assert.equal(observation.metrics.AVG_CLICK_POSITION, 11);
  assert.equal(observation.note.includes('does not infer causal uplift'), true);
});

test('normalizePopularQueries keeps provider query evidence without invented metrics', () => {
  const result = normalizePopularQueries({
    date_from: '2026-08-01',
    date_to: '2026-08-07',
    count: 1,
    queries: [{
      query_id: 'q1',
      query_text: 'coffee gazipasa',
      indicators: { TOTAL_SHOWS: 50, TOTAL_CLICKS: 5, AVG_SHOW_POSITION: 3.2 }
    }]
  });

  assert.equal(result.queries[0].queryText, 'coffee gazipasa');
  assert.equal(result.queries[0].metrics.TOTAL_SHOWS, 50);
  assert.equal(result.queries[0].metrics.AVG_CLICK_POSITION, null);
});
