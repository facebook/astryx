/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Dialog',
  description:
    'Modal dialog using the native <dialog> element with automatic focus trapping, backdrop, and purpose-based dismissal control.',
  features: [
    "Native <dialog>: Uses the browser's built-in modal behavior via showModal()",
    'Automatic focus trap: Focus is trapped within the dialog when open (browser-native)',
    'Backdrop: Native ::backdrop pseudo-element with blur effect',
    'Variants: standard (configurable dimensions) and fullscreen (full viewport)',
    'Purpose-based dismissal: required, form, and info control Escape key and backdrop-click behavior',
    'Custom positioning: Static position support via the position prop',
    'Accessible: Proper ARIA attributes and keyboard navigation',
  ],
  examples: [
    {
      label: 'Basic dialog with Layout',
      code: `import {XDSDialog} from '@xds/core/Dialog';
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
}`,
    },
    {
      label: 'Static position',
      code: `<XDSDialog
  isOpen={isOpen}
  onOpenChange={open => setIsOpen(open)}
  position={{top: 100, right: 20}}>
  {/* content */}
</XDSDialog>`,
    },
    {
      label: 'Fullscreen variant',
      code: `<XDSDialog
  isOpen={isOpen}
  onOpenChange={open => setIsOpen(open)}
  variant="fullscreen">
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Full-screen title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSButton label="Close" onClick={() => setIsOpen(false)} />
      </XDSLayoutFooter>
    }
  />
</XDSDialog>`,
    },
    {
      label: 'Required purpose (non-dismissible)',
      code: `<XDSDialog
  isOpen={isOpen}
  onOpenChange={open => setIsOpen(open)}
  purpose="required">
  {/* user must take an explicit action to close */}
</XDSDialog>`,
    },
    {
      label: 'XDSDialogHeader with close button',
      code: `<XDSDialogHeader
  title="Confirm Action"
  subtitle="This cannot be undone"
  onOpenChange={open => setIsOpen(open)}
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-dialog', visualProps: ['variant']},
    ],
  },
  keyboard:
    'Escape closes the dialog (unless purpose="required"); focus is trapped inside the dialog while open.',
  accessibility: [
    'Uses the native <dialog> element with showModal() for correct ARIA modal semantics.',
    'Focus is automatically trapped by the browser when using showModal().',
    'XDSDialogHeader title receives focus when the dialog opens.',
  ],
  notes: [
    'Height is unset (grows with content) and constrained by the maxHeight prop.',
    'When variant="fullscreen", the width, maxHeight, and position props are ignored.',
    'For form purpose, backdrop click is only allowed before the user has interacted with the dialog.',
    'Purpose=required disables both Escape key and backdrop click; purpose=form disables backdrop click after interaction; purpose=info (default) allows both.',
    'XDSDialog is designed to be used with XDSLayout as its child.',
  ],
  components: [
    {
      name: 'XDSDialog',
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
          description:
            'Static position for the dialog; centered by default when omitted.',
        },
        {
          name: 'variant',
          type: "'standard' | 'fullscreen'",
          description:
            'Dialog variant — fullscreen expands to fill the entire viewport.',
          default: "'standard'",
        },
        {
          name: 'purpose',
          type: "'required' | 'form' | 'info'",
          description:
            'Controls dismissal behavior: required disables Escape and backdrop click; form disables backdrop click after interaction; info allows both.',
          default: "'info'",
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content goes here</XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSButton label="Confirm" variant="primary" onClick={() => setIsOpen(false)} />
      </XDSLayoutFooter>
    }
  />
</XDSDialog>`,
        },
      ],
    },
    {
      name: 'XDSDialogHeader',
      description:
        'Header for dialogs with a title, optional subtitle, close button, and start/end content slots.',
      props: [
        {
          name: 'title',
          type: 'string',
          description: 'Dialog title (receives focus on open).',
        },
        {
          name: 'subtitle',
          type: 'string',
          description: 'Subtitle below the title.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => unknown',
          description:
            'Close button callback (no button if omitted).',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            'Content before the title (e.g., a back button).',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'Content after the title, before close button.',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: 'Adds border at the bottom edge.',
          default: 'true',
        },
      ],
      examples: [
        {
          label: 'With title, subtitle, and close button',
          code: `<XDSDialogHeader
  title="Confirm Action"
  subtitle="This cannot be undone"
  onOpenChange={open => setIsOpen(open)}
/>`,
        },
        {
          label: 'With start content (back button)',
          code: `<XDSDialogHeader
  title="Step 2 of 3"
  startContent={<XDSButton label="Back" variant="secondary" onClick={goBack} />}
  onOpenChange={open => setIsOpen(open)}
/>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
