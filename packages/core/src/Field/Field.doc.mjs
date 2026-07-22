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
      inputID: 'email-input',
      description: 'Use Field for controls that do not already provide field under the hood.',
      descriptionID: 'email-help',
      children: {
        __element: 'input',
        props: {
          id: 'email-input',
          'aria-describedby': 'email-help',
          placeholder: 'you@example.com',
          type: 'email',
        },
      },
    },
  },
  theming: {
    targets: [
      {className: 'astryx-field', visualProps: ['layout']},
      {className: 'astryx-field-label'},
      {className: 'astryx-field-status', visualProps: ['type', 'variant']},
    ],
    vars: [
      {name: '--_field-radius', description: 'Border radius of input fields', default: 'var(--radius-element)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_field-radius']},
    ],
  },
  description: 'Low-level form field wrapper for custom controls that need a label, description, and optional/required indicators.',
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
      type: "{type: 'warning' | 'error' | 'success', message?: string, messageID?: string}",
      description: 'Status indicator with type and optional message. When message is set, displays a colored status box. messageID is for wiring aria-describedby on the input.',
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
      description: 'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned. Prefer this over setting width via xstyle/className/style, which only size the inner control box.',
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
    description: 'Field is a low-level wrapper for custom, native, or third-party controls that do not already provide field label, description, and status UI. Use it when you need the Field shell around a control you own; use styled Astryx inputs like TextInput, Typeahead, and Select directly when they already expose label, description, and validation props.',
    bestPractices: [
      { guidance: true, description: 'Wrap custom controls, native inputs, or third-party widgets that need labeling, helper text, optional/required indicators, or validation status.' },
      { guidance: true, description: 'Always provide a label for accessibility, even if visually hidden with isLabelHidden.' },
      { guidance: true, description: 'Use inputID and descriptionID to connect the label and description to the inner control with htmlFor and aria-describedby.' },
      { guidance: false, description: 'Nest Field around styled inputs such as TextInput, Typeahead, Select, DateInput, or TextArea; those components already render their own Field shell.' },
      { guidance: false, description: 'Use the attached status variant on non-bordered controls such as sliders, switches, or checkboxes; use detached so the message does not overlap the control.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
      { guidance: false, description: 'Hide the label without providing an alternative way for the user to understand the field purpose.' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text identifying the field. Always rendered for accessibility, optionally hidden visually.'},
      {name: 'Description', required: false, description: 'Helper text between the label and input explaining what to enter.'},
      {name: 'Control slot', required: true, description: 'A custom, native, or third-party control that does not already render a field shell.'},
      {name: 'Status message', required: false, description: 'Inline validation feedback showing error, warning, or success with a message.'},
      {name: 'Optional/Required indicator', required: false, description: 'Badge next to the label showing whether the field is optional or required.'},
      {name: 'Label tooltip', required: false, description: 'Info icon at the end of the label with a tooltip explaining the field.'},
    ],
  },
  examples: [
    {
      label: 'Wrap a custom control',
      code: `
function CustomSliderField() {
  return (
    <Field
      label="Confidence"
      inputID="confidence-slider"
      description="Choose how strict the review should be."
      descriptionID="confidence-help"
      status={{type: 'success', message: 'Recommended default'}}
      statusVariant="detached">
      <input
        id="confidence-slider"
        type="range"
        min={0}
        max={100}
        defaultValue={60}
        aria-describedby="confidence-help"
      />
    </Field>
  );
}
`,
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: 'Field is a low-level wrapper for custom, native, or third-party controls that do not already provide field label, description, and status UI. Use it when you need the Field shell around a control you own; use styled Astryx inputs like TextInput, Typeahead, and Select directly when they already expose label, description, and validation props.',
    bestPractices: [
      { guidance: true, description: 'Wrap custom controls, native inputs, or third-party widgets that need labeling, helper text, optional/required indicators, or validation status.' },
      { guidance: true, description: 'Always provide a label for accessibility, even if visually hidden with isLabelHidden.' },
      { guidance: true, description: 'Use inputID and descriptionID to connect the label and description to the inner control with htmlFor and aria-describedby.' },
      { guidance: false, description: 'Nest Field around styled inputs such as TextInput, Typeahead, Select, DateInput, or TextArea; those components already render their own Field shell.' },
      { guidance: false, description: 'Use the attached status variant on non-bordered controls such as sliders, switches, or checkboxes; use detached so the message does not overlap the control.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
      { guidance: false, description: 'Hide the label without providing an alternative way for the user to understand the field purpose.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Low-level field shell for custom controls needing label/description/status.',
  usage: {
    description: 'Field wraps custom/native/third-party controls lacking field UI. Use TextInput, Typeahead, Select, DateInput, or TextArea directly when they already expose label/description/status props.',
    bestPractices: [
      { guidance: true, description: 'Wrap custom controls/widgets that need labeling, helper text, optional/required indicators, or validation status.' },
      { guidance: true, description: 'Always provide a label; visually hide it only when context is clear.' },
      { guidance: true, description: 'Wire inputID/descriptionID to htmlFor and aria-describedby on the inner control.' },
      { guidance: false, description: 'Nest Field around styled inputs; it double-renders labels and status UI.' },
      { guidance: false, description: 'Use attached status on sliders/switches/checkboxes; use detached so messages do not overlap.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
      { guidance: false, description: 'Hide the label without another way to understand field purpose.' },
    ],
  },
};
