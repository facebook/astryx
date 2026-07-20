# CI wiring (Tier 2 browser job)

The Tier 2 (real Chromium) run is not committed to `.github/workflows/ci.yml` in
this prototype branch — modifying workflows needs elevated token scope, and the
CI wiring is a reviewer decision. Below is the proposed job, ready to drop in.

It complements the existing `pr-a11y` job (axe static rules against Storybook)
with **behavior + pattern conformance** — keyboard, focus, and the real
accessibility tree that jsdom cannot fake. Gated on component changes,
Chromium-only per-PR, with a cached browser. Gate the build only on BLOCKER
expectations; report lower priorities into the coverage matrix.

```yaml
# APG pattern conformance — Tier 2 (real Chromium via Vitest Browser Mode).
aria-spec-browser:
  needs: [check-components]
  if: github.event_name == 'pull_request' && needs.check-components.outputs.has_components == 'true'
  runs-on: ubuntu-latest
  permissions:
    contents: read
  steps:
    - name: Checkout
      uses: actions/checkout@v7

    - name: Setup Node and pnpm
      uses: ./.github/actions/setup

    - name: Build core package
      run: pnpm -F @astryxdesign/core build

    # Cache the Playwright browser — the install is the slow part, not the tests.
    - name: Cache Playwright browsers
      uses: actions/cache@v4
      with:
        path: ~/.cache/ms-playwright
        key: playwright-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}

    - name: Install Chromium
      run: npx playwright install --with-deps chromium

    - name: Run ARIA spec (Tier 2, browser)
      run: pnpm test:aria-browser
```
