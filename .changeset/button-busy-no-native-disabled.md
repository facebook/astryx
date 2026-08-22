---
'@astryxdesign/core': patch
---

[fix] Button: the busy state (a pending `clickAction`, or `isLoading`) no longer sets the native `disabled` attribute, which dropped keyboard focus to `<body>` for the duration of the action. A busy button stays focusable and is announced via `aria-busy` + `aria-disabled`; re-activation (click, Enter, Space) is blocked by the existing handler guards, so fire-once actions still fire once. `isDisabled` is unchanged and still uses native `disabled`. With `href`, a busy button now stays an anchor instead of swapping to a disabled `<button>` mid-action. Consumers that checked the `disabled` attribute to detect a busy button should check `aria-busy` instead.

Also fixed: a rejected `clickAction` no longer strands the button in the busy state (previously the transition never settled, so the spinner stayed and every retry was blocked until remount). The rejection now clears the loading state and is reported via `devError`.

@AKnassa
