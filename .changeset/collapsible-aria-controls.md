---
'@astryxdesign/core': patch
---

[fix] Collapsible: link the trigger to its content region with `aria-controls`, and give the content region a matching `id`. Completes the disclosure pattern so assistive tech can move from the trigger button to the region it shows/hides (previously only `aria-expanded` was set). (#3707)
@bhamodi
