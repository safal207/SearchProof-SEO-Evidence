# SearchProof — SEO Evidence

**SearchProof** is an evidence-first SEO / AEO / GEO audit and experiment product.

Instead of producing a generic checklist, SearchProof keeps the verification chain explicit:

`URL → finding → evidence → change → metric → verification`

For site-level work:

`site → crawl graph → affected URLs → finding → change → metric → re-crawl / provider observation`

For SEO experiments:

`baseline → hypothesis → implementation evidence → verification window → provider observation → observed delta`

**Observed delta is not causal attribution.** SearchProof never turns before/after movement into a guaranteed SEO uplift claim.

## Why this exists

SEO work is often difficult to verify after the fact: recommendations get mixed with implementation, measurement windows are unclear, and reported uplift can be hard to attribute.

SearchProof keeps the audit, implementation evidence and measurement contract together.

## Quick start

### Audit one URL

```bash
npm install
npm run audit -- https://example.com/page
```

### Crawl a site

```bash
npm run crawl -- https://example.com --max-pages=50 --max-depth=3
```

The crawler is bounded, same-origin and evidence-first. It records exact internal-link edges, observed HTTP status, duplicate clusters, canonical mismatches and sitemap-vs-crawl gaps.

### Run SearchProof from GitHub — no local setup

Open the repository in GitHub and use:

`Actions → SearchProof Remote Audit → Run workflow`

Inputs:

- `target_url` — public `http(s)` page or site;
- `mode` — `page` for one-page audit or `site` for a bounded crawl;
- `max_pages` — site mode only, `1..200`;
- `max_depth` — site mode only, `0..6`.

The workflow:

1. validates that the target is a public web URL;
2. rejects localhost, private, loopback and link-local targets;
3. runs the same SearchProof Node audit/crawler used locally;
4. renders the main evidence into the GitHub Actions **Job summary**;
5. uploads the complete JSON report plus `github-summary.md` as a 14-day workflow artifact.

This makes a SearchProof audit independently reproducible from the GitHub UI without cloning the project or installing Node locally.

### Import Yandex Webmaster observations

```bash
YANDEX_TOKEN=... \
YANDEX_USER_ID=... \
YANDEX_HOST_ID=... \
npm run yandex:observe -- --date-from=2026-08-01 --date-to=2026-08-07
```

The token is sent only in the `Authorization` header and is never persisted in generated observation JSON.

Current provider metrics:

- `TOTAL_SHOWS`
- `TOTAL_CLICKS`
- `AVG_SHOW_POSITION`
- `AVG_CLICK_POSITION`

See [`docs/YANDEX_WEBMASTER.md`](docs/YANDEX_WEBMASTER.md) for endpoint and transformation details.

### Open the dashboard

```bash
npm run serve
```

Then open `http://localhost:8080`.

The browser is a report and experiment surface. Crawling and provider imports run from Node rather than pretending browser CORS can crawl or authenticate arbitrary external systems.

## Experiment model

SearchProof v0.3 adds a small lifecycle model:

- `planned` — hypothesis exists but the implementation is not recorded;
- `implemented` — an exact change and optional PR/evidence URL are recorded;
- `measuring` — provider observations are being collected;
- `observed` — the verification window has produced reviewable observations;
- `closed` — the experiment is complete or intentionally stopped.

Every experiment can keep:

```text
id
targetUrl
hypothesis
baseline
change.description
change.appliedAt
change.evidenceUrl
verification.metrics
verification.windowDays
observations[]
integrity.causalClaim = false
```

`compareObservedMetric()` returns a numeric delta only when both baseline and an observation exist. Its interpretation is explicitly `observed-delta-not-causal-attribution`.

## Site crawl evidence

Current site-level findings include:

- broken internal links whose failing response was actually fetched;
- missing titles;
- duplicate title groups;
- missing H1 pages;
- duplicate H1 groups;
- duplicate meta description groups;
- canonical mismatches (`crawled URL != declared canonical`);
- sitemap URLs not discovered through the bounded crawl graph;
- crawlable HTML pages missing from the conventional sitemap.

A canonical mismatch is a review signal, not automatically an error. A sitemap URL undiscovered by a bounded crawl is only an **orphan-like candidate**, not proof of a true orphan page.

## Page audit evidence

The single-page layer currently checks:

- HTTP status and redirect endpoint;
- `<title>` presence and length heuristic;
- meta description presence;
- canonical presence and absolute URL;
- robots meta indexability signal;
- H1 and heading structure;
- `lang` and viewport;
- JSON-LD / entity discovery;
- Open Graph basics;
- internal/external links;
- visible-content heuristic;
- FAQ / answer signals;
- LocalBusiness / Organization entity signals;
- robots.txt and sitemap.xml discovery.

Page scores are **SearchProof product heuristics**, not scores published by Yandex, Google, OpenAI or another provider.

## Yandex evidence contract

The v0.3 adapter uses the official Yandex Webmaster API for search-query observations. SearchProof stores the provider series and a documented transformation rather than presenting the result as an internal Yandex score.

For all-query history:

- shows and clicks are summed over the requested period;
- average show position is weighted by same-day shows when available;
- average click position is weighted by same-day clicks when available;
- original daily series is preserved next to the transformed metrics.

The provider observation tells us **what changed in measured data**. It does not prove **why it changed**.

## First public case

The first public applied case is **Roby's Coffee House**:

- Site: https://safal207.github.io/robys-coffee-house-demo/
- Source: https://github.com/safal207/robys-coffee-house-demo
- SEO case PR: https://github.com/safal207/robys-coffee-house-demo/pull/327

The case deliberately separates implemented SEO changes from future measurements. Position, impressions, clicks, CTR and traffic uplift are not claimed until actually observed.

## Verification

```bash
npm run verify
```

The deterministic suite covers:

- page-audit contracts;
- crawler graph behavior;
- 404 internal targets;
- duplicate title/H1/description groups;
- missing title/H1;
- alternate canonical;
- sitemap-only and crawl-only URLs;
- experiment lifecycle;
- non-causal before/after comparison;
- Yandex API URL construction and metric normalization;
- public-target safety rules for GitHub remote audits;
- public dashboard integrity.

Live network work stays outside deterministic CI unless explicitly triggered.

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
- [x] baseline snapshots
- [x] hypothesis lifecycle
- [x] Yandex Webmaster observation adapter
- [x] before/after observational comparison
- [x] recruiter-facing experiment dashboard
- [x] provider-token non-persistence rule

### v0.3.1 — Bilingual mobile dashboard
- [x] RU / EN public dashboard
- [x] persistent language preference
- [x] mobile-first Experiment Board
- [x] responsive touch and safe-area improvements

### v0.3.2 — GitHub Remote Audit
- [x] manual `workflow_dispatch` URL input
- [x] page / site mode
- [x] public-target safety validation
- [x] GitHub Job summary
- [x] downloadable JSON evidence artifact

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
