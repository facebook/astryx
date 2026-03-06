/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TextInput',
  description:
    'A text input component for collecting user text input, with label, description, validation status, and optional/required indicators.',
  features: [
    'Label support — required label for accessibility (can be visually hidden)',
    'Description — optional text displayed between the label and input',
    'Optional/Required indicators — "Optional" or "Required" text with bullet separator',
    'Label tooltip — optional info icon with tooltip at the end of the label',
    'Validation status — error, warning, and success states with colored borders and icons',
    'Start icon — optional icon displayed at the start of the input',
    'Loading state — shows a spinner and sets aria-busy while an async action is pending',
    'Disabled state — visually dims the input and prevents interaction',
    'Accessible — label is always associated with the input via htmlFor/id; sets aria-invalid, aria-required, aria-busy, and aria-describedby as appropriate',
    'Styled with StyleX — uses XDS design tokens for consistent styling',
  ],
  examples: [
    {
      label: 'Basic',
      code: '<XDSTextInput label="Name" value={name} onChange={setName} />',
    },
    {
      label: 'With placeholder',
      code: '<XDSTextInput label="Email" value={email} onChange={setEmail} placeholder="email@example.com" />',
    },
    {
      label: 'Hidden label',
      code: '<XDSTextInput label="Search" isLabelHidden value={query} onChange={setQuery} placeholder="Search..." />',
    },
    {
      label: 'With description',
      code: `<XDSTextInput
  label="Email"
  description="We'll never share your email"
  value={email}
  onChange={setEmail}
/>`,
    },
    {
      label: 'Optional and required',
      code: `<XDSTextInput label="Nickname" isOptional value={nickname} onChange={setNickname} />
<XDSTextInput label="Username" isRequired value={username} onChange={setUsername} />`,
    },
    {
      label: 'Validation status',
      code: `<XDSTextInput
  label="Email"
  value={email}
  onChange={setEmail}
  status={{type: 'error', message: 'Invalid email address'}}
/>`,
    },
    {
      label: 'With start icon',
      code: `<XDSTextInput
  label="Search"
  value={query}
  onChange={setQuery}
  startIcon={MagnifyingGlassIcon}
  placeholder="Search..."
/>`,
    },
    {
      label: 'Async action with loading state',
      code: `<XDSTextInput
  label="Username"
  value={username}
  onChange={setUsername}
  onChangeAction={async (value) => {
    await checkAvailability(value);
  }}
/>`,
    },
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the input — always rendered for accessibility.',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: 'Current value of the input.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the input value changes.',
    },
    {
      name: 'onChangeAction',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        'Async action fired after onChange (if not prevented). Triggers optimistic update and shows a loading spinner while pending.',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'Size variant of the input.',
      default: "'md'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label while keeping it accessible to screen readers.',
      default: 'false',
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
        'Displays an "Optional" indicator next to the label. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Displays a "Required" indicator next to the label and sets aria-required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables the input, preventing interaction and dimming the element.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Puts the input in a loading state, showing a spinner and setting aria-busy.',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when the input is empty.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text displayed in an info icon at the end of the label.',
    },
    {
      name: 'startIcon',
      type: 'XDSIconType',
      description:
        'SVG icon component displayed at the start of the input (e.g. from heroicons or lucide).',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description:
        'Validation status — applies a colored border and status icon. If message is provided, displays a floating message below the input. Error type also sets aria-invalid.',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Automatically focuses the input on mount.',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'The HTML name attribute for the input, useful for form submissions.',
    },
  ],
  theming: {
    componentKey: 'textInput',
    surfaces: [
      {name: 'wrapper', description: 'Wrapper container element'},
      {name: 'input', description: 'Input element'},
    ],
  },
  accessibility: [
    'Label is always rendered and associated with the input via htmlFor/id (using useId). Use isLabelHidden to hide it visually while keeping it accessible to screen readers.',
    'aria-describedby is set automatically when description or a status message is present.',
    'aria-invalid="true" is set when status.type is "error".',
    'aria-required="true" is set when isRequired is true.',
    'aria-busy is set while an optimistic update or isLoading is active.',
  ],
  notes: [
    'isOptional and isRequired are mutually exclusive — if both are set, "Optional" is shown.',
    'onChangeAction fires after onChange inside a React transition, enabling useOptimistic for an instant UI update while the async work completes.',
    'The component wraps XDSField for label, description, and optional/required rendering.',
    'The size prop currently supports "sm" and "md"; the sizeStyles object in the source also defines "lg" but it is not exposed in XDSTextInputSize.',
  ],
};
