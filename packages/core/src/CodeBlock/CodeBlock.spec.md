---
schema_version: 3
template_version: 7
kind: component
id: component:CodeBlock
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility, testing]
verified_by:
  [
    packages/core/src/CodeBlock/CodeBlock.test.tsx,
    packages/core/src/CodeBlock/highlightRanges.test.ts,
    packages/core/src/CodeBlock/tokenizer.test.ts,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/docPropLiterals.test.ts,
    packages/core/src/docPropReferences.test.ts,
    apps/storybook/stories/CodeBlock.stories.tsx,
    apps/storybook/rtl-audit/targets.json,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs: [spec:AST-025]
---

# CodeBlock component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CodeBlock` and `CodeBlockProps` are exported from `@astryxdesign/core/CodeBlock`; `code` is required, and the remaining released props configure language, header, line presentation, copy, wrapping, sizing, syntax theme, and collapse behavior. |
| Behavior                | CodeBlock renders a read-only multi-line code surface, applies syntax highlighting when available, preserves the source string for copy, and exposes optional line, header, copy, theme, and disclosure behavior without editing the content.       |
| End-user impact         | Readers can inspect and copy code, understand optional line emphasis, and operate long or collapsible examples with keyboard and assistive technology.                                                                                              |
| Builder impact          | Builders choose the documented display and evidence axes; this observational draft adds no prop, default, or migration.                                                                                                                             |
| Compatibility/readiness | The released API and defaults remain stable. The current implementation still gives every code viewport a keyboard stop even when it does not overflow, contrary to `spec:AST-025/FR12`; that retained implementation gap is not accepted here.     |
| Review checks           | Reject lost code text, copy of a transformed string, an unnamed copy or disclosure control, stale disclosure state/wiring, dropped root props/ref, a theme target off its painter, or viewport focusability that ignores effective overflow.        |
| Governing rules         | `architecture:public-component-api/INV1,INV5–INV9`; `architecture:component-theming-surface/INV3–INV7,INV12`; `architecture:component-test-sufficiency/INV1–INV7,INV10–INV11`; `spec:AST-025/FR12–FR13`.                                            |

This table is a review projection; the body below is authoritative only after owner approval.

## Intent

Present read-only, standalone or multi-line code with optional syntax, navigation aids, copy behavior, bounded scrolling, and collapsible disclosure while preserving the caller's source string.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: additive evidence and compatible defect correction; no prop, export, type, default, target, or ref contract changes
- Controlled/uncontrolled behavior: collapse state remains component-owned and starts expanded when applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Read-only multi-line code presentation, built-in and custom token rendering, line numbers and emphasis, header/title/language presentation, copy behavior and feedback, optional wrapping and bounded scrolling, optional collapse behavior, syntax-theme composition, root prop/ref composition, and the documented CodeBlock theme targets.

**Does not own / non-goals**

- Inline code inside prose — owned by `component:Code`.
- The meaning, localization, or bidirectional ordering of caller-supplied code and language identifiers — owned by the product callsite and platform text engine.
- Shared effective-scroll measurement and focus policy — owned by `spec:AST-025`; CodeBlock integrates that capability rather than defining a parallel detector.
- Editing, selection models, validation, execution, or persistence of code — owned by another component or the product callsite.

## Public concepts

| Concept            | Closed values or states                                                        | Meaning                                                                                       | Availability                         | Default     | Owner               | Stability | Invalid-value behavior                           |
| ------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------ | ----------- | ------------------- | --------- | ------------------------------------------------ |
| code content       | caller-supplied string                                                         | Supplies the exact read-only source that is displayed and copied.                             | Every render                         | required    | product callsite    | stable    | rejected by the public type                      |
| language           | built-in identifier, custom-tokenizer identifier, or plaintext/unknown         | Selects tokenization and the optional visible/accessible language label.                      | Every render                         | `plaintext` | component:CodeBlock | stable    | unsupported built-ins render without tokens      |
| line presentation  | numbers off/on; highlights absent or one-indexed line set; wrapped/unwrapped   | Adds navigation and emphasis without changing the copied source string.                       | Code body                            | off/absent  | component:CodeBlock | stable    | out-of-range highlights have no rendered line    |
| header             | absent; title; language label; title and language label                        | Gives the snippet context and houses the copy control when any visible header content exists. | Derived from title and label choices | derived     | component:CodeBlock | stable    | empty visible content still requires AT naming   |
| copy               | hidden; available; transient copied feedback                                   | Copies the exact code string, then invokes `onCopy` only after a successful clipboard write.  | Every render when enabled            | available   | component:CodeBlock | stable    | failed clipboard writes do not invoke `onCopy`   |
| syntax rendering   | auto; CSS ranges; spans; custom tokenizer; optional per-instance syntax theme  | Selects a supported paint path without changing the text or public code semantics.            | Every render                         | `auto`      | component:CodeBlock | stable    | unsupported range capability falls back to spans |
| collapse           | unavailable; expanded; collapsed                                               | Turns an eligible header into a disclosure when the line threshold is met.                    | Long blocks with collapse enabled    | unavailable | component:CodeBlock | stable    | below-threshold blocks remain ordinary blocks    |
| container geometry | card/section; small/medium; fit-content/custom width; unbounded/bounded height | Selects presentation and overflow geometry while preserving the read-only code task.          | Every render                         | card/md     | component:CodeBlock | stable    | values follow their documented CSS/type behavior |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                               | Basis                                                                                                            | Draft review state                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| FR1 | CodeBlock MUST display the caller's code string as read-only code. Built-in or custom tokenization MAY change syntax paint but MUST NOT change displayed or copied source text.                                                                   | released types, source, tests, consumer docs; established public interface                                       | verify                                           |
| FR2 | A successful copy MUST write the exact `code` string, invoke `onCopy` once, expose localized copied feedback, and preserve the copy control's discoverable purpose. A failed write MUST NOT report success.                                       | shipped source/tests; `architecture:component-test-sufficiency/INV2–INV6`; WCAG name/status obligations          | verify                                           |
| FR3 | A title or visible non-plaintext language label MUST create the visible header. Hiding the language label MUST NOT remove copy behavior. Headerless copy remains available when enabled.                                                          | shipped source/tests/docs; established public interface                                                          | verify                                           |
| FR4 | Line numbers, highlighted lines, wrapping, width, container presentation, size, and maximum height MUST affect only their documented presentation axes. Numeric `maxHeight={0}` MUST remain a valid zero-pixel bound rather than being discarded. | released public type/docs; `architecture:public-component-api/INV3,INV9`; objective JavaScript nullish semantics | settled; audit correction verifies zero          |
| FR5 | Collapse MUST become available only when enabled and the line threshold is met. The control MUST expose expanded state and a resolvable controlled region; collapsed content remains mounted but inert, and re-expansion restores access.         | shipped docs/source/tests; WAI-ARIA disclosure pattern and HTML `inert` semantics                                | verify                                           |
| FR6 | The root and documented header/title/copy targets MUST remain on their visible painters, reflect the documented visual axes, and continue emitting the approved deprecated aliases until their authorized removal window.                         | `architecture:component-theming-surface/INV3–INV7,INV12`; source/docs/tests                                      | verify                                           |
| FR7 | Supported DOM, data, ARIA, class, style, and `xstyle` inputs MUST compose on the documented root, and the public ref MUST reach that root.                                                                                                        | `architecture:public-component-api/INV5,INV6,INV8`; shipped source                                               | verify                                           |
| FR8 | The code viewport MUST enter sequential keyboard navigation only while at least one applicable axis effectively overflows; losing overflow MUST NOT move current focus. It retains an appropriate role and accessible name while focusable.       | `spec:AST-025/FR12–FR13`                                                                                         | settled by current authority; implementation gap |

### Allowed variation

- **AV1 — Syntax paint.** Built-in token colors, custom token types, CSS Highlight API use, span fallback, and syntax themes may vary paint without changing the source string or code task.
- **AV2 — Theme paint.** Current CodeBlock targets may vary their accepted visual properties without changing text, control semantics, or ownership.
- **AV3 — Code content.** The product supplies arbitrary code text and the matching language identifier; CodeBlock does not interpret the program's meaning.

### Representative states

| State                          | Required invariant                                                                                  | Allowed variation                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| plaintext/headerless           | Exact source text; localized code viewport name; optional floating copy control.                    | Caller code and container geometry.            |
| titled highlighted code        | Header context, optional line numbers/highlights, exact copy string.                                | Language, title, size, and theme paint.        |
| wrapped or height-bounded      | Content remains readable and copy preserves the source; keyboard focus follows effective overflow.  | Width, height, line count, and writing mode.   |
| collapsible expanded/collapsed | Named disclosure, correct expanded state, resolvable controlled region, inert only while collapsed. | Title/language content and theme paint.        |
| custom syntax path             | Tokens may change paint but not source text or copy output.                                         | Token types, rendering mode, and syntax theme. |

### Transformation and precedence order

- **ORD1 — Source.** Caller code string → line partition → built-in or custom tokenization → range/span paint; copy always consumes the original code string.
- **ORD2 — Header.** Title and eligible language label determine header presence; copy is placed in that header when present and on the root when absent.
- **ORD3 — Styling.** Root theme target and reflected visual axes → base/container/size/dynamic styles → consumer `xstyle`, class, and inline-style composition.

### Performance and resources

- **PR1 — Tokenization.** Short code may tokenize synchronously; long built-in code yields through the async tokenizer and cancels stale work when code or language changes.
- **PR2 — Highlight lifetime.** Range-mode highlighting removes ranges and visibility listeners when its rendered token set changes or unmounts.
- **PR3 — Large line sets.** Large blocks may chunk line rendering and use content visibility, without losing source order or line identity.

## Accessibility contract

- **AR1 — Named controls.** Every rendered copy and disclosure control has a non-empty accessible name, including when title text is empty or whitespace-only.
- **AR2 — Disclosure.** The collapsible header exposes expanded state and its controlled region, toggles with pointer, Enter, and Space, and makes collapsed descendants inert without removing the controlled region.
- **AR3 — Copy feedback.** Copy success updates the control name and emits one localized polite announcement; the visible purpose remains available through the tooltip.
- **AR4 — Scroll access.** A named viewport enters the tab order only for effective overflow and retains native Arrow/Page access, per `spec:AST-025/FR12–FR13`.

## Design relationships

| Anatomy or state  | Design requirement                                                                           | Representation authority        | Hierarchy role      | Component contract |
| ----------------- | -------------------------------------------------------------------------------------------- | ------------------------------- | ------------------- | ------------------ |
| Header Bar        | Provides supporting file/language context and houses the optional disclosure/copy controls.  | observed shipped representation | supporting context  | FR3, FR5, AR1–AR3  |
| Header Title      | Groups the visible title, language label, and disclosure indicator inside the header.        | observed shipped representation | supporting context  | FR3, FR5, AR1–AR2  |
| Line Numbers      | Support code navigation without becoming part of copied source.                              | observed shipped representation | supporting metadata | FR1, FR4           |
| Code Body         | Keeps code text dominant, readable, scrollable or wrappable, and syntax-themed.              | observed shipped representation | primary content     | FR1, FR4, FR8      |
| Highlighted Lines | Add optional emphasis without replacing or mutating the source string.                       | observed shipped representation | supporting emphasis | FR1, FR4           |
| Copy Button       | Exposes the code-copy action and transient success feedback without toggling the disclosure. | objective interaction semantics | secondary action    | FR2, AR1–AR3       |

No current design record prescribes exact CodeBlock proportions or syntax colors. This observational draft records the shipped representation without turning those pixels into policy.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Header Bar": {"target": "code-block-header"},
  "Header Title": {"target": "code-block-title"},
  "Line Numbers": {"inherits": "code-block"},
  "Code Body": {"target": "code-block"},
  "Highlighted Lines": {"inherits": "code-block"},
  "Copy Button": {"target": "code-block-copy-button"}
}
```

## Family and system relationships

- `architecture:public-component-api` owns export reachability, accepted root props, styling composition, ref reachability, released defaults, and consumer documentation.
- `architecture:component-theming-surface` owns target qualification, target placement, visual-axis reflection, anatomy disposition, and deprecated target-alias compatibility.
- `architecture:component-test-sufficiency` owns rational evidence partitions and mutation-sensitive proof for the component's established public interfaces and objective standards.
- `spec:AST-025` owns effective overflow measurement, scroll focus, naming, chaining, and focus stability. CodeBlock owns its viewport/content structure and integrates that shared behavior.

## Verification map

| Contract          | Verification                                                                                    | Representative states                                       | Mutation or failure expectation                                                                                    | Audit section              |
| ----------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| FR1, PR1–PR3      | `tokenizer.test.ts`; `highlightRanges.test.ts`; CodeBlock focused tests and built Storybook     | short/long, built-in/custom, ranges/spans, empty lines      | Text changes, stale tokens paint, ranges leak, source order changes, or long work stops yielding/canceling.        | `audit:CodeBlock/behavior` |
| FR2, AR1, AR3     | `CodeBlock.test.tsx`; component-scoped accessibility audit                                      | copy success, rapid repeat, localized feedback, empty title | Exact source is not copied, callback fires on failure, announcement is absent/duplicated, or a control is unnamed. | `audit:CodeBlock/a11y`     |
| FR3–FR5, AR2      | `CodeBlock.test.tsx`; `CodeBlock.stories.tsx`; exact-head browser evidence                      | headerless, titled, zero max height, line options, collapse | Header/copy placement changes, zero is dropped, disclosure state/wiring/keyboard behavior breaks, or inert leaks.  | `audit:CodeBlock/behavior` |
| FR6               | `themingTargets.test.ts`; consumer docs; source review                                          | root, header, title, copy; current and deprecated names     | A target leaves its painter, an axis stops reflecting, or a deprecated alias disappears before authorization.      | `audit:CodeBlock/theming`  |
| FR7               | focused root-prop/ref tests; strict lint/typecheck; consumer-doc validation                     | ref plus supported root/style/data/ARIA inputs              | The ref misses the root, accepted props disappear, or styling inputs replace rather than compose.                  | `audit:CodeBlock/api`      |
| FR8, AR4          | `spec:AST-025` integration evidence plus real-browser fit/overflow/focus transitions            | fitting, inline overflow, block overflow, losing overflow   | A fitting viewport adds a stop, overflow is unreachable, naming disappears, or focus moves when overflow ends.     | `audit:CodeBlock/a11y`     |
| RTL               | `rtl:audit -- --filter CodeBlock` D2 target plus exact-head browser evidence                    | title and copy order in LTR/RTL                             | Logical order fails to mirror or physical placement leaks.                                                         | `audit:CodeBlock/rtl`      |
| Consumer metadata | CLI `component CodeBlock --json`; docs typecheck; prop/target validation; package-export checks | released props/defaults/ref and current/deprecated targets  | A released prop/default/ref/target disappears from consumer discovery or docs name an unsupported value.           | `audit:CodeBlock/docs`     |

## Decision log

None. This audit records shipped behavior and current authority, corrects objective defects, and does not make a new product decision.

## Open questions

None. The retained `spec:AST-025/FR12` integration gap has a current owner and required outcome; it is implementation work, not an unresolved product decision.

## Content boundary

This file does not duplicate consumer prop tables/examples, syntax-token definitions, current audit scores, implementation steps, or shared scrolling/theming rules. It links to their owners.
