---
'@astryxdesign/core': patch
---

[fix] Screen-reader announcements are now localizable. MultiSelector, Selector, Typeahead, FileInput, Tokenizer, and Lightbox spoke several live-region messages in hardcoded English — selection and result counts, file selections, token add/remove, and gallery position — so they stayed English under an `InternationalizationProvider`. They now resolve through the message catalog like the rest of the UI, and the counts use ICU plurals instead of appending an English "s", so locales with other plural rules read correctly.

@nynexman4464
