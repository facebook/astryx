---
'@astryxdesign/core': patch
---

[feat] Add `useAnnounce` — an accessibility hook that speaks messages to screen readers through persistently-mounted, visually-hidden polite/assertive live regions. Because the regions are created once (not together with their content), announcements are reliable. Wired into `Typeahead`/`BaseTypeahead` to announce result counts and "no results found" during search, which were previously silent (#3343).
@cixzhang
