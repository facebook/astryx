# Astryx

A design system for building internal tools and products.

## Custom Commands

### `/vibe-test [count]` - Run vibeability tests

Tests how well AGENTS.md helps LLMs generate correct Astryx component code.

**Usage:**

```
/vibe-test 5                    # Run 5 stratified sample tests (one-shot)
/vibe-test                      # Run all 21 tests (one-shot)
/vibe-test 5 --degradation      # Run 5 tests with degradation curve (10-turn)
```

**How to execute:**

1. Run `pnpm -F @astryxdesign/vibe-tests interactive --sample <count>` to set up iteration
2. Spawn parallel subagents (one per test prompt) to:
   - Read the task file from `results/<iteration>/tasks/{promptId}.json`
   - Generate code for the prompt using Astryx components (AGENTS.md auto-injected)
   - Self-evaluate for success/escape hatches
   - Write `.tsx` result to `results/<iteration>/results/{promptId}.tsx`
   - Write `.json` metadata to `results/<iteration>/results/{promptId}.json`
3. Trigger `gh workflow run vibe-screenshots.yml` to build previews and capture screenshots
4. Run `pnpm -F @astryxdesign/vibe-tests aggregate --iteration <id>` to see results

**Degradation mode (--degradation):**
Tests context retention across 10-turn conversations with filler, distractor, and recovery turns.
Probes at turns 0, 6, 8, 10 to measure quality degradation. Results show a line graph of each test's progression.

**Result format:**

```json
{
  "id": "<iter>-<promptId>",
  "timestamp": "...",
  "model": "claude-code-interactive",
  "persona": "naive",
  "promptCategory": "...",
  "trajectoryDepth": 0,
  "prompt": "...",
  "response": "<code>",
  "evaluation": {"success": true, "componentsUsed": [...], "escapeHatches": [...]}
}
```

Runners may also write an optional `<promptId>.provenance.json` sidecar beside the result metadata. The versioned, executor-neutral contract and fallback behavior are documented in `internal/vibe-tests/docs/execution-provenance.md`.

## AI Context

For architectural context, decisions, and research, see the **[GitHub Wiki](https://github.com/facebook/astryx/wiki)**:

- **Decisions** — API Conventions, Why StyleX, StyleX Distribution
- **Architecture** — System Architecture, Component Authoring Guide
- **Research** — AI + Design Systems, AI Model Trajectory, Swizzle Ergonomics
- **Future** — Animation System, RSC Utilities, Distribution Strategy

For component-specific documentation, see the `{Name}.doc.mjs` file in each component directory under `packages/core/src/` (e.g. `Button/Button.doc.mjs`). These are plain JS files with JSDoc type annotations exporting a `ComponentDoc` object (typed via `@astryxdesign/cli/authoring`).

## Documentation Standard

Documentation lives in two places:

1. **File Headers** — Each source file has a structured JSDoc header with `@input`, `@output`, `@position`
2. **Component Docs** — `{Name}.doc.mjs` files in each component directory (props, features, examples)

**Update Protocol**: When modifying code, update the file's header comment. Look for `SYNC:` comments as reminders.

**Audience**: every `.doc.mjs`, and everything under `packages/cli/assets/docs/`, is written for people **building with** Astryx — not for people building Astryx. Rubrics, readiness gates, audit checklists and lab→core criteria belong in the wiki. [`packages/cli/assets/docs/README.md`](packages/cli/assets/docs/README.md) has the test and the page each kind of material goes to.

## Quick Reference

- **Package manager**: pnpm 11, pinned by the `packageManager` field (see
  CONTRIBUTING.md for install options — Corepack is one of several, and Node
  25+ no longer bundles it)
- **Testing**: Vitest (colocated tests)
- **Components**: `packages/core/`
- **Storybook**: `apps/storybook/`

## JSDoc Conventions

- **`@example` code fences must use plain ` ``` `, not ` ```tsx `.**
  Storybook's autodocs parser doesn't handle language-tagged fences in JSDoc correctly — the code block won't render as a proper code block. Always use untagged fences in `@example` blocks.

<!-- STYLEX-CAPS:START -->

[StyleX v0.17.5 CSS Support]|Use CSS-native solutions. Don't build JS workarounds for supported features.
|AT-RULES: @media, @supports, @container (+named), @starting-style, @scope — YES
|AT-RULES: @layer, @property (explicit) — NO (compiles but invalid CSS output)
|PSEUDO-CLS: :hover, :focus, :focus-visible, :focus-within, :active, :disabled — YES
|PSEUDO-CLS: :first-child, :last-child, :nth-child(), :where(), :is(), :has(), :not() — YES
|PSEUDO-CLS: :placeholder-shown, :checked, :empty, :modal, :user-valid, :user-invalid — YES
|PSEUDO-EL: ::before, ::after, ::placeholder, ::selection, ::backdrop, ::marker, ::view-transition-_ — YES
|COMPOUND: ::backdrop+condition, RTL :is([dir="rtl"] _), nested @media+pseudo — YES
|VALUES: var(), calc(), clamp(), light-dark(), color-mix(), container-type/name — YES
|ANIM: transition (shorthand+individual), transitionBehavior:allow-discrete, animation, stylex.keyframes — YES
|WHEN: stylex.when.ancestor(':hover'/':focus-within'/':active'/':disabled') — YES
|WHEN: stylex.when.descendant(':hover'), siblingBefore(':checked'), siblingAfter(':checked'), anySibling(':hover') — YES
|WHEN: stylex.when.ancestor('[data-attr]') — NO (pseudo selectors only, must start with ":")
|NESTING: CSS nesting with & — NO (use stylex.when.ancestor/descendant/sibling for parent-child state)
|API: stylex.firstThatWorks() for CSS fallbacks (e.g. display: grid with flex fallback) — YES
|API: stylex.positionTry() for anchor positioning @position-try — YES
|API: stylex.types.color/length/etc for typed CSS variables in defineVars — YES
|API: stylex.defineConsts() for compile-time constants — YES
|DYNAMIC: Functions in stylex.create for runtime values — YES
|VARS: stylex.defineVars, stylex.createTheme (require .stylex.ts files) — YES
|LAYOUT: grid, flex+gap, aspect-ratio, overscrollBehavior, scrollbar-gutter/width — YES
|PATTERN: dialog entry animation -> @starting-style (not useState+rAF)
|PATTERN: parent hover child style -> stylex.when.ancestor(':hover', marker) (not CSS nesting). Use stylex.defineMarker() in a .stylex.ts file for scoped markers. Ancestor element MUST have marker.marker in its stylex.props() call. NEVER use stylex.defaultMarker() for form controls (CheckboxInput, RadioList, Switch) — it leaks hover/focus-within from outer containers like Popovers. Always use a component-scoped defineMarker() instead.
|PATTERN: hover on touch -> @media (hover: hover) guard
|PATTERN: zebra striping -> :nth-child(even) (not index%2 JS)
|PATTERN: container responsive -> @container (not ResizeObserver)
|PATTERN: CSS fallback values -> stylex.firstThatWorks() (not manual fallback)
|PATTERN: dynamic/runtime values -> stylex.create({ s: (val) => ({ prop: val }) }) (not inline styles)
|PATTERN: conditional styles -> stylex.props(condition && styles.x) (not className toggling)
|PATTERN: link elements -> useLinkComponent() (not hardcoded <a>). Consumers swap via LinkProvider for framework routers (Next.js, React Router)
|VERIFY: node internal/stylex-capabilities/scan.mjs

<!-- STYLEX-CAPS:END -->

<!-- ASTRYX-CLI:START -->

Astryx CLI|Run from repo root. Load agent docs before any component work.
ASTRYX="node packages/cli/clients/cli/bin/astryx.mjs"
BOOTSTRAP (run every branch, <500ms):
$ASTRYX help # discover all commands and options
$ASTRYX docs # list available doc topics
$ASTRYX docs principles --dense # design rules, anti-patterns, xstyle, tokens
$ASTRYX docs tokens --dense # spacing, color, radius, typography, shadow
$ASTRYX docs theme --dense # theme provider, light/dark, overrides
$ASTRYX component --list # all components grouped by category
$ASTRYX template --list # available page templates
ON DEMAND:
$ASTRYX component <Name> --dense # props, variants, usage, anatomy for one component
$ASTRYX template <name> # emit full page source
$ASTRYX template <name> --skeleton # layout skeleton with spatial annotations
$ASTRYX swizzle <Name> # eject component source for deep customization
$ASTRYX upgrade --apply # run version migration codemods
OPTIONS: --detail compact|brief less output | --dense token-efficient | --zh Chinese
RULE: always run bootstrap on each branch — docs reflect the branch's actual API
RULE: always run $ASTRYX component <Name> --dense before modifying a component
RULE: after @astryxdesign/core bump, always run $ASTRYX upgrade --apply

<!-- ASTRYX-CLI:END -->

<!-- ASTRYX:START -->

Astryx v0.5.2 · 163 components
CLI: run every command as `pnpm exec astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:

1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:

- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Theme first: read `astryx docs theme` before changing brand color, radius, or type scale, or before restyling the same component twice — defineTheme, component overrides, custom variants, and when `astryx theme build` is needed (importing the theme SOURCE injects at runtime and applies on reload; only the BUILT import needs a rebuild, and a stale build fails silently).
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else style/className with tokens — var(--color-_|--spacing-_|--radius-*). No raw hex/px. (No StyleX/Tailwind compiler here — don't use xstyle/utility classes.)
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any raw <div>/<span> layout, imported .css/@apply, or hardcoded value (#hex, 16px) with the component or a token (var(--color-_|--spacing-_|…)). If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.

MORE CLI:
search "<query>" find any component / hook / doc / template / block
component --list 163 components by category
template --list page + block recipes
docs <topic> browser-support, cli-integrations, color, elevation, getting-started, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling-libraries, styling, theme, tokens, typography, working-with-ai
theme add|build scaffold a theme, then compile it — a BUILT import needs a rebuild after every edit; a source import applies on reload
swizzle <Name> eject component source for deep customization
upgrade --apply run after any @astryxdesign/core bump
<!-- ASTRYX:END -->
