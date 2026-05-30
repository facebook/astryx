// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'InputGroup',
  displayName: 'Input Group',
  group: 'Field',
  category: 'Inputs',
  keywords: ["inputgroup","addon","prefix","suffix","connected","grouped","input"],
  theming: {
    targets: [
      {className: 'xds-input-group', visualProps: ['size', 'status']},
    ],
  },
  components: [
    {
      name: 'XDSInputGroup',
      displayName: 'Input Group',
      description: 'Groups an input with prefix/suffix addons in a visually connected container with shared border and focus ring.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'Input and XDSInputGroupText children.', required: true},
        {name: 'label', type: 'string', description: 'Accessible label for the group.', required: true},
        {name: 'isLabelHidden', type: 'boolean', description: 'Visually hide the label.', default: 'false'},
        {name: 'description', type: 'string', description: 'Helper text between label and input group.'},
        {name: 'isDisabled', type: 'boolean', description: 'Disable the entire group.', default: 'false'},
        {name: 'isOptional', type: 'boolean', description: 'Show "(optional)" indicator.', default: 'false'},
        {name: 'isRequired', type: 'boolean', description: 'Mark the field as required.', default: 'false'},
        {name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Default size for inputs in the group.', default: "'md'"},
        {name: 'status', type: 'XDSInputStatus', description: 'Status indicator applied to the group border.'},
        {name: 'labelTooltip', type: 'string', description: 'Tooltip text at the end of the label.'},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization.'},
        {name: 'data-testid', type: 'string', description: 'Test selector.'},
      ],
    },
    {
      name: 'XDSInputGroupText',
      displayName: 'Input Group Text',
      description: 'A prefix or suffix text element rendered inside XDSInputGroup. Displays text or icons.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'Text or icon content.', required: true},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for customization.'},
        {name: 'className', type: 'string', description: 'CSS class name(s).'},
        {name: 'style', type: 'React.CSSProperties', description: 'Inline styles.'},
      ],
    },
  ],
  usage: {
    description: 'InputGroup connects an input with prefix/suffix addons in a single visual unit. Use it for URL fields, currency inputs, search fields with action buttons, or any input that needs contextual decorations.',
    bestPractices: [
      {guidance: true, description: 'Use text addons to show units, prefixes, or suffixes that clarify the input format (e.g., "$", "kg", "https://").'},
      {guidance: true, description: 'Use XDSInputGroupText for static prefixes/suffixes like "$", "kg", or "https://".'},
      {guidance: true, description: 'Set isLabelHidden on the inner input and let the group label be visible.'},
      {guidance: false, description: 'Don\'t put multiple text inputs in one group — use separate fields instead.'},
      {guidance: false, description: 'Don\'t use InputGroup for unrelated inputs — it\'s for a single input with decorations.'},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text above the group.'},
      {name: 'Prefix addon', required: false, description: 'Content before the input (text, icon, or button).'},
      {name: 'Input', required: true, description: 'The main input element (XDSTextInput, XDSNumberInput, etc.).'},
      {name: 'Suffix addon', required: false, description: 'Content after the input (text, icon, or button).'},
      {name: 'Status message', required: false, description: 'An error, warning, or success message below the group.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'groups input with prefix/suffix addons in a connected container',
  usage: {
    description: 'InputGroup connects an input with addons. Use for URL fields, currency inputs, search with actions.',
    bestPractices: [
      {guidance: true, description: 'Text addons for units/prefixes. isInteractive for buttons/selectors.'},
      {guidance: true, description: 'isLabelHidden on inner input, group label visible.'},
      {guidance: false, description: 'Don\'t put multiple inputs in one group. Don\'t group unrelated inputs.'},
    ],
  },
  components: [
    {
      name: 'XDSInputGroup',
      displayName: 'Input Group',
      description: 'connected input+addon container w/ shared border, focus ring',
      propDescriptions: {
        children: 'input + addon children',
        label: 'a11y label',
        isLabelHidden: 'visually hide label',
        description: 'helper text',
        isDisabled: 'disable group',
        isOptional: 'show "(optional)"',
        isRequired: 'mark required',
        size: 'default input size',
        status: 'error/warning/success border',
        labelTooltip: 'tooltip at label end',
        xstyle: 'StyleX layout styles',
        'data-testid': 'test selector',
      },
    },
    {
      name: 'XDSInputGroupText',
      displayName: 'Input Group Text',
      description: 'prefix/suffix text/icon element',
      propDescriptions: {
        children: 'text or icon content',
        xstyle: 'StyleX styles',
        className: 'CSS class name(s)',
        style: 'inline styles',
      },
    },
  ],
};
