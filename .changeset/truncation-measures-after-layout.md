---
'@astryxdesign/core': patch
---

[perf] Pages that mount many truncated `Text` and `Heading` elements at once mount faster. Each one used to measure whether its text overflows while React was still committing the page, so every measurement forced its own style and layout pass; they now measure on the resize observer's first notification, which the browser sends after layout for all of them together. The ellipsis, the line clamp and the full-text tooltip are unchanged.

@cixzhang
