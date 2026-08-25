---
'@astryxdesign/core': patch
---

[feat] Toast: `renderContent` on the `showToast` options replaces the content of that toast's card with your own layout.

```tsx
showToast({
  body: 'Your changes have been saved.',
  renderContent: ({body, endContent, dismissButton}) => (
    <MyRow>
      <MyTitle>{body}</MyTitle>
      {endContent}
      {dismissButton}
    </MyRow>
  ),
});
```

Astryx keeps the card — its surface, its `astryx-toast` theme target, the live-region role and the auto-hide timer with its pause on hover, focus and window blur — and hands the renderer the message, the `endContent`, and **its own dismiss `Button`** to place. The close therefore stays a real Astryx `Button`: themeable through `astryx-button`, carrying the translated `@astryx.toast.dismiss` label, correctly named. A custom layout positions it rather than rebuilding it, so it cannot be mislabelled.

It is per-toast rather than app-wide on purpose. An app that wants one layout across its own toasts wraps `useToast()` once and passes `renderContent` on every call; a toast raised by library code that knows nothing about that wrapper then renders as an ordinary Astryx toast — intact and dismissible — rather than inheriting a layout written for someone else's payload.

A layout is free to leave `dismissButton` out — dropping a prop's output is the consumer's call, and an auto-hiding toast with no close is a legitimate design. The one combination that traps someone is a toast that neither auto-hides nor renders the close: it stays on screen, announced, with no way out. In development that case logs a warning naming the two ways out (place `dismissButton`, or set `isAutoHide`); in production it costs nothing.

New exported types: `ToastContentRenderProps`, `ToastContentRenderFn`.

No change to any existing toast: omit `renderContent` and the rendered output, the timers and the DOM are exactly as before.

@freddymeta
