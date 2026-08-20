# Ops Console

Internal console for watching deploys: run history, environment switching, and
entity previews for builds and tickets.

## Layout

```
app/          route entries (layout, page)
components/   app components — the house components live here
components/ui shared primitives (button, card, popover, tooltip, badge, …)
lib/          data access + shared helpers
```

## House style

- Tailwind utility classes for everything visual. Composed with `cn()` from
  `@/lib/utils`.
- Variants come from `cva`, colocated with the component.
- Surfaces use the app's own vocabulary: `bg-card`, `border-border`,
  `rounded-md`, `text-muted-foreground`. Don't hard-code colours or sizes —
  if a value isn't in the vocabulary, add it to `globals.css` first.
- Density matters. This console shows a lot of rows on one screen; controls are
  compact by design (`h-8`, `text-xs` in tables).

## Conventions

- `components/ui/*` is shared and is not modified for one feature.
- Feature components go in `components/`; entity-specific ones in
  `components/entity/`.
- Data access goes through `lib/entities.ts`. Components don't fetch directly.
- Status colours come from `lib/status.ts`. That mapping is canonical and is
  mirrored in three other surfaces — don't re-derive it locally.
