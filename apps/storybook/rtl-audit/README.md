# RTL semantic audit

A Playwright-driven audit that grades component stories against the astryx RTL
contract. It renders each target story **twice in the same run** — once LTR,
once RTL (via Storybook's `globals=direction:rtl` toggle) — and asserts the
_relationship_ between the two renders. There are **no golden/baseline
screenshots**: nothing is committed to git, nothing drifts on OS/font
differences. It reuses the `@playwright/test` chromium the `pr-a11y` job already
installs and mirrors that job's build-storybook → serve → drive shape. In CI it
is the `pr-rtl` job — the RTL sibling of `pr-a11y`.

## Two layers

### A. Auto-discovery — D1 icon-mirror, over EVERY `core-*` story

The point of the audit is to auto-catch **new or changed** components, so D1
(directional-icon mirroring) runs across the whole library with **zero curated
selectors**. For each core story it:

1. Loads the story LTR and RTL.
2. Finds **directional** icons generically — classifying each icon SVG as
   left/right via (a) lucide class names (`lucide-chevron-left`,
   `lucide-arrow-right`, `lucide-chevrons-left`, `lucide-caret-right`,
   `lucide-move-left`, …), (b) known fallback-registry path signatures
   (chevron-left `m15 18-6-6 6-6`, chevron-right `m9 18 6-6-6-6`), and (c) the
   enclosing button's aria-label context. **Vertical glyphs (up/down chevrons,
   vertical carets) are excluded**, and ambiguous glyphs are treated as
   non-directional (err toward *not* flagging — fewer false positives during the
   soft-gate window).
3. Pairs each directional icon LTR↔RTL by aria-context (fallback: index) and
   grades:
   - **pass** — every directional icon is handled: either the wrapper's computed
     `transform` becomes a horizontal-flip matrix (`matrix(-1,0,0,1,…)`) under
     RTL while identity under LTR (the shared `rtlStyles.mirror` `scaleX(-1)`),
     **or** the rendered glyph direction swaps left↔right (name-swap, e.g.
     Pagination's `chevronLeft`↔`chevronRight`).
   - **not-RTL (fail)** — a directional glyph is present but neither flips nor
     swaps (shipped without RTL handling), or it double-flips (flip in *both*
     directions nets to no mirror).
   - **N-A** — the story has no directional icons (not penalised).

This is the broad safety net: a component that lands a directional chevron
without RTL support shows up as a not-RTL finding automatically.

#### Interaction-revealed icons (popovers, dialogs, menus)

Many directional icons live inside content that is closed by default — e.g. the
`Calendar` nav chevrons inside a `DateInput`/`DateRangeInput`/`DateTimeInput`
popover. In the closed story those chevrons are mounted but 0×0, so their mirror
transform can't be evaluated. To avoid a false not-RTL, auto-discovery first runs
a **defensive reveal step**: before scanning, it clicks the first collapsed
disclosure trigger (`aria-haspopup` / `aria-expanded="false"` / `role=combobox`)
and waits briefly for popover/dialog/menu/`[popover]` content to appear, then
scans the opened DOM. Every action is time-boxed and swallowed, so the ~vast
majority of stories with no disclosure surface are untouched and never hang. As a
second guard, any icon still rendered at 0×0 after the reveal (genuinely
unreachable) is **not** counted as a directional finding — it contributes to
N-A, never a false not-RTL. Net effect: the Date\*Inputs correctly score **pass**
because their embedded Calendar chevrons mirror once the popover is open.

### B. Curated precision — D2 / D3 / D4

`targets.json` holds the geometry/behavior dimensions that genuinely need
hand-written selectors, run **in addition** to auto-discovery:

- **D2 layout-order-flip** — prev/next controls swap horizontal order
  (`boundingBox`). *(Calendar, Lightbox.)*
- **D3 behavior-flip** — directional behavior inverts, e.g. Carousel's scroll
  axis: "next" makes `scrollLeft` go positive in LTR and negative in RTL.
- **D4 overlay-side** — a positioned affordance flips side (`boundingBox`).

D1 is intentionally **not** in `targets.json` — auto-discovery covers it
universally.

## Why relationship-based, not pixel baselines

Directional RTL bugs are *semantic* ("the chevron didn't mirror", "prev/next
didn't swap sides", "the scroll axis didn't invert"), not "these pixels
changed". The audit asserts the LTR→RTL relationship per dimension, catching
exactly that class of regression while sidestepping the flakiness of
glyph-over-photo pixel diffing.

## Running locally

```bash
# 1. Build the packages + a static Storybook (root build MUST run first, or the
#    storybook build fails to resolve @astryxdesign/build/dist/vite.mjs).
pnpm build
pnpm -F @astryxdesign/storybook build

# 2. Install the Playwright browser (once).
npx playwright install chromium

# 3. Run the audit against the built Storybook.
pnpm -F @astryxdesign/storybook rtl-audit
#   -> prints the scorecard and writes rtl-audit-report.json

# Scope to one component while iterating (applies to both layers):
node apps/storybook/rtl-audit/rtl-audit.mjs --storybook-dir apps/storybook/dist \
  --output /tmp/report.json --filter Pagination

# Just the broad auto-discovery net, or just the curated dims:
node apps/storybook/rtl-audit/rtl-audit.mjs --storybook-dir apps/storybook/dist --auto-only
node apps/storybook/rtl-audit/rtl-audit.mjs --storybook-dir apps/storybook/dist --curated-only
```

Exit code is non-zero if auto-discovery finds any not-RTL component or a curated
dim fails — but the CI job is soft (see below), so this never hard-blocks.

## Adding a curated target

Edit `targets.json`. Each entry is:

```jsonc
{
  "component": "MyComponent",
  "storyId": "core-mycomponent--some-story",   // must exist in dist/index.json
  "dims": ["D2", "D3"],                          // D2/D3/D4 only (D1 is auto)
  "setup": { "click": "img" },                   // optional: reveal the target
  "selectors": {
    "prev": "button[aria-label=\"Prev\"]",       // D2
    "next": "button[aria-label=\"Next\"]",
    "scroller": "[aria-roledescription=\"carousel\"] > div:first-child", // D3
    "nextButton": "button[aria-label=\"Scroll right\"]",
    "overlay": "…", "overlayRoot": "…"           // D4
  }
}
```

## No allowlist — any not-RTL is a failure

The RTL migration is complete: every component's directional icons mirror
correctly, so the audit runs with **no allowlist**. Any component auto-discovery
scores not-RTL is a real regression (a **surprise**) and should be fixed, not
excused. There is deliberately no mechanism to mark a not-RTL component as
"expected" — such a mechanism would be a built-in way to silence a genuine
future regression.

## Soft-gated — pending a stability window

The `pr-rtl` CI job runs with `continue-on-error: true`: a finding surfaces the
scorecard in the job summary but does not block merges while the audit is
observed for flake over a stability window. To promote to a required check once
stable: drop `continue-on-error` from the `pr-rtl` job in
`.github/workflows/ci.yml` and add it to the required checks.
