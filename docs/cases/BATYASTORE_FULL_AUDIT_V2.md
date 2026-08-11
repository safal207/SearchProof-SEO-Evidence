# BatyaStore — Full Evidence-First SEO / Performance / SMM Audit

Target: `https://batyastore.ru/`

Date: 2026-08-11

Prepared with SearchProof as a public read-only market case. The audit separates measured observations, hypotheses, proposed changes and future verification.

## Executive summary

BatyaStore has a substantial e-commerce catalog and a technically viable baseline, but the strongest growth opportunities are not generic meta-tag fixes. The evidence points to four higher-leverage areas:

1. **Product URL / sitemap hygiene** — sampled sitemap product URLs can resolve to a category instead of a unique product document.
2. **Pagination / discovery architecture** — deeper pagination currently canonicalizes to page 1 and deserves Yandex index/discovery verification.
3. **Front-end performance** — Lighthouse lab results are weak, especially on mobile.
4. **Entity + distribution consistency** — business facts and social/content distribution should be normalized into one measurable entity/content system.

This audit does **not** claim ranking, traffic or revenue uplift before an implemented change is observed through Yandex/business data.

---

## 1. SearchProof technical baseline

Final sitemap-aware diagnostic sample:

- 100 HTML pages crawled;
- 42,942 internal-link edges;
- 36,310 page URLs across 7 sitemap documents;
- 0 broken internal links among the sampled crawled targets;
- 0 duplicate-title groups in the 100-page sample;
- 0 canonical mismatches in the ordinary 100-page sample;
- no accepted orphan-like URLs because the crawl was explicitly partial.

SearchProof records `sitemap-coverage-partial` rather than converting an incomplete crawl into false orphan claims.

### Evidence provenance

- full diagnostic run: `31470309293`;
- artifact: `searchproof-batyastore-final-31470309293`;
- artifact ID: `9093126875`;
- SHA-256: `b785bbdf32e39b1fcf5044c7c2258638b292bc06d3e1fc2f224cf593ca3e1b01`.

---

## 2. P0 hypothesis — sitemap product URLs resolving to category

Controlled slice:

`/catalog/bytovaya-tekhnika/pylesosy/vertikalnye-pylesosy/`

The resolved sitemap contains 298 URLs in this category slice.

Three representative product URLs were probed independently:

- Amica Joran VM9001;
- Miele Triflex HX2 Pro;
- Electrolux Clean 600 Pure.

Observed in **3/3 sampled cases**:

`sitemap product URL → request → vertical-vacuums category → category title/H1/canonical`

This is not evidence that all 298 URLs behave the same way. It is evidence strong enough to justify quantifying the whole slice.

### Why it matters

If the pattern is widespread, stale/deactivated product URLs remain in the sitemap even though they no longer represent distinct indexable product documents. That can reduce sitemap precision and create unnecessary crawler revisit/redirect work.

### First action

Measure the full 298-URL slice and classify each URL:

`unique 200 product | exact replacement redirect | category redirect | 404 | 410 | other`

Then align sitemap membership with the intended discontinued-product policy.

### Verification

Use:

- valid/indexable sitemap URL ratio;
- Yandex indexed/excluded URL states;
- discovery coverage;
- query/impression coverage at T+14 and T+30 after one controlled change.

---

## 3. P1 hypothesis — pagination canonical strategy

Observed on the same category:

- clean category: HTTP 200 + self-canonical;
- sort variant: HTTP 200 + canonical to clean category;
- display variant: HTTP 200 + canonical to clean category;
- `?PAGEN_1=2`: HTTP 200 + canonical to page 1.

Sort/display containment may be intentional. Pagination is different because page 2 contains a deeper product slice.

### Experiment question

Does canonicalizing page 2+ to page 1 preserve reliable discovery/indexing of products reachable mainly through deeper pagination in Yandex?

Do not change pagination architecture purely from theory. First measure Yandex discovery/index states for a controlled category.

---

## 4. Lighthouse performance evidence

Reproducible GitHub Actions run:

- workflow: `BatyaStore Lighthouse Evidence`;
- run: `31476601752`;
- environment: Node `22.23.1`, Chrome `150.0.7871.128`, Lighthouse `13.4.1`;
- raw mobile + desktop JSON preserved in the workflow artifact;
- artifact ID: `9095498774`;
- artifact SHA-256: `d78a614835eb863dad17601442992e88a81fcef160e776b18d9f84999baa44d7`.

| Profile | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Mobile | **21** | 75 | 50 | 100 | **12.0 s** | **3,420 ms** | **0.156** |
| Desktop | **38** | 80 | 54 | 100 | **6.3 s** | **430 ms** | **0.027** |

### Interpretation

The Lighthouse SEO category scoring 100 does not mean the overall organic-search system is optimal. It means the audited Lighthouse SEO checks passed in this lab run.

The much stronger issue is performance, particularly mobile rendering/main-thread work. The mobile LCP/TBT values make performance a high-priority engineering investigation.

Lighthouse is a **lab measurement**, not field Core Web Vitals. Repeat runs and real-user/field data should be used before treating any individual number as a stable production KPI.

### Performance workstream

Inspect the raw Lighthouse opportunities and traces for:

- LCP resource and render path;
- image formats/sizing/lazy-loading policy;
- unused and blocking JavaScript;
- third-party scripts;
- long main-thread tasks;
- font loading;
- caching/compression;
- DOM/render complexity.

Then change one bounded performance cause and re-run the same workflow.

Verification chain:

`baseline artifact → change/PR → deployment timestamp → repeat Lighthouse → field observation → conversion observation`

---

## 5. Utility pages and sitemap consistency

Within the 100-page crawl, these accessible pages were not present in the resolved sitemap:

- `/help/delivery/`;
- `/help/payment/`;
- `/help/warranty/`.

This is not automatically an error. If they are intended indexable trust/search documents, their selective omission should be reviewed consistently against other help/company pages.

---

## 6. Entity / trust layer

Public surfaces should make the distinction between these concepts explicit:

- brand: BATYA STORE;
- registered company: ООО «БАТЯ СТОР»;
- registered address;
- customer-facing store/service/pickup location(s);
- support phone/email;
- customer-service hours;
- order-acceptance hours;
- warranty/service contacts;
- verified official social profiles.

Observed public/indexed surfaces contain enough historical variation in addresses, hours and company naming to justify a template/entity consistency crawl rather than assuming all search-visible copies are current.

Recommended machine-readable graph:

`BATYA STORE → ООО БАТЯ СТОР → addresses by role → contact points → hours by role → warranty/service → verified sameAs profiles → products/categories`

This supports classic search, local/business understanding and AEO/GEO entity clarity.

---

## 7. SMM / content distribution opportunity

The site already has a blog and broad commercial inventory. The growth opportunity is to make content distribution measurable rather than treating an article as an endpoint.

Proposed loop:

`search question → guide/comparison → social derivative → VK/Telegram/Dzen/YouTube → category/product → purchase/review → new customer-language topic`

Example content units:

- **BATYA проверяет** — product test → short video → product page;
- **X vs Y** — comparison page → short/poll → compared products;
- **Что купить до N ₽** — budget-intent landing → carousel/clip → curated category;
- **Не переплачивай за…** — informational hook → filtered category;
- **FAQ from reviews** — customer language → answer block + social post → help/product page.

Measurement contract:

`content_id → channel → target URL → UTM → publication time → sessions → assisted conversions → revenue observation → verification window`

Traffic or revenue movement after publication remains observational until stronger attribution evidence exists.

---

## 8. Recommended priority order

### P0 — quantify before changing

1. Measure the 298-URL vertical-vacuum sitemap slice.
2. Define the intended unavailable-product redirect/status policy.
3. Reconcile authoritative company/address/hour semantics across templates and business profiles.

### P1 — controlled experiments

1. Clean stale/non-indexable sitemap entries in one category slice.
2. Verify deeper-pagination discovery in Yandex before changing canonical architecture.
3. Start a bounded mobile-performance optimization using the Lighthouse artifact as baseline.

### P2 — growth system

1. Turn blog topics into search → social → commerce loops.
2. Add verified social profiles to the entity graph and structured data where appropriate.
3. Import Yandex Webmaster observations into SearchProof at T+14/T+30.
4. Record implementation PRs and provider observations next to each hypothesis.

---

## 9. Why this is an evidence-first SEO case

The audit process also found limitations in the auditing tool itself. Before accepting BatyaStore findings, SearchProof was corrected for:

- recursive sitemap-index handling;
- page-limit sitemap coverage;
- depth-limit sitemap coverage.

That matters because a measurement system should be tested before client-facing conclusions are trusted.

The final model is:

`site → measured evidence → measurement integrity check → hypothesis → one bounded change → Yandex/Lighthouse/business observation → re-check`

No artificial traffic, ranking, CTR or revenue uplift is claimed.
