// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'SelectableCard',
  displayName: 'Selectable Card',
  group: 'Card',
  category: 'Container',
  keywords: ['card', 'selectable', 'toggle', 'checkbox', 'radio', 'selection'],
  usage: {
    description: 'A card that toggles between selected and unselected states with an accent border. For navigation use ClickableCard.',
    bestPractices: [
      {guidance: true, description: 'Use for plan pickers, filter chips, or option grids.'},
      {guidance: true, description: 'For single-select track one ID; for multi-select use a Set.'},
      {guidance: false, description: 'Use for navigation — use ClickableCard for that.'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'Interactive div with accent border on selection.'},
      {name: 'Content', required: true, description: 'Children rendered inside the card.'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: 'Accessibility label.', required: true},
    {name: 'isSelected', type: 'boolean', description: 'Controlled selection state.', required: true},
    {name: 'onChange', type: '(isSelected: boolean) => void', description: 'Called when toggled.', required: true},
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
    targets: [{className: 'xds-selectable-card', visualProps: ['selected']}],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Card toggling selected/unselected w/ accent border; for navigation use ClickableCard.',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Use for plan pickers, filter chips, / option grids.' },
      { guidance: true, description: 'Single-select: track one ID; multi-select: use Set.' },
      { guidance: false, description: 'Use for navigation — use ClickableCard instead.' },
    ],
  },
  propDescriptions: {
    label: 'A11y label **(required)**',
    isSelected: 'Controlled selection state **(required)**',
    onChange: 'Called when toggled **(required)**',
    isDisabled: 'Disables card',
    padding: 'Inner padding',
    variant: 'Background color variant',
    width: 'Card width',
    height: 'Card height',
    maxWidth: 'Max card width',
  },
};
