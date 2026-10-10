---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Remove the deprecated component-theming compatibility surface scheduled for 0.7.0. Components now emit only canonical target classes and reflected `data-*` prop/state selectors. Theme discovery and build output no longer expose deprecated targets, and `ThemePropsOptions` plus `ComponentThemingTarget.deprecatedFor` are removed. The `theme targets --json` response drops the `ThemeTargetEntry.deprecatedFor` field, because no target it lists is deprecated.

Run `astryx upgrade --from <your 0.6 version> --apply --path .` after upgrading. The staged codemod renames removed target keys inside theme `components` maps (an imported `defineTheme()` call, an object typed as an Astryx theme, or a theme object with a static `name`), renames target classes in CSS, and replaces target-qualified bare prop/value/state classes with reflected `data-*` selectors, using every bare class the final 0.6 release emitted. It leaves dynamic/computed theme keys, unqualified or unknown classes, and CSS embedded in JavaScript/TypeScript strings for manual review. It adds `TODO(astryx upgrade)` when old and canonical keys coexist, and when a bare class Astryx once emitted has no known meaning on the target it qualifies.

The four per-component clear-icon aliases all become the shared `input-clear-icon`, which styles every input's clear icon. In CSS the codemod keeps each rule on its component with `:where(.astryx-<component> *)`, which adds no specificity. Theme keys cannot carry that scope, so the codemod adds a TODO naming the CSS selector to use.

Code that passed `{legacyNames}` to `themeProps()` or set `deprecatedFor` in a component doc should delete that argument or field; the canonical target is unchanged.

Rename theme keys and CSS target classes with this complete mapping:

- `base-table` → `table`
- `checkbox` → `checkbox-indicator`
- `codeblock` → `code-block`
- `codeblock-copy-button` → `code-block-copy-button`
- `codeblock-header` → `code-block-header`
- `codeblock-title` → `code-block-title`
- `date-input-clear-icon` → `input-clear-icon`
- `date-range-input-clear-icon` → `input-clear-icon`
- `hovercard` → `hover-card`
- `multi-selector-clear-icon` → `input-clear-icon`
- `navicon` → `nav-icon`
- `popover-surface` → `popover`
- `progressbar` → `progress-bar`
- `progressbar-fill` → `progress-bar-fill`
- `progressbar-mark` → `progress-bar-mark`
- `progressbar-track` → `progress-bar-track`
- `radio` → `radio-indicator`
- `radio-dot` → `radio-indicator-dot`
- `selector-clear-icon` → `input-clear-icon`
- `statusdot` → `status-dot`
- `textarea` → `text-area`

For custom CSS, replace removed bare selectors with the corresponding reflected attribute on a canonical target—for example, `.astryx-button.primary.sm` becomes `.astryx-button[data-variant="primary"][data-size="sm"]`, and `.astryx-switch.checked` becomes `.astryx-switch[data-checked="checked"]`. Review unqualified classes such as `.primary` manually because they may be application-owned.

@cixzhang
