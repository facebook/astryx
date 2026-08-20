---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor` gains two theme-drift checks, both read-only and text-only.

**CSS theming escapes** flags the three cases where CSS provably leaves the theme behind: writes to private `--_*` vars (already a hard error in `theme build`), system tokens redefined in `:root`/`html`/`:host` — which sit outside the theme's `@scope` and so override every theme at once — and the deprecated bare prop classes (`.astryx-button.primary`) in place of the reflected data attributes. Generated theme CSS is skipped, since the pipeline emits private vars and bare classes itself.

**Swizzled components** reports ejected components, and fails when their source imports StyleX while no StyleX compiler is configured. That case is not a build error: the component renders completely unstyled, with no warning.
@josephfarina
