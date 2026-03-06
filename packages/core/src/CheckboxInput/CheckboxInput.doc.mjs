/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CheckboxInput',
  description: 'A checkbox input component for toggling boolean values.',
  features: [
    'Accessible — always includes a label (can be visually hidden)',
    'Indeterminate state — supports indeterminate state for "select all" patterns',
    'Descriptions — optional description text below the label',
    'Custom styling — uses StyleX with XDS design tokens',
    'Disabled state — full support for disabled state styling',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the checkbox (always rendered for accessibility).',
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
      name: 'value',
      type: "boolean | 'indeterminate'",
      description:
        'Whether the checkbox is checked, unchecked, or indeterminate.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent) => void',
      description: 'Callback fired when the checkbox state changes.',
      required: true,
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the checkbox is disabled.',
      default: 'false',
    },
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSCheckboxInput
  label="Accept terms and conditions"
  value={accepted}
  onChange={setAccepted}
/>`,
    },
    {
      label: 'With description',
      code: `<XDSCheckboxInput
  label="Subscribe to newsletter"
  description="Receive weekly updates about new features"
  value={subscribed}
  onChange={setSubscribed}
/>`,
    },
    {
      label: 'Indeterminate state',
      code: `<XDSCheckboxInput
  label="Select all items"
  value="indeterminate"
  onChange={setSelectAll}
/>`,
    },
    {
      label: 'Hidden label',
      code: `<XDSCheckboxInput
  label="Select row"
  isLabelHidden
  value={selected}
  onChange={setSelected}
/>`,
    },
    {
      label: 'Disabled',
      code: `<XDSCheckboxInput
  label="Premium feature"
  description="Upgrade to enable this option"
  value={false}
  onChange={() => {}}
  isDisabled
/>`,
    },
  ],
  theming: {
    componentKey: 'checkboxInput',
    surfaces: [
      {name: 'root', description: 'Root container styles'},
      {name: 'checkbox', description: 'Visual checkbox element styles'},
    ],
  },
  notes: [
    'Uses a hidden native <input type="checkbox"> for accessibility with a custom visual checkbox overlay.',
    'The visual checkbox responds to hover, focus, and checked states via sibling selectors in CSS.',
    'Label is clickable and properly associated with the input via htmlFor/id.',
    'Focus outline uses the standard XDS focus outline token.',
  ],
};
