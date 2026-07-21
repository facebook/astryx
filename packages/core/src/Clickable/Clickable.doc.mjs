// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'Clickable',
  displayName: 'Clickable',
  category: 'Action',
  keywords: ['clickable', 'button', 'link', 'interactive', 'primitive', 'navigation'],
  usage: {
    description:
      'A button/link wrapper that makes a single child element interactive. Renders a hover/active overlay and focus-visible outline. No padding of its own.',
    bestPractices: [
      {guidance: true, description: 'Use for leaf elements that need to become interactive without adding wrapper DOM.'},
      {guidance: true, description: 'Provide a descriptive `label` for screen reader access.'},
      {guidance: true, description: 'Use `disabledMessage` instead of wrapping a disabled element in Tooltip.'},
      {guidance: false, description: 'Use for clickable surfaces with nested interactive elements — use ClickableContainer instead.'},
      {guidance: false, description: 'Add padding inside Clickable — it has none by design.'},
    ],
    anatomy: [
      {name: 'Root', required: true, description: 'Inline-flex element with hover overlay and focus ring.'},
      {name: 'Content', required: true, description: 'Children rendered as interactive content.'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: 'Accessibility label for screen readers.', required: true},
    {name: 'onClick', type: '(event: MouseEvent) => void', description: 'Click handler. Renders as a button.'},
    {name: 'href', type: 'string', description: 'Navigation URL. Renders as a link.'},
    {name: 'target', type: 'string', description: 'Link target for href navigation.'},
    {name: 'isDisabled', type: 'boolean', description: 'Disables interaction. Uses `aria-disabled` to stay focusable.', default: 'false'},
    {name: 'disabledMessage', type: 'string', description: 'Explains why the element is disabled. Shows a tooltip on hover/focus.'},
    {name: 'isReadOnly', type: 'boolean', description: 'Keeps appearance but removes interaction.', default: 'false'},
    {name: 'children', type: 'ReactNode', description: 'Content rendered inside the clickable element.'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.'},
  ],
  playground: {
    defaults: {
      label: 'Click me',
      children: 'Click me',
    },
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Button/link wrapper for making a single child element interactive.',
  usage: {
    description: 'Button/link wrapper for making a single child element interactive with hover overlay and focus ring.',
    bestPractices: [
      {guidance: true, description: 'Use for leaf elements needing click interactivity.'},
      {guidance: false, description: 'Use ClickableContainer for surfaces with nested interactives.'},
    ],
  },
  propDescriptions: {
    label: 'accessibility label for screen readers',
    onClick: 'click handler; renders as a button',
    href: 'navigation URL; renders as a link',
    target: 'link target for href',
    isDisabled: 'disables interaction via aria-disabled',
    disabledMessage: 'tooltip text explaining why disabled',
    isReadOnly: 'keeps appearance but removes interaction',
  },
};
