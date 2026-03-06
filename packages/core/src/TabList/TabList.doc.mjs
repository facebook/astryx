/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TabList',
  description:
    'Tab navigation components with overflow menu support, rendering as a semantic nav landmark with button or anchor tab items.',
  features: [
    'Context-based communication: XDSTabListContext passes value/onChange/size from XDSTabList to children',
    'Single-responsibility XDSTab: renders as <button> or <a> (when href is provided) in the nav',
    'Overflow menu: XDSTabMenu accepts an options prop and renders menu items internally from the dropdown',
    "Dynamic trigger label: menu trigger shows the selected option's label when one is active",
    "Menu heading: dropdown includes an XDSDivider with the menu's label as a separator heading",
    'Selection indicator: selected menu items show a checkmark icon (matching XDSSelector pattern)',
    'Keyboard navigation: Tab between items, ArrowUp/Down in menu, Home/End, Escape closes menu (via useListFocus)',
    'Hover state: unselected tabs show a gray underline on hover; no background hover overlay',
    'Accessibility: nav landmark, aria-current="page" on selected tabs, role="menu" + aria-label on dropdown, aria-controls connecting trigger to menu, role="menuitem" for items, role="separator" for heading divider',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
    },
    {
      label: 'With links',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" href="/home" />
  <XDSTab value="settings" label="Settings" href="/settings" />
</XDSTabList>`,
    },
    {
      label: 'With icons',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" icon={<HomeIcon />} selectedIcon={<HomeFilledIcon />} />
  <XDSTab value="settings" label="Settings" icon={<CogIcon />} />
</XDSTabList>`,
    },
    {
      label: 'With bottom divider',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab} hasDivider>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
    },
    {
      label: 'With overflow menu',
      code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
  <XDSTabMenu
    label="More"
    options={[
      {value: 'analytics', label: 'Analytics', icon: ChartBarIcon},
      {value: 'reports', label: 'Reports', icon: DocumentTextIcon},
    ]}
  />
</XDSTabList>`,
    },
  ],
  theming: {
    componentKey: 'tabList',
    surfaces: [{name: 'root', description: 'Root nav container styles'}],
  },
  accessibility: [
    'XDSTabList renders as a <nav> landmark with aria-label="Tabs"',
    'XDSTab renders as <button> or <a> — uses navigation pattern, not role="tab"',
    'Selected XDSTab has aria-current="page"',
    'XDSTabMenu trigger has aria-haspopup="menu", aria-expanded, and aria-controls pointing to the menu element',
    'XDSTabMenu dropdown has role="menu" and aria-label matching the label prop',
    'XDSTabMenu heading divider has role="separator"',
    'XDSTabMenu items have role="menuitem" and aria-current="true" when selected',
  ],
  keyboard:
    'Tab moves focus between tab items; within the XDSTabMenu dropdown: ArrowUp/ArrowDown navigate items (wrapping), Home/End jump to first/last item, Escape closes the menu.',
  notes: [
    'XDSTab renders as <button> by default and as <a> when href is provided',
    'XDSTabMenu renders menu items internally from the options prop — no child composition',
    'Trigger label derives from options.find(o => o.value === ctx.value)?.label ?? label',
    'Menu trigger underline scopes to the label text span only, not the chevron icon',
    'Icons on menu items render via XDSIcon with size="sm" and color="secondary"',
    'Selected menu items show a CheckIcon checkmark (matching XDSSelector pattern)',
    'hasDivider on XDSTabList controls the bottom border (default: off)',
    'Size uses sizeVars tokens for tab heights (sm/md/lg)',
  ],
  components: [
    {
      name: 'XDSTabList',
      description:
        'Nav wrapper that provides XDSTabListContext (value, onChange, size) to XDSTab and XDSTabMenu children.',
      props: [
        {
          name: 'value',
          type: 'string',
          description: 'The currently selected tab value.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: 'Callback fired when a tab is selected.',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Size variant applied to all child tabs.',
          default: "'md'",
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description:
            'Whether to show a bottom border divider under the tab list.',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSTab and XDSTabMenu items to render inside the nav.',
          required: true,
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSTabList value={activeTab} onChange={setActiveTab}>
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
        },
        {
          label: 'With divider',
          code: `<XDSTabList value={activeTab} onChange={setActiveTab} hasDivider size="sm">
  <XDSTab value="home" label="Home" />
  <XDSTab value="settings" label="Settings" />
</XDSTabList>`,
        },
      ],
    },
    {
      name: 'XDSTab',
      description:
        'Individual tab item that renders as a button or an anchor link, with selected-state styling and optional icons.',
      props: [
        {
          name: 'value',
          type: 'string',
          description:
            'Unique value for this tab, matched against XDSTabListContext.value.',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description: 'Visible label text for this tab.',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description:
            'URL to navigate to; when provided, the tab renders as an anchor element.',
        },
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description:
            'Custom component to render instead of <a> for link tabs. Overrides the XDSLinkProvider default. Only applies when href is provided.',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Icon element shown when the tab is not selected.',
        },
        {
          name: 'selectedIcon',
          type: 'ReactNode',
          description:
            'Icon element shown when the tab is selected; falls back to icon if not provided.',
        },
      ],
      examples: [
        {
          label: 'Button tab',
          code: '<XDSTab value="home" label="Home" />',
        },
        {
          label: 'Link tab with icons',
          code: '<XDSTab value="home" label="Home" href="/home" icon={<HomeIcon />} selectedIcon={<HomeFilledIcon />} />',
        },
      ],
    },
    {
      name: 'XDSTabMenu',
      description:
        "Overflow menu trigger that opens a dropdown of additional tab options, showing the selected option's label as the trigger text.",
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Label for the trigger button (shown when no option is selected) and the dropdown heading divider.',
          required: true,
        },
        {
          name: 'options',
          type: 'XDSTabMenuOption[]',
          description: 'Array of menu options rendered in the dropdown.',
          required: true,
        },
      ],
      examples: [
        {
          label: 'With icons',
          code: `<XDSTabMenu
  label="More"
  options={[
    {value: 'analytics', label: 'Analytics', icon: ChartBarIcon},
    {value: 'reports', label: 'Reports', icon: DocumentTextIcon},
  ]}
/>`,
        },
        {
          label: 'Text only',
          code: `<XDSTabMenu
  label="More"
  options={[
    {value: 'analytics', label: 'Analytics'},
    {value: 'reports', label: 'Reports'},
  ]}
/>`,
        },
      ],
    },
  ],
};
