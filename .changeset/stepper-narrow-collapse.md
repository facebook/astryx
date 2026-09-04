---
'@astryxdesign/core': patch
---

[feat] Stepper collapses itself in narrow containers instead of leaving each consumer to hand-roll a fallback: a horizontal stepper measures its own width and, once a step has under ~112px, drops the labels to a bare track and names the current step directly beneath it, with a pair of real prev/next controls when `onStepClick` is set. The breakpoint follows the step count rather than the viewport, so a stepper collapses on the width it actually has. Both `separated` and `on-track` leave their compact track presentational; navigation moves to the named prev/next controls. On-track indicators stay on the rail without repeating the active indicator beside the compact label. The full sequence stays intact for screen readers throughout. (#5659)
@ernestt

[fix] Step labels hold to a single line and ellipsize rather than wrapping and breaking mid-word, so a row of horizontal steps keeps one height and the track under it stays straight. The full label is still carried in the step's accessible name.

[fix] The gap between connector segments is now `--spacing-1`, matching the connector's own thickness, so the track reads as one dashed line at any theme scale.
