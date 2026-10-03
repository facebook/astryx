// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'MobileTokenizer',
  displayName: 'Mobile Tokenizer',
  group: 'MobileTokenizer',
  category: 'Form Controls',
  keywords: ['tokenizer', 'mobile', 'touch', 'bottom sheet', 'tags', 'chips'],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Field label and sheet heading.',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
      description: 'Core Typeahead search source (search + bootstrap).',
      required: true,
    },
    {
      name: 'value',
      type: 'T[]',
      description: 'Selected items (Core SearchableItem).',
      required: true,
    },
    {
      name: 'onChange',
      type: '(items: T[], change: MobileTokenizerChange<T>) => void',
      description:
        'Mirrors Core Tokenizer: single-item add/create/remove, or reorder.',
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Trigger text when nothing is selected.',
    },
    {
      name: 'hasCreate',
      type: 'boolean',
      description: 'Offer Create "<query>" for unmatched free text.',
      default: 'false',
    },
    {
      name: 'maxEntries',
      type: 'number',
      description: 'Cap selections; add rows disable at the cap.',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description:
        'Maximum source results retained; long lists render progressively in 50-item batches.',
      default: '10',
    },
  ],
  usage: {
    description:
      'Lab prototype for trying the touch Tokenizer flow: tap the field to open one searchable sheet where selected and available items share a full-row checkbox list. Selected items are grouped first when the sheet opens, while checkbox changes keep every existing row in place until the sheet closes; the latest selection is regrouped the next time it opens. Selected custom values stay in the list, and long result sets render progressively in 50-item batches. Custom text uses a trailing Add action, and guarded Clear all plus Done actions finish the unfiltered flow. The footer is hidden while searching.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Try this in Lab/canary to validate the flow; graduate via Core Tokenizer presentation="adaptive" when it ships.',
      },
      {
        guidance: false,
        description:
          'Do not ship stable product on this Lab API; it has no theming, i18n, or spec contract yet.',
      },
    ],
    anatomy: [
      {
        name: 'Trigger field',
        required: true,
        description: 'Button showing tokens as a summary.',
      },
      {
        name: 'Management sheet',
        required: true,
        description:
          'One searchable list with trailing checkboxes for existing items, a trailing Add action for custom text, and equal-width Clear all and Done footer actions when unfiltered. Clear all requires confirmation; the footer is hidden while searching.',
      },
    ],
  },
};
