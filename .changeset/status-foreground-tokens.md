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

[feature] Status colors previously reused `--color-accent` and `--color-info/success/warning/error` across strong fills, plain-surface text/icons/borders, and pale surfaces. These jobs now have separate public roles: strong fills use the base semantic colors with `--color-on-*`, pale surfaces use `--color-*-muted` with `--color-on-*-muted`, and plain surfaces use `--color-status-foreground-*`. First-party appearance changes include Neutral strong fills moving from `#198100`/`#64af4c` to `#2f7d33`/`#74af75` (success), `#ffce2f` to `#f8d36a`/`#efd284` (warning), and `#c9303a`/`#ff705d` to `#cf3738`/`#ee736c` (error), with dark Info moving from `#6d9cfe` to `#6eaeff`; Neutral light plain-surface status text and borders moving to passing stop-45 foregrounds; Core-default input and FileInput borders and glyphs using the new foreground roles (warning moves from `#E9AF08` to `#753F07`), with Butter and Stone redirecting their input-scoped status overrides to those roles so their existing borders and glyphs keep their theme-specific colors, semantic Icon colors following the same roles, and AvatarStatusDot success/error glyphs using the matching on-fill roles; Stepper icon steps with `status="accent"` using the Info foreground at every progress state; Butter Info and Error Banner text moving in both modes from white (3.54:1 and 3.44:1) to `#1d1c11` (4.84:1 and 4.98:1); Chocolate and Matcha success/error Badge labels moving from white in light mode and from `#4a3520`/`#3E481D` in dark mode to `#141010`/`#12140e`; Stone dark ChatComposer muted content moving from `#d7c59c` to `#5e512d`; Gothic `--color-text-yellow` moving from `#6c5010` to `#674c0e`; Core-default Banner titles, descriptions, status icons, and built-in controls taking the matching on-muted status color instead of a generic text role while control tooltips retain their ordinary theme color; and Neutral Banner control layers deriving from the neutral palette endpoints instead of separate near-white/near-black literals, with its dark destructive Button label moving from the base error fill role to the reviewed on-muted error role. Custom themes can preserve their previous appearance by assigning the old values to the corresponding new roles; Banner overrides that previously set `--color-accent-muted` or `--color-text-*` should set the matching muted/on-muted roles instead.

@rubyycheung
