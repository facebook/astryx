---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feature] Add themeable indicators — the componentized check, checkbox, and radio visuals. `defineTheme({indicators: {check: RadioIndicator}})` replaces one by name, and every component drawing it follows.

Theme targets now follow the component-name convention: `checkbox-indicator`, `radio-indicator`, `radio-indicator-dot`. The old names (`checkbox`, `radio`, `radio-dot`) are still emitted on the same element, so existing themes keep working — migrate at your convenience; they go away in the next major.

Migration: menu radios use those shared targets now. `dropdown-menu-radio-dot` is removed — target `radio-indicator-dot`; `astryx upgrade` rewrites it for you.

@cixzhang
