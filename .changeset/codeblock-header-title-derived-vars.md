---
'@astryxdesign/core': patch
---

[fix] CodeBlock: the `codeblock-header` and `codeblock-title` theme targets now actually apply their dimension/type properties. Header padding (`paddingInline`/`paddingBlock`) and title `fontSize`/`lineHeight` are read through internal `--_codeblock-*` derived vars (`replaces: true`), so a theme sets those vars instead of emitting raw declarations that competed with the component's own StyleX atomics and lost the cascade depending on how the consumer compiled. Theme authoring is unchanged — `codeblock-header: {base: {padding…}}` / `codeblock-title: {base: {fontSize…}}` — and the rendered defaults are unchanged.

@freddymeta
