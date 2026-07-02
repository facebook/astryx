---
'@astryxdesign/cli': patch
---

[docs] Add an "Adopting Astryx in an existing Next.js + Tailwind app" guide (`astryx docs adopting-existing-app`) covering the integration-boundary traps: Tailwind preflight silently defeating theme overrides via cascade layers (with the fix for both Tailwind v3 and v4), the required `moduleResolution` setting, the StyleX build for swizzled components, and type-safe custom variants. Linked from Getting Started. (#3374)
