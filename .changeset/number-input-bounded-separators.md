---
'@astryxdesign/core': patch
---

[fix] NumberInput: `1.5` reads as 1.5 everywhere again, and `123-456-789` is not a number

Two defects in the locale-aware parsing added last release, both from one
decision: which characters may separate digits was decided per input rather
than from a bounded set.

**The machine decimal point stopped parsing in comma-decimal locales.** In
de-DE, typing `1.5` committed 1 with no error shown, and pasting `1.5` or
`1234.56` was refused outright — all three committed the right number before.
A full stop the locale cannot read as grouping has exactly one reading left,
so it is now read, the way Chromium's own `<input type="number">` reads it. A
full stop that _is_ well-formed grouping still belongs to the locale: `1.234`
in de-DE is 1234, not 1.234.

**Any repeated character read as a thousands separator.** `123-456-789`
committed 123456789, and so did `1_234_567`, `1/234/567` and `1:234:567` — a
hyphenated ID pasted into a quantity field became a number. Only the
characters some locale actually writes between digits are separators now.
That bounds the characters, not the shapes: a full stop is a real separator in
its own right, so `192.168.100.200` still commits 192168100200, exactly as it
did before.

Also: `(-1,234)` and `(+1,234)` each flipped their own sign and now refuse — an
accounting paren already says negative, so a sign inside it reads two ways.

Everything the previous release got right is unchanged, `formatValue` is
untouched, and there is no API change.

@cixzhang
