---
'@astryxdesign/cli': patch
---

[fix] An empty-string argument no longer discards the rest of the command.

`astryx template "" src/zzz.tsx` exited 0, printed the whole 705-row template
list, and threw away the write target the user named. `swizzle ""` and
`discover ""` listed the same way. An empty string is falsy, so the `if (name)`
that routes between "do this one" and "list everything" could not tell `""`
from an argument that was never typed — one space already failed correctly with
ERR_INVALID_ARGUMENT.

`template`, `swizzle` and `discover` now reject an empty positional with
ERR_INVALID_ARGUMENT and exit 1, in both text and `--json`. Omitting the
argument still lists, exactly as before.

`layout` is deliberately unchanged: its expression can also arrive via `--file`
or stdin, so an empty positional there really does mean "not given as an
argument" and keeps its own ERR_MISSING_ARGUMENT.

@josephfarina
