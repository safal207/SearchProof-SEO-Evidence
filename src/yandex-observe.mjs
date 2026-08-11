import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchAllQueriesObservation, fetchPopularQueries } from './yandex.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=') || true];
}));

const token = process.env.YANDEX_TOKEN;
const userId = args['user-id'] || process.env.YANDEX_USER_ID;
const hostId = args['host-id'] || process.env.YANDEX_HOST_ID;
const dateFrom = args['date-from'];
const dateTo = args['date-to'];

if (!token || !userId || !hostId) {
  console.error('Usage: YANDEX_TOKEN=... YANDEX_USER_ID=... YANDEX_HOST_ID=... npm run yandex:observe -- --date-from=YYYY-MM-DD --date-to=YYYY-MM-DD');
  process.exit(1);
}

const [aggregate, popular] = await Promise.all([
  fetchAllQueriesObservation({ token, userId, hostId, dateFrom, dateTo }),
  fetchPopularQueries({ token, userId, hostId, dateFrom, dateTo })
]);

const report = {
  product: { name: 'SearchProof', version: '0.3.0' },
  kind: 'provider-observation',
  generatedAt: new Date().toISOString(),
  provider: 'Yandex Webmaster API',
  aggregate,
  popular,
  integrity: {
    tokenPersisted: false,
    causalClaim: false,
    note: 'Observed provider metrics are stored as evidence. SearchProof does not infer causality from before/after movement alone.'
  }
};

await fs.mkdir('observations', { recursive: true });
const safeHost = String(hostId).replace(/[^a-z0-9.-]/gi, '_');
const stamp = report.generatedAt.replace(/[:.]/g, '-');
const output = path.join('observations', `yandex-${safeHost}-${stamp}.json`);
await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Yandex Webmaster observation saved: ${output}`);
console.log(`Shows: ${aggregate.metrics.TOTAL_SHOWS}`);
console.log(`Clicks: ${aggregate.metrics.TOTAL_CLICKS}`);
console.log(`Average show position: ${aggregate.metrics.AVG_SHOW_POSITION ?? 'n/a'}`);
console.log('Note: observed deltas are not causal attribution.');
