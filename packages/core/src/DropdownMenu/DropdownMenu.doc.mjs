/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DropdownMenu',
  description:
    'A dropdown menu component for displaying actionable items in a popup menu.',
  features: [
    'Button customization: Customize the trigger button via the `button` prop (supports all XDSButton props)',
    'Data-driven items: Pass items via the `items` prop with support for sections and dividers',
    'Controlled/Uncontrolled: Supports both controlled (`isMenuOpen`/`onOpenChange`) and uncontrolled modes',
    'Custom menu width: Override default width (matches button) via `menuWidth` prop',
    'Sections: Group related items with optional headers using `XDSDropdownMenuSection`',
    'Keyboard navigation: Full keyboard support (Arrow keys, Home, End, Enter, Space, Escape)',
    'Accessibility: Proper ARIA roles (menu, menuitem) and attributes',
    'Custom rendering: Optional `children` render function with `XDSDropdownMenuItem` helper',
  ],
  examples: [
    {
      label: 'Basic usage',
      code: `<XDSDropdownMenu
  button={{ label: 'Actions' }}
  items={[
    { label: 'Edit', onClick: () => handleEdit() },
    { label: 'Delete', onClick: () => handleDelete() },
  ]}
/>`,
    },
    {
      label: 'With icons',
      code: `<XDSDropdownMenu
  button={{ label: 'Actions' }}
  items={[
    { label: 'Edit', icon: PencilIcon, onClick: () => handleEdit() },
    { label: 'Delete', icon: TrashIcon, onClick: () => handleDelete() },
  ]}
/>`,
    },
    {
      label: 'With sections',
      code: `<XDSDropdownMenu
  button={{ label: 'File', variant: 'ghost' }}
  items={[
    {
      type: 'section',
      title: 'Create',
      items: [
        { label: 'New File', onClick: () => handleNew() },
        { label: 'New Folder', onClick: () => handleNewFolder() },
      ],
    },
    {
      type: 'section',
      title: 'Manage',
      items: [
        { label: 'Rename', onClick: () => handleRename() },
        { label: 'Delete', isDisabled: true },
      ],
    },
  ]}
/>`,
    },
    {
      label: 'With dividers',
      code: `<XDSDropdownMenu
  button={{ label: 'Actions' }}
  items={[
    { label: 'Edit', onClick: () => handleEdit() },
    { type: 'divider' },
    { label: 'Delete', onClick: () => handleDelete() },
  ]}
/>`,
    },
    {
      label: 'Controlled mode',
      code: `const [isOpen, setIsOpen] = useState(false);
<XDSDropdownMenu
  button={{ label: 'Options' }}
  items={[...]}
  isMenuOpen={isOpen}
  onOpenChange={setIsOpen}
/>`,
    },
    {
      label: 'Custom item rendering with XDSDropdownMenuItem',
      code: `<XDSDropdownMenu
  button={{ label: 'Users' }}
  items={users}
>
  {item => (
    <XDSDropdownMenuItem
      icon={item.icon}
      label={item.label}
      description={item.email}
    />
  )}
</XDSDropdownMenu>`,
    },
  ],
  theming: {
    componentKey: 'dropdownMenu',
    surfaces: [
      {name: 'root', description: 'Dropdown container styles'},
      {name: 'item', description: 'Menu item styles'},
    ],
  },
  keyboard:
    'Arrow keys navigate items, Home/End jump to first/last, Enter/Space select, Escape closes the menu',
  accessibility: [
    'Uses proper ARIA roles: `menu` on the popup container, `menuitem` on each item',
    'Focus returns to the trigger button when the menu closes',
    'Keyboard navigation automatically skips disabled items',
  ],
  notes: [
    'Uses `useXDSLayer` with `mode: "context"` for CSS anchor positioning',
    'Uses `XDSButton` internally with `ChevronDownIcon` that inherits button text color',
    'Items are tracked via the `items` prop to enable keyboard navigation',
    'Light dismiss is enabled by default (clicking outside closes menu)',
  ],
  components: [
    {
      name: 'XDSDropdownMenu',
      description:
        'Main dropdown menu component with a trigger button and popup item list.',
      props: [
        {
          name: 'button',
          type: 'XDSDropdownMenuButtonProps',
          description:
            'Props for the trigger button (XDSButton props except onClick).',
          default: "{ label: 'Menu' }",
        },
        {
          name: 'items',
          type: 'XDSDropdownMenuOption[]',
          description:
            'Menu items, dividers, or sections to display in the popup.',
          required: true,
        },
        {
          name: 'isMenuOpen',
          type: 'boolean',
          description: 'Controlled open state for the menu.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback fired when the open state changes.',
        },
        {
          name: 'menuWidth',
          type: 'number | string',
          description:
            'Custom menu width; defaults to matching the trigger button width.',
        },
        {
          name: 'onClick',
          type: '() => void',
          description: 'Callback fired when the trigger button is clicked.',
        },
        {
          name: 'children',
          type: '(item: XDSDropdownMenuItemData) => ReactNode',
          description: 'Custom render function for each item in the list.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSDropdownMenu
  button={{ label: 'Actions' }}
  items={[
    { label: 'Edit', icon: PencilIcon, onClick: () => handleEdit() },
    { label: 'Delete', icon: TrashIcon, onClick: () => handleDelete() },
  ]}
/>`,
        },
      ],
    },
    {
      name: 'XDSDropdownMenuItem',
      description:
        'Helper component for custom item rendering with consistent styling.',
      props: [
        {
          name: 'icon',
          type: 'XDSIconType',
          description: 'Icon to display before the label.',
        },
        {
          name: 'label',
          type: 'ReactNode',
          description: 'Primary label text.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'Secondary description text displayed below the label.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Additional content rendered after the label and description.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: 'StyleX styles for the root container.',
        },
      ],
      examples: [
        {
          label: 'With icon and description',
          code: `<XDSDropdownMenuItem
  icon={UserIcon}
  label="Alice Johnson"
  description="alice@example.com"
/>`,
        },
      ],
    },
    {
      name: 'XDSDropdownMenuItemData',
      description:
        'Data shape for a single actionable menu item passed via the `items` prop.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Display label for the item.',
          required: true,
        },
        {
          name: 'onClick',
          type: '() => void',
          description: 'Callback fired when the item is selected.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            'Whether the item is disabled; disabled items are skipped during keyboard navigation.',
          default: 'false',
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: 'Icon to display before the item label.',
        },
      ],
      examples: [
        {
          label: 'Basic item',
          code: `{ label: 'Edit', onClick: () => handleEdit() }`,
        },
        {
          label: 'Disabled item with icon',
          code: `{ label: 'Delete', icon: TrashIcon, isDisabled: true }`,
        },
      ],
    },
    {
      name: 'XDSDropdownMenuDivider',
      description:
        'A visual divider that can be placed between items in the `items` array.',
      props: [
        {
          name: 'type',
          type: "'divider'",
          description:
            'Discriminant value that identifies this entry as a divider.',
          required: true,
        },
      ],
      examples: [
        {
          label: 'Divider between items',
          code: `items={[
  { label: 'Edit', onClick: () => handleEdit() },
  { type: 'divider' },
  { label: 'Delete', onClick: () => handleDelete() },
]}`,
        },
      ],
    },
    {
      name: 'XDSDropdownMenuSection',
      description:
        'A labeled group of items that can be placed in the `items` array.',
      props: [
        {
          name: 'type',
          type: "'section'",
          description:
            'Discriminant value that identifies this entry as a section.',
          required: true,
        },
        {
          name: 'title',
          type: 'string',
          description:
            'Optional header text displayed above the section items.',
        },
        {
          name: 'items',
          type: 'XDSDropdownMenuItemData[]',
          description: 'The actionable items that belong to this section.',
          required: true,
        },
      ],
      examples: [
        {
          label: 'Section with title',
          code: `{
  type: 'section',
  title: 'Create',
  items: [
    { label: 'New File', onClick: () => handleNew() },
    { label: 'New Folder', onClick: () => handleNewFolder() },
  ],
}`,
        },
      ],
    },
  ],
};
