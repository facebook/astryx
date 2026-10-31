---
'@astryxdesign/core': patch
---

[fix] Type-to-select ignores accents when matching. Pressing `d` on a closed Selector, or in an open DropdownMenu or ContextMenu, now reaches "Đào" and pressing `a` reaches "Ánh". Before, a key typed without the mark skipped every option that starts with the marked letter, which is how Vietnamese, Spanish, French and Polish lists are usually typed. Matching uses the provider locale's search collation at base strength, so case and accents are ignored where the language treats them as the same letter (đ, ł, ø fold to d, l, o) and kept where it does not (Spanish ñ stays apart from n, Swedish å from a). A key that is only a combining mark is ignored. No API changes.

@HelloOjasMutreja
