/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MoreMenu',
  description:
    'Overflow menu with a three-dot icon trigger. A convenience wrapper that composes an icon-only XDSButton with a dropdown menu, eliminating the boilerplate of wiring up state management, positioning, and accessibility attributes.',
  props: [
    {
      name: 'items',
      type: 'XDSDropdownMenuOption[]',
      description:
        'Menu items — data array of actions, dividers, and sections. Same type as XDSDropdownMenu items prop.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the trigger button (aria-label) and tooltip text.',
      default: "'More options'",
    },
    {
      name: 'variant',
      type: 'XDSButtonVariant',
      description: 'Visual style variant of the trigger button.',
      default: "'ghost'",
    },
    {
      name: 'size',
      type: 'XDSButtonSize',
      description: 'Size of the trigger button.',
      default: "'md'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Override the default three-dot icon. Accepts any ReactNode.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the menu trigger is disabled.',
      default: 'false',
    },
    {
      name: 'children',
      type: '(item: XDSDropdownMenuItemData) => ReactNode',
      description:
        'Custom render function for items. Only called for selectable items (not dividers/sections).',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  examples: [
    {
      label: 'Minimal actions',
      code: `<XDSMoreMenu
  items={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete },
  ]}
/>`,
    },
    {
      label: 'Table row actions with icons',
      code: `<XDSMoreMenu
  label="Row actions"
  size="sm"
  items={[
    { label: 'Edit', icon: PencilIcon, onClick: () => handleEdit(row) },
    { type: 'divider' },
    { label: 'Delete', icon: TrashIcon, onClick: () => handleDelete(row) },
  ]}
/>`,
    },
    {
      label: 'With sections',
      code: `<XDSMoreMenu
  label="Document actions"
  items={[
    {
      type: 'section',
      title: 'Actions',
      items: [
        { label: 'Edit', onClick: handleEdit },
        { label: 'Duplicate', onClick: handleDuplicate },
      ],
    },
    {
      type: 'section',
      title: 'Danger zone',
      items: [
        { label: 'Delete', onClick: handleDelete },
      ],
    },
  ]}
/>`,
    },
    {
      label: 'Card header with overflow menu',
      code: `<XDSHStack align="center" justify="between">
  <XDSHeading level={3}>Card Title</XDSHeading>
  <XDSMoreMenu
    items={[
      { label: 'Edit', onClick: handleEdit },
      { label: 'Duplicate', onClick: handleDuplicate },
      { type: 'divider' },
      { label: 'Delete', onClick: handleDelete },
    ]}
  />
</XDSHStack>`,
    },
    {
      label: 'Custom item rendering',
      code: `<XDSMoreMenu
  label="User actions"
  items={actions}
>
  {item => (
    <XDSDropdownMenuItem
      icon={item.icon}
      label={item.label}
      description={item.description}
    />
  )}
</XDSMoreMenu>`,
    },
  ],
  features: [
    "Zero-config defaults: three-dot icon, 'More options' label, ghost variant — just pass items",
    'Data-driven items: same items prop as XDSDropdownMenu (items, dividers, sections)',
    'Icon-only trigger: always renders as a square icon button with aria-label',
    'Tooltip: shows label on hover, hidden when menu is open',
    'Custom rendering: optional children render function for custom item content',
  ],
  accessibility: [
    'Proper ARIA roles: menu and menuitem on dropdown elements.',
    'Trigger button has aria-haspopup="menu" and aria-expanded.',
    'aria-activedescendant tracks the highlighted menu item.',
    'Disabled items have aria-disabled set.',
    'Sections use role="group" with aria-label.',
  ],
  keyboard:
    'Arrow keys navigate items; Home/End jump to first/last; Enter/Space select highlighted item; Escape closes menu',
  notes: [
    'For full control over trigger rendering or menu content, compose XDSButton + useXDSLayer + XDSDropdownMenuItem directly.',
    'Use XDSMoreMenu for icon-only overflow actions in tight spaces (table rows, card headers). Use XDSDropdownMenu for labeled trigger buttons with chevrons.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
