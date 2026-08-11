# SearchProof experiment contract

SearchProof treats SEO changes as reviewable experiments rather than guaranteed ranking improvements.

## Lifecycle

`planned → implemented → measuring → observed → closed`

## Minimum evidence

1. **Baseline** — a dated observation before implementation.
2. **Hypothesis** — the expected direction of change, stated without certainty.
3. **Implementation evidence** — exact change, date, and preferably a PR/commit URL.
4. **Verification window** — when a re-check is reasonable.
5. **Observation** — provider or crawler data captured after the change.
6. **Interpretation** — an observed delta, explicitly separated from causal attribution.

## Sources

Current source types:

- `searchproof-crawl`
- `yandex-webmaster`
- manual evidence when clearly labeled

## Causality

A before/after delta can be useful evidence but is not sufficient to prove that the SEO change caused the movement. SearchProof therefore stores `causalClaim: false` by default and labels numeric comparisons as `observed-delta-not-causal-attribution`.
