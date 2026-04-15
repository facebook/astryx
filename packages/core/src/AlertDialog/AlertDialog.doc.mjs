/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AlertDialog',
  description:
    'Confirmation dialog for destructive or irreversible actions. Uses role="alertdialog" with required title, description, and explicit cancel/action buttons.',
  keywords: [
    'alert',
    'alertdialog',
    'confirm',
    'confirmation',
    'destructive',
    'delete',
    'modal',
    'dialog',
  ],
  features: [
    'ARIA alertdialog: Uses role="alertdialog" with aria-labelledby and aria-describedby',
    'No backdrop dismiss: Cannot be closed by clicking outside the dialog',
    'Escape = Cancel: Pressing Escape triggers the cancel action',
    'Cancel auto-closes: Clicking cancel automatically calls onOpenChange(false)',
    'Action does not auto-close: Supports async operations with loading states',
    'Initial focus on Cancel: Least-destructive focus pattern from WAI-ARIA',
    'Slot-based actions: Consumer provides XDSButton instances with full control over variant, label, loading state',
  ],
  examples: [
    {
      label: 'Delete confirmation',
      code: `import {XDSAlertDialog} from '@xds/core/AlertDialog';
import {XDSButton} from '@xds/core/Button';
import {useState} from 'react';

function Example() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <XDSButton label="Delete" variant="danger" onClick={() => setIsOpen(true)} />
      <XDSAlertDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Delete item?"
        description="This action cannot be undone."
        cancel={<XDSButton variant="secondary" label="Cancel" />}
        action={
          <XDSButton variant="danger" label="Delete"
            onClick={() => setIsOpen(false)} />
        }
      />
    </>
  );
}`,
    },
  ],
  props: [
    {name: 'isOpen', type: 'boolean', required: true, description: 'Whether the dialog is open.'},
    {name: 'onOpenChange', type: '(isOpen: boolean) => unknown', required: true, description: 'Visibility change callback.'},
    {name: 'title', type: 'string', required: true, description: 'Dialog title. Linked via aria-labelledby.'},
    {name: 'description', type: 'string', required: true, description: 'Consequence description. Linked via aria-describedby.'},
    {name: 'cancel', type: 'ReactNode', required: true, description: 'Cancel action slot. Auto-closes on click.'},
    {name: 'action', type: 'ReactNode', required: true, description: 'Confirm action slot. Does NOT auto-close.'},
    {name: 'width', type: 'number | string', default: '400', description: 'Dialog width.'},
  ],
};
