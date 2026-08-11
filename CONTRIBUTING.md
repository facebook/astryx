# Contributing to Astryx

For the full contribution process — what we accept, how to propose new components, and how API decisions are made — read the **[Contributing wiki](https://github.com/facebook/astryx/wiki/Contributing)**.

Key pages:

- **[API Conventions](https://github.com/facebook/astryx/wiki/API-Conventions)** — naming, prop patterns, composition rules (read before submitting an RFC)
- **[Design Conventions](https://github.com/facebook/astryx/wiki/Design-Conventions)** — the design-side bar: tokens, spacing, radius, elevation, type, color, motion, and state representations
- **[Specification Protocol](https://github.com/facebook/astryx/wiki/Component-Specification-Protocol)** — the 9-phase process for new components
- **[Component Lifecycle](https://github.com/facebook/astryx/wiki/Component-Lifecycle)** — how components move from lab → core and templates from hidden → visible
- **[API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration)** — how we resolve API design questions
- **[Contributing Templates](https://github.com/facebook/astryx/wiki/Contributing-Templates)** — building templates/blocks and the template grading rubric
- **[Blog Review Rubric](https://github.com/facebook/astryx/wiki/Blog-Review-Rubric)** — how docsite blog posts are reviewed
- **[Contributing with AI](https://github.com/facebook/astryx/wiki/Contributing-with-AI-Assistants)** — safe zones, spec protocol, and working with AI tools

This file covers local development setup.

---

## Prerequisites

### Node.js

The Node version lives in `.nvmrc` (currently the 24.x line). CI reads the same
file via `node-version-file`, so local and CI never drift apart. Don't declare
the version anywhere else.

**Via nvm (recommended):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.zshrc
nvm install   # no argument — reads .nvmrc
```

`fnm` and `mise` read `.nvmrc` too. `asdf` does not; its `.tool-versions` is
git-ignored precisely so it cannot become a competing source of truth.

**Via nodejs.org:**
Download and install from https://nodejs.org

### pnpm

Astryx uses [pnpm](https://pnpm.io/) as its package manager (declared in
the `packageManager` and `devEngines.packageManager` fields of
`package.json`). You can install pnpm directly:

```bash
# Via npm
npm install -g pnpm@11

# Via Homebrew (macOS)
brew install pnpm

# Via standalone installer (no npm or Node.js required)
curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=11.10.0 sh -

# Via GitHub releases (single binary, no dependencies)
# https://github.com/pnpm/pnpm/releases/latest
```

Or use [Corepack](https://nodejs.org/api/corepack.html) to install the exact
pnpm version Astryx pins:

```bash
corepack enable
```

Corepack ships with Node.js 22 and 24, but current Node.js 25+ releases no
longer bundle it. If `corepack` is missing and you want the auto-pinning path,
install Corepack manually first:

```bash
npm install -g corepack
corepack enable
```

Verify installation:

```bash
node --version   # v22.x.x or v24.x.x
pnpm --version   # 11.x.x
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/facebook/astryx.git
cd astryx

# Install dependencies
pnpm install

# Build core package first (required for Storybook)
pnpm -F @astryxdesign/core build

# Start Storybook for component development
cd apps/storybook
pnpm dev
```

### Running Storybook

Storybook loads pre-built packages from `dist/` folders, so you need to build packages before running Storybook.

**First time setup:**

```bash
# Build all packages
pnpm build

# Or build just core
pnpm -F @astryxdesign/core build
```

**Start Storybook:**

```bash
cd apps/storybook
pnpm dev
```

Storybook will open at http://localhost:6006 with:

- **Theme switcher** - Toggle between the base tokens and the Neutral, Stone, and Y2K themes
- **Mode switcher** - Toggle between Light and Dark modes
- **Component stories** - Interactive component examples

**If you make changes to `@astryxdesign/core`:**

```bash
# Rebuild core package
pnpm -F @astryxdesign/core build

# Restart Storybook to see changes
cd apps/storybook
pnpm dev
```

### Running the Doc Site

The doc site (`apps/docsite/`) is a Next.js app that renders the component
documentation at https://astryx.dev. To run it locally:

```bash
# First time only — build the workspace packages it depends on
pnpm build

# Start the doc site (Next dev server, defaults to localhost:3000)
pnpm docsite
```

`pnpm docsite` is a thin alias for `pnpm -F @astryxdesign/docsite dev`,
which runs the doc site's `generate` step (theme CSS, registries,
playground scope) before booting Next.

> **Note:** `pnpm docs` collides with the `npm docs` builtin, which
> tries to open the package's npm page in a browser. Use `pnpm docsite`
> instead.

## Project Structure

```
astryx/
├── apps/
│   ├── storybook/      # Component playground (localhost:6006)
│   ├── docsite/        # Doc site (localhost:3000)
│   └── sandbox/        # Development testing
│
├── packages/
│   ├── core/           # Core components (Button, Input, etc.)
│   ├── cli/            # CLI tooling (astryx)
│   ├── lab/            # Experimental components (not yet stable)
│   └── themes/         # Theme presets (neutral, stone, y2k, and more)
│
└── internal/           # Internal tooling (not published)
    └── test-utils/     # Shared test helpers
```

## Development Workflow

### Common Commands

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `pnpm install`    | Install all dependencies                     |
| `pnpm dev`        | Start Storybook (alias for `pnpm storybook`) |
| `pnpm build`      | Build all packages                           |
| `pnpm test`       | Run all tests                                |
| `pnpm test:watch` | Run tests in watch mode                      |
| `pnpm storybook`  | Start Storybook at localhost:6006            |
| `pnpm lint`       | Lint all packages                            |

## Adding a New Component

Components use **colocated tests** — test files live alongside the component.

### 1. Create the Component Directory

```bash
mkdir -p packages/core/src/MyComponent
```

### 2. Create the Component Files

```
packages/core/src/MyComponent/
├── MyComponent.tsx        # Component implementation
├── MyComponent.test.tsx   # Unit tests (colocated)
├── MyComponent.doc.mjs    # Component doc (props, features, examples)
└── index.ts               # Public exports
```

Stories are **not** colocated — they live in the Storybook app:

```
apps/storybook/stories/MyComponent.stories.tsx
```

### 3. Component Template

````tsx
// MyComponent.tsx
import type {HTMLAttributes, ReactNode, Ref} from 'react';

export interface MyComponentProps extends HTMLAttributes<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: Ref<HTMLDivElement>;
  /** Description for AI-assisted development */
  children: ReactNode;
}

/**
 * Brief description of the component.
 *
 * @example
 * ```
 * <MyComponent>Hello</MyComponent>
 * ```
 */
export function MyComponent({children, ref, ...props}: MyComponentProps) {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}

MyComponent.displayName = 'MyComponent';
````

### 4. Test Template

```tsx
// MyComponent.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MyComponent} from './MyComponent';

describe('MyComponent', () => {
  it('renders children', () => {
    render(<MyComponent>Hello</MyComponent>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### 5. Story Template

Stories live in the Storybook app, not next to the component —
`apps/storybook/.storybook/main.ts` discovers them with
`'../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'`, so a story anywhere under
`packages/` is never picked up. Import the component through its published
entry point, and title it under `Core/` (or `Lab/` for `@astryxdesign/lab`).

```tsx
// apps/storybook/stories/MyComponent.stories.tsx
import type {Meta, StoryObj} from '@storybook/react';
import {MyComponent} from '@astryxdesign/core/MyComponent';

const meta = {
  title: 'Core/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Hello World',
  },
};
```

### 6. Export from Package

```ts
// packages/core/src/index.ts
export * from './MyComponent';
```

> **Note:** Do not manually edit the `"exports"` field in `packages/core/package.json`.
> It is auto-generated from the `src/` directory by `scripts/sync-exports.js` and
> committed automatically when changes land on `main`. If you need to verify your
> component will be included, run `pnpm sync:exports:check`.

## Accessibility Checklist

Every new component — and any change to an interactive one — must clear the
**[Accessibility Checklist](https://github.com/facebook/astryx/wiki/Accessibility-Checklist)**
(wiki) before review. The checklist lives on the wiki so accessibility
experts can refine it without a code PR; reviewers block on it (see
[The bright lines](#the-bright-lines--these-block)), and it is a hard
requirement for a lab → core promotion (see `packages/lab/README.md`).

Two repo-side rules worth restating here:

- Compose the shared primitives rather than hand-rolling equivalents — see
  [Code Style](#code-style) for the list. A bespoke reimplementation of one is a
  review reject.
- CI is the enforcement layer, not a replacement for the checklist: the
  `pr-a11y` job runs an axe audit on every PR that touches components, a weekly
  workflow scans the full component surface, and the `useAnnounce` lint rule
  rejects hand-wired `aria-live` regions. axe only catches static, DOM-level
  issues — keyboard behavior, focus management, and announcement timing are
  exactly what the checklist and the component's unit tests cover.

## Working on the `astryx` CLI

The CLI (`packages/cli/`) is layered so behavior, presentation, and contracts stay separable:

- **`clients/cli/`** — the Commander program and per-command handlers. A handler is a _thin wrapper_: parse flags → call the matching `api/` function → render (JSON via `jsonOut`, or text via the formatter kit in `clients/cli/formatters/`).
- **`api/`** — the programmatic API (`@astryxdesign/cli/api`). Each command maps to `api/<name>/`, whose functions return a typed `{ type, data }` envelope. This is the behavior source of truth, so `astryx --json` and the imported function return identical data.
- **`authoring/`** — the pure data contracts (`@astryxdesign/cli/authoring`): the TypeScript types you author objects against (config, integration, codemod, and the doc-types) plus the sealed zod parsers the CLI runs at the load boundary.
- **`foundation/`** — the bottom layer: cross-cutting infra that everything above builds on — the `{ type, data }` JSON contract, the stable `ERROR_CODES`, discovery (components, templates), integration contribution validators, and path-safety. It never imports `api/` or `clients/`; if foundation needs something, that something belongs in foundation.

### The CLI documents itself

Every CLI surface has a colocated, typed `.doc.mjs` next to what it describes, annotated with a `@type` from `@astryxdesign/cli/authoring`:

| Surface                                                                                 | Doc-type                                             | Lives next to                                              |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| An API function (a hook or an `api/` export)                                            | `FunctionDoc`                                        | `api/<name>/<fn>.doc.mjs`                                  |
| A CLI command                                                                           | `CommandDoc` (references its `FunctionDoc` via `fn`) | `clients/cli/commands/<name>.doc.mjs`                      |
| An authored object (config, integration, codemod, the doc-types, the response envelope) | `SchemaDoc`                                          | beside the schema (`authoring/**`, `foundation/response/`) |
| A closed vocabulary (error codes, response types)                                       | `EnumDoc`                                            | `foundation/response/`                                     |
| A long-form topic (tokens, principles, theming, …)                                      | `ReferenceDoc`                                       | `assets/docs/<topic>.doc.mjs`                              |

These are not free-form. `parseDoc` validates each at load, and a **drift harness** (`packages/cli/test/drift/`) enforces that they mirror their source of truth: every `CommandDoc`'s `fn`/args/options match the live CLI, and the `EnumDoc`s equal `ERROR_CODES` / the manifest's response-type set exactly. A doc that drifts fails CI.

### What's enforced for you

Most of the conventions above are mechanical, so they're checked rather than reviewed:

| Rule                                                                                                                                              | Enforced by                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| the layer directions hold: `authoring/` imports no other layer, `foundation/` never imports `api/` or `clients/`, `api/` never imports `clients/` | ESLint (`no-restricted-imports`) |
| zod stays sealed behind the `authoring/` parsers                                                                                                  | ESLint (`no-restricted-imports`) |
| commands register via `defineCommand`, never straight onto Commander                                                                              | ESLint (`no-restricted-syntax`)  |
| each doc-type ships `type.ts` + `parse.mjs` + `<kind>.doc.mjs`, re-exports its parser, and appears in `parseDoc`'s `@returns`                     | `pnpm check:cli-structure`       |
| each `api/<name>/` ships its typedefs, a `FunctionDoc`, and a test                                                                                | `pnpm check:cli-structure`       |
| every `CommandDoc`/`EnumDoc` matches the live CLI                                                                                                 | the drift harness                |

You never hand-write the `.d.mts` declarations. `packages/cli/scripts/sync-api-types.mjs` emits them for both `api/` and `authoring/` from the `.mjs` JSDoc — gitignored, regenerated at `prepack`, and stamped `@generated`. Edit the JSDoc and run `pnpm -F @astryxdesign/cli sync:api-types`.

That matters because a hand-written declaration _shadows_ the JSDoc in its `.mjs`, and both ways it can lie shipped once: a missing declaration made a strict consumer resolve the parser as `any` (surfacing only at pack time as TS7016, since local typechecks run with `checkJs` and never exercise the packed surface), and a stale `parseDoc` union silently dropped three doc kinds from the published type while still compiling. Generation removes both. The one declaration still written by hand is `authoring/index.d.ts`, the curated public barrel.

### Adding a command

Author the docs _before_ the handler: `defineCommand` builds the Commander command from the `CommandDoc`, so the handler needs it to exist.

1. Add the behavior under `api/<name>/`, with a colocated `<name>.type.mjs` (the `Options` + `{ type, data }` response typedefs — the shape source of truth) and a test.
2. Author the docs — a `FunctionDoc` at `api/<name>/<fn>.doc.mjs` and a `CommandDoc` at `clients/cli/commands/<name>.doc.mjs`. Copy the `search` pair as a template.
3. Write the thin handler in `clients/cli/commands/<name>.mjs`, registering it with `defineCommand(program, <name>Command, {fn: <name>Fn, action})` so `--help` and the manifest come from the doc. Call its `register<Name>` from `clients/cli/index.mjs`.
4. Run the checks below. The drift harness catches a doc that disagrees with the live command, and `check:cli-structure` catches a missing typedef, doc, or test.

### Testing the CLI

```bash
# Run the CLI locally (no build needed)
node packages/cli/clients/cli/bin/astryx.mjs --help

# Validate every colocated doc parses + mirrors its source of truth
pnpm -F @astryxdesign/cli test              # includes the drift suite
pnpm -F @astryxdesign/cli typecheck:authoring

# Structural conventions (doc-type quartets, api/ leaf contents). Also runs as
# part of `pnpm lint` via check:repo, and in the pre-commit hook.
pnpm check:cli-structure

# Keep the generated CLI README tables (commands, error codes, response types)
# in sync with the manifest + EnumDocs. After an intended change, refresh + review:
pnpm -F @astryxdesign/cli readme            # regenerate the tables
pnpm -F @astryxdesign/cli readme:check      # CI gate: fails on any un-refreshed drift
```

## Testing

### Run Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Specific package
pnpm -F @astryxdesign/core test

# With coverage
pnpm test:coverage

# Accessibility and RTL audits over the built Storybook (see below)
pnpm a11y:audit
pnpm rtl:audit
```

### Test Structure

Tests are colocated with components:

```
src/Button/
├── Button.tsx
└── Button.test.tsx   # Tests live here
```

### Accessibility audits

PRs that touch components run an axe-core audit (the `pr-a11y` CI job) over
the Storybook stories of the changed components. The job **fails** when it
finds a violation that is not listed in the checked-in baseline,
`.github/a11y-baseline.json`. Violations are keyed
`Component::Story::rule-id`, so unrelated markup churn does not invalidate
baseline entries.

To reproduce and fix a failure locally:

```bash
# One-time setup
pnpm storybook:build
npx playwright install chromium

# Audit specific components against the baseline (what CI does)
pnpm a11y:audit -- --components Button,Dialog
```

Fix the violation whenever possible. If it is a known, intentional exception,
add it to the baseline (scoped to the affected components, and expect
reviewers to ask why):

```bash
pnpm a11y:baseline -- --components Button,Dialog
```

When the audit reports baseline entries as "resolved", delete them from
`.github/a11y-baseline.json` — the baseline should only shrink over time.

> **Scope caveat:** axe-core automates only a subset of WCAG (roughly a
> third of the success criteria). A green `pr-a11y` job does not mean a
> component is accessible — keyboard flows, focus order, screen-reader
> semantics, and contrast in context still need manual checks.

### RTL audits

PRs that touch components also run an RTL audit (`pr-rtl`), scoped to the
changed components like `pr-a11y`. It is soft-gated — findings show in the job
summary but don't block. Repro locally with `pnpm rtl:audit -- --filter Avatar`
(the `--` matters: `pnpm -F` is itself `--filter`). See
`apps/storybook/rtl-audit/README.md`.

## Versioning & Releases

We use [Changesets](https://github.com/changesets/changesets) for versioning, with a thin Astryx layer on top so changelogs stay categorized, contributor-attributed, and aligned with our pre-1.0 conventions.

### Adding a Changeset

When you make a change that should be released:

```bash
pnpm changeset:new
```

This wrapper:

1. **Detects which packages you changed** from your git diff and pre-selects them — no hand-enumerating the frontmatter.
2. **Asks for a category** (`breaking`, `component`, `feat`, `fix`, `perf`, `docs`, `chore`) — this drives changelog grouping, _not_ the semver bump.
3. **Captures the contributor(s)** — defaults to your `gh`/git identity, so credit is recorded at authoring time (not reconstructed from the release bot's commit).
4. **Derives the semver bump from the category** — a `[breaking]` change bumps the minor; everything else bumps the patch (see below).

It writes a normal `.changeset/<id>.md` — commit it with your PR. The body looks like:

```md
---
'@astryxdesign/core': patch
---

[fix] Spinner inherits the variant foreground on themed buttons (#2717)
@yourhandle
```

You can also pass everything as flags for non-interactive use:

```bash
pnpm changeset:new --category fix --summary "…" --pr 2717 --contributor yourhandle
```

> The bare `pnpm changeset` CLI still works, but you must follow the body
> convention by hand (`[category]` first line + `@handle` line). CI
> (`pnpm check:changesets`) rejects changesets missing a category or
> contributor, or whose bump doesn't match the category (`[breaking]` must be
> `minor`, everything else `patch`), or declaring a `major` bump while 0.x.

### Version Bumps

- **0.x (current): bump follows the category.** We track standard semver for the `0.x.y` range, where a minor bump is the breaking tier (under a caret range like `^0.1.8`, npm resolves `<0.2.0`, so `0.1.x → 0.2.0` is what signals "may break you"). A `[breaking]` change bumps the **minor** (`0.x.y → 0.(x+1).0`); every other category (`feat`, `fix`, `component`, `perf`, `docs`, `chore`) bumps the **patch**. `major` is never used while 0.x — it would jump to `1.0.0`. `pnpm changeset:new` writes the right bump from the category you pick; `pnpm check:changesets` is the CI backstop that enforces the coupling both ways.
- All publishable packages are a `fixed` group, so a single change co-bumps them to the same version. Only genuinely-affected packages get a changelog entry — the rest get a clean version-only bump.

### How a release is cut

```bash
pnpm version-packages   # changeset version + scripts/format-changelogs.mjs
```

`format-changelogs.mjs` rewrites each just-bumped package CHANGELOG into the doc-site format (h1 version, `#### <Category>` sections in canonical order, and a `#### Contributors` section aggregated from the changeset `@handle`s). It's idempotent and has a `--check` mode for CI drift detection.

## Finding Something to Work On

Labels signal what's open for contribution:

- **`good first issue`** / **`help wanted`** — ready to be picked up; start here.
- **`discussion`** — still being shaped and **not ready for contribution**. The problem is
  recorded but the solution isn't decided. Please don't start work on a fix until it's triaged
  out of `discussion`. Comments and ideas are welcome.

For **pull requests**, use GitHub's native **Draft** state to signal "not ready to review/merge
yet" — open the PR as a draft and mark it ready for review when it's done.

## What's expected of a change

This section is the **bar**: what every change has to carry, and what blocks.
It is stated here once so you can clear it before you open the PR, and so
reviewers have a single rule text to cite. `.github/copilot-instructions.md`
covers how a review is written and posted, not what the bar is.

**The bar does not move with the author.** The same checks, the same severity,
and the same tone apply whether the PR comes from an eng owner, a design owner,
or a first-time contributor. A hardcoded color is a blocker either way, and an
owner's PR is not pre-vetted.

### The bright lines — these block

A finding's severity is set by **what breaks if it ships**, not by how likely
the trigger is, who wrote it, or whether a linter already flagged it. A rare
path to data loss is still a blocker; a lint-suppressed hardcode is still a
blocker. Low probability, a documented `eslint-disable`, "the happy path
works," and the author's seniority do not soften a bright-line violation into
advisory. Score the failure first; likelihood only prioritizes the fix.

Each of the following blocks on its own:

- **Hardcoded colors.** Every color is either a token — `var(--color-*)` — or
  **derived from tokens** via `color-mix()` / `light-dark()` / `calc()` whose
  inputs are vars. **No raw hex/rgb/hsl anywhere**, including as an argument to
  `light-dark()` or `color-mix()`, behind a `const`, or under an
  `eslint-disable`. "No suitable token exists" is **not** an exception: prefer
  an existing semantic token (e.g. `--color-overlay` for a scrim), derive from
  one (the on-media absolutes `--color-on-dark` / `--color-on-light` for fixed
  values over images), or add a token. Same rule for spacing, radius, and
  shadow — token or derived-from-token, never a raw value.
- **Removing a themeable surface.** Replacing a token, a `themeProps` target, or
  a `MediaTheme`-flowed override with a fixed value so a theme can no longer
  influence it. Ask _"is this still themeable?"_ before _"is this lint-clean?"_.
  A value pinned on `xstyle` / `style` sits at the top of the cascade (see the
  Cascade Model in [Theming Infrastructure](https://github.com/facebook/astryx/wiki/Theming-Infrastructure))
  and takes that surface out of the theme system — blocking even when it renders
  correctly.
- **Raw CSS or hand-rolled JS style workarounds** for anything StyleX supports
  (verify against `internal/stylex-capabilities/CAPABILITIES.md`, mirrored in
  the `STYLEX-CAPS` block of `CLAUDE.md`), or raw HTML where an Astryx
  primitive exists.
- **A broken accessible path — any modality.** Mouse, keyboard, screen reader,
  and touch must all keep the control operable. Touch is an operable modality:
  hover-gated reveals break **hybrid devices** (touchscreen laptops report
  `hover: hover` + `pointer: fine`), so a control that only appears on `:hover`
  can leave an invisible-but-clickable element — especially destructive ones.
  Prefer `@media (any-pointer: coarse)` ("the device _has_ touch", incl.
  hybrids) over `hover: none` for "always show". Also blocking: focus lost on
  state change, a focusable element removed from the DOM, or an interactive
  target below the minimum size.
- **Accessibility.** Beyond the broken-path rule above, each of these is a
  bright line on its own:
  - an interactive element without an accessible name;
  - a state change not exposed to assistive tech (visual-only state);
  - a keyboard trap, or an interaction that only works with a pointer;
  - state signaled by color alone;
  - focus not managed on open/close of an overlay (trap while open via
    `useFocusTrap`, restore on close);
  - a live announcement that bypasses `useAnnounce` (a hand-wired `aria-live`
    node);
  - hardcoded English in an AT-facing string (labels, announcements, hints —
    same i18n rule as visible text);
  - a new component that hasn't run the
    [Accessibility Checklist](https://github.com/facebook/astryx/wiki/Accessibility-Checklist).

  The `pr-a11y` axe job catches the static/DOM-level subset automatically; axe
  cannot see keyboard, focus, or announcement _behavior_ — those are on the
  reviewer.

- **Hardcoded user-facing strings.** All UI text goes through `useTranslator()`
  / the i18n key system (`@astryx/no-hardcoded-i18n-string`), and new keys must
  match the required format (`@astryx/i18n-key-format`).
- **Public API-convention violations** (see [API Conventions](https://github.com/facebook/astryx/wiki/API-Conventions)) —
  booleans not `is`/`has`-prefixed, wrong callback shape (`onValueChange` for the
  primary change instead of `onChange`; missing the `changeAction` async twin —
  the shipped convention is `<verb>Action` (`changeAction`, `clickAction`), not
  `on<Verb>Action`), inventing a name when a sibling convention exists (match
  `showOn`, `endContent`, etc.), dropping `...rest` / passthrough, or
  `xstyle`/`className`/`style` overwritten instead of merged via `mergeProps`.
  Public API shape is hard to walk back — it is blocking, not a nit.
- **A real bug or breaking change**, including _latent_ ones: a passthrough
  silently dropped, a feature that breaks when composed with another, a
  regression in an existing behavior. A deliberate breaking change needs a
  `[breaking]` changeset and, for a removed/renamed/changed public API, a
  codemod under `astryx upgrade`.
- **Public-repo leak** — internal identifiers, infra names, internal usernames
  or employer-domain emails, or tool/assistant fingerprints in any committed
  text (code, comments, PR title/body, changeset).
- **Missing changeset** for a consumer-visible change.

Everything else is either **advisory** — design-taste calls, optional
refactors, questions where the _fix_ is genuinely open — or clean. An advisory
_remedy_ does not make a blocking _finding_ advisory: the block stands while
the approach is discussed.

### The bar, by change type

How much a change has to carry depends on what kind of change it is. This
mirrors "Reviewing a change" in the
[Component Audit Rubric](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#reviewing-a-change),
which is where reviewers get the same table:

| Your change                                                               | What it has to carry                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Bug fix**                                                               | Evidence it was broken before and is fixed now — a test that was red and is now green, or a before/after screenshot for a visual bug. State that evidence in the PR description. A clean fix with real evidence is done.                                           |
| **New feature** (new prop, variant, or behavior on an existing component) | Every automatable check, plus a judgment pass on the audit items the change actually touches. New API surface should be spec'd and vibe-tested rather than settled in the PR.                                                                                      |
| **New component in `core`**                                               | A full audit — every section, with visual evidence. A component in `core` is a permanent public commitment.                                                                                                                                                        |
| **New component in `lab`**                                                | Deliberately lax: the automatable checks and whatever the change touches. Lab is canary-only and promises no stability, so the rest is noted as _worth an audit before promotion_ rather than blocked. The full audit is the **promotion gate**, not an entry fee. |

Everything that reaches `core` gets the full audit eventually — as a new
component, or at promotion. Lab only moves _when_.

### Before you push

These are mechanical and non-negotiable; a reviewer stops at a red one rather
than spending judgment on a PR that doesn't build.

```bash
pnpm lint:strict   # CI severity, not the local warn tier — a warn-tier-green PR is not lint-clean
pnpm test          # the full suite, locally; CI is not your test runner
pnpm build
```

`pnpm lint:strict` runs `pnpm check:repo` first, which covers `check:sync`,
`check:package-boundaries`, `check:changesets`, `check:demo-media`,
`check:executable-bits`, `check:cli-structure`, and `check:use-client` — so a
green `lint:strict` also clears the changeset and `'use client'` gates.

Also attach **before/after screenshots for any visual change**, and update the
Storybook story for anything the change added or altered.

### How deep a review goes

Depth is set by the change, and the specific checks come from what the diff
touches. The
[Component Audit Rubric](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#reviewing-a-change)
carries both: the change-type bar above, and a trigger table mapping what a
diff touches (StyleX values, `themeProps`, ARIA, `*Props` interfaces,
`useEffect`, strings, RTL-sensitive layout, `.doc.mjs`, rendered output,
published exports) to the numbered checks it earns. Each check has an id you
can look up when a reviewer cites it.

Two things override that triage: a bright line above blocks on any path, no
matter how shallow the review; and **you are never asked to fix problems you
inherited** by touching a file. A pre-existing finding is filed separately, not
attached to your PR.

### Where component grades live

Audited components carry a score and an open-blocker count on the
[Component Scores](https://github.com/facebook/astryx/wiki/Component-Scores)
page — useful context for what shape a component is in before you change it.
Most components are unaudited, which means "no evidence", not "fine". **No pull
request is gated on a score**, and a stale or low score can only ever help a
contributor: the ratchet fails on regressions, never on inherited debt.

## Pull Request Guidelines

1. Create a feature branch from `main`
2. Make your changes with tests
3. Clear [Before you push](#before-you-push): `pnpm lint:strict`, `pnpm test`,
   `pnpm build`
4. Add a changeset if needed: `pnpm changeset:new`
5. Open a PR with a clear description
6. **Leave "Allow edits by maintainers" enabled** (it's checked by default when
   you open the PR). This lets us rebase your branch onto the latest `main` to
   clear merge conflicts and keep CI passing against current `main`, so a PR
   that's ready doesn't get stuck behind staleness while you're away.

> **Why this helps.** `main` moves quickly, and a branch that was green a few
> days ago can go stale — CI last ran against an older `main`, or a merge
> conflict appears. With maintainer edits enabled we can rebase and re-run CI
> for you instead of round-tripping. (One exception: PRs that modify
> `.github/workflows/**` can't be pushed on your behalf — GitHub requires the
> author to update those; we'll ping you if so.)

## Code Style

These are the repo-wide conventions. They apply to every package; the
path-scoped reviewer notes under `.github/instructions/` point here rather than
restating them.

- **TypeScript strict mode.**
- **Functional components that declare `ref` as a prop** (React 19 — no
  `forwardRef`; `@eslint-react/no-forward-ref` rejects it, and
  `@astryx/require-ref-prop` requires `ref?: React.Ref<T>` on a publicly
  exported props interface). Export prop types alongside the component, and set
  a `displayName`.
- **Style with StyleX only.** No raw CSS and no hand-rolled JS workaround for a
  CSS feature StyleX already supports — verify against the generated capability
  reference in `internal/stylex-capabilities/CAPABILITIES.md` (mirrored in the
  `STYLEX-CAPS` block of `CLAUDE.md`) rather than asserting. Guard `:hover` with
  `@media (hover: hover)`, and use a component-scoped `stylex.defineMarker()`
  for form controls — never `stylex.defaultMarker()`, which leaks
  hover/focus-within from outer containers.
- **Semantic tokens only.** No hardcoded color, spacing, radius, or shadow
  values; components stay theme-agnostic.
- **Style Astryx components directly — no styling-only wrappers.** Every
  component extends `BaseProps`, so it takes `xstyle`. A `<div>`/`<span>` added
  only to carry styles around a component is not a neutral extra node: it takes
  the component out of its parent's flex/grid child relationship, which is how
  the pagination carets lost their centering (#4752). Write
  `<Icon icon="chevronsLeft" xstyle={rtlStyles.mirror} />`, not
  `<span {...stylex.props(rtlStyles.mirror)}><Icon … /></span>`. A wrapper that
  does something the child cannot — establishes a flex/grid _container_, pads
  around the child's border box, carries semantics, behavior, or a `ref` — is
  fine. `@astryx/no-style-only-wrapper` catches the mechanical cases, but it
  runs as a warning while existing sites are migrated, so a new one is a review
  finding rather than a lint failure. Reach for the behavior hook or prop the
  system already exposes (`tooltip` / `useTooltip`, `useHoverCard`,
  `useClickableContainer`, `useCollapsible`, `useFocusTrap`, …) before adding a
  wrapper to host behavior.
- **Compose the shared accessibility primitives, don't hand-roll them** —
  `VisuallyHidden`, `useAnnounce`, `useFocusTrap`, `useTypeahead`,
  `useInteractiveRole`, and the focus hooks (`useListFocus`, `useGridFocus`,
  `useTreeFocus`). They implement the WAI-ARIA APG patterns and are tested once;
  a bespoke reimplementation is a review reject.
- **Navigation goes through `useLinkComponent()`**, never a hardcoded `<a>`
  (`@astryx/no-hardcoded-anchor`).
- **`'use client'` first.** A file importing a React client API from `react`
  must have `'use client';` as its first statement — only comments and blank
  lines may precede it. Enforced by `pnpm check:use-client`, part of
  `pnpm check:repo`.
- **JSDoc comments for AI-assisted development**, and keep code comments
  minimal otherwise: comment _why_, not _what_. Narration comments,
  commented-out code, and changelog-in-code are review findings.
- **Changesets** for consumer-visible changes — see
  [Adding a Changeset](#adding-a-changeset).

## Troubleshooting

### Setup Issues

**`pnpm: command not found`**

Install pnpm directly:

```bash
npm install -g pnpm@11
```

Or enable Corepack if you want to use the repository's pinned pnpm version:

```bash
corepack enable
```

**`corepack: command not found`**

Install Corepack manually, then enable it:

```bash
npm install -g corepack
corepack enable
```

Node 25+ does not include Corepack. You can either install Corepack manually or
install pnpm directly.

**Unexpected Node.js version**

Check the active version before installing dependencies:

```bash
node --version
```

Use an active LTS line such as 22 or 24 if your shell selected a different
version, such as a non-LTS `stable` release.

**CLI path issues**

If `astryx` is not found in a consuming app, add the package script shown in the
root `README.md` and run it through your package manager:

```bash
pnpm astryx -- component --list
```

### pnpm Installation Issues

If `corepack enable` succeeds but `pnpm` fails to download its binary
(e.g. `ECONNRESET`, `fetch failed`, or `503` from `registry.npmjs.org`),
your environment likely blocks outbound network access.

**Alternative install methods (no `registry.npmjs.org` needed):**

```bash
brew install pnpm                        # Homebrew (macOS)
curl -fsSL https://get.pnpm.io/install.sh | sh -  # Standalone installer
npm install -g pnpm@11                   # Via npm
```

You can also download the binary directly from
[GitHub Releases](https://github.com/pnpm/pnpm/releases/latest).

**Sandboxed IDE terminals:** if your IDE blocks all network, run
`corepack enable && pnpm install` from a regular terminal first, then
open the project in your IDE — `node_modules` is on the local filesystem
and doesn't need network to use.

### Storybook Issues

**"Failed to fetch dynamically imported module"**

- Cause: Core package not built or out of date
- Fix: `pnpm -F @astryxdesign/core build` then restart Storybook

**"React is not defined"**

- Cause: Missing React import in preview.tsx
- Fix: Ensure `import * as React from 'react';` at top of preview.tsx

**"Unexpected 'stylex.defineVars' call at runtime"**

- Cause: StyleX code trying to run without compilation
- Fix: Storybook should load from `dist/` not `src/`. Check vite.config.ts aliases.

**Changes not appearing in Storybook**

- Rebuild the package: `pnpm -F @astryxdesign/core build`
- Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear Storybook cache: Remove `apps/storybook/node_modules/.cache`

## Translations

Astryx accepts community translations via Crowdin. To help translate astryx
into your language, visit <https://crowdin.com/project/astryx>. New locales are
picked up automatically after a maintainer reviews the auto-generated
translations PR.

## Contributor License Agreement ("CLA")

In order to accept your pull request, we need you to submit a CLA. You only need
to do this once to work on any of Meta's open source projects.

Complete your CLA here: <https://code.facebook.com/cla>

## Issues

We use GitHub issues to track public bugs. Please ensure your description is
clear and has sufficient instructions to be able to reproduce the issue.

Meta has a [bounty program](https://bugbounty.meta.com/) for the safe disclosure
of security bugs. In those cases, please go through the process outlined on that
page and do not file a public issue.
