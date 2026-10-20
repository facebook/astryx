---
'@astryxdesign/core': patch
---

[perf] `Text` and `Heading` with `maxLines` and `hasTruncateTooltip={false}` no longer measure their text or observe it for resizes and content changes. Only the tooltip uses that measurement, so with the tooltip off the text is cut by CSS alone, and a long table of truncated cells no longer pays a layout read per cell. Rendering is unchanged; with the tooltip enabled (the default) nothing changes.

@cixzhang
