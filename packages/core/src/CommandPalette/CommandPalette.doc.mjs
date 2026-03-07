/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CommandPalette',
  description:
    'A modal dialog shell for command palette interfaces. Provides the structural container with composable slots for input, list, and footer areas.',
  features: [
    'Dialog shell: Wraps XDSDialog with command palette defaults (640×480, centered, info purpose)',
    'Composable slots: Children render as a flex column — input at top, scrollable list in middle, footer at bottom',
    'Accessible: Uses native <dialog> with aria-label for screen readers',
    'Keyboard dismissal: Escape key closes the palette (inherited from XDSDialog purpose="info")',
    'Configurable size: width and maxHeight props for custom dimensions',
  ],
  examples: [
    {
      label: 'Basic command palette',
      code: `import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {useState} from 'react';

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
      <input placeholder="Type a command..." />
      <div>List of commands</div>
    </XDSCommandPalette>
  );
}`,
    },
  ],
  props: {
    isOpen: {
      type: 'boolean',
      required: true,
      description: 'Whether the command palette is open.',
    },
    onOpenChange: {
      type: '(isOpen: boolean) => void',
      required: true,
      description:
        'Called when the palette visibility changes. Called with false on Escape or backdrop click.',
    },
    label: {
      type: 'string',
      default: "'Command palette'",
      description: 'Accessible label for the dialog.',
    },
    width: {
      type: 'number | string',
      default: '640',
      description:
        'Width of the dialog. Numbers are pixels, strings are CSS values.',
    },
    maxHeight: {
      type: 'number | string',
      default: '480',
      description:
        'Maximum height of the dialog. Numbers are pixels, strings are CSS values.',
    },
    children: {
      type: 'ReactNode',
      required: true,
      description:
        'Composable sub-components: input, list, footer, etc.',
    },
  },
};
