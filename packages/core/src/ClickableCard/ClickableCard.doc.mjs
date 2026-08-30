// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'ClickableCard',
  displayName: 'Clickable Card',
  group: 'Card',
  category: 'Container',
  keywords: ['card', 'clickable', 'interactive', 'navigation', 'action', 'link'],
  usage: {
    description: 'An interactive card for navigation or action targets. Nested interactive elements work independently.',
    bestPractices: [
      {guidance: true, description: 'Use for cards that navigate to a detail page or trigger a single action.'},
      {guidance: true, description: 'Nest buttons or links freely inside; they handle their own events.'},
      {guidance: false, description: 'Use for toggling selection; use SelectableCard for that.'},
    ],
    accessibility: [
      {name: 'Accessible identity', description: 'Provide a concise `label` that names the card action or destination. Visible content may reinforce it but must not conflict with it.'},
      {name: 'Background, border, and elevation', description: 'Use the removal test in every state. The resting surface treatment needs 3:1 only when removing it makes the whole Card cease to read as an interactive target. Clear linked content may identify the target instead; hover and pressed styling remain supplemental and do not replace persistent identification.'},
      {name: 'Focus and content', description: 'Measure the focus indicator separately at 3:1 against every adjacent color. Measure text and meaningful icons against the fully rendered Card background after resolving alpha, overlays, and the actual parent surface; text uses its applicable threshold and meaningful graphics need 3:1.'},
      {name: 'Nested controls and disabled', description: 'Nested controls retain their own accessible names, contrast, focus, and activation behavior. A genuinely disabled ClickableCard is contrast-exempt, but its inactive state must not be confused with loading or read-only content.'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'Interactive div with hover/focus/active states.'},
      {name: 'Content', required: true, description: 'Children, which may include nested interactive elements.'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: 'Accessibility label.', required: true},
    {name: 'onClick', type: '(event: MouseEvent) => void', description: 'Click handler: fires on card surface only.'},
    {name: 'href', type: 'string', description: 'Navigation URL.'},
    {name: 'target', type: 'string', description: 'Link target.', default: "'_self'"},
    {name: 'isDisabled', type: 'boolean', description: 'Disables the card.', default: 'false'},
    {name: 'children', type: 'ReactNode', description: 'Card content.'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: 'Inner padding.', default: '4'},
    {name: 'variant', type: "'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'", description: 'Background color variant.', default: "'default'"},
    {name: 'elevation', type: "'none' | 'low' | 'med' | 'high'", description: 'Resting shadow depth. Often raised to signal the whole card is clickable.', default: "'none'"},
    {name: 'width', type: 'SizeValue', description: 'Card width.'},
    {name: 'height', type: 'SizeValue', description: 'Card height.'},
    {name: 'maxWidth', type: 'SizeValue', description: 'Maximum card width.'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.'},
  ],
  theming: {
    container: true,
    targets: [{className: 'astryx-clickable-card', visualProps: ['variant']}],
  },
  playground: {
    defaults: {
      label: 'View product details',
      href: '#',
      padding: 4,
      children: {
        __element: 'XDSVStack',
        props: {gap: 1},
        children: [
          {__element: 'XDSHeading', props: {level: 3}, children: 'Wireless Headphones'},
          {__element: 'XDSText', props: {type: 'body'}, children: 'Noise-cancelling over-ear headphones with 30-hour battery life.'},
        ],
      },
    },
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: 'Interactive card for navigation/action targets. Nested interactive elements work independently.',
  usage: {
    description: 'Interactive card for navigation/action targets. Nested interactive elements work independently.',
    bestPractices: [
      {guidance: true, description: 'Use for cards navigating to detail page or triggering single action.'},
      {guidance: true, description: 'Nest buttons/links freely inside; they handle own events.'},
      {guidance: false, description: 'Use for toggling selection; use SelectableCard instead.'},
    ],
  },
  propDescriptions: {
    label: 'accessibility label',
    onClick: 'click handler: fires on card surface only',
    href: 'navigation URL',
    target: 'link target',
    isDisabled: 'disables card',
    padding: 'inner padding',
    variant: 'background color variant',
    elevation: 'resting shadow depth: none|low|med|high; often raised to signal clickability',
    width: 'card width',
    height: 'card height',
    maxWidth: 'max card width',
  },
};
