# SearchProof Metric Contract

SearchProof separates **observations**, **inferences**, **changes** and **outcomes**.

This matters because an SEO recommendation can be technically correct while still failing to produce measurable business impact.

## Evidence levels

### L0 — Source observation
Directly observed from the fetched resource.

Examples:
- HTTP response code
- canonical URL in HTML
- robots meta value
- H1 count
- Schema.org types
- robots.txt response
- sitemap.xml response

### L1 — Deterministic interpretation
A rule applied to L0 evidence.

Examples:
- canonical missing
- page marked noindex
- no crawlable internal links found
- FAQ schema present

### L2 — Optimization hypothesis
A proposed change that may improve search discovery, presentation or answerability.

Examples:
- create a dedicated local-intent landing page
- improve internal linking to a deep commercial page
- clarify a page title around its actual search intent

L2 is **not a measured outcome**.

### L3 — Search observation
Observed provider data after the change.

Examples:
- Yandex impressions
- Yandex clicks
- average position
- indexed/searchable page state
- Google Search Console impressions/clicks
- observed AI answer citation or mention in a recorded query set

### L4 — Attributed result
A cautious conclusion made only after comparing the baseline and post-change window while checking for confounders.

Examples:
- impressions increased after the page entered the index
- CTR changed after snippet/title work
- a defined AI query set started citing the page after entity/content changes

SearchProof should never jump from L1 or L2 directly to L4.

## Hypothesis record

Each experiment should contain:

| Field | Meaning |
|---|---|
| URL | Exact target document |
| Finding | What SearchProof detected |
| Evidence | Source observation supporting the finding |
| Proposed change | Exact implementation |
| Baseline | Pre-change provider/business metric |
| Primary metric | Main expected measurable effect |
| Guardrail | Metric that should not degrade |
| Verification window | Planned re-check date/window |
| Observed result | Recorded provider/business data |
| Conclusion | Supported / unsupported / inconclusive |

## Suggested SEO metrics

Depending on the hypothesis:

- indexed/searchable URL state
- impressions
- clicks
- CTR
- average position
- organic sessions
- conversion events
- crawl discovery
- duplicate/canonical state

## Suggested AEO/GEO observations

AI-search observations require a reproducible query set. Record:

- provider/model
- date/time
- exact query
- locale/language when known
- whether the target site/entity is mentioned
- whether a URL is cited
- response evidence or provider export when permitted

Do not report "AI visibility increased" from one anecdotal prompt.

## Time windows

SearchProof does not impose a universal 7/14/30-day SEO rule. The correct re-check window depends on crawl frequency, index state, query volume, seasonality and the type of change.

The experiment owner must state the chosen window before judging the result.

## Integrity invariant

> If a value was not observed, imported or calculated from observed data, SearchProof must label it as a hypothesis, target or unknown — never as a result.
