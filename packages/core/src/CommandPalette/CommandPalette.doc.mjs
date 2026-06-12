// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'CommandPalette',
  displayName: 'Command Palette',
  group: 'CommandPalette',
  category: 'Overlay',
  keywords: [
    'command',
    'spotlight',
    'launcher',
    'omnibox',
    'quicksearch',
    'palette',
    'finder',
    'search',
    'modal',
    'dialog',
    'navigation',
  ],
  description: 'Root component. Manages open state, search, keyboard navigation, and composition slots.',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the command palette dialog is visible.',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Called when the palette visibility changes.',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'XDSSearchSource<T>',
      description: 'Search source providing items via search(query) and bootstrap(). Use createStaticSource for static lists.',
      required: true,
    },
    {
      name: 'input',
      type: 'ReactNode',
      description: 'Input slot. Defaults to XDSCommandPaletteInput with standard behavior.',
      default: '<XDSCommandPaletteInput />',
      slotElements: [
        {
          __element: 'XDSTextInput',
          props: {
            label: 'Input',
            placeholder: 'Type here...',
          },
        },
      ],
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description: 'Footer slot. Defaults to XDSCommandPaletteFooter showing keyboard hints.',
      default: '<XDSCommandPaletteFooter />',
      slotElements: [
        {
          __element: 'XDSText',
          props: {
            type: 'body',
          },
          children: 'Footer content',
        },
      ],
    },
    {
      name: 'renderItem',
      type: '(item: T, isSelected: boolean) => ReactNode',
      description: 'Per-item render function. Auto-grouping by auxiliaryData.group is preserved. When omitted, renders label text.',
    },
    {
      name: 'emptySearchText',
      type: 'ReactNode',
      description: 'Content shown when a search query returns no results.',
      default: "'No results'",
    },
    {
      name: 'emptyBootstrapText',
      type: 'ReactNode',
      description: 'Content shown when there is no search query and bootstrap() returns nothing.',
      default: "'Type to search'",
    },
    {
      name: 'value',
      type: 'string',
      description: 'Controlled selected value for picker mode.',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: 'Called when the selected value changes in picker mode.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the command palette dialog.',
      default: "'Command palette'",
    },
    {
      name: 'width',
      type: 'number | string',
      description: 'Width of the dialog.',
      default: '640',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description: 'Maximum height of the dialog.',
      default: '480',
    },
    {
      name: 'isInline',
      type: 'boolean',
      description: 'Renders command palette content inline without modal behavior. Automatically disables auto-focus on the input. For documentation previews and showcases only.',
      default: 'false',
    },
  ],
  components: [
    {name: 'XDSCommandPaletteInput'},
    {name: 'XDSCommandPaletteList'},
    {name: 'XDSCommandPaletteItem'},
    {name: 'XDSCommandPaletteGroup'},
    {name: 'XDSCommandPaletteFooter'},
    {name: 'XDSCommandPaletteEmpty'},
  ],
  theming: {
    targets: [
      {className: 'xds-command-palette-footer'},
      {className: 'xds-command-palette-group'},
      {className: 'xds-command-palette-input'},
      {className: 'xds-command-palette-item'},
      {className: 'xds-command-palette-list'},
    ],
  },
  usage: {
    description: 'CommandPalette is a searchable dialog for quick access to commands, navigation, and actions. Use it as a keyboard-driven launcher powered by XDSSearchSource for filtering and selection.',
    bestPractices: [
      { guidance: true, description: 'Provide a searchSource with bootstrap results so users see useful options before typing.' },
      { guidance: true, description: 'Use auxiliaryData.group on items to automatically organize results into labeled sections.' },
      { guidance: false, description: 'Use CommandPalette for simple dropdowns or menus; use XDSMenu or XDSSelector for inline selections.' },
      { guidance: false, description: 'Add too many groups or items; curate results to keep the palette fast and scannable.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: 'CommandPalette is a searchable dialog for quick access to commands, navigation, and actions. Use it as a keyboard-driven launcher powered by XDSSearchSource for filtering and selection.',
    bestPractices: [
      { guidance: true, description: 'Provide a searchSource with bootstrap results so users see useful options before typing.' },
      { guidance: true, description: 'Use auxiliaryData.group on items to automatically organize results into labeled sections.' },
      { guidance: false, description: 'Use CommandPalette for simple dropdowns or menus; use XDSMenu or XDSSelector for inline selections.' },
      { guidance: false, description: 'Add too many groups or items; curate results to keep the palette fast and scannable.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'searchSource-driven command palette dialog; filtering, keyboard nav, grouping, selection; same XDSSearchSource interface as XDSTypeahead',
  usage: {
    description: 'CommandPalette is a searchable dialog for quick access to commands, navigation, and actions. Use it as a keyboard-driven launcher powered by XDSSearchSource for filtering and selection.',
    bestPractices: [
      { guidance: true, description: 'Provide a searchSource with bootstrap results so users see useful options before typing.' },
      { guidance: true, description: 'Use auxiliaryData.group on items to automatically organize results into labeled sections.' },
      { guidance: false, description: 'Use CommandPalette for simple dropdowns or menus; use XDSMenu or XDSSelector for inline selections.' },
      { guidance: false, description: 'Add too many groups or items; curate results to keep the palette fast and scannable.' },
    ],
  },
};
