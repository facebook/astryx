/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Layout',
  description:
    'Composable utilities and components for building structured layouts with a container/content separation pattern.',
  features: [
    'Primitive + higher-order architecture — XDSLayoutContainer is a primitive; XDSCard, XDSSection are higher-order',
    'Directional padding via CSS variables — inner/outer, horizontal/vertical padding control',
    'Context-aware defaults — components detect their slot and self-adjust',
    'Automatic RTL support — uses CSS logical properties',
    'XDSLayout provides a page shell with header, sidebar(s), content, and footer slots',
    'XDSHStack and XDSVStack for simple stacking layouts',
    'XDSStackItem for fill/alignment control within stacks',
  ],
  examples: [
    {
      label: 'Basic page layout',
      code: `<XDSLayout
  header={<XDSLayoutHeader hasDivider>App Name</XDSLayoutHeader>}
  content={<XDSLayoutContent>Body content</XDSLayoutContent>}
  footer={<XDSLayoutFooter hasDivider>Footer</XDSLayoutFooter>}
/>`,
    },
    {
      label: 'App shell with sidebar',
      code: `<XDSLayout
  header={<XDSLayoutHeader hasDivider>App Name</XDSLayoutHeader>}
  start={
    <XDSLayoutPanel hasDivider width={240} role="navigation">
      <Navigation />
    </XDSLayoutPanel>
  }
  content={
    <XDSLayoutContent role="main">
      <MainContent />
    </XDSLayoutContent>
  }
/>`,
    },
    {
      label: 'Card layout',
      code: `<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Body content</XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSHStack gap={2} hAlign="end">
          <XDSButton variant="secondary">Cancel</XDSButton>
          <XDSButton variant="primary">Save</XDSButton>
        </XDSHStack>
      </XDSLayoutFooter>
    }
  />
</XDSCard>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-layout', visualProps: ['height']},
      {className: 'xds-layout-content'},
      {className: 'xds-layout-footer'},
      {className: 'xds-layout-header'},
      {className: 'xds-layout-panel'},
    ],
  },
  notes: [
    'Use XDSLayout for page shells and app layouts — any UI with a header bar, sidebar navigation, scrollable content area, or action footer. Do not use for simple stacking (use XDSVStack/XDSHStack instead).',
    'XDSLayoutContainer sets CSS variables that child components read: --layout-padding-outer-x (outer horizontal padding), --layout-padding-outer-y (outer vertical padding), --layout-padding-inner-x (inner horizontal padding used by Header, Footer, Content, Panel), --layout-padding-inner-y (inner vertical padding used by Header, Footer, Content, Panel).',
    'Architecture layers from top to bottom: Higher-Order Components (XDSCard, XDSSection), Layout Structure (XDSLayout + XDSLayoutHeader/Footer/Content/Panel), Primitive (XDSLayoutContainer sets CSS variables), Layout Utilities (XDSHStack, XDSVStack, stack(), stackItem()).',
    'All layout utilities and components are exported from @xds/core/Layout.',
  ],
  components: [
    {
      name: 'XDSLayout',
      description:
        'Page shell with header, sidebar(s), content, and footer slots for building full app layouts.',
      props: [
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Main content area (center).',
        },
        {
          name: 'header',
          type: 'ReactNode',
          description: 'Header slot.',
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description: 'Footer slot.',
        },
        {
          name: 'start',
          type: 'ReactNode',
          description: 'Start panel (left in LTR).',
        },
        {
          name: 'end',
          type: 'ReactNode',
          description: 'End panel (right in LTR).',
        },
        {
          name: 'height',
          type: "'fill' | 'auto'",
          description:
            'Height behavior — fill the container or grow with content.',
          default: "'fill'",
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSLayout
  header={<XDSLayoutHeader hasDivider>App Name</XDSLayoutHeader>}
  content={<XDSLayoutContent>Body content</XDSLayoutContent>}
  footer={<XDSLayoutFooter hasDivider>Footer</XDSLayoutFooter>}
/>`,
        },
        {
          label: 'With start panel',
          code: `<XDSLayout
  header={<XDSLayoutHeader hasDivider>App Name</XDSLayoutHeader>}
  start={
    <XDSLayoutPanel hasDivider width={240} role="navigation">
      <Navigation />
    </XDSLayoutPanel>
  }
  content={
    <XDSLayoutContent role="main">
      <MainContent />
    </XDSLayoutContent>
  }
/>`,
        },
      ],
    },
    {
      name: 'XDSLayoutHeader',
      description: 'Top bar for page titles, app bars, and toolbars.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Header content.',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: 'Border at bottom edge.',
          default: 'false',
        },
        {
          name: 'height',
          type: 'number | string',
          description: 'Header height.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the landmark element.',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA landmark role.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSLayoutHeader hasDivider role="banner">
  Page Title
</XDSLayoutHeader>`,
        },
      ],
    },
    {
      name: 'XDSLayoutContent',
      description: 'Scrollable main content area.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Content.',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description: 'Enable scrollable overflow.',
          default: 'true',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the landmark element.',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA landmark role.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSLayoutContent role="main">
  <MainContent />
</XDSLayoutContent>`,
        },
      ],
    },
    {
      name: 'XDSLayoutFooter',
      description: 'Bottom bar for action bars, pagination, and status bars.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Footer content.',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: 'Border at top edge.',
          default: 'false',
        },
        {
          name: 'height',
          type: 'number | string',
          description: 'Footer height.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the landmark element.',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA landmark role.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSLayoutFooter hasDivider>
  <XDSButton label="Save" variant="primary" />
</XDSLayoutFooter>`,
        },
      ],
    },
    {
      name: 'XDSLayoutPanel',
      description: 'Sidebar for navigation, settings, or inspector panels.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Panel content.',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: 'Border on the appropriate edge.',
          default: 'false',
        },
        {
          name: 'isScrollable',
          type: 'boolean',
          description: 'Enable scrollable overflow.',
          default: 'true',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the landmark element.',
        },
        {
          name: 'role',
          type: 'AriaRole',
          description: 'ARIA landmark role.',
        },
      ],
      examples: [
        {
          label: 'Navigation sidebar',
          code: `<XDSLayoutPanel hasDivider width={240} role="navigation">
  <Navigation />
</XDSLayoutPanel>`,
        },
      ],
    },
    {
      name: 'XDSLayoutContainer',
      description:
        'Primitive component that sets CSS variables for padding, used as the base for XDSCard and XDSSection.',
      props: [],
      examples: [
        {
          label: 'Basic',
          code: '<XDSLayoutContainer>Content</XDSLayoutContainer>',
        },
      ],
    },
    {
      name: 'XDSCard',
      description:
        'Card with elevation and themed styling, built on XDSLayoutContainer.',
      props: [],
      examples: [
        {
          label: 'Basic',
          code: '<XDSCard>Card content</XDSCard>',
        },
        {
          label: 'With layout structure',
          code: `<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Body content</XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSHStack gap={2} hAlign="end">
          <XDSButton variant="secondary">Cancel</XDSButton>
          <XDSButton variant="primary">Save</XDSButton>
        </XDSHStack>
      </XDSLayoutFooter>
    }
  />
</XDSCard>`,
        },
      ],
    },
    {
      name: 'XDSSection',
      description:
        'Section with background variants (section, transparent, wash), built on XDSLayoutContainer.',
      props: [],
      examples: [
        {
          label: 'Basic',
          code: '<XDSSection>Section content</XDSSection>',
        },
      ],
    },
    {
      name: 'XDSHStack',
      description: 'Horizontal stack that arranges children left-to-right.',
      props: [],
      examples: [
        {
          label: 'Basic',
          code: `<XDSHStack gap={2} hAlign="end">
  <XDSButton variant="secondary">Cancel</XDSButton>
  <XDSButton variant="primary">Save</XDSButton>
</XDSHStack>`,
        },
      ],
    },
    {
      name: 'XDSVStack',
      description: 'Vertical stack that arranges children top-to-bottom.',
      props: [],
      examples: [
        {
          label: 'Basic',
          code: `<XDSVStack gap={4}>
  <XDSCard>First</XDSCard>
  <XDSCard>Second</XDSCard>
</XDSVStack>`,
        },
      ],
    },
    {
      name: 'XDSStackItem',
      description:
        'Stack item with fill and alignment control for use inside XDSHStack or XDSVStack.',
      props: [],
      examples: [
        {
          label: 'Fill remaining space',
          code: `<XDSHStack>
  <XDSStackItem grow>Main content</XDSStackItem>
  <XDSButton variant="primary">Action</XDSButton>
</XDSHStack>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
