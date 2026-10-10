---
'@astryxdesign/cli': minor
---

[breaking] Remove the `astryx layout` command group (CLN-0006)

Removes the deprecated `astryx layout` command group (`expand`, `check`, `grammar`),
its three response types (`layout.expand`, `layout.check`, `layout.grammar`), and
the programmatic API exports (`layoutExpand`, `layoutCheck`, `layoutGrammar`).
Completes the `CLN-0006` cleanup of `DEP-0006`.

Use `astryx build` to choose the template to start from, `astryx template` to scaffold
it, and `astryx docs layout` for layout guidance. The layout guide is unaffected. The error codes `ERR_LAYOUT_PARSE` and `ERR_LAYOUT_INVALID` are retained (append-only contract).

Removed JSON ids: `LayoutBlockReference.mode` `LayoutBlockReference.name` `LayoutCheckOptions.cwd` `LayoutCheckOptions.form` `LayoutCheckOptions.loose` `LayoutCheckResponse.data` `LayoutCheckResponse.data.compact` `LayoutCheckResponse.data.errors` `LayoutCheckResponse.data.form` `LayoutCheckResponse.data.outline` `LayoutCheckResponse.data.valid` `LayoutCheckResponse.data.warnings` `LayoutCheckResponse.type` `LayoutExpandOptions.cwd` `LayoutExpandOptions.form` `LayoutExpandOptions.loose` `LayoutExpandOptions.name` `LayoutExpandOptions.targetPath` `LayoutExpandResponse.data` `LayoutExpandResponse.data.blocksReferenced` `LayoutExpandResponse.data.code` `LayoutExpandResponse.data.componentsUsed` `LayoutExpandResponse.data.demoMediaReplaced` `LayoutExpandResponse.data.form` `LayoutExpandResponse.data.states` `LayoutExpandResponse.data.todos` `LayoutExpandResponse.data.warnings` `LayoutExpandResponse.data.written` `LayoutExpandResponse.type` `LayoutGrammarOptions.cwd` `LayoutGrammarResponse.data` `LayoutGrammarResponse.data.aliases` `LayoutGrammarResponse.data.text` `LayoutGrammarResponse.type` `LayoutIssue.col` `LayoutIssue.formatted` `LayoutIssue.line` `LayoutIssue.message` `LayoutIssue.suggestions`

@josephfarina
