---
'@astryxdesign/cli': patch
---

[feat] CLI: `astryx theme targets` lists every component theming target — the `defineTheme` key, the class it paints, and the props and states it accepts — for one component or the whole system, with `--json` for lint and audit scripts. `astryx theme --help` now points at component overrides instead of reading as a build-tool menu. The listing and `theme build`'s override validation share one enumeration of the component docs, so neither can drift from the components.
@cixzhang
