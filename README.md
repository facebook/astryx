# Dialog foreground regression evidence

Generated validation-review fixture using Astryx Core, captured in Chromium at 1000px and 390px widths in light/dark modes.

`before` bundles Dialog from base commit `19d0a580aed3cd7b570b4f22c3a0a83e224c8d79`. `after` uses the fix. Both load the same built stylesheet and a low-priority host reset `@layer reset { :where(dialog) { color: inherit; } }` to expose ancestor foreground inheritance. The surface token is live and theme-owned; no color token is changed on the triggering control. Native modal entry completes before screenshots are captured. These captures demonstrate foreground correction, not a portal or interaction redesign.
