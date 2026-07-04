// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'InputGroup',
  displayName: 'Input Group',
  group: 'Field',
  category: 'Data Input',
  isHiddenFromOverview: true,
  keywords: ["inputgroup","addon","prefix","suffix","connected","grouped","input"],
  theming: {
    targets: [
      {className: 'astryx-input-group', visualProps: ['size', 'status']},
    ],
  },
  description: 'Groups one compatible single-line input with prefix/suffix addons in a visually connected container with shared border and focus ring.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'One compatible input control and optional InputGroupText children.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the group.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hide the label.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Helper text between label and input group.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disable the entire group.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Show "(optional)" indicator.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Mark the field as required.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Default size for inputs in the group.',
      default: "'md'",
    },
    {
      name: 'status',
      type: 'InputStatus',
      description: 'Status indicator applied to the group border.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text at the end of the label.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector.',
    },
  ],
  components: [
    {name: 'InputGroupText'},
  ],
  usage: {
    description: 'InputGroup connects one compatible single-line input with prefix/suffix addons in a single visual unit. It currently supports TextInput and NumberInput. It is not a generic form wrapper; TextArea, Slider, Switch, CheckboxInput, and RadioList are unsupported by design.',
    bestPractices: [
      {guidance: true, description: 'Use InputGroup with a single supported control: TextInput or NumberInput.'},
      {guidance: true, description: 'Use text addons to show units, prefixes, or suffixes that clarify the input format (e.g., "$", "kg", "https://").'},
      {guidance: true, description: 'Use InputGroupText for static prefixes/suffixes like "$", "kg", or "https://".'},
      {guidance: true, description: "Keep each inner input's label specific; grouped inputs automatically combine the group label with their own label and inherit the group description/status context."},
      {guidance: false, description: 'Don\'t put multiple text inputs in one group; use separate fields instead.'},
      {guidance: false, description: 'Don\'t use InputGroup for unrelated inputs; it\'s for a single input with decorations.'},
      {guidance: false, description: 'Don\'t wrap TextArea, Slider, Switch, CheckboxInput, or RadioList in InputGroup; those controls are unsupported by design.'},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text above the group.'},
      {name: 'Prefix addon', required: false, description: 'Content before the input (text, icon, or button).'},
      {name: 'Input', required: true, description: 'The main input element. Currently compatible controls are TextInput and NumberInput.'},
      {name: 'Suffix addon', required: false, description: 'Content after the input (text, icon, or button).'},
      {name: 'Status message', required: false, description: 'An error, warning, or success message below the group.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'groups one compatible single-line input with prefix/suffix addons in a connected container',
  usage: {
    description: 'InputGroup connects one TextInput or NumberInput with addons. Not a generic form wrapper.',
    bestPractices: [
      {guidance: true, description: 'Use InputGroup with a single supported control: TextInput or NumberInput.'},
      {guidance: true, description: 'Use text addons to show units, prefixes, or suffixes that clarify input format (e.g. "$", "kg", "https://").'},
      {guidance: true, description: 'Use InputGroupText for static prefixes/suffixes like "$", "kg", or "https://".'},
      {guidance: true, description: "Keep each inner input's label specific; grouped inputs combine the group label with their own label and inherit group description/status."},
      {guidance: false, description: 'Don\'t put multiple text inputs in one group; use separate fields instead.'},
      {guidance: false, description: 'Don\'t use InputGroup for unrelated inputs; it\'s for a single input with decorations.'},
      {guidance: false, description: 'Don\'t wrap TextArea, Slider, Switch, CheckboxInput, or RadioList in InputGroup; those controls are unsupported by design.'},
    ],
  },
};
