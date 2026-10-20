---
'@astryxdesign/core': patch
---

[feat] `BottomSheetSwitcher` and the `sheetId` prop of `BottomSheet` are deprecated. The replacement is already in this release: write each step of a multi-step flow as its own standalone `BottomSheet` with `isOpen`, driven by one state value that names the open step; closing the top sheet and opening the next in the same update runs the same replace handoff the switcher ran (entering step above, a taller retained step aligns down and fades after both motions, one steady scrim, focus into the new step and back to the flow's opener on close). Migration, per flow: (1) replace the `activeSheet` / `onActiveSheetChange` pair with one `step` state value; (2) give each step `isOpen={step === 'id'}` and `onOpenChange={isOpen => !isOpen && setStep(null)}` in place of `sheetId="id"`; (3) remove the `BottomSheetSwitcher` wrapper, moving its `hasScrim` onto every step; (4) keep the step buttons as they were (`setStep('next')`). Nothing changes at runtime for flows that keep using the switcher: it works exactly as released, with its declarations and docs marked `@deprecated`, until a future minor release removes it. A `hasScrim={false}` flow is the one case the switcher still covers alone: non-modal sheets neither stack nor replace, so a non-modal step change is a plain exit and entrance.

@imdreamrunner
