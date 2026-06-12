// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Breadcrumbs',
  displayName: 'Breadcrumbs',
  group: 'Breadcrumbs',
  category: 'Navigation',
  keywords: ["breadcrumbs","breadcrumb","navigation","nav","crumbs","trail","path","hierarchy","wayfinding","steps"],
  usage: {
    description:
      'Breadcrumbs show a trail of links from the root to the current page. Use them at the top of detail pages, settings panels, or anywhere the user needs to see where they are and navigate back up.',
    bestPractices: [
      {guidance: true, description: 'Place breadcrumbs above the page heading so the user sees their location before reading the content.'},
      {guidance: true, description: 'Keep labels short and match the page titles they link to: "Settings" not "Application Settings Page".'},
      {guidance: true, description: 'Use the supporting variant in dense UIs like admin panels or sidebars where the breadcrumb should be subtle.'},
      {guidance: true, description: 'Make the last item plain text, not a link; it represents the current page. The component does this automatically when you set isCurrent.'},
      {guidance: false, description: 'Use breadcrumbs as the primary navigation. They supplement a sidebar or top nav, not replace it.'},
      {guidance: false, description: 'Show breadcrumbs on top-level pages that have no parent; they add clutter without helping the user.'},
      {guidance: false, description: 'Let the trail grow beyond 5 levels. If you need more, consider simplifying the page hierarchy instead.'},
    ],
    anatomy: [
      {name: 'Trail', required: true, description: 'The ordered list of links from root to current page.'},
      {name: 'Item', required: true, description: 'A single step in the trail. Renders as a link or plain text for the current page.'},
      {name: 'Separator', required: true, description: 'The character between items. Defaults to "/" but can be customized.'},
      {name: 'Icon', required: false, description: 'An optional icon before an item label, like a home icon on the first item.'},
    ],
  },
  theming: {
    targets: [
      {className: 'xds-breadcrumb-item'},
      {className: 'xds-breadcrumbs', visualProps: ['variant']},
    ],
  },
  description: 'Navigation container that renders a <nav> with an ordered list of breadcrumb items.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'XDSBreadcrumbItem elements to render inside the breadcrumb trail.',
      slotElements: [
        {
          __element: 'XDSBreadcrumbItem',
          props: {
            href: '#',
          },
          children: 'Page',
        },
      ],
      required: true,
    },
    {
      name: 'separator',
      type: 'ReactNode',
      description: 'Separator rendered between breadcrumb items.',
      default: "'/'",
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'chevronRight',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'variant',
      type: "'default' | 'supporting'",
      description: 'Visual variant — supporting is smaller with secondary text styling.',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the nav landmark (aria-label).',
      default: "'Breadcrumb'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'XDSBreadcrumbItem'},
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Breadcrumbs show a trail of links from the root to the current page. Use them at the top of detail pages, settings panels, or anywhere the user needs to see where they are and navigate back up.',
    bestPractices: [
      {guidance: true, description: 'Place breadcrumbs above the page heading so the user sees their location before reading the content.'},
      {guidance: true, description: 'Keep labels short and match the page titles they link to: "Settings" not "Application Settings Page".'},
      {guidance: true, description: 'Use the supporting variant in dense UIs like admin panels or sidebars where the breadcrumb should be subtle.'},
      {guidance: true, description: 'Make the last item plain text, not a link; it represents the current page. The component does this automatically when you set isCurrent.'},
      {guidance: false, description: 'Use breadcrumbs as the primary navigation. They supplement a sidebar or top nav, not replace it.'},
      {guidance: false, description: 'Show breadcrumbs on top-level pages that have no parent; they add clutter without helping the user.'},
      {guidance: false, description: 'Let the trail grow beyond 5 levels. If you need more, consider simplifying the page hierarchy instead.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'link trail from root to current page for wayfinding',
  usage: {
    description:
      'Breadcrumbs show a trail of links from root to current page. Use at the top of detail pages, settings, or nested content.',
    bestPractices: [
      {guidance: true, description: 'Place above the page heading so user sees location before reading content.'},
      {guidance: true, description: 'Keep labels short + matching page titles they link to: "Settings" not "Application Settings Page".'},
      {guidance: true, description: 'Use supporting variant in dense UIs where the breadcrumb should be subtle.'},
      {guidance: true, description: 'Last item plain text, not a link; represents current page; done automatically when you set isCurrent.'},
      {guidance: false, description: 'Use as primary navigation; breadcrumbs supplement, not replace, a main nav.'},
      {guidance: false, description: 'Show on top-level pages with no parent.'},
      {guidance: false, description: 'Let the trail exceed 5 levels; simplify the hierarchy instead.'},
    ],
  },
};
