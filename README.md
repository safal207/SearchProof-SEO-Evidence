# SearchProof — SEO Evidence

**SearchProof** is an evidence-first SEO / AEO / GEO audit product.

Instead of producing a long checklist of generic recommendations, SearchProof turns each finding into a verifiable optimization hypothesis:

`URL → finding → evidence → change → metric → verification`

The project is designed for technical SEO, Yandex-oriented site quality work, and AI-search readiness (AEO/GEO) without inventing ranking or traffic results.

## Why this exists

SEO work is often hard to verify after the fact. Recommendations get mixed with implementation, measurement windows are unclear, and reported uplift can be difficult to attribute.

SearchProof keeps the audit and the evidence together:

- crawl/indexability checks;
- title, description, canonical, robots and sitemap checks;
- heading and content-structure checks;
- structured-data discovery;
- internal-link and language signals;
- local-business / entity signals;
- AEO/GEO heuristics for answerable, citeable content;
- an evidence record for every finding;
- a hypothesis board for `baseline → change → observed result`.

## MVP

### 1. Audit a URL

```bash
npm install
npm run audit -- https://example.com
```

The CLI writes a JSON report into `reports/`.

### 2. Open the dashboard

```bash
npm run serve
```

Then open `http://localhost:8080`.

The dashboard can display the included example report and explains how SearchProof scores Technical SEO, Content, Yandex Readiness and AEO/GEO Readiness.

## Score philosophy

SearchProof scores are **product heuristics**, not scores published by Yandex, Google, OpenAI or any other search/AI provider. A score is only a compact way to prioritize evidence-backed checks.

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
```

Example:

```text
Finding: Missing canonical URL
Evidence: No <link rel="canonical"> found in fetched HTML
Recommendation: Add one absolute canonical URL for this document
Metric: indexed canonical / duplicate URL state
```

## Current checks

- HTTP status and redirect endpoint
- `<title>` presence and length heuristic
- meta description presence and length heuristic
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

Official references used to shape the MVP:

- Yandex Webmaster — Canonical URLs
- Yandex Webmaster — Using the Sitemap file
- Yandex Webmaster — Site structure / crawlable links
- Schema.org — LocalBusiness

## AEO / GEO readiness

The current AEO/GEO layer is deliberately conservative. It checks whether a page exposes machine-readable entities and human-readable answer structures such as FAQ/question sections. It does **not** claim guaranteed inclusion or citation by ChatGPT, Gemini, Perplexity or other AI systems.

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
- [ ] same-origin crawl queue
- [ ] duplicate title/H1 detection
- [ ] orphan-page evidence
- [ ] canonical graph
- [ ] internal-link graph

### v0.3 — Search experiment board
- [ ] baseline snapshots
- [ ] hypothesis lifecycle
- [ ] Yandex Webmaster metric import
- [ ] before/after comparison

### v0.4 — AI Search
- [ ] entity coverage
- [ ] answer-block extraction
- [ ] citation-readiness evidence
- [ ] provider-specific visibility observations

## Integrity rule

**Observed data and inferred recommendations must never be mixed.**

If SearchProof did not measure a ranking, impression, click or AI citation, it must not claim it.

---

Created by [Aleksey Safonov](https://github.com/safal207) as an applied technical SEO / AI-search product and public portfolio case.
