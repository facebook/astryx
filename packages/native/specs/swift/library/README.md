# Swift library specs

Rules that every Astryx Swift component or Swift build step shares, one
concern per file. A component spec (`../<Name>.md`, from
`../../TEMPLATE.md`) follows these and records only where a component differs.

These specs apply AST-082 (native-first surfaces) and AST-093 (native component
guidelines). Where one of them and an approved record disagree, the record
wins.

| File                 | Concern                                            |
| -------------------- | -------------------------------------------------- |
| `theme-generator.md` | How any Astryx theme becomes a Swift `AstryxTheme` |
