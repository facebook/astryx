// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'IconButton',
  displayName: 'Icon Button',
  group: 'Button',
  category: 'Action',
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
      slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
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
      name: 'clickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description: 'Async click handler with automatic loading state.',
    },
  ],

  usage: {
    description: 'A button that shows only an icon with no visible text. Use IconButton in toolbars, table rows, and compact UI where space is tight and the icon is universally understood.',
    bestPractices: [
      { guidance: true, description: 'Make the aria-label specific — a trash icon labeled "Delete conversation" is clearer than just "Delete" for screen readers.' },
      { guidance: true, description: 'Add a tooltip — even a gear icon can mean Settings, Preferences, or Configure.' },
      { guidance: true, description: 'Use ghost in toolbars and dense areas to reduce visual clutter.' },
      { guidance: false, description: 'Use IconButton if the action isn\'t obvious from the icon alone — use Button with text.' },
      { guidance: false, description: 'Skip the tooltip — label only reaches screen readers, sighted users need the hover hint.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Icon-only button for toolbars, table rows + compact UI where space is tight + icon is universally understood.',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Make aria-label specific — trash icon labeled "Delete conversation" clearer than just "Delete" for screen readers.' },
      { guidance: true, description: 'Add tooltip — even gear icon can mean Settings, Preferences, or Configure.' },
      { guidance: true, description: 'Use ghost in toolbars + dense areas to reduce visual clutter.' },
      { guidance: false, description: 'Use IconButton if action isn\'t obvious from icon alone — use Button w/ text instead.' },
      { guidance: false, description: 'Skip tooltip — label only reaches screen readers; sighted users need hover hint.' },
    ],
  },
  propDescriptions: {
    label: 'Accessible label; used as aria-label (not visible text) **(required)**',
    icon: 'Icon element rendered inside button **(required)**',
    variant: 'Visual style variant',
    size: 'Size variant',
    isLoading: 'Shows loading spinner + disables interaction',
    isDisabled: 'Disables button',
    tooltip: 'Tooltip text shown on hover',
    onClick: 'Standard click handler',
    clickAction: 'Async click handler w/ automatic loading state',
  },
};
