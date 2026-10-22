---
'@astryxdesign/core': patch
---

[fix] `CheckboxInput` announces its busy start ("Loading") once, politely, through the shared announcement channel (`spec:AST-086` FR6, FR8). The Spinner it shows in place of the check mark while busy sits inside the decorative, hidden indicator, so before this nothing told screen-reader users that the checkbox had become busy beyond its `aria-busy`. Inside an open modal dialog the announcement goes to a status region in the dialog.

@cixzhang
