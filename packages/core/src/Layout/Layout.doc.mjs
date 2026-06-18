// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Layout',
  displayName: 'Layout',
  group: 'Layout',
  category: 'Layout',
  keywords: ["layout","container","content","flex","box","wrapper","scaffold","page","shell"],
  playground: {
    defaults: {
      header: {__element: 'LayoutHeader', props: {}, children: {__element: 'Heading', props: {level: 3}, children: 'Page Title'}},
      content: {__element: 'LayoutContent', props: {}, children: {__element: 'Text', props: {type: 'body', color: 'secondary'}, children: 'Main content area. This is the scrollable center section of the layout.'}},
      footer: {__element: 'LayoutFooter', props: {}, children: {__element: 'Text', props: {type: 'supporting', color: 'secondary'}, children: 'Footer: status bar or actions'}},
    },
  },
  theming: {
    targets: [
      {className: 'xds-layout', visualProps: ['height']},
      {className: 'xds-layout-content'},
      {className: 'xds-layout-footer'},
      {className: 'xds-layout-header'},
      {className: 'xds-layout-panel'},
    ],
  },
  description: 'Page shell with header, sidebar(s), content, and footer slots for building full app layouts.',
  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description: 'Main content area (center).',
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
      description: 'Header slot.',
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
      description: 'Footer slot.',
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
      description: 'Start panel (left in LTR).',
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
      description: 'End panel (right in LTR).',
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
      description: 'Height behavior — fill the container or grow with content.',
      default: "'fill'",
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
      'Layout provides composable components for building structured page shells with header, sidebar, content, and footer slots. Use Layout for full app layouts and HStack/VStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use Layout for page shells that need distinct zones like header, sidebar(s), content, and footer.' },
      { guidance: true, description: 'Use HStack and VStack for simple directional stacking within a content area.' },
      { guidance: false, description: 'Use Layout for simple stacking layouts; use HStack or VStack instead.' },
      { guidance: false, description: 'Nest multiple Layout components; use one per page shell and compose content within its slots.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Layout provides composable components for building structured page shells with header, sidebar, content, and footer slots. Use Layout for full app layouts and HStack/VStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use Layout for page shells that need distinct zones like header, sidebar(s), content, and footer.' },
      { guidance: true, description: 'Use HStack and VStack for simple directional stacking within a content area.' },
      { guidance: false, description: 'Use Layout for simple stacking layouts; use HStack or VStack instead.' },
      { guidance: false, description: 'Nest multiple Layout components; use one per page shell and compose content within its slots.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Composable utilities + components for structured layouts w/ container/content separation pattern.',
  usage: {
    description:
      'Layout provides composable components for building structured page shells with header, sidebar, content, and footer slots. Use Layout for full app layouts and HStack/VStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use Layout for page shells that need distinct zones like header, sidebar(s), content, and footer.' },
      { guidance: true, description: 'Use HStack and VStack for simple directional stacking within a content area.' },
      { guidance: false, description: 'Use Layout for simple stacking layouts; use HStack or VStack instead.' },
      { guidance: false, description: 'Nest multiple Layout components; use one per page shell and compose content within its slots.' },
    ],
  },
};
