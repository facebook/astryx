// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Citation',
  displayName: 'Citation',
  group: 'Citation',
  category: 'Content',

  usage: {
    description:
      'Citations display inline references to external sources. Use them to attribute information within AI-generated responses, articles, or anywhere provenance and source links are needed.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use the label variant when the source title adds meaningful context for the reader.',
      },
      {
        guidance: true,
        description:
          'Use the number variant for compact inline references within body text, like footnotes.',
      },
      {
        guidance: false,
        description:
          'Mix label and number variants in the same paragraph. Pick one style per context for visual consistency.',
      },
    ],
    anatomy: [
      {
        name: 'Container',
        required: true,
        description:
          'The interactive wrapper — renders as an anchor when a URL is provided, or a span otherwise.',
      },
      {
        name: 'Icon',
        required: false,
        description:
          'An optional favicon or source icon displayed before the label text. Only available in the label variant.',
      },
      {
        name: 'Label text',
        required: false,
        description:
          'The source title, truncated with ellipsis when it exceeds the max width. Shown in the label variant.',
      },
      {
        name: 'Number',
        required: false,
        description:
          'The citation index displayed as a superscript badge. Shown in the number variant.',
      },
    ],
  },

  props: [
    {
      name: 'source',
      type: 'XDSCitationSource',
      description:
        'The citation source object containing title, url, and optional icon.',
      required: true,
    },
    {
      name: 'number',
      type: 'number',
      description: 'The display index for this citation.',
      required: true,
    },
    {
      name: 'variant',
      type: "'label' | 'number'",
      description:
        'Display style — a label chip showing the source title or a compact numbered badge.',
      default: "'label'",
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Inline reference to external source. Attribute info in AI responses, articles, or anywhere provenance needed.',
  usage: {
    description:
      'Inline reference to external source. Attribute info in AI responses, articles, or anywhere provenance needed.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use label variant when source title adds meaningful context.',
      },
      {
        guidance: true,
        description:
          'Use number variant for compact inline references in body text, like footnotes.',
      },
      {
        guidance: false,
        description:
          'Mix label and number variants in same paragraph. Pick one style per context.',
      },
    ],
  },
  propDescriptions: {
    source: 'citation source object with title, url, optional icon.',
    number: 'display index for this citation.',
    variant: 'display style: label chip with source title or compact numbered badge.',
  },
};
