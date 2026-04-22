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
      'AlertDialog is a confirmation dialog for destructive or irreversible actions. Use it to require explicit user confirmation before proceeding with actions like deleting content or discarding changes.',
    bestPractices: [
      {guidance: true, description: 'Clearly describe the consequences of the action in the description text so users can make an informed decision.'},
      {guidance: true, description: 'Keep the action button label specific and descriptive, such as "Delete project" rather than a generic "OK".'},
      {guidance: false, description: 'Use AlertDialog for non-destructive actions or simple informational messages — use a standard Dialog instead.'},
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
