// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Dialog',
  displayName: 'Dialog',
  group: 'Dialog',
  category: 'Overlay',
  keywords: ["dialog","modal","popup","overlay","lightbox","alert","confirm","prompt","backdrop","focus trap","imperative"],
  playground: {
    defaults: {
      isOpen: true,
      isInline: true,
      onOpenChange: undefined,
      width: 400,
      children: {
        __element: 'XDSVStack', props: {gap: 2}, children: [
          {__element: 'XDSHeading', props: {level: 3}, children: 'Dialog Title'},
          {__element: 'XDSText', props: {type: 'body'}, children: 'Are you sure you want to proceed? This action can be undone later from settings.'},
        ],
      },
    },
  },
  theming: {
    container: true,
    targets: [
      {className: 'xds-dialog', visualProps: ['variant']},
    ],
    vars: [
      {name: '--_dialog-radius', description: 'Border radius of the dialog', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dialog-radius']},
      {property: 'padding', expand: 'container'},
    ],
  },
  description: 'Modal dialog using the native <dialog> element.',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the dialog is open (required).',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: 'Callback when dialog visibility changes (required).',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Dialog content.',
      required: true,
    },
    {
      name: 'width',
      type: 'number | string',
      description: 'Width of the dialog in pixels or any CSS value.',
      default: '400',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description: 'Maximum height of the dialog.',
      default: "'75vh'",
    },
    {
      name: 'position',
      type: 'XDSDialogPosition',
      description: 'Static position for the dialog; centered by default when omitted.',
    },
    {
      name: 'variant',
      type: "'standard' | 'fullscreen'",
      description: 'Dialog variant: fullscreen expands to fill the entire viewport.',
      default: "'standard'",
    },
    {
      name: 'purpose',
      type: "'required' | 'form' | 'info'",
      description: 'Controls dismissal behavior: required disables Escape and backdrop click; form disables backdrop click after interaction; info allows both.',
      default: "'info'",
    },
    {
      name: 'isInline',
      type: 'boolean',
      description: 'Renders dialog content inline without the <dialog> element, backdrop, or modal behavior. For documentation previews and showcases only.',
      default: 'false',
    },
  ],
  components: [
    {name: 'XDSDialogHeader'},
    {name: 'useXDSImperativeDialog'},
  ],
  usage: {
    description: 'Dialog displays a modal overlay that blocks interaction with the page until the user responds. Use it for delete confirmations, edit forms, terms acceptance, or any decision that should not be skipped.\n\nFor cases where you want to show a dialog without managing open state, use the `useXDSImperativeDialog` hook: call `dialog.show(content)` and render `dialog.element` in your tree.',
    bestPractices: [
      { guidance: true, description: 'Choose the right purpose: info for dismissable content, form to prevent accidental backdrop dismissal, required when the user must respond.' },
      { guidance: true, description: 'Include a clear title in the header so users immediately understand what the dialog is asking.' },
      { guidance: true, description: 'Use purpose="form" for dialogs with inputs so the user can\'t accidentally lose data by clicking the backdrop.' },
      { guidance: true, description: 'Keep dialogs focused on a single task; if the content grows beyond what fits, consider a full page instead.' },
      { guidance: false, description: 'Use a dialog for simple messages that could be shown inline or as a toast notification.' },
      { guidance: false, description: 'Nest dialogs inside other dialogs; restructure the flow into steps within a single dialog instead.' },
      { guidance: false, description: 'Use the fullscreen variant for simple confirmations; it is meant for complex content like editors or long forms.' },
    ],
    anatomy: [
      {name: 'Header', required: true, description: 'Title, optional subtitle, and close button. The title receives focus on open for accessibility.'},
      {name: 'Body', required: true, description: 'The main content area: text, forms, lists, or any layout.'},
      {name: 'Footer', required: false, description: 'Action buttons like Save/Cancel or Accept/Decline, aligned to the end.'},
      {name: 'Backdrop', required: true, description: 'Semi-transparent overlay behind the dialog that blocks page interaction.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: 'Dialog displays a modal overlay that blocks interaction with the page until the user responds. Use it for delete confirmations, edit forms, terms acceptance, or any decision that should not be skipped.',
    bestPractices: [
      { guidance: true, description: 'Choose the right purpose: info for dismissable content, form to prevent accidental backdrop dismissal, required when the user must respond.' },
      { guidance: true, description: 'Include a clear title in the header so users immediately understand what the dialog is asking.' },
      { guidance: true, description: 'Use purpose="form" for dialogs with inputs so the user can\'t accidentally lose data by clicking the backdrop.' },
      { guidance: true, description: 'Keep dialogs focused on a single task; if the content grows beyond what fits, consider a full page instead.' },
      { guidance: false, description: 'Use a dialog for simple messages that could be shown inline or as a toast notification.' },
      { guidance: false, description: 'Nest dialogs inside other dialogs; restructure the flow into steps within a single dialog instead.' },
      { guidance: false, description: 'Use the fullscreen variant for simple confirmations; it is meant for complex content like editors or long forms.' },
    ],
    anatomy: [
      {name: 'Header', required: true, description: 'Title, optional subtitle, and close button. The title receives focus on open for accessibility.'},
      {name: 'Body', required: true, description: 'The main content area: text, forms, lists, or any layout.'},
      {name: 'Footer', required: false, description: 'Action buttons like Save/Cancel or Accept/Decline, aligned to the end.'},
      {name: 'Backdrop', required: true, description: 'Semi-transparent overlay behind the dialog that blocks page interaction.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'modal overlay that blocks page interaction until the user responds',
  usage: {
    description: 'Dialog displays a modal overlay that blocks page interaction. Use for delete confirmations, edit forms, terms acceptance.',
    bestPractices: [
      { guidance: true, description: 'Choose the right purpose: info for dismissable content, form to prevent accidental backdrop dismissal, required when user must respond.' },
      { guidance: true, description: 'Include a clear title in the header so users immediately understand what the dialog is asking.' },
      { guidance: true, description: 'Use purpose="form" for dialogs with inputs so user can\'t accidentally lose data by clicking the backdrop.' },
      { guidance: true, description: 'Keep dialogs focused on a single task; if content grows beyond what fits, consider a full page instead.' },
      { guidance: false, description: 'Use a dialog for simple messages that could be shown inline or as a toast notification.' },
      { guidance: false, description: 'Nest dialogs inside other dialogs; restructure the flow into steps within a single dialog instead.' },
      { guidance: false, description: 'Use the fullscreen variant for simple confirmations; it\'s meant for complex content like editors or long forms.' },
    ],
  },
};
