---
'@astryxdesign/core': patch
---

[fix] Added a `@astryx.richTextEditor.*` catalog namespace to the shared message catalog, so the RichText editor's toolbar labels, block-format options, link dialog, and Tab escape hint can be translated and overridden through `InternationalizationProvider`. The editor's character counter now announces through the existing `@astryx.textArea.characters*` messages, so it is translated in every locale TextArea already ships.

@cixzhang @AKnassa
