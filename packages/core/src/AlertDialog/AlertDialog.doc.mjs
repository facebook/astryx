/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AlertDialog',
  group: 'Dialog',
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
  usage: {
    description:
      'AlertDialog asks the user to confirm a destructive or irreversible action before it happens. Use it for things like deleting content, revoking access, or discarding unsaved changes.',
    bestPractices: [
      {guidance: true, description: 'Make the action button label specific — "Delete project" is better than "OK" or "Confirm".'},
      {guidance: true, description: 'Describe what will happen in the description so the user knows the consequences before confirming.'},
      {guidance: false, description: 'Use AlertDialog for non-destructive actions — use a standard Dialog instead.'},
    ],
  },
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
