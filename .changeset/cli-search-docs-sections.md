---
'@astryxdesign/cli': patch
---

[feat] `astryx search` finds the smallest doc part that answers. (#6626)

A doc hit is now one section (`astryx docs cli/integrations codemods`), one docs-tree route (`astryx docs cli/api/functions/assert-response`), or a topic's index, never a whole-topic read. Typed docs match by their own name and by the identifiers they define, such as error codes. `astryx search --type doc` works without `@astryxdesign/core`. `astryx docs` lists the docs tree first, and a namespace shows each child's own name when its route name differs.

Every docs read now ends with its moves: `Up`, plus `Previous` and `Next` for a section or a docs-tree page, and `Related` for a typed doc (its command or API function, and its related docs). `--json` carries them as `links` (`up`, `previous`, `next`, `related`). Each search hit carries `parent`, the command that opens the level above it, and a docs-tree hit carries `package`.

@josephfarina
