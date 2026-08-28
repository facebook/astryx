---
'@astryxdesign/core': patch
---

[feat] Toast: `renderContent` on the `showToast` options replaces the content of that toast's card with your own layout.

```tsx
showToast({
  body: 'Your changes have been saved.',
  renderContent: ({body, endContent, dismiss}) => (
    <MyRow>
      <MyTitle>{body}</MyTitle>
      {endContent}
      <Button label="Dismiss notification" onClick={dismiss} />
    </MyRow>
  ),
});
```

Astryx keeps the card, its `astryx-toast` theme target, live-region role and auto-hide behavior. The renderer receives the message, `endContent`, resolved toast settings and a `dismiss` callback.

Custom content owns its complete layout and every control in it. Call `dismiss` from the control that should close the toast; it may be passed through nested components. Astryx does not register an injected component or add a fallback close behind a custom layout.

The API is per-toast. An app can share one layout by wrapping `useToast()` and passing `renderContent` on each call, while other toasts continue to use the ordinary Astryx layout and its translated, themeable dismiss `Button`.

New exported types: `ToastContentRenderProps`, `ToastContentRenderFn`.

@freddymeta
