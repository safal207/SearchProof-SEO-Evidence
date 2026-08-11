# SearchProof × RESONANCE — dogfood verification case

**Target:** https://safal207.github.io/RESONANCE/  
**Date:** 2026-08-11  
**Scope:** bounded same-origin crawl, max 50 pages / depth 3

This case documents SearchProof auditing a live evidence-first publication, finding a real site-level canonicalization issue, then exposing a sitemap-discovery defect in SearchProof itself. Both defects were fixed and the live target was re-audited.

## Integrity boundary

This is evidence of technical crawl-state changes within SearchProof's deterministic heuristic scope. It is **not** evidence of improved rankings, traffic, CTR, indexing, AI citations or causal business impact.

## 1. Baseline

Live SearchProof crawl before the journal fix:

| Metric | Baseline |
|---|---:|
| Pages crawled | 15 |
| HTML pages | 15 |
| Internal edges | 78 |
| Sitemap URLs detected | 0 |
| Broken internal links | 0 |
| Duplicate title groups | 1 |
| Canonical mismatches | 1 |
| Orphan-like sitemap URLs | 0 |

The duplicate evidence resolved to the same pair of URLs:

- `https://safal207.github.io/RESONANCE/`
- `https://safal207.github.io/RESONANCE/index.html`

The two URLs exposed the same title, primary H1 and meta description. `/RESONANCE/index.html` declared `/RESONANCE/` as canonical, so the canonical itself was correct but internal navigation was still exposing the alias.

Baseline workflow: https://github.com/safal207/SearchProof-SEO-Evidence/actions/runs/31459036854

## 2. Site diagnosis and fix

**Diagnosis:** RESONANCE's generated SEO layer preserved internal `index.html` links. SearchProof therefore crawled both the canonical project root and the HTML alias.

**Fix:** the RESONANCE SEO build now rewrites internal home links to the canonical `./` URL. Its SEO contract also fails if a future deployed page reintroduces `index.html` as an internal navigation target.

RESONANCE fix PR: https://github.com/safal207/RESONANCE/pull/4

### Re-check after the site fix

| Metric | Baseline | After site fix |
|---|---:|---:|
| Pages crawled | 15 | 15 |
| Internal edges | 78 | 74 |
| Broken internal links | 0 | 0 |
| Duplicate title groups | 1 | **0** |
| Canonical mismatches | 1 | **0** |
| Duplicate H1 groups | 1 | **0** |
| Duplicate description groups | 1 | **0** |

At this point SearchProof reported no site-level findings within the crawl scope, but still reported `Sitemap URLs: 0`.

Re-check workflow: https://github.com/safal207/SearchProof-SEO-Evidence/actions/runs/31459126586

## 3. Dogfood found a SearchProof defect

RESONANCE was publishing a valid sitemap at:

`https://safal207.github.io/RESONANCE/sitemap.xml`

But SearchProof was requesting:

`https://safal207.github.io/sitemap.xml`

which returned 404.

**Root cause:** sitemap discovery was derived only from the hostname origin. That assumption fails for GitHub Pages project sites and other applications hosted under a path prefix.

## 4. SearchProof fix

SearchProof now:

1. tries `sitemap.xml` relative to the normalized start URL;
2. falls back to the origin-root `/sitemap.xml`;
3. keeps same-origin filtering for sitemap entries;
4. has a deterministic regression test for a `/project/` site whose scoped sitemap exists while the origin-root sitemap is missing.

SearchProof fix PR: https://github.com/safal207/SearchProof-SEO-Evidence/pull/7

The full SearchProof CI suite passed before merge.

## 5. Verified final state

The final live audit used SearchProof after the sitemap fix against RESONANCE after the canonical-home-link fix.

| Metric | Final observed state |
|---|---:|
| Pages crawled | 15 |
| HTML pages | 15 |
| Internal edges | 74 |
| Sitemap URLs detected | **15** |
| Sitemap HTTP status | **200** |
| Broken internal links | **0** |
| Duplicate title groups | **0** |
| Canonical mismatches | **0** |
| Duplicate H1 groups | **0** |
| Duplicate description groups | **0** |
| Orphan-like sitemap URLs | **0** |
| Crawled HTML missing from sitemap | **0** |
| SearchProof findings | **0** |

Selected sitemap:

`https://safal207.github.io/RESONANCE/sitemap.xml`

Verified workflow run: https://github.com/safal207/SearchProof-SEO-Evidence/actions/runs/31459660734

Evidence artifact from that run: `resonance-searchproof-verified-31459660734` (artifact ID `9089324157`, 14-day workflow retention at creation).

## 6. What this case demonstrates

The useful signal is not that SearchProof returned a clean report. The useful signal is the trajectory:

`live crawl → evidence → diagnosis → site fix → re-crawl → tool defect → tool fix → regression test → live re-verification`

The auditor was allowed to invalidate its own earlier observation. That is intentional: an evidence-first SEO workflow should distinguish a target defect from a measurement defect rather than forcing every finding to become a client recommendation.

## Reproducibility note

Workflow artifacts are retained for a limited period, while the linked GitHub pull requests and workflow-run records provide the durable change history. SearchProof findings remain deterministic heuristics within the configured crawl scope and should be combined with provider observations (for example Yandex Webmaster) before making claims about search performance.
