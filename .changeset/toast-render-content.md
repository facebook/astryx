---
'@astryxdesign/core': patch
---

[feat] Toast: `renderContent` on the `showToast` options replaces the content of that toast's card with your own layout.

```tsx
showToast({
  body: 'Your changes have been saved.',
  renderContent: ({body, endContent, DismissButton}) => (
    <MyRow>
      <MyTitle>{body}</MyTitle>
      {endContent}
      <DismissButton />
    </MyRow>
  ),
});
```

Astryx keeps the card — its surface, its `astryx-toast` theme target, the live-region role and the auto-hide timer with its pause on hover, focus and window blur — and hands the renderer the message, the `endContent`, and a **`DismissButton`** to place.

`DismissButton` renders Astryx's own close: the ghost icon `Button` with the translated `@astryx.toast.dismiss` label and the `astryx-button` theme target. A layout positions the close rather than rebuilding it, so it cannot be mislabelled — and **a layout that never renders it does not produce a toast with no way out**. The close then appears in the card's default corner instead. Registration follows the button's own mount and unmount, so if a deeply nested layout removes it from its own state later, the corner fallback returns in that same commit. Rendering it twice renders two closes and warns in development.

Absence is a default, not a hole: nothing suppresses anything, and a toast always has an exit.

It is per-toast rather than app-wide on purpose. An app that wants one layout across its own toasts wraps `useToast()` once and passes `renderContent` on every call; a toast raised by library code that knows nothing about that wrapper then renders as an ordinary Astryx toast — intact and dismissible — rather than inheriting a layout written for someone else's payload.

New exported types: `ToastContentRenderProps`, `ToastContentRenderFn`.

No change to any existing toast: omit `renderContent` and the rendered output, the timers and the DOM are exactly as before.

@freddymeta
