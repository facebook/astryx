---
'@astryxdesign/core': patch
---

[feat] Add `markdownSourceLinesPlugin` to `@astryxdesign/core/Markdown/plugins` (#7286). With it installed, every block `Markdown` renders, nested blocks included, carries `data-source-line` and `data-source-line-end`: the 1-based, inclusive lines it came from. That lets a host map a selection, search hit, or comment back to the exact Markdown lines. `components` block renderers receive a matching `sourceLines` prop, and plugin renderers read lines from `node.position`. The lines come from the parse `Markdown` already runs, and without the plugin nothing changes.

@cixzhang
