---
'@astryxdesign/core': patch
---

[feat] Toast: `renderToast` on `ToastViewport` replaces the entire visible toast with your own surface, and the viewport and each stacked toast now carry theme targets.

```tsx
<ToastViewport
  renderToast={toast => (
    <MyCard
      tone={toast.type}
      title={toast.body}
      action={toast.endContent}
      onDismiss={toast.dismiss}
    />
  )}>
  <App />
</ToastViewport>
```

With a renderer supplied Astryx draws no card, no padding and no dismiss button — your surface owns the dismiss control and its accessible name, and `endContent` is handed to you to place rather than dropped. It applies to every toast in the viewport, **including ones raised by library code that calls `useToast()` without knowing about your surface**. That is the difference from hiding the built-in dismiss with CSS, which reaches only the toasts your own code raised and leaves a library's toast with no way to close at all.

Astryx keeps the transport either way: stacking, positioning, the top layer, dedupe, the live-region announcement, and the auto-hide timer with its pause on hover, on focus and on window blur. The timer moved out of the card to make that true under a custom surface.

Two new theming targets for the chrome a renderer does not replace: `astryx-toast-viewport` (`data-position`) on the stack container, and `astryx-toast-item` on each toast's wrapper — the element that owns the gap between stacked toasts and the collapse transition. Both were previously reachable only through structural selectors like `[data-toast-id] > div`.

`LayerProvider`'s `toast` config takes `renderToast` too, since that is the viewport most apps actually mount (`<LayerProvider toast={{renderToast}}>`); the `ToastViewport` prop is for a viewport you mount yourself.

Two smaller behaviour changes fall out of this:

- **The viewport is a landmark only while it holds a toast.** An empty viewport was an empty named region in every screen reader's landmark list, and `LayerProvider` mounts one for every app whether or not a toast is ever shown — so a second viewport (a dialog's, or one a sub-tree mounts to configure it) produced two identically named landmarks, which axe flags as `landmark-unique`. F6 is unaffected; it works off the ref, not the role.
- The auto-hide timer moved out of `Toast` into a shared `useToastTimer`, so it keeps running under a custom surface. `Toast` rendered standalone behaves exactly as before.

New exported types: `ToastRenderProps`, `ToastRenderFn`.

No change to any existing toast: omit `renderToast` and the rendered output, the timers and the DOM are exactly as before.

@freddymeta
