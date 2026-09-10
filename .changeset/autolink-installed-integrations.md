---
'@astryxdesign/cli': patch
---

[feat] Load an installed integration even when no `astryx.config` names it

A package the project declares as a dependency, and that ships a root
`astryx.integration.*` manifest, is now loaded on sight — no config entry
required. A scaffold that adds the dependency and writes no config used to leave
the integration invisible: its components, templates, docs and codemods all
reported as missing, which is indistinguishable from not having installed it at
all.

Only DECLARED dependencies are probed — `dependencies`, `devDependencies` and
`optionalDependencies` — and only by key. `node_modules` is never walked, so a
transitive dependency of a dependency cannot contribute; and because the value
is never parsed, a dependency that is not a semver range (`npm:` aliases,
`workspace:`, `file:`, `link:`, `catalog:`) resolves like any other. Identity
comes from the resolved package's own `name`, so an aliased dependency reports
the package it actually is, and two dependency keys naming one package load it
once.

An explicit `astryx.config` entry keeps its precedence and its position, and a
dependency whose manifest fails to load is dropped quietly rather than reported
as the consuming project's problem.

`astryx doctor` gains an `implicit-integrations` line naming each integration
linked this way, the package.json field that declared it, and what it
contributes — so an author can answer "why can the CLI see this?" without
reading the CLI's source, and an unused-dependency check has something to read
that says the dependency is load-bearing. The line is always informational, so
the doctor CI gate is unaffected.

@josephfarina
