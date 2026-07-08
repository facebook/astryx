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
        {__element: 'SideNavItem', props: {label: 'Dashboard', isSelected: true}},
        {__element: 'SideNavItem', props: {label: 'Projects'}},
        {__element: 'SideNavItem', props: {label: 'Settings'}},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-side-nav', visualProps: ['mode']},
      {className: 'astryx-side-nav-heading'},
      {className: 'astryx-side-nav-item'},
      {className: 'astryx-side-nav-section'},
    ],
  },
  description: 'Container with five zones: header, topContent, children (scrollable), footer, and footerIcons. Supports collapsible mode.',
  props: [
    {
      name: 'header',
      type: 'ReactNode',
      description: 'Header area (typically SideNavHeading). Sticky.',
      slotElements: [
        {
          __element: 'Text',
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
          __element: 'Text',
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
          __element: 'SideNavItem',
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
          __element: 'Text',
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
          __element: 'Icon',
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
      name: 'resizable',
      type: 'boolean | { defaultWidth?: number; minWidth?: number; maxWidth?: number; autoSaveId?: string; onWidthChange?: (width: number) => void }',
      description: 'Enables a resize handle at the inline-end edge. true for defaults (260px initial, 180-480px range), or a ResizableConfig object (defaultWidth, minWidth, maxWidth, autoSaveId for localStorage persistence, onWidthChange). The handle is hidden while collapsed.',
      default: 'false',
    },
    {
      name: 'handleRef',
      type: 'Ref<SideNavImperativeCollapseHandle>',
      description: 'Imperative collapse handle for SideNavCollapseButton instances rendered outside this SideNav. Separate from `ref`, which continues to expose the root HTMLElement.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'SideNavHeading'},
    {name: 'SideNavItem'},
    {name: 'SideNavSection'},
    {name: 'SideNavCollapseButton'},
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
