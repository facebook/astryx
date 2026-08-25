---
'@astryxdesign/core': patch
---

[feat] Toast: `renderBody` on the `showToast` options replaces the content of that toast's card with your own layout, and the viewport and each stacked toast now carry theme targets.

```tsx
showToast({
  body: 'Your changes have been saved.',
  renderBody: ({body, endContent, dismissButton}) => (
    <MyRow>
      <MyTitle>{body}</MyTitle>
      {endContent}
      {dismissButton}
    </MyRow>
  ),
});
```

Astryx keeps the card — its surface, its `astryx-toast` theme target, the live-region role and the auto-hide timer with its pause on hover, focus and window blur — and hands the renderer the message, the `endContent`, and **its own dismiss `Button`** to place. The close therefore stays a real Astryx `Button`: themeable through `astryx-button`, carrying the translated `@astryx.toast.dismiss` label, correctly named. A custom layout positions it rather than rebuilding it, so it cannot be mislabelled, and a toast cannot end up with no way to close.

It is per-toast rather than app-wide on purpose. An app that wants one layout across its own toasts wraps `useToast()` once and passes `renderBody` on every call; a toast raised by library code that knows nothing about that wrapper then renders as an ordinary Astryx toast — intact and dismissible — rather than inheriting a layout written for someone else's payload.

Two new theming targets for the chrome outside the card: `astryx-toast-viewport` (`data-position`) on the stack container, and `astryx-toast-item` on each toast's wrapper — the element that owns the gap between stacked toasts and the collapse transition. Both were previously reachable only through structural selectors like `[data-toast-id] > div`.

New exported types: `ToastBodyRenderProps`, `ToastBodyRenderFn`.

No change to any existing toast: omit `renderBody` and the rendered output, the timers and the DOM are exactly as before.

@freddymeta
