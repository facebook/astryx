---
'@astryxdesign/core': patch
---

[fix] Kbd: normalise the "esc" and "return" aliases useHotkeys accepts (#5403)

`useHotkeys` and `Kbd` take the same '+'-separated combo string, but `Kbd`
did not resolve two of the aliases `useHotkeys` accepts for the same keys:
`esc` and `return` fell through its uppercase fallback and rendered as
the literal words "ESC" and "RETURN" instead of the existing `Esc`/`↵`
glyphs and `Escape`/`Enter` accessible names already used for
`escape`/`enter`. `meta` and `space` are left as-is; per the issue, those
need a platform/design decision this fix does not make.

@HelloOjasMutreja
