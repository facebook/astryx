---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-081
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: [contributing:cli-conventions]
affects_consumer_docs: [cli]
---

# Global mode system spec

<!-- Describe the system, not the project: present tense, what it does. No
proposals, history, pull requests, or research in the record; see
docs/contributing/spec-writing.md and report its rubric results in the pull
request. -->

## Intent

A person or an agent installs Astryx once on a computer, as the CLI package
itself, and runs it in any folder. Inside a project, every answer is the one
the release matching the project's Core gives, whichever copy of the CLI
started the run, because a template, a component doc, or an agent instruction
from another release writes code the project's Core rejects, with no error to
say so. Outside a project, the newest release answers, the way a new project
on it would, so an agent with no project files can learn Core, its components,
and the docs.

This record owns which release answers a run (FR1, FR2), what every command
does outside a project (FR3, FR4), how a run names the release that answered
and picks the one command name every printed command starts with (FR5), how a
copy installed for the computer stays current (FR6), where any run may write
(FR7), what each release carries for use outside a project (FR8), and how every
copy of the CLI hands a project's run to the release that answers there (FR9).

## Non-goals

- Which project an upgrade works on, which Core it migrates to, and what it
  reports when the CLI is older than that Core: `spec:AST-040` FR9–FR13.
- Which files hold a project's agent docs, and where `init` writes them and
  refuses to: `architecture:cli-surface` INV31.
- The official package list and how discover reads it: `spec:AST-051` FR10.
- How a host's package sets are matched to a project's pins, which
  integrations they serve, and how a run records the packages it resolved:
  `architecture:cli-surface` INV30.
- Classifying a change to released behavior that this record requires:
  `spec:AST-017`, including FR54 for a refusal that corrects a write outside
  its confined root.
- What a project starter contains, and the template kind that ships it.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

In this record, a **door** is a way to start the CLI: the `@astryxdesign/cli`
package itself, installed in a project and run through its package manager (the
project's own CLI), installed for the computer, such as with
`npm i -g @astryxdesign/cli`, or run once through a package runner, such as
`npx @astryxdesign/cli`; and a programmatic host through
`@astryxdesign/cli/host`. A **copy** is the `@astryxdesign/cli` a door starts:
the one it installed or fetched, the one a host carries, or a release in the
per-user cache that global mode installed (FR2, FR3, FR6). The **global copy**
is the CLI package installed for the computer.

A folder's **project** is found the way the CLI finds the Core and the CLI it
reads there: the `@astryxdesign/core` installed in the folder or one of the
four folders above it, or a workspace's own Core package; the
`@astryxdesign/cli` installed in the folder or one of the five folders above
it, or resolved by the package manager's Plug'n'Play runtime; and otherwise
the nearest `package.json` at or above the folder that declares either
package, searched up to the first folder that holds version-control metadata
and never in the home folder unless the run starts there. A folder is
**outside a project** when none of these exist. A folder inside another
project, such as a repository cloned into it or a nested app, therefore
answers with the enclosing project's release. The project that an upgrade
works on is `spec:AST-040` FR9's.

- **FR1 — One CLI behind thin doors.** All behavior lives in
  `@astryxdesign/cli`. A door that runs that package directly, the project's own
  CLI or a copy installed for the computer or fetched by a package runner, runs
  the CLI itself. A programmatic host carries the `@astryxdesign/core` release
  equal to the CLI release it runs, chooses that release (FR2, FR3, FR6), and
  starts it through the host entry
  `@astryxdesign/cli/host`, a supported programmatic API whose reference doc
  states each input, its default, the result, and the errors (`spec:AST-017`
  FR14). A door MUST NOT pass anything to the CLI through an environment
  variable, an option, or a configuration key, and MUST NOT add a command, an
  option, or any other behavior.
  - The host entry's inputs are explicit: the arguments; the working folder;
    the command name the door's callers type (FR5); the package sets the door
    may serve, in its order of preference, and the integrations it approves for
    use outside a project (`architecture:cli-surface` INV30); the discover
    sources the door adds; and, when the door found the project's own CLI and
    did not run it, the reason (FR2).
  - Discover calls a door's sources after every integration's source and before
    the official list (`spec:AST-051` FR6 and FR10), and names each as the
    door's, never as an integration's.
  - A door makes one call per process. A call takes over the process's working
    folder, arguments, standard streams, and exit, so a second call in the same
    process MUST fail before running anything; calls in separate processes
    share nothing (`spec:AST-017` FR18).
  - Given the same release, Core, folder, arguments, and inputs, a command
    MUST give the same exit status, output, and file changes through every
    door, apart from the command names FR5 sets and the standard-error lines
    FR5, FR6, and FR9 define.
- **FR2 — In a project, the project's Core decides the release.** In a folder
  that belongs to a project, one release answers every command, reads
  included, and every template, doc, component doc, hint, and agent text comes
  from that release and the Core it pairs with. The release is the one equal
  to the project's Core: the version of the Core the folder reads, else the
  Core version the project's lockfile records, else the newest published
  release that the Core range the project declares allows. A project that
  records no Core is matched by the CLI it installs, locks, or declares, in
  the same order.
  - When the project installs `@astryxdesign/cli` at exactly that release,
    that CLI answers. A run that starts in another copy MUST hand the run to
    it (FR9) before loading anything the project provides: its
    `astryx.config`, its integrations, or its Core.
  - When the project installs no CLI, or a CLI of another version, the
    matched release answers: the copy that started the run when it is that
    release, otherwise the release in the per-user cache, installed there
    through the package manager the first time a project needs it. The
    project's own CLI hands such a run to the matched release too. While a
    release installs, or while the run waits for another run installing it,
    a text-mode run prints one line on standard error saying so; a
    machine-readable run prints none. An install that a live run is still
    making is waited for, a lock its run left when it stopped is taken
    over, and a cached release whose files are damaged is installed again.
    An install that has not finished within a generous bound ends the run
    with `ERR_VERSIONS_UNAVAILABLE`, never by stopping the process.
  - `astryx upgrade` follows the same rule, so it always runs the codemods of
    the release equal to the project's installed Core (`spec:AST-040` FR11).
    A project CLI that predates this rule answers for itself, and
    `spec:AST-040` FR13 defines what it reports when it is older than that
    Core.
  - When a door finds the project's own CLI and declines to run it, it passes
    the reason (FR1). The release equal to that CLI's version then answers in
    its place when the door can run it; otherwise the run fails with
    `ERR_VERSIONS_UNAVAILABLE`, naming the reason and the project's own
    command.
  - When the release this requirement names is not installed and cannot be
    fetched, or no published release fits the declared range, the run MUST
    fail with `ERR_VERSIONS_UNAVAILABLE` before any write, naming the release
    it needs. No other release answers in its place.
- **FR3 — Outside a project, the newest release answers as a new project
  would.** Outside a project, the global copy answers with the release FR6
  keeps it on, and any other copy answers itself (FR9). The answering release
  MUST answer as it would in a new project that installs only that release of
  Core and the integrations the door approves (FR1). Every command that needs
  Core answers from the carried Core: the `@astryxdesign/core` release equal to
  the answering CLI, beside it, carried by its door (FR1), or kept in the
  per-user cache, where a copy that carries none installs it the first time a
  command needs it. When it cannot be installed, those commands fail with
  `ERR_VERSIONS_UNAVAILABLE` before any write. `doctor`, `swizzle`, and
  `upgrade` judge or change a project and MUST NOT read the carried Core.
  Output outside a project MUST NOT give advice that works only inside one,
  such as a step that sets up, configures, or refreshes a project the folder
  does not have.
- **FR4 — Every command declares what it does outside a project.** Every
  command and subcommand MUST declare one of three values in its command doc,
  and `astryx manifest` MUST publish that value as the command's
  `outsideProject`:
  - `same`: it gives the answer it gives in a new project (FR3).
  - `refuse`: it writes nothing and fails before doing any work, naming what it
    needs, an app project or an integration package.
  - `own`: it does something else outside a project, which its command doc
    states and a test of its own covers.

  A command that only groups subcommands declares nothing. A refusal fails with
  `ERR_PROJECT_REQUIRED`, except that a command whose released versions refuse
  outside a project with another error code keeps that code until a declared
  minor changes it; that change, and any other change to what a released
  command does outside a project, is classified under `spec:AST-017`. `doctor`
  is `own`: outside a project it checks the computer, reporting the Node
  version, the release that answered and the newest release it knows of, and whether the computer-level agent text (FR8) is present and current, and it never fails a check because the folder has no
  project. `swizzle` is `refuse`, even with a
  carried Core.

- **FR5 — Every answer names who answered, and one picker names every printed
  command.**
  - Every successful machine-readable result MUST carry `meta.answeredBy`:
    `cli`, the answering CLI's version; `core`, the version of the Core the run
    pairs with (the project's installed Core, or the carried Core when the
    project has none or the folder is outside a project), or `null` when there
    is none; and `copy`, which is `project` for the project's own CLI,
    `matched` for a release FR2 matches to the project, and `carried` outside a
    project. A release that predates this field answers
    without it, and no door adds it.
  - In text mode, when `copy` is not `project`, the run MUST print one line on
    standard error naming the CLI and Core versions and which copy answered. A
    run started in the project's own CLI prints no such line, and a run another
    copy hands to it prints the one line FR9 defines.
  - Every command the CLI prints or writes for its caller to run MUST start
    with the command name that one picker chooses for the folder the command
    runs in. The picker takes the first of these that applies:
    1. the command that the integrations the run loads declare for running the
       CLI, such as `acme astryx` for a company's own command-line tool;
    2. the name passed by the door that started the run (FR1);
    3. the package manager's name: the project's run prefix when the project's
       own CLI answers, `astryx` when the global copy or a release it keeps
       answers outside a project, and otherwise the package runner with the
       CLI package pinned to the answering version, such as
       `npx @astryxdesign/cli@0.7.2`.
  - The picked name takes the place of the command's leading `astryx` and, run
    from that folder, MUST reach the same choice of release (FR2, FR3, FR9). A
    printed command MUST NOT run, through a package runner, the CLI package
    without a version or a package other than the CLI.
  - An integration MAY declare in its manifest, as `cliCommand`, the command
    that runs the CLI for its users: one non-empty line of text that starts the
    CLI through a door following FR1 and FR2. With no declaration, the picker
    goes on to the door's name. Integrations that declare the same command
    agree. When the integrations the run loads declare different commands, the
    picker takes the package manager's name, even when a door started the run,
    and `doctor` warns, naming each integration and the command it declares. A
    declaration of any other form counts as absent, never withdraws the
    integration's other contributions, and `doctor` warns about it.
  - The picker names every command the CLI prints or writes: hints and next
    steps, errors and their suggestions, `doctor` fixes, help, docs moves
    (`spec:AST-047`), recommended commands (`spec:AST-048`), the project's
    agent-docs block, the computer-level agent text (FR8), and the setup
    reminder wherever it is printed. No surface spells a command name of its
    own.
  - Docs, guides, agent text, and the text an integration supplies, such as
    its docs and its agent-doc lines, write every CLI command bare, beginning
    `astryx`; the CLI puts the picked name in its place when it prints or
    writes that text. A step that installs a door, or starts one by its own
    name, is not a CLI command and stays as written.
  - Machine-readable output, error envelopes included, carries every command
    bare, beginning `astryx`, and never a picked name.
  - A command that finishes work with another release names that release
    (`spec:AST-040` FR13).
- **FR6 — The global copy stays on the newest release; projects are never
  touched.** Outside a project, the global copy answers with the release the
  package registry tags `latest` for `@astryxdesign/cli`, kept in the per-user
  cache. It follows that tag to new minor releases, and back down when the tag
  moves back, and never follows another tag. Until a check has installed a
  release, the installed copy itself answers. The package manager's own
  installation of the global copy is never changed.
  - It checks the tag at most once an hour, only during a run, and no sooner
    than an hour after its first run. A check and any install happen in the
    background, at most one at a time, and a new release answers from the next
    run.
  - A release answers only after it is fully installed, starts, reports its own
    version, and supports the computer's Node. The cache keeps the release it
    switched from, and a failed check, install, or start leaves the last good
    release answering.
  - No command waits for an update, fails because of one, or changes its
    output or exit status because of one, apart from the line below.
  - The first text-mode run on a new release prints one line on standard
    error: the door's name, the new and previous versions, and a link to the
    new release's notes. A machine-readable run never prints it, and the line
    waits for the next text-mode run. When the newest release needs a newer
    Node than the computer has, the copy stays on its release and says so once,
    the same way. No line asks the caller to run an update command. A host
    that switches the release it runs prints the same line.
  - Outside a project, a release requested by version, such as
    `npx @astryxdesign/cli@<version>`, runs exactly that release, with no check
    and no switch; inside a project, FR2
    and FR9 decide which release answers. Through a package runner, the
    package manager chooses the release, and a copy it fetches adds no update
    behavior.
  - Updates have no Astryx-owned control (`spec:AST-017` FR14); the package
    manager's registry, proxy, and offline settings apply.
  - No door updates a project, installs into one, or prints an update notice
    in one. `doctor` reports a newer release when it knows of one, and installs
    nothing.
- **FR7 — Writes stay inside named places.** Every file the CLI or a door
  writes MUST land in one of these places; a write anywhere else MUST be
  refused before anything is written (`ERR_PATH_TRAVERSAL`,
  `architecture:cli-surface` INV10):
  - the operation root: the folder the command runs in, or a folder above it
    when the record that owns the command's writes says so, such as the project
    root of an upgrade (`spec:AST-040` FR9), the project that holds the theme
    module (`spec:AST-050` FR2), and the folder where `init` writes agent docs
    (`architecture:cli-surface` INV31);
  - the per-user cache directory of the platform, for saved discover answers
    (`spec:AST-051` FR8), for the releases global mode installs (FR2, FR3,
    FR6), and for the global copy's update state (FR6);
  - the platform's temporary directory, for scratch work such as building or
    verifying a package;
  - the files of the computer-level agent text (FR8), written only by a command
    that exists to write them, never at install and never as a side effect of
    another command.

  No run writes a project's agent docs into the home folder or a settings
  folder in it (`architecture:cli-surface` INV31). When a door fetches a
  release through the package manager, the package manager's own files follow
  its own settings. `spec:AST-017` FR54 classifies a refusal that corrects a
  write a released version made outside these places.

- **FR8 — Everything global ships inside the release.** The agent text, the
  official package list (`spec:AST-051` FR10), and the project starters ship
  inside each CLI release. Each is generated from the repository when the
  release is built and is never fetched at run time or edited by hand, and a
  check MUST fail when a committed copy no longer matches the repository.
  - Every agent text a release prints or writes, the project block and the
    computer-level text included, comes from one source and differs only by
    the command name FR5 picks and the wrapper its surface needs, such as
    markers or a version line. The computer-level text names no version and tells an agent to follow a
    project's own agent docs inside that project. It is one skill file named
    `astryx`, in the two skill folders agent tools read in the home folder
    (`.agents/skills/astryx/SKILL.md` and `.claude/skills/astryx/SKILL.md`),
    written and refreshed only by `astryx init --user` and removed only by
    `astryx init --user --remove-agents`. Neither overwrites or removes a file
    that the CLI did not write, or follows a link in its place.
  - Every project starter a release ships scaffolds, installs, and builds with
    that release, and a check MUST prove it for every starter before the
    release ships. A scaffold pins every Astryx package to the release that
    made it and declares the CLI, so the project's own copy answers from then
    on (FR2).

- **FR9 — Every copy hands a project's run to the release that answers
  there.** Every copy of the CLI, whether installed in the project, installed
  for the computer, fetched by a package runner, or carried by a programmatic
  host, that starts a run in a folder belonging to a project MUST hand the run
  to the release FR2 names when it is not that release itself: to the
  project's own CLI when that CLI matches the project's Core, and otherwise to
  the matched release. This holds whatever release the copy is and whatever
  version the command line asked for. Outside a project, the global copy
  hands the run to the release FR6 keeps it on, and any other copy answers
  itself (FR3).
  - A copy hands the run off before it loads anything the project provides
    (FR2). It does not hand off when it is itself the release FR2 names, or
    when the door that started it declined the project's CLI (FR2).
  - A command that acts on the computer rather than the folder it runs in,
    such as `astryx init --user` (FR8), is never handed to a project's
    release: it is answered as outside a project wherever it runs, and its
    standard-error line says it answered for the computer.
  - A run is handed off at most once. The copy a run is handed to makes the
    same choice and finds itself, so a run never returns to a copy it has
    left.
  - The copy the run is handed to receives what it would receive if started
    directly in that folder: the same arguments, working folder, and standard
    input, output, and error, with nothing added to its environment, options,
    or configuration (FR1). The run ends with that copy's exit status, or the
    signal that ended it.
  - When the project's CLI or the matched release cannot be started, the run
    fails with `ERR_VERSIONS_UNAVAILABLE`, naming it, and no other copy
    answers in its place (FR2).
  - In text mode, a run handed to the project's own CLI prints exactly one
    line on standard error, naming the version of the project's CLI that
    answered and the version of the copy the run started in. A run handed to
    any other release prints exactly one line too: the FR5 line, which the
    release that answers prints, or, for a release that predates it, the copy
    that handed the run over. A machine-readable run prints no such line; its
    `meta.answeredBy` names the release that answered (FR5) when that release
    carries the field.

### Platform support

- Supported feature/engine floor: every operating system, shell, and package
  manager the CLI supports, including the workspaces and install layouts of
  npm, pnpm, Yarn (Plug'n'Play included), and Bun, and the package runner each
  provides.
- Unsupported behavior: a door that cannot obtain the release FR2 names fails
  before any write; a global copy that cannot reach the registry keeps
  answering with the release it has (FR6). In a Yarn Plug'n'Play project, a
  copy cannot see the project's own CLI without running the project's
  loader, which FR2 forbids before the hand-off, so the release equal to the
  project's Core answers from the per-user cache instead; it is the same
  release whenever the project's CLI matches its Core.
- Browser evidence: not applicable; the contract is CLI output, exit status,
  and file changes.

## Current-state impact

- A CLI installed for the computer answers in every folder, inside projects
  that install their own copy too, and pairs its templates, docs, and agent
  text with the project's Core. A project whose CLI and Core are on different
  releases answers with the CLI's templates and docs and the Core's
  components. A package runner runs a CLI package installed for the computer
  in place of fetching one, at whatever release it was installed, and that
  copy never updates. A version requested on a package runner's command line
  answers inside a project, and in a package with no Astryx inside a project,
  a package runner fetches the newest CLI instead of running the project's. A
  project with Core and no CLI, and a fresh clone with nothing installed,
  answer with whatever CLI started the run, or fail. Outside a project, the
  commands that need Core fail, hints name the CLI package without a version,
  refusals use several error codes, nothing names the release that answered,
  and no check runs a command outside a project. Printed command names come
  from the package manager alone; many hints, errors, `doctor` fixes, docs,
  and the setup reminder print a fixed name instead; and an integration has no
  way to name the command its users run. Each of these departs from FR1–FR9.
- The CLI provides FR2–FR9 through the doors that run the CLI package
  directly. The parts that need the programmatic host entry arrive with it:
  FR1's host entry, its inputs, and its one-call rule; FR2's clause for a
  door that declines the project's CLI; FR3's integrations a door approves;
  the door name in FR5's picker; the host line in FR6; and
  `architecture:cli-surface` INV30. The official list FR8 ships is
  `spec:AST-051` FR10's. The project starters FR8 ships arrive with the
  template kind that ships them.
- `architecture:cli-surface`: every copy hands a project's run to the release
  that answers there before dispatch (FR2, FR9); command docs and the manifest
  carry
  `outsideProject` (FR4); the error-code set gains `ERR_PROJECT_REQUIRED` (FR4);
  success envelopes carry `meta.answeredBy` (FR5); the host entry takes the
  door's command name, its sources, and the reason for a declined hand-off (FR1,
  FR2); INV22's hints phrased with the run prefix take the name FR5's picker
  chooses; and INV13's single rendered source of agent docs covers every agent
  text (FR8). Each lands with the code that implements it.
- No record lists the integration manifest's fields. `cliCommand` (FR5) is an
  integration-level field, which INV24 allows, and the integration authoring
  reference documents it beside the other fields: its accepted values, its
  place in the picker's order, and what happens when integrations disagree
  (`spec:AST-017` FR14).
- `architecture:cli-surface` INV30 keeps how a host's package sets are
  matched, enumerated, and recorded; which release answers a hosted run, the
  host entry's inputs, and the standard-error lines of a hosted run are FR1,
  FR2, and FR5's.
- `spec:AST-047` FR7 and `spec:AST-048`'s platform support take the command
  name they print from FR5, and `spec:AST-051` FR6 admits a door's sources
  (FR1).
- `contributing:cli-conventions` adds the `outsideProject` declaration to its
  command checklist.
- Consumer docs (`cli`) describe the doors, which release answers a folder,
  what commands do outside a project, the per-user release cache, and how the
  global copy updates.
- The response fields this record adds are additive (`spec:AST-017` FR13). A
  new refusal, a moved error code, or a changed exit status outside a project
  is classified under `spec:AST-017` before it ships.

This specification change alters no runtime behavior or published package and
needs no Changeset.

## Verification

| Contract | Verification                                                                                                                                                                                                                  | Representative states                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1      | Door conformance: every command example, run through each door; host entry tests                                                                                                                                              | a project on the current minor and one on the previous minor; an empty folder; text and JSON; a second call in one process; a door source beside project and integration sources                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | A door's exit status, output, or file changes differ beyond FR5's command names and the FR5 and FR6 lines, a door's input reaches the CLI any way but the host entry, a second call in one process runs, or a door's source is called out of order or named as an integration's                                                                                                                                                                                                                                                    |
| FR2      | Release check: every page template scaffolded through a door into a project on the previous release, then typechecked; hand-off probes                                                                                        | a project with its own CLI; a project whose CLI and Core differ, both ways; a project with Core only; a workspace member with its own Core under a root CLI; a fresh clone with a lockfile and with only a declared range; an upgrade with a project CLI older than its Core; a declined project CLI, with and without its release; an unavailable release                                                                                                                                                                                                                                                                                                                          | A template fails where the matched release passes, a release other than the one equal to the project's Core answers, project configuration runs in another copy, or another release answers in place of an unavailable one                                                                                                                                                                                                                                                                                                         |
| FR3      | Empty-folder run of every command example                                                                                                                                                                                     | each command that needs Core; `doctor`, `swizzle`, and `upgrade`; a folder with no `package.json`; a home folder; a copy with no Core                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | A command that needs Core fails beside a carried Core, a project check reads it, or output gives a project step                                                                                                                                                                                                                                                                                                                                                                                                                    |
| FR4      | Declaration check over every command doc, plus the empty-folder run compared with each declaration                                                                                                                            | `same`, `refuse`, and `own`; a command group; a command without a value; a released refusal code                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | A command lacks a value, a `refuse` writes or uses an unlisted code, or a command's behavior differs from its value                                                                                                                                                                                                                                                                                                                                                                                                                |
| FR5      | Printed-command check: each command the CLI prints or writes, run from the same folder through the door that printed it; a picker check over every surface that prints a command; a check of shipped text; result-field tests | each door; `project`, `matched`, and `carried`; no declaration, one integration's command, two that agree, two that disagree, and a malformed one; hints, errors, `doctor` fixes, help, docs moves, agent text, and the setup reminder; text and JSON                                                                                                                                                                                                                                                                                                                                                                                                                               | A printed command reaches another door or release, a surface prints a name the picker did not choose, the picker's order changes, a disagreement prints either integration's command or `doctor` stays silent, a malformed declaration withdraws its integration, shipped text writes a CLI command any way but bare, JSON carries a picked name, `meta.answeredBy` is missing or wrong, or the line prints for the project's own CLI                                                                                              |
| FR6      | Update tests                                                                                                                                                                                                                  | offline; ten runs at once; JSON mode; a release that needs a newer Node; the tag moved back; a requested version; inside a project; the CLI package installed for the computer with npm, pnpm, Yarn, Bun, and a version manager; a package runner that runs the CLI package installed for the computer; the current release removed from the cache                                                                                                                                                                                                                                                                                                                                  | A command waits, its output or exit status changes, the line prints in JSON mode or asks for an update, two installs run, an unverified release answers, or a project changes                                                                                                                                                                                                                                                                                                                                                      |
| FR7      | File-system comparison before and after each command in the empty-folder run and in projects                                                                                                                                  | each command that writes; absolute, traversal, and symlinked paths; a home folder                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | A file lands outside the named places, or a refusal writes first                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| FR8      | Release build, drift checks, and a starter build in CI                                                                                                                                                                        | the official list; the agent text for each door; each starter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | A committed copy drifts, a global asset is fetched at run time, the computer-level text names a version, or a starter fails to scaffold, install, or build                                                                                                                                                                                                                                                                                                                                                                         |
| FR9      | Hand-off probes: every command example run through each copy in each folder kind, compared with the release FR2 names run directly in that folder                                                                             | the CLI package installed for the computer on an older and on a newer release than the project's CLI, run directly and run by a package runner in place of a fetch; a package runner's copy, unversioned and with a version requested inside a project, for a read and for `upgrade`; a project with Core but no CLI, through a package runner that fetches the newest release; a package with no Astryx inside a project, which the package runner takes for the project; a project CLI that predates the hand-off and one that hands off itself; a declined project CLI; a project CLI that cannot start; a non-zero exit; piped standard input; outside a project; text and JSON | A release other than the one FR2 names answers in a project, outside the declined case; a project CLI that differs from its Core answers; a requested version answers inside a project; a run is handed off twice or returns to a copy it left; arguments, folder, streams, or exit status differ from a direct run of the project's CLI; outside a project, a release answers that FR3 and FR6 do not name; or the line is missing, prints twice, prints in JSON mode, or prints for a run the project's own CLI answers directly |

## Decision log

### DEC-1 — One release answers each folder

**Reference:** `spec:AST-081/DEC-1`
**Decider:** `josephfarina (proposed)`

Two releases in one run write code that fails without an error: one release's
templates and component docs use props another release's Core does not have,
and the same command can import a theme in one release and copy its source in
another, both exiting 0. So the release equal to the project's Core answers
everything in a project, an upgrade runs the release its installed Core needs
because codemods ship with the newer CLI, and when that release cannot run, the
run fails instead of mixing.

Rejected: the newest release answering everywhere, which writes code an older
project's Core rejects.

### DEC-2 — Outside a project, answer as a new project would

**Reference:** `spec:AST-081/DEC-2`
**Decider:** `josephfarina (proposed)`

An agent with no project files still needs Core's components and docs, and a
new project on the newest release is what it would create. The carried Core
serves only commands that do not judge or change a project, so an empty folder
never passes a project check or receives a component copy whose packages
nobody installed.

Rejected: refusing every command that needs Core outside a project, which
leaves an agent without project files unable to learn Core.

### DEC-3 — Each command declares same, refuse, or own

**Reference:** `spec:AST-081/DEC-3`
**Decider:** `josephfarina (proposed)`

A declaration in each command doc, published in the manifest, tells a door and
an agent before a run whether a command works outside a project, and lets a
check prove the behavior matches. One shared refusal code lets an agent branch
on "open or start a project first" without learning each command's failure.

Rejected: a project, global, or both scope, which cannot express a command that
does a different job outside a project or has modes of each kind.

### DEC-4 — Who answered is data, and printed commands return through their door

**Reference:** `spec:AST-081/DEC-4`
**Decider:** `josephfarina (proposed)`

An agent comparing two reads needs to know whether one release gave both; a
field in `meta` tells it without changing an existing field or the envelope. A
printed command that names another door or an unpinned package starts a
different release than the one that printed it.

Rejected: a new top-level envelope field, which changes the envelope every
consumer reads.

### DEC-5 — Global copies update quietly and never touch projects

**Reference:** `spec:AST-081/DEC-5`
**Decider:** `josephfarina (proposed)`

Agents are the CLI's main callers and run printed commands unasked, so an
update notice that says what to run invites a change to the computer that
nobody asked for. A copy that installs in the background and switches on its
next run keeps every command fast and every output stable. A project's versions
belong to its owner; `doctor` reports what is newer.

Rejected: a notice that asks the caller to update, and updating or announcing
updates inside a project.

### DEC-6 — Anything global ships inside the release

**Reference:** `spec:AST-081/DEC-6`
**Decider:** `josephfarina (proposed)`

A list, a starter, or an agent text fetched at run time can disagree with the
release that reads it, and fails offline. Generated when the release is built,
it is exactly as current as the CLI that uses it.

Rejected: fetching global assets at run time.

### DEC-7 — Doors start the CLI through one entry, and their sources are their own

**Reference:** `spec:AST-081/DEC-7`
**Decider:** `josephfarina (proposed)`

A door's inputs cannot travel by flag or environment variable, and a call takes
over the process it runs in, so every door uses one documented programmatic
entry, once per process. A catalog a door serves is the door's source, named as
the door's and read after the integrations' sources, so a reader can tell which
catalog listed a package.

Rejected: replacing an integration's discover source under that integration's
name, which reports the door's catalog as the integration's own.

### DEC-8 — One picker names every printed command, and an integration's command comes first

**Reference:** `spec:AST-081/DEC-8`
**Decider:** `josephfarina (proposed)`

An integration that gives its users a command of its own knows how they reach
the CLI better than a guess from the package manager, and a door's name covers
only the runs that start in that door, so the picker tries the integration's
command, then the door's name, then the package manager's. When integrations
disagree, neither is right for every user of the project, so the picker uses
the package manager's name and `doctor` says why. Text written with a bare
`astryx` that takes the picked name when shown lets one doc serve every door
and stay correct when the door changes, and JSON keeps the one spelling a
program can rely on.

Rejected: settling a disagreement by integration order, which lets load order
choose the command a project's users are told to run.

### DEC-9 — Every copy hands off, so any install route reaches the project's release

**Reference:** `spec:AST-081/DEC-9`
**Decider:** `josephfarina (proposed)`

The CLI package itself is the common install, for the computer or through a
package runner, and a copy installed for the computer is also what a package
runner runs in place of a fetch. If only a separate launcher package handed a
project's run on, those routes would answer with their own release and bring
back the mix DEC-1 rejects, so the CLI package itself is the global install and
needs no launcher. A hand-off built into every copy makes the
project's pinned release answer wherever a run starts, a typed version
included, and leaves a run outside a project with the copy its caller chose.
One standard-error line keeps a hand-off visible without changing
machine-readable output.

Rejected: global mode only through a separate launcher package, which leaves
the common install routes answering with their own release inside projects and
gives people two packages to choose between.

### DEC-10 — The project's Core decides the release, not its CLI

**Reference:** `spec:AST-081/DEC-10`
**Decider:** `josephfarina (proposed)`

A project's CLI and Core drift apart after a partial upgrade, and in a
workspace an app can install an older Core than the root's CLI. The CLI's
release writes the templates, docs, and agent text, and the Core's release
supplies the components, so a mismatched pair writes code that may not compile,
with no warning. The Core is what the project's code runs against, so the
release equal to it answers, and the project's own CLI answers only when it is
that release.

Rejected: the project's own CLI answering whatever its version, which keeps
the mix DEC-1 rejects inside every half-upgraded project.

### DEC-11 — The global copy answers from the per-user cache

**Reference:** `spec:AST-081/DEC-11`
**Decider:** `josephfarina (proposed)`

The global copy follows `latest` by keeping verified releases in the per-user
cache and answering with the newest, while the package manager's own
installation stays as it was. That keeps a fallback release, writes only in a
named place, and needs no administrator rights.

Rejected: answering with the installed copy and never updating, which leaves a
stale copy answering outside projects and wherever a package runner runs it in
place of a fetch; and replacing the installed copy, which writes outside FR7's
places, can need administrator rights, and cannot keep the release it switched
from.

### DEC-12 — The computer-level agent text is one skill in two folders

**Reference:** `spec:AST-081/DEC-12`
**Decider:** `josephfarina (proposed)`

A skill loads only when an agent uses Astryx, so it costs nothing in the
sessions that never touch it, and the two folders reach the common coding
agents: one is read by most of them and the other by the one that reads only
its own. One explicit command writes it, so nothing changes a person's agent
setup at install or as a side effect.

Rejected: one always-on instruction file per agent, which loads in every
session and reaches fewer agents.

## Open questions

None.
