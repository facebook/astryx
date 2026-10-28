---
'@astryxdesign/core': patch
---

[fix] Typeahead and Tokenizer keep a dismissed menu closed when a search or focus bootstrap that was still running answers afterwards. Closing the menu with Escape, an outside click, Tab, or moving focus away also clears the busy indicator. A late answer for the same text is kept and shown the next time the menu opens, without searching again; an answer for text the person has since changed is dropped. Previously the late answer reopened the menu after it had been dismissed.
@hurrymaplelad
