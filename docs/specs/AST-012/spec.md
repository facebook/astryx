---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-012
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-02
phase: accepted
owners: [cixzhang, rubyycheung, imdreamrunner]
affects_architecture:
  [
    architecture:component-theming-surface,
    architecture:public-component-api,
    architecture:theme-authoring-contract,
    architecture:theme-compilation,
    architecture:theme-application,
  ]
affects_families: []
affects_contributing: []
affects_consumer_docs: [theme, AppShell]
---

# Theme adaptations

## Intent

Themes should express opt-in token and component adaptations for environmental
conditions without a second theme, handwritten media-query CSS, or React state.
The system is named `adaptations`, not `responsive`, because conditions may cover
width, pointer precision, contrast preference, motion preference, and future
reviewed environment axes.

```ts
defineTheme({
  adaptations: {
    widthBreakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    rules: [
      {
        when: {
          width: {from: 'lg', below: 'xl'},
          pointer: 'coarse',
          contrast: 'more',
        },
        value: {
          components: {/* overrides */},
        },
      },
    ],
  },
});
```

`widthBreakpoints` are named points where width tiers start. `width.from` includes
its point and `width.below` excludes it, so `{from: 'lg', below: 'xl'}` is the
exact `lg` band. Fields in `when` are ANDed.

A breakpoint map alone emits no CSS. Only rules with adaptation values do.

## Non-goals

- Adding adaptation rules to bundled themes or choosing product-specific values.
- Defining responsive policy for FormLayout, layout primitives, or product
  layouts.
- Accepting raw media-query strings, user-defined condition fields, or user-defined
  breakpoint names. New environment axes remain explicit API additions.
- Changing color-mode resolution or MediaTheme's surface detection and meaning.
- Making responsive components consume theme adaptation rules; components may
  resolve shared width points, but their behavior remains separately owned.
- Adapting non-CSS token reads used by canvas, data visualization, or other
  JavaScript consumers; those continue to resolve root theme values.

## Requirements

- **FR1 — Width breakpoints are fixed start points.** Every theme has the effective
  `widthBreakpoints` map `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`,
  `2xl: 1536` CSS pixels unless it overrides values for those fixed names. Values
  MUST be finite, positive, and strictly increasing. Root values are the implicit
  base below `sm`; there is no configurable `xs: 0` point. Defining or overriding
  the map alone MUST NOT emit CSS.
- **FR2 — Conditions are named, closed, and composable.** A `when` object may
  contain `width`, `pointer`, `contrast`, and `motion`; fields are ANDed.
  `width` accepts `from` and `below` using the five fixed names and MUST contain
  one or both. `from` is inclusive, `below` is exclusive, either edge may be
  omitted but not both, and a bounded width MUST resolve to `from < below`.
  `pointer` accepts `coarse | fine`; `contrast` accepts
  `more | less | no-preference`; `motion` accepts `reduce | no-preference`.
  Future environment fields require explicit additions to this closed vocabulary.
- **FR3 — Rules are named objects.** `adaptations.rules` contains
  `{when, value}` objects, not positional tuples. Empty `when` is invalid. A value
  that must apply at every width after earlier rules is expressed by later rules
  covering `{width: {below: 'sm'}}` and `{width: {from: 'sm'}}`. Rules with no
  changed value may emit no CSS.
- **FR4 — Rules use the theme value contract.** `value` may contain `typography`,
  `color`, `radius`, `motion`, `tokens`, `components`, and `localTokens`
  overrides. `rules[].value.localTokens` is not an enrollment surface: only root
  `localTokens` or an enrolled exact base declares names. A rule may replace only
  an exact name already enrolled in the effective lineage and uses AST-006's
  `TokenValue` normalization and validation. Identity, inheritance, syntax, icons,
  indicators, media-surface fields, and adaptations remain root-owned. Within one
  rule, values use the root expansion, deep-merge, and kind precedence. A
  generative axis expands against the root axis metadata, and every produced leaf
  counts as a write by that rule. Missing required scale fields MUST be supplied
  rather than synthesized from approximate built-in defaults. A rule may style an
  existing component visual-prop value but MUST NOT introduce a new value; states
  are component-owned and never theme-generated.
- **FR5 — Media surfaces remain more specific.** Adaptation values resolve over the
  root theme. When an `onDark` or `onLight` override and an adaptation write the
  same resolved leaf, the media-surface value wins. Adaptations do not create a
  nested media-surface grammar.
- **FR6 — Rule order determines precedence.** Root values apply before adaptation
  rules, except media-surface overrides, which apply after them under FR5. Rules
  cascade in declaration order and the last matching write to each resolved token
  or component leaf wins. Condition shape creates no independent specificity
  score. Duplicate `when` objects are valid. Reordering overlapping rules is an
  intentional behavior change.
- **FR7 — Theme extension preserves cascade order.** A child inherits the base
  width-breakpoint overrides and ordered rules. Breakpoints merge by name.
  Inherited rules keep their relative order and resolve against the child's
  effective map; child rules append after them. There is no removal operator: an
  empty child value is a no-op, and inherited behavior is neutralized only by a
  later child rule writing the affected leaf. A child's root value never overrides
  a matching inherited rule because root values apply before adaptation rules.
- **FR8 — AppShell shares width points.** `mobileNav.breakpoint` accepts the five
  width-breakpoint names plus `none`. For a selected name, mobile mode applies only
  while `width < effectiveWidthBreakpoints[name]`; equality belongs to the wider
  side. `none` never matches. AppShell reads the nearest Theme context; without
  provider context it follows the root-theme fallback in
  `architecture:theme-application`, and with no active theme it uses the FR1
  defaults. `defaultIsMobile` remains an SSR hint; the client query uses the
  effective map after hydration.
- **IR1 — Normalize and reject atomically.** One path validates width breakpoints,
  named condition fields, width ranges, theme extension, enrolled local-token
  names, and concrete expanded values for both `defineTheme` and
  `astryx theme build` before either produces partial output. `defineTheme` retains
  normalized generative-axis metadata on every effective `DefinedTheme`; static
  build preserves the same metadata under IR4.
- **IR2 — Adaptation values are CSS-first.** Once the theme stylesheet is applied,
  adaptation values resolve from CSS alone without a JavaScript rerender, resize
  listener, or hydration correction. Runtime Theme injection and static build use
  the same normalized rules, scope, and cascade. Root values emit before rules;
  rule blocks preserve declaration order; media-surface overrides emit after rules
  where both apply. Output MUST NOT merge, reorder, or drop rule blocks when doing
  so changes the cascade, including duplicate `when` objects and later rules that
  restore root values. Every component leaf lowers to the same declaration target
  as its root equivalent, including derived private-variable expansion. `useTheme`
  token reads and server-safe token helpers remain root-value reads.
- **IR3 — Tooling sees rule-only values.** Validation, component diagnostics,
  private-variable checks, font notices, and `light-dark()` color-scheme detection
  MUST inspect values declared only in rules. Generated variant/type validation
  MUST reject a rule-only visual-prop value absent from the effective root
  component surface.
- **IR4 — Built themes preserve extension semantics.** A built theme's JavaScript
  module retains the effective width-breakpoint map, normalized generative-axis
  metadata, enrolled local-token lineage, and ordered normalized rules required
  for source-equivalent `extends`; it does not embed emitted CSS text. A child
  inherits and resolves adaptations from a built base exactly as from a source
  base.

### Platform support

- Adaptations use viewport-width, primary-pointer, contrast-preference, and
  reduced-motion queries within Astryx's browser support floor; there is no
  JavaScript styling fallback.
- Real Chromium MUST verify conditions, nesting, AppShell agreement, and first
  paint. Real Safari MUST verify exclusive width edges and primary-pointer
  classification; Playwright WebKit alone is not Safari evidence.

## Current-state impact

Current `main` has no theme adaptation API. AppShell exports only
`sm | md | lg | none`, hardcodes the first three points, and treats equality as
mobile. This proposal adds `xl` and `2xl`, resolves all names through the active
theme, and makes the upper edge exclusive. The AppShell union expansion is
additive; the equality change is a breaking behavior change and requires the
corresponding release note when implemented.

This change affects `architecture:component-theming-surface`,
`architecture:public-component-api`, `architecture:theme-authoring-contract`,
`architecture:theme-compilation`, and `architecture:theme-application`. Their
current contracts remain authoritative until this draft is accepted and
implemented.

#5543's public tier API is superseded by DEC-1 and DEC-2 and MUST NOT land as-is.
Its value resolver, explicit-value preservation, CSS generation/build parity, and
extension metadata remain useful implementation evidence.

## Verification

| Contract | Verification                                                  | Representative states                                                                                                                                                    | Failure signal                                                                                                                                          |
| -------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR3  | Width-breakpoint and condition matrix plus browser boundaries | defaults/overrides; from/below/range; pointer/contrast/motion; multi-field AND; empty/no rules                                                                           | A point acts as an upper bound, intervals gap/overlap, fields OR together, or an unused map emits CSS.                                                  |
| FR4–FR7  | Shared resolver, surface, cascade-order, and extension tests  | enrolled/unenrolled local tokens; incomplete scales; later generated vs earlier explicit leaves; surface collisions; broad/narrow reorder; child append/removal attempts | A rule enrolls a local name, widens vocabulary, approximates missing input, escapes order, beats a surface, or loses inherited order.                   |
| FR8      | Theme/AppShell integration                                    | all names/`none`; SSR hint; no/nearest/root/nested theme; exact boundaries                                                                                               | AppShell uses the wrong map, equality, or scope.                                                                                                        |
| IR1–IR3  | Runtime/build and CLI positive/negative fixtures              | invalid map/range/field; source axis metadata; duplicate `when`; root-restoring rules; declaration targets; rule-only visual values; non-CSS token reads                 | Invalid input writes output, metadata disappears, blocks merge/reorder/drop, targets diverge, adaptation leaks into JS reads, or tooling misses values. |
| IR4      | Generated-module import and size tests                        | no rules/rules; source/built parent and child; generative/local-token metadata                                                                                           | Breakpoints, rules, order, or metadata disappear; extension diverges; CSS text enters the module; or resolved layers duplicate.                         |

## Decision log

The decisions below were approved by `cixzhang` as part of this current accepted
specification.

### DEC-1 — Use adaptations with width-specific breakpoints

**Reference:** `spec:AST-012/DEC-1`
**Decider:** `cixzhang`, `2026-09-02`

Use `adaptations`, not `responsive` or `responsiveness`, because the system covers
multiple environmental axes. Width points live under `widthBreakpoints`, not a
generic `breakpoints` field, leaving room for a future independent
`heightBreakpoints` namespace. Astryx owns `sm`, `md`, `lg`, `xl`, and `2xl`
with defaults 640, 768, 1024, 1280, and 1536. Width points mark tier starts and
emit no CSS without rules.

Rejected: responsive-only naming, generic breakpoint storage, custom width names,
and upper-bound named tiers.

### DEC-2 — Use named rules with nested width conditions

**Reference:** `spec:AST-012/DEC-2`
**Decider:** `cixzhang`, `2026-09-02`

Rules use `{when, value}` objects. `width: {from, below}` expresses inclusive
lower and exclusive upper edges. Environmental fields in `when` are peers and are
ANDed.

Rejected: positional tuples, flat `minWidth` / `maxWidth`, nested literal
`@media` keys, and arbitrary raw queries.

### DEC-3 — Use declared rule order as precedence

**Reference:** `spec:AST-012/DEC-3`
**Decider:** `cixzhang`, `2026-09-02`

Rules follow cascade order. Root values apply first, inherited rules keep their
order, and child rules append. In any matching environment, the last rule to write
a resolved leaf wins. Duplicate conditions are valid, and reordering overlapping
rules is intentionally behavioral.

Rejected: inferred precedence from condition shape or conflict rejection for
incomparable conditions.

### DEC-4 — Preserve adaptations through built extension

**Reference:** `spec:AST-012/DEC-4`
**Decider:** `cixzhang`, `2026-09-02`

Built and source themes preserve equivalent width-breakpoint and normalized-rule
data for `extends`, while emitted CSS remains a separate artifact.

Rejected: compiling away authoring intent from built bases and silently narrowing
the existing theme-extension contract.

## Open questions

None.
