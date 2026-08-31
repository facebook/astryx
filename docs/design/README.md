# Design specifications

Design specs record human-owned visual and interaction intent: hierarchy,
anatomy, state representation, allowed variation, and representative examples.
They may describe one component or a cross-component pattern.

Design specs do not own implementation mechanics, public prop syntax, current
audit results, or consumer usage guidance. Component and family contracts link
to stable design requirement IDs instead of copying their rationale.

Public-safe normative screenshots, diagrams, and visual state references live
under `docs/design/assets/<design-id>/`. Each referenced asset records alt text,
state, theme/mode, viewport when relevant, and what decision it demonstrates.
Generated audit screenshots remain audit evidence rather than design authority.
Private design sources stay private and are never named or linked here.

New design specs start as `draft`. Initial promotion to `current`, later changes,
and normative asset updates require exact-head approval from `cixzhang`,
`imdreamrunner`, or any current member of `.github/DESIGNOWNERS`. A mixed PR still
needs `cixzhang` or `imdreamrunner` for non-design current records. The design
record names its content owners separately from this repository gate.

Use `docs/templates/knowledge/design-spec.md`.
