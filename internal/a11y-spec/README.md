# @astryxdesign/a11y-spec

Reusable accessibility spec tests: one standards-traceable contract per adopted
widget pattern, bound to the components that implement it. **Internal and
unpublished.**

Authored under [`docs/specs/AST-020`](../../docs/specs/AST-020/spec.md)
(how a contract is written) and
[`docs/specs/AST-021`](../../docs/specs/AST-021/spec.md)
(how existing component tests migrate into one). Read those first; this file
explains the code that implements them.

## Why a contract instead of more component tests

Take the switch pattern. Every component that adopts it owes the same things: the
control is reported as a switch, it has a name that does not change when the
state does, its on/off state is exposed and matches what is rendered, pointer
and keyboard both turn it on and back off, a press slid off and released
elsewhere is taken back, focus stays put when the state changes, and focus can
reach the control and leave it. Writing that per component means reinterpreting
WCAG and the APG each time, and the interpretations drift.

So the pattern is written once, as data, and components bind to it. A binding
says which states it has and what each state is supposed to be; the contract
asks the browser what it actually exposes.

## Shape

```
src/
├── contract.ts    Expectation, PatternContract, definePattern (the schema gate)
├── checklist.ts   the completeness dimensions every pattern must answer
├── harness.ts     the Harness/Subject seam and the evidence-layer vocabulary
├── check.ts       checkAccessibilitySpec — low-level result for reports/mutation proof
├── expect.ts      expectAccessibilitySpec — component-facing render + subject assertion
├── report.ts      separate facts, and the gate over them
├── harness/
│   ├── jsdom.ts       observes unit + DOM. Refuses everything above.
│   └── chromium.ts    observes DOM + accessibility tree + real browser.
├── spoken.ts      how a visible label is compared against a computed name
├── storybook.ts   a static server over a built Storybook, for the browser lane
└── patterns/
    ├── checkbox.*           the checkbox pattern, same four files
    ├── switch.*             the switch pattern, same four files
    ├── button.*             the button pattern, same four files
    ├── text-input.*         the native text-input pattern, same four files
    ├── modal-dialog.*       the native modal-dialog pattern, same four files
    └── status-message.*     live-region and progress status mechanics
```

## The patterns

| Pattern          | Adopted from                                                                                 | Bound by                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `checkbox`       | [APG checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)                           | CheckboxInput, CheckboxListItem, DropdownMenuCheckboxItem, SelectableCard        |
| `switch`         | [APG switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)                               | Switch                                                                           |
| `button`         | [APG button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)                               | Button, IconButton, ClickableCard, SideNavCollapseButton, ChatSendButton         |
| `text-input`     | Native HTML controls and [WAI-ARIA textbox](https://www.w3.org/TR/wai-aria-1.2/#textbox)     | TextInput, TextArea                                                              |
| `modal-dialog`   | [APG dialog (modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)                 | Dialog                                                                           |
| `status-message` | [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Toast, FieldStatus, Spinner, ChatSystemMessage, ChatTypingIndicator, ProgressBar |

The `status-message` contract is WCAG-derived rather than an APG widget
pattern. It covers the browser-observable mechanics of polite and assertive live
regions plus progress bars: the channel and whole-message exposure, an empty
region before a live update, in-place show/replace/clear transitions, a DOM
change for repeated identical text, preserved focus, and progress role/name/value
updates. It does **not** claim speech, braille, timing, ordering, cadence, or
repetition; those outcomes remain real-AT evidence under AST-009. The repeated
DOM-mutation check is advisory for exactly that reason.

role-bearing `<input>` or `<textarea>` only; composed clear and tooltip buttons
keep their button contract. Password fields bind to persistent naming, state,
focus, and editing expectations, while HTML-AAM defines no corresponding ARIA
role and leaves their protected value representation platform-specific.

The button pattern covers the ordinary command button. A toggle button carries
`aria-pressed` and is its own pattern; anything that adopts link semantics — an
Astryx button given `href` renders an anchor — belongs to the link pattern,
because the APG is explicit that the two functions are distinct.

Some patterns need something the control itself cannot show. A switch says
whether it is on, so "pressing it worked" is readable from the control; a
button's action leaves no trace on the button at all. A pattern like that reads
`activations()` from the run context, and the BINDING supplies the count — a
binding that does not makes every expectation reading it fail loudly, never
pass quietly.

Ordering-sensitive focus expectations similarly read `initialFocusEntry()`.
The binding starts recording before its subject can receive focus and supplies
whether the subject was already in its native modal state at the first entry;
a missing observation is a binding fault, not a contract pass or failure.

## Evidence layers are the load-bearing idea

An expectation names the layer that characterizes its claim, plus — in
`alsoNeeds` — any further layer its own body reads. An interaction expectation
is the usual case: "clicking turns it on" is a real-browser claim, but reading
the resulting state is an accessibility-tree observation, so it needs both. A
harness declares which layers it can observe, and the runner will not run an
expectation whose layers a harness cannot all see — it reports `unrun`, naming
the ones that were out of reach.

That is why the jsdom lane is small. jsdom renders markup; it does not compute
an accessibility tree, resolve a real tab sequence, or turn a key press into an
activation. Reporting those as passes because the attributes look right is the
exact failure [`AST-009`](../../docs/specs/AST-009/spec.md) is written against,
so this package reports them as unrun instead and proves them in Chromium.

| Status            | Meaning                                               | Gates                              |
| ----------------- | ----------------------------------------------------- | ---------------------------------- |
| `pass`            | the outcome was observed                              | —                                  |
| `fail`            | the outcome was absent                                | when the expectation is `required` |
| `known-failure`   | the exact recorded historical failure, still failing  | no                                 |
| `unexpected-pass` | a recorded failure that now passes; delete the record | yes                                |
| `not-applicable`  | this state cannot exercise the outcome                | —                                  |
| `unrun`           | a layer this expectation reads was out of reach here  | —                                  |

No status is averaged into another, and there is no score. A pattern with one
required failure is not "mostly conformant" (AST-021 FR11).

## Authoring a pattern

1. Read the applicable WCAG criteria and versioned web standards, plus the APG
   pattern only when a current Astryx record adopts one.
2. Write the expectations. Each needs a stable id, a user outcome in plain
   language, exact sources, an applicability condition, an evidence layer (plus
   `alsoNeeds` for any further layer its body reads), and an enforcement class.
   `definePattern` refuses anything less.
3. Answer every completeness dimension in `checklist.ts` — either an expectation
   names it in `covers`, or the pattern exempts it with an owner, a verification
   method, and a real reason. A criterion the pattern owns only part of takes
   both: the expectation, plus an exemption marked `coversRemainderOnly` naming
   who holds the rest, so the encoded half never implies the whole. Reports
   print those as `part-encoded … — remainder → owner`, distinct from a plain
   `exempt`. `unansweredDimensions` lists what is left, and the pattern's suite
   asserts that list is empty.

   Applicability is normally declared, in `appliesWhen`, where a reader can see
   it. When it can only be discovered from the page — 2.5.3 has nothing to
   compare when nothing is rendered visibly — call `notApplicable(reason)` from
   the run. It reports `not-applicable` with that reason; returning early would
   report a pass, which claims an outcome was observed.

4. Write a conforming fixture per state and a violating fixture per expectation,
   then prove each expectation fails against its own violation. An expectation
   nobody has watched fail is a claim, not a check (AST-020 FR11).

`required` is earned by a directly applicable WCAG 2.2 A/AA criterion, or by a
current Astryx record adopting the outcome — never by how easy the check was to
write.

An Astryx record can therefore make an expectation gate, so citing one is held
to the same standard as citing a specification: name the record (`family:buttons`),
name the clause (`FR3`), quote the requirement exactly, and link to a public
GitHub URL pinned to a full commit sha. `definePattern` refuses anything less —
a branch or tag link moves out from under the quote, and a link into an internal
system is one a reviewer of this repository cannot open. Quote the operative
sentence only: splicing a MUST to the MAY that follows it cites a requirement
the record does not make. "Directly applicable" means the criterion is the expectation's PRIMARY
source: a supporting citation further down the list is not adoption, or any
expectation could buy a gate by appending a plausible criterion. Everything else
is `advisory` and has to say why.

## Binding a component

A binding lives with the component:

```
packages/core/src/Switch/__tests__/
├── Switch.a11y.states.ts          which states exist and what each declares
├── Switch.a11y.known-failures.ts  what does not work yet, exactly
├── Switch.a11y.test.tsx           the jsdom lane
└── Switch.a11y.chromium.spec.ts   the Chromium lane, over checked-in stories
```

The binding designates its own subject — by role for a conforming component, by
a fixture-owned hook for a deliberately violating fixture — so a mutation flips
exactly the expectation under test instead of making the subject unfindable.

Component-specific behaviour does not move: callbacks, form data, composition,
and styling stay in the component's own suite (AST-021 FR5).

The fast component lane uses the assertion API directly, so the test visibly names
the accessibility specification, the component render, and its role-bearing subject:

```tsx
await expectAccessibilitySpec({
  spec: BUTTON_PATTERN,
  binding: state.binding,
  state: state.id,
  facts: state.facts,
  render: () => render(<Button label="Save" />),
  subject: () => screen.getByRole('button'),
  cleanup,
});
```

`expectAccessibilitySpec` fails the test on required failures and unexpected passes.
Lower-level contract fixtures, Chromium bindings, report generation, and mutation
proof use `checkAccessibilitySpec`, which returns the complete factual result without
asserting it.

Some stateful patterns ask the binding to perform a named public transition.
The binding drives that transition through its public API; the contract then
observes the same subject again. `Subject.textChangesDuring()` records DOM text
mutations around one such transition, which lets the status-message contract
prove that identical text is cleared and reinserted without claiming an actual
assistive-technology announcement.

## Known failures

A known failure names one expectation, one binding, one state, one evidence
layer, the exact standards reference, the exact failure, the user impact, and why
the migration is not the place to fix it. It still runs, it still fails, and is
reported as debt. Operational ownership stays in the project's durable gap
registry rather than in public source. The record matches the complete failure
message, not a
substring; a different message, another state, or a wider failure remains a
`fail` rather than being absorbed by the record. Required failures gate;
advisory failures remain report-only under AST-020 FR9. A full binding sweep
also requires every record to match exactly one executed result, so deleted
states and renamed expectations cannot orphan debt. An expectation that starts
passing is reported as an unexpected pass so that exact stale record is deleted;
the separately owned operational gap is reconciled only when no remaining record
refers to it (AST-021 FR8–FR10).

## Running

```bash
# jsdom lane — part of `pnpm test`
pnpm vitest run --project node internal/a11y-spec
pnpm vitest run --project ui packages/core/src/Switch
pnpm vitest run --project ui packages/core/src/FieldStatus/__tests__/StatusMessage.a11y.test.tsx
pnpm vitest run --project ui packages/lab/src/Chat/__tests__/ChatTypingIndicator.a11y.test.tsx

# Chromium lane — needs a browser and a built Storybook
pnpm storybook:build
npx playwright install chromium
pnpm test:a11y-contract
```

## What this package does not claim

It does not report what an assistive technology says. Speech, braille,
announcement timing and order, virtual-cursor entry, and known AT/browser
divergence are the real-AT layer, and they are governed by
[`AST-009`](../../docs/specs/AST-009/spec.md), not by anything here. It also
does not replace axe, the visual gate, or manual review: contrast, target size,
forced colors, and motion are measured from pixels, and every pattern records
who owns them instead of pretending otherwise.
