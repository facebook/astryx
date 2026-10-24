---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
'@astryxdesign/richtext': patch
'@astryxdesign/theme-neutral': patch
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-chocolate': patch
'@astryxdesign/theme-gothic': patch
'@astryxdesign/theme-matcha': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
---

[feat] Status colours now have a role for each surface. `--color-text-<status>` is readable status text on the page and cards, and `--color-icon-<status>` and `--color-border-<status>` (status icons and borders) default to it. `--color-<status>-emphasized` is the strong fill, with `--color-on-<status>` content. `--color-<status>-muted` is the pale fill, with `--color-on-<status>-muted` content. `<status>` is info, success, warning, or error, and Tailwind gains `bg-success-emphasized` (and the warning and error forms) and `text-status-<status>`.

The released `--color-success`, `--color-warning`, and `--color-error`, and `bg-success`/`text-success`/`border-success` with their warning and error forms, keep their values and meaning in every theme. No app code needs to change.

Astryx components move to the new roles, so their colours change where a theme's values differ:
- Badge, StatusDot, AvatarStatusDot, ProgressBar, Stepper indicators, the destructive Button, and item swipe actions use the strong fills. Core's dark Info and Error fills are now `#0064E0` and `#E3193B`, so white labels reach 4.5:1.
- Icon `color="info|success|warning|error"`, Stepper status glyphs, and Chat tool-call status icons use the icon roles, which are the readable text colours. For example, Core's success icon is now `#09441F` (light) instead of `#0D8626`.
- Input and FileInput status borders use the border roles. Core's light warning border is now `#753F07` instead of `#E9AF08`. Butter's light success and warning input rims are now mid-ramp stops that reach 3:1.
- Banner paints its built-in title, description, icon, and controls with the on-muted roles.
- Status fills keep a visible boundary in forced-colors mode.
- Neutral's strong fills are its reviewed status-fill colours. Stone, Gothic, and Y2K Info fills are blue instead of their neutral accent.

Custom themes get every status role they don't set: theme generation derives readable text, a strong fill that carries its content, and on-muted content from the theme's base status colours (and accent, for Info). To keep a component's previous colour, set the matching role in your theme; for example, set `--color-icon-success` to your old `--color-success` value.

@rubyycheung
