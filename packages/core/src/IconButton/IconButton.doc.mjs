/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'IconButton',
  description:
    'An icon-only button. Thin wrapper around XDSButton with isIconOnly always true.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSIconButton label="Settings" icon="gear" />',
  },

  keywords: ['icon-button', 'icon', 'button', 'toolbar', 'action', 'compact'],
  features: [
    'Composition wrapper — delegates all behavior to XDSButton with isIconOnly=true',
    'Explicit component name — greppable, codemod-safe, import-level detection',
    'Same variants, sizes, and states as XDSButton',
    'label prop becomes aria-label for accessibility',
    'icon prop is required (enforced by TypeScript)',
  ],

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

  notes: [
    'Prefer XDSIconButton over <XDSButton isIconOnly> for explicit intent',
    'The label prop is always used as aria-label — required for accessibility',
    'children and endContent are not accepted (omitted from props type)',
    'All other XDSButton props (variant, size, onClick, etc.) are forwarded',
  ],

  accessibility: [
    'Uses aria-label from the label prop for screen reader accessibility',
    'Same keyboard and screen reader behavior as XDSButton with isIconOnly',
  ],
};
