---
'@astryxdesign/core': patch
---

[feature] Add themeable indicators — the componentized check, checkbox, and radio visuals. `defineTheme({indicators: {check: RadioIndicator}})` replaces one by name, and every component drawing it follows.

Migration: menu radios now use the shared `radio` / `radio-dot` targets. `dropdown-menu-radio-dot` is removed — target `radio-dot`. Move fill/border rules from `dropdown-menu-radio` to `radio`; layout rules stay.

@cixzhang
