import test from 'node:test';
import assert from 'node:assert/strict';
import { crawlSite, normalizeUrl } from '../src/crawler.mjs';

const origin = 'https://partial.test';
const pages = new Map([
  [`${origin}/sitemap.xml`, {
    status: 200,
    type: 'application/xml',
    body: `<?xml version="1.0"?><urlset>
      <url><loc>${origin}/</loc></url>
      <url><loc>${origin}/a</loc></url>
      <url><loc>${origin}/orphan-b</loc></url>
      <url><loc>${origin}/orphan-c</loc></url>
    </urlset>`
  }],
  [`${origin}/`, {
    status: 200,
    type: 'text/html',
    body: `<!doctype html><html><head>
      <title>Home</title><meta name="description" content="Home">
      <link rel="canonical" href="${origin}/">
    </head><body><h1>Home</h1><a href="/a">A</a></body></html>`
  }],
  [`${origin}/a`, { status: 200, type: 'text/html', body: '<html><head><title>A</title></head><body><h1>A</h1></body></html>' }],
  [`${origin}/orphan-b`, { status: 200, type: 'text/html', body: '<html><head><title>B</title></head><body><h1>B</h1></body></html>' }],
  [`${origin}/orphan-c`, { status: 200, type: 'text/html', body: '<html><head><title>C</title></head><body><h1>C</h1></body></html>' }]
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

test('does not classify undiscovered sitemap URLs as orphan-like when crawl hits maxPages', async () => {
  const report = await crawlSite({ startUrl: `${origin}/`, fetchImpl: mockFetch, maxPages: 1, maxDepth: 3, timeoutMs: 1000 });

  assert.equal(report.summary.crawlTruncated, true);
  assert.equal(report.summary.orphanLikeUrls, 0);
  assert.equal(report.summary.sitemapUrlsUndiscoveredWithinCrawl, 2);
  assert.equal(report.findings.some((finding) => finding.id === 'sitemap-orphan-like'), false);
  assert.equal(report.findings.some((finding) => finding.id === 'sitemap-coverage-partial'), true);
});
