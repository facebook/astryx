# CLI conventions for contributors

This guide turns the CLI surface architecture into the steps you follow when
you change `packages/cli`. It does not create policy. Where it and
`docs/architecture/cli-surface.md` disagree, the architecture record wins.

## Who the CLI is for

The caller is an agent. It runs the CLI in a subprocess, reads `--json`, and
acts on the result without a person watching. A person reading the text output
is a supported reader, never the caller the design serves.

Two things follow, and they settle most arguments before they start:

- **The CLI must not impede the agent's flow.** No prompt, no confirmation, no
  question. A command that cannot finish returns an error with a code the agent
  can branch on and a suggestion it can act on.
- **The output is data first.** `--json` is the source of truth. The text output
  is a projection of the same values, produced by the formatters.

## What the CLI is for

Give an agent access to everything that helps it build with Astryx: what
components and templates exist, what they do, how they are used, what is wrong
with the code in front of it, and the utilities that change that code.

The measure of the CLI is coverage and depth of that surface, not the number of
commands on it. Most valuable work makes an existing command answer better.

## Adding a command

**A new command needs approval from a code owner of `packages/cli` before you
write it.** `.github/CODEOWNERS` is the source of truth for who that is. Open
the proposal first: a command is a permanent concept — it appears in help, in
the manifest, in the README, and in every agent's cheat sheet, and removing one
is a breaking change.

A command earns its place when all four hold:

1. **It answers a question an agent actually has** while building with Astryx —
   not a function the CLI happens to be able to expose.
2. **No existing command can be deepened to answer it.** Deepening is the
   default. Reach for a new command only after naming the command you would
   have extended and saying why extending it is wrong.
3. **It is one job.** If the summary needs an "and", it is two commands.
4. **Its result is worth returning as data.** If the useful output is prose for
   a person, it is a docs topic, not a command.

A command that fails any of these is usually a flag, a subcommand, or a docs
topic.

## Adding a flag

Flags are more forgiving than commands, and they do not need a proposal. They
are not free: every flag is a branch an agent has to know about, and a
combination somebody has to keep working.

A good flag:

- **Narrows or redirects work the command already does.** It never gives the
  command a second job.
- **Has a default that is the right answer most of the time.** A flag exists to
  escape the default, not to reach the useful behaviour. If callers must pass it
  to get a sensible result, the default is wrong.
- **Is boolean-off or has a value.** A boolean flag that defaults to true is a
  mis-named opt-out; name the opt-out instead.
- **Changes what the command produces.** A flag that only changes how the same
  result is presented belongs to the global set (`--json`, `--detail`,
  `--lang`), not to your command.
- **Is not a workaround.** If the flag exists so callers can avoid a defect, fix
  the defect.
- **Has a closed composition matrix.** See below — this is the check people
  skip.

If the flag changes what the command _is_, it is a subcommand.

## The composition matrix

Before you land a flag, pair it with every flag already on that command and
decide each cell. There are only three legal answers, and every cell needs one:

1. **They compose** — and a test proves it.
2. **They are refused together** — with a clear message and a code.
3. **They cannot co-occur** — because another rule already refuses the
   combination that would reach them.

An undecided cell is the defect. It ships as behaviour nobody chose, and an
agent finds it before a person does.

### Worked example: `theme build --family`

`--family <base> <children…>` builds a base theme and the themes that `extends`
it as one unit: the base stylesheet restates the shared declarations once,
scoped to every member, and each member carries only its own deltas.

Its matrix against the flags already on `theme build`:

| Pair                           | Answer                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `--family` `--watch`           | Refused, explicitly, with a message naming both.                                                        |
| `--family` `--out`             | Cannot co-occur: `--out` with more than one file is already refused, and `--family` needs at least two. |
| `--family` `--check`           | They compose — `--check` verifies the family-shaped output.                                             |
| `--family` `--icons-specifier` | They compose.                                                                                           |

That third row carries a consequence worth writing down: `--check`'s answer now
depends on whether `--family` was passed, because the two modes emit different
CSS. CI has to check with the same flags it built with. A cell that changes what
another flag _means_ is a documentation obligation, not just a test.

## Flags with the same name

A name is a promise across the whole CLI. Two rules:

- **The same flag name means the same thing everywhere, and is spelled the same
  way.** `--family` means "a base plus the themes that extend it, built as one
  unit". Nothing else may take that name for another idea.
- **No command is forced to carry a flag because a sibling has it.** Alignment
  is on meaning, not on presence. `--family` rests on `extends`, which only
  themes have, so no other command has anything to point it at.

## Output: use the shared functions

Never call `console.log`. Every path is provided:

| You want                    | Use                                                     |
| --------------------------- | ------------------------------------------------------- |
| A machine result            | `jsonOut({type, data, meta?})`                          |
| An error                    | `jsonError(message, suggestions, code)` / `AstryxError` |
| A heading, prose, a list    | `section()`, `text()`, `list()`                         |
| One record, or many         | `record(obj, opts)`, `records(arr, opts)`               |
| A code sample               | `code(source)`                                          |
| To print any of the above   | `emit(...blocks)`                                       |
| Chatter that JSON must hide | `humanLog()`, `humanWarn()`                             |

`emit` accepts only a renderer-produced `Block`, so a bare string will not
compile. Keep text field names identical to the JSON keys — the text output is
a view of the envelope, not a separate design.

## Errors: every failure carries a code

Add a code to `foundation/response/error-codes.mjs` when no existing one fits.
Codes are `ERR_<SUBJECT>[_<QUALIFIER>]`, grouped by subject, and **append-only**:
once shipped, a code is never removed and never re-meant. Reword the message
whenever it helps a reader; never make a caller match on it.

Attach `suggestions` where the agent has an obvious next move — a near-miss
name, the command that lists valid values.

## Every command ships a doc

A command is not done without its `CommandDoc` in `<name>.doc.mjs`. Fill in
`summary`, `description`, `args`, `options` (each with a description),
`examples`, `exitCodes`, and `related`. Help text, the README tables, and the
manifest are generated from it, so an undocumented flag is an invisible flag.

Give at least one example that an agent would actually run, including a `--json`
one.

## Marking work in progress

Some of the surface is not finished, and today nothing on it says so. Callers
cannot tell a settled command from one still being shaped.

When you land a command or subcommand that is not ready to be depended on, mark
it, and say in the doc what is still expected to change. Treat an unmarked
command as stable: changing its output shape or its flags is then a breaking
change.

## Checklist before you open the pull request

- [ ] For a new command: a code owner approved the proposal.
- [ ] One file per command, with its sibling doc file.
- [ ] `--json` returns one envelope; the `type` matches the API function.
- [ ] Every failure path carries a code; new codes are appended, never edited.
- [ ] No `console.log`; all human output goes through the formatters.
- [ ] Text field names match the JSON keys.
- [ ] Exit code is the same with and without `--json`.
- [ ] The composition matrix is closed: every pair composes with a test, is
      refused with a message, or cannot co-occur.
- [ ] Any path you write passes through `assertWithin`.
- [ ] The doc lists the new flag, an example, and the exit codes.
- [ ] Marked as work in progress if it is not ready to be depended on.

## Common review smells

- **A flag that only a maintainer would pass.** It is a debugging affordance;
  keep it out of the surface.
- **A new command whose summary contains "and".** Two commands.
- **A flag added because another command has one.** Presence does not have to
  align; meaning does.
- **A composition cell nobody decided.** The most common defect in a flag PR.
- **A code invented at the call site.** Codes live in one frozen table.
- **Text output built with string concatenation.** It will drift from the JSON
  within one release.
- **`--json` output that omits what the text output shows.** The text is the
  projection; it cannot be the richer of the two.
- **An error message that tells the agent to "check your configuration".** Name
  the file, the key, and the expected value, or give a suggestion.
- **A flag whose default is the unhelpful answer.** Agents will not discover it.
