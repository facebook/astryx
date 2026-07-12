---
'@astryxdesign/core': patch
---

[fix] Table: always render a numeric aria-valuenow on the column resize handle. The focusable resize separator omitted aria-valuenow before its width was measured, which failed the axe aria-required-attr rule (a focusable role="separator" requires aria-valuenow); it now falls back to the column minWidth. (#3343)
@cixzhang
