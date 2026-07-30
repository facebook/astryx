---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Theme-controlled media surfaces: Toast and Tooltip now share one CSS-only inverted-surface mechanism, and themes can opt a component out via `defineTheme({ surfaces: { toast: 'normal' } })`. Opting out disables the inversion so the theme owns that component's surface through the ordinary `components.<name>` overrides. This also fixes tooltips rendering dark-on-dark when nested inside an inverted Toast.

Non-breaking for stock themes and for unbuilt themes (the `<Theme>` runtime regenerates their CSS automatically). **Pre-built custom themes must be rebuilt** with the matching CLI (`astryx theme build`): the inverted surface now lives in the theme's generated CSS keyed on `.astryx-toast-content` / `.astryx-tooltip-content` instead of the component-set `[data-astryx-media]` wrapper, so a stale built `theme.css` would leave toasts/tooltips un-inverted. Themes co-version with `@astryxdesign/core` (exact peer pin), so this is the usual bump-together step.

Also note: Tooltip now derives its inverted colors from `--color-background-inverted` / `--color-on-*` (matching Toast) instead of `--color-text-primary` / `--color-background-surface`, so a theme that set those to unusually divergent values may see a slightly different tooltip.
@cixzhang
