// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SideNav',
  displayName: 'Side Nav',
  group: 'Navigation',
  category: 'Navigation',
  keywords: ["sidenav","sidebar","navigation","drawer","menu","nav","aside","sidemenu","navmenu","sider","treeview"],
  playground: {
    defaults: {
      children: [
        {__element: 'XDSSideNavItem', props: {label: 'Dashboard', isSelected: true}},
        {__element: 'XDSSideNavItem', props: {label: 'Projects'}},
        {__element: 'XDSSideNavItem', props: {label: 'Settings'}},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'xds-side-nav', visualProps: ['mode']},
      {className: 'xds-side-nav-heading'},
      {className: 'xds-side-nav-item'},
      {className: 'xds-side-nav-section'},
    ],
  },
  description: 'Container with five zones: header, topContent, children (scrollable), footer, and footerIcons. Supports collapsible mode.',
  props: [
    {
      name: 'header',
      type: 'ReactNode',
      description: 'Header area (typically XDSSideNavHeading). Sticky.',
      slotElements: [
        {
          __element: 'XDSText',
          props: {
            type: 'body',
          },
          children: 'Header',
        },
      ],
    },
    {
      name: 'topContent',
      type: 'ReactNode',
      description: 'Content below the header, e.g., a create button.',
      slotElements: [
        {
          __element: 'XDSText',
          props: {
            type: 'body',
          },
          children: 'Top content',
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Navigation sections and items. Scrollable.',
      slotElements: [
        {
          __element: 'XDSSideNavItem',
          props: {
            label: 'Nav Item',
          },
        },
      ],
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description: 'Footer area above the icon bar.',
      slotElements: [
        {
          __element: 'XDSText',
          props: {
            type: 'body',
          },
          children: 'Footer content',
        },
      ],
    },
    {
      name: 'footerIcons',
      type: 'ReactNode',
      description: 'Footer icon bar.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'collapsible',
      type: 'boolean | { defaultIsCollapsed?: boolean; isCollapsed?: boolean; onCollapsedChange?: (isCollapsed: boolean) => void; hasButton?: boolean; buttonLabel?: string }',
      description: 'Enables collapse behavior. true for uncontrolled with default toggle button, or an object for controlled mode and advanced config (defaultIsCollapsed, isCollapsed + onCollapsedChange, hasButton, buttonLabel).',
      default: 'false',
    },
    {
      name: 'handleRef',
      type: 'Ref<XDSSideNavImperativeCollapseHandle>',
      description: 'Imperative collapse handle for XDSSideNavCollapseButton instances rendered outside this SideNav. Separate from `ref`, which continues to expose the root HTMLElement.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'XDSSideNavHeading'},
    {name: 'XDSSideNavItem'},
    {name: 'XDSSideNavSection'},
    {name: 'XDSSideNavCollapseButton'},
  ],
  usage: {
    description:
      'A sidebar navigation component for organizing application pages with sections, nested items, and icons. Use SideNav as the primary navigation when an app has 5 or more destinations or requires hierarchical grouping.',
    bestPractices: [
      {guidance: true, description: 'Use sections to group related navigation items and help users scan for their destination.'},
      {guidance: true, description: 'Pair outline and filled icon variants so the selected state is visually distinct.'},
      {guidance: false, description: 'Include a SideNavHeading when a TopNav is already providing app identity; this duplicates branding.'},
      {guidance: false, description: 'Use for filtering content; use tabs or filter buttons instead.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: false, description: 'Branding area at the top of the nav.'},
      {name: 'Navigation items', required: true, description: 'Sections and groups of navigable links.'},
      {name: 'Collapse/expand toggle', required: false, description: 'Toggle to collapse or expand the side nav.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A sidebar navigation component for organizing application pages with sections, nested items, and icons. Use SideNav as the primary navigation when an app has 5 or more destinations or requires hierarchical grouping.',
    bestPractices: [
      {guidance: true, description: 'Use sections to group related navigation items and help users scan for their destination.'},
      {guidance: true, description: 'Pair outline and filled icon variants so the selected state is visually distinct.'},
      {guidance: false, description: 'Include a SideNavHeading when a TopNav is already providing app identity; this duplicates branding.'},
      {guidance: false, description: 'Use for filtering content; use tabs or filter buttons instead.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: false, description: 'Branding area at the top of the nav.'},
      {name: 'Navigation items', required: true, description: 'Sections and groups of navigable links.'},
      {name: 'Collapse/expand toggle', required: false, description: 'Toggle to collapse or expand the side nav.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'A sidebar navigation component for organizing application pages with sections, nested items, and icons. Use SideNav as the primary navigation when an app has 5 or more destinations or requires hierarchical grouping.',
    bestPractices: [
      {guidance: true, description: 'Use sections to group related navigation items and help users scan for their destination.'},
      {guidance: true, description: 'Pair outline and filled icon variants so the selected state is visually distinct.'},
      {guidance: false, description: 'Include a SideNavHeading when a TopNav is already providing app identity; this duplicates branding.'},
      {guidance: false, description: 'Use for filtering content; use tabs or filter buttons instead.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: false, description: 'Branding area at the top of the nav.'},
      {name: 'Navigation items', required: true, description: 'Sections and groups of navigable links.'},
      {name: 'Collapse/expand toggle', required: false, description: 'Toggle to collapse or expand the side nav.'},
    ],
  },
};
