---
'@astryxdesign/cli': patch
---

[feat] Add opt-in typed documentation graph contracts and stable provider-aware documentation identity without breaking existing topic readers. (#6471)

New `NamespaceDoc`, `AuthoredDocKind`, provider identity types, semantic graph-block types, section IDs, `astryx docs <topic> --index`, and section-key reads are additive. The public `ReferenceContentBlock` union keeps its 0.6.x members so existing exhaustive renderers continue to compile; graph-only `workflow`, `collection`, and `reference` blocks are exported separately as `GraphContentBlock` and are accepted by `NamespaceDoc`.

Existing authored topics continue to load and read as before. Duplicate title-derived keys receive deterministic suffixed index keys, titles with no Latin letters or digits receive deterministic `section-N` keys, ambiguous title queries keep returning the first match, and legacy extension sections without IDs continue to merge by exact title. Explicit new section IDs remain validated. The new progressive-disclosure Doctor audit reports compatibility issues as warnings, and existing full-topic text output keeps its 0.6.x formatting.

Every doc section can opt into a stable `id`. `astryx docs <topic> --index` (`docs(topic, undefined, {index: true})`) returns the topic's section index (`docs.index`), and `astryx docs <topic> <key>` reads one section. A topic read still returns the whole doc. `astryx docs authoring` documents every authoring schema, one section each.

Provider-ID conflicts are now visible instead of being dropped without a word: the package being authored wins, otherwise the first-loaded provider wins, and every command plus `astryx doctor` reports the set-aside package.

@josephfarina
