import fs from 'node:fs/promises';
import path from 'node:path';

const mode = process.env.SEARCHPROOF_MODE || 'page';
const target = process.env.SEARCHPROOF_TARGET || '';
const explicitReport = process.argv.find((arg) => arg.startsWith('--report='))?.slice('--report='.length);

async function newestReport() {
  if (explicitReport) return explicitReport;
  const names = (await fs.readdir('reports')).filter((name) => name.endsWith('.json'));
  if (!names.length) throw new Error('No SearchProof JSON report found.');
  const entries = await Promise.all(names.map(async (name) => {
    const file = path.join('reports', name);
    const stat = await fs.stat(file);
    return { file, mtimeMs: stat.mtimeMs };
  }));
  entries.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return entries[0].file;
}

const reportPath = await newestReport();
const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
const lines = [];

lines.push('# SearchProof Remote Audit');
lines.push('');
lines.push(`- **Mode:** ${mode}`);
lines.push(`- **Target:** ${target || report.audit?.finalUrl || report.audit?.startUrl || 'n/a'}`);
lines.push(`- **Evidence file:** \`${reportPath}\``);
lines.push('- **Integrity:** SearchProof findings/scores are heuristics and observations, not ranking guarantees.');
lines.push('');

if (mode === 'site' || report.summary?.pagesCrawled != null) {
  const summary = report.summary || {};
  lines.push('## Crawl summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|---:|');
  for (const [label, value] of [
    ['Pages crawled', summary.pagesCrawled],
    ['HTML pages', summary.htmlPages],
    ['Internal edges', summary.internalEdges],
    ['Sitemap URLs', summary.sitemapUrls],
    ['Broken internal links', summary.brokenInternalLinks],
    ['Duplicate title groups', summary.duplicateTitleGroups],
    ['Canonical mismatches', summary.canonicalMismatches],
    ['Orphan-like sitemap URLs', summary.orphanLikeUrls]
  ]) lines.push(`| ${label} | ${value ?? 'n/a'} |`);
} else {
  lines.push('## Page scores');
  lines.push('');
  lines.push('| Score | Value |');
  lines.push('|---|---:|');
  for (const [label, key] of [
    ['Overall', 'overall'],
    ['Technical SEO', 'technical'],
    ['Content', 'content'],
    ['Yandex readiness', 'yandex'],
    ['AEO / GEO', 'aeo_geo']
  ]) lines.push(`| ${label} | ${report.scores?.[key] ?? 'n/a'} |`);
}

const findings = (report.findings || []).filter((finding) => finding.status !== 'pass');
lines.push('');
lines.push('## Evidence-backed findings');
lines.push('');
if (!findings.length) {
  lines.push('No actionable findings detected within this audit scope.');
} else {
  for (const finding of findings.slice(0, 20)) {
    const affected = Array.isArray(finding.affectedUrls) && finding.affectedUrls.length
      ? ` — ${finding.affectedUrls.length} affected URL(s)`
      : '';
    lines.push(`- **${String(finding.severity || finding.status || 'info').toUpperCase()} · ${finding.id}**: ${finding.evidence}${affected}`);
  }
  if (findings.length > 20) lines.push(`- …and ${findings.length - 20} more finding(s) in the JSON artifact.`);
}

lines.push('');
lines.push('Download the workflow artifact for the complete JSON evidence report.');
lines.push('');

const markdown = `${lines.join('\n')}\n`;
await fs.writeFile('reports/github-summary.md', markdown, 'utf8');
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, markdown, 'utf8');
console.log(markdown);
