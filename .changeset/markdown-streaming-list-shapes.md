---
'@astryxdesign/core': patch
---

[fix] Markdown: keep two lists apart while streaming when their bullets or indentation differ
@cixzhang

While a message streamed, `Markdown` joined two lists a blank line apart whenever both were bulleted, or both numbered with the same delimiter — even when their bullets (`-` then `*`) or indentation differed, where the finished document shows two lists. The streamed render now keeps them apart, as the finished document does.
