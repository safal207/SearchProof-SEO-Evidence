# BatyaStore — SMM, entity and trust evidence layer

Target: `https://batyastore.ru/`

Date: 2026-08-11

This document extends the technical SearchProof crawl with a separate public-surface review for entity consistency, trust signals and social distribution. It deliberately separates observed evidence from hypotheses and recommendations.

## Evidence rule

`surface → observation → risk/hypothesis → proposed change → metric → verification`

Absence from the search-visible HTML is **not** proof that a social account or business record does not exist elsewhere. Provider-side ownership, reach and engagement require access to the relevant platform accounts.

## Observed entity/trust signals

### 1. Public contact address versus company requisites

Observed on the public site surface:

- header/footer and contacts: `г. Москва, Бережковская наб., д. 20`;
- company requisites page: legal and factual address listed as `127238, город Москва, Локомотивный проезд, д. 21, помещ. 37/1п`.

Interpretation:

This may be legitimate (for example store/service/pickup address versus registered company address), but the relationship should be explicit and machine-readable rather than left for a crawler or buyer to infer.

Proposed verification/change:

- define `registeredAddress`, customer-facing store/service address and pickup address separately;
- keep the same labels across Contacts, Help, Warranty, Organization/LocalBusiness structured data, Yandex Business and other business profiles;
- validate that support, delivery and warranty pages use the intended location consistently.

### 2. Business hours are not historically stable across observed public surfaces

Current public HTML observed on 2026-08-11 exposes:

- `Пн - Вс: 10:00 - 19:00` on the homepage, contacts and FAQ surfaces.

Search-index snapshots from recent crawls also expose older values such as `09:00 - 21:00`; some older catalog/search surfaces expose `Круглосуточно`.

Interpretation:

This may reflect a recent operational change rather than an implementation defect. The SEO risk is stale entity information persisting across indexed pages, structured data, snippets and business profiles.

Proposed verification/change:

- choose one authoritative source of truth for customer-service hours;
- distinguish `order acceptance 24/7` from `human support/store hours`;
- re-crawl templates after deployment;
- verify Yandex Business / Webmaster-visible representations after recrawl.

### 3. Company-name residue exists in indexed catalog surfaces

Recent indexed/search-visible catalog pages have exposed `ООО "Цифровая Доставка"` in the footer while current primary pages expose `ООО "БАТЯ СТОР"`.

Interpretation:

This looks like legacy/template residue or stale indexed content and should be quantified before being described as site-wide.

Proposed verification/change:

- crawl footer/entity text across representative templates;
- search source/templates for the legacy company string;
- eliminate unintended residue;
- request/observe recrawl and snippet refresh after correction.

## SMM/distribution surface

### Search-visible homepage observation

On the current search-visible homepage HTML, no explicit text/link match was found for:

- `vk.com` / `ВКонтакте`;
- `t.me` / `Telegram`;
- `youtube`;
- `dzen`.

This is a **surface observation**, not proof that official accounts do not exist.

### Commercial implication

The site already has a blog and a broad product catalog. The missing opportunity is to connect search-demand content to repeat distribution and commerce.

Proposed loop:

`search intent → article/guide → short social derivative → VK/Telegram/Dzen/YouTube → product/category CTA → purchase/review → new customer-language content`

## Proposed content/SMM system

| Content unit | Search job | Social derivative | Commercial destination | Measurement |
|---|---|---|---|---|
| `BATYA проверяет` product test | product/brand intent | VK Clip / Short | product page | assisted visits, PDP CTR, conversion |
| `X vs Y` comparison | comparison intent | short comparison + poll | comparison/category | impressions, CTR, assisted revenue |
| `Что купить до N ₽` | budget intent | carousel/short | curated category | non-brand traffic, category conversion |
| `Не переплачивай за...` | informational/commercial | hook video/post | filtered category | engagement → site CTR |
| FAQ from reviews | trust/question intent | Telegram/VK answer | help/PDP | FAQ entrances, assisted conversion |
| new arrivals / price changes | freshness | Telegram/VK | product | returning users, conversion |

## AEO/GEO entity layer

Recommended entity graph:

`BATYA STORE brand → ООО БАТЯ СТОР → registered address → customer-facing location(s) → phone → email → support hours → warranty/service → official social profiles → app → product/catalog entities`

Goal: make the same core facts unambiguous for users, Yandex/Google parsers and AI answer systems.

Recommended checks:

- Organization / LocalBusiness structured-data consistency;
- `sameAs` only for verified official profiles;
- explicit support and service contact points;
- consistent brand/company naming across templates;
- answer blocks for delivery, warranty, returns and originality;
- provenance/date where policy content can change.

## Priority

### P0 / verify now

1. Quantify legacy company-name residue across templates.
2. Define authoritative addresses and business-hour semantics.
3. Verify that structured data and Yandex Business match those authoritative values.

### P1 / growth

1. Add verified official social destinations to the site/entity graph.
2. Turn existing blog content into a repeatable distribution system.
3. Add UTM/content IDs so social → landing → revenue can be measured.

### P2 / scale

1. Build topic clusters around customer-review language and category demand.
2. Automate article → social derivative briefs.
3. Add social-distribution observations to SearchProof experiments without claiming causality from simple before/after movement.

## Measurement contract

For each SMM/SEO experiment keep:

`content_id → source channel → target URL → campaign/UTM → publish timestamp → baseline → sessions → assisted conversions → revenue observation → re-check window`

A traffic or revenue movement after publication is an observation, not automatic causal attribution.

## Public evidence sources reviewed

- `https://batyastore.ru/`
- `https://batyastore.ru/contacts/`
- `https://batyastore.ru/info/requisites/`
- `https://batyastore.ru/help/faq/`
- `https://batyastore.ru/help/warranty/`

This layer complements `docs/cases/BATYASTORE_MARKET_AUDIT.md`; it does not replace the deterministic SearchProof crawl evidence.
