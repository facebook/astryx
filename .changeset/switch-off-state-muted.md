---
'@astryxdesign/core': patch
'@astryxdesign/theme-neutral': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/cli': patch
---

[fix] Switch: only the on state paints an accent fill. The off track is now a muted step off the surface, with the thumb carrying the state contrast, so "off" can never read as filled — in Butter and Y2K dark it was measuring 1.0:1 and 1.1:1 against the on state. Both off colours derive from the surface and the theme's own text colour, so the thumb clears 3:1 against its track (WCAG 1.4.11) in every theme instead of none. Neutral and Stone no longer need their `--color-background-gray` switch overrides.

@cixzhang
