---
'@astryxdesign/core': patch
---

[fix] NumberInput: a pasted `1,234,234,234` now commits as 1234234234

Pasting a number out of a spreadsheet used to fail. The field parsed with
`Number()`, so `1,234,234,234` read as `NaN`, the field went invalid, and the
paste was lost — the single most common way anyone puts a large number into a
form.

Typed and pasted text is now read under the field's locale: grouping and
decimal separators and group sizes come from `Intl` (so `1.234.234.234` in
de-DE, narrow-no-break-space grouping in fr-FR, and lakh grouping in en-IN all
work), digits come from `\p{Nd}` (Arabic-Indic, Devanagari, full-width), and
the shapes a spreadsheet attaches — a currency symbol, an accounting `(1,234)`,
a `1.23E+09`, a stray BOM — are handled.

A separator that could mean two different numbers still refuses: `1,5` is 1.5
in de-DE and nothing in en-US, and a `1,234 GB` keeps its unit rather than
guessing which trailing letters are inert. Refusing leaves the field
`aria-invalid` with its existing alert, which is the honest outcome — a wrong
number committed silently is the failure this is designed against.

Typing is never intercepted and nothing is rewritten mid-composition. No API
change: `formatValue` is untouched.

@cixzhang
