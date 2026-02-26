# ConfirmationModal

Pre-composed confirmation dialog for confirm/cancel actions. Wraps XDSDialog with opinionated defaults for the most common dialog pattern.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Composed from primitives**: XDSDialog + XDSLayout + XDSButton + XDSText
- **Async confirm**: `onConfirm` can return a Promise — loading state is managed automatically
- **Destructive variant**: Red confirm button for irreversible actions
- **Accessible**: `role="alertdialog"`, `aria-describedby`, focus management
- **Form purpose**: Escape cancels, backdrop click blocked (prevents accidental dismissal)

## Usage

```tsx
import {XDSConfirmationModal} from '@xds/core/ConfirmationModal';
import {useState} from 'react';

function Example() {
  const [isShown, setIsShown] = useState(false);

  return (
    <>
      <button onClick={() => setIsShown(true)}>Delete</button>
      <XDSConfirmationModal
        isShown={isShown}
        title="Delete project?"
        description="This action cannot be undone. All data will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setIsShown(false)}
        variant="destructive"
        confirmLabel="Delete"
      />
    </>
  );
}
```

### Async confirm

When `onConfirm` returns a Promise, loading state is managed automatically:

```tsx
const handleConfirm = async () => {
  await deleteItem();
  setIsShown(false);
};

<XDSConfirmationModal
  isShown={isShown}
  title="Remove item?"
  description="This will remove the item from your list."
  onConfirm={handleConfirm}
  onCancel={() => setIsShown(false)}
/>;
```

### Rich description

```tsx
<XDSConfirmationModal
  isShown={isShown}
  title="Transfer ownership?"
  description={
    <XDSVStack gap="sm">
      <XDSText>
        You are transferring ownership to <strong>Jane Doe</strong>.
      </XDSText>
      <XDSText color="secondary">
        You will lose admin access immediately.
      </XDSText>
    </XDSVStack>
  }
  onConfirm={handleTransfer}
  onCancel={() => setIsShown(false)}
/>
```

## Props

| Prop           | Type                          | Default      | Description                                                    |
| -------------- | ----------------------------- | ------------ | -------------------------------------------------------------- |
| `isShown`      | `boolean`                     | —            | Whether the modal is shown                                     |
| `title`        | `string`                      | —            | Title text at the top of the modal                             |
| `description`  | `ReactNode`                   | —            | Descriptive content explaining the confirmation                |
| `onConfirm`    | `() => void \| Promise<void>` | —            | Callback on confirm. Promise return enables auto loading state |
| `onCancel`     | `() => void`                  | —            | Callback on cancel, Escape key, or close button                |
| `confirmLabel` | `string`                      | `"Confirm"`  | Label for the confirm button                                   |
| `cancelLabel`  | `string`                      | `"Cancel"`   | Label for the cancel button                                    |
| `variant`      | `'standard' \| 'destructive'` | `'standard'` | Controls confirm button appearance                             |
| `isLoading`    | `boolean`                     | `false`      | External loading state control                                 |
| `data-testid`  | `string`                      | —            | Test ID for the modal container                                |

## Design Decisions

- **`purpose="form"` hardcoded.** Confirmation modals allow Escape to cancel but block backdrop click. Prevents accidental dismissal of destructive actions.
- **`role="alertdialog"`** instead of `role="dialog"`. Indicates the dialog requires a user response.
- **Button order: Cancel left, Confirm right.** Follows platform convention. Destructive action on the right draws attention.
- **No `forwardRef`.** Composed component — ref access to the underlying dialog is rarely needed. Use XDSDialog directly for that.
- **`onCancel` naming** instead of `onHide`. Semantically clearer for confirmation flows — it's a user decision, not just closing.
