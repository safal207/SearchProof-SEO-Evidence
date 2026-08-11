# BatyaStore — external market audit baseline

Target: https://batyastore.ru/

This is a public, read-only SearchProof audit prepared as an evidence-first market case. No changes were made to the target site.

## First crawl observations

A 100-page crawl completed on 2026-08-11 using SearchProof with `maxPages=100` and `maxDepth=3`.

Observed within that crawl scope:

- 100 pages crawled / 100 HTML pages
- 42,940 internal-link edges
- 0 broken internal links among crawled targets
- 0 duplicate title groups
- 0 canonical mismatches

The initial run reported `sitemapUrls=6`, `sitemap-orphan-like=6`, and `crawl-not-in-sitemap=100`. Those sitemap-related findings are **not accepted as client defects** because the target exposes a sitemap index and the current SearchProof release does not yet recursively resolve child sitemaps. The measurement layer must be fixed and the target re-audited before any sitemap conclusion is made.

## Integrity rule

Observed crawl facts are kept separate from hypotheses. SearchProof heuristics are not ranking guarantees, and no claim is made here about Yandex rankings, traffic, CTR, conversions, or causal SEO uplift.

## Next verification step

1. add recursive same-origin sitemap-index support to SearchProof;
2. regression-test child sitemap resolution;
3. rerun the same external target;
4. use the corrected evidence report to rank 3–5 testable SEO hypotheses;
5. for any implemented change, measure provider-side outcomes separately (e.g. Yandex Webmaster / analytics) at defined checkpoints.
