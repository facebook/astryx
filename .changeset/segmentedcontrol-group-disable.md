---
'@astryxdesign/core': patch
---

[fix] SegmentedControl: a disabled segment (including when the whole control is disabled) is no longer a keyboard tab stop. Previously the selected segment kept `tabIndex={0}` while disabled, so it was focusable but silently dead — arrow keys and activation did nothing (#3343).
@cixzhang
