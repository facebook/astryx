---
'@astryxdesign/core': patch
---

[fix] Typeahead, Tokenizer, BaseTypeahead: a disabled field now keeps its place in the tab order, so keyboard and screen-reader users can reach it and hear that it is unavailable (WCAG 2.2 SC 2.1.1 Keyboard, 4.1.2 Name, Role, Value and 2.4.7 Focus Visible; `spec:AST-085` FR1–FR3 and FR6). The input exposes `aria-disabled="true"` and is read-only instead of carrying the native `disabled` attribute, as it already did with a `disabledMessage`. While disabled it runs no caller event handler other than focus and blur, runs no search, opens no list (a list open when the field becomes disabled closes), selects nothing, and Enter does not submit its form. A disabled Tokenizer renders no hidden form inputs instead of natively disabled ones, so it still submits nothing. Under keyboard focus the field shows its focus ring, dimmed with the rest of the field. BaseTypeahead's `isFocusableDisabled` no longer changes anything and is kept for compatibility. PowerSearch's input, built on these, follows.

Part of #7814.

@cixzhang
