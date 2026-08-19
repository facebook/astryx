# Choosing what to build with

Before writing a component, work down this list and stop at the first hit:

1. **A component this app already has** — look in `components/` and
   `components/ui/`. If one exists, use it, even if it needs a prop added.
2. **A component from the design system** — search before concluding it isn't
   there. Search by the job to be done, not the name you have in mind: a
   preview-on-hover panel, a menu with a described row, a status pill.
3. **The design system's primitives and hooks** — when no finished component
   fits, compose one from the primitives (surfaces, layout, focus and
   dismissal hooks) rather than starting from a `div`. Most one-off components
   are a primitive plus content.
4. **A custom component** — last resort. Put it next to the code that uses it,
   build it from the system's tokens, and copy the behaviour contract
   (keyboard, focus, labelling) from the closest system component.

Rules that make this work:

- **Look before you rule anything out.** If you decide the design system
  doesn't have what you need, say which lookup you ran to establish that. A
  decision made without a lookup is a guess.
- **Don't infer availability from what the code around you happens to use.**
  Existing components predate the system; they are not evidence about what is
  available today. Check what is installed.
- **Don't mix mechanisms inside one component.** Style it one way.
