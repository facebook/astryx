---
'@astryxdesign/cli': patch
---

[feat] An integration can contribute reference-doc topics: point `docs` at a root in `astryx.integration.*` and every `{topic}.doc.{ts,mjs,js}` under it is served by `astryx docs`, indexed by `astryx search`, and named in the agent-docs block, beside the built-in topics. A topic may also declare `replaces: '<topic>'` to take over an existing one (renaming it leaves the old name resolving as an alias) or `extends: '<topic>'` to merge onto one section by section. A name that collides without declaring either is an `invalid_doc` issue rather than a silent override, and `validate-integration` reports it. (#5311)

Also fixes the agent-docs block's topic list, which scanned for `\w+` and so silently dropped every hyphenated topic — `getting-started`, `cli-integrations`, `browser-support`, `styling-libraries` and `working-with-ai` were missing from every block ever written, and an agent cannot ask for a topic it was never told about.

@josephfarina
