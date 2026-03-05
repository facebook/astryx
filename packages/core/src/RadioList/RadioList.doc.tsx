import type {ComponentDoc} from '../docs-types';

export const docs: ComponentDoc = {
  name: 'RadioList',
  description:
    'A radio group component for single-value selection from a list of options.',
  features: [
    'Accessible — uses native <input type="radio"> with proper role="radiogroup" and ARIA attributes',
    'Orientation — supports vertical and horizontal layouts',
    'Sizes — sm (18px radio, 20px wrapper) and md (22px radio, 24px wrapper)',
    'Descriptions — optional description text per item',
    'Custom content — startContent and endContent slots on each item',
    'Disabled state — supports disabling the entire group or individual items',
    'Field integration — uses XDSField for label, description, required/optional, and status messaging',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSRadioList
  label="Notification preference"
  value={selected}
  onChange={setSelected}
>
  <XDSRadioListItem label="Email" value="email" />
  <XDSRadioListItem label="SMS" value="sms" />
  <XDSRadioListItem label="Push" value="push" />
</XDSRadioList>`,
    },
    {
      label: 'With descriptions',
      code: `<XDSRadioList
  label="Plan"
  value={plan}
  onChange={setPlan}
>
  <XDSRadioListItem
    label="Free"
    value="free"
    description="Basic features, limited usage"
  />
  <XDSRadioListItem
    label="Pro"
    value="pro"
    description="All features, unlimited usage"
  />
</XDSRadioList>`,
    },
    {
      label: 'Horizontal layout',
      code: `<XDSRadioList
  label="Size"
  value={size}
  onChange={setSize}
  orientation="horizontal"
>
  <XDSRadioListItem label="Small" value="sm" />
  <XDSRadioListItem label="Medium" value="md" />
  <XDSRadioListItem label="Large" value="lg" />
</XDSRadioList>`,
    },
    {
      label: 'With status',
      code: `<XDSRadioList
  label="Required choice"
  value={choice}
  onChange={setChoice}
  isRequired
  status={{ type: 'error', message: 'Please select an option' }}
>
  <XDSRadioListItem label="Option A" value="a" />
  <XDSRadioListItem label="Option B" value="b" />
</XDSRadioList>`,
    },
    {
      label: 'Disabled group',
      code: `<XDSRadioList
  label="Locked selection"
  value="locked"
  onChange={() => {}}
  isDisabled
>
  <XDSRadioListItem label="Locked" value="locked" />
  <XDSRadioListItem label="Unavailable" value="unavailable" />
</XDSRadioList>`,
    },
  ],
  theming: {
    componentKey: 'radioList',
    surfaces: [{name: 'root', description: 'Root radio group styles'}],
  },
  notes: [
    'XDSRadioList creates a RadioListContext that provides name, value, onChange, isDisabled, isRequired, size, and status to child items',
    'XDSRadioListItem must be used within an XDSRadioList — throws if context is missing',
    'Uses a hidden native <input type="radio"> with a custom visual overlay for consistent styling',
    'Focus outline uses the standard XDS focus outline token with 2px offset',
    'Hover states use color-mix() for consistent overlay tinting',
    'Size variants match CheckboxInput dimensions for visual consistency',
  ],
  components: [
    {
      name: 'XDSRadioList',
      description:
        'Radio group container with field integration for label, description, and status.',
      examples: [
        {
          label: 'Basic',
          code: `<XDSRadioList label="Notification preference" value={selected} onChange={setSelected}>
  <XDSRadioListItem label="Email" value="email" />
  <XDSRadioListItem label="SMS" value="sms" />
</XDSRadioList>`,
        },
      ],
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Label text for the radio group (always rendered for accessibility).',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'The currently selected value.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: 'Callback fired when the selected value changes.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSRadioListItem elements.',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Whether to visually hide the label.',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Description text displayed below the label.',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          description: 'Layout direction of the radio items.',
          default: "'vertical'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether all radio items are disabled.',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: 'Whether the radio group is required.',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description:
            'Whether the field is optional (mutually exclusive with isRequired).',
          default: 'false',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description: 'Status indicator ({ type, message }).',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: 'Size of the radio controls.',
          default: "'md'",
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description: 'Tooltip text for an info icon next to the label.',
        },
      ],
    },
    {
      name: 'XDSRadioListItem',
      description:
        'Individual radio item with label, description, and content slots.',
      examples: [
        {
          label: 'With description',
          code: `<XDSRadioListItem
  label="Pro"
  value="pro"
  description="All features, unlimited usage"
/>`,
        },
      ],
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text for the radio item.',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'Value of this radio item.',
          required: true,
        },
        {
          name: 'description',
          type: 'string',
          description: 'Description text displayed below the label.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether this individual radio item is disabled.',
          default: 'false',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description: 'Content to render before the radio circle.',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Content to render after the label.',
        },
      ],
    },
  ],
};
