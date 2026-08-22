---
'@astryxdesign/cli': patch
---

[feat] search: components from configured integrations are searchable, and usage guidance is indexed (#5320). `search` gathered components straight off the resolved core directory, so a package listed in `astryx.config.mjs` was reachable by `component` and `template` and invisible to the one command whose job is finding things — the search command even loaded a `Project` already, purely to print integration warnings beside results that could not contain an integration's components. It now gathers through `Project`, so integration components rank alongside Core's and carry their own `package` and `import`. Component candidates also index `features` and best-practice text, scored below the description tier: a reader asking about "maintenance notices" now reaches `Banner`, whose own description only says "a persistent message", while a component that merely mentions a word in passing advice no longer ties with one that names it outright. Every result now reports `matchedTerms`/`queryTerms`.

@josephfarina
