// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useCombobox',
  displayName: 'useCombobox',
  group: 'Selector',
  keywords: [
    'combobox',
    'listbox',
    'select',
    'dropdown',
    'highlight',
    'active option',
    'aria-activedescendant',
    'keyboard',
    'arrow keys',
    'headless',
    'apg',
    'accessibility',
    'a11y',
  ],
  params: [
    {
      name: 'options',
      type: 'UseComboboxOptions',
      description: 'Configuration object.',
      required: true,
    },
    {
      name: 'options.selectableItems',
      type: 'SelectorOptionData[]',
      description:
        'The options in the same order as they render. Options with `disabled` cannot be picked and are skipped while moving through the open list; ArrowDown or ArrowUp that opens the list still lands on the first or last option.',
      required: true,
    },
    {
      name: 'options.isOpen',
      type: 'boolean',
      description: 'Whether the list is shown. The caller owns this state.',
      required: true,
    },
    {
      name: 'options.onOpen',
      type: '() => unknown',
      description:
        'Called to show the list. Return `false` to refuse; the hook then leaves the highlight alone.',
      required: true,
    },
    {
      name: 'options.onClose',
      type: '() => void',
      description: 'Called when the hook hides the list; the hook resets the highlight first. When the caller closes the list itself (an outside press, say), it should also call `setHighlightedIndex(-1)`.',
      required: true,
    },
    {
      name: 'options.listboxId',
      type: 'string',
      description:
        "The listbox element's id. Option ids are derived from it through `getItemId`.",
      required: true,
    },
    {
      name: 'options.value',
      type: 'string',
      description:
        'The selected value. Without search, opening by a press, Enter or Space highlights it, or the first option when nothing is selected; ArrowDown and ArrowUp open on the first and last option.',
    },
    {
      name: 'options.onSelect',
      type: '(value: string) => void',
      description:
        'Called with the picked value. Picking also closes the list.',
    },
    {
      name: 'options.onClear',
      type: '() => void',
      description:
        'Clears the value. When provided, Delete or Backspace on the closed control clears it, so clearing is not pointer-only. Ignored while the list is open or with `hasSearch`.',
    },
    {
      name: 'options.hasSearch',
      type: 'boolean',
      description:
        'Whether the list has its own search field. Space then types instead of picking, opening by a press or Enter does not pre-highlight (ArrowDown and ArrowUp still open on the first and last option), and printable keys on the closed control go to `onSearchSeed`.',
      default: 'false',
    },
    {
      name: 'options.onSearchSeed',
      type: '(char: string) => void',
      description:
        'With `hasSearch`, receives each printable character except Space typed while the control has focus, opening the list first when it is closed, so type-to-find needs no separate open step.',
    },
    {
      name: 'options.isDisabled',
      type: 'boolean',
      description: 'Whether the control ignores clicks and keys.',
      default: 'false',
    },
  ],
  returns: [
    {
      name: 'highlightedIndex',
      type: 'number',
      description:
        'Index of the active option, or -1 when none is active. With `hasSearch`, opening by a press or Enter does not set one, so it stays -1 after the hook's own closes; ArrowDown and ArrowUp still open on the first or last option. Render it as the active option and name it in `aria-activedescendant` only while it points at a rendered option.',
    },
    {
      name: 'setHighlightedIndex',
      type: '(index: number) => void',
      description:
        'Sets the active option, for example from a filter that changes the options.',
    },
    {
      name: 'getItemId',
      type: '(index: number) => string',
      description:
        "The id to render on the option at `index`. Set the control's `aria-activedescendant` to `isOpen && highlightedIndex >= 0 && highlightedIndex < selectableItems.length ? getItemId(highlightedIndex) : undefined`, so it never names an option that does not exist, including in an empty list.",
    },
    {
      name: 'onTriggerClick',
      type: '() => void',
      description: 'Toggles the list from a press on the control.',
    },
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description:
        'Key handler for the control that keeps focus. ArrowDown and ArrowUp open the list or move the active option; Enter (and Space without search) picks it or opens the list; Escape and Tab close it; Home, End, PageUp and PageDown jump to the first or last option. An editable control that keeps Home and End for the caret does not pass them to this handler, as CommandPalette does.',
    },
    {
      name: 'onItemSelect',
      type: '(item: SelectorOptionData) => void',
      description: 'Picks an option from a press on it, then closes the list.',
    },
    {
      name: 'onItemMouseEnter',
      type: '(item: SelectorOptionData, index: number) => void',
      description:
        'Makes the hovered option active without scrolling the list or moving focus.',
    },
  ],
  usage: {
    description:
      'Tracks the active option of a single-select combobox and handles its keys, while DOM focus stays on the control. It powers Selector and CommandPalette; use it to build a combobox those components do not cover. It renders nothing and sets no attributes: the caller renders the control, the listbox and the options, and wires `role`, `aria-expanded`, `aria-controls` and `aria-activedescendant` from what it returns.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Render each option with `id={getItemId(index)}` and set the control's `aria-activedescendant` only while `isOpen` and `highlightedIndex` points at a rendered option, as CommandPalette does.",
      },
      {
        guidance: true,
        description:
          "For type-to-select without a search field, run useTypeahead's handler first and fall through to this `onKeyDown` when it returns false, as Selector does.",
      },
      {
        guidance: true,
        description:
          'Announce the number of results through useAnnounce when the options change for a new query.',
      },
      {
        guidance: false,
        description:
          'Move DOM focus onto the options; the active option is announced through `aria-activedescendant` while focus stays on the control.',
      },
    ],
  },
  relatedComponents: ['Selector', 'CommandPalette'],
  relatedHooks: ['useMultiCombobox', 'useTypeahead', 'useAnnounce'],
  importPath: '@astryxdesign/core/Selector',
  category: 'focus',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Single-select combobox state + keys; focus stays on control. Powers Selector / CommandPalette. Renders nothing, sets no attrs: caller renders control / listbox / options and wires role, aria-expanded, aria-controls, aria-activedescendant.',
  paramDescriptions: {
    options: 'config.',
    'options.selectableItems':
      'options in render order; disabled ones not pickable, skipped while moving in open list (ArrowDown/Up opening still lands first / last).',
    'options.isOpen': 'list shown; caller owns state.',
    'options.onOpen':
      'show list; return false to refuse (highlight untouched).',
    'options.onClose': 'hook hides list; resets highlight first. caller closing itself (outside press): also setHighlightedIndex(-1).',
    'options.listboxId': 'listbox id; option ids derive from it (getItemId).',
    'options.value':
      'selected value; w/o search, press / Enter / Space opening highlights it (else first); ArrowDown/Up open on first / last.',
    'options.onSelect': 'called w/ picked value; picking closes.',
    'options.onClear':
      'clears value; Delete / Backspace on closed control. ignored when open or hasSearch.',
    'options.hasSearch':
      'list has own search field: Space types, press / Enter opening does not pre-highlight (ArrowDown/Up still first / last), printable keys on closed control -> onSearchSeed.',
    'options.onSearchSeed':
      'w/ hasSearch, each printable char except Space typed while control focused (opens first if closed).',
    'options.isDisabled': 'ignore clicks + keys.',
  },
  returnDescriptions: {
    highlightedIndex:
      'active option index, -1 = none. hasSearch: press / Enter opening sets none (stays -1 after hook closes); ArrowDown/Up still first / last. name in aria-activedescendant only when it points at a rendered option.',
    setHighlightedIndex: 'set active option (e.g. after filtering).',
    getItemId:
      'id for option at index; aria-activedescendant = isOpen && highlightedIndex >= 0 && highlightedIndex < selectableItems.length ? getItemId(highlightedIndex) : undefined (empty list safe).',
    onTriggerClick: 'toggle list from a press on control.',
    onKeyDown:
      'control keydown: ArrowDown/Up open or move; Enter (Space w/o search) picks or opens; Escape / Tab close; Home / End / PageUp / PageDown jump. editable control keeping Home / End for caret: do not pass them.',
    onItemSelect: 'pick from a press, then close.',
    onItemMouseEnter: 'hover makes option active; no scroll, no focus move.',
  },
  usage: {
    description:
      'Headless single-select combobox: active option + keys, focus stays on control. Caller renders + wires ARIA.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Option id = getItemId(index); aria-activedescendant only while open and highlightedIndex points at a rendered option.',
      },
      {
        guidance: true,
        description:
          'Type-to-select w/o search: run useTypeahead first, fall through when it returns false.',
      },
      {
        guidance: true,
        description: 'Announce result count via useAnnounce on new query.',
      },
      {
        guidance: false,
        description: 'Move DOM focus onto options; use aria-activedescendant.',
      },
    ],
  },
};
