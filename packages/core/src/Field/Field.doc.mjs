/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Field',
  description:
    'A form field wrapper component that provides label, description, and optional/required indicators.',
  features: [
    'Label Support — required label for accessibility (can be visually hidden)',
    'Description — optional description text displayed between the label and input',
    'Optional/Required Indicators — display "Optional" or "Required" text with bullet separator',
    'Label Tooltip — optional info icon with tooltip at end of label',
    'Accessible — label properly associated with input via htmlFor/id',
    'Styled with StyleX — uses XDS design tokens for consistent styling',
  ],
  examples: [
    {
      label: 'Basic usage',
      code: `const id = useId();
<XDSField label="Email" inputID={id}>
  <input id={id} />
</XDSField>`,
    },
    {
      label: 'With description',
      code: `const inputId = useId();
const descId = useId();
<XDSField
  label="Email"
  description="We'll never share your email"
  inputID={inputId}
  descriptionID={descId}>
  <input id={inputId} aria-describedby={descId} />
</XDSField>`,
    },
    {
      label: 'Hidden label (screen readers only)',
      code: `const searchId = useId();
<XDSField label="Search" isLabelHidden inputID={searchId}>
  <input id={searchId} placeholder="Search..." />
</XDSField>`,
    },
    {
      label: 'Optional field',
      code: `const nicknameId = useId();
<XDSField label="Nickname" isOptional inputID={nicknameId}>
  <input id={nicknameId} placeholder="Enter your nickname" />
</XDSField>`,
    },
    {
      label: 'Required field',
      code: `const usernameId = useId();
<XDSField label="Username" isRequired inputID={usernameId}>
  <input id={usernameId} placeholder="Enter your username" />
</XDSField>`,
    },
    {
      label: 'Description with optional indicator (shows bullet separator)',
      code: `const bioId = useId();
const bioDescId = useId();
<XDSField
  label="Bio"
  description="Tell us about yourself"
  isOptional
  inputID={bioId}
  descriptionID={bioDescId}>
  <input id={bioId} aria-describedby={bioDescId} />
</XDSField>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-field'},
      {className: 'xds-field-label'},
      {className: 'xds-field-status', visualProps: ['type', 'variant']},
    ],
  },
  notes: [
    'Parent components are responsible for generating IDs (using the useId hook).',
    'Label is always rendered for accessibility; use isLabelHidden to hide visually.',
    'Hidden label uses a CSS technique that remains accessible to screen readers.',
    'Description is rendered when provided; if descriptionID is also provided, the description element gets that ID for aria-describedby association.',
    'isOptional and isRequired are mutually exclusive; setting both will show "Optional".',
    'Optional/Required text appears on the same line as the label.',
  ],
  components: [
    {
      name: 'XDSField',
      description:
        'Form field wrapper that provides label, description, and optional/required indicators.',
      examples: [
        {
          label: 'Basic',
          code: `<XDSField label="Email" inputID={id}>
  <input id={id} />
</XDSField>`,
        },
      ],
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Label text for the field (always rendered for accessibility).',
          required: true,
        },
        {
          name: 'inputID',
          type: 'string',
          description:
            'ID for the input element (used for the label htmlFor attribute).',
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
          description:
            'Visually hide the label (still accessible to screen readers).',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description:
            'Description text displayed between the label and input.',
        },
        {
          name: 'descriptionID',
          type: 'string',
          description:
            'ID for the description element (use for aria-describedby on the input).',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description:
            'Whether the field is optional (mutually exclusive with isRequired).',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description:
            'Whether the field is required (mutually exclusive with isOptional).',
          default: 'false',
        },
        {
          name: 'labelIcon',
          type: 'XDSIconType',
          description: 'Icon to display before the label text.',
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description:
            'Tooltip text to display in an info icon at the end of the label.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'XDSFieldLabel',
      description:
        'Standalone label component with optional/required indicators and tooltip support.',
      examples: [
        {
          label: 'Basic',
          code: '<XDSFieldLabel label="Username" inputID={id} isRequired />',
        },
      ],
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text.',
          required: true,
        },
        {
          name: 'inputID',
          type: 'string',
          description: 'ID of the input this label is for.',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Visually hide the label.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether the associated input is disabled.',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: 'Show "Optional" indicator.',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: 'Show "Required" indicator.',
          default: 'false',
        },
        {
          name: 'labelIcon',
          type: 'XDSIconType',
          description: 'Icon before the label text.',
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description: 'Tooltip text for info icon at end of label.',
        },
      ],
    },
    {
      name: 'XDSFieldStatus',
      description:
        'Status message component for form field validation feedback.',
      examples: [
        {
          label: 'Error',
          code: '<XDSFieldStatus type="error" message="This field is required" />',
        },
      ],
      props: [
        {
          name: 'type',
          type: "'error' | 'warning' | 'success'",
          description: 'Status type.',
          required: true,
        },
        {
          name: 'message',
          type: 'string',
          description: 'Status message text.',
          required: true,
        },
        {
          name: 'id',
          type: 'string',
          description: 'ID for aria-describedby association.',
        },
        {
          name: 'variant',
          type: "'attached' | 'detached'",
          description:
            'Visual variant — attached overlaps the input, detached floats below.',
          default: "'attached'",
        },
      ],
    },
  ],
};
