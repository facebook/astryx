# Layer Components

Status tracking for layer component implementation.

## Completed ✓

| Component | Hook | Status |
|-----------|------|--------|
| useXDSLayer | — | ✓ Core hook with context/fixed modes |
| XDSHoverCard | useXDSHoverCard | ✓ Interactive hover content |
| XDSTooltip | useXDSTooltip | ✓ Inverted colors, non-interactive |

All completed components are themeable via `ComponentStyles`.

See `/packages/core/src/Layer/README.md` for full API documentation.

## Planned

### Anchored Layers (useXDSLayer)

Position relative to trigger element via CSS anchor positioning.

| Component | Trigger | Notes |
|-----------|---------|-------|
| Popover | Click | Light-dismiss with `popover="auto"` |
| Menu | Click | Keyboard navigation, selection |

### Modal Layers (`<dialog>`)

Use `<dialog>` element with `showModal()` for focus trap, backdrop, Escape handling.

| Component | Behavior | Notes |
|-----------|----------|-------|
| Dialog | Centered | Scale/fade animation |
| Sheet | Edge-anchored | Slides from edge |

### Viewport Layers (popover + fixed)

Position relative to viewport, not an anchor element.

| Component | Position | Notes |
|-----------|----------|-------|
| Toast | Corner (e.g., top-right) | Stacks multiple, auto-dismiss |

Toast uses `popover="manual"` for top-layer + `position: fixed` for viewport positioning.

## XDSLayerProvider

Unified provider for all imperative layers (Dialog, Sheet, Toast).

```tsx
<XDSLayerProvider toastInset={{ bottom: 60 }}> {/* Clear footer */}
  <App />
</XDSLayerProvider>
```

Responsibilities:
- Stacking order enforcement (Toast > Dialog > Sheet)
- Toast positioning configuration (`toastInset`, `toastPosition`)
- Imperative API via hooks (`useDialog`, `useSheet`, `useToast`)

## References

- [CSS Anchor Positioning](https://drafts.csswg.org/css-anchor-position-1/)
- [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
