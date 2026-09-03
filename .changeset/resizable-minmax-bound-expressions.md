---
'@astryxdesign/core': patch
---

[fix] useResizable: `minSize`/`maxSize` accept `min()` and `max()`

A bound could be proportional or fixed, never both. `max(40%, 333px)` — 40% of the container, but never below 333px — had no spelling: the whole string failed to parse and took the invalid-input fallback. Measured in Chromium before this change, `minSize: 'max(40%, 333px)'` resolved to **50px at every container width from 1200px down to 400px**, and `maxSize: 'min(400px, 10%)'` to `Infinity` at 1200/4000/6000px. Development warned; `devWarn` is a no-op in production, so a shipped build got the wrong geometry silently.

`minSize` and `maxSize` now take `min()`/`max()` over the terms they already took — two terms, one level of nesting. Terms resolve against the same basis as a plain percentage and are compared as resolved pixels, so which arm wins changes with the container, exactly as in CSS. After, same widths:

| container | `minSize: 'max(40%, 333px)'` | `maxSize: 'min(400px, 10%)'` |
|---|---|---|
| 1600 / 6000 | **640** | **400** |
| 1200 | **480** | 120 |
| 900 | **360** | — |
| 833 (crossover) | **333** | — |
| 400 | **333** | — |

Everything the percentage path already guarantees applies unchanged: the bound re-resolves when the container resizes and clamps the selection rather than rescaling it, it holds one frozen basis for the duration of a drag, and state, paint, persistence and `aria-valuemin`/`aria-valuemax` stay one geometry.

Basis-dependency is decided on the parsed expression, not the source text. A percentage at any depth — `max(80px, min(90px, 50%))` — makes the whole bound track its container. An all-pixel expression is static and observes nothing.

`minSize` and `maxSize` are now typed by a Resizable-owned `ResizableSize` instead of the shared `SizeValue`. `'40vw'`, `'20rem'`, `'calc(100% - 3rem)'`, `'clamp(...)'`, `'var(--w)'`, an unbalanced call and over-deep nesting are compile errors rather than runtime fallbacks. The runtime parser is unchanged in authority — a type cannot say "0 through 100" or "finite" — and still repairs anything invalid to the documented 50px / `Infinity` without disturbing a persisted size.

Unchanged: `defaultSize` keeps its released `number | string`, so a computed string still compiles; the released `minSizePx`/`maxSizePx` aliases still work, and one bound can still migrate while the other keeps its alias; and when a resolved minimum exceeds its maximum the maximum still wins under the released `Math.min(max, Math.max(min, size))` order, now covered by a test with an expression floor.

`calc()`, arithmetic, `clamp()`, `var()` and other units stay out of the grammar — an unrecognized function is invalid input, not a passthrough to CSS. AST-010 FR13/DEC-3 record the decision.

@freddymeta
