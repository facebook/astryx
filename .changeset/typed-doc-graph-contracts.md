---
'@astryxdesign/cli': minor
---

[breaking] Add typed namespace docs, semantic content blocks, and stable provider-aware documentation identity. Consumers with exhaustive `AuthoredDocKind` or `ReferenceContentBlock` switches must add cases for `namespace`, `workflow`, `collection`, and `reference`; existing authored docs continue to parse unchanged.

@josephfarina
