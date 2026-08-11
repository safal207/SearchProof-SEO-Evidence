import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const index = await fs.readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const app = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const report = JSON.parse(await fs.readFile(new URL('../public/example-report.json', import.meta.url), 'utf8'));

assert.match(index, /<title>SearchProof — SEO Evidence<\/title>/);
assert.match(index, /URL → finding → evidence → change → metric → observed result/);
assert.match(index, /Fixture data · no ranking claims/);
assert.match(index, /Scores are heuristics/);
assert.match(app, /example-report\.json/);
assert.equal(report.meta.kind, 'fixture');
assert.match(report.meta.note, /does not represent measured rankings/i);
assert.equal(typeof report.scores.overall, 'number');
assert.ok(Array.isArray(report.findings) && report.findings.length > 0);

console.log('SearchProof public dashboard integrity: PASS');
