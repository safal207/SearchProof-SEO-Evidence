import test from 'node:test';
import assert from 'node:assert/strict';
import { crawlSite, normalizeUrl } from '../src/crawler.mjs';

const origin = 'https://shop.test';

const pages = new Map([
  [`${origin}/sitemap.xml`, {
    status: 200,
    type: 'application/xml',
    body: `<?xml version="1.0"?><sitemapindex>
      <sitemap><loc>${origin}/sitemaps/catalog.xml</loc></sitemap>
      <sitemap><loc>${origin}/sitemaps/content-index.xml</loc></sitemap>
    </sitemapindex>`
  }],
  [`${origin}/sitemaps/catalog.xml`, {
    status: 200,
    type: 'application/xml',
    body: `<?xml version="1.0"?><urlset>
      <url><loc>${origin}/</loc></url>
      <url><loc>${origin}/catalog/</loc></url>
    </urlset>`
  }],
  [`${origin}/sitemaps/content-index.xml`, {
    status: 200,
    type: 'application/xml',
    body: `<?xml version="1.0"?><sitemapindex>
      <sitemap><loc>${origin}/sitemaps/articles.xml</loc></sitemap>
      <sitemap><loc>https://external.test/ignored.xml</loc></sitemap>
    </sitemapindex>`
  }],
  [`${origin}/sitemaps/articles.xml`, {
    status: 200,
    type: 'application/xml',
    body: `<?xml version="1.0"?><urlset>
      <url><loc>${origin}/blog/guide/</loc></url>
    </urlset>`
  }],
  [`${origin}/`, {
    status: 200,
    type: 'text/html',
    body: `<!doctype html><html><head>
      <title>Shop</title><meta name="description" content="Shop home">
      <link rel="canonical" href="${origin}/">
    </head><body><h1>Shop</h1><a href="/catalog/">Catalog</a><a href="/blog/guide/">Guide</a></body></html>`
  }],
  [`${origin}/catalog/`, {
    status: 200,
    type: 'text/html',
    body: `<!doctype html><html><head>
      <title>Catalog</title><meta name="description" content="Catalog page">
      <link rel="canonical" href="${origin}/catalog/">
    </head><body><h1>Catalog</h1></body></html>`
  }],
  [`${origin}/blog/guide/`, {
    status: 200,
    type: 'text/html',
    body: `<!doctype html><html><head>
      <title>Guide</title><meta name="description" content="Guide page">
      <link rel="canonical" href="${origin}/blog/guide/">
    </head><body><h1>Guide</h1></body></html>`
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

test('recursively resolves same-origin sitemap indexes into page URLs', async () => {
  const report = await crawlSite({
    startUrl: `${origin}/`,
    fetchImpl: mockFetch,
    maxPages: 10,
    maxDepth: 2,
    timeoutMs: 1000
  });

  assert.deepEqual(report.sitemap.urls.sort(), [
    `${origin}/`,
    `${origin}/blog/guide/`,
    `${origin}/catalog/`
  ].sort());
  assert.equal(report.summary.sitemapUrls, 3);
  assert.equal(report.summary.sitemapSources, 4);
  assert.equal(report.sitemap.sources.filter((source) => source.kind === 'index').length, 2);
  assert.equal(report.sitemap.urls.some((url) => url.endsWith('.xml')), false, 'child sitemap URLs are not treated as indexable pages');
  assert.equal(report.sitemap.orphanLike.length, 0);
  assert.deepEqual(report.sitemap.crawledMissingFromSitemap, []);
  assert.equal(report.findings.some((finding) => ['sitemap-orphan-like', 'crawl-not-in-sitemap'].includes(finding.id)), false);
});
