---
'@xds/core': patch
---

**Markdown:** join blank-line-separated same-style list items into a single loose list (CommonMark §5.3), and forward a non-default `start` onto the rendered `<ol>` so the number is visible to assistive tech and on copy-paste.

LLM output commonly emits `1.\n\n1.\n\n1. …` to mean "an ordered list of three items"; previously each item became its own `<ol>` restarting at 1. The parser now treats blank lines between same-style/same-indent items as a loose-list continuation and sets `loose: true` on the resulting list node. `<XDSList listStyle="decimal" start={N}>` now also emits `start="N"` on the underlying `<ol>` element (the CSS counter alone is invisible to assistive tech).
