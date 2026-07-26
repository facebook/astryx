---
'@astryxdesign/cli': patch
---

[docs] `astryx theme build --help` now describes `-o, --out <path>` as "Output directory for all theme artifacts (named by the CSS path)". The old wording, "Output CSS file path", read as CSS-only, but the `.js`, `.d.ts` and `.variants.d.ts` artifacts all follow that path's dirname — so people left the built `.js` beside a `.ts` theme source, where a bundler with `extensionAlias` silently resolves the source theme instead of the build. (#4276)
@AKnassa
