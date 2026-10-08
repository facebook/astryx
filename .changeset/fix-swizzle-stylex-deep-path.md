---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[fix] swizzle: rewrite every .stylex import to a deep path
@josephfarina

`astryx swizzle Button` (and any component that imports a `.stylex` module from outside its own directory) emitted an import that collapsed to the directory barrel — e.g. `@astryxdesign/core/utils` instead of `@astryxdesign/core/utils/interactionOverlay.stylex`. The barrel does not re-export those StyleX symbols, so the swizzled file could not compile.

`rewriteImports` now gives every `*.stylex` module the deep subpath. The exports generator (`scripts/sync-exports.js`) adds 16 specific subpath exports for the `.stylex` modules swizzled components actually reference across directories:

`DateInput/tokens.stylex`, `Icon/IconSize.stylex`, `Indicator/indicator.markers.stylex`, `Layer/layerAnimations.stylex`, `Layer/layerTextReset.stylex`, `Layer/layerViewportInset.stylex`, `Layout/container.stylex`, `Layout/edgeCompensation.stylex`, `Layout/padding.stylex`, `NavItem/navItemStyles.stylex`, `Selector/selectorPresentation.stylex`, `Stack/stack.stylex`, `Stack/stackItem.stylex`, `Text/text.stylex`, `utils/focusOutline.stylex`, `utils/interactionOverlay.stylex`

These are public API additions. Each module already ships in the npm tarball (in `dist/`); only the exports map entry is new. No wildcard — a future cross-directory `.stylex` import needs a deliberate entry in `STATIC_EXPORTS`. Precedent: `./theme/dataTokens.stylex` (AST-066 FR2).
