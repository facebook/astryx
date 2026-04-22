/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'IconButton',
  group: 'Button',
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
    description: 'An icon-only button for compact actions that can be clearly represented by a single icon. Use IconButton in toolbars, table rows, and dense UI areas where space is limited and the icon meaning is universally understood.',
    bestPractices: [
      { guidance: true, description: 'Always provide a descriptive label prop — it becomes the aria-label for screen reader users.' },
      { guidance: true, description: 'Add a tooltip to clarify the action for sighted users who may not recognize the icon.' },
      { guidance: false, description: 'Use an icon-only button when the action is ambiguous — add visible text or use a standard Button instead.' },
    ],
  },
};
