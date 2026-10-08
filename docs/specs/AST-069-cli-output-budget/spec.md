---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-069
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: []
affects_consumer_docs: [cli]
---

# CLI default output budget system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

An agent pays for every byte a command prints: the output goes into a limited
context before the agent can act on it. A command's default output, what it
prints when no option asks for more or less, fits a fixed size budget for its
kind of result. A caller can run any command without first wondering how much
it will print. When a result has more than the budget holds, the default shows
the part most callers need and names the command that shows the rest.

This record owns the budgets, the kind of result each default falls in, and
how a command with more to say stays inside its budget.

## Non-goals

- `--json` output. Its shape is a compatibility contract (`spec:AST-017`), and
  making it smaller changes that shape.
- Output an option shapes: `--detail`, `--full`, `--dense`, `--lang`, `--zh`,
  `--depth`, `--verbose`, and `--limit`. A caller who sets one has chosen how
  much to read.
- The size of authored docs. Doctor's docs checks bound each section and index
  a docs read can return (`spec:AST-046`); this record bounds what a default run
  prints.
- How a given command gets under its budget. Each command's owner chooses among
  the ways FR4 allows.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Every default run fits its budget.** In text mode, with no option
  from the non-goals above, everything a run prints, standard output and
  standard error together, MUST fit the budget of its result kind on the
  repository's golden inputs (FR6).
- **FR2 — Four result kinds, four budgets.** The budget is in bytes. Tokens are
  shown only as a guide, at about four bytes per token.

  | Kind   | What the result is                                                                                                                                                                                                                                                                       | Budget                                   | About        |
  | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------ |
  | Read   | One artifact or one docs-tree node: `component <name>` and its `--props` and `--blocks`, `docs <topic>`, `docs <topic> <section>`, `docs <route>`, `hook <name>`, `template <name> --skeleton`, `build`                                                                                  | 16 KiB (16,384 bytes) per named artifact | 4,100 tokens |
  | List   | Artifacts or choices to pick from: `component` with no name, `--list`, `--category`; `docs` with no topic; `template --list`; `hook --list`; `search`; `swizzle --list`; `discover`; `theme list`; `theme targets`; `upgrade --list`; `gap-report --list-categories`; `help`; `manifest` | 12 KiB (12,288 bytes)                    | 3,100 tokens |
  | Report | What a run did or checked: `theme build`, `init`, `upgrade`, `doctor`, and every command that writes files                                                                                                                                                                               | 4 KiB (4,096 bytes) per run              | 1,000 tokens |
  | Error  | A run that fails                                                                                                                                                                                                                                                                         | 2 KiB (2,048 bytes)                      | 500 tokens   |

  A read of several named artifacts gets the read budget once per artifact. A
  report's budget does not grow with the number of items the run covers: a run
  over many items summarizes them. A new command declares its kind when it is
  admitted (`spec:AST-042` FR4).

- **FR3 — Verbatim output is exempt.** Output that is the artifact itself
  MUST print whole, so it pipes byte for byte (`architecture:cli-surface`
  INV28): `component <name> --source`, `component <name> --showcase`, a
  template's source, and a generated file printed instead of written
  (`theme palette generate` without `--out`). Its size is the artifact's size.
- **FR4 — More is one command away.** When a command's whole result does not
  fit its budget, the default MUST print the part most callers need and end
  with the command that prints more. A default MUST NOT drop anything silently:
  it says how much it left out and how to get it. The ways to stay inside a
  budget are:
  - a list prints a count, the first page, and the command for the next page
    or a narrower filter;
  - a read prints one level, an index or a summary, and names the command for
    each part, as `astryx docs` reads a topic (`spec:AST-047` FR3);
  - a report prints one line per item, with failures and warnings in full, and
    names the option that prints each item's whole receipt;
  - an error lists the closest few choices and names the command that lists
    every choice.

  An option a command needs for this meets `spec:AST-042` FR5.

- **FR5 — A test holds every command to its budget.** A repository test MUST
  run every command's default on the golden inputs in process and fail when
  its output exceeds the budget of its kind. A command over budget when it
  enters the test is listed as an exception at its measured size, rounded up to
  the next KiB. The test MUST fail when an exception's output grows past that
  size, and MUST fail when an exception fits its budget, so the change that
  brings a command under budget also removes its exception. A new command or
  golden input enters without an exception. The test MUST fail when a command
  in the manifest has no case, unless it is listed with its reason: it reads
  the network, it packs a package, it needs a built theme package, or it is
  deprecated and scheduled for removal.
- **FR6 — Golden inputs are real.** The golden inputs MUST be Core's own
  catalog (components, docs, templates, hooks, themes, and codemods) read from a
  fresh consumer project, with fixtures for commands that need input files:
  `theme build` on one theme, on a bundled theme, on a batch of 15 themes, and
  on a theme family, and an empty integration package for the authoring
  commands. Each read kind includes at least one large artifact, and
  each failure the test covers is a name the catalog does not have.

### Platform support

- Supported feature/engine floor: every platform the CLI runs on. Text output
  is plain ASCII (`architecture:cli-surface` INV4), so bytes and characters
  are the same count.
- Unsupported behavior: none.
- Browser evidence: none; the contract is CLI output.

## Current-state impact

- `architecture:cli-surface` gains an invariant: every default text result fits
  the budget of its kind, held by the budget test.
- These defaults exceed their budget on the golden inputs and start in the
  test's exception list: `template --list` (with and without `--type page`),
  `theme targets`, `theme build` over a batch of themes, and the error for an
  unknown template name. Their owners bring each under budget and remove its
  exception.
- Doctor's docs size check is unchanged.

## Verification

| Contract | Verification                                         | Representative states                                                                                                                       | Mutation or failure expectation                                                        |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| FR1–FR2  | `packages/cli/test/output-budget.test.mjs`           | every command's default on the golden inputs: a large and a small component, a batch read, a docs topic and tree node, lists, search, build | Output that grows past its kind's budget fails                                         |
| FR3      | The same test's verbatim list, and review            | `--source`, `--showcase`, a template's source                                                                                               | A non-verbatim result listed as verbatim, or verbatim output that is cut, fails review |
| FR4      | Each adopting command's own tests, and review        | a paged list, a summarized report, an error with suggestions                                                                                | A default that leaves items out without a count and a command for the rest             |
| FR5      | `packages/cli/test/output-budget.test.mjs`           | an exception that grows; an exception that fits its budget                                                                                  | Either fails                                                                           |
| FR6      | The budget test's fixture project and theme fixtures | Core's catalog, one theme, a bundled theme, 15 themes, a family, unknown names                                                              | A golden input that no longer exists fails the run instead of passing as empty         |

## Decision log

### DEC-1 — Budgets by result kind, in bytes

**Reference:** `spec:AST-069/DEC-1`
**Decider:** proposed, awaiting `josephfarina`

Four kinds keep the rule small enough to remember and leave each budget with
room for normal growth. Bytes are what a command controls and every reader can
count; tokens depend on the reader's tokenizer, so they appear only as a guide.

Rejected: a budget per command, which makes every new command a negotiation.

### DEC-2 — Both streams count

**Reference:** `spec:AST-069/DEC-2`
**Decider:** proposed, awaiting `josephfarina`

An agent captures standard output and standard error together, so a warning or
a suggestion list costs it the same as a result.

Rejected: counting standard output only, which leaves error and warning output
unbounded.

### DEC-3 — Verbatim output is exempt

**Reference:** `spec:AST-069/DEC-3`
**Decider:** proposed, awaiting `josephfarina`

A caller who asks for source asks for the whole file, and a cut file no longer
pipes byte for byte.

Rejected: a budget on source output, which makes large components unreadable
through the CLI.

### DEC-4 — Known gaps fail on growth and on fit

**Reference:** `spec:AST-069/DEC-4`
**Decider:** proposed, awaiting `josephfarina`

The test lands with the defaults that exceed their budget listed at their
measured size, the same approach as `spec:AST-021/DEC-1`. A known gap cannot
widen, and its exception cannot outlive its fix.

## Open questions

- **OQ1 — Should `--json` get budgets once a command has a paged JSON shape?**
  (`human-api`)
