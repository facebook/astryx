---
'@astryxdesign/cli': patch
---

[feat] CLI API: re-export `findRelatedBlocks(componentName, cwd?)` from `@astryxdesign/cli/api`, and report `isShowcase` on `template.list` block entries. Consumers that need the blocks composing a component (e.g. a docsite component page) no longer have to read `node_modules/@astryxdesign/cli/templates/...` by hand — the package `exports` field only opens `./api` and `./json`, so the function was unreachable. `component(name, {blocks: true})` remains the command-shaped view; this is the raw-record helper, alongside `summarizeIssues`.

@AKnassa
