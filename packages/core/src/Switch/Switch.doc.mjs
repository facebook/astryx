/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Switch',
  description:
    'A toggle switch component for boolean values with integrated label support.',
  features: [
    'Boolean toggle — fixed 40x24px track with animated 16px (off) / 20px (on) thumb',
    'Label integration — uses XDSFieldLabel for accessible labels with optional tooltip and icon',
    'Label position — label can appear before or after the switch via labelPosition',
    'Label spacing — supports spread layout to push label and switch to opposite ends',
    'Description — optional description text displayed below the label',
    'Optional/required indicators — visual markers for field status',
    'Status messages — error, warning, success, or info message boxes below the switch',
    'Async action support — onChangeAction with optimistic UI and built-in loading spinner',
    'Accessibility — native checkbox with role="switch", aria-describedby, aria-invalid, aria-busy',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSSwitch
  label="Enable notifications"
  value={enabled}
  onChange={setEnabled}
/>`,
    },
    {
      label: 'With description',
      code: `<XDSSwitch
  label="Dark mode"
  description="Switch to a darker color scheme"
  value={darkMode}
  onChange={setDarkMode}
/>`,
    },
    {
      label: 'With label icon and tooltip',
      code: `<XDSSwitch
  label="Auto-save"
  labelIcon={CloudArrowUpIcon}
  labelTooltip="Automatically save changes"
  value={autoSave}
  onChange={setAutoSave}
/>`,
    },
    {
      label: 'Settings panel style (label start, spread spacing)',
      code: `<XDSSwitch
  label="Enable notifications"
  value={enabled}
  onChange={setEnabled}
  labelPosition="start"
  labelSpacing="spread"
/>`,
    },
    {
      label: 'With async action and optimistic UI',
      code: `<XDSSwitch
  label="Sync to cloud"
  value={syncEnabled}
  onChange={setSyncEnabled}
  onChangeAction={async (checked) => {
    await updateSetting('sync', checked);
  }}
/>`,
    },
    {
      label: 'With error status',
      code: `<XDSSwitch
  label="Two-factor authentication"
  value={twoFactor}
  onChange={setTwoFactor}
  status={{type: 'error', message: 'Failed to save setting'}}
/>`,
    },
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the switch (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'value',
      type: 'boolean',
      description: 'Whether the switch is on or off.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the switch state changes.',
    },
    {
      name: 'onChangeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        'Async action fired after onChange. Triggers optimistic UI and shows a loading spinner until the promise resolves.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Whether the switch is in a loading state, showing a spinner inside the thumb.',
      default: 'false',
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
      description: 'Description text displayed below the label.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the switch is disabled.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Whether the field is optional. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Whether the switch is required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        'Status indicator with type and message. Displays a colored message box below the switch and sets aria-invalid when type is "error".',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the switch receives focus.',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the switch loses focus.',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: 'Icon displayed before the label text.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text shown in an info icon at the end of the label.',
    },
    {
      name: 'labelPosition',
      type: "'start' | 'end'",
      description:
        'Which side of the switch the label appears on. "start" places the label before the switch.',
      default: "'end'",
    },
    {
      name: 'labelSpacing',
      type: "'default' | 'spread'",
      description:
        'Spacing behavior between label and switch. "spread" pushes them to opposite ends of the container (full width).',
      default: "'default'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-switch'},
      {className: 'xds-switch-field'},
    ],
  },
  accessibility: [
    'Renders a native <input type="checkbox" role="switch"> for correct switch semantics',
    'Label is always associated via htmlFor/id even when visually hidden',
    'Description text is linked via aria-describedby on the input element',
    'Status messages are linked via aria-describedby; aria-invalid is set when status type is "error"',
    'aria-busy is set during async onChangeAction execution',
  ],
  keyboard: 'Space toggles the switch; Tab/Shift+Tab moves focus in and out',
  notes: [
    'Fixed dimensions: 40px width, 24px height, 16px thumb (off), 20px thumb (on)',
    'Track and thumb use CSS transitions for background-color, transform, width, and height',
    'Hover tints are applied via stylex.when.ancestor with a @media (hover: hover) guard',
    'onChangeAction uses React useTransition and useOptimistic for seamless async toggling',
    'labelPosition="start" with labelSpacing="spread" produces a settings panel style layout',
    'Follows the same patterns as XDSCheckboxInput for structural consistency',
  ],
};
