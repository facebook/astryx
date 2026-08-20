## Adding Astryx to this app

This app already has a styling system. The published setup recipe is written for
a new project, and applying it here replaces things the app depends on. For an
app that already has Tailwind:

- Keep the app's own `@import 'tailwindcss'`. Declare the layer order above it
  so the system's sheets land between Tailwind's base and Tailwind's utilities:

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

- Check the app, not just the build. This kind of mistake compiles.
