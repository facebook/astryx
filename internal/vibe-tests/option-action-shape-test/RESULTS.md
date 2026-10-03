# Option-action API shape — vibe test results

**Status:** ad-hoc · run 1 complete · informs the review of
[PR #6828](https://github.com/facebook/astryx/pull/6828)
**Related:** [`../README.md`](../README.md) (Checker Protocol),
[Designing Vibe Tests](https://github.com/facebook/astryx/wiki/Designing-Vibe-Tests),
[API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration),
`../row-actions-shape-test/` (the sibling test for actions on a `List` row,
whose harness this one reuses; on the `spec:AST-057` branch)

---

## 1. The question

An option in a `MultiSelector` panel sometimes carries a second verb — an Edit
button beside a saved label — that must not also toggle the option. The
control is always visible: no hover reveal, no swipe. Four API shapes were
candidates for how a caller declares it. **Given only a reference page, does a
naive builder write correct callsite code against each, which shape makes the
component's own job (knowing whether to become a grid) possible, and which
shape do builders expect when none is named?**

The host is the same in every arm and every doc says it identically: the panel
is a listbox, which admits only `option` and `group` children, so a control
cannot sit beside an option inside it; when any option carries an action the
panel becomes a grid of rows with two cells (the option, and one actions cell).
Arrow keys move between rows and between the two cells. The arms differ only in
how the action is declared.

## 2. Design

| ingredient     | choice                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goal & measure | Correctness against the arm's own doc; hallucination (invented props, keys, components or imports); accessibility path (every action reachable by keyboard with no second hand-built UI, nothing placed inside `renderOption`); directness (nothing unrequested); and **detection** — can the panel know whether to be a grid, and who carries that burden. Tie-break: detection, then the recall probe.                                                         |
| Prompt battery | Five prompts in [`prompts.json`](prompts.json). None names a prop or key, and none uses the words "grid", "cell" or "render prop". p1 an action on some rows but not others, and the set may be empty · p2 an action that must not toggle · p3 two actions on one row · p4 search plus a keyboard-only colleague · p5 negative control, no actions.                                                                                                              |
| Arms           | `A render prop` — `renderOptionAction?: (option) => ReactNode` on the component, the shape [PR #6828](https://github.com/facebook/astryx/pull/6828) ships · `B node` — `action?: ReactNode` on the option · `C declared` — `action?: {label, icon?, onClick}` on the option, in the menu-row vocabulary · `D array` — `actions?: ReactNode[]` on the option · `recall` — behavior described, props and keys deliberately unnamed.                                |
| Orchestration  | One fresh, context-free agent per prompt × arm (20), plus three recall agents (23 total, authorized by the owner). Docs inlined into each task. Outputs typechecked against per-arm stubs over the real core exports ([`typecheck/check.mjs`](typecheck/check.mjs)); the stub narrows `MultiSelector` to the documented surface so an invented prop is a type error. Rubric scored by the test designer with cross-arm visibility; no agent scored its own work. |

### Fairness (Checker Protocol)

| Invariant                | How this honors it                                                                                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| §1 Fair evaluators       | One rubric, one typechecker, all arms side by side. Blinding is impossible (the arm is legible from the prop names).                                                                                                                                                                 |
| §2 Only the SUT varies   | All five docs come from one template by [`gen-docs.mjs`](gen-docs.mjs): intro, base prop table, option table, structural paragraph, first example and closing note are byte-identical. Only the action row(s), their prose, and example 2 differ. 560 / 534 / 551 / 539 / 499 words. |
| §3 Never leak the answer | Ground truth lives in `prompts.json` and never reached a generating agent; [`gen-tasks.mjs`](gen-tasks.mjs) builds tasks from the prompt text alone.                                                                                                                                 |
| §4 Representative env    | A reference page is what a consumer's agent reads. The gap: agents could not browse a project or run the CLI, and the doc listed only seven icon names (equal across arms; the shipped `Icon` page lists them all).                                                                  |
| §5 Context-free          | Fresh children with no inherited context, told to use nothing but the reference and plain React.                                                                                                                                                                                     |

## 3. Results

### 3.1 Recognition

Scores 1–5 (correctness · hallucination · a11y path · directness), then the
typecheck against the arm's stub. Unrequested `hasSearch` / `hasSelectAll`
toggles appeared in every arm at a similar rate and are not scored.

| prompt                   | A render prop                                                                                                                                                | B node                                                                 | C declared                                                                                                                                                                                                                                                 | D array                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| p1 some rows, maybe none | 5 · 5 · 5 · 5 — tsc ✓. Wrote the guard: a `Set` of custom ids and `renderOptionAction={customIds.size > 0 ? fn : undefined}`, with a comment explaining why. | 5 · 5 · 5 · 5 — tsc ✓. `action: isCustom ? <IconButton/> : undefined`. | 5 · 5 · 5 · 5 — tsc ✓. `action: isCustom ? {…} : undefined`.                                                                                                                                                                                               | 5 · 5 · 5 · 5 — tsc ✓. `actions: isCustom ? […] : []`. |
| p2 must not toggle       | 5 · 5 · 5 · 5 — tsc ✓                                                                                                                                        | 5 · 5 · 5 · 5 — tsc ✓                                                  | 5 · 5 · 5 · 5 — tsc ✓. Noted the descriptor has no `size`/`variant`, so "a small info button" cannot be asked for.                                                                                                                                         | 5 · 5 · 5 · 5 — tsc ✓                                  |
| p3 two actions on a row  | 5 · 5 · 5 · 5 — tsc ✓. Fragment of two `IconButton`s.                                                                                                        | 5 · 5 · 5 · 5 — tsc ✓. Fragment of two.                                | **2 · 5 · 4 · 2** — tsc ✓. One `action` cannot hold two. Built a "Manage" action that opens a hand-rolled group of Rename / Delete / Cancel `Button`s below the field, with `useState`; did not invent an array. "A step removed from right from its row." | 5 · 5 · 5 · 5 — tsc ✓. Two keyed `IconButton`s.        |
| p4 search, keyboard-only | 5 · 5 · **4** · 5 — tsc ✓. No pin icon in the doc, so a text `Button label="Pin"` — every row's action has the same accessible name.                         | 5 · 5 · 5 · 5 — tsc ✓. Per-row name "Pin X to sidebar".                | 5 · 5 · 5 · 5 — tsc ✓. Omitted `icon`; asked whether the label is drawn when there is no icon.                                                                                                                                                             | 5 · 5 · 5 · 5 — tsc ✓                                  |
| p5 negative control      | 5 · 5 · 5 · 5 — tsc ✓. Explicitly did not pass the prop, citing the grid switch.                                                                             | 5 · 5 · 5 · 5 — tsc ✓                                                  | 5 · 5 · 5 · 5 — tsc ✓                                                                                                                                                                                                                                      | 5 · 5 · 5 · 5 — tsc ✓                                  |
| **mean**                 | **5.0 · 5.0 · 4.8 · 5.0**                                                                                                                                    | **5.0**                                                                | **4.4 · 5.0 · 4.8 · 4.4**                                                                                                                                                                                                                                  | **5.0**                                                |

**A, B and D tie at the ceiling on recognition.** 15/15 correct, 0 invented
props or keys, 20/20 outputs compile against their stubs, and every output
left a keyboard path by construction. Every agent in every arm rejected
`renderOption` for the control, unprompted, quoting the sentence that places it
inside the click target. **C fails p3 by its cardinality, not its docs** — the
agent read the doc correctly, saw "that option's action or actions" in the
structural paragraph, found no array form, refused to invent one, and built
the second control outside the panel: the same failure mode the sibling test's
arm C showed when two slots could not hold four verbs.

### 3.2 Detection — where A pays

The panel must know whether to be a grid. A key on the option data can be
counted; a function cannot be asked whether it will ever return something.

| arm | what the doc had to say                                                                                                            | what the builder wrote on p1                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | A 28-word warning: the panel becomes a grid whenever the prop is passed, so "pass it only when at least one option has an action". | An extra `useMemo`, a `Set` of custom ids, and a ternary that passes `undefined` when the set is empty — eight lines whose only job is the guard. |
| B   | Nothing.                                                                                                                           | `action: isCustom ? … : undefined`. The builder: "there is nothing to branch on".                                                                 |
| C   | Nothing.                                                                                                                           | `action: isCustom ? … : undefined`. "Falls out for free."                                                                                         |
| D   | Nothing.                                                                                                                           | `actions: isCustom ? […] : []`. "The all-built-in case falls back to the ordinary listbox with no extra work."                                    |

The A builder did the right thing — because the doc told it to. That is the
cost: a documented footgun and a guard at every callsite whose action set can
be empty, versus a rule the component enforces from the data. The PR has the
same defect today in a different guise (`hasTabbableContent:
renderOptionAction != null`): with a render prop, prop presence is the only
signal there is.

### 3.3 Recall probe — a fifth shape

Three agents were given the behavior with the props unnamed and asked to
write what they expected for p1, p3 and p4.

| sample | where                      | key       | shape                                                       | handler   | rejected                                                                                                                                                     |
| ------ | -------------------------- | --------- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| s1     | **key on the option data** | `actions` | **array of `{label, icon, onClick}`**, `icon` a string name | `onClick` | `renderActions` on the component ("gives the component no way to know, before rendering, whether to become a grid"); a `ReactNode` ("asking it to trust me") |
| s2     | **key on the option data** | `actions` | **array of `{label, icon, onClick}`**, `icon` a string name | `onClick` | `renderActions` / `getActions` ("moves a per-row fact away from the row"); a `ReactNode` ("would tempt people to drop it into `renderOption`")               |
| s3     | **key on the option data** | `actions` | **array of `{label, icon, onClick}`**, `icon` a string name | `onClick` | `renderActions` ("brings back the trust problem"); a `ReactNode` ("the component can only guarantee a real button if it renders the button itself")          |

**3/3 put the action on the option, not on the component. 3/3 chose
declared data over a node. 3/3 chose an array.** The shape every builder
reached for — a per-option **array of declared descriptors** — is one that
none of A–D tested: it is arm C's vocabulary at arm D's cardinality. Every
sample gave the same two reasons unprompted: everything else per-option
(`description`, `icon`, `disabled`) is a key on the option, so the action
should be too; and the component can only promise "a real button that never
toggles the option" if it owns the button. Two of three also named detection:
a key keeps "does this row have an actions cell" answerable from the data,
where a render prop cannot know before rendering whether to become a grid.

Two naming signals, also 3/3: the handler is `onClick` (as on the menu row),
and `icon` is the icon's **name**, not a node — the builders mirrored
`IconButton`'s props rather than the option's own `icon: ReactNode`.

### 3.4 Doc gaps the test found — in the winning arms too

These are not arm differences; the same sentence produced them in several
arms, so they are requirements for whatever ships.

- **Say the action is always visible.** One A agent asked "whether the
  controls are visible at all times or only on hover/focus". The structural
  paragraph never says it. Shipped docs must, so nobody imports the List-row
  reveal question.
- **What happens after an action fires.** C p3 and recall s3 asked whether
  the panel stays open and where focus lands; for Rename and Delete they want
  it to stay open. The contract must say.
- **A declared descriptor needs `variant`.** C p2 wanted a "small" button and
  had no `size`; recall s3 wanted to mark Delete destructive and did not
  invent it. `DropdownMenuItemData` already carries `variant: 'default' |
'destructive'`; the descriptor should take the same word.
- **Exported type names.** 12 of 23 outputs raised that the doc names
  `MultiSelectorOptionData` without showing an import. A template artifact
  (the shipped page shows it), equal across arms.
- **Icon names.** Every agent wanted pencil, trash or pin; the doc listed
  seven. Template artifact, equal across arms.
- **`[]` vs `undefined`** (D and recall s1): an array form must say whether an
  empty array counts as "no action". A single optional key has no such edge.

## 4. Verdict

**A key on the option data, not a prop on the component — and the shape to
carry forward is the one the recall probe produced: `actions?:
OptionAction[]`, each `{label, icon?, onClick, variant?}` in the menu-row
vocabulary.**

- Recognition cannot separate A, B and D; C loses p3 on cardinality alone.
- Detection separates A from the rest. The render prop needs a doc warning and
  a caller-side guard to avoid becoming a grid for nothing, and the component
  still cannot verify it; every per-option key makes the rule the component's
  own. This is the same bug class as the PR's `hasTabbableContent`.
- Recall is 3–0–0 for a per-option array of declared data, with the builders'
  reasoning matching the system argument (the component owns the button, so
  it needs the verb as data) and the sibling test's finding for `List` rows.
- Against B (a node): a declared descriptor lets the component guarantee the
  button, its accessible name, its size in a picker row, and the future
  within-cell navigation; a node cannot be inspected without the React
  introspection the system forbids. Against D (an array of nodes): D adds
  `key` and the `[]` question while guaranteeing nothing more than B.
- One array, not one object: p3 is a real case and the only shape that
  survives it without a workaround or a second key.

**What this does not decide.** Whether the descriptor's `icon` is a node or a
name (3/3 builders wrote a name; the option's own `icon` accepts both); the
exact closed set for `variant`; and the within-cell keyboard model for a row
with two actions, which the owner has parked.

## 5. Specification record

A record is warranted, and it is a **new** one, not an extension of
`spec:AST-057` or `component:MultiSelector`:

- **`spec:AST-057` cannot contain it by its own text.** Its FR9 and DEC-4 say
  any row rendered with a `menuitem`, `option` or radio role MUST NOT host the
  capability, and its non-goals list listboxes outright. Its subject is the
  reveal policy (hover, focus, swipe) over a `List` row — the thing this
  control explicitly does not have. What transfers is the vocabulary: DEC-1
  "actions are declared as data the row renders" and the `{label, icon,
onClick, variant}` descriptor. The new record cites it; AST-057's FR9 then
  owes a one-line delta pointing at the grid route for picker rows, since the
  grid changes the row's role away from `option` and makes FR9's premise
  moot for that host.
- **`component:MultiSelector` cannot contain it** because the fact is not
  MultiSelector-local. The key lands on `SelectorOptionData`, which
  `Selector` also renders; `CommandPalette` builds that type internally; and
  the listbox-to-grid switch is a change to the combobox popup role that any
  picker in the system will meet. A component record is also `authority:
draft` and would present the cross-component rule as component policy.
- **The distinct fact boundary** is: a combobox popup that becomes a `grid`
  when its options carry actions — the data shape on the shared option type,
  the data-derived detection rule (never prop presence), the two-cell row,
  the arrow-key contract, and the accessibility floor. One record, first
  adopter `MultiSelector`, `Selector` cited as reaching the same key.

Not done here: writing that record. The owner called further design overkill
for now, and this run's job was the comparison.

## 6. Caveats

- The judge is the test designer, not a separate agent, to stay inside the
  owner's agent budget. Scores are a reading; the typecheck column, the
  guard-line count and the recall counts are the hard numbers.
- The test did not include the shape the recall probe produced (array of
  declared descriptors), so its recognition score is inferred from C
  (vocabulary) and D (cardinality), not measured. A follow-up arm would
  settle it; nothing in this run suggests it would score below the ceiling.
- Recall probes batched three scenarios per agent, so one agent's shape was
  reused across its three callsites by design. Three samples is a signal,
  not a distribution.
- Agents were cheap question-answering children without a project or the
  CLI; discoverability through `astryx component MultiSelector --dense` was
  not measured.
- The structural paragraph tells builders the panel becomes a grid. Real docs
  will too, so this is representative — but it means the test measured
  declaration shape, not whether builders would accept the role switch.
- No implementation exists; every stub is a type the doc proposes, and the
  grid host is the owner's settled direction, not shipped code.

## 7. Files

- [`prompts.json`](prompts.json) — battery, dimensions and ground truth
- [`gen-docs.mjs`](gen-docs.mjs) → [`docs/`](docs/) — one template, five arms
- [`gen-tasks.mjs`](gen-tasks.mjs) → [`tasks/`](tasks/) — the 23 self-contained task prompts as sent
- [`outputs/`](outputs/) — raw outputs, code and self-report, one file per agent
- [`typecheck/check.mjs`](typecheck/check.mjs) → [`typecheck/summary.json`](typecheck/summary.json) — tsc against per-arm stubs
