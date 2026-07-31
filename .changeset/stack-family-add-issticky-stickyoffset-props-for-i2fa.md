---
'@astryxdesign/core': patch
---

[feat] Stack family: add `isSticky` / `stickyOffset` props for sticky columns and rails (#2613)

- `isSticky` pins a `Stack` / `HStack` / `VStack` to the block-start edge of its
  nearest scroll container (`position: sticky`) so it stays in view while a
  sibling scrolls — the info-column / filter-rail / docs-sidebar pattern. It also
  sets `align-self: flex-start` so the stack does not stretch its flex/grid track
  (a stretched item has no room to stick).
- `stickyOffset` (a `SpacingStep`) sets the block-start inset via
  `inset-block-start: var(--spacing-N)`; it defaults to `0` and has no effect
  unless `isSticky` is set.
- Implements the `isSticky` / `stickyOffset` Tier E capability names reserved in
  the layout-prop standardization (#3223). The `product-detail` template drops
  its `position: sticky` custom-CSS workaround in favor of the new props.

@jiunshinn
