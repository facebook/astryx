# Layer

Layer components for overlay content using modern browser APIs.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

The Layer system provides hooks and components for overlay content using:

- **CSS Anchor Positioning** for automatic positioning relative to trigger elements
- **Popover API** for top-layer rendering (no React portals needed)

## Browser Support

- **Chrome**: Full support
- **Safari**: Full support
- **Firefox**: Popover API works, anchor positioning not yet (acceptable degradation)

## Import

```tsx
import {useXDSLayer, useXDSHoverCard, XDSHoverCard} from '@xds/core/Layer';
```

## Hooks

### useXDSLayer

Core layer hook with type-safe modes for different positioning strategies.

```tsx
// Context mode (anchor positioning)
const layer = useXDSLayer({mode: 'context'});

<button ref={layer.ref}>Trigger</button>;
{
  layer.render(<Content />, {placement: 'above', alignment: 'center'});
}

// Fixed mode (manual coordinates)
const layer = useXDSLayer({mode: 'fixed'});

layer.show();
{
  layer.render(<Content />, {x: mouseX, y: mouseY});
}
```

TypeScript enforces correct render props per mode:

- **Context mode**: `render(children, { placement?, alignment? })`
- **Fixed mode**: `render(children, { x, y })` (required)

| Option   | Type                   | Description          |
| -------- | ---------------------- | -------------------- |
| `mode`   | `'context' \| 'fixed'` | Positioning strategy |
| `onShow` | `() => void`           | Callback when shown  |
| `onHide` | `() => void`           | Callback when hidden |

### useXDSHoverCard

Hook for hover/focus triggered layers with timing control.

```tsx
const hoverCard = useXDSHoverCard({placement: 'above'});

<XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
  Hover me
</XDSButton>;

{
  hoverCard.renderHoverCard(<ProfileCard user={user} />);
}
```

| Option         | Type                            | Default   | Description                 |
| -------------- | ------------------------------- | --------- | --------------------------- |
| `placement`    | `LayerPlacement`                | `'above'` | Position relative to anchor |
| `alignment`    | `LayerAlignment`                | `'start'` | Alignment on placement axis |
| `delay`        | `number`                        | `300`     | Show delay in ms            |
| `hideDelay`    | `number`                        | `200`     | Hide delay in ms            |
| `focusTrigger` | `'auto' \| 'always' \| 'never'` | `'auto'`  | Focus listener behavior     |
| `isEnabled`    | `boolean`                       | `true`    | Enable/disable triggers     |
| `onShow`       | `() => void`                    | —         | Callback when shown         |
| `onHide`       | `() => void`                    | —         | Callback when hidden        |

## Components

### XDSTooltip

Component wrapper for tooltip display on hover/focus.

```tsx
<XDSTooltip content="Save your changes" placement="above">
  <XDSButton label="Save" variant="primary" />
</XDSTooltip>
```

| Prop                 | Type                            | Default    | Description                            |
| -------------------- | ------------------------------- | ---------- | -------------------------------------- |
| `children`           | `ReactNode`                     | —          | Trigger element(s)                     |
| `anchorRef`          | `RefObject<HTMLElement>`        | —          | External anchor ref (sibling mode)     |
| `content`            | `ReactNode`                     | —          | Tooltip content (typically short text) |
| `placement`          | `LayerPlacement`                | `'above'`  | Position relative to anchor            |
| `alignment`          | `LayerAlignment`                | `'center'` | Alignment on placement axis            |
| `delay`              | `number`                        | `200`      | Show delay in ms                       |
| `hideDelay`          | `number`                        | `0`        | Hide delay in ms                       |
| `focusTrigger`       | `'auto' \| 'always' \| 'never'` | `'auto'`   | When to trigger on focus               |
| `isEnabled`          | `boolean`                       | `true`     | Enable/disable triggers                |
| `hasHoverIndication` | `'auto' \| boolean`             | `'auto'`   | Show dashed underline on trigger       |
| `onOpenChange`       | `(isOpen: boolean) => void`     | —          | Callback when visibility changes       |

### XDSHoverCard

Component wrapper for simpler hover card usage.

```tsx
<XDSHoverCard content={<ProfileCard user={user} />} placement="above">
  <XDSButton>Hover me</XDSButton>
</XDSHoverCard>
```

| Prop           | Type                            | Default   | Description                       |
| -------------- | ------------------------------- | --------- | --------------------------------- |
| `children`     | `ReactElement`                  | Required  | Trigger element (must accept ref) |
| `content`      | `ReactNode`                     | Required  | Hover card content                |
| `placement`    | `LayerPlacement`                | `'above'` | Position relative to anchor       |
| `alignment`    | `LayerAlignment`                | `'start'` | Alignment on placement axis       |
| `delay`        | `number`                        | `300`     | Show delay in ms                  |
| `hideDelay`    | `number`                        | `200`     | Hide delay in ms                  |
| `focusTrigger` | `'auto' \| 'always' \| 'never'` | `'auto'`  | Focus listener behavior           |
| `isEnabled`    | `boolean`                       | `true`    | Enable/disable triggers           |
| `onOpenChange` | `(isOpen: boolean) => void`     | —         | Callback when visibility changes  |

## Position Values

### LayerPlacement

| Value   | Description              |
| ------- | ------------------------ |
| `above` | Above the anchor         |
| `below` | Below the anchor         |
| `start` | Start side (left in LTR) |
| `end`   | End side (right in LTR)  |

### LayerAlignment

| Value    | Description         |
| -------- | ------------------- |
| `start`  | Align to start edge |
| `center` | Center aligned      |
| `end`    | Align to end edge   |

## ARIA Guidelines

When using hooks directly, compose `aria-describedby` with your own IDs:

```tsx
const hoverCard = useXDSHoverCard();

<XDSInput
  ref={hoverCard.ref}
  aria-describedby={mergeIds(fieldErrorId, hoverCard.describedBy)}
/>;

// Utility function
function mergeIds(...ids: (string | undefined)[]) {
  return ids.filter(Boolean).join(' ') || undefined;
}
```

## Files

| File                    | Role      | Purpose                                    |
| ----------------------- | --------- | ------------------------------------------ |
| `index.ts`              | Entry     | Exports all layer utilities and components |
| `useXDSLayer.ts`        | Hook      | Core popover and positioning logic         |
| `useXDSHoverCard.ts`    | Hook      | Hover/focus triggers for layers            |
| `XDSHoverCard.tsx`      | Component | Wrapper component for hover cards          |
| `XDSHoverCard.test.tsx` | Test      | HoverCard unit tests                       |
