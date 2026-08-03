---
'@astryxdesign/core': patch
---

[feat] Selector & MultiSelector: the dropdown search field is now a `TextInput`, so it gains that component's built-in affordances — a leading search magnifier (`startIcon`) rendered inside the field and a trailing clear (✕) button (`hasClear`) that appears once a query is typed and resets + refocuses on click. The field now shares TextInput's border, focus ring, and sizing, so it matches every other Astryx input instead of being a bespoke control. No new props or theme targets. Non-breaking, but note the magnifier is a new default glyph, so existing `hasSearch` dropdowns gain a leading icon.
@freddymeta
