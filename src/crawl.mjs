import fs from 'node:fs/promises';
import path from 'node:path';
import { crawlSite } from './crawler.mjs';

const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith('--'));
const maxPagesArg = args.find((arg) => arg.startsWith('--max-pages='));
const maxDepthArg = args.find((arg) => arg.startsWith('--max-depth='));

if (!input) {
  console.error('Usage: npm run crawl -- https://example.com --max-pages=50 --max-depth=3');
  process.exit(1);
}

const maxPages = Math.max(1, Math.min(500, Number(maxPagesArg?.split('=')[1] || 50)));
const maxDepth = Math.max(0, Math.min(10, Number(maxDepthArg?.split('=')[1] || 3)));

let startUrl;
try {
  startUrl = new URL(input);
  if (!['http:', 'https:'].includes(startUrl.protocol)) throw new Error('unsupported protocol');
} catch {
  console.error('SearchProof crawler requires an absolute http(s) URL.');
  process.exit(1);
}

const report = await crawlSite({ startUrl: startUrl.href, maxPages, maxDepth });
await fs.mkdir('reports', { recursive: true });
const safeHost = startUrl.hostname.replace(/[^a-z0-9.-]/gi, '_');
const timestamp = report.audit.generatedAt.replace(/[:.]/g, '-');
const output = path.join('reports', `${safeHost}-site-${timestamp}.json`);
await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`\nSearchProof Site Crawl v${report.product.version}`);
console.log(`Start URL: ${report.audit.startUrl}`);
console.log(`Pages crawled: ${report.summary.pagesCrawled}`);
console.log(`HTML pages: ${report.summary.htmlPages}`);
console.log(`Internal edges: ${report.summary.internalEdges}`);
console.log(`Sitemap URLs: ${report.summary.sitemapUrls}`);
console.log(`Broken internal links: ${report.summary.brokenInternalLinks}`);
console.log(`Duplicate title groups: ${report.summary.duplicateTitleGroups}`);
console.log(`Canonical mismatches: ${report.summary.canonicalMismatches}`);
console.log(`Orphan-like sitemap URLs: ${report.summary.orphanLikeUrls}`);

if (report.findings.length) {
  console.log('\nSite-level findings:');
  for (const finding of report.findings) {
    console.log(`- [${finding.severity.toUpperCase()}] ${finding.id}: ${finding.evidence}`);
  }
} else {
  console.log('\nNo site-level findings detected within this crawl scope.');
}

console.log(`\nEvidence report: ${output}`);
console.log('Note: crawler findings are deterministic heuristics, not ranking guarantees.');
