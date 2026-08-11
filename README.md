# SearchProof — SEO Evidence

**SearchProof** is an evidence-first SEO / AEO / GEO audit product.

Instead of producing a long checklist of generic recommendations, SearchProof turns each finding into a verifiable optimization hypothesis:

`URL → finding → evidence → change → metric → verification`

For site-level work the model becomes:

`site → crawl graph → affected URLs → finding → change → metric → re-crawl / provider observation`

The project is designed for technical SEO, Yandex-oriented site quality work, and AI-search readiness (AEO/GEO) without inventing ranking or traffic results.

## Why this exists

SEO work is often hard to verify after the fact. Recommendations get mixed with implementation, measurement windows are unclear, and reported uplift can be difficult to attribute.

SearchProof keeps the audit and the evidence together:

- crawl/indexability checks;
- title, description, canonical, robots and sitemap checks;
- heading and content-structure checks;
- structured-data discovery;
- same-origin site crawl and internal-link graph;
- broken internal-link evidence;
- duplicate title, H1 and description groups;
- sitemap-vs-crawl discovery gaps;
- canonical mismatch evidence;
- local-business / entity signals;
- AEO/GEO heuristics for answerable, citeable content;
- an evidence record for every finding;
- a hypothesis board for `baseline → change → observed result`.

## MVP

### 1. Audit one URL

```bash
npm install
npm run audit -- https://example.com/page
```

This produces the single-page SEO / Yandex / AEO-GEO evidence report.

### 2. Crawl a site

```bash
npm run crawl -- https://example.com --max-pages=50 --max-depth=3
```

The crawler:

- follows only `http(s)` same-origin links;
- removes URL fragments before graph comparison;
- uses a bounded BFS queue;
- records page HTTP status, title, description, H1 and canonical;
- builds a deduplicated internal-link graph;
- compares crawl discovery with the conventional `/sitemap.xml`;
- reports only broken links whose target response was actually fetched;
- labels sitemap-only URLs as **orphan-like**, not proven orphans.

Both CLIs write timestamped JSON reports into `reports/`.

### 3. Open the dashboard

```bash
npm run serve
```

Then open `http://localhost:8080`.

The browser dashboard is deliberately a report viewer / product surface. The actual web crawl runs from Node so the UI does not pretend browser CORS can crawl arbitrary sites.

## Site crawl evidence

Current site-level findings include:

- broken internal links with observed response status;
- missing titles;
- duplicate title groups;
- missing H1 pages;
- duplicate H1 groups;
- duplicate meta description groups;
- canonical mismatches (`crawled URL != declared canonical`);
- sitemap URLs not discovered through the crawled internal-link graph;
- crawlable HTML pages missing from the conventional sitemap.

A canonical mismatch is a **review signal**, not automatically an error: alternate canonicals can be intentional. Likewise, a sitemap URL that was not discovered in a bounded crawl is only an orphan-like candidate until broader evidence confirms it.

## Score philosophy

SearchProof page scores are **product heuristics**, not scores published by Yandex, Google, OpenAI or any other search/AI provider. A score is only a compact way to prioritize evidence-backed checks.

The site crawler intentionally emphasizes counts, affected URLs and graph evidence rather than inventing a search-engine score.

The product never claims that adding a specific tag or schema field will increase rankings. Search engines ultimately decide crawling, indexing and ranking.

## First public case

The first public case is **Roby's Coffee House**, a live multilingual service website:

- Site: https://safal207.github.io/robys-coffee-house-demo/
- Source: https://github.com/safal207/robys-coffee-house-demo
- SEO case PR: https://github.com/safal207/robys-coffee-house-demo/pull/327

That case intentionally separates implemented SEO changes from future measurements. Position, impression, CTR and traffic uplift are not claimed until observed.

## Product model

Every finding has:

```text
id
category
severity
status
message
evidence
recommendation
metric
affectedUrls
```

Example:

```text
Finding: Broken internal links
Evidence: 3 internal link edges returned HTTP 404
Affected URLs: /old-menu, /coffee/cappuccino, /delivery
Recommendation: Fix the target response or update/remove the link
Metric: internal link HTTP status after re-crawl
```

## Current page checks

- HTTP status and redirect endpoint
- `<title>` presence and length heuristic
- meta description presence
- canonical presence and absolute URL
- robots meta indexability signal
- H1 count
- heading outline presence
- `lang` declaration
- viewport declaration
- JSON-LD discovery and schema types
- Open Graph basics
- internal/external link counts
- visible text word-count heuristic
- FAQ / question-answer signal
- LocalBusiness / Organization entity signal
- robots.txt availability
- sitemap.xml availability
- sitemap declaration in robots.txt

## Yandex-oriented evidence

SearchProof checks foundational signals that matter for crawl/index work in Yandex, including canonical URLs, crawlable internal links, robots.txt and Sitemap discovery. It does **not** pretend to reproduce Yandex ranking algorithms.

The crawler adds a concrete internal-link graph and sitemap discovery comparison so the recommendation can point to exact affected URLs instead of a generic checklist item.

## AEO / GEO readiness

The current AEO/GEO layer is deliberately conservative. It checks whether a page exposes machine-readable entities and human-readable answer structures such as FAQ/question sections. It does **not** claim guaranteed inclusion or citation by ChatGPT, Gemini, Perplexity or other AI systems.

## Verification

```bash
npm run verify
```

The deterministic test suite includes a synthetic site with intentional:

- 404 internal target;
- duplicate title/H1/description;
- missing title/H1;
- alternate canonical;
- sitemap-only URL;
- crawled page absent from sitemap.

This keeps crawler behavior reviewable without depending on live network state.

## Roadmap

### v0.1 — Evidence-first single-page audit
- [x] URL fetch
- [x] deterministic HTML checks
- [x] robots/sitemap probes
- [x] category scores
- [x] JSON evidence report
- [x] static dashboard
- [x] CI smoke test

### v0.2 — Site crawl
- [x] bounded same-origin crawl queue
- [x] duplicate title/H1/description detection
- [x] orphan-like sitemap evidence
- [x] canonical mismatch evidence
- [x] internal-link graph
- [x] broken internal-link status evidence
- [x] deterministic crawler regression tests

### v0.3 — Search experiment board
- [ ] baseline snapshots
- [ ] hypothesis lifecycle
- [ ] Yandex Webmaster metric import
- [ ] before/after comparison

### v0.4 — AI Search
- [ ] entity coverage across the site graph
- [ ] answer-block extraction
- [ ] citation-readiness evidence
- [ ] provider-specific visibility observations

## Integrity rule

**Observed data and inferred recommendations must never be mixed.**

If SearchProof did not measure a ranking, impression, click or AI citation, it must not claim it.

---

Created by [Aleksey Safonov](https://github.com/safal207) as an applied technical SEO / AI-search product and public portfolio case.
