---
'@astryxdesign/core': patch
---

[fix] Chat composer: the message input now uses `role="combobox"` when triggers (mentions, slash commands) are configured, and stays a plain `role="textbox"` otherwise. Combobox attributes (`aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-activedescendant`) are only valid on a combobox, so applying them to a textbox was flagged by axe (aria-allowed-attr). (#3343)

@cixzhang
