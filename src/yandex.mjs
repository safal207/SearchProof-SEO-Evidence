export const YANDEX_QUERY_INDICATORS = [
  'TOTAL_SHOWS',
  'TOTAL_CLICKS',
  'AVG_SHOW_POSITION',
  'AVG_CLICK_POSITION'
];

function required(value, name) {
  if (!String(value ?? '').trim()) throw new Error(`${name} is required`);
  return String(value);
}

function encodeHostId(hostId) {
  return encodeURIComponent(required(hostId, 'hostId'));
}

export function buildAllQueriesHistoryUrl({ userId, hostId, dateFrom, dateTo, device = 'ALL' }) {
  const uid = encodeURIComponent(required(userId, 'userId'));
  const url = new URL(`https://api.webmaster.yandex.net/v4/user/${uid}/hosts/${encodeHostId(hostId)}/search-queries/all/history`);
  for (const indicator of YANDEX_QUERY_INDICATORS) url.searchParams.append('query_indicator', indicator);
  url.searchParams.set('device_type_indicator', device);
  if (dateFrom) url.searchParams.set('date_from', dateFrom);
  if (dateTo) url.searchParams.set('date_to', dateTo);
  return url.href;
}

export function buildPopularQueriesUrl({ userId, hostId, dateFrom, dateTo, device = 'ALL', orderBy = 'TOTAL_SHOWS', limit = 500 }) {
  if (!['TOTAL_SHOWS', 'TOTAL_CLICKS'].includes(orderBy)) throw new Error('orderBy must be TOTAL_SHOWS or TOTAL_CLICKS');
  const uid = encodeURIComponent(required(userId, 'userId'));
  const url = new URL(`https://api.webmaster.yandex.net/v4/user/${uid}/hosts/${encodeHostId(hostId)}/search-queries/popular`);
  url.searchParams.set('order_by', orderBy);
  for (const indicator of YANDEX_QUERY_INDICATORS) url.searchParams.append('query_indicator', indicator);
  url.searchParams.set('device_type_indicator', device);
  if (dateFrom) url.searchParams.set('date_from', dateFrom);
  if (dateTo) url.searchParams.set('date_to', dateTo);
  url.searchParams.set('limit', String(Math.min(500, Math.max(1, Number(limit) || 500))));
  return url.href;
}

function points(payload, metric) {
  return Array.isArray(payload?.indicators?.[metric])
    ? payload.indicators[metric]
        .filter((point) => point && Number.isFinite(Number(point.value)))
        .map((point) => ({ date: point.date, value: Number(point.value) }))
    : [];
}

function sum(series) {
  return series.reduce((total, point) => total + point.value, 0);
}

function weightedAverage(valueSeries, weightSeries) {
  const weights = new Map(weightSeries.map((point) => [point.date, point.value]));
  let weighted = 0;
  let totalWeight = 0;
  for (const point of valueSeries) {
    const weight = Number(weights.get(point.date));
    if (!Number.isFinite(weight) || weight <= 0) continue;
    weighted += point.value * weight;
    totalWeight += weight;
  }
  return totalWeight ? Number((weighted / totalWeight).toFixed(4)) : null;
}

export function normalizeAllQueriesHistory(payload, { hostId = '', requestedDateFrom = '', requestedDateTo = '', capturedAt = new Date().toISOString() } = {}) {
  const shows = points(payload, 'TOTAL_SHOWS');
  const clicks = points(payload, 'TOTAL_CLICKS');
  const showPosition = points(payload, 'AVG_SHOW_POSITION');
  const clickPosition = points(payload, 'AVG_CLICK_POSITION');

  return {
    source: 'yandex-webmaster',
    capturedAt,
    period: {
      from: payload?.date_from || requestedDateFrom || shows[0]?.date || '',
      to: payload?.date_to || requestedDateTo || shows.at(-1)?.date || ''
    },
    scope: { hostId, device: 'ALL', queryScope: 'all' },
    metrics: {
      TOTAL_SHOWS: sum(shows),
      TOTAL_CLICKS: sum(clicks),
      AVG_SHOW_POSITION: weightedAverage(showPosition, shows),
      AVG_CLICK_POSITION: weightedAverage(clickPosition, clicks)
    },
    series: {
      TOTAL_SHOWS: shows,
      TOTAL_CLICKS: clicks,
      AVG_SHOW_POSITION: showPosition,
      AVG_CLICK_POSITION: clickPosition
    },
    evidence: {
      endpoint: 'search-queries/all/history',
      provider: 'Yandex Webmaster API',
      transformation: 'shows/clicks summed by period; positions weighted by same-day shows/clicks when available'
    },
    note: 'Provider observation only. SearchProof does not infer causal uplift from this record.'
  };
}

export function normalizePopularQueries(payload, { hostId = '', capturedAt = new Date().toISOString() } = {}) {
  return {
    source: 'yandex-webmaster',
    capturedAt,
    period: { from: payload?.date_from || '', to: payload?.date_to || '' },
    scope: { hostId, device: 'ALL', queryScope: 'popular' },
    queries: (payload?.queries || []).map((query) => ({
      queryId: query.query_id,
      queryText: query.query_text,
      metrics: Object.fromEntries(YANDEX_QUERY_INDICATORS.map((key) => [key, Number.isFinite(Number(query?.indicators?.[key])) ? Number(query.indicators[key]) : null]))
    })),
    count: Number(payload?.count || 0),
    evidence: { endpoint: 'search-queries/popular', provider: 'Yandex Webmaster API' }
  };
}

async function requestJson(url, token, fetchImpl = fetch) {
  required(token, 'OAuth token');
  const response = await fetchImpl(url, {
    headers: {
      Authorization: `OAuth ${token}`,
      Accept: 'application/json',
      'User-Agent': 'SearchProof/0.3 (+https://github.com/safal207/SearchProof-SEO-Evidence)'
    },
    signal: AbortSignal.timeout(20000)
  });
  const body = await response.text();
  let payload;
  try { payload = body ? JSON.parse(body) : {}; } catch { payload = { raw: body }; }
  if (!response.ok) {
    const error = new Error(`Yandex Webmaster API HTTP ${response.status}: ${payload?.error_code || payload?.error_message || 'request failed'}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export async function fetchAllQueriesObservation({ token, userId, hostId, dateFrom, dateTo, fetchImpl = fetch }) {
  const url = buildAllQueriesHistoryUrl({ userId, hostId, dateFrom, dateTo });
  const payload = await requestJson(url, token, fetchImpl);
  return normalizeAllQueriesHistory(payload, { hostId, requestedDateFrom: dateFrom, requestedDateTo: dateTo });
}

export async function fetchPopularQueries({ token, userId, hostId, dateFrom, dateTo, fetchImpl = fetch }) {
  const url = buildPopularQueriesUrl({ userId, hostId, dateFrom, dateTo });
  const payload = await requestJson(url, token, fetchImpl);
  return normalizePopularQueries(payload, { hostId });
}
