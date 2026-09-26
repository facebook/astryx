---
'@astryxdesign/core': patch
---

[fix] Keep Tokenizer's bootstrap menu open and focused after adding a choice when hasEntriesOnFocus is enabled, so people can select another loaded choice without refocusing or typing. The displayed menu removes controlled selected values and closes at the selection limit or when no loaded choices remain, while direct single-select typeaheads keep closing after selection. (#6360)
@fullstackhacker
