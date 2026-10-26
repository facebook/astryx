---
'@astryxdesign/lab': minor
---

[breaking] `TransferList` and `TransferListSelector` reorder through Core's `createReorderable` object (`spec:AST-103`): pass it as `reorderable` and apply each move it reports (`{key, to}`: the option's value and its index in `value` after the move). Its `isReorderable(value)` keeps an option in place. A staged `TransferListSelector` moves its draft instead, so Cancel drops the move and Apply commits it. `TransferList`'s boolean `reorderable`, `TransferListSelector`'s `isReorderable` and the option field `isReorderDisabled` are removed. Without `reorderable`, the selected options keep their order.

@vjeux
