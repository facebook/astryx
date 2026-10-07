---
'@astryxdesign/cli': patch
---

[feat] An integration component can replace a Core component, once its package opts in

A component whose doc sets `replaces: 'SideNav'` takes over `SideNav` for unqualified component detail, batch selectors, every `component --list` detail level, `search`, `swizzle`, and gap-report routing, when its package declares `"@astryxdesign/cli": ">=0.6.7"` in `peerDependencies` (optional in `peerDependenciesMeta`). The replacement keeps answering to its own name, every result names its package, and `--package @astryxdesign/core` still selects the original Core component.

Any `@astryxdesign/cli` range that starts at 0.6.7 or later is the opt-in, including the `>=0.7.0` that `integration add theme` and `integration add doc --parent` wrote in 0.6.4 and 0.6.5. A package whose range admits an earlier CLI keeps its component under its own name and Core stays selected, and an app that loads it sees no new output; its author gets warnings naming the range to add, from `astryx doctor integration components` and `integration pack --check`. `component SideNav --package <that package>` also selects the replacement. For a package that declares the range, `astryx doctor integration components` reports a missing Core target, an invalid value, a component named after a different Core component, or two replacements for one target in the package as errors and exits 1. When several packages replace one target, an explicitly configured package beats an autolinked one, the later configured package wins, and Doctor warns.
@josephfarina
