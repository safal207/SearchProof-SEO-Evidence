import test from 'node:test';
import assert from 'node:assert/strict';
import { crawlSite, normalizeUrl, parseSitemap } from '../src/crawler.mjs';

const origin = 'https://example.test';

const pages = new Map([
  [`${origin}/sitemap.xml`, {
    status: 200,
    type: 'application/xml',
    body: `<?xml version="1.0"?><urlset>
      <url><loc>${origin}/</loc></url>
      <url><loc>${origin}/a</loc></url>
      <url><loc>${origin}/orphan</loc></url>
    </urlset>`
  }],
  [`${origin}/`, {
    status: 200,
    type: 'text/html',
    body: `<!doctype html><html><head>
      <title>Shared Search Intent</title>
      <meta name="description" content="Shared description for duplicate detection.">
      <link rel="canonical" href="${origin}/">
    </head><body>
      <h1>Shared H1</h1>
      <a href="/a">A</a>
      <a href="/broken#fragment">Broken</a>
      <a href="/no-title">No title</a>
      <a href="https://external.test/page">External</a>
    </body></html>`
  }],
  [`${origin}/a`, {
    status: 200,
    type: 'text/html; charset=utf-8',
    body: `<!doctype html><html><head>
      <title>Shared Search Intent</title>
      <meta name="description" content="Shared description for duplicate detection.">
      <link rel="canonical" href="/canonical-target">
    </head><body><h1>Shared H1</h1></body></html>`
  }],
  [`${origin}/broken`, {
    status: 404,
    type: 'text/html',
    body: '<!doctype html><html><head><title>Not Found</title></head><body><h1>Missing</h1></body></html>'
  }],
  [`${origin}/no-title`, {
    status: 200,
    type: 'text/html',
    body: `<!doctype html><html><head><link rel="canonical" href="${origin}/no-title"></head><body><p>Useful page but missing primary metadata.</p></body></html>`
  }]
]);

function mockFetch(url) {
  const normalized = normalizeUrl(String(url));
  const entry = pages.get(normalized) || { status: 404, type: 'text/plain', body: 'not found' };
  return Promise.resolve({
    status: entry.status,
    url: normalized,
    headers: { get: (name) => name.toLowerCase() === 'content-type' ? entry.type : null },
    text: async () => entry.body
  });
}

test('normalizes fragments and parses same-origin sitemap URLs', () => {
  assert.equal(normalizeUrl('/a#part', `${origin}/`), `${origin}/a`);
  assert.deepEqual(
    parseSitemap(`<urlset><url><loc>${origin}/a</loc></url><url><loc>https://other.test/x</loc></url></urlset>`, origin),
    [`${origin}/a`]
  );
});

test('builds a same-origin graph and emits deterministic site findings', async () => {
  const report = await crawlSite({
    startUrl: `${origin}/`,
    fetchImpl: mockFetch,
    maxPages: 10,
    maxDepth: 2,
    timeoutMs: 1000
  });

  assert.equal(report.product.version, '0.2.0');
  assert.equal(report.summary.pagesCrawled, 4);
  assert.equal(report.summary.htmlPages, 3);
  assert.equal(report.summary.internalEdges, 3);
  assert.equal(report.summary.sitemapUrls, 3);
  assert.equal(report.summary.brokenInternalLinks, 1);
  assert.equal(report.summary.duplicateTitleGroups, 1);
  assert.equal(report.summary.canonicalMismatches, 1);
  assert.equal(report.summary.orphanLikeUrls, 1);

  assert.deepEqual(report.sitemap.orphanLike, [`${origin}/orphan`]);
  assert.ok(report.sitemap.crawledMissingFromSitemap.includes(`${origin}/no-title`));
  assert.ok(report.sitemap.crawledMissingFromSitemap.includes(`${origin}/broken`) === false, '404 pages are not counted as crawlable HTML sitemap candidates');

  const ids = new Set(report.findings.map((finding) => finding.id));
  for (const expected of [
    'broken-internal-links',
    'missing-titles',
    'duplicate-titles',
    'missing-h1',
    'duplicate-h1',
    'duplicate-descriptions',
    'canonical-mismatches',
    'sitemap-orphan-like',
    'crawl-not-in-sitemap'
  ]) assert.ok(ids.has(expected), `expected finding ${expected}`);

  assert.deepEqual(report.brokenInternalLinks, [{ from: `${origin}/`, to: `${origin}/broken`, status: 404 }]);
  assert.equal(report.graph.edges.some((edge) => edge.to.startsWith('https://external.test')), false);
});
