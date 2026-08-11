const compact = (value = '') => String(value).replace(/\s+/g, ' ').trim();

function attrFromTag(tag, attr) {
  const match = tag.match(new RegExp(`\\b${attr}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match?.[2] ?? '';
}

function tagContent(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? compact(match[1].replace(/<[^>]+>/g, ' ')) : '';
}

function allTagContents(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))]
    .map((match) => compact(match[1].replace(/<[^>]+>/g, ' ')))
    .filter(Boolean);
}

function metaContent(html, name) {
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  const found = metas.find((candidate) => {
    const key = attrFromTag(candidate, 'name') || attrFromTag(candidate, 'property');
    return key.toLowerCase() === name.toLowerCase();
  });
  return found ? attrFromTag(found, 'content') : '';
}

function linkHref(html, rel) {
  const links = html.match(/<link\b[^>]*>/gi) || [];
  const found = links.find((candidate) => attrFromTag(candidate, 'rel').toLowerCase().split(/\s+/).includes(rel.toLowerCase()));
  return found ? attrFromTag(found, 'href') : '';
}

export function normalizeUrl(input, base) {
  try {
    const url = new URL(input, base);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

function stripConventionalIndex(input) {
  const normalized = normalizeUrl(input);
  if (!normalized) return null;
  const url = new URL(normalized);
  if (/\/index\.html?$/i.test(url.pathname)) {
    url.pathname = url.pathname.replace(/index\.html?$/i, '');
  }
  return url.href;
}

function isCanonicalIndexAlias(page) {
  if (!page?.canonical || !page?.url) return false;
  const pageUrl = normalizeUrl(page.url);
  const canonical = normalizeUrl(page.canonical, page.url);
  if (!pageUrl || !canonical) return false;
  if (new URL(pageUrl).origin !== new URL(canonical).origin) return false;
  return stripConventionalIndex(pageUrl) === stripConventionalIndex(canonical);
}

function logicalPageUrl(page) {
  if (isCanonicalIndexAlias(page)) return stripConventionalIndex(page.canonical);
  return normalizeUrl(page?.url) || page?.url || '';
}

function collapseCanonicalAliases(pages) {
  const byDocument = new Map();
  for (const page of pages) {
    const key = logicalPageUrl(page);
    if (!key) continue;
    const current = byDocument.get(key);
    if (!current || page.url === key) byDocument.set(key, page);
  }
  return [...byDocument.values()];
}

export function extractPageSignals(html, pageUrl) {
  const base = new URL(pageUrl);
  const links = [];
  for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
    const href = attrFromTag(tag, 'href');
    if (!href || href.startsWith('#') || /^(javascript:|mailto:|tel:)/i.test(href)) continue;
    const resolved = normalizeUrl(href, pageUrl);
    if (!resolved) continue;
    const target = new URL(resolved);
    if (target.origin === base.origin) links.push(resolved);
  }

  const canonicalRaw = linkHref(html, 'canonical');
  return {
    title: tagContent(html, 'title'),
    description: metaContent(html, 'description'),
    h1s: allTagContents(html, 'h1'),
    canonical: canonicalRaw ? normalizeUrl(canonicalRaw, pageUrl) : '',
    internalLinks: [...new Set(links)]
  };
}

export function parseSitemap(xml, origin) {
  const urls = [];
  for (const match of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
    const normalized = normalizeUrl(match[1].replace(/&amp;/g, '&'));
    if (!normalized) continue;
    if (new URL(normalized).origin === origin) urls.push(normalized);
  }
  return [...new Set(urls)];
}

function sitemapDocumentKind(xml) {
  if (/<sitemapindex\b/i.test(xml)) return 'index';
  if (/<urlset\b/i.test(xml)) return 'urlset';
  return 'unknown';
}

function duplicateGroups(pages, field, transform = (value) => compact(value).toLowerCase()) {
  const buckets = new Map();
  for (const page of pages) {
    const raw = page[field];
    const value = Array.isArray(raw) ? raw[0] : raw;
    const key = value ? transform(value) : '';
    if (!key) continue;
    const list = buckets.get(key) || [];
    list.push(logicalPageUrl(page));
    buckets.set(key, list);
  }
  return [...buckets.entries()]
    .filter(([, urls]) => new Set(urls).size > 1)
    .map(([value, urls]) => ({ value, urls: [...new Set(urls)] }));
}

function finding({ id, severity, message, evidence, recommendation, metric, affectedUrls = [] }) {
  return { id, category: 'site', status: severity, severity, message, evidence, recommendation, metric, affectedUrls };
}

async function safeFetch(fetchImpl, url, headers, timeoutMs) {
  try {
    const response = await fetchImpl(url, {
      redirect: 'follow',
      headers,
      signal: AbortSignal.timeout(timeoutMs)
    });
    const contentType = response.headers?.get?.('content-type') || '';
    const body = await response.text();
    return { requestedUrl: url, url: normalizeUrl(response.url || url) || url, status: response.status, contentType, body };
  } catch (error) {
    return { requestedUrl: url, url, status: 0, contentType: '', body: '', error: error instanceof Error ? error.message : String(error) };
  }
}

async function resolveSitemapTree({ rootUrl, origin, fetchImpl, headers, timeoutMs, maxSitemaps = 50, maxDepth = 3 }) {
  const queue = [{ url: rootUrl, depth: 0 }];
  const queued = new Set([rootUrl]);
  const visited = new Set();
  const pageUrls = [];
  const sources = [];
  let rootStatus = 0;

  while (queue.length && visited.size < maxSitemaps) {
    const current = queue.shift();
    if (!current || visited.has(current.url)) continue;
    visited.add(current.url);

    const response = await safeFetch(fetchImpl, current.url, headers, timeoutMs);
    if (current.depth === 0) rootStatus = response.status;
    const ok = response.status >= 200 && response.status < 400;
    const kind = ok ? sitemapDocumentKind(response.body) : 'unknown';
    const locs = ok ? parseSitemap(response.body, origin) : [];
    sources.push({ url: current.url, status: response.status, kind, locs: locs.length });

    if (!ok) continue;
    if (kind === 'index') {
      if (current.depth >= maxDepth) continue;
      for (const child of locs) {
        if (visited.has(child) || queued.has(child)) continue;
        if (queued.size >= maxSitemaps) break;
        queued.add(child);
        queue.push({ url: child, depth: current.depth + 1 });
      }
      continue;
    }

    pageUrls.push(...locs);
  }

  return {
    url: rootUrl,
    status: rootStatus,
    urls: [...new Set(pageUrls)],
    sources
  };
}

async function discoverSitemap({ seed, origin, fetchImpl, headers, timeoutMs }) {
  const scoped = normalizeUrl('sitemap.xml', seed);
  const root = `${origin}/sitemap.xml`;
  const candidates = [...new Set([scoped, root].filter(Boolean))];
  let best = { url: candidates[0] || root, status: 0, urls: [], sources: [] };

  for (const url of candidates) {
    const resolved = await resolveSitemapTree({ rootUrl: url, origin, fetchImpl, headers, timeoutMs });
    const ok = resolved.status >= 200 && resolved.status < 400;
    if (ok && resolved.urls.length) return resolved;
    if (best.status === 0 || ok) best = resolved;
  }

  return best;
}

export async function crawlSite({
  startUrl,
  fetchImpl = fetch,
  maxPages = 50,
  maxDepth = 3,
  timeoutMs = 15000,
  userAgent = 'SearchProof/0.2 (+https://github.com/safal207/SearchProof-SEO-Evidence)'
}) {
  const seed = normalizeUrl(startUrl);
  if (!seed) throw new Error('crawlSite requires an absolute http(s) startUrl');
  const origin = new URL(seed).origin;
  const headers = { 'user-agent': userAgent, accept: 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.1' };

  const sitemap = await discoverSitemap({ seed, origin, fetchImpl, headers, timeoutMs });
  const sitemapUrl = sitemap.url;
  const sitemapUrls = sitemap.urls;

  const queue = [{ url: seed, depth: 0 }];
  const queued = new Set([seed]);
  const visited = new Set();
  const pages = [];
  const edges = [];
  let crawlCapacityHit = false;

  while (queue.length && pages.length < maxPages) {
    const current = queue.shift();
    if (!current || visited.has(current.url)) continue;
    visited.add(current.url);

    const response = await safeFetch(fetchImpl, current.url, headers, timeoutMs);
    const finalUrl = response.url && new URL(response.url).origin === origin ? response.url : current.url;
    visited.add(finalUrl);
    const isHtml = /text\/html|application\/xhtml\+xml/i.test(response.contentType) || /^\s*<!doctype html|^\s*<html\b/i.test(response.body);
    const signals = isHtml ? extractPageSignals(response.body, finalUrl) : { title: '', description: '', h1s: [], canonical: '', internalLinks: [] };

    const page = {
      requestedUrl: current.url,
      url: finalUrl,
      status: response.status,
      depth: current.depth,
      contentType: response.contentType,
      isHtml,
      title: signals.title,
      description: signals.description,
      h1s: signals.h1s,
      canonical: signals.canonical,
      internalLinks: signals.internalLinks,
      error: response.error || ''
    };
    pages.push(page);

    if (!isHtml) continue;
    for (const target of signals.internalLinks) {
      edges.push({ from: finalUrl, to: target });
      if (current.depth < maxDepth && !visited.has(target) && !queued.has(target)) {
        if (pages.length + queue.length < maxPages) {
          queued.add(target);
          queue.push({ url: target, depth: current.depth + 1 });
        } else {
          crawlCapacityHit = true;
        }
      }
    }
  }

  const crawlTruncated = pages.length >= maxPages && (queue.length > 0 || crawlCapacityHit);
  const uniqueEdges = [...new Map(edges.map((edge) => [`${edge.from}\n${edge.to}`, edge])).values()];
  const pageByUrl = new Map();
  for (const page of pages) {
    pageByUrl.set(page.requestedUrl, page);
    pageByUrl.set(page.url, page);
  }

  const physicalHtmlPages = pages.filter((page) => page.isHtml && page.status >= 200 && page.status < 400);
  const htmlPages = collapseCanonicalAliases(physicalHtmlPages);
  const crawledUrls = new Set(htmlPages.map((page) => logicalPageUrl(page)));
  const discoveredUrls = new Set([
    logicalPageUrl({ url: seed, canonical: '' }),
    ...uniqueEdges.map((edge) => {
      const targetPage = pageByUrl.get(edge.to);
      return targetPage ? logicalPageUrl(targetPage) : edge.to;
    })
  ]);
  const missingTitle = htmlPages.filter((page) => !page.title).map((page) => logicalPageUrl(page));
  const missingH1 = htmlPages.filter((page) => page.h1s.length === 0).map((page) => logicalPageUrl(page));
  const duplicateTitles = duplicateGroups(htmlPages, 'title');
  const duplicateDescriptions = duplicateGroups(htmlPages, 'description');
  const duplicateH1s = duplicateGroups(htmlPages, 'h1s');
  const canonicalMismatches = physicalHtmlPages
    .filter((page) => page.canonical && page.canonical !== page.url && !isCanonicalIndexAlias(page))
    .map((page) => ({ url: page.url, canonical: page.canonical }));

  const brokenInternalLinks = [];
  for (const edge of uniqueEdges) {
    const target = pageByUrl.get(edge.to);
    if (target && (target.status === 0 || target.status >= 400)) brokenInternalLinks.push({ ...edge, status: target.status });
  }

  const undiscoveredSitemapUrls = sitemapUrls.filter((url) => url !== seed && !discoveredUrls.has(url));
  const orphanLike = crawlTruncated ? [] : undiscoveredSitemapUrls;
  const crawledMissingFromSitemap = sitemapUrls.length
    ? [...crawledUrls].filter((url) => !sitemapUrls.includes(url))
    : [];

  const findings = [];
  if (brokenInternalLinks.length) findings.push(finding({ id: 'broken-internal-links', severity: 'error', message: 'Crawled internal links resolve to failing responses', evidence: `${brokenInternalLinks.length} broken internal link edge(s)`, recommendation: 'Fix the target response or update/remove the internal link.', metric: 'internal link HTTP status', affectedUrls: [...new Set(brokenInternalLinks.map((item) => item.to))] }));
  if (missingTitle.length) findings.push(finding({ id: 'missing-titles', severity: 'error', message: 'HTML pages are missing title elements', evidence: `${missingTitle.length} page(s) without a title`, recommendation: 'Add a unique descriptive title to each indexable page.', metric: 'title coverage / snippet review', affectedUrls: missingTitle }));
  if (duplicateTitles.length) findings.push(finding({ id: 'duplicate-titles', severity: 'warn', message: 'Multiple crawled pages share the same title', evidence: `${duplicateTitles.length} duplicate title group(s)`, recommendation: 'Review search intent and make titles page-specific where the pages represent different intents.', metric: 'duplicate title groups / SERP intent separation', affectedUrls: [...new Set(duplicateTitles.flatMap((group) => group.urls))] }));
  if (missingH1.length) findings.push(finding({ id: 'missing-h1', severity: 'warn', message: 'HTML pages are missing an H1', evidence: `${missingH1.length} page(s) without an H1`, recommendation: 'Expose a clear visible primary heading for the page intent.', metric: 'H1 coverage / content structure review', affectedUrls: missingH1 }));
  if (duplicateH1s.length) findings.push(finding({ id: 'duplicate-h1', severity: 'info', message: 'Multiple pages share the same primary H1', evidence: `${duplicateH1s.length} duplicate H1 group(s)`, recommendation: 'Review whether repeated H1s reflect intentional templates or unresolved intent overlap.', metric: 'H1 uniqueness / intent mapping', affectedUrls: [...new Set(duplicateH1s.flatMap((group) => group.urls))] }));
  if (duplicateDescriptions.length) findings.push(finding({ id: 'duplicate-descriptions', severity: 'info', message: 'Multiple pages share the same meta description', evidence: `${duplicateDescriptions.length} duplicate description group(s)`, recommendation: 'Make descriptions page-specific when that improves clarity; snippets remain search-engine selected.', metric: 'description uniqueness / CTR observation', affectedUrls: [...new Set(duplicateDescriptions.flatMap((group) => group.urls))] }));
  if (canonicalMismatches.length) findings.push(finding({ id: 'canonical-mismatches', severity: 'warn', message: 'Pages declare canonicals that differ from their crawled URL', evidence: `${canonicalMismatches.length} canonical mismatch(es)`, recommendation: 'Verify that each alternate canonical is intentional, indexable and consistent with internal linking.', metric: 'canonical selection / duplicate URL state', affectedUrls: canonicalMismatches.map((item) => item.url) }));
  if (crawlTruncated && undiscoveredSitemapUrls.length) findings.push(finding({ id: 'sitemap-coverage-partial', severity: 'info', message: 'Sitemap orphan analysis is incomplete because the crawl hit its page limit', evidence: `${undiscoveredSitemapUrls.length} sitemap URL(s) were not reached before maxPages=${maxPages}`, recommendation: 'Increase crawl scope or audit a focused sitemap/category slice before classifying orphan-like URLs.', metric: 'crawl completeness / sitemap coverage' }));
  if (orphanLike.length) findings.push(finding({ id: 'sitemap-orphan-like', severity: 'warn', message: 'Sitemap URLs were not discovered through the crawled internal-link graph', evidence: `${orphanLike.length} sitemap URL(s) undiscovered within a non-truncated crawl`, recommendation: 'Check whether important sitemap URLs have ordinary internal links. This is an orphan-like heuristic, not proof of a true orphan.', metric: 'crawl discovery / internal link graph', affectedUrls: orphanLike }));
  if (crawledMissingFromSitemap.length) findings.push(finding({ id: 'crawl-not-in-sitemap', severity: 'info', message: 'Crawled HTML pages are absent from the conventional sitemap', evidence: `${crawledMissingFromSitemap.length} crawled page(s) not present in sitemap.xml`, recommendation: 'Review whether these pages should be represented in the submitted sitemap.', metric: 'sitemap coverage', affectedUrls: crawledMissingFromSitemap }));

  return {
    product: { name: 'SearchProof', version: '0.2.0', disclaimer: 'Site-level findings are deterministic crawl heuristics, not Yandex/Google ranking signals.' },
    audit: { startUrl: seed, origin, maxPages, maxDepth, generatedAt: new Date().toISOString() },
    summary: {
      pagesCrawled: pages.length,
      htmlPages: htmlPages.length,
      internalEdges: uniqueEdges.length,
      sitemapUrls: sitemapUrls.length,
      sitemapSources: sitemap.sources.length,
      crawlTruncated,
      sitemapUrlsUndiscoveredWithinCrawl: undiscoveredSitemapUrls.length,
      brokenInternalLinks: brokenInternalLinks.length,
      duplicateTitleGroups: duplicateTitles.length,
      canonicalMismatches: canonicalMismatches.length,
      orphanLikeUrls: orphanLike.length
    },
    sitemap: { url: sitemapUrl, status: sitemap.status, urls: sitemapUrls, sources: sitemap.sources, crawlTruncated, undiscoveredWithinCrawl: undiscoveredSitemapUrls, orphanLike, crawledMissingFromSitemap },
    pages,
    graph: { nodes: pages.map((page) => ({ url: page.url, status: page.status, depth: page.depth, title: page.title, logicalUrl: logicalPageUrl(page) })), edges: uniqueEdges },
    duplicates: { titles: duplicateTitles, descriptions: duplicateDescriptions, h1s: duplicateH1s },
    canonicalMismatches,
    brokenInternalLinks,
    findings,
    hypothesisTemplate: { finding: '', evidence: '', change: '', baseline: '', targetMetric: '', verificationWindow: '', observedResult: '' }
  };
}
