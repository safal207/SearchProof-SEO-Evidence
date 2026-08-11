import test from 'node:test';
import assert from 'node:assert/strict';
import { crawlSite, normalizeUrl } from '../src/crawler.mjs';

const origin = 'https://example.test';
const project = `${origin}/project/`;

const pages = new Map([
  [`${project}sitemap.xml`, {
    status: 200,
    type: 'application/xml',
    body: `<?xml version="1.0"?><urlset>
      <url><loc>${project}</loc></url>
      <url><loc>${project}a</loc></url>
    </urlset>`
  }],
  [`${origin}/sitemap.xml`, {
    status: 404,
    type: 'text/plain',
    body: 'not found'
  }],
  [project, {
    status: 200,
    type: 'text/html',
    body: `<!doctype html><html><head>
      <title>Project home</title>
      <meta name="description" content="Project home description">
      <link rel="canonical" href="${project}">
    </head><body><h1>Project home</h1><a href="a">A</a></body></html>`
  }],
  [`${project}a`, {
    status: 200,
    type: 'text/html',
    body: `<!doctype html><html><head>
      <title>Project page A</title>
      <meta name="description" content="Project page A description">
      <link rel="canonical" href="${project}a">
    </head><body><h1>Project page A</h1></body></html>`
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

test('discovers sitemap beside a project-site start URL before falling back to origin root', async () => {
  const report = await crawlSite({
    startUrl: project,
    fetchImpl: mockFetch,
    maxPages: 10,
    maxDepth: 2,
    timeoutMs: 1000
  });

  assert.equal(report.sitemap.url, `${project}sitemap.xml`);
  assert.equal(report.sitemap.status, 200);
  assert.equal(report.summary.sitemapUrls, 2);
  assert.deepEqual(report.sitemap.urls, [project, `${project}a`]);
  assert.deepEqual(report.sitemap.orphanLike, []);
  assert.deepEqual(report.sitemap.crawledMissingFromSitemap, []);
});
