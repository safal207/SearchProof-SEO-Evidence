const text = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function tagContent(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? text(match[1].replace(/<[^>]+>/g, ' ')) : '';
}

function allTagContents(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))]
    .map((match) => text(match[1].replace(/<[^>]+>/g, ' ')))
    .filter(Boolean);
}

function attrFromTag(tag, attr) {
  const match = tag.match(new RegExp(`\\b${escapeRe(attr)}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return match?.[1] ?? '';
}

function firstTagBy(html, tag, attr, value) {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi')) || [];
  return tags.find((candidate) => attrFromTag(candidate, attr).toLowerCase() === value.toLowerCase()) || '';
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

function htmlLang(html) {
  const opening = html.match(/<html\b[^>]*>/i)?.[0] || '';
  return attrFromTag(opening, 'lang');
}

function visibleWordCount(html) {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ');
  return text(cleaned).split(/\s+/).filter(Boolean).length;
}

function links(html, baseUrl) {
  const tags = html.match(/<a\b[^>]*>/gi) || [];
  const base = new URL(baseUrl);
  const result = [];
  for (const tag of tags) {
    const href = attrFromTag(tag, 'href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    try {
      const resolved = new URL(href, base);
      result.push({ href: resolved.href, internal: resolved.origin === base.origin });
    } catch {}
  }
  return result;
}

function jsonLdTypes(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const found = new Set();
  const walk = (value) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) return value.forEach(walk);
    const typeValue = value['@type'];
    if (Array.isArray(typeValue)) typeValue.forEach((item) => found.add(String(item)));
    else if (typeValue) found.add(String(typeValue));
    Object.values(value).forEach(walk);
  };
  for (const match of scripts) {
    try { walk(JSON.parse(match[1])); } catch {}
  }
  return [...found].sort();
}

function makeFinding({ id, category, severity, pass, message, evidence, recommendation, metric }) {
  return {
    id,
    category,
    status: pass ? 'pass' : severity,
    severity: pass ? 'pass' : severity,
    message,
    evidence,
    recommendation: pass ? '' : recommendation,
    metric: metric || ''
  };
}

function scoreCategory(findings, category) {
  const weights = { pass: 1, info: 0.8, warn: 0.45, error: 0 };
  const scoped = findings.filter((finding) => finding.category === category);
  if (!scoped.length) return 100;
  return Math.round((scoped.reduce((sum, finding) => sum + (weights[finding.severity] ?? 0), 0) / scoped.length) * 100);
}

export function analyzeHtml({ html, requestedUrl, finalUrl = requestedUrl, httpStatus = 200, robots = null, sitemap = null }) {
  const title = tagContent(html, 'title');
  const description = metaContent(html, 'description');
  const canonical = linkHref(html, 'canonical');
  const robotsMeta = metaContent(html, 'robots').toLowerCase();
  const h1s = allTagContents(html, 'h1');
  const headings = ['h1', 'h2', 'h3'].flatMap((tag) => allTagContents(html, tag).map((value) => ({ tag, value })));
  const lang = htmlLang(html);
  const viewport = metaContent(html, 'viewport');
  const schemas = jsonLdTypes(html);
  const pageLinks = links(html, finalUrl);
  const wordCount = visibleWordCount(html);
  const ogTitle = metaContent(html, 'og:title');
  const ogDescription = metaContent(html, 'og:description');
  const questionSignals = (html.match(/\?/g) || []).length + allTagContents(html, 'summary').length;
  const faqSchema = schemas.includes('FAQPage');
  const entitySchema = schemas.some((type) => ['Organization', 'LocalBusiness', 'CafeOrCoffeeShop', 'Person', 'Product', 'Service'].includes(type));
  const hasAddress = /<address\b/i.test(html) || schemas.some((type) => ['LocalBusiness', 'CafeOrCoffeeShop'].includes(type));
  const findings = [];

  findings.push(makeFinding({ id: 'http-status', category: 'technical', severity: 'error', pass: httpStatus >= 200 && httpStatus < 400, message: 'Page returns a crawlable HTTP response', evidence: `HTTP ${httpStatus}; final URL ${finalUrl}`, recommendation: 'Return a stable 2xx response for the canonical document or a deliberate redirect.', metric: 'crawl response status' }));
  findings.push(makeFinding({ id: 'title', category: 'content', severity: 'error', pass: title.length > 0, message: 'Page has a title element', evidence: title ? `Title (${title.length} chars): ${title}` : 'No <title> found', recommendation: 'Add a unique, descriptive title for the page.', metric: 'SERP title / query relevance' }));
  findings.push(makeFinding({ id: 'title-length', category: 'content', severity: 'warn', pass: title.length >= 20 && title.length <= 70, message: 'Title length is within the product heuristic range', evidence: `${title.length} characters`, recommendation: 'Review the title for clarity and truncation risk; this is a heuristic, not a ranking rule.', metric: 'snippet presentation / CTR observation' }));
  findings.push(makeFinding({ id: 'description', category: 'content', severity: 'warn', pass: description.length > 0, message: 'Page has a meta description', evidence: description ? `Description (${description.length} chars): ${description}` : 'No meta description found', recommendation: 'Add a useful page-specific description; search engines may still choose another snippet.', metric: 'snippet presentation / CTR observation' }));
  findings.push(makeFinding({ id: 'canonical', category: 'technical', severity: 'error', pass: Boolean(canonical), message: 'Page declares a canonical URL', evidence: canonical || 'No rel=canonical found', recommendation: 'Add one absolute canonical URL that represents this document.', metric: 'canonical / duplicate URL state' }));
  let canonicalAbsolute = false;
  if (canonical) { try { canonicalAbsolute = Boolean(new URL(canonical)); } catch {} }
  findings.push(makeFinding({ id: 'canonical-absolute', category: 'yandex', severity: 'warn', pass: canonicalAbsolute, message: 'Canonical URL is absolute', evidence: canonical || 'Canonical unavailable', recommendation: 'Use an absolute same-site canonical URL and verify that it is indexable.', metric: 'Yandex canonical selection' }));
  findings.push(makeFinding({ id: 'robots-index', category: 'technical', severity: 'error', pass: !robotsMeta.includes('noindex'), message: 'Page is not blocked by a meta robots noindex directive', evidence: robotsMeta || 'No meta robots directive', recommendation: 'Remove noindex if this page is intended to appear in search.', metric: 'indexability state' }));
  findings.push(makeFinding({ id: 'h1', category: 'content', severity: 'error', pass: h1s.length === 1, message: 'Page has exactly one H1 in the SearchProof content model', evidence: `${h1s.length} H1 element(s)${h1s[0] ? `; first: ${h1s[0]}` : ''}`, recommendation: 'Use one clear primary heading for the page intent; multiple H1s are valid HTML but this product flags them for editorial review.', metric: 'content structure review' }));
  findings.push(makeFinding({ id: 'heading-outline', category: 'content', severity: 'warn', pass: headings.length >= 2, message: 'Page exposes a visible heading structure', evidence: `${headings.length} H1-H3 headings detected`, recommendation: 'Structure major sections with descriptive headings.', metric: 'content comprehension / crawl extraction' }));
  findings.push(makeFinding({ id: 'lang', category: 'technical', severity: 'warn', pass: Boolean(lang), message: 'Document declares a language', evidence: lang || 'No html[lang] value found', recommendation: 'Declare the primary document language with html[lang].', metric: 'language targeting consistency' }));
  findings.push(makeFinding({ id: 'viewport', category: 'technical', severity: 'warn', pass: Boolean(viewport), message: 'Page declares a viewport', evidence: viewport || 'No viewport meta found', recommendation: 'Add a responsive viewport declaration for mobile rendering.', metric: 'mobile rendering readiness' }));
  findings.push(makeFinding({ id: 'structured-data', category: 'aeo_geo', severity: 'warn', pass: schemas.length > 0, message: 'Page exposes JSON-LD structured data', evidence: schemas.length ? `Detected types: ${schemas.join(', ')}` : 'No parseable JSON-LD types detected', recommendation: 'Add structured data only when it accurately reflects visible page entities/content.', metric: 'machine-readable entity coverage' }));
  findings.push(makeFinding({ id: 'entity-schema', category: 'aeo_geo', severity: 'warn', pass: entitySchema, message: 'Page exposes a recognizable entity type', evidence: schemas.length ? schemas.join(', ') : 'No recognized entity schema', recommendation: 'Represent the main real-world entity with accurate Schema.org data when applicable.', metric: 'entity extraction readiness' }));
  findings.push(makeFinding({ id: 'answer-structure', category: 'aeo_geo', severity: 'warn', pass: faqSchema || questionSignals >= 2, message: 'Page contains question/answer signals', evidence: `FAQPage schema: ${faqSchema}; question signals: ${questionSignals}`, recommendation: 'Where users genuinely ask recurring questions, provide concise visible answers. Do not add FAQ content only for markup.', metric: 'answer extraction / AI citation observation' }));
  findings.push(makeFinding({ id: 'open-graph', category: 'content', severity: 'info', pass: Boolean(ogTitle && ogDescription), message: 'Page exposes basic Open Graph copy', evidence: `og:title=${Boolean(ogTitle)}, og:description=${Boolean(ogDescription)}`, recommendation: 'Add accurate social preview metadata if social sharing is a meaningful acquisition path.', metric: 'social preview quality' }));
  findings.push(makeFinding({ id: 'internal-links', category: 'yandex', severity: 'warn', pass: pageLinks.some((link) => link.internal), message: 'Page contains crawlable same-origin links', evidence: `${pageLinks.filter((link) => link.internal).length} internal / ${pageLinks.filter((link) => !link.internal).length} external links`, recommendation: 'Expose important pages through ordinary HTML links and keep important content reasonably shallow.', metric: 'crawl discovery / internal link graph' }));
  findings.push(makeFinding({ id: 'content-depth', category: 'content', severity: 'info', pass: wordCount >= 120, message: 'Page contains substantive visible text by the MVP heuristic', evidence: `${wordCount} visible words`, recommendation: 'Ensure the page answers its search intent with useful original content; word count itself is not a ranking target.', metric: 'intent coverage / engagement observation' }));
  findings.push(makeFinding({ id: 'local-entity', category: 'aeo_geo', severity: 'info', pass: entitySchema && hasAddress, message: 'Local/entity context is machine- or human-readable', evidence: `entity schema=${entitySchema}; address signal=${hasAddress}`, recommendation: 'For local businesses, keep name/address/entity facts consistent with the visible page and business profiles.', metric: 'local/entity consistency' }));

  const robotsOk = robots?.status === 200;
  findings.push(makeFinding({ id: 'robots-txt', category: 'yandex', severity: 'warn', pass: robotsOk, message: 'robots.txt is reachable at the site root', evidence: robots ? `HTTP ${robots.status} ${robots.url}` : 'robots.txt was not probed', recommendation: 'Serve a valid robots.txt when crawl directives or sitemap discovery are needed.', metric: 'crawler access contract' }));
  const sitemapOk = sitemap?.status === 200;
  findings.push(makeFinding({ id: 'sitemap', category: 'yandex', severity: 'warn', pass: sitemapOk, message: 'sitemap.xml is reachable at the conventional site-root location', evidence: sitemap ? `HTTP ${sitemap.status} ${sitemap.url}` : 'sitemap.xml was not probed', recommendation: 'Publish and submit a valid Sitemap for significant URLs, especially on larger/deeper sites.', metric: 'sitemap processing / discovered URLs' }));
  const sitemapDeclared = Boolean(robots?.body && /(^|\n)\s*sitemap\s*:/i.test(robots.body));
  findings.push(makeFinding({ id: 'sitemap-declared', category: 'yandex', severity: 'info', pass: sitemapDeclared, message: 'robots.txt declares a Sitemap location', evidence: sitemapDeclared ? 'Sitemap directive found in robots.txt' : 'No Sitemap directive detected', recommendation: 'Reference the Sitemap in robots.txt or submit it directly in Yandex Webmaster.', metric: 'sitemap discovery' }));

  const categories = ['technical', 'content', 'yandex', 'aeo_geo'];
  const scores = Object.fromEntries(categories.map((category) => [category, scoreCategory(findings, category)]));
  scores.overall = Math.round((scores.technical + scores.content + scores.yandex + scores.aeo_geo) / 4);

  return {
    product: { name: 'SearchProof', version: '0.1.0', scoreDisclaimer: 'Heuristic prioritization scores; not search-engine or AI-provider scores.' },
    audit: { requestedUrl, finalUrl, httpStatus, generatedAt: new Date().toISOString() },
    signals: { title, description, canonical, robotsMeta, h1s, headings, lang, viewport, schemas, links: { internal: pageLinks.filter((link) => link.internal).length, external: pageLinks.filter((link) => !link.internal).length }, wordCount },
    scores,
    findings,
    hypothesisTemplate: { finding: '', evidence: '', change: '', baseline: '', targetMetric: '', verificationWindow: '', observedResult: '' }
  };
}
