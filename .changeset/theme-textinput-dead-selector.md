---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` component-override keys now match the class names components actually render (#4109)

The theme compiler's `KNOWN_COMPONENTS` table listed multi-word components un-hyphenated (`textinput`, `tablist`, `topnav`, ...), while theme selectors are derived verbatim from the key (`.astryx-<key>`) and components render hyphenated class tokens (`astryx-text-input`, `astryx-tab-list`, `astryx-top-nav`, ...). The broken keys validated cleanly and emitted dead rules that matched nothing, while the correct hyphenated keys — the ones the first-party themes already use — tripped the "Unknown component" warning, which then suggested the broken spelling. 15 keys are renamed to the rendered class token (`app-shell`, `aspect-ratio`, `checkbox-input`, `date-input`, `dropdown-menu`, `form-layout`, `mobile-nav`, `more-menu`, `number-input`, `radio-list`, `side-nav`, `tab-list`, `text-input`, `time-input`, `top-nav`), the `layer` key with no rendered class at all is removed, the renamed entries' visual-prop lists are synced to what the components render (`size`, `status`, `variant`, ...), and doc-file lookup now resolves hyphenated keys. Legacy un-hyphenated keys now warn loudly with a pointer to the correct name instead of silently shipping dead CSS.

@jiunshinn
