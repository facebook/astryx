# NumberInput coarse-pointer evidence

Manual frames are required because this intentionally changes the visible coarse-pointer presentation. The implementation branch contains no one-off media.

- Before: `10930261f628aa60abede65cbc58c7499a03c227`.
- After: `b817cee88add25ec0036df091402ed82ec158345`.
- Story: `core-numberinput--with-number-steppers`, controlled value 2.
- Identical capture conditions: Neutral theme, LTR, 390 × 600 CSS px, DPR 1, Chromium 149.0.7827.55, loaded fonts and disabled animation.
- Each PNG has a sensor receipt proving the rendered story, globals and theme, color scheme and luminance class, direction, primary pointer/hover capabilities, named spinbutton/value, visible stepper count, non-zero in-viewport geometry, settled render, and non-blank image hash.

## Coarse pointer, light

Before: two compact buttons, no end padding.

![Before, coarse pointer, light](before-coarse-light.png)

After: buttons hidden, normal 8px end padding restored.

![After, coarse pointer, light](after-coarse-light.png)

## Coarse pointer, dark

![Before, coarse pointer, dark](before-coarse-dark.png)

![After, coarse pointer, dark](after-coarse-dark.png)

## Fine-pointer control

The two frames are pixel-identical (0 changed pixels): desktop stepper presentation is unchanged even at a narrow viewport.

![Before, fine pointer, light](before-fine-light.png)

![After, fine pointer, light](after-fine-light.png)

## Behavioral evidence

The browser regression covers coarse/fine pointers at both 390px and 1280px, LTR and RTL, themed end padding, hidden accessibility-tree buttons, keyboard stepping, typed commits, and retained decimal input mode. All four cases pass on the after build. On the unchanged before build both coarse-pointer cases fail (expected 20px themed end padding, received 0px), while both fine-pointer cases pass.

The existing NumberInput tests pass: 318 tests across six files. Full repository test/build/lint results belong in the pull request rather than in this visual receipt.

Physical-device assistive-technology behavior is not claimed by these emulated-pointer browser captures.
