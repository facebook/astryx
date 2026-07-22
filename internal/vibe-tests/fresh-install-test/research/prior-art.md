# Prior art: how libraries guarantee their init/setup runs

**Purpose.** Astryx ships `@astryxdesign/core` (npm package) + `@astryxdesign/cli`
(`astryx`). `astryx init` writes an `<!-- ASTRYX:START -->` cheat sheet into
`AGENTS.md`/`CLAUDE.md` so AI agents discover the component index. The problem:
people run `npm install @astryxdesign/core` but **rarely run `astryx init`**, so
the agent never gets the cheat sheet. Measured behavior: agents reliably discover +
install the CLI, but run `init` only ~half the time — because the README documents
a **complete manual setup** that lets the agent finish the task without init.

This doc surveys how other tools guarantee setup, dissects the package-lifecycle
(`postinstall`/`prepare`) path for reliability across npm/pnpm/yarn, covers
AI-agent-native channels, and ends with ranked, concrete recommendations for Astryx.

> Claims are from training knowledge (no web access here). Version-specific or
> internal-behavior claims I'm less than certain about are marked **(verify)**.

---

## TL;DR — top 3 recommendations for Astryx

1. **Remove the escape hatch: make `astryx init` the *only* documented setup path.**
   Today the core README ships a full copy-paste manual Quick Start *and* an init
   callout, so agents complete the task without init. This is the shadcn model —
   the CLI is the only sanctioned path. Highest leverage, directly targets the
   measured 50% failure, zero new machinery. (Details: R1.)

2. **Deliver the cheat sheet *passively*, so discovery never depends on running a
   command.** Put the `ASTRYX:START…END` block verbatim in the *published core
   README*, ship it as `node_modules/@astryxdesign/core/AGENTS.md`, and add a
   `@see npx astryx init` banner to the top of `dist/index.d.ts`. Agents read
   READMEs and `.d.ts` reflexively; these survive script-blocking and CI. (R2.)

3. **Fail loud + integrate at build time (Prisma / Playwright / Tailwind-v4 /
   Expo pattern).** Add a dev-only runtime guard that throws a clear, copy-pasteable
   error ("Astryx CSS not loaded — run `npx astryx init`") when components render
   unstyled, and ship an optional Vite/Next plugin that wires the CSS so "add to an
   existing app" needs no manual steps. You already have `astryx doctor` as the
   read-only CI/agent-facing half of this. (R3.)

**Reliability principle that runs through all of this:** you cannot make an agent's
*choice* happen 100% of the time — you either **remove the choice** (single path),
or use channels that **don't require the choice** (passive in-package delivery,
runtime failures, build-time plugins, `postinstall`). The `postinstall` auto-run is
the only channel that can literally hit 100% *without a working README*, but it is
the **least portable** (pnpm 10 blocks it; CI/`--ignore-scripts` skip it) — so it
must be a redundant booster, never the sole mechanism.

---

## 0. Framing: two problems that are often conflated

Astryx actually has **two** goals, and different tools solve different ones:

- **(A) Deliver the cheat sheet** (the component index) to the agent's context.
  This is an *information-delivery* problem. It does **not** require any command to
  run — it can be shipped in files the agent already reads.
- **(B) Perform project setup** (CSS imports, theme provider, link provider).
  This is a *side-effecting* problem — files must be created/edited in the user's
  project. `astryx init` does both A and B today.

Most "init reliability" tricks below are really about (B). But Astryx's *measured*
failure is mostly (A): the agent does a perfectly good manual (B) and never runs
init, so (A) never happens. The cheapest wins make (A) independent of any command.

---

## 1. Comparison table — tool × mechanism × auto/prompted × existing-project × caveats

| Tool | Setup mechanism (exact) | Auto vs prompted | Existing project? | Reliability / UX caveats |
|---|---|---|---|---|
| **shadcn/ui** | `npx shadcn@latest init` → writes `components.json`; `npx shadcn@latest add <c>` copies component **source** into your repo (registry model). No runtime dep. | **Prompted** (user must run CLI). Non-interactive via flags. | **Yes** — `init` detects framework (Next/Vite/Remix), wires Tailwind, CSS vars, `cn()`, path aliases. | The CLI **is the only path** — there's no "npm install shadcn" that competes with it. That's exactly why it "always" runs. MCP server + namespaced registries now too. |
| **create-next-app** | `npx create-next-app@latest` (alias `npm create next-app`). Scaffolds a new app. | **Prompted** scaffolder. | **No** (greenfield only). | Can't be "forgotten" — it *is* step 0. Next 16 now emits an **`AGENTS.md`** into the new app **(verify version)**. |
| **create-t3-app** | `npm create t3-app@latest`. Interactive: Next, tRPC, Prisma, Tailwind, NextAuth. | **Prompted** scaffolder. | **No** (greenfield). | Same as above; opinionated bundle so setup is coherent by construction. |
| **Prisma** | `@prisma/client` `postinstall` runs `prisma generate` **(verify internals)**; docs also tell you to add `"postinstall": "prisma generate"` to *your* package.json. Runtime throws *"@prisma/client did not initialize yet. Please run `prisma generate`"*. | **Auto** (postinstall) **+ loud runtime failure** as backstop. | **Yes** — generate is idempotent; re-runs on schema change. | Postinstall skipped under `--ignore-scripts`, **pnpm's script block**, and node_modules caching (Vercel) → hence the explicit `postinstall` recommendation + the fail-loud runtime error. The runtime error is the real guarantee. |
| **Sentry Wizard** | `npx @sentry/wizard@latest -i nextjs` (also `-i sveltekit`, `remix`, …). Patches config, creates instrumentation/config files, injects DSN, sets up sourcemap upload. | **Prompted** (interactive), one-shot. | **Yes** — patches an existing app in place; detects framework. | Separate `npx` tool, not a dep hook. Depends on user/agent choosing to run it; mitigated by very prominent docs. |
| **Tailwind v3** | `npx tailwindcss init` / `init -p` → `tailwind.config.js` (+ `postcss.config.js`); add `@tailwind` directives to CSS + `content` globs. | **Prompted** (scaffold) then **manual** config. | **Yes** (add config + directives). | Multi-step, easy to misconfigure `content` → "styles missing." Motivated the v4 redesign. |
| **Tailwind v4** | **Zero-config**: `@import "tailwindcss";` in CSS + a plugin (`@tailwindcss/postcss` or `@tailwindcss/vite`). Config via CSS `@theme`. `init` command removed **(verify)**. | **Auto-ish** (plugin does the work). | **Yes** — one import + one plugin line. | Setup surface shrunk to ~2 lines → far less to "forget." **Directly relevant to Astryx** (reduce (B) so only (A) remains). |
| **Husky** | `"prepare": "husky"` (v9) / `"husky install"` (v8) in **your** package.json → git hooks installed on `npm install`. | **Auto** via `prepare` (root only). | **Yes** (your own repo). | Key semantics: `prepare` runs for the **root/git** install, **not** when your package is a dependency. CI guarded (skip if no `.git` / `CI`). |
| **Storybook** | `npx storybook@latest init` (older `npx sb init`). Detects framework+builder, installs addons, scaffolds `.storybook/` + example stories. | **Prompted**, auto-detecting. | **Yes** — adds to existing app. | One command does a lot; depends on being run. |
| **Playwright** | `npm init playwright@latest` (scaffold config+tests); `npx playwright install` (download browser binaries). `playwright` pkg postinstall also fetches browsers **(verify)**. Runtime error: *"Executable doesn't exist … run `npx playwright install`."* | **Prompted** + **loud runtime failure** for the browser-download step. | **Yes**. | Browsers are a *separate* required step; the actionable runtime error is what makes it reliable when postinstall is skipped (CI images, pnpm). |
| **Angular `ng add`** | `ng add @angular/material` → CLI fetches pkg, runs its **`ng-add` schematic** (declared via `schematics` collection). Edits modules, styles, `angular.json`. `ng update` = migration schematics. | **Auto once invoked** (schematic mutates project). | **Yes** — schematics are designed to patch existing apps idempotently. | Gold standard for framework-integrated setup, but requires Angular CLI and `ng add` instead of `npm install`. |
| **Expo** | `npx expo install <pkg>` (version-aligned install). **Config plugins**: pkg ships `app.plugin.js`; listed in `app.json > plugins`; applied at `npx expo prebuild` to modify native projects. `npx create-expo-app` for greenfield. | **Auto at build time** (config plugin runs during prebuild). | **Yes** — plugins re-apply on every prebuild (idempotent). | Native changes are regenerated, not hand-edited → survives upgrades. Requires the Expo build pipeline. |
| **Supabase** | `npx supabase init` (local dev scaffolding), `supabase login`/`link`/`start`. Client: `@supabase/supabase-js` → `createClient(url, anonKey)` from env. | **Prompted** (CLI) / **manual** (client code + env). | **Yes**. | SDK usage is docs+env-driven; failure mode is a runtime error on missing/invalid keys. |
| **Clerk** | Install `@clerk/nextjs`; wrap in `<ClerkProvider>`; add `clerkMiddleware()` in `middleware.ts`; set `NEXT_PUBLIC_CLERK_*` env. | **Manual** (code + env), doc-driven; strong "quickstart" + LLM docs. | **Yes**. | Loud runtime error if keys/provider missing → nudges completion. No install hook. |
| **Stripe** | `stripe` (server) + `@stripe/stripe-js` (browser); API keys via env; `stripe listen` (CLI) for webhooks. | **Manual** (code + env). | **Yes**. | No init step at all; pure docs + env + runtime errors. Ships an **MCP server** for agents. |
| **Panda CSS** | `npx panda init [--postcss]` → `panda.config.ts` (+ postcss). Recommends **`"prepare": "panda codegen"`** so the `styled-system/` output is (re)generated post-install (it's gitignored). | **Prompted** init + **auto** `prepare` codegen (root). | **Yes**. | Excellent prior art: uses the **root `prepare`** hook to regenerate build output on every install. Works because it's the *consumer's own* `prepare`, not a dependency's. |
| **Chakra UI** | v2: install `@chakra-ui/react @emotion/*`, wrap in `<ChakraProvider>`. v3: `npx @chakra-ui/cli` snippet system (shadcn-like) **(verify exact cmd)**. | **Manual** (provider) / **prompted** (snippets). | **Yes**. | Provider-based; failure mode is unstyled/missing-context runtime error. |
| **AGENTS.md convention** | A markdown file at repo root that many AI agents read for project instructions (agents.md). Cursor reads `AGENTS.md`; Claude Code reads `CLAUDE.md`; etc. | **Passive** (no command; agent reads it). | **Yes** — append/merge into existing file. | The single most reliable *agent* channel **if the block is present**. create-next-app (Next 16) now ships one **(verify)** → init must **merge**, not overwrite. |
| **MCP servers** | A server exposes tools/resources (e.g. a component index) to agents over Model Context Protocol; user adds it to `.cursor/mcp.json` / client config. shadcn, Stripe, Sentry, Supabase, Playwright, Context7 ship MCP **(verify list)**. | **Passive once configured**, but **manual to configure**. | **Yes**. | Powerful for MCP-enabled agents, but config friction means it's **not** automatic — a booster, not a guarantee. |

---

## 2. Package-lifecycle-script reliability across package managers

This is the crux of the "auto-run on install" idea. The short version: **a
`postinstall` in a *dependency* is the only lifecycle hook that fires when a
consumer installs your published package — and it is unreliable by 2025 defaults.**
A `prepare` in a dependency does **not** fire for consumers at all.

### 2.1 Which hook fires, and when

| Hook (in a **dependency** you publish) | Fires on consumer `install`? | Notes |
|---|---|---|
| `preinstall` / `install` / `postinstall` | **Yes on npm & yarn-classic by default; NO on pnpm 10 by default** | The classic "native build" hooks. This is the only automatic entry point into a consumer's machine at install time. |
| `prepare` | **No** (for a normal registry install) | `prepare` runs only for the **root** project and for **git/local-dir** dependency installs (npm must build from source). Never for a tarball dep. |
| `prepack` / `prepublishOnly` | No (publish-time only) | Runs in *your* CI when you publish, not on the consumer. Astryx core already uses `prepack: pnpm build`. |

`prepare` semantics for the **root/consumer's own** package (this is how Husky &
Panda work):

- **npm:** `prepare` runs on `npm install` (no args), on `npm ci` **(verify — I
  believe ci runs it)**, before `npm pack`/`publish`, and after installing a git dep.
- **pnpm:** root `prepare`/`postinstall` still run (the block is for *dependencies*).
- **yarn:** classic + berry run root `prepare`.

### 2.2 Per-package-manager behavior for **dependency** scripts

- **npm (all current versions):** runs `preinstall`/`install`/`postinstall` of
  dependencies **by default**. Disabled by `npm install --ignore-scripts` or
  `ignore-scripts=true` in `.npmrc`. During a dep's script, `cwd` = that package's
  dir in `node_modules`, but **`process.env.INIT_CWD`** points at the directory
  where the user ran npm (i.e. the project root) — so a script *can* locate the
  project root. (Writing there is possible but see 2.3.)

- **pnpm 10 (Jan 2025+):** **does NOT run dependency lifecycle scripts by default.**
  This is a supply-chain hardening change. To allow a package to run its build
  scripts, the consumer must allow-list it:

  ```jsonc
  // consumer's package.json
  { "pnpm": { "onlyBuiltDependencies": ["@astryxdesign/core"] } }
  ```

  or run `pnpm approve-builds` interactively. pnpm 9 had the transitional
  `neverBuiltDependencies`; pnpm 10 flipped the default to block-all-then-allow-list
  **(verify minor version details)**. **Implication for Astryx: a `postinstall` in
  `@astryxdesign/core` simply will not run for pnpm-10 users unless they take an
  explicit action — which is exactly the kind of "choice" we're trying to remove.**

- **yarn classic (v1):** runs dependency `postinstall` by default; `--ignore-scripts`
  to skip.

- **yarn berry (v2–v4):** runs package build scripts by default, but can be disabled
  globally (`enableScripts: false` in `.yarnrc.yml`) or per package
  (`dependenciesMeta: { "<pkg>": { built: false } }`). Under PnP the execution model
  differs; behavior is more constrained than npm **(verify specifics)**.

- **CI / deploy:** Many pipelines run `npm ci --ignore-scripts` or set
  `npm_config_ignore_scripts=true`; some deploy platforms cache/restore
  `node_modules` and skip install scripts entirely. So even on npm, `postinstall`
  is **not** guaranteed in CI.

### 2.3 Why a `postinstall` that writes `AGENTS.md` is fragile (beyond just firing)

Even when it *does* fire, an install-time script that writes the cheat sheet into
the **project root** has problems:

1. **Portability:** blocked/absent on pnpm 10, `--ignore-scripts`, and much of CI
   (see 2.2). You'd be building the flagship guarantee on the least-portable hook.
2. **Anti-pattern / trust:** dependencies writing files *outside their own
   `node_modules` dir* is widely considered bad behavior and is exactly what pnpm's
   block is defending against. It can trip security review and user surprise.
3. **Non-interactive & noisy:** install often runs without a TTY (CI, agents), so
   you can't safely prompt; and it fires on **every** install/update, so naive
   writes are repetitive and can clobber user edits unless carefully marker-guarded.
4. **Ordering/asynchrony:** with many deps installing in parallel, script output
   (a banner) is easily buried; agents may not read install stdout at all if they
   installed via a lockfile step.

**Net:** treat `postinstall` as a *best-effort booster* (a one-line banner and/or a
guarded, idempotent nudge), not the primary guarantee. The reliable guarantees live
in files the agent reads anyway (§3) and in runtime/build-time integration (R3).

---

## 3. AI-agent-native channels

These deliver problem **(A)** — the cheat sheet — without depending on a command.

- **README (the #1 agent-read file).** Agents `npm view` / `npm pack` + extract and
  read `README.md`. This is *proven* in Astryx's own tests (agents copy the README's
  `npm install -D @astryxdesign/cli` verbatim). Because it's so reliably read, the
  README is both the biggest lever **and** the current source of the bug: it offers a
  complete manual setup, giving the agent an out. Fixing the README (R1) and putting
  the cheat-sheet block *in* it (R2) is the highest-ROI move.

- **`AGENTS.md` convention.** A root markdown file that a growing set of agents read
  (Cursor: `AGENTS.md`; Claude Code: `CLAUDE.md`; others converging on `AGENTS.md`).
  This is precisely the file `astryx init` targets. Two consequences:
  - Because **create-next-app (Next 16) now writes its own `AGENTS.md`** **(verify)**,
    `astryx init` must **upsert/merge** its `ASTRYX:START…END` block into an existing
    file, never overwrite. (Marker-guarded upsert = safe re-runs.)
  - You can also **ship an `AGENTS.md` inside the package** (`node_modules/@astryxdesign/core/AGENTS.md`);
    some agents crawl dependency docs, and it's a zero-cost passive copy of the block.

- **`.d.ts` / JSDoc banners (`@see`).** Agents (and IDEs) read type definitions
  reflexively. A banner at the very top of the package's type entry survives
  script-blocking, `--ignore-scripts`, and CI:

  ```ts
  /**
   * @packageDocumentation
   * Astryx design system. Before generating UI, run: `npx astryx init`
   * (installs the component index into AGENTS.md/CLAUDE.md).
   * Discover components: `npx astryx component --list`.
   * @see https://…/astryx  · @see npx astryx init
   */
  ```

  Astryx core's `types` is `./dist/index.d.ts` (tsc-generated), so this banner must
  be injected into the build (or added to a hand-authored ambient `.d.ts` that's
  referenced first). Cheap, passive, and reaches type-aware agents/humans.

- **npm registry metadata.** `package.json` `description`/`keywords` show up in
  `npm view` (which agents run). A description like *"Run `npx astryx init` to set up
  AI-agent docs"* is a small, always-visible nudge. (Astryx core's current
  description is component-focused; consider adding the init hint.)

- **MCP server.** A `@astryxdesign/mcp` server could expose the component index +
  `component`/`search`/`template` as MCP tools/resources — effectively the CLI's JSON
  API (which already exists: `astryx --json`, `astryx manifest`) over MCP. Great for
  Cursor/Claude power users, but requires the user to add it to their MCP config, so
  it's **not** automatic. Booster, not guarantee.

- **Runtime errors as a channel (Prisma/Playwright).** A dev-mode error message is a
  channel the agent *will* read, because it's blocking their build. If Astryx throws
  *"components rendering without Astryx CSS — run `npx astryx init`"*, the agent's
  own error-fixing loop pulls it toward setup. This converts (B)-failures into
  (A)+(B) nudges.

---

## 4. Tool deep-dives (patterns worth stealing)

**shadcn/ui — "the CLI is the only path."** There is no runtime dependency to
`npm install` that competes with the CLI; the *only* way to get a component is
`npx shadcn add`. So there's nothing for an agent to do "instead of" the CLI. This
is the cleanest structural fix and maps directly to Astryx R1: don't give the agent
a fully-working manual alternative. `components.json` records config so re-runs and
`add` are idempotent; a registry model + MCP server round it out.

**Prisma — postinstall + *loud runtime failure*.** Prisma's real guarantee isn't the
postinstall (which breaks under pnpm/CI/caching); it's the runtime error thrown when
you use the client before generating. The error *names the exact command*. Steal:
Astryx should fail loudly (dev-mode) with the exact `npx astryx init` command.

**Tailwind v4 / Expo — shrink or relocate setup so it can't be skipped.** Tailwind v4
collapses setup to `@import "tailwindcss"` + one plugin; Expo moves native setup into
build-time config plugins that re-run every prebuild. Both make (B) either trivial or
automatic. Steal: an Astryx Vite/Next plugin that injects the CSS imports, so "add to
existing app" has ~no manual step to forget.

**Husky / Panda — the *root* `prepare` hook.** Both work by having the **consumer's
own** package.json run something on install (`husky`, `panda codegen`). This is
reliable *because it's the root's script, not a dependency's*. Astryx can use this:
`astryx init` can add a `prepare`/`postinstall` to the **user's** package.json (e.g.
`"prepare": "astryx doctor || true"` or a re-sync of agent docs), so subsequent
installs re-verify setup. (This only helps *after* init has run once.)

**Angular `ng add` — schematics.** The most powerful "setup that always works once
invoked": `ng add` fetches the package and runs a project-mutating, idempotent
schematic. The catch is it requires the framework CLI and the user to type `ng add`
instead of `npm install`. Astryx's analog is `astryx init` — the lever is making
people *reach for it* (R1), since we can't intercept `npm install` reliably.

**create-next-app shipping AGENTS.md (Next 16) (verify).** Evidence that the
AGENTS.md channel is going mainstream — and a compatibility requirement: Astryx must
merge into an existing AGENTS.md, and can even piggyback on the fact that agents are
increasingly primed to look there.

**Sentry wizard / Storybook init / Playwright — one prominent `npx` command.** Each
concentrates setup into a single memorable `npx …` invocation featured at the very
top of docs. The pattern: *one* command, *first* thing in the README, non-interactive
flags available for agents. Astryx should feature exactly one: `npx astryx init`.

---

## 5. Ranked, concrete recommendations for Astryx

Goal: init-ran ≈ 100% for fresh **and** existing projects, across npm/pnpm/yarn,
for agents **and** humans. Ranked by (reliability × shippability). Combine them —
no single channel is load-bearing.

### R1 — Make `astryx init` the single documented path (remove the escape hatch) ⭐ highest leverage

The measured root cause is the README offering a complete manual Quick Start. Fix the
*information design*, not just add machinery.

- **Lead the core README with one command**, before any manual instructions. The
  core README's setup section should look like this (outer fence shown with 4
  backticks only to display the nested bash block):

````md
## Setup (required)

```bash
npx astryx init
```

This installs the component index into AGENTS.md/CLAUDE.md and wires theming.
**Do this first — everything else assumes it ran.**
````

- **Demote manual setup to a collapsed "Manual / eject" fallback** that still ends
  with "…or just run `npx astryx init`." Don't present a full, self-sufficient
  copy-paste path that lets the agent finish without init. (shadcn model.)
- **Add a non-interactive form for agents:** `npx astryx init --yes --features agents`
  (you already have `--features agents`, `--all`, and error codes like
  `ERR_UNKNOWN_FEATURE`). Document *that exact string* so agents copy it verbatim
  (they demonstrably copy README commands verbatim).
- **Add the init hint to npm metadata:** core `package.json` `description` →
  include "Run `npx astryx init`."
- **Provide `npm create` ergonomics:** publish `@astryxdesign/create` so
  `npm create @astryxdesign@latest` / `pnpm create @astryxdesign` / `yarn create @astryxdesign`
  all resolve to the initializer (npm maps `create <name>` → `create-<name>`, and
  `@scope` → `@scope/create`). One blessed command across PMs.

*Why first:* directly attacks the 50% failure, no reliance on fragile hooks, helps
humans and agents equally. This alone likely moves init-ran from ~50% toward ~90%.

### R2 — Ship the cheat sheet passively (discovery without any command) ⭐ closes the gap to ~100% for (A)

Make problem (A) independent of whether init runs at all.

- **Put the `<!-- ASTRYX:START -->…<!-- ASTRYX:END -->` block verbatim in the
  published core `README.md`.** Agents read it via `npm view`/`npm pack`. This means
  even a no-init agent still sees the component index + CLI workflow.
- **Ship `AGENTS.md` inside the package**: add `AGENTS.md` to core's `files` array and
  publish the same block at `node_modules/@astryxdesign/core/AGENTS.md`.
- **Add a `.d.ts` banner** (see §3 snippet) to `dist/index.d.ts` (inject at build) so
  type-reading agents/IDEs surface `npx astryx init`. Survives script-blocking + CI.
- Keep the block **generated from the same source** the CLI uses, so README/AGENTS.md/
  `.d.ts` never drift from `astryx init`'s output.

*Why:* these are the channels agents read *reflexively*; they don't require a choice,
a TTY, or an unblocked script. This is the most reliable way to guarantee (A).

### R3 — Fail loud at runtime + optional build-time plugin (Prisma / Playwright / Tailwind v4 / Expo) ⭐ guarantees (B) gets finished

- **Dev-only runtime guard.** On first render in development, detect whether Astryx's
  CSS is present (e.g. check a sentinel CSS custom property / marker class that
  `astryx.css` defines on `:root`). If missing, `console.error` (or throw in a strict
  mode) with an actionable message:

  > "Astryx components are rendering without `@astryxdesign/core` styles. Run
  > `npx astryx init`, or import `@astryxdesign/core/reset.css` and
  > `@astryxdesign/core/astryx.css`."

  Gate on `process.env.NODE_ENV !== 'production'` so prod is untouched. This mirrors
  Prisma's "did you forget to generate" and Playwright's "run playwright install" —
  the agent's error-fixing loop then pulls it toward setup.
- **Optional framework plugins** to remove (B) for the common case:
  `@astryxdesign/vite` and a Next.js plugin that inject the reset/astryx CSS imports
  (and can scaffold the Theme/Link provider). This is the Tailwind-v4 / Expo model —
  make setup a single plugin line that's hard to forget and idempotent on rebuild.
- **You already have `astryx doctor`** (read-only, CI exit-code gate, reports missing
  agent docs + fix). Surface it: recommend `npx astryx doctor` in README/CI, and have
  the runtime guard point to it. It's the safe, non-mutating half of "fail loud."

### R4 — `postinstall` as a *best-effort* booster (never the sole mechanism)

- Add a minimal `postinstall` to core that **prints one line** and does **not** write
  files:

  ```jsonc
  // @astryxdesign/core/package.json
  { "scripts": { "postinstall": "node -e \"console.log('\\n▶ Astryx installed. Run: npx astryx init  (sets up AI-agent docs + theming)\\n')\"" } }
  ```

- Be explicit in docs that pnpm 10 users must allow-list it if they want it to run:

  ```jsonc
  { "pnpm": { "onlyBuiltDependencies": ["@astryxdesign/core"] } }
  ```

- **Do not** attempt to auto-write `AGENTS.md` from a dependency postinstall as the
  primary path (portability + trust issues in §2.3). If you *do* experiment with an
  auto-init postinstall (the roadmap's W4), make it: idempotent, marker-guarded,
  `INIT_CWD`-scoped, silent on failure, and strictly redundant with R1/R2. Measure it
  as *lift over* the passive channels, not as the foundation.
- Optionally have `astryx init` add a **root** `prepare`/`postinstall` to the *user's*
  package.json (Husky/Panda pattern) to re-sync agent docs on future installs — this
  is reliable because it's the consumer's own script, but only helps post-first-init.

### R5 — Existing-project parity + agent-config channels

- **`astryx init` must be idempotent and merge-safe** for existing projects: detect
  `AGENTS.md`/`CLAUDE.md`/`.cursor/rules`, **upsert** the marker block (create if
  absent, replace between markers if present), and never clobber user content —
  important now that create-next-app ships its own `AGENTS.md` **(verify)**.
- **Detect framework** (Next/Vite/CRA) and wire CSS/providers accordingly, so "add to
  an existing app" reaches the same end state as fresh.
- **Optional `@astryxdesign/mcp` server** exposing the existing `astryx --json` API as
  MCP tools/resources, with a one-line config snippet for Cursor/Claude. High value
  for MCP users; document as opt-in.

### Reliability ranking recap

| Rank | Mechanism | Requires agent to *choose* init? | Portable across pnpm10/CI/`--ignore-scripts`? |
|---|---|---|---|
| R2 | Cheat sheet in README + shipped `AGENTS.md` + `.d.ts` banner | **No** (passive) | **Yes** |
| R3 | Dev runtime fail-loud + build-time plugin | **No** | **Yes** |
| R1 | Single documented path = `npx astryx init` | Yes, but it's the *only* easy path | **Yes** (docs) |
| R4 | `postinstall` banner / auto-init | No (if it fires) | **No** (pnpm10/CI skip) |
| R5 | MCP server | No (once configured) | N/A (manual config) |

The ≈100% target = **R1 (raise init to near-certain) + R2 (make (A) not need init at
all) + R3 (make (B) failures self-correcting)**, with R4/R5 as boosters.

---

## 6. Honest limitations / things to verify

- **(verify)** Exact Next.js version that ships `AGENTS.md` from create-next-app
  (stated as Next 16), and whether it's default vs. flagged.
- **(verify)** `@prisma/client` postinstall internals and how much newer Prisma still
  relies on `prisma generate` vs. the newer `prisma-client` generator.
- **(verify)** Tailwind v4 removed the `npx tailwindcss init` command (the zero-config
  + plugin model is certain; the removal of the subcommand is the specific claim).
- **(verify)** Whether the standalone `playwright` package downloads browsers via
  postinstall vs. `@playwright/test` requiring explicit `npx playwright install`.
- **(verify)** yarn berry (v2–v4) dependency-script defaults under PnP.
- **(verify)** pnpm exact version where dependency-script blocking became the default
  (stated pnpm 10, Jan 2025) and whether `onlyBuiltDependencies` also lives in
  `pnpm-workspace.yaml` in current releases.
- **(verify)** `npm ci` runs the root `prepare` script.
- **(verify)** Chakra v3 exact snippet CLI command and the current MCP server list
  (shadcn/Stripe/Sentry/Supabase/Playwright/Context7).
- **Assumption:** agents read `.d.ts` and package `AGENTS.md` often enough to matter.
  This is plausible and low-cost, but should be A/B-measured with the existing harness
  (Verdaccio + `--source local`) like the other channels.
