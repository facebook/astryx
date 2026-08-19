---
'@astryxdesign/core': patch
---

[feat] `Section`, `Stack` (with `HStack` / `VStack`) and `Center` accept `paddingBlockStart` and `paddingBlockEnd`, so the top and bottom edges can take different spacing steps without an `xstyle` escape hatch. Each takes the same spacing scale as `padding` and wins over `paddingBlock` and `padding` on its own edge only — every other edge keeps the value it already had.

```tsx
// A section under a sticky header: tight above, roomy below.
<Section padding={6} paddingBlockStart={2}>
  …
</Section>
```

On `Section` the matching `--container-padding-block-start` / `--container-padding-block-end` custom property moves with the prop, so bleed children (`Table`, `Divider`, a nested `Section`) keep compensating against the padding actually applied.

Existing code is unaffected: `padding` and `paddingBlock` still set both block edges, and their generated class output is unchanged.

@imdreamrunner
