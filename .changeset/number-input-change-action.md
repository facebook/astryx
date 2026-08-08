---
'@astryxdesign/core': patch
---

[feat] NumberInput: add `changeAction`, the async-action convention its sibling inputs (TextInput, TimeInput, CheckboxInput, Selector, Pagination) already have. It fires after `onChange`, wrapped in a React transition, and the field now shows the committed number optimistically so a controlled parent that applies the value asynchronously no longer makes the input snap back mid-flight. Typed off the same `hasClear` discrimination as `onChange`, so it only receives `null` when clearing is enabled.

[feat] NumberInput: add `isLoading`, and surface the in-flight async action the way the rest of the input family does — `aria-busy` on the control plus a `Spinner`, driven by `isLoading` plus a mismatch between the optimistic and committed value. A `NumberInput` with a pending `changeAction` previously showed the optimistic number with no loading affordance and nothing announced to assistive technology. Busy announces without locking: the field stays editable, as in `TextInput` and `TimeInput`. The comparison uses `Object.is`, not `!==`, because this is the only input in the family whose value is a raw number — `NaN` is a legal `number` and is not equal to itself, which would otherwise pin an idle field to "busy" permanently.

[fix] NumberInput: guard every commit path on the value the input has actually committed rather than on the `value` prop. While an async `changeAction` is pending that prop is stale, which had two consequences: blurring re-sent a number that was already in flight, so one edit dispatched two server actions, and an edit back to the pre-flight number was silently dropped — neither `onChange` nor `changeAction` ever saw the user's final intent. Repeated clears (the button, blur, and Enter) no longer dispatch twice either.

@AKnassa
