---
'@astryxdesign/core': patch
---

[fix] Markdown: find link destinations in linear time
@cixzhang

`Markdown` no longer searches the rest of the text for every link or image whose destination never closes, which made a message with many of them take seconds to render. Each parenthesis now pairs once per text, so such input renders in milliseconds; links read as before.
