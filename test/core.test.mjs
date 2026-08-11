import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { analyzeHtml } from '../src/core.mjs';

const fixture = await fs.readFile(new URL('./fixture-good.html', import.meta.url), 'utf8');

const report = analyzeHtml({
  html: fixture,
  requestedUrl: 'https://example.test/coffee',
  finalUrl: 'https://example.test/coffee',
  httpStatus: 200,
  robots: {
    status: 200,
    url: 'https://example.test/robots.txt',
    body: 'User-agent: *\nAllow: /\nSitemap: https://example.test/sitemap.xml\n'
  },
  sitemap: {
    status: 200,
    url: 'https://example.test/sitemap.xml',
    body: ''
  }
});

test('produces all four score dimensions', () => {
  assert.equal(typeof report.scores.technical, 'number');
  assert.equal(typeof report.scores.content, 'number');
  assert.equal(typeof report.scores.yandex, 'number');
  assert.equal(typeof report.scores.aeo_geo, 'number');
  assert.equal(typeof report.scores.overall, 'number');
});

test('extracts canonical and Russian language', () => {
  assert.equal(report.signals.canonical, 'https://example.test/coffee');
  assert.equal(report.signals.lang, 'ru');
});

test('extracts entity and FAQ schema types', () => {
  assert.ok(report.signals.schemas.includes('CafeOrCoffeeShop'));
  assert.ok(report.signals.schemas.includes('FAQPage'));
});

test('keeps evidence attached to every finding', () => {
  assert.ok(report.findings.length >= 15);
  for (const finding of report.findings) {
    assert.ok(finding.id);
    assert.ok(finding.category);
    assert.ok(finding.evidence);
    assert.ok(finding.metric !== undefined);
  }
});

test('passes core crawl and Yandex-readiness fixture checks', () => {
  const byId = Object.fromEntries(report.findings.map((finding) => [finding.id, finding]));
  assert.equal(byId['http-status'].status, 'pass');
  assert.equal(byId['canonical'].status, 'pass');
  assert.equal(byId['canonical-absolute'].status, 'pass');
  assert.equal(byId['robots-txt'].status, 'pass');
  assert.equal(byId['sitemap'].status, 'pass');
  assert.equal(byId['sitemap-declared'].status, 'pass');
});

test('does not present provider scores as authoritative', () => {
  assert.match(report.product.scoreDisclaimer, /not search-engine or AI-provider scores/i);
});
