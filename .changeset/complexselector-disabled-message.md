---
'@astryxdesign/core': patch
---

[feat] ComplexSelector: disabledMessage keeps a disabled trigger reachable and explains why it is disabled (#5941)

A disabled ComplexSelector could not say why. `disabledMessage` adopts the input-field family's disabled-reason contract: with `isDisabled`, the trigger stays focusable via `aria-disabled`, a tooltip shows the reason on hover and keyboard focus and is linked through `aria-describedby`, and opening the popup stays blocked by pointer, keyboard, and the imperative handle. Without a reason the trigger is natively disabled exactly as before. Same recipe as Selector and MultiSelector.

@AKnassa
