---
'@astryxdesign/core': patch
---

[fix] Emit derived accent tokens as var(--color-accent) references (#3495)

Generated themes now emit `--color-text-accent` and `--color-icon-accent` as `var(--color-accent)` and `--color-accent-muted` as `color-mix()` over the same reference, instead of baking resolved hex literals. Overriding `--color-accent` on any scope re-accents the whole subtree at runtime — no second theme build, no per-token overrides. `--color-on-accent` stays resolved because it is a contrast computation CSS cannot express.
@arham766
