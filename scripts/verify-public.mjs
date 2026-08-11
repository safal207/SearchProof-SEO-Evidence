import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const index = await fs.readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const app = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const report = JSON.parse(await fs.readFile(new URL('../public/example-report.json', import.meta.url), 'utf8'));
const experiment = JSON.parse(await fs.readFile(new URL('../public/example-experiment.json', import.meta.url), 'utf8'));
const experimentCss = await fs.readFile(new URL('../public/experiment.css', import.meta.url), 'utf8');

assert.match(index, /<title>SearchProof — SEO Evidence<\/title>/);
assert.match(index, /URL → finding → evidence → change → metric → observed result/);
assert.match(index, /Fixture data · no ranking claims/);
assert.match(index, /Observed delta ≠ causal attribution/);
assert.match(index, /TOTAL_SHOWS/);
assert.match(index, /experiment\.css/);
assert.match(app, /example-report\.json/);
assert.match(app, /example-experiment\.json/);
assert.match(app, /no attribution claim/);
assert.match(experimentCss, /experiment-card/);
assert.equal(report.meta.kind, 'fixture');
assert.match(report.meta.note, /does not represent measured rankings/i);
assert.equal(typeof report.scores.overall, 'number');
assert.ok(Array.isArray(report.findings) && report.findings.length > 0);
assert.equal(experiment.meta.kind, 'fixture');
assert.match(experiment.meta.note, /not measured rankings/i);
assert.equal(experiment.experiment.integrity.causalClaim, false);
assert.ok(Array.isArray(experiment.experiment.verification.metrics));

console.log('SearchProof public dashboard integrity: PASS');
