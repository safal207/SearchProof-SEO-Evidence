# BatyaStore — Causal Graph / Temporal SEO Audit v3

Target: `https://batyastore.ru/`

Date: 2026-08-11

This report extends the earlier evidence-first audit from static findings into a state-transition model:

`state(t) → transition → resulting state → cross-field conflict → cause hypothesis → bounded change → time/provider verification`

The goal is not to manufacture more SEO findings. The goal is to identify the smallest upstream state inconsistency that can explain many downstream symptoms.

---

## 1. State-vector model

For this case, one URL/entity is treated as a state vector rather than a single page:

`S(t) = { sitemap membership, HTTP/redirect state, final URL, canonical, internal-link reachability, taxonomy position, product identity, content identity, observed time }`

SearchProof records transitions between those states:

- `sitemap --declares--> URL`;
- `URL --HTTP transition--> final URL`;
- `final URL --canonicalizes_to--> preferred URL`;
- `category --links_to--> product`;
- `state(t1) --changes_to--> state(t2)`.

A high-value audit target is a **field conflict**: several signals describe the same entity differently.

Example:

`sitemap: product is current`

`HTTP: product URL redirects to ancestor category`

`internal graph: redirecting URL is not referenced in the bounded crawl`

`time: some such product URLs were newly emitted into the sitemap during the audit window`

That pattern is more informative than the generic label “redirect problem”.

---

## 2. Fresh repository evidence

### Causal graph run v1

Workflow: `BatyaStore Causal Graph Audit`

- run: `31480469700`;
- job: `93743998912`;
- result: success;
- artifact: `batyastore-causal-graph-31480469700`;
- artifact ID: `9097081374`;
- artifact SHA-256: `3507bcc97510dadf5ae1be479eb682a804552d44ad8539639493979c98bf265f`.

Fresh SearchProof crawl inside this run:

- 200 HTML pages;
- 86,684 internal-link edges;
- 36,309 sitemap URLs;
- 0 broken internal links in the bounded crawl;
- 0 duplicate-title groups in the ordinary 200-page crawl;
- 0 canonical mismatches in that ordinary bounded crawl;
- sitemap coverage explicitly marked partial.

The ordinary crawl alone did **not** reveal the product-state pattern below. It became visible after focusing the graph on one commercial taxonomy slice and following state transitions.

### Temporal / identity run

Workflow: `BatyaStore Temporal + Identity Audit`

- run: `31481008168`;
- job: `93745689884`;
- result: success;
- artifact: `batyastore-temporal-identity-31481008168`;
- artifact ID: `9097199170`;
- artifact SHA-256: `48689227c07bc01f7e94b1f8eccb9c1bd6c716a006ae0d651fa626b5e4047c72`.

---

## 3. P0 — product-state synchronization: 103 sitemap URLs transition to ancestor categories

Focused taxonomy prefix:

`/catalog/bytovaya-tekhnika/pylesosy/vertikalnye-pylesosy/`

There are 298 sitemap URLs under this prefix, including the category itself.

Full transition classification from the causal artifact:

- 194 `unique_200_candidate`;
- 93 product-like URLs redirect to the main vertical-vacuums category;
- 10 product-like URLs redirect to the nested `vertikalnye-moyushchie-pylesosy` category;
- 1 URL is the category itself;
- 0 observed 404s in this slice;
- 0 observed 410s in this slice.

Therefore, **103 of the 298 URLs in this category-prefix sitemap slice currently transition to an ancestor category rather than remain a terminal product document**.

All 103 observed redirect chains use the same status pattern:

`declared URL → 302 → ancestor category → 200`

Destination distribution:

- 93 → `/catalog/bytovaya-tekhnika/pylesosy/vertikalnye-pylesosy/`;
- 10 → `/catalog/bytovaya-tekhnika/pylesosy/vertikalnye-pylesosy/vertikalnye-moyushchie-pylesosy/`.

### Important boundary

This is **not** “34.6% of the whole site is broken”. It is a state distribution inside one deliberately focused sitemap prefix.

### Cross-field finding: sitemap graph vs internal-navigation graph

None of those 103 redirecting sitemap URLs appeared as an internal-link target in the fresh bounded 200-page crawl.

So the strongest proven interpretation is:

**the current sitemap contains a shadow/residual product-state graph that is not reflected in the sampled live internal-navigation graph.**

This is stronger evidence for sitemap/product-state synchronization debt than for direct user-navigation loss. Direct conversion impact is not claimed without analytics.

### Candidate invariant

For a sitemap URL intended to represent an indexable product:

`declared product URL → terminal intended product state`

A valid business policy can deliberately produce another state, but sitemap membership and the resulting state should agree.

---

## 4. New temporal finding — sitemap changed during the audit window

Two independent SearchProof snapshots were compared.

Earlier snapshot:

- evidence timestamp around `2026-08-11T07:47:21Z`;
- 36,310 sitemap URLs.

Fresh snapshot:

- evidence timestamp around `2026-08-11T10:05:48Z`;
- 36,309 sitemap URLs.

Exact set difference:

- 18 URLs removed;
- 17 URLs added;
- 17 removed/added pairs share the same product slug but moved from:

`/catalog/tovary-dlya-doma/novogodnie-tovary/<slug>/`

into:

`/catalog/tovary-dlya-doma/interer/<same-slug>/`.

The old `novogodnie-tovary/` category itself disappeared from the sitemap, producing the net `-1` URL difference.

This is a real `taxonomy(t1) → taxonomy(t2)` transition observed during the audit, not a historical search-engine snapshot.

---

## 5. P0 temporal defect — exact taxonomy migration lands on a non-terminal new product URL

The temporal workflow traced all 17 migrated product slugs.

For all 17, the transition has the same structure:

`old product URL`

`→ 301 exact new /interer/<same-slug>/ URL`

`→ 302 /interer/ category`

`→ 200 category`

The first hop preserves product identity correctly: the old product path maps to the exact same-slug path in the new taxonomy.

But the new product URL then immediately leaves the product state and collapses to the category.

The old category itself currently follows:

`/novogodnie-tovary/ → 301 → /catalog/tovary-dlya-doma/ → 200`.

The new `/interer/` category is 200 and self-canonical.

### Cause hypothesis

The evidence is consistent with two state-management layers interacting:

1. taxonomy migration knows the exact new product URL;
2. current product availability/deactivation routing sends that new product state to an ancestor category.

This does **not** prove the internal CMS implementation. It does show a synchronization invariant worth testing:

`new sitemap membership ↔ live terminal product state`

The especially important signal is timing: these 17 `/interer/` product URLs were **newly emitted into the current sitemap**, yet the same URLs already transition away from product state.

That means this is not explainable only as old sitemap residue.

---

## 6. P1 — pagination field conflict: 160 different products vs one canonical target

Pages 1–4 of the focused category were inspected as a link-state graph.

Each page exposes 40 direct product-card URLs after excluding pagination/filter controls and the known nested wet-vacuum subcategory.

Observed:

- page 1: 40 product-card URLs;
- page 2: 40 different product-card URLs;
- page 3: 40 different product-card URLs;
- page 4: 40 different product-card URLs.

Across pages 1–4:

- 160 unique product-card URLs;
- zero product-card overlap between the four page sets;
- all 160 are present in the current sitemap;
- all 160 are current 200/self-canonical candidates in the focused transition evidence.

At the same time:

- page 2 → canonical page 1;
- page 3 → canonical page 1;
- page 4 → canonical page 1.

This produces a clear **field conflict**:

`internal content/link field: pages expose different product states`

vs

`canonical field: pages 2–4 nominate page 1 as preferred`.

This is not automatically declared an SEO error. The next question is empirical:

**Does Yandex reliably discover/index products whose important category discovery paths sit on page 2+ under the current canonical architecture?**

Measure before changing.

---

## 7. P1 — product identity collisions hidden outside the ordinary crawl

The focused active-product set exposed two identity-collision pairs that the ordinary bounded crawl did not surface as duplicate-title groups.

### Pair A — Dyson V12 Detect Slim Absolute

Two distinct URLs exist:

- `.../besprovodnoy-pylesos-dyson-v12-detect-slim-absolute/`;
- `.../besprovodnoy-pylesos-dyson-v12-detect-slim-absolute_102845/`.

Both are:

- HTTP 200;
- self-canonical;
- same title;
- same H1;
- same JSON-LD Product `name`;
- separate JSON-LD `offers.url` values.

### Pair B — Dyson V8 Total Clean

Two distinct URLs exist:

- `.../besprovodnoy-pylesos-dyson-v8-total-clean/`;
- `.../besprovodnoy-pylesos-dyson-v8-total-clean_102879/`.

The same identity pattern is observed:

- HTTP 200;
- self-canonical;
- same title;
- same H1;
- same JSON-LD Product `name`;
- separate `offers.url` values.

For both pairs, the current parse found no populated `sku`, `mpn`, `gtin` or structured brand identifier that would clearly differentiate two product entities.

The HTML hashes differ, so this report does **not** call the bodies identical duplicates.

### Interpretation

This is an **entity-identity collision signal**:

`two indexable/self-canonical URLs → same named product identity`

Before choosing redirect/canonical/merge behavior, compare price, stock, specifications, variant semantics and internal product IDs. If they are intentionally different commercial entities, encode the distinction explicitly. If they represent the same entity, converge the search identity intentionally.

---

## 8. Current entity surface is cleaner than the historical signal suggested

The causal workflow checked 15 current key surfaces.

Current text-surface observations:

- `10:00–19:00` matched on 15/15 checked surfaces;
- Bereshkovskaya address text matched on 15/15;
- `09:00–21:00` matched on 0/15;
- legacy `ЦИФРОВАЯ ДОСТАВКА` matched on 0/15;
- `круглосуточно` matched on 1 checked surface (`/help/delivery/`);
- Lokomotivny address text matched on 2 checked surfaces (`/info/requisites/` and `/help/payment/`);
- explicit VK/Telegram/YouTube/Dzen/Rutube links matched on 0/15 checked surfaces.

This **downgrades** the earlier historical entity-drift concern: the live template surfaces are currently much more consistent than old search-visible residues suggested.

The remaining address/hour variants should be interpreted by role before calling them conflicts: legal address, customer-facing address, order acceptance and delivery/support hours can legitimately differ.

This is an example of the audit model correcting its own earlier hypothesis when fresher evidence is stronger.

---

## 9. Graph focusing: where to spend the next unit of attention

Instead of counting findings, use a focus field:

`focus ≈ reach × transition severity × evidence confidence × persistence × downstream sensitivity`

No monetary value is assigned by this heuristic.

### Focus 1 — product-state synchronization

Why first:

- reaches 103 URLs in one commercial prefix;
- transition pattern is highly regular (`302 → ancestor category → 200`);
- mismatch exists across sitemap vs HTTP vs sampled internal-link fields;
- same-day sitemap mutation produced 17 newly emitted non-terminal product URLs.

This is the strongest upstream-system hypothesis.

### Focus 2 — product identity uniqueness

Why next:

- two independently verified 200/self-canonical product identity collisions;
- structured product identity currently does not expose SKU/MPN/GTIN differentiation in these pairs;
- bounded remediation can be verified URL-by-URL.

### Focus 3 — pagination discovery

Why next:

- pages 1–4 expose 160 different product cards;
- pages 2–4 converge canonically to page 1;
- actual search impact can be answered by Yandex URL/discovery data rather than theory.

### Separate engineering field — mobile performance

Existing reproducible Lighthouse evidence remains valid:

- mobile Performance 21;
- LCP 12.0 s;
- TBT 3,420 ms.

Performance is important, but it is a different causal field from URL/product-state synchronization and should be changed/measured separately.

---

## 10. Recommended invariants

### Sitemap terminality invariant

For each URL intended as an indexable product:

`in sitemap → terminal intended product state`

or an explicitly documented alternative policy.

### Migration identity invariant

For a moved product:

`old product identity → exact new product identity → terminal new product state`

Avoid a migration where the exact mapping exists but immediately collapses to a broad category unless that is the deliberate business rule.

### Product identity invariant

If two URLs are separate indexable products, they need machine- and human-readable differentiation.

If they are the same product entity, their search identity should converge intentionally.

### Pagination discovery invariant

Products reachable mainly through deeper pagination should remain reliably discoverable under the chosen canonical/indexing architecture.

---

## 11. Verification plan

Do not fix everything at once.

### Experiment A — product-state sync

1. Select one bounded category slice.
2. Reconcile sitemap membership with live product state.
3. Preserve the implementation timestamp/PR.
4. Re-run the causal transition workflow.
5. Observe Yandex indexed/excluded/discovery states at T+14 and T+30.

Success evidence is a state change such as:

`declared non-terminal product URL → intended terminal/indexing policy`

plus provider observation.

### Experiment B — identity collision

1. Resolve the actual business identity of one Dyson pair.
2. Apply the appropriate merge/redirect/canonical/variant differentiation.
3. Re-run page evidence.
4. Observe Yandex URL/query state afterward.

### Experiment C — pagination

1. Build a controlled list of page-2+ products.
2. Record current Yandex discovery/index/query states.
3. Change pagination architecture only if the data supports the hypothesis.
4. Re-observe at a fixed window.

---

## 12. Measurement integrity

The first causal workflow contained its own classification limitation: the initial focus heuristic counted root-category redirects but placed 10 nested-subcategory redirects in `replacement_or_other_redirect`.

Artifact inspection showed that all 10 actually terminate at the ancestor `vertikalnye-moyushchie-pylesosy` category with the same `302 → 200` transition pattern.

Therefore:

- the client-facing corrected count is **103 ancestor-category transitions**;
- the initial v1 focus reach/score is not used as the final metric;
- a corrected v2 workflow was added so future snapshots classify ancestor-category transitions directly.

This follows the same SearchProof rule used earlier in the case:

**verify the measurement layer before trusting the conclusion.**

---

## 13. What is not claimed

This report does not claim:

- that 103 URLs represent 103 lost sales;
- that 34.6% of the whole catalog is broken;
- that a 302 redirect caused a measured ranking loss;
- that pagination canonicalization has already reduced traffic;
- that the Dyson pairs are identical-body duplicate pages;
- that different legal/customer-facing addresses are inherently wrong;
- that Lighthouse lab metrics equal field Core Web Vitals;
- that any observed traffic/revenue movement would automatically prove causality.

The stronger model is:

`state evidence → transition evidence → cross-field conflict → focused cause hypothesis → one bounded change → time/provider/business verification`
