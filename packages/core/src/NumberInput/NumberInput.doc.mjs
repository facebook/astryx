/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'NumberInput',
  description:
    'A number input component for collecting numeric user input with validation.',
  features: [
    'Label Support — required label for accessibility (can be visually hidden)',
    'Description — optional description text displayed between the label and input',
    'Optional/Required Indicators — display "Optional" or "Required" text with bullet separator',
    'Label Tooltip — optional info icon with tooltip at end of label',
    'Label Icon — optional icon before the label text',
    'Accessible — label properly associated with input via htmlFor/id',
    'Styled with StyleX — uses XDS design tokens for consistent styling',
    'Size Variants — three sizes (sm, md, lg) for different contexts',
    'Status Handling — error, warning, and success states with messages',
    'Number Constraints — support for min, max, and step attributes',
    'Validated onChange — only calls onChange when the entered value passes validation',
    'Units Display — optional units suffix (e.g., "%" or "GB")',
    'Integer Mode — option to restrict to integers only',
    'Native Controls — uses type="number" for browser step controls',
    'Event Callbacks — onFocus, onBlur, and onEnter handlers',
  ],
  examples: [
    {
      label: 'Basic',
      code: '<XDSNumberInput label="Quantity" value={quantity} onChange={setQuantity} />',
    },
    {
      label: 'With placeholder',
      code: '<XDSNumberInput label="Age" value={age} onChange={setAge} placeholder="Enter your age" />',
    },
    {
      label: 'With min/max constraints',
      code: '<XDSNumberInput label="Rating" value={rating} onChange={setRating} min={1} max={5} />',
    },
    {
      label: 'With step for decimals',
      code: '<XDSNumberInput label="Price" value={price} onChange={setPrice} min={0} step={0.01} />',
    },
    {
      label: 'With units display',
      code: '<XDSNumberInput label="Discount" value={discount} onChange={setDiscount} units="%" />',
    },
    {
      label: 'Integer only',
      code: '<XDSNumberInput label="Count" value={count} onChange={setCount} isIntegerOnly />',
    },
    {
      label: 'With description',
      code: '<XDSNumberInput label="Quantity" description="Enter the number of items" value={qty} onChange={setQty} />',
    },
    {
      label: 'Optional field',
      code: '<XDSNumberInput label="Phone Extension" isOptional value={ext} onChange={setExt} />',
    },
    {
      label: 'Required field',
      code: '<XDSNumberInput label="Amount" isRequired value={amount} onChange={setAmount} />',
    },
    {
      label: 'With validation status',
      code: `<XDSNumberInput
  label="Age"
  value={age}
  onChange={setAge}
  status={{ type: 'error', message: 'Age must be between 18 and 120' }}
/>`,
    },
    {
      label: 'With event handlers',
      code: `<XDSNumberInput
  label="Search"
  value={search}
  onChange={setSearch}
  onEnter={() => handleSearch()}
  onFocus={() => console.log('focused')}
  onBlur={() => console.log('blurred')}
/>`,
    },
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the input (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'value',
      type: 'number | null | undefined',
      description: 'Current value of the input.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      description:
        'Callback fired when input value changes (only on valid input).',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant.',
      default: "'md'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hide the label (still accessible to screen readers).',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed between the label and input.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Whether the field is optional (mutually exclusive with isRequired).',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Whether the field is required (mutually exclusive with isOptional).',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the input is disabled.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text to display in an info icon at the end of the label.',
    },
    {
      name: 'startIcon',
      type: 'XDSIconType',
      description: 'Icon to display at the start of the input.',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: 'Icon to display before the label text.',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description: 'Validation status with optional message.',
    },
    {
      name: 'min',
      type: 'number | null',
      description: 'Minimum value allowed.',
    },
    {
      name: 'max',
      type: 'number | null',
      description: 'Maximum value allowed.',
    },
    {
      name: 'step',
      type: 'number | null',
      description: 'Step increment for the input.',
      default: '1',
    },
    {
      name: 'units',
      type: 'string | null',
      description:
        'Units text to display at the end of the input (e.g., "%" or "GB").',
    },
    {
      name: 'isIntegerOnly',
      type: 'boolean',
      description: 'Only allow integer values (no floating point).',
    },
    {
      name: 'htmlName',
      type: 'string',
      description: 'HTML name attribute for form submissions.',
    },
    {
      name: 'autoComplete',
      type: 'string',
      description: 'HTML autocomplete attribute.',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Whether to focus the input on mount.',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the input receives focus.',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the input loses focus.',
    },
    {
      name: 'onEnter',
      type: '() => void',
      description: 'Callback fired when the user presses the Enter key.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-number-input', visualProps: ['size']},
    ],
  },
  accessibility: [
    'Label is always rendered and associated with the input via htmlFor/id using the useId hook.',
    'Use isLabelHidden to hide the label visually while keeping it accessible to screen readers via a CSS technique.',
    'Wraps XDSField for consistent label, description, and optional/required indicator handling.',
  ],
  notes: [
    'isOptional and isRequired are mutually exclusive; if both are set, "Optional" is shown.',
    'Uses type="number" to enable native browser step controls (up/down arrows).',
    'Validated onChange: only calls onChange when the entered value is a valid number that passes min/max/integer constraints.',
    'Uses internal pending state to allow free-form typing while validating on commit.',
    'Units are displayed as a lighter grey suffix after the input value.',
  ],
};
