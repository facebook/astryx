---
'@astryxdesign/cli': minor
---

[breaking] Add typed namespace docs, semantic content blocks, and stable provider-aware documentation identity. Consumers with exhaustive `AuthoredDocKind` or `ReferenceContentBlock` switches must add cases for `namespace`, `workflow`, `collection`, and `reference`; existing authored docs continue to parse unchanged. (#6471)

Every doc section now has a stable key: its `id`, or a key derived from its title. `astryx docs <topic> --index` (`docs(topic, undefined, {index: true})`) returns the topic's section index (`docs.index`), and `astryx docs <topic> <key>` reads one section. A topic read still returns the whole doc. `astryx docs authoring` documents every authoring schema, one section each.

Breaking changes and how to migrate:

- Section keys are validated. A topic whose sections derive the same key (for example `Quick Start` and `Quick-start`), whose section `id` is not lowercase words joined by hyphens, or whose section title yields no key (no Latin letters or digits) loaded before and is now invalid. Give the section a distinct title or an explicit `id`.
- A section query matches a key, then an exact title, then a unique part of a title. A query that matches more than one section is now refused with the candidates instead of returning the first match; pass the key.
- A topic extension's section replaces the base section with the same key before falling back to the same title, so an extension `id` that names a base key now replaces that section instead of being added beside it.
- Human-readable `astryx docs` output wraps at 120 columns (CJK characters count as two), lists topics one per line, and prints a table wider than 120 columns one row at a time. `--json` output is unchanged.
- When two packages claim one provider ID, the package being authored is used, otherwise the first-loaded one. The other is set aside, and every command, `astryx doctor`, and the project's issues name it; before, it was dropped without a word.
- `astryx doctor` now fails when a topic's section index or any section is over 32 KB in any language it ships, when a contributed doc is invalid, or when an authoring doc is unreachable.

@josephfarina
