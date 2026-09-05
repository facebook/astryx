---
'@astryxdesign/core': patch
---

[fix] Core now applies one shared URL scheme rule everywhere a link leaves React's hands: useClickableContainer checks its imperative navigations (window.open, location.href) the way React DOM already vets rendered hrefs, and useLinkComponent applies the same rule before forwarding href/to to a custom LinkProvider component — so the guarantee holds for every router, not just the native anchor.

@bhamodi
