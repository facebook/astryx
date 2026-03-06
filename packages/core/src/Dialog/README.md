# Dialog

XDSDialog component using the native `<dialog>` element for modal dialogs.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Native `<dialog>`**: Uses browser's built-in modal behavior
- **Automatic focus trap**: Focus is trapped within the dialog when open
- **Backdrop**: Native `::backdrop` pseudo-element with blur effect
- **Variants**: `standard` (configurable dimensions), `fullscreen` (full viewport)
- **Purpose-based dismissal**: `required`, `form`, `info` control exit behavior
- **Custom positioning**: Static position support via `position` prop
- **Accessible**: Proper ARIA attributes and keyboard navigation

## Usage

XDSDialog is designed to be used with XDSLayout as its child:

```tsx
import {XDSDialog} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {useState} from 'react';

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton label="Open Dialog" onClick={() => setIsOpen(true)} />

      <XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
        <XDSLayout
          header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
          content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSButton
                label="Cancel"
                variant="secondary"
                onClick={() => setIsOpen(false)}
              />
              <XDSButton
                label="Confirm"
                variant="primary"
                onClick={() => setIsOpen(false)}
              />
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}
```

## Components

### XDSDialog

Modal dialog using the native `<dialog>` element.

```tsx
<XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSButton
          label="Confirm"
          variant="primary"
          onClick={() => setIsOpen(false)}
        />
      </XDSLayoutFooter>
    }
  />
</XDSDialog>
```

| Prop           | Type                             | Default      | Description                                        |
| -------------- | -------------------------------- | ------------ | -------------------------------------------------- |
| `isOpen`       | `boolean`                        | —            | Whether the dialog is open (required)              |
| `onOpenChange` | `(isOpen: boolean) => unknown`   | —            | Callback when dialog visibility changes (required) |
| `width`        | `number \| string`               | `400`        | Width of the dialog (px or CSS value)              |
| `maxHeight`    | `number \| string`               | `'75vh'`     | Maximum height of the dialog                       |
| `position`     | `XDSDialogPosition`              | —            | Static position (centered by default)              |
| `variant`      | `'standard' \| 'fullscreen'`     | `'standard'` | Dialog variant                                     |
| `purpose`      | `'required' \| 'form' \| 'info'` | `'info'`     | Dismissal behavior                                 |
| `children`     | `ReactNode`                      | —            | Dialog content (required)                          |

### XDSDialogHeader

Header for dialogs with title, optional subtitle, close button, and start/end content slots.

```tsx
<XDSDialogHeader
  title="Confirm Action"
  subtitle="This cannot be undone"
  onOpenChange={open => setIsOpen(open)}
/>
```

| Prop           | Type            | Default | Description                                  |
| -------------- | --------------- | ------- | -------------------------------------------- |
| `title`        | `string`        | —       | Dialog title (receives focus on open)        |
| `subtitle`     | `string`        | —       | Subtitle below the title                     |
| `onOpenChange` | `() => unknown` | —       | Close button callback (no button if omitted) |
| `startContent` | `ReactNode`     | —       | Content before the title (e.g., back button) |
| `endContent`   | `ReactNode`     | —       | Content after the title, before close button |
| `hasDivider`   | `boolean`       | `true`  | Adds border at the bottom edge               |

## Purpose Prop

The `purpose` prop controls how users can dismiss the dialog:

| Purpose    | Escape Key  | Backdrop Click | Use Case                                   |
| ---------- | ----------- | -------------- | ------------------------------------------ |
| `required` | ❌ Disabled | ❌ Disabled    | Mandatory flows (security, permissions)    |
| `form`     | ✅ Allowed  | ❌ Disabled\*  | Forms where accidental dismiss = data loss |
| `info`     | ✅ Allowed  | ✅ Allowed     | Informational content, low-cost dismissal  |

\*For `form` purpose, backdrop click is only allowed before user interaction.

## Position Prop

Configure a static position instead of centering:

```tsx
<XDSDialog
  isOpen={isOpen}
  onOpenChange={open => setIsOpen(open)}
  position={{top: 100, right: 20}}>
  {/* content */}
</XDSDialog>
```

## Theming

Themes can override `Dialog` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    dialog: {
      root: myStyles,
      backdrop: myStyles,
    },
  },
};
```

### Available surfaces

| Surface    | Description             |
| ---------- | ----------------------- |
| `root`     | Dialog element styles   |
| `backdrop` | Backdrop overlay styles |

## Files

| File                 | Role  | Purpose                               |
| -------------------- | ----- | ------------------------------------- |
| `index.ts`           | Entry | Exports XDSDialog component and types |
| `XDSDialog.tsx`      | Core  | XDSDialog component implementation    |
| `XDSDialog.test.tsx` | Test  | Unit tests for XDSDialog component    |

## Implementation Notes

- Uses native `<dialog>` element with `showModal()` for proper modal behavior
- Height is `unset` (grows with content) and constrained by `maxHeight`
- Focus is automatically trapped by the browser when using `showModal()`
- Escape key and backdrop clicks are controlled by the `purpose` prop
- When `variant="fullscreen"`, the `width`, `maxHeight`, and `position` props are ignored
