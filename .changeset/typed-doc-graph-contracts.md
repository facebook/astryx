---
'@astryxdesign/cli': minor
---

[breaking] Add typed namespace docs, semantic content blocks, and stable provider-aware documentation identity. Consumers with exhaustive `AuthoredDocKind` or `ReferenceContentBlock` switches must add cases for `namespace`, `workflow`, `collection`, and `reference`; existing authored docs continue to parse unchanged. Topic extensions can now target a section by stable `id`, and sections without an ID keep matching by title. When two packages claim one provider ID, the package being authored is used, otherwise the first-loaded one, and every command, `astryx doctor`, and the project's issues name the package that was set aside. `astryx docs <topic>` (and `docs(topic)`) now returns the topic's section index (`docs.index`): each section's key, title, and summary. Read one section with `astryx docs <topic> <key>`, or the whole topic with `--detail full` (`{detail: 'full'}`). A section query that matches more than one section is refused instead of guessed. `astryx docs authoring` documents every authoring schema, one section each.

@josephfarina
