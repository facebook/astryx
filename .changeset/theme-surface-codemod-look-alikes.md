---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade` to 0.7 no longer renames component keys in a look-alike theme object that is not an Astryx theme, such as another library's `{name, components: {checkbox, radio, textarea}}` theme. A theme object with no `defineTheme()` call or Astryx theme type is migrated only in a theme source that a same-stem theme descriptor declares.

@ejhammond
