---
'@astryxdesign/core': patch
---

[feat] Touch press model: under a coarse pointer the bare `:active` arm is dropped and a delegated, document-level controller paints the press the way a native list does — nothing for 150 ms, then the full pressed overlay on the next frame; cancelled with no fade by 10 px of travel or by a scroll claiming the gesture, and dead until a new touch; a tap shorter than the delay paints at the lift; the release fades over 200 ms, a real fade on every surface: the pressed overlay is the pressed token at `--astryx-press-alpha`, a registered custom property (`@property`, syntax `<number>`) the release arm animates 1 → 0, declared once by the shared overlay styles as `--_press-paint` and read by whatever paints it. The controller writes `data-astryx-press="on"|"fading"` on the nearest element marked `data-astryx-pressable`, which every Astryx surface that paints a press now carries; a mouse keeps `:active`. Public API for a local pressable: `usePressFeedback()` from `@astryxdesign/core/hooks` (returns the marker to spread; installs the controller on first mount) and `interactionOverlayStyles` from `@astryxdesign/core/utils` (compose one of its variants on the marked element). A press is themed through `--color-overlay-pressed`, which the hold, the flash and the fade all read.

@vjeux
