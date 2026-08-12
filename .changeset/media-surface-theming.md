---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Theme-controlled media surfaces: Toast and Tooltip now share one CSS-only inverted-surface mechanism, and themes can opt a component out via `defineTheme({ surfaces: { toast: 'normal' } })`. Opting out drops the inversion and lands the component on the ordinary popover surface, which pairs with the ambient text color; the theme restyles it from there through `components.<name>`. This also fixes tooltips rendering dark-on-dark when nested inside an inverted Toast.

Non-breaking for stock themes and for unbuilt themes (the `<Theme>` runtime regenerates their CSS automatically). **Pre-built custom themes must be rebuilt** with the matching CLI (`astryx theme build`): the inverted surface now lives in the theme's generated CSS keyed on `.astryx-toast-content` / `.astryx-tooltip-content` instead of the component-set `[data-astryx-media]` wrapper, so a stale built `theme.css` would leave toasts/tooltips un-inverted. Themes co-version with `@astryxdesign/core` (exact peer pin), so this is the usual bump-together step.

Also note: Tooltip now derives its inverted colors from `--color-background-inverted` / `--color-on-*` (matching Toast) instead of `--color-text-primary` / `--color-background-surface`, so a theme that set those to unusually divergent values may see a slightly different tooltip.

[fix] Accent text and icons on an inverted surface now collapse to the on-color like `--color-accent` already did (`--color-text-accent` / `--color-icon-accent` chain through it). A link in an error toast was rendering at its page accent color — 3.9:1 against the dark error surface. A theme that recolors `onDark.tokens['--color-accent']` now recolors accent text with it.

Toast and Tooltip paint their surface through `--_toast-surface` / `--_tooltip-surface`, and a theme's `components.toast.base.backgroundColor` is routed to that variable (`theming.derived`). A plain `background-color` rule sat in a layer the component's own StyleX outranks, so theme backgrounds for these two never applied in a production build.
@cixzhang
