# /packages/core/src/CloseButton

XDSCloseButton component for dismissing dialogs, panels, and other closeable UI elements.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Theme-configurable icon**: Default Heroicons XMarkIcon, customizable via theme
- **Sizes**: `sm`, `md`, `lg` matching standard size tokens
- **Accessible**: Includes `aria-label="Close"` by default
- **Ghost styling**: Transparent background with hover/active states

## Usage

```tsx
import {XDSCloseButton} from '@xds/core/CloseButton';

<XDSCloseButton onClick={handleClose} />

// With custom label (used for aria-label and tooltip)
<XDSCloseButton onClick={handleClose} label="Dismiss notification" />

// Different sizes
<XDSCloseButton size="sm" onClick={handleClose} />
<XDSCloseButton size="lg" onClick={handleClose} />
```

## Props

| Prop         | Type                   | Default   | Description                                    |
| ------------ | ---------------------- | --------- | ---------------------------------------------- |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`    | Size of the button                             |
| `label`      | `string`               | `'Close'` | Accessible label (aria-label) and tooltip text |
| `isDisabled` | `boolean`              | `false`   | Whether the button is disabled                 |

## Customizing the Icon

The icon can be customized via the theme's `components.closeButton.icon` setting:

```tsx
import {XCircleIcon} from '@heroicons/react/24/solid';

const customTheme = {
  ...baseTheme,
  components: {
    closeButton: {
      icon: XCircleIcon,
    },
  },
};
```

## Files

| File                      | Role  | Purpose                                    |
| ------------------------- | ----- | ------------------------------------------ |
| `index.ts`                | Entry | Exports XDSCloseButton component and types |
| `XDSCloseButton.tsx`      | Core  | XDSCloseButton component implementation    |
| `XDSCloseButton.test.tsx` | Test  | Unit tests for XDSCloseButton component    |

## Implementation Notes

- Uses ghost-style button with hover/active overlays
- Icon size scales with button size (sm: 16px, md: 20px, lg: 24px)
- Theme augmentation allows icon customization without component imports
