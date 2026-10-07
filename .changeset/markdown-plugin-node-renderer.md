---
'@astryxdesign/core': patch
---

[feat] Markdown plugins: read what a plugin declares, and render one plugin node as Markdown does
@cixzhang

`getMarkdownPluginCapabilities(plugin)`, from `@astryxdesign/core/Markdown/plugins`, reports whether a plugin declares syntax and whether it declares a transform, and nothing else; plugin entries stay opaque. `MarkdownPluginNodeRenderer`, from the new client-only `@astryxdesign/core/Markdown/plugin-renderer` subpath, renders one parsed extension node with the given plugins exactly as `Markdown` presents it — the plugin's renderer inside the same error boundary and suspense fallback, the same readable fallback text, and the same failure report — with no element of its own. `Markdown`'s own output is unchanged.
