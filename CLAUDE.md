# XDS

A design system for building internal tools and products.

## Custom Commands

### `/vibe-test [count]` - Run vibeability tests

Tests how well AGENTS.md helps LLMs generate correct XDS component code.

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
   - Generate code for the prompt using XDS components (AGENTS.md auto-injected)
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

## AI Context

For architectural context, decisions, and research, see the **[GitHub Wiki](https://github.com/facebookexperimental/xds/wiki)**:

- **Decisions** — API Conventions, Why StyleX, StyleX Distribution
- **Architecture** — System Architecture, Component Authoring Guide
- **Research** — AI + Design Systems, AI Model Trajectory, Swizzle Ergonomics
- **Future** — Animation System, RSC Utilities, Distribution Strategy

For component-specific documentation, see the `{Name}.doc.mjs` file in each component directory under `packages/core/src/` (e.g. `Button/Button.doc.mjs`). These are plain JS files with JSDoc type annotations exporting a `ComponentDoc` object (typed via `packages/core/src/docs-types.ts`).

## Documentation Standard

Documentation lives in two places:

1. **File Headers** — Each source file has a structured JSDoc header with `@input`, `@output`, `@position`
2. **Component Docs** — `{Name}.doc.mjs` files in each component directory (props, features, examples)

**Update Protocol**: When modifying code, update the file's header comment. Look for `SYNC:` comments as reminders.

## Quick Reference

- **Package manager**: pnpm 10 (via corepack — see CONTRIBUTING.md)
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
|PATTERN: link elements -> useXDSLinkComponent() (not hardcoded <a>). Consumers swap via XDSLinkProvider for framework routers (Next.js, React Router)
|VERIFY: node internal/stylex-capabilities/scan.mjs

<!-- STYLEX-CAPS:END -->

<!-- XDS-CLI:START -->

XDS CLI|Run from repo root. Load agent docs before any component work.
XDS="node packages/cli/bin/astryx.mjs"
BOOTSTRAP (run every branch, <500ms):
$XDS help # discover all commands and options
$XDS docs # list available doc topics
$XDS docs principles --dense # design rules, anti-patterns, xstyle, tokens
$XDS docs tokens --dense # spacing, color, radius, typography, shadow
$XDS docs theme --dense # theme provider, light/dark, overrides
$XDS component --list # all components grouped by category
$XDS template --list # available page templates
ON DEMAND:
$XDS component <Name> --dense # props, variants, usage, anatomy for one component
$XDS template <name> # emit full page source
$XDS template <name> --skeleton # layout skeleton with spatial annotations
$XDS swizzle <Name> # eject component source (use --gap to report why)
$XDS upgrade --apply # run version migration codemods
OPTIONS: --detail compact|brief less output | --dense token-efficient | --zh Chinese
RULE: always run bootstrap on each branch — docs reflect the branch's actual API
RULE: always run $XDS component <Name> --dense before modifying a component
RULE: after @astryxdesign/core bump, always run $XDS upgrade --apply
RULE: when swizzling, always use --gap to report missing capabilities

<!-- XDS-CLI:END -->
