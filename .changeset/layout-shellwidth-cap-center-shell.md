---
'@astryxdesign/core': patch
---

[feat] Layout: add `shellWidth` prop to cap and center the entire shell (#2625)

- `shellWidth` (a `SizeValue`) caps the ENTIRE layout shell — header, panels,
  content, footer, and their dividers — at a maximum width and centers it with
  `margin-inline: auto`. Numbers are pixels, strings are used as-is
  (e.g., `'90rem'`).
- Contrast with `contentWidth`, which caps only the content within each slot
  while headers, footers, and their dividers stay full-bleed. With
  `shellWidth`, dividers end at the shell edge and the surrounding background
  shows on both sides on wide viewports. The two props compose.
- Implements the shell `maxWidth` / `shellWidth` Tier E capability reserved in
  the layout-prop standardization (#3223). The `settings` template switches
  from `contentWidth={1440}` to `shellWidth={1440}`, restoring its original
  capped-shell design (dividers ending at 1440px) with zero custom CSS.

@jiunshinn
