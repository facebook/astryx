// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'ClickableContainer',
  displayName: 'Clickable Container',
  category: 'Container',
  keywords: ['clickable', 'container', 'interactive', 'card', 'surface', 'nested'],
  usage: {
    description:
      'A clickable surface that safely handles nested interactive elements. Children can include independent buttons, links, and inputs.',
    bestPractices: [
      {guidance: true, description: 'Use for clickable cards, rows, tiles, and other surfaces that contain their own interactive elements.'},
      {guidance: true, description: 'Provide a descriptive `label` for screen reader access.'},
      {guidance: true, description: 'Use `disabledMessage` instead of wrapping a disabled container in Tooltip.'},
      {guidance: false, description: 'Use for simple leaf elements without nested interactives — use Clickable instead.'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'Interactive div with hover/focus/active states. No role or tabIndex.'},
      {name: 'Hidden element', required: true, description: 'Visually-hidden button or link carrying the accessible role and label.'},
      {name: 'Content', required: true, description: 'Children, which may include nested interactive elements.'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: 'Accessibility label for screen readers.', required: true},
    {name: 'onClick', type: '(event: MouseEvent) => void', description: 'Click handler. Fires on container surface only, not nested elements.'},
    {name: 'href', type: 'string', description: 'Navigation URL. Ctrl/Cmd+click opens in new tab.'},
    {name: 'target', type: 'string', description: 'Link target for href navigation.'},
    {name: 'isDisabled', type: 'boolean', description: 'Disables interaction. Uses `aria-disabled` to stay focusable.', default: 'false'},
    {name: 'disabledMessage', type: 'string', description: 'Explains why the container is disabled. Shows a tooltip on hover/focus.'},
    {name: 'isReadOnly', type: 'boolean', description: 'Keeps appearance but removes interaction.', default: 'false'},
    {name: 'children', type: 'ReactNode', description: 'Container content. May include nested interactive elements.'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.'},
  ],
  playground: {
    defaults: {
      label: 'View details',
      children: {
        __element: 'XDSVStack',
        props: {gap: 1},
        children: [
          {__element: 'XDSHeading', props: {level: 3}, children: 'Card title'},
          {__element: 'XDSText', props: {type: 'body'}, children: 'Card description with nested interactive elements.'},
        ],
      },
    },
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Clickable surface with safe nested interactive element handling.',
  usage: {
    description: 'Clickable surface with safe nested interactive element handling.',
    bestPractices: [
      {guidance: true, description: 'Use for clickable cards, rows, and tiles with nested controls.'},
      {guidance: false, description: 'Use Clickable for simple leaf elements.'},
    ],
  },
  propDescriptions: {
    label: 'accessibility label for screen readers',
    onClick: 'click handler; fires on container surface only',
    href: 'navigation URL',
    target: 'link target for href',
    isDisabled: 'disables interaction via aria-disabled',
    disabledMessage: 'tooltip text explaining why disabled',
    isReadOnly: 'keeps appearance but removes interaction',
  },
};
