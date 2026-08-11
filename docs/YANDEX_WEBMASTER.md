# Yandex Webmaster observations

SearchProof v0.3 can import search-query observations from the official Yandex Webmaster API.

## Provider contract

SearchProof currently uses:

- `GET /v4/user/{user-id}/hosts/{host-id}/search-queries/all/history`
- `GET /v4/user/{user-id}/hosts/{host-id}/search-queries/popular`

Requested query indicators:

- `TOTAL_SHOWS`
- `TOTAL_CLICKS`
- `AVG_SHOW_POSITION`
- `AVG_CLICK_POSITION`

Official references:

- https://yandex.com/dev/webmaster/doc/en/reference/host-search-queries-history-all
- https://yandex.com/dev/webmaster/doc/en/reference/host-search-queries-popular
- https://yandex.com/dev/webmaster/doc/en/tasks/how-to-get-oauth
- https://yandex.com/dev/webmaster/doc/en/reference/user

## Authentication

The access token is supplied only through the request `Authorization` header as `OAuth <token>`.

SearchProof reads the token from `YANDEX_TOKEN` and never writes it into an observation report.

Example:

```bash
YANDEX_TOKEN=... \
YANDEX_USER_ID=... \
YANDEX_HOST_ID=... \
npm run yandex:observe -- --date-from=2026-08-01 --date-to=2026-08-07
```

The generated report is written to `observations/`.

## Transformation rules

For all-query history:

- daily `TOTAL_SHOWS` values are summed for the requested period;
- daily `TOTAL_CLICKS` values are summed for the requested period;
- `AVG_SHOW_POSITION` is weighted by same-day shows when both series are available;
- `AVG_CLICK_POSITION` is weighted by same-day clicks when both series are available;
- the original provider series is preserved in the observation record.

These transformations are part of SearchProof, not Yandex-provided aggregate semantics, so the report records the transformation description next to the values.

## Integrity rule

A provider observation answers **what changed in the measured data**.

It does not by itself answer **why it changed**.

SearchProof therefore stores before/after movement as `observed-delta-not-causal-attribution`. External changes, seasonality, query mix, competitors, indexing delays and other causes may affect the same metrics.
