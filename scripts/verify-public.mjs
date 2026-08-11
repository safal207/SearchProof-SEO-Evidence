import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const index = await fs.readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const app = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const styles = await fs.readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
const remoteAuditCss = await fs.readFile(new URL('../public/remote-audit.css', import.meta.url), 'utf8');
const report = JSON.parse(await fs.readFile(new URL('../public/example-report.json', import.meta.url), 'utf8'));
const experiment = JSON.parse(await fs.readFile(new URL('../public/example-experiment.json', import.meta.url), 'utf8'));
const experimentCss = await fs.readFile(new URL('../public/experiment.css', import.meta.url), 'utf8');
const pkg = JSON.parse(await fs.readFile(new URL('../package.json', import.meta.url), 'utf8'));

assert.match(index, /<title>SearchProof — SEO Evidence<\/title>/);
assert.match(index, /viewport-fit=cover/);
assert.match(index, /data-lang="en"/);
assert.match(index, /data-lang="ru"/);
assert.match(index, /data-i18n="evidenceDashboard"/);
assert.match(index, /Observed delta ≠ causal attribution/);
assert.match(index, /TOTAL_SHOWS/);
assert.match(index, /experiment\.css/);
assert.match(index, /remote-audit\.css/);
assert.match(index, /actions\/workflows\/remote-audit\.yml/);
assert.match(index, /Run on GitHub \/ Запустить в GitHub/);

assert.match(app, /SEO-рекомендации стоят дёшево/);
assert.match(app, /Наблюдаемое изменение ≠ доказанная причинность/);
assert.match(app, /searchproof-language/);
assert.match(app, /document\.documentElement\.lang/);
assert.match(app, /example-report\.json/);
assert.match(app, /example-experiment\.json/);
assert.match(app, /без заявления о причинности/);
assert.match(app, /Локальный русскоязычный поисковый интент/);

assert.match(styles, /env\(safe-area-inset-top\)/);
assert.match(styles, /min-height: 100dvh/);
assert.match(styles, /@media \(max-width: 420px\)/);
assert.match(styles, /\.language-switch/);
assert.match(styles, /touch-action: manipulation/);
assert.match(experimentCss, /\.metric-value small/);
assert.match(experimentCss, /@media \(max-width: 620px\)/);
assert.match(experimentCss, /grid-template-columns: 1fr;/);
assert.match(remoteAuditCss, /\.github-run-button/);
assert.match(remoteAuditCss, /min-height: 44px/);

assert.equal(pkg.version, '0.3.2');
assert.equal(report.meta.kind, 'fixture');
assert.match(report.meta.note, /does not represent measured rankings/i);
assert.equal(typeof report.scores.overall, 'number');
assert.ok(Array.isArray(report.findings) && report.findings.length > 0);
assert.equal(experiment.meta.kind, 'fixture');
assert.match(experiment.meta.note, /not measured rankings/i);
assert.equal(experiment.experiment.integrity.causalClaim, false);
assert.ok(Array.isArray(experiment.experiment.verification.metrics));

console.log('SearchProof bilingual + mobile + GitHub remote audit integrity: PASS');
