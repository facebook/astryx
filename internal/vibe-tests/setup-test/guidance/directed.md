## The exact edits

Do these, in this order:

1. `npm install @astryxdesign/core @astryxdesign/theme-neutral`
2. In `app/globals.css`, insert ABOVE the existing `@import 'tailwindcss';`
   (above, not below — below it the cascade comes out inverted):
   `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;`
   and below it the three system sheets (`reset.css`, `astryx.css`, the theme's
   `theme.css`). Change nothing else in that file.
3. In `main.tsx`, wrap the page in
   `<Theme theme={neutralTheme} mode="dark">` — the app is dark.
4. Build the app and look at the rendered page before you finish.
