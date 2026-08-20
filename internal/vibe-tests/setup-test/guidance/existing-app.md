## Adding Astryx to this app

This app already has a styling system. The published setup recipe is written for
a new project, and applying it here replaces things the app depends on. For an
app that already has Tailwind:

- Keep the app's own `@import 'tailwindcss'`. Declare the layer order **above
  it** — the position is load-bearing, see below — so the system's sheets land
  between Tailwind's base and Tailwind's utilities:

  ```css
  @layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

  @import 'tailwindcss';
  @import '@astryxdesign/core/reset.css';
  @import '@astryxdesign/core/astryx.css';
  @import '@astryxdesign/theme-neutral/theme.css';
  ```

- Do **not** import `@astryxdesign/core/tailwind-theme.css` unless the app wants
  the system to own its Tailwind vocabulary. That file re-points `--color-card`,
  `--color-border`, `--color-accent`, `--radius-*`, `--shadow-*`, `--text-*` and
  the base `--spacing` unit, so every existing `rounded-md`, `shadow-sm`,
  `text-xs` and `p-4` in the app changes meaning.

- Tell the theme provider which color scheme the app is. `<Theme>` paints
  through `light-dark()` and follows the OS by default, so an app whose dark
  look is its own CSS variables gets light-mode text on a dark surface —
  correct on a dark-mode laptop, unreadable everywhere else.

  ```tsx
  <Theme theme={neutralTheme} mode="dark">
  ```

- The `@layer` line must come BEFORE the app's Tailwind import, not after it.
  `@layer a, b, c;` only orders names that are not already registered, and
  `@import 'tailwindcss'` registers `theme`, `base` and `utilities` on its way
  past. Below that import, the statement can only append the system's layers
  _after_ Tailwind's utilities — the exact inverse of what it is for — and the
  system's reset then strips borders, padding and the type scale off every
  control in the app. Appending the block to the end of the file is the most
  damaging thing you can do here, and it builds clean.

- If the app already defines a variable the system also defines (`--color-accent`
  and `--color-border` are the usual pair), re-assert the app's value on
  `[data-astryx-theme]`, not in `:root`. The system's tokens live in a
  `@scope … to ([data-astryx-theme])` block, which looks contained but is not:
  `@scope` bounds selector matching, not inheritance, and the provider syncs that
  attribute onto `<html>`.

- Check the app, not just the build. This kind of mistake compiles.
