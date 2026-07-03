# JEDI Platform Lifecycle

A lifecycle model for how platform artifacts evolve — not a roadmap.

```text
Experimental → Foundation → Stable → Deprecated → Removed
```

Apply this lifecycle to **packages**, **APIs**, **components**, and **tokens**.

---

## Stages

### Experimental

May change without notice. No semver contract. Not recommended for production consumption.

- Breaking changes allowed in any commit
- No ADR required for changes
- May be unpublished or renamed freely

### Foundation

Architecture frozen. APIs may evolve within phase boundaries. Current state of all v0.2–v0.4 packages.

- Tier model and dependency graph are fixed (see [ARCHITECTURE.md](./ARCHITECTURE.md))
- Public APIs may gain features; breaking changes require ADR
- Packages ship with tests and documentation artifacts

### Stable

Semver contracts enforced. Breaking changes require ADR and major version bump.

- Target state at v1.0
- Deprecation path required before removal
- Published to npm with changesets

### Deprecated

Superseded by a newer API or package. Migration path documented.

- Deprecation notice in CHANGELOG and package README
- Minimum one minor release cycle before removal
- ADR documents supersession

### Removed

No longer published. Consumers must have migrated.

- Major version bump or package delisting
- ADR records removal rationale

---

## Lifecycle by Artifact Type

| Artifact | Experimental | Foundation | Stable | Deprecated | Removed |
|----------|-------------|------------|--------|------------|---------|
| Package | Prototype in branch | v0.x workspace packages | v1.0+ published | README deprecation banner | Unpublished |
| API | Unexported or `_internal` | Exported, may evolve | Semver-locked | JSDoc `@deprecated` | Export removed |
| Component | Draft in playground | Shipped in package | API frozen at Stable | Alias or wrapper provided | Deleted |
| Token | Draft in core tier | Classified per ADR-001 | Frozen at Stable | Alias maintained | Deleted with migration |

---

## Current JEDI State (Foundation Program)

| Package | Lifecycle | Version |
|---------|-----------|---------|
| `@jedi/tokens` | Foundation | 0.2.0 |
| `@jedi/themes` | Foundation | 0.2.0 |
| `@jedi/stylex` | Foundation | 0.2.0 |
| `@jedi/foundation` | Foundation | 0.3.0 |
| `@jedi/react` | Foundation | 0.3.0 |
| `@jedi/icons` | Foundation | 0.3.0 |
| `@jedi/patterns` | Foundation | 0.4.0 |
| `@jedi/docs` | Foundation | 0.4.0 |
| `@jedi/a11y` | Foundation | 1.0.0 |
| `@jedi/motion` | Foundation | 1.0.0 |

Target: all packages reach **Stable** at Foundation Program v1.0 merge to `main`.

---

## Promotion Criteria

| Transition | Requirement |
|------------|-------------|
| Experimental → Foundation | ADR accepted; capability mapped in CAPABILITY-MATRIX; tests pass |
| Foundation → Stable | Phase Definition of Done PASS; public API audit PASS; PR merged to `main` |
| Stable → Deprecated | Superseding ADR; migration guide published |
| Deprecated → Removed | One release cycle elapsed; zero internal consumers |

---

## References

- [CONSTITUTION.md](./CONSTITUTION.md)
- [CAPABILITY-MATRIX.md](./CAPABILITY-MATRIX.md)
- [ADR-000-foundation-program.md](./adrs/ADR-000-foundation-program.md)
