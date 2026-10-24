---
'@astryxdesign/core': patch
---

[feat] `useCombobox` (from `@astryxdesign/core/Selector`) now builds a combobox over a text field you render yourself, such as a message field with a mention list or a search field whose results replace a page section. Spread `getFieldProps` on your `input`, `textarea` or contenteditable element (the new `field` option names which), `getListboxProps` on your listbox wherever it renders, and `getOptionProps` on each option. Focus stays in the field; the field and the list carry the combobox roles and relationships; while the list shows, the arrows move the active option, Enter picks it and Escape hides the list without closing a surrounding dialog; while it is hidden, or while an input method is composing, keys reach the field untouched, except that ArrowDown reopens the list in an `input`; a pointer picks without taking focus. The new `query` option announces each new result count through the shared announcer, worded by two new catalog messages, `@astryx.combobox.resultCount` and `@astryx.combobox.noResults`. Options may be any type with a string `value`. Existing options, return fields and `onKeyDown` behave as before.

@vjeux
