// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Field',
  displayName: 'Field',
  group: 'Field',
  category: 'Data Input',
  keywords: ["field","formfield","formgroup","formcontrol","label","input","required","optional","helpertext","hint"],
  playground: {
    defaults: {
      label: 'Email address',
      children: {__element: 'TextInput', props: {label: 'Email', placeholder: 'you@example.com'}},
    },
  },
  theming: {
    targets: [
      {className: 'xds-field'},
      {className: 'xds-field-label'},
      {className: 'xds-field-status', visualProps: ['type', 'variant']},
    ],
    vars: [
      {name: '--_field-radius', description: 'Border radius of input fields', default: 'var(--radius-element)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_field-radius']},
    ],
  },
  description: 'Form field wrapper that provides label, description, and optional/required indicators.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text for the field (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'inputID',
      type: 'string',
      description: 'ID for the input element (used for the label htmlFor attribute).',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The input or control to render.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hide the label (still accessible to screen readers).',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the associated input is disabled. Propagates disabled styling to the label.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed between the label and input.',
    },
    {
      name: 'descriptionID',
      type: 'string',
      description: 'ID for the description element (use for aria-describedby on the input).',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Whether the field is optional (mutually exclusive with isRequired).',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Whether the field is required (mutually exclusive with isOptional).',
      default: 'false',
    },
    {
      name: 'labelIcon',
      type: 'IconType',
      description: 'Icon to display before the label text. See `npx astryx docs icons` for valid semantic names.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text to display in an info icon at the end of the label.',
    },
    {
      name: 'status',
      type: 'FieldStatus',
      description: 'Status indicator with type and optional message. When message is set, displays a colored status box.',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached'",
      description: 'How the status message renders relative to the input. Attached overlaps the input border; detached floats below.',
      default: "'attached'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description: 'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field — label, control, and status — so they stay aligned. Prefer this over setting width via xstyle/className/style, which only size the inner control box.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the root element.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name(s) appended to the root element. Prefer xstyle for StyleX deduplication.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: 'Inline styles applied to the root element. Takes priority over StyleX inline styles.',
    },
  ],
  components: [
    {name: 'FieldLabel'},
    {name: 'FieldStatus'},
  ],
  usage: {
    description: 'Field wraps any input control with a label, description, and validation status. Use it to build accessible forms with consistent labeling, optional/required indicators, and inline error, warning, or success feedback.',
    bestPractices: [
      { guidance: true, description: 'Always provide a label for accessibility, even if visually hidden with isLabelHidden.' },
      { guidance: true, description: 'Use the status prop with clear messages to provide inline validation feedback.' },
      { guidance: true, description: 'Add a description when the label alone does not explain what the field expects, like format hints or constraints.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
      { guidance: false, description: 'Use the detached status variant on bordered inputs; reserve it for checkboxes, switches, and sliders.' },
      { guidance: false, description: 'Hide the label without providing an alternative way for the user to understand the field purpose.' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text identifying the field. Always rendered for accessibility, optionally hidden visually.'},
      {name: 'Description', required: false, description: 'Helper text between the label and input explaining what to enter.'},
      {name: 'Input slot', required: true, description: 'The input control wrapped by the field: TextInput, Select, DateInput, etc.'},
      {name: 'Status message', required: false, description: 'Inline validation feedback showing error, warning, or success with a message.'},
      {name: 'Optional/Required indicator', required: false, description: 'Badge next to the label showing whether the field is optional or required.'},
      {name: 'Label tooltip', required: false, description: 'Info icon at the end of the label with a tooltip explaining the field.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: 'Field wraps any input control with a label, description, and validation status. Use it to build accessible forms with consistent labeling, optional/required indicators, and inline error, warning, or success feedback.',
    bestPractices: [
      { guidance: true, description: 'Always provide a label for accessibility, even if visually hidden with isLabelHidden.' },
      { guidance: true, description: 'Use the status prop with clear messages to provide inline validation feedback.' },
      { guidance: true, description: 'Add a description when the label alone does not explain what the field expects, like format hints or constraints.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
      { guidance: false, description: 'Use the detached status variant on bordered inputs; reserve it for checkboxes, switches, and sliders.' },
      { guidance: false, description: 'Hide the label without providing an alternative way for the user to understand the field purpose.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Form field wrapper providing label, description + optional/required indicators.',
  usage: {
    description: 'Field wraps input controls with label, description, and validation. Use for accessible forms with consistent labeling and inline feedback.',
    bestPractices: [
      { guidance: true, description: 'Always provide a label for accessibility, even if visually hidden with isLabelHidden.' },
      { guidance: true, description: 'Use the status prop with clear messages to provide inline validation feedback.' },
      { guidance: true, description: 'Add a description when the label alone does not explain what the field expects: format hints or constraints.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
      { guidance: false, description: 'Use the detached status variant on bordered inputs; reserve it for checkboxes, switches, and sliders.' },
      { guidance: false, description: 'Hide the label without providing an alternative way for user to understand the field purpose.' },
    ],
  },
};
