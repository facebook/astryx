// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'MobileTokenizer',
  displayName: 'Mobile Tokenizer',
  group: 'MobileTokenizer',
  category: 'Form Controls',
  keywords: ['tokenizer', 'mobile', 'touch', 'bottom sheet', 'tags', 'chips'],
  props: [
    {name: 'label', type: 'string', description: 'Field label and sheet heading.', required: true},
    {name: 'searchSource', type: 'SearchSource<T>', description: 'Core Typeahead search source (search + bootstrap).', required: true},
    {name: 'value', type: 'T[]', description: 'Selected items (Core SearchableItem).', required: true},
    {name: 'onChange', type: '(items: T[], change: MobileTokenizerChange<T>) => void', description: 'Mirrors Core Tokenizer: single-item add/create/remove, or reorder.', required: true},
    {name: 'placeholder', type: 'string', description: 'Trigger text when nothing is selected.'},
    {name: 'hasCreate', type: 'boolean', description: 'Offer Create "<query>" for unmatched free text.', default: 'false'},
    {name: 'maxEntries', type: 'number', description: 'Cap selections; add rows disable at the cap.'},
    {name: 'renderItem', type: '(item: T) => ReactNode', description: 'Custom add-sheet row content.'},
  ],
  usage: {
    description:
      'Lab prototype for trying the touch Tokenizer flow: tap the field to open the manage sheet (review, remove, Clear all, Add item), tap Add item for the stacked search sheet (results above, filter + Done in the bottom row above the keyboard, tap +/check to toggle immediately).',
    bestPractices: [
      {guidance: true, description: 'Try this in Lab/canary to validate the flow; graduate via Core Tokenizer presentation="adaptive" when it ships.'},
      {guidance: false, description: 'Do not ship stable product on this Lab API; it has no theming, i18n, or spec contract yet.'},
    ],
    anatomy: [
      {name: 'Trigger field', required: true, description: 'Button showing tokens as a summary, with chevron.'},
      {name: 'Manage sheet', required: true, description: 'Selected rows with remove, Clear all footer, Add item.'},
      {name: 'Add sheet', required: true, description: 'Stacked sheet: result rows with +/check toggles, bottom filter + Done row.'},
    ],
  },
};
