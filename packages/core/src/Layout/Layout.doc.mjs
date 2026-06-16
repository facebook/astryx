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
      header: {__element: 'XDSLayoutHeader', props: {}, children: {__element: 'XDSHeading', props: {level: 3}, children: 'Page Title'}},
      content: {__element: 'XDSLayoutContent', props: {}, children: {__element: 'XDSText', props: {type: 'body', color: 'secondary'}, children: 'Main content area. This is the scrollable center section of the layout.'}},
      footer: {__element: 'XDSLayoutFooter', props: {}, children: {__element: 'XDSText', props: {type: 'supporting', color: 'secondary'}, children: 'Footer: status bar or actions'}},
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
          __element: 'XDSLayoutContent',
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
          __element: 'XDSLayoutHeader',
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
          __element: 'XDSLayoutFooter',
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
          __element: 'XDSLayoutPanel',
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
          __element: 'XDSLayoutPanel',
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
  ],
  components: [
    {name: 'XDSLayoutHeader'},
    {name: 'XDSLayoutContent'},
    {name: 'XDSLayoutFooter'},
    {name: 'XDSLayoutPanel'},
    {name: 'XDSCard'},
    {name: 'XDSSection'},
  ],
  usage: {
    description:
      'Layout provides composable components for building structured page shells with header, sidebar, content, and footer slots. Use XDSLayout for full app layouts and XDSHStack/XDSVStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use XDSLayout for page shells that need distinct zones like header, sidebar(s), content, and footer.' },
      { guidance: true, description: 'Use XDSHStack and XDSVStack for simple directional stacking within a content area.' },
      { guidance: false, description: 'Use XDSLayout for simple stacking layouts; use XDSHStack or XDSVStack instead.' },
      { guidance: false, description: 'Nest multiple XDSLayout components; use one per page shell and compose content within its slots.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Layout provides composable components for building structured page shells with header, sidebar, content, and footer slots. Use XDSLayout for full app layouts and XDSHStack/XDSVStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use XDSLayout for page shells that need distinct zones like header, sidebar(s), content, and footer.' },
      { guidance: true, description: 'Use XDSHStack and XDSVStack for simple directional stacking within a content area.' },
      { guidance: false, description: 'Use XDSLayout for simple stacking layouts; use XDSHStack or XDSVStack instead.' },
      { guidance: false, description: 'Nest multiple XDSLayout components; use one per page shell and compose content within its slots.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Composable utilities + components for structured layouts w/ container/content separation pattern.',
  usage: {
    description:
      'Layout provides composable components for building structured page shells with header, sidebar, content, and footer slots. Use XDSLayout for full app layouts and XDSHStack/XDSVStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use XDSLayout for page shells that need distinct zones like header, sidebar(s), content, and footer.' },
      { guidance: true, description: 'Use XDSHStack and XDSVStack for simple directional stacking within a content area.' },
      { guidance: false, description: 'Use XDSLayout for simple stacking layouts; use XDSHStack or XDSVStack instead.' },
      { guidance: false, description: 'Nest multiple XDSLayout components; use one per page shell and compose content within its slots.' },
    ],
  },
};
