---
'@astryxdesign/core': patch
---

[feat] TextArea: the two painted elements inside the wrapper now carry stable theme targets — `astryx-text-area-control` (the `<textarea>` itself) and `astryx-text-area-counter` (the character counter). Only the wrapper was themeable before, so a theme restyling the control's own typography, placeholder or resize affordance, or the counter's supporting text, had to reach in with structural selectors like `.astryx-text-area > textarea`. Purely additive: no existing class, data attribute, or style changes.

Neither carries a `size` axis. `size` moves only the control's block padding (`sm` and `md` are empty; `lg` sets `paddingBlock`), and that is the axis a `padding` translation for this component takes over — so an axis here would be a second way to say the same thing, and the one that stops being true once the translation lands.

The start-icon and end-slot overlays are deliberately not targets. They paint nothing — each is `position: absolute; pointer-events: none; display: flex` — and they are placed off the wrapper's `--_textarea-inline-padding`, so a theme that moves the control's inset needs them to move with it rather than to be re-placed one at a time. That inset belongs in a `padding` translation for the component, which is tracked separately.

@freddymeta
