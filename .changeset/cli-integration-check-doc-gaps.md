---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor integration` and `astryx integration check` catch more doc mistakes, and stop flagging one pattern Core itself uses.

@josephfarina

- A `docsZh` or `docsDense` overlay may set `name` and `displayName`, as Core's own docs do; both are ignored when the doc renders, so `--strict` no longer fails on them.
- `doctor integration components` reports a documented `default` that differs from the literal default the component writes in its props destructuring (`size = 'md'`) as `default_mismatch`. Quotes and spacing are ignored; a default that is not a literal is not compared.
- `doctor integration validate` warns, each with a fix, on a prop documented twice (`duplicate_prop`), a `propDescriptions` key that names no documented prop (`unknown_translated_prop`), a section with no content (`empty_section`), two sections of one topic with the same key (`duplicate_section_key`), a `replaces` or `extends` that names no topic the project sees but is one typo from a Core or package topic (`unknown_topic_target`; another integration's topic is never flagged), and a `.doc.zh.mjs` or `.doc.dense.mjs` overlay beside no topic file (`orphan_doc_overlay`).
- A topic that takes the route of one of Astryx's own docs is named by its topic name, not an internal id, with the rename to make. A link written as a bare name (`{@link deploying}`) gives the exact link to write, or says no topic has that name.
- When a doc is missing several required fields, each finding's message names only its own field.
