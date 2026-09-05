---
'@astryxdesign/cli': patch
---

[fix] `theme build` now emits the theme's custom variants into the built JS module, so `astryx component` can finally annotate them. Custom prop values (e.g. `button['variant:quiet']`) existed only as the `.variants.d.ts` type augmentation — the built module carried `name`/`tokens`/`components`/`icons` but never a runtime `variants` field, so `resolveTheme()` handed the CLI `variants: null` for **every** built theme and the `*` suffix plus the "custom variant from … theme" footnote in `astryx component` were unreachable dead code (#5059). A variant the compiler accepted and the CSS rendered was invisible to the one tool agents are told to consult instead of recalling prop lists.

The built module now carries `variants: { [componentKey]: value[] }`, folded from the same collected entries that generate the `.variants.d.ts` — one source of truth, so the type surface and the CLI's report cannot disagree. Values on props with no augmentation point (closed literal unions such as Button `size`) are excluded from both, exactly as before: the CLI never advertises a value the compiler would reject. Themes that add no custom variants keep the historical module output byte for byte, and themes built by an older CLI still resolve fine — the reader treats a missing `variants` field as "no theme variants", as it always has.

@jiunshinn
