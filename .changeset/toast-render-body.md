---
'@astryxdesign/core': patch
---

[feat] Toast: `renderBody` on `ToastViewport` replaces the content of every toast's card with your own layout, and the viewport and each stacked toast now carry theme targets.

```tsx
<ToastViewport
  renderBody={({body, endContent, dismissButton}) => (
    <MyRow>
      <MyTitle>{body}</MyTitle>
      {endContent}
      {dismissButton}
    </MyRow>
  )}>
  <App />
</ToastViewport>
```

Astryx keeps the card — its surface, its `astryx-toast` theme target, the live-region role and the auto-hide timer with its pause on hover, focus and window blur — and hands the renderer the message, the `endContent`, and **its own dismiss `Button`** to place. The close therefore stays a real Astryx `Button`: themeable through `astryx-button`, carrying the translated `@astryx.toast.dismiss` label, correctly named. A custom layout positions it rather than rebuilding it, so it cannot be mislabelled, and a toast cannot end up with no way to close.

It applies to every toast in the viewport, **including ones raised by library code that calls `useToast()` without knowing about your layout**. That is the difference from hiding the built-in dismiss with CSS, which reaches only the toasts your own code raised and leaves a library's toast with its only affordance gone.

`LayerProvider`'s `toast` config takes `renderBody` too (`<LayerProvider toast={{renderBody}}>`), since that is the viewport most apps actually mount; the `ToastViewport` prop is for a viewport you mount yourself.

Two new theming targets for the chrome outside the card: `astryx-toast-viewport` (`data-position`) on the stack container, and `astryx-toast-item` on each toast's wrapper — the element that owns the gap between stacked toasts and the collapse transition. Both were previously reachable only through structural selectors like `[data-toast-id] > div`.

Also: **the viewport is a landmark only while it holds a toast.** An empty viewport was an empty named region in every screen reader's landmark list, and `LayerProvider` mounts one for every app whether or not a toast is ever shown — so a second viewport (a dialog's, or one a sub-tree mounts to configure it) produced two identically named landmarks. F6 is unaffected; it works off the ref, not the role.

New exported types: `ToastBodyRenderProps`, `ToastBodyRenderFn`.

No change to any existing toast: omit `renderBody` and the rendered output, the timers and the DOM are exactly as before.

@freddymeta
