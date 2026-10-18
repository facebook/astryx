---
'@astryxdesign/cli': patch
---

[feat] Each full entry an integration's family doc lists in `components`, such as `AcmeSlide` in an `AcmeCarousel` doc, is a component under its own name when the module the doc's `import` names exports it. Its source is the `.tsx` file in the family's folder that declares it; a member that only built output or a file outside that folder declares has no source to show or copy. `component --list`, `component <Name>`, `search`, `swizzle`, the `doctor integration` checks, `integration verify` and `integration add` know these members. A member's detail is scoped to its own entry, as a Core sub-component's is, and it never carries the family's `replaces`. A member named like a Core component or another doc's file opens with `--package`.

@josephfarina
