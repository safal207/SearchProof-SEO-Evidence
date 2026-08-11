# BatyaStore — evidence-first external market audit

Target: `https://batyastore.ru/`

Date: 2026-08-11

This case is a public, read-only audit of a Russian e-commerce site. SearchProof did not change the target. The purpose is to separate observed technical evidence from SEO hypotheses and from future provider-side outcomes.

## Measurement integrity first

BatyaStore exposed two limitations in SearchProof before the tool was allowed to judge the site:

1. the target uses a sitemap index; the original crawler treated child sitemap URLs as page URLs;
2. a capped diagnostic crawl cannot honestly label all sitemap URLs outside its sample as orphan-like.

Both measurement-layer problems were fixed with deterministic regression tests before client-facing conclusions were accepted.

Relevant SearchProof changes:

- PR #11 — recursive same-origin sitemap-index resolution;
- PR #12 — partial-crawl sitemap coverage guard.

This is intentional: a finding is rejected when the measurement layer cannot support it.

## Corrected site baseline

A sitemap-aware diagnostic crawl of 100 pages resolved the complete sitemap tree first.

Observed:

- 100 HTML pages in the crawl sample;
- 42,940 internal-link edges;
- 36,310 page URLs across 7 sitemap documents;
- 0 broken internal links among the crawled targets;
- 0 duplicate title groups in the 100-page sample;
- 0 canonical mismatches in the 100-page sample.

The crawl is intentionally capped, so absence of the remaining sitemap URLs from this crawl is **not** treated as proof of orphan pages.

### Sitemap sources

The resolved sitemap tree contains the root index plus six child URL sets, including large product/catalog sitemaps. This confirms that sitemap coverage must be evaluated against page URLs, not the child `.xml` documents.

## Accepted hypothesis 1 — sitemap product URLs that resolve to a category

A controlled slice was created around:

`/catalog/bytovaya-tekhnika/pylesosy/vertikalnye-pylesosy/`

The sitemap contains 298 URLs in this category slice.

Three representative product URLs from that slice were probed independently. In all three sampled cases, the requested product URL ended at the vertical-vacuums category page and exposed the category title, H1 and canonical instead of a distinct product document.

Sampled products:

- Amica Joran VM9001;
- Miele Triflex HX2 Pro;
- Electrolux Clean 600 Pure.

### Interpretation

This is **3/3 in the sample**, not a claim that all 298 URLs behave this way.

If the pattern is widespread, the sitemap may contain stale/deactivated product URLs that no longer represent unique indexable documents. That would reduce sitemap precision and create avoidable redirect/revisit work for crawlers.

### Next verification

Quantify the status/redirect distribution across the category sitemap slice and classify the intended business policy for unavailable products:

- keep a useful product page;
- redirect to an exact replacement when one exists;
- return 404/410 where appropriate;
- redirect to category only when that is intentionally the best destination.

If redirected/non-canonical URLs are not meant to be indexed, they should not remain in the sitemap.

Suggested provider metrics: Yandex Webmaster URL states, indexed/excluded counts, crawl observations, and later query/impression coverage. No ranking uplift is claimed here.

## Accepted hypothesis 2 — pagination canonical strategy

Observed on the same category:

- clean category URL returns HTTP 200 and self-canonical;
- `?sort=NAME&order=asc` returns HTTP 200 and canonicals to the clean category;
- `?display=list` returns HTTP 200 and canonicals to the clean category;
- `?PAGEN_1=2` also returns HTTP 200 with the same title/H1/description and canonicals to page 1.

The sort/display containment may be intentional and useful. Pagination deserves a separate review because page 2 represents a different product slice while declaring page 1 as canonical.

### Experiment question

Does the current pagination/canonical strategy preserve reliable discovery and indexing of deeper product URLs in Yandex?

### Measurement plan

1. choose the vertical-vacuums category as a controlled slice;
2. record Yandex baseline for category + deeper product URLs;
3. inspect crawl/index state and query coverage;
4. change pagination/indexability architecture only if evidence supports it;
5. re-check at T+14 and T+30.

## Accepted hypothesis 3 — selective sitemap omission of utility pages

Within the 100-page crawl, these self-canonical pages were discovered but absent from the resolved sitemap:

- `/help/delivery/`
- `/help/payment/`
- `/help/warranty/`

Related utility/company pages such as return, contacts and company pages are represented in the sitemap.

This is not automatically an error. It is a configuration-consistency question: if delivery/payment/warranty are intentionally indexable and useful search documents, their selective omission should be reviewed.

## Faceted/parameter surface — observation, not defect

The large catalog exposes many parameterized internal targets for sorting, display modes and pagination. In the tested category, sort and display variants canonicalize to the clean category URL.

Therefore SearchProof does **not** label the mere existence of these parameters as a defect. A future crawl-budget/faceted-navigation analysis should distinguish useful search-demand landing pages from technical combinations.

## Proposed first controlled SEO experiment

**Slice:** Vertical Vacuums.

**Baseline:** current category metadata, pagination/canonical behavior, sitemap membership, product URL state, and Yandex provider observations.

**Priority change:** first remove/resolve stale sitemap product entries after quantifying the pattern; then evaluate pagination architecture as a separate change. Do not bundle both into one experiment.

**Verification chain:**

`finding → evidence → one change → deployment date → Yandex observation → T+14 → T+30`

Suggested outcome metrics:

- valid/indexable sitemap URL ratio;
- Yandex indexed/excluded URL states;
- discovery/index coverage of deeper products;
- impressions and query coverage for the category slice;
- CTR only where impressions are sufficient;
- conversions only as a downstream business observation, not proof of SEO causality by itself.

## Integrity statement

SearchProof findings are deterministic technical observations and heuristics. This case does not claim that any proposed change will improve rankings, traffic, CTR, revenue or AI-search visibility. Those outcomes require provider-side measurement after an implemented change.
