---
'@astryxdesign/core': patch
---

[feat] Selector and MultiSelector: `indicatorPosition` places the selection indicator on either edge of the option row — `start` or `end`, logical, so it follows RTL. Defaults keep today's rendering (`end` for Selector's check, `start` for MultiSelector's checkbox); a start-positioned check reserves its column on every row so labels stay aligned (#4993).

@cixzhang
