---
'@astryxdesign/core': patch
---

[feat] Stepper: add `astryx-step-label` and `astryx-step-description` theme targets.

Both text parts declare their own typography and color, so themes cannot reach them through the `step` target by inheritance. The new targets apply in both indicator positions and reflect `progress` and `status`.

`step-label` also reflects `disabled`, because the label owns Stepper's disabled text paint. `step-description` does not. The new targets change no default style.

@freddymeta
