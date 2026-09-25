---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Remove the deprecated component-theming compatibility surface scheduled for 0.7.0. Components now emit only canonical target classes and reflected `data-*` prop/state selectors. Theme discovery and build output no longer expose deprecated targets, and `ThemePropsOptions` plus `ComponentThemingTarget.deprecatedFor` are removed.

Run `astryx upgrade --from 0.6.3 --apply --path .` after upgrading. The staged codemod renames statically identifiable keys inside JavaScript and TypeScript `components` maps, renames target classes in CSS, and replaces target-qualified bare prop/value/state classes with reflected `data-*` selectors. It leaves dynamic/computed theme keys, unqualified or unknown classes, and CSS embedded in JavaScript/TypeScript strings for manual review. When old and canonical keys coexist, it preserves both and adds `TODO(astryx upgrade)` for an intentional merge.

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
