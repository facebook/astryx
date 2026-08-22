---
'@astryxdesign/core': patch
---

[feat] `Section`, `Stack` (with `HStack` / `VStack`) and `Center` accept a padding prop for each of the four edges — `paddingBlockStart`, `paddingBlockEnd`, `paddingInlineStart` and `paddingInlineEnd` — so an edge can take its own spacing step without an `xstyle` escape hatch. `Section` also gains the `paddingInline` axis prop it was missing, so all three components now expose the same seven-prop set (#5224).

Each prop takes the same spacing scale as `padding`, and resolution is most-specific-wins, per edge:

> edge prop → axis prop (`paddingInline` / `paddingBlock`) → `padding`

An edge prop changes its own edge and leaves the other three alone.

```tsx
<Section padding={6} paddingBlockStart={2}>…</Section>   // tight top, 24px elsewhere
<Stack padding={4} paddingInlineEnd={0}>…</Stack>         // flush trailing edge
```

The inline props are logical, so `paddingInlineStart` is the left edge in LTR and the right edge in RTL.

On `Section` the matching `--container-padding-*` custom property moves with the prop, so bleed children (`Table`, `Divider`, a nested `Section`) keep compensating against the padding actually applied.

Existing code is unaffected: `padding`, `paddingInline` and `paddingBlock` behave exactly as before, and their generated class output is unchanged.

@imdreamrunner
