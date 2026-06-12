// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AlertDialog',
  displayName: 'Alert Dialog',
  group: 'Dialog',
  category: 'Overlay',
  isHiddenFromOverview: true,
  keywords: [
    'alert',
    'alertdialog',
    'confirm',
    'confirmation',
    'destructive',
    'delete',
    'modal',
    'dialog',
    'imperative',
  ],
  usage: {
    description:
      'AlertDialog asks the user to confirm a destructive or irreversible action before it happens. Use it for things like deleting content, revoking access, or discarding unsaved changes.\n\nFor cases where you want to show an alert without managing open state, use the `useXDSImperativeAlertDialog` hook — call `alert.show(options)` and render `alert.element` in your tree.',
    bestPractices: [
      {guidance: true, description: 'Make the action button label specific — "Delete project" is better than "OK" or "Confirm".'},
      {guidance: true, description: 'Describe what will happen in the description so the user knows the consequences before confirming.'},
      {guidance: false, description: 'Use AlertDialog for non-destructive actions — use a standard Dialog instead.'},
    ],
  },
  playground: {
    defaults: {
      isOpen: true,
      isInline: true,
      onOpenChange: undefined,
      title: 'Delete item?',
      description: 'This action cannot be undone. The item and all its data will be permanently removed.',
      actionLabel: 'Delete',
    },
  },
  components: [
    {
      name: 'XDSAlertDialog',
      isHiddenFromOverview: true,
      displayName: 'Alert Dialog',
      description: 'A modal dialog that asks the user to confirm a destructive action.',
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
        {name: 'isInline', type: 'boolean', default: 'false', description: 'Renders alert dialog content inline without modal behavior. For documentation previews and showcases only.'},
      ],
    },
    {
      name: 'useXDSImperativeAlertDialog',
      displayName: 'useXDSImperativeAlertDialog',
      description: 'Hook for showing an alert dialog without managing open state. Call alert.show(options) to open and alert.hide() to close. Render alert.element in your JSX tree.',
      params: [],
      returns: [
        {name: 'show', type: '(options: AlertDialogOptions) => void', description: 'Show the alert dialog with the given options. Options are the same as XDSAlertDialog props minus isOpen/onOpenChange.'},
        {name: 'hide', type: '() => void', description: 'Hide the alert dialog.'},
        {name: 'isOpen', type: 'boolean', description: 'Whether the dialog is currently open.'},
        {name: 'element', type: 'ReactNode', description: 'The dialog element — render this in your JSX tree.'},
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Confirms destructive/irreversible action before it happens (delete, revoke access, discard unsaved changes).',
  usage: {
    description:
      'AlertDialog confirms destructive/irreversible action (delete, revoke access, discard changes). To show w/o managing open state, use useXDSImperativeAlertDialog hook — call alert.show(options) + render alert.element in tree.',
    bestPractices: [
      {guidance: true, description: 'Make action button label specific — "Delete project" > "OK"/"Confirm".'},
      {guidance: true, description: 'Describe consequences in description so user knows outcome before confirming.'},
      {guidance: false, description: 'Use AlertDialog for non-destructive actions — use standard Dialog instead.'},
    ],
  },
  components: [
    {
      name: 'XDSAlertDialog',
      description: 'Modal dialog confirming destructive action.',
      propDescriptions: {
        isOpen: 'dialog open? **(required)**',
        onOpenChange: 'visibility change callback **(required)**',
        title: 'dialog title; linked via aria-labelledby **(required)**',
        description: 'consequence description; linked via aria-describedby **(required)**',
        actionLabel: 'action button label **(required)**',
        onAction: 'fires on action click; does NOT auto-close **(required)**',
        cancelLabel: 'cancel button label',
        actionVariant: 'action button variant',
        isActionLoading: 'shows loading spinner on action button',
        width: 'dialog width',
        isInline: 'renders content inline w/o modal behavior; docs previews/showcases only',
      },
    },
    {
      name: 'useXDSImperativeAlertDialog',
      description: 'Hook to show alert dialog w/o managing open state. Call alert.show(options) to open, alert.hide() to close; render alert.element in JSX tree.',
      propDescriptions: {
        show: 'show dialog w/ options; same as XDSAlertDialog props minus isOpen/onOpenChange',
        hide: 'hide dialog',
        isOpen: 'dialog currently open?',
        element: 'dialog element — render in JSX tree',
      },
    },
  ],
};
