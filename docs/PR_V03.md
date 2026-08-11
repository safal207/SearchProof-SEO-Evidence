# v0.3 review checklist

- experiment lifecycle remains deterministic
- before/after deltas never become causal claims
- Yandex OAuth token is never persisted
- official query metrics are normalized with documented transformations
- dashboard fixture is clearly marked as demonstration data
- `npm run verify` covers experiment, Yandex adapter, crawler, page audit, and public UI contracts
