---
'@astryxdesign/core': patch
---

[feat] ChatMessageList: add an `align` prop for top-aligned message lists
(#2572).

- `align?: 'top' | 'bottom'` (default `'bottom'`). `'bottom'` keeps the
  existing behavior: a flex spacer fills free space so a short conversation
  sits just above the composer. `'top'` omits the spacer so messages start at
  the top and grow downward — better for log-style or document-style lists.
- Only changes the resting position of a non-full list. Once messages overflow
  the container the spacer collapses to zero in both modes, so ChatLayout
  auto-scroll-to-bottom behavior is unchanged.

@jiunshinn
