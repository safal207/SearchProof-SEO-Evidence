# SearchProof Architecture

## v0.1 data flow

```text
Target URL
   │
   ▼
HTTP fetch ───────────────┐
   │                      │
   ├─ page HTML           ├─ robots.txt probe
   │                      └─ sitemap.xml probe
   ▼
Deterministic extractors
   │
   ├─ metadata
   ├─ headings
   ├─ links
   ├─ JSON-LD types
   └─ visible-text signals
   ▼
Evidence checks
   │
   ├─ Technical SEO
   ├─ Content
   ├─ Yandex readiness
   └─ AEO / GEO readiness
   ▼
JSON evidence report
   │
   ├─ signals
   ├─ findings
   ├─ heuristic scores
   └─ hypothesis template
   ▼
Dashboard / experiment board
```

## Components

### `src/audit.mjs`
Network boundary and CLI. Fetches the target page plus conventional root robots/sitemap resources and writes an immutable timestamped report.

### `src/core.mjs`
Deterministic analysis engine. It has no network dependency and can be tested against fixtures.

Keeping the core separate from HTTP access is intentional: later we can feed it HTML from crawlers, browser automation, stored snapshots or CI artifacts.

### `public/`
Static evidence dashboard. It visualizes reports; it is not responsible for crawling arbitrary websites from the browser.

### `test/`
Deterministic fixtures that protect evidence and scoring contracts.

### `docs/METRIC_CONTRACT.md`
Defines the boundary between source observations, optimization hypotheses and actual search outcomes.

## Planned v0.2 crawl model

```text
seed URL
  ↓
same-origin queue
  ↓
fetch → normalize canonical → extract links
  ↓
URL graph
  ├─ crawl depth
  ├─ orphan candidates
  ├─ redirect edges
  ├─ canonical edges
  └─ duplicate metadata clusters
```

The graph is where SearchProof can become materially different from simple checklist auditors: findings can reference paths through the site rather than isolated pages.

## Planned provider adapters

SearchProof should keep provider data behind adapters:

```text
Yandex Webmaster ─┐
Google Search     ├─► observation store ► experiment comparison
AI query runs     ┘
```

Provider observations must include timestamps and source metadata.

## Trust boundaries

1. Remote HTML is untrusted input.
2. Structured data is evidence of what a page declares, not proof that the real-world claim is true.
3. SearchProof scores are internal prioritization heuristics.
4. AEO/GEO readiness is not an AI-citation guarantee.
5. Search outcomes are stored separately from recommendations.
6. Live-network checks must not be required for deterministic CI.

## Product direction

The long-term product is not "another SEO score". It is an **evidence and verification layer for search optimization**:

`finding → change → observed outcome → reusable proof`
