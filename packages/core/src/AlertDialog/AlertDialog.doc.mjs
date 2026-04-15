/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AlertDialog',
  description:
    'Confirmation dialog for destructive or irreversible actions. Uses role="alertdialog" with required title, description, and cancel/action buttons.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSAlertDialog title="Confirm" description="Are you sure?" />',
  },
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
    'Built-in buttons: Ghost cancel and configurable action button rendered internally',
    'Action does not auto-close: Supports async operations with loading states',
    'Imperative API: useXDSImperativeAlertDialog for fire-and-forget usage',
  ],
  props: [
    {name: 'isOpen', type: 'boolean', required: true, description: 'Whether the dialog is open.'},
    {name: 'onOpenChange', type: '(isOpen: boolean) => unknown', required: true, description: 'Visibility change callback.'},
    {name: 'title', type: 'string', required: true, description: 'Dialog title. Linked via aria-labelledby.'},
    {name: 'description', type: 'string', required: true, description: 'Consequence description. Linked via aria-describedby.'},
    {name: 'actionLabel', type: 'string', required: true, description: 'Action button label.'},
    {name: 'onAction', type: '() => unknown', required: true, description: 'Called when action button is clicked. Does NOT auto-close.'},
    {name: 'cancelLabel', type: 'string', default: "'Cancel'", description: 'Cancel button label.'},
    {name: 'actionVariant', type: 'XDSButtonVariant', default: "'destructive'", description: 'Action button variant.'},
    {name: 'isActionLoading', type: 'boolean', description: 'Shows loading spinner on the action button.'},
    {name: 'width', type: 'number | string', default: '400', description: 'Dialog width.'},
  ],
};
