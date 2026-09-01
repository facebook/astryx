---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:public-component-api
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
applies_to:
  [
    packages/core/src/,
    packages/core/package.json,
    packages/core/src/BaseProps.ts,
    packages/cli/authoring/doctypes/component/,
    internal/eslint-plugin-astryx/,
  ]
verified_by:
  [
    internal/eslint-plugin-astryx/require-base-props.js,
    internal/eslint-plugin-astryx/require-baseprops-passthrough.js,
    packages/core/src/docPropLiterals.test.ts,
    packages/core/src/docPropReferences.test.ts,
  ]
deciding_specs: [spec:AST-002/DEC-1, spec:AST-005/DEC-1]
---

# Public component API

This record defines the shared public API contract for stable Astryx components.

## Purpose

Consumers should be able to predict how an Astryx component is imported,
controlled, extended, and composed without learning its internal implementation.
New API should express caller-owned intent and preserve established behavior.

## System model

The installable package is the public contract. It includes:

- exported components and hooks;
- exported props and stable supporting types;
- published component subpaths;
- documented defaults; and
- behavior consumers can observe.

Consumer `.doc.mjs` files explain that contract. They do not create props or
policy that the exported code does not have.

Once this record is `current`, every current component contract lists
`architecture:public-component-api` in its `architecture` links. Draft component
contracts add that link only after this record becomes current, so candidate
relationships do not create authority early.

Component and family contracts own narrower behavior. Theme records own theme
targets, public theme properties, tokens, and generated styles. Contribution
guidance owns the process used to propose and test APIs.

## Boundaries and invariants

- **INV1 — Public exports are reachable.** A stable component, hook, prop type,
  and other promised public types are available from their published package
  entry point or component subpath.
- **INV2 — Names carry the same meaning.** Components, hooks, booleans,
  callbacks, Actions, directions, refs, and native HTML pass-throughs follow the
  shared naming grammar. Component-specific vocabulary stays local.
- **INV3 — One prop controls one independent concept.** A prop does not silently
  suppress an unrelated prop. A parent does not duplicate state already owned by
  a composed child.
- **INV4 — New props express caller-owned intent.** New public props follow
  `spec:AST-002/DEC-1`. A component keeps a decision internal when it can derive
  the correct result from state, content, layout, context, or platform behavior.
- **INV5 — Accepted consumer props are preserved.** For a DOM-owning component,
  supported DOM, data, ARIA, style, class, and event inputs reach the element that
  owns the contract. Component-owned accessibility and behavior cannot be
  accidentally overwritten.
- **INV6 — Styling inputs combine.** `xstyle`, `className`, and `style` compose in
  their documented order instead of replacing one another.
- **INV7 — Event handlers compose deliberately.** Consumer handlers and built-in
  behavior use the shared cancellation contract. A consumer can cancel built-in
  behavior only where that public API promises cancellation.
- **INV8 — Refs follow React 19.** A public DOM component accepts `ref` as a prop
  and connects it to the element promised by its contract.
- **INV9 — Released APIs change deliberately.** A released prop, type, export,
  default, or observable behavior is not removed, renamed, or retyped without an
  explicit compatibility decision and migration.
- **INV10 — Shared subcontracts are linked, not copied.** Input Actions, layer
  behavior, theming, and family-specific rules stay with their owning records.
- **INV11 — Public theme seams pass API admission.** A public semantic CSS custom
  property is admitted only for caller-owned intent that the target's guaranteed
  CSS property set cannot express. Its theming record owns the exact purpose,
  stable default/fallback, scope, documentation, evidence, and compatibility
  contract; an internal styling gap alone does not justify public API.

This record applies to stable public packages. Lab components are not stable
public promises until promotion.

## Change coupling

- Adding or changing an exported prop, type, default, package entry point, ref
  target, or intentional observable contract triggers public-API review.
- A bug fix that restores an existing current contract or standard is
  `preserves`. It requires regression evidence, but it does not create a new API
  decision.
- Consumer docs change when consumer usage or a documented promise changes, or
  when the existing docs would otherwise become false. Fixing an implementation
  defect does not by itself require consumer-doc changes.
- A new prop includes the admission argument from `spec:AST-002/DEC-1`; it does
  not get accepted only because it solves one callsite.
- A new public semantic CSS custom property includes the same admission argument
  and shows why the target's guaranteed CSS property set cannot express the
  caller-owned need. Its detailed contract and evidence stay in the owning
  theming/component records.
- A released breaking change includes the compatibility decision and migration
  evidence required by the release process.
- Changes to a family-owned API update the family contract rather than copying
  its rule into this record or every component.
- A component that accepts or derives a navigation destination follows
  `family:navigation-destinations`. Adding a new sink or destination-bearing
  component updates that family rather than creating a component-local URL rule.

## Owning code

- Public package manifests and component barrels own reachable exports.
- Component prop/type definitions and runtime behavior own the actual API.
- `BaseProps` defines the shared DOM/styling surface for DOM-owning components.
- `.doc.mjs` files own consumer-facing prop descriptions, defaults, and examples.
- Astryx ESLint rules and API/doc tests check the shared contract.

## Deciding specs

- `spec:AST-002/DEC-1` — a new public prop requires caller-owned information the
  component cannot derive.
- `spec:AST-005/DEC-1` — every Astryx-owned navigation exit follows one
  destination-safety decision.

Transition Action sequencing and pending behavior belong to their component or
family contract. This record links that owner once it is current; it does not
copy the component matrix.

## Verification

| Invariant               | Evidence                                                        | Failure signal                                                                               |
| ----------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| INV1, INV8              | Export, public-subpath, prop, and ref checks                    | A promised component/type cannot be imported or its ref cannot reach the contract element    |
| INV2                    | Naming and logical-direction lint/tests                         | Equivalent concepts use conflicting names or physical direction leaks into public API        |
| INV3, INV4              | Historical API review benchmark and `spec:AST-002` evidence     | A prop combines unrelated axes or exposes a derivable implementation choice                  |
| INV5, INV6, INV7        | BaseProps/passthrough lint and representative runtime tests     | Consumer ARIA/data/style/events are dropped, clobber component semantics, or fail to compose |
| INV9                    | Published-surface, Changeset, migration, and public-type checks | A released API changes without explicit compatibility evidence                               |
| INV11                   | Public-API admission review plus owning theming/component tests | A public semantic custom property exposes derivable or unsupported implementation detail     |
| Consumer-doc projection | `docPropReferences.test.ts` and `docPropLiterals.test.ts`       | Docs name a nonexistent prop or omit public literal choices                                  |

Known verification gaps:

- The passthrough lint is warning-only while known violations remain.
- The current source-to-doc completeness matcher still looks for old prefixed
  props interfaces, so it does not yet prove full prop coverage.

These gaps are named here rather than treating partial checks as complete proof.
