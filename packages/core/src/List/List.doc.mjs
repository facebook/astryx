// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'List',
  displayName: 'List',
  group: 'List',
  category: 'Table & List',
  keywords: ["list","listitem","listbox","menu","collection","items","ul","navlist"],
  theming: {
    targets: [
      {className: 'xds-list', visualProps: ['density', 'listStyle']},
      {className: 'xds-list-item'},
    ],
  },
  description: 'List container with density, dividers, and header support.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'List items (XDSListItem components).',
      slotElements: [
        {
          __element: 'XDSListItem',
          props: {
            label: 'List item',
          },
        },
      ],
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Spacing density for items.',
      default: "'balanced'",
    },
    {
      name: 'hasDividers',
      type: 'boolean',
      description: 'Show dividers between items.',
      default: 'false',
    },
    {
      name: 'header',
      type: 'ReactNode',
      description: 'Header content, associated with the list via aria-labelledby.',
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
      name: 'listStyle',
      type: "'none' | 'disc' | 'decimal' | 'circle'",
      description: "List marker style. 'decimal' renders an <ol> element instead of <ul>.",
      default: "'none'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'XDSListItem'},
  ],
  usage: {
    description:
      'A vertical collection of items with consistent spacing, dividers, and optional markers. Supports headers, icons, avatars, badges, and interactive items with click or link behavior. Use it to display ordered or unordered groups of related content.',
    bestPractices: [
      { guidance: true, description: 'Provide a header to label the list and give context to screen readers.' },
      { guidance: true, description: 'Use start and end content slots to add icons, avatars, or badges to each item.' },
      { guidance: false, description: 'Place interactive elements inside an interactive list item; it creates nested click targets and confusing focus behavior.' },
      { guidance: false, description: 'Use a list for a single item or for laying out unrelated content; lists imply a meaningful collection.' },
      { guidance: false, description: 'Mix clickable and non-clickable items in the same list without clear visual distinction.' },
    ],
    anatomy: [
      {name: 'List title', required: true, description: 'Heading that labels the list.'},
      {name: 'Description', required: false, description: 'Supplementary text below the title.'},
      {name: 'List items', required: true, description: 'Individual entries, which may include icons or images.'},
      {name: 'Item description', required: false, description: 'Additional detail for an individual list item.'},
    ],
  },
};
/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A vertical collection of items with consistent spacing, dividers, and optional markers. Supports headers, icons, avatars, badges, and interactive items with click or link behavior. Use it to display ordered or unordered groups of related content.',
    bestPractices: [
      { guidance: true, description: 'Provide a header to label the list and give context to screen readers.' },
      { guidance: true, description: 'Use start and end content slots to add icons, avatars, or badges to each item.' },
      { guidance: false, description: 'Place interactive elements inside an interactive list item; it creates nested click targets and confusing focus behavior.' },
      { guidance: false, description: 'Use a list for a single item or for laying out unrelated content; lists imply a meaningful collection.' },
      { guidance: false, description: 'Mix clickable and non-clickable items in the same list without clear visual distinction.' },
    ],
    anatomy: [
      {name: 'List title', required: true, description: 'Heading that labels the list.'},
      {name: 'Description', required: false, description: 'Supplementary text below the title.'},
      {name: 'List items', required: true, description: 'Individual entries, which may include icons or images.'},
      {name: 'Item description', required: false, description: 'Additional detail for an individual list item.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Vertical list for rendering item collections w/ consistent spacing, dividers, marker styles. Composition model: XDSList wraps XDSListItem sub-components.',
  usage: {
    description:
      'A vertical collection of items with consistent spacing, dividers, and optional markers. Supports headers, icons, avatars, badges, and interactive items with click or link behavior. Use it to display ordered or unordered groups of related content.',
    bestPractices: [
      { guidance: true, description: 'Provide a header to label the list and give context to screen readers.' },
      { guidance: true, description: 'Use start and end content slots to add icons, avatars, or badges to each item.' },
      { guidance: false, description: 'Place interactive elements inside an interactive list item; it creates nested click targets and confusing focus behavior.' },
      { guidance: false, description: 'Use a list for a single item or for laying out unrelated content; lists imply a meaningful collection.' },
      { guidance: false, description: 'Mix clickable and non-clickable items in the same list without clear visual distinction.' },
    ],
    anatomy: [
      {name: 'List title', required: true, description: 'Heading that labels the list.'},
      {name: 'Description', required: false, description: 'Supplementary text below the title.'},
      {name: 'List items', required: true, description: 'Individual entries, which may include icons or images.'},
      {name: 'Item description', required: false, description: 'Additional detail for an individual list item.'},
    ],
  },
};
