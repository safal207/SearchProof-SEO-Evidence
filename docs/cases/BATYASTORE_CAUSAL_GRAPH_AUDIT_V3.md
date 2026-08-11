# BatyaStore — Causal Graph / Temporal SEO Audit v3.1

Target: `https://batyastore.ru/`

Date: 2026-08-11

This case extends a static SEO audit into a state-transition audit:

`state(t) → transition → resulting state → field conflict → cause hypothesis → bounded change → time/provider verification`

The objective is not to maximize the number of findings. It is to locate the smallest upstream inconsistency that can explain many downstream symptoms.

---

## 1. Audit model: a URL is a state vector

For this case SearchProof models a URL/entity as:

`S(t) = { sitemap membership, HTTP state, final URL, canonical, internal-link reachability, taxonomy, product identity, content identity, observed time }`

Observed edges include:

- `sitemap --declares--> URL`;
- `URL --redirects/transitions_to--> final URL`;
- `final URL --canonicalizes_to--> preferred URL`;
- `category --exposes_product--> product URL`;
- `state(t1) --changes_to--> state(t2)`.

The highest-value pattern is a **field conflict**: different system signals describe the same entity differently.

The strongest BatyaStore example is:

`sitemap field: “this product URL is current”`

`HTTP field: “this URL transitions to an ancestor category”`

`sampled internal graph: “this redirecting URL is not referenced here”`

`time field: “some non-terminal product URLs were newly emitted into the sitemap during this audit”`

That is more informative than the generic label “redirect issue”.

---

## 2. Reproducible evidence

### Causal graph v1 — discovery run

- workflow run: `31480469700`;
- job: `93743998912`;
- result: success;
- artifact: `batyastore-causal-graph-31480469700`;
- artifact ID: `9097081374`;
- SHA-256: `3507bcc97510dadf5ae1be479eb682a804552d44ad8539639493979c98bf265f`.

Its fresh bounded crawl recorded:

- 200 HTML pages;
- 86,684 internal-link edges;
- 36,309 sitemap URLs;
- 0 broken internal links in the bounded crawl;
- 0 duplicate-title groups in the ordinary 200-page crawl;
- 0 canonical mismatches in that ordinary bounded crawl;
- partial sitemap coverage explicitly recorded.

The v1 focus classifier undercounted nested ancestor-category redirects. Its raw evidence was retained, but the workflow itself was retired after the corrected v2 passed.

### Causal graph v2 — corrected transition classifier

- workflow: `BatyaStore Causal Graph Audit v2`;
- run: `31481511256`;
- job: `93747282308`;
- result: success;
- artifact: `batyastore-causal-v2-31481511256`;
- artifact ID: `9097400615`;
- SHA-256: `eb4b0a9c02bbbded25c2694cf6d5c5dd3b1e4d772dbc044167e9e68165de989e`.

### Temporal / identity run

- workflow: `BatyaStore Temporal + Identity Audit`;
- run: `31481008168`;
- job: `93745689884`;
- result: success;
- artifact: `batyastore-temporal-identity-31481008168`;
- artifact ID: `9097199170`;
- SHA-256: `48689227c07bc01f7e94b1f8eccb9c1bd6c716a006ae0d651fa626b5e4047c72`.

---

## 3. P0 — product-state synchronization

Focused taxonomy prefix:

`/catalog/bytovaya-tekhnika/pylesosy/vertikalnye-pylesosy/`

Current sitemap prefix size: **298 URLs**, including the category itself.

Corrected v2 state distribution:

| State | URLs |
|---|---:|
| `unique_200_candidate` | 194 |
| `ancestor_category_redirect` | **103** |
| `category_200` | 1 |

No 404 or 410 state was observed in this focused slice.

### 103 URLs share one transition family

All 103 ancestor-category transitions follow:

`declared sitemap URL → 302 → ancestor category → 200`

Destinations:

- 93 → main vertical-vacuums category;
- 10 → nested `vertikalnye-moyushchie-pylesosy` category.

This is **not** a claim that 34.6% of the whole site/catalog is broken. It is the current distribution inside one deliberately focused sitemap prefix.

### Sitemap graph vs internal-navigation graph

Post-analysis of the fresh 200-page SearchProof graph found **zero internal-link edges targeting those 103 redirecting sitemap URLs**.

The strongest proven interpretation is therefore:

**the sitemap contains a shadow/residual product-state graph that is not represented in the sampled live internal-navigation graph.**

That supports a sitemap/product-state synchronization finding. It does **not** prove direct customer-path or conversion loss without analytics.

### Candidate invariant

For a sitemap URL intended to represent an indexable product:

`in sitemap → terminal intended product state`

or a clearly documented alternative state policy.

---

## 4. Time axis — the sitemap changed while the audit was running

Two independent SearchProof snapshots were compared.

Earlier snapshot:

- around `2026-08-11T07:47:21Z`;
- 36,310 sitemap URLs.

Fresh snapshot:

- around `2026-08-11T10:05:48Z`;
- 36,309 sitemap URLs.

Exact set difference:

- 18 URLs removed;
- 17 URLs added;
- 17 removed/added pairs have the same product slug but moved from:

`/catalog/tovary-dlya-doma/novogodnie-tovary/<slug>/`

into:

`/catalog/tovary-dlya-doma/interer/<same-slug>/`.

The old `novogodnie-tovary/` category itself disappeared from sitemap, producing the net `-1` difference.

This is a real `taxonomy(t1) → taxonomy(t2)` transition observed during the audit.

---

## 5. P0 temporal finding — exact migration exists, but the new product state is non-terminal

The temporal workflow traced all 17 moved slugs.

Every one follows the same chain:

`old product URL`

`→ 301 exact new /interer/<same-slug>/ URL`

`→ 302 /interer/ category`

`→ 200 category`

So the migration layer knows the exact same-product destination, but the new product URL immediately transitions away from product state.

The old category itself follows:

`/novogodnie-tovary/ → 301 → /catalog/tovary-dlya-doma/ → 200`.

The new `/interer/` category is 200/self-canonical.

### Cause hypothesis

The evidence is consistent with two state layers interacting:

1. taxonomy migration preserves exact product identity;
2. current product availability/deactivation behavior sends the new product URL to an ancestor category.

This does not prove CMS internals. It does prove a synchronization question:

`new sitemap membership ↔ live terminal product state`

The time signal matters: those 17 `/interer/` product URLs were newly emitted into the current sitemap, yet already resolve away from product state. This cannot be explained only as very old sitemap residue.

---

## 6. P1 — pagination has a stable field conflict even while product composition changes

Corrected causal v2 observed the first four category pages at `2026-08-11T10:17:04Z`.

Direct product-card links at that snapshot:

| Page | HTTP | Canonical | Direct product cards | Overlap with page 1 | New vs page 1 |
|---:|---:|---|---:|---:|---:|
| 1 | 200 | page 1 | 30 | 30 | 0 |
| 2 | 200 | page 1 | 29 | 0 | 29 |
| 3 | 200 | page 1 | 28 | 0 | 28 |
| 4 | 200 | page 1 | 33 | 0 | 33 |

Across pages 1–4 the v2 snapshot exposed **120 unique direct product-card URLs**. Their union equals the sum of page counts, so the four page sets did not overlap in that snapshot.

An earlier causal snapshot had a larger category-link population, showing that merchandising/page composition itself is time-sensitive. The important invariant is not the exact number 120; the persistent signal is:

`content/link field: deeper pages expose different products`

vs

`canonical field: pages 2–4 nominate page 1`.

This is not automatically labeled an SEO error. The next question is empirical:

**Does Yandex reliably discover/index deeper-page products under the current canonical architecture?**

Measure provider states before changing pagination.

---

## 7. P1 — two product identity collisions

The focused active-product set surfaced two independently verified pairs outside the ordinary bounded-crawl duplicate report.

### Dyson V12 Detect Slim Absolute

Two distinct URLs are simultaneously:

- HTTP 200;
- self-canonical;
- same title;
- same H1;
- same JSON-LD Product `name`;
- different JSON-LD `offers.url` values.

URLs:

- `.../besprovodnoy-pylesos-dyson-v12-detect-slim-absolute/`;
- `.../besprovodnoy-pylesos-dyson-v12-detect-slim-absolute_102845/`.

### Dyson V8 Total Clean

The same pattern exists for:

- `.../besprovodnoy-pylesos-dyson-v8-total-clean/`;
- `.../besprovodnoy-pylesos-dyson-v8-total-clean_102879/`.

For both pairs the current JSON-LD parse found no populated SKU/MPN/GTIN/structured-brand identifier that clearly differentiates the two entities.

Their HTML hashes differ, so this report does **not** call them identical-body duplicates.

The finding is narrower:

`two distinct self-canonical 200 URLs → same named product identity`

Before choosing redirect/canonical/merge behavior, compare stock, price, specifications, variant semantics and internal product IDs.

---

## 8. Entity/trust hypothesis was downgraded by fresher evidence

The causal run checked 15 current key surfaces.

Observed on the current surfaces:

- `10:00–19:00`: 15/15;
- Bereshkovskaya text: 15/15;
- `09:00–21:00`: 0/15;
- legacy `ЦИФРОВАЯ ДОСТАВКА`: 0/15;
- `круглосуточно`: 1 checked surface (`/help/delivery/`);
- Lokomotivny text: 2 checked surfaces (`/info/requisites/`, `/help/payment/`);
- explicit VK/Telegram/YouTube/Dzen/Rutube links: 0/15.

This weakens the earlier historical entity-drift concern: current templates are considerably more consistent than older search-visible residues suggested.

Address/hour variants must be interpreted by business role before calling them contradictions: legal address, customer-facing address, order acceptance and delivery/support hours can legitimately differ.

This is an important SearchProof behavior: a hypothesis is **downgraded** when fresher evidence is stronger.

---

## 9. Graph focusing

Instead of counting findings, focus attention using:

`focus ≈ reach × transition severity × evidence confidence × persistence × downstream sensitivity`

This is a prioritization concept, not a financial score.

### Focus 1 — product-state synchronization

Strongest because:

- 103 URLs share one transition family;
- two ancestor destinations explain the cluster;
- sitemap and sampled internal-navigation fields disagree;
- a same-day taxonomy update emitted 17 new product URLs that are already non-terminal.

### Focus 2 — product identity uniqueness

Two verified pairs expose a clean, bounded identity-governance experiment.

### Focus 3 — pagination discovery

Different product sets sit behind pages 2–4 while canonical converges to page 1. Search-provider evidence can settle whether this currently harms discovery.

### Separate engineering field — mobile performance

Existing reproducible Lighthouse baseline remains:

- mobile Performance 21;
- LCP 12.0 s;
- TBT 3,420 ms.

Performance should be changed and verified separately from URL/product-state work so attribution remains interpretable.

---

## 10. Proposed invariants

### Sitemap terminality

`index-intended product in sitemap → intended terminal product state`

### Migration identity

`old product identity → exact new product identity → terminal new product state`

### Product identity

If two URLs are intentionally separate indexable entities, make the distinction explicit in human and structured identity fields. If they are the same entity, converge search identity intentionally.

### Pagination discovery

Products reachable mainly through deeper pagination should remain reliably discoverable under the chosen canonical/indexing architecture.

---

## 11. Verification sequence

Do not change everything at once.

### Experiment A — product-state synchronization

1. Select one bounded category slice.
2. Reconcile sitemap membership with intended live product state.
3. Preserve implementation timestamp/PR.
4. Re-run causal v2.
5. Observe Yandex indexed/excluded/discovery/query states at T+14 and T+30.

### Experiment B — one identity pair

1. Resolve the actual business identity of one Dyson pair.
2. Apply merge/redirect/canonical/variant differentiation according to the business truth.
3. Re-run page evidence.
4. Observe Yandex URL/query state afterward.

### Experiment C — pagination

1. Freeze a controlled list of products from page 2+.
2. Record current Yandex discovery/index/query states.
3. Change architecture only if evidence supports the hypothesis.
4. Re-observe at a fixed window.

---

## 12. Measurement integrity

The first causal workflow discovered the pattern but its focus classifier placed 10 nested-subcategory redirects into `replacement_or_other_redirect`.

Artifact inspection showed all 10 were actually ancestor-category transitions with the same `302 → 200` family.

Actions taken:

- client-facing count corrected to 103;
- v1 focus score retired;
- corrected v2 classifier implemented;
- v2 independently confirmed `194 unique_200_candidate + 103 ancestor_category_redirect + 1 category_200`;
- superseded v1 workflow removed after v2 passed;
- v1 artifact retained as historical evidence.

The measurement system is part of the test surface.

---

## 13. Integrity boundaries

This report does **not** claim:

- 103 lost sales;
- 34.6% of the whole catalog/site is broken;
- measured ranking loss from the 302 transitions;
- measured traffic loss from pagination canonicalization;
- identical-body duplication for the Dyson pairs;
- that legal/customer-facing address differences are inherently errors;
- that Lighthouse lab values equal field Core Web Vitals;
- causal revenue impact before provider/business observations.

The final model is:

`state evidence → transition evidence → cross-field conflict → focused cause hypothesis → one bounded change → time/provider/business verification`
