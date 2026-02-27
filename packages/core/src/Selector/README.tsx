import type {ComponentDoc} from '../docs-types';

export const docs: ComponentDoc = {
  name: 'Selector',
  description:
    'Dropdown selector for choosing from a list of options. Follows XDS input conventions with label, status, and field props.',
  features: [
    'Supports string items (auto-converted to {value, label}), object items with optional icon and disabled state, dividers, and labeled sections',
    'Custom item rendering via children render prop and XDSSelectorItem helper',
    'Integrates with XDS field conventions: label, description, isRequired, isOptional, isLabelHidden, status',
    'Size variants: sm, md, lg',
    'Full keyboard navigation with typeahead support',
    'Accessible — role="combobox" trigger, role="listbox" dropdown, role="group" for sections, aria-activedescendant for focus',
  ],
  keyboard:
    '↑↓ navigate, Enter/Space select, Escape close, Home/End jump, A-Z typeahead.',
  accessibility: [
    'Uses role="combobox" on the trigger button.',
    'Dropdown uses role="listbox".',
    'Section groups use role="group".',
    'aria-activedescendant tracks the focused option.',
  ],
  theming: {
    componentKey: 'selector',
    surfaces: [
      {name: 'trigger', description: 'Trigger button styles'},
      {name: 'dropdown', description: 'Dropdown container styles'},
    ],
  },
  examples: [
    {
      label: 'Basic',
      code: `<XDSSelector
  label="Fruit"
  items={['Apple', 'Banana', 'Orange']}
  value={value}
  onChange={setValue}
/>`,
    },
    {
      label: 'With object items (icon, disabled)',
      code: `<XDSSelector
  label="Settings"
  items={[
    {value: 'profile', label: 'Profile', icon: UserIcon},
    {value: 'settings', label: 'Settings', icon: CogIcon, disabled: true},
  ]}
  value={value}
  onChange={setValue}
/>`,
    },
    {
      label: 'Sections',
      code: `<XDSSelector
  label="Fruit"
  items={[
    {value: 'apple', label: 'Apple'},
    {type: 'section', title: 'Citrus', items: [
      {value: 'orange', label: 'Orange'},
    ]},
  ]}
  value={value}
  onChange={setValue}
/>`,
    },
    {
      label: 'Custom rendering with XDSSelectorItem',
      code: `<XDSSelector label="User" items={users} value={value} onChange={setValue}>
  {user => (
    <XDSSelectorItem
      icon={UserIcon}
      label={user.label}
      description={user.email}
    />
  )}
</XDSSelector>`,
    },
    {
      label: 'With status and field props',
      code: `<XDSSelector
  label="Fruit"
  isRequired
  status={{type: 'error', message: 'Required'}}
  items={['Apple', 'Banana']}
  value={value}
  onChange={setValue}
/>`,
    },
  ],
  components: [
    {
      name: 'XDSSelector',
      description: 'Dropdown selector for choosing from a list of options.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text for accessibility.',
          required: true,
        },
        {
          name: 'items',
          type: 'XDSSelectorOption[]',
          description:
            'Array of items — strings, objects with value/label/icon/disabled, dividers ({type: "divider"}), or sections ({type: "section", title, items}).',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'Currently selected value.',
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: 'Callback fired when the selection changes.',
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Placeholder text shown when no value is selected.',
          default: "'Select...'",
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Size variant for the selector.',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the selector.',
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Visually hides the label while keeping it accessible.',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Helper text displayed below the label.',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: 'Marks the field as optional.',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: 'Marks the field as required.',
        },
        {
          name: 'status',
          type: "{type: 'error' | 'warning' | 'success', message?: string}",
          description: 'Validation status with an optional message.',
        },
        {
          name: 'children',
          type: '(item: XDSSelectorItemData) => ReactNode',
          description: 'Custom render function for each item in the dropdown.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSSelector
  label="Fruit"
  items={['Apple', 'Banana', 'Orange']}
  value={value}
  onChange={setValue}
/>`,
        },
        {
          label: 'With object items',
          code: `<XDSSelector
  label="Settings"
  items={[
    {value: 'profile', label: 'Profile', icon: UserIcon},
    {value: 'settings', label: 'Settings', icon: CogIcon, disabled: true},
  ]}
  value={value}
  onChange={setValue}
/>`,
        },
      ],
    },
    {
      name: 'XDSSelectorItem',
      description:
        'Helper component for custom item rendering inside an XDSSelector children render prop.',
      props: [
        {
          name: 'label',
          type: 'ReactNode',
          description: 'Primary label text for the item.',
          required: true,
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: 'Icon displayed before the label.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'Secondary description text displayed below the label.',
        },
      ],
      examples: [
        {
          label: 'Custom item rendering',
          code: `<XDSSelector label="User" items={users} value={value} onChange={setValue}>
  {user => (
    <XDSSelectorItem
      icon={UserIcon}
      label={user.label}
      description={user.email}
    />
  )}
</XDSSelector>`,
        },
      ],
    },
  ],
};
