# JEDI-002: Theme architecture

## Status

**Status:** Accepted  
**Date:** 2026-07-03  
**Decision Maker(s):** John Ohio (Owner/Maintainer)  
**Supersedes:** None

## Context

JEDI applications need dark and light modes with consistent tokens. Astryx ships multiple themes as separate packages. JEDI must expose a single, opinionated theme contract so applications do not select or import Astryx themes directly.

**In scope:** Default themes, mode mapping, CSS import order, provider API.  
**Out of scope:** Custom brand themes beyond gothic/neutral for v0.1; portfolio-specific token extensions (live in `@jedi/tokens` bridge).

## Decision

**v0.1 theme mapping:**

| Application mode | JEDI theme     | Upstream (internal)           |
| ---------------- | -------------- | ----------------------------- |
| `dark` (default) | `gothicTheme`  | `@astryxdesign/theme-gothic`  |
| `light`          | `neutralTheme` | `@astryxdesign/theme-neutral` |

### CSS import order (applications)

```css
@import '@jedi/themes/reset.css';
@import '@jedi/themes/base.css';
@import '@jedi/themes/theme.css'; /* active theme layer */
@import '@jedi/tokens/bridge.css'; /* compatibility aliases */
```

### Provider

`JediProviders` from `@jedi/core` accepts `mode: 'light' | 'dark'` and selects the correct theme object internally. Applications sync `data-theme` on `<html>` for non-React CSS (editorial layers, legacy aliases).

### Storage

Applications own persistence keys (e.g. `jop-theme`). JEDI owns theme objects and CSS — not storage.

## Consequences

### Positive

- Single import surface for themes
- Gothic editorial dark aesthetic aligned with reference application
- Neutral light mode without gothic light gap

### Negative / Trade-offs

- Limited theme palette in v0.1; custom JOP brand theme deferred to JEDI v0.2+

## Related

- JEDI-001 (public API)
- JEDI-003 (package boundaries)
