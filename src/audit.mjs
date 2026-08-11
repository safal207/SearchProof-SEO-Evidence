import fs from 'node:fs/promises';
import path from 'node:path';
import { analyzeHtml } from './core.mjs';

const input = process.argv[2];

if (!input) {
  console.error('Usage: npm run audit -- https://example.com/page');
  process.exit(1);
}

let requestedUrl;
try {
  requestedUrl = new URL(input);
  if (!['http:', 'https:'].includes(requestedUrl.protocol)) throw new Error('unsupported protocol');
} catch {
  console.error('SearchProof requires an absolute http(s) URL.');
  process.exit(1);
}

const headers = {
  'user-agent': 'SearchProof/0.1 (+https://github.com/safal207/SearchProof-SEO-Evidence)',
  accept: 'text/html,application/xhtml+xml'
};

async function probe(url, includeBody = false) {
  try {
    const response = await fetch(url, { redirect: 'follow', headers, signal: AbortSignal.timeout(15000) });
    return {
      url: response.url,
      status: response.status,
      body: includeBody ? await response.text() : ''
    };
  } catch (error) {
    return { url: String(url), status: 0, body: '', error: error instanceof Error ? error.message : String(error) };
  }
}

const pageResponse = await fetch(requestedUrl, { redirect: 'follow', headers, signal: AbortSignal.timeout(20000) });
const contentType = pageResponse.headers.get('content-type') || '';
if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
  console.error(`Expected HTML but received: ${contentType || 'unknown content type'}`);
  process.exit(2);
}

const html = await pageResponse.text();
const final = new URL(pageResponse.url);
const robotsUrl = new URL('/robots.txt', final.origin);
const sitemapUrl = new URL('/sitemap.xml', final.origin);
const [robots, sitemap] = await Promise.all([
  probe(robotsUrl, true),
  probe(sitemapUrl, false)
]);

const report = analyzeHtml({
  html,
  requestedUrl: requestedUrl.href,
  finalUrl: pageResponse.url,
  httpStatus: pageResponse.status,
  robots,
  sitemap
});

await fs.mkdir('reports', { recursive: true });
const safeHost = final.hostname.replace(/[^a-z0-9.-]/gi, '_');
const timestamp = report.audit.generatedAt.replace(/[:.]/g, '-');
const output = path.join('reports', `${safeHost}-${timestamp}.json`);
await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`\nSearchProof v${report.product.version}`);
console.log(`URL: ${report.audit.finalUrl}`);
console.log(`Overall: ${report.scores.overall}/100`);
console.log(`Technical: ${report.scores.technical}/100`);
console.log(`Content: ${report.scores.content}/100`);
console.log(`Yandex readiness: ${report.scores.yandex}/100`);
console.log(`AEO/GEO readiness: ${report.scores.aeo_geo}/100`);

const actionable = report.findings.filter((finding) => finding.status !== 'pass');
if (actionable.length) {
  console.log('\nEvidence-backed findings:');
  for (const finding of actionable) {
    console.log(`- [${finding.severity.toUpperCase()}] ${finding.id}: ${finding.evidence}`);
  }
} else {
  console.log('\nNo actionable MVP findings detected.');
}

console.log(`\nEvidence report: ${output}`);
console.log('Note: SearchProof scores are heuristics, not Yandex/Google/AI-provider scores.');
