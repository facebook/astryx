---
'@astryxdesign/core': patch
---

[fix] SideNav: don't render the empty sticky-bottom container when `collapsible.hasButton` is false. Previously the footer container rendered whenever the sidebar was collapsible — even with the built-in button opted out and no `footer`/`footerIcons` — leaving an empty, bordered container at the bottom of the nav. The container now renders only when it has visible content (a footer, footer icons, or the built-in collapse button). (#3603)
@dmitriy-bty
