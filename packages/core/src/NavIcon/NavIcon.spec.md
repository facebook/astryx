---
schema_version: 3
template_version: 3
kind: component
id: component:NavIcon
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [theming]
verified_by:
  [packages/core/src/NavIcon/NavIcon.test.tsx, scripts/check-knowledge.mjs]
modules: []
families: []
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:public-component-api]
contributing: []
system_specs: []
---

# NavIcon component contract

## Intent

NavIcon renders caller-supplied icon content inside a circular navigation
container. This draft records the current consumer anatomy and theming ownership
without changing runtime behavior or target compatibility.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, aliases, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The circular container and its current `nav-icon` theming target.

**Does not own / non-goals**

- The artwork or component supplied through `icon` — owned by the caller.
- Interaction semantics — NavIcon remains a display-only container.

## Public concepts

No new public concept is introduced. Consumer props and usage remain documented
in `NavIcon.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                              | Basis                           | Draft review state                                 |
| --- | ------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------- |
| FR1 | The current render contains a circular container and the caller-supplied icon content.           | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR2 | The container carries `nav-icon`; the deprecated `navicon` alias remains compatibility metadata. | Current source, docs, and tests | Verified current behavior; no target change        |

### Allowed variation

- Caller-supplied icon artwork and implementation may vary without becoming
  NavIcon-owned anatomy.

### Representative states

- The documented anatomy is the same for every caller-supplied icon.

### Transformation and precedence order

- No new ordering rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend NavIcon's existing accessibility behavior.

## Design relationships

| Anatomy or state | Design requirement                             | Representation authority       | Hierarchy role    | Component contract |
| ---------------- | ---------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Container        | Presents the current circular painted surface. | Current source and public docs | Supporting        | FR1, FR2           |
| Icon             | Presents caller-supplied visual content.       | Caller-supplied content        | Context-dependent | FR1                |

The deprecated `navicon` alias is compatibility metadata, not a separate anatomy
part or current target.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Container": {"target": "nav-icon"},
  "Icon": {"inherits": "nav-icon"}
}
```

## Family and system relationships

This draft references the current shared owners without restating their rules:
`architecture:component-theming-surface` and
`architecture:public-component-api`. The deprecated `navicon` alias remains
compatibility metadata rather than separate anatomy.

## Verification map

| Contract            | Verification                         | Representative states                 | Mutation or failure expectation                                                       | Audit section           |
| ------------------- | ------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------- |
| FR1                 | `NavIcon.test.tsx` content suite     | Caller-supplied icon                  | Removing the container or supplied content fails existing render and ref assertions.  | `audit:NavIcon/anatomy` |
| FR2                 | `NavIcon.test.tsx` target-name suite | Current and deprecated target classes | Removing either emitted compatibility class fails the existing target assertion.      | `audit:NavIcon/theming` |
| Theming anatomy map | `scripts/check-knowledge.mjs`        | Canonical anatomy and current target  | Missing, extra, prefixed, stale, or alias-backed mappings fail repository validation. | `audit:NavIcon/theming` |

## Decision log

None. This draft records current facts and introduces no component-local design
decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or system rules. It links to their owners.
