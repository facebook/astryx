---
'@astryxdesign/cli': patch
---

[fix] Filter template show/skeleton component lists to resolvable components (#4677)

`template <name>` and `template <name> --skeleton` no longer advertise names `astryx component <Name>` cannot resolve (local helpers, third-party tags, type-only names). Each listed name now resolves exactly as-is through the same owner set the component command uses, including source/parent-doc cases like `AppShellMobileContext`; names owned by more than one package stay out, matching the ambiguity error. Resolution is per-name over memoized listings, so cold show/skeleton no longer pays for a whole-workspace doc index.

@MeGaurav4
