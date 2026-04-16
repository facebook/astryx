/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'IconButton',
  keywords: ['icon-button', 'icon', 'button', 'toolbar', 'action', 'compact'],

  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label. Used as aria-label (not rendered as visible text).',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Icon element rendered inside the button.',
      required: true,
    },
    {
      name: 'variant',
      type: "\'primary\' | \'secondary\' | \'ghost\' | \'destructive\'",
      description: 'Visual style variant.',
      default: "\'secondary\'",
    },
    {
      name: 'size',
      type: "\'sm\' | \'md\' | \'lg\'",
      description: 'Size variant.',
      default: "\'md\'",
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Shows a loading spinner and disables interaction.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the button.',
      default: 'false',
    },
    {
      name: 'tooltip',
      type: 'string',
      description: 'Tooltip text shown on hover.',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: 'Standard click handler.',
    },
    {
      name: 'onClickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description: 'Async click handler with automatic loading state.',
    },
  ],

  usage: {
    description:
      'An icon-only button that wraps XDSButton with isIconOnly always true. Use when an action can be clearly represented by a single icon without visible text.',
    features: [
      'Composition wrapper — delegates all behavior to XDSButton with isIconOnly=true',
      'Same variants, sizes, and states as XDSButton',
      'label prop becomes aria-label for accessibility',
      'icon prop is required (enforced by TypeScript)',
    ],
    accessibility: [
      'Uses aria-label from the label prop for screen reader accessibility.',
      'Same keyboard and screen reader behavior as XDSButton with isIconOnly.',
    ],
    notes: [
      'Prefer XDSIconButton over <XDSButton isIconOnly> for explicit intent.',
      'Explicit component name — greppable, codemod-safe, import-level detection.',
      'children and endContent are not accepted (omitted from props type).',
      'All other XDSButton props (variant, size, onClick, etc.) are forwarded.',
    ],
  },
};
