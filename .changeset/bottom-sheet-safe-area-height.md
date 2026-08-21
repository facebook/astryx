---
'@astryxdesign/core': patch
---

[fix] Bottom Sheet: give content room above the iOS home indicator

A named height budget now sizes the sheet's content. The device's bottom safe-area inset plus a 16px gutter are added on top of it, so a `capped` sheet shows the same amount of content on a phone with a home indicator as on one without, and content keeps breathing room above the indicator instead of ending exactly where it starts.

A non-modal (`hasScrim={false}`) sheet also no longer lets the page show through iOS Safari's translucent address bar once the bar goes compact. Its overlay was sized with a percentage, which resolves against the small viewport and does not grow when the bar retracts, so the sheet stopped a bar's height short; it now tracks the dynamic viewport like the modal one, which is what lets Safari extend the sheet's own surface down behind the bar.

@imdreamrunner
