# Astryx repository guidance

Astryx is a public design-system repository. Never commit internal links,
identifiers, service names, private operational instructions, or other
Meta-only context.

## Instruction surface

This `AGENTS.md` is the canonical, tool-agnostic instruction surface for the
repository. Add or change shared agent guidance here rather than duplicating it
in tool-specific instruction files. Put genuinely path-specific guidance in a
nested `AGENTS.md`.

## Start here

- Product builders: use `astryx docs`, component `{Name}.doc.mjs` files, and
  `packages/cli/assets/docs/`.
- Contributors: read `CONTRIBUTING.md` and the relevant guidance linked from
  `docs/README.md`.
- Component work: read the component's `{Name}.spec.md` when one exists, then
  any `module:*` records it lists for the public module being changed, followed by
  consumer docs, tests, and implementation.
- Cross-component work: read the relevant contract under `docs/families/`,
  applicable design spec under `docs/design/`, and current architecture under
  `docs/architecture/`.
- Consequential shared-system changes: use a record under `docs/specs/`.

## Authority

Knowledge records declare `authority`:

- `draft`: not authoritative; may still need evidence or owner review;
- `current`: explicitly approved and authoritative;
- `archived`: context only, with a reason such as `superseded`, `withdrawn`,
  or `historical` and a replacement link when one exists.

Only `current` records govern implementation and review. Never infer approval
from merged code, silence, an old review, or an existing wiki page.

## Judgment boundary

Resolve checkable behavior from code, tests, and browser evidence. Ask a human
only when a stable public API, theme contract, ownership boundary, compatibility
policy, or genuinely subjective visual direction remains undecided. Ask one
question at a time.

Before reviewing or implementing a proposed outcome, check current `main` and
newer overlapping pull requests. Do not create new policy for work that is
already complete or superseded.

## Validation

Run `pnpm check:knowledge` after editing knowledge records or templates. A
material template-shape change requires a schema-version bump and migration of
active records; changing template guidance alone does not rewrite accepted
history.

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
