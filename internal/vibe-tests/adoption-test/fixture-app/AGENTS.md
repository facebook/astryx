# Agent guidance — Ops Console

Read this before making changes.

## What this app is

A dense internal console for deploy runs. Next-style layout under `app/`, app
components under `components/`, shared primitives under `components/ui/`.

## Styling

**Tailwind is the house styling system.** Every component in this app is styled
with Tailwind utility classes composed through `cn()`. Match the surrounding
code — the app's look is consistent because everything is built the same way.

- Use the app's token classes (`bg-card`, `border-border`,
  `text-muted-foreground`, `rounded-md`), not raw values.
- Compact by default: `h-8` controls, `text-xs` in tables, `gap-2` spacing.
- Don't introduce a second styling mechanism for one feature.

## Components

- Look in `components/ui/` before building anything. Read the source — props
  and variants are defined with `cva` at the top of each file.
- Feature components go in `components/`. Entity-specific components (things
  that render a build, a ticket, a person) go in `components/entity/`.
- Keep components small and colocate their variants.

## Data

- All reads go through `lib/entities.ts`. Don't fetch inside a component.
- Status → colour lives in `lib/status.ts` and is canonical. Other surfaces
  mirror it; a local re-derivation will drift.

## Before you finish

- Typecheck.
- Check the change against the components next to it — a new control should be
  indistinguishable in height, radius, and border treatment from its
  neighbours.
