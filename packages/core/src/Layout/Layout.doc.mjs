// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Layout container',
    required: true,
    description:
      'General layout primitive that places the header, start, content, end, and footer slots.',
  },
  {
    name: 'Header',
    required: false,
    description:
      'Optional LayoutHeader region supplied by the caller, typically in the header slot.',
  },
  {
    name: 'Panel',
    required: false,
    description:
      'Optional LayoutPanel region supplied by the caller in the start or end slot.',
  },
  {
    name: 'Content area',
    required: false,
    description:
      'Optional LayoutContent region supplied by the caller in the content slot.',
  },
  {
    name: 'Footer',
    required: false,
    description:
      'Optional LayoutFooter region supplied by the caller, typically in the footer slot.',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Layout',
  displayName: 'Layout',
  group: 'Layout',
  category: 'Layout',
  keywords: [
    'layout',
    'container',
    'content',
    'flex',
    'box',
    'wrapper',
    'page',
    'regions',
  ],
  playground: {
    defaults: {
      header: {
        __element: 'LayoutHeader',
        props: {},
        children: {
          __element: 'Heading',
          props: {level: 3},
          children: 'Page Title',
        },
      },
      content: {
        __element: 'LayoutContent',
        props: {},
        children: {
          __element: 'Text',
          props: {type: 'body', color: 'secondary'},
          children:
            'Main content area. This is the scrollable center section of the layout.',
        },
      },
      footer: {
        __element: 'LayoutFooter',
        props: {},
        children: {
          __element: 'Text',
          props: {type: 'supporting', color: 'secondary'},
          children: 'Footer: status bar or actions',
        },
      },
    },
  },
  theming: {
    targets: [
      {className: 'astryx-layout', visualProps: ['height']},
      {className: 'astryx-layout-content'},
      {className: 'astryx-layout-footer'},
      {className: 'astryx-layout-header'},
      {className: 'astryx-layout-panel'},
    ],
    vars: [
      {
        name: '--astryx-layout-padding',
        description:
          'Default padding for LayoutHeader, LayoutContent, LayoutFooter, and LayoutPanel when their padding prop is omitted.',
        default: 'var(--spacing-4)',
      },
      {
        name: '--astryx-layout-padding-inline',
        description: 'Default horizontal layout-region padding.',
        default: 'var(--astryx-layout-padding)',
      },
      {
        name: '--astryx-layout-padding-inline-start',
        description: 'Default inline-start layout-region padding.',
        default: 'var(--astryx-layout-padding-inline)',
      },
      {
        name: '--astryx-layout-padding-inline-end',
        description: 'Default inline-end layout-region padding.',
        default: 'var(--astryx-layout-padding-inline)',
      },
      {
        name: '--astryx-layout-padding-block',
        description: 'Default vertical layout-region padding.',
        default: 'var(--astryx-layout-padding)',
      },
      {
        name: '--astryx-layout-padding-block-start',
        description: 'Default block-start layout-region padding.',
        default: 'var(--astryx-layout-padding-block)',
      },
      {
        name: '--astryx-layout-padding-block-end',
        description: 'Default block-end layout-region padding.',
        default: 'var(--astryx-layout-padding-block)',
      },
    ],
  },
  description:
    'General five-slot layout primitive for arranging header, start, content, end, and footer regions.',
  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description:
        'Content slot (center). Accepts any ReactNode; use LayoutContent when a content region is needed. Children passed to `<Layout>` render here too: `<Layout>{main}</Layout>` is shorthand for `<Layout content={main} />`.',
      slotElements: [
        {
          __element: 'LayoutContent',
          props: {},
          children: 'Content',
        },
      ],
    },
    {
      name: 'header',
      type: 'ReactNode',
      description:
        'Header slot. Accepts any ReactNode; use LayoutHeader when a header region is needed.',
      slotElements: [
        {
          __element: 'LayoutHeader',
          props: {},
          children: 'Header',
        },
      ],
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description:
        'Footer slot. Accepts any ReactNode; use LayoutFooter when a footer region is needed.',
      slotElements: [
        {
          __element: 'LayoutFooter',
          props: {},
          children: 'Footer',
        },
      ],
    },
    {
      name: 'start',
      type: 'ReactNode',
      description:
        'Logical-start slot (left in LTR). Accepts any ReactNode; use LayoutPanel when a panel region is needed.',
      slotElements: [
        {
          __element: 'LayoutPanel',
          props: {},
          children: 'Panel',
        },
      ],
    },
    {
      name: 'end',
      type: 'ReactNode',
      description:
        'Logical-end slot (right in LTR). Accepts any ReactNode; use LayoutPanel when a panel region is needed.',
      slotElements: [
        {
          __element: 'LayoutPanel',
          props: {},
          children: 'Panel',
        },
      ],
    },
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description: 'Height behavior: fill the container or grow with content.',
      default: "'fill'",
    },
    {
      name: 'contentWidth',
      type: 'SizeValue',
      description:
        'Maximum width of the content within each slot (header, content, footer, panels), centered when narrower than the available space. Dividers stay full-bleed. Numbers are treated as pixels, strings are used as-is (e.g. `60ch`). Common page widths: 640 for forms, settings, and text-focused pages; 960 for content pages and wider layouts.',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        "Padding at the layout's outer edges using the spacing scale.",
    },
    {
      name: 'defaultHasDividers',
      type: 'boolean',
      description:
        "Default divider visibility for LayoutHeader and LayoutFooter children. Headers and footers that don't pass `hasDivider` use this value; when unset, nested layouts inherit from their parent context.",
    },
  ],
  components: [
    {name: 'LayoutHeader'},
    {name: 'LayoutContent'},
    {name: 'LayoutFooter'},
    {name: 'LayoutPanel'},
    {name: 'Card'},
    {name: 'Section'},
  ],
  usage: {
    description:
      'Layout is a general five-slot primitive for arranging header, start, content, end, and footer regions within a page or bounded container. AppShell owns the page shell and app-wide navigation behavior; use HStack or VStack for simple directional stacking.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use Layout when content needs named header, start, content, end, or footer regions.',
      },
      {
        guidance: true,
        description:
          'Use HStack and VStack for simple directional stacking within a content area.',
      },
      {
        guidance: false,
        description:
          'Use Layout for simple stacking layouts; use HStack or VStack instead.',
      },
      {
        guidance: false,
        description:
          'Use Layout as the page shell or for app-wide navigation; use AppShell for that responsibility.',
      },
    ],
    anatomy,
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Layout is a general five-slot primitive for arranging header, start, content, end, and footer regions within a page or bounded container. AppShell owns the page shell and app-wide navigation behavior; use HStack or VStack for simple directional stacking.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use Layout when content needs named header, start, content, end, or footer regions.',
      },
      {
        guidance: true,
        description:
          'Use HStack and VStack for simple directional stacking within a content area.',
      },
      {
        guidance: false,
        description:
          'Use Layout for simple stacking layouts; use HStack or VStack instead.',
      },
      {
        guidance: false,
        description:
          'Use Layout as the page shell or for app-wide navigation; use AppShell for that responsibility.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'General five-slot primitive for arranging header, start, content, end, and footer regions. AppShell owns the page shell.',
  usage: {
    description:
      'Layout is a general five-slot primitive for arranging header, start, content, end, and footer regions within a page or bounded container. AppShell owns the page shell and app-wide navigation behavior; use HStack or VStack for simple directional stacking.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use Layout when content needs named header, start, content, end, or footer regions.',
      },
      {
        guidance: true,
        description:
          'Use HStack and VStack for simple directional stacking within a content area.',
      },
      {
        guidance: false,
        description:
          'Use Layout for simple stacking layouts; use HStack or VStack instead.',
      },
      {
        guidance: false,
        description:
          'Use Layout as the page shell or for app-wide navigation; use AppShell for that responsibility.',
      },
    ],
    anatomy,
  },
};
