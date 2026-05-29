// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'ClickableCard',
  displayName: 'Clickable Card',
  group: 'Card',
  category: 'Actions',
  keywords: ['card', 'clickable', 'interactive', 'navigation', 'action', 'link'],
  usage: {
    description: 'An interactive card for navigation or action targets. Nested interactive elements work independently.',
    bestPractices: [
      {guidance: true, description: 'Use for cards that navigate to a detail page or trigger a single action.'},
      {guidance: true, description: 'Nest buttons or links freely inside — they handle their own events.'},
      {guidance: false, description: 'Use for toggling selection — use SelectableCard for that.'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'Interactive div with hover/focus/active states.'},
      {name: 'Content', required: true, description: 'Children, which may include nested interactive elements.'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: 'Accessibility label.', required: true},
    {name: 'onClick', type: '(event: MouseEvent) => void', description: 'Click handler — fires on card surface only.'},
    {name: 'href', type: 'string', description: 'Navigation URL.'},
    {name: 'target', type: 'string', description: 'Link target.', default: "'_self'"},
    {name: 'isDisabled', type: 'boolean', description: 'Disables the card.', default: 'false'},
    {name: 'children', type: 'ReactNode', description: 'Card content.'},
    {name: 'padding', type: "SpacingStep", description: 'Inner padding.', default: '4'},
    {name: 'variant', type: "'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'", description: 'Background color variant.', default: "'default'"},
    {name: 'width', type: 'SizeValue', description: 'Card width.'},
    {name: 'height', type: 'SizeValue', description: 'Card height.'},
    {name: 'maxWidth', type: 'SizeValue', description: 'Maximum card width.'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.'},
  ],
  theming: {
    container: true,
    targets: [{className: 'xds-clickable-card', visualProps: ['variant']}],
  },
};
