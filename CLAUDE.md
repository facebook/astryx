# XDS

A design system for building internal tools and products.

## AI Context

For architectural context, decisions, and research, see the **[GitHub Wiki](https://github.com/facebookexperimental/xds/wiki)**:

- **Decisions** — API Conventions, Why StyleX, StyleX Distribution
- **Architecture** — System Architecture, Component Authoring Guide
- **Research** — AI + Design Systems, AI Model Trajectory, Swizzle Ergonomics
- **Future** — Animation System, RSC Utilities, Distribution Strategy

For component-specific documentation, see the `{Name}.doc.mjs` file in each component directory under `packages/core/src/` (e.g. `Button/Button.doc.mjs`). These are plain JS files with JSDoc type annotations exporting a `ComponentDoc` object (typed via `packages/core/src/docs-types.ts`).

## Documentation Standard

This project uses **Fractal Documentation** — a self-referential pattern where documentation exists at three levels:

1. **Project Root** (`README.md`) — Project-wide architecture and directory overview
2. **Directory READMEs** — Each directory contains a `README.md` with file manifests
3. **File Headers** — Each source file has a structured JSDoc header with `@input`, `@output`, `@position`

**Update Protocol**: When modifying code, update:

1. The file's header comment
2. The directory's README.md
3. Parent documentation if architecture changes

Look for `<!-- SYNC: ... -->` comments and `SYNC:` in file headers as reminders.

## Quick Reference

- **Package manager**: Yarn 1 (Classic)
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
|PATTERN: parent hover child style -> stylex.when.ancestor(':hover') (not CSS nesting)
|PATTERN: hover on touch -> @media (hover: hover) guard
|PATTERN: zebra striping -> :nth-child(even) (not index%2 JS)
|PATTERN: container responsive -> @container (not ResizeObserver)
|PATTERN: CSS fallback values -> stylex.firstThatWorks() (not manual fallback)
|PATTERN: dynamic/runtime values -> stylex.create({ s: (val) => ({ prop: val }) }) (not inline styles)
|PATTERN: conditional styles -> stylex.props(condition && styles.x) (not className toggling)
|VERIFY: node internal/stylex-capabilities/scan.mjs

<!-- STYLEX-CAPS:END -->

<!-- XDS-CLI:START -->
XDS v0.0.4|Always run npx xds component <Name> before writing XDS component code.
npx xds component <Name> props, usage, examples for any component
npx xds component --list 95 components by category
npx xds template <name> [path] scaffold page (blank, login, table)
npx xds swizzle <Name> eject component source (use --gap to report why)
npx xds upgrade --apply run version migration codemods
--detail compact|brief less output | --lang dense|zh translation
RULE: after @xds/core bump, always run npx xds upgrade --apply
RULE: when swizzling, always use --gap to report missing capabilities
<!-- XDS-CLI:END -->
