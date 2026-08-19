## Styling

**This app is moving to the design system.** Tailwind is what most of the
existing code uses, and it stays until a component is migrated — but new work
should be built on the design system where it fits, and Tailwind is the
fallback, not the default.

- New components: design system components and tokens.
- Existing components: leave them alone unless the task is about them; don't
  half-migrate one.
- Either way, match the app's density and surface treatment — compact
  controls, the same radius and border weight as the components next to it.
- Don't introduce a third styling mechanism.
