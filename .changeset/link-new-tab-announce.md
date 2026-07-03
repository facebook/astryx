---
'@astryxdesign/core': patch
---

[fix] Link: external links (`isExternalLink`) now include visually-hidden "(opens in new tab)" text so screen-reader and cognitive-load users are told about the new-tab context change — previously only a decorative `aria-hidden` icon signalled it. The text is overridable via the new `newTabLabel` prop for localization (#3343).
@cixzhang
