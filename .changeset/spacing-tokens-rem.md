---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Spacing tokens are rem (`--spacing-2: 0.5rem`), so gaps and padding follow the reader's root font size the way the type scale does. Every token value is unchanged at the default 16px root.

One change shows at the default root: the `useTableRowExpansion` chevron now sits centered in its fixed 40px column instead of running past its edge (its button moves from 24–48px to 8–32px of the column). Under a theme with a larger spacing scale, such as matcha, the chevron is visible again and the detail panel lines up with the first column instead of starting 20px past it.

@vjeux

Old usage:
The `--spacing-*` defaults were fixed px (`--spacing-2: 8px`), so `useTheme().token()`, `resolveThemeToken()`, `tokenDefaults` and `spacingDefaults` returned px strings, and spacing stayed the same size when a reader raised the browser font size.

Replacement:
The defaults are rem with the same value at a 16px root (`--spacing-2: 0.5rem`, `--spacing-4: 1rem`), and those readers return the rem string.

Migration:
CSS that reads `var(--spacing-*)` needs no change. Code that parses a spacing token as a px number converts the rem value with the root font size, or reads the element's computed length. A theme that wants fixed px spacing sets the tokens back, for example `defineTheme({tokens: {'--spacing-2': '8px'}})`.

Codemod:
None. A token read and parsed at runtime cannot be found and rewritten statically, and CSS uses need no rewrite.
