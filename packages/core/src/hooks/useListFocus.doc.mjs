// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useListFocus',
  displayName: 'useListFocus',
  keywords: ['list', 'focus', 'keyboard', 'navigation', 'menu', 'toolbar', 'roving', 'tabindex', 'a11y', 'arrow', 'wai-aria'],
  params: [
    {
      name: 'options',
      type: 'UseListFocusOptions',
      description: 'Configuration object for list focus behavior. All fields are optional.',
      required: false,
    },
    {
      name: 'options.itemSelector',
      type: 'string',
      description: 'Selector for focusable items within the list.',
      default: "'[role=\"menuitem\"]'",
      required: false,
    },
    {
      name: 'options.wrap',
      type: 'boolean',
      description: 'Whether arrow navigation wraps around at the ends.',
      default: 'true',
      required: false,
    },
    {
      name: 'options.onEscape',
      type: '() => void',
      description: 'Callback when Escape key is pressed (e.g., close menu).',
      required: false,
    },
    {
      name: 'options.orientation',
      type: "'horizontal' | 'vertical'",
      description: "Navigation orientation. 'horizontal' uses ArrowLeft/ArrowRight, 'vertical' uses ArrowUp/ArrowDown.",
      default: "'vertical'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'listRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: 'Ref to attach to the list container element.',
    },
    {
      name: 'handleKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description: 'Key down handler to attach to the list container.',
    },
    {
      name: 'focusItem',
      type: '(index: number) => void',
      description: 'Focus a specific item by index (clamped to valid range).',
    },
    {
      name: 'focusFirst',
      type: '() => void',
      description: 'Focus the first focusable item in the list.',
    },
    {
      name: 'focusLast',
      type: '() => void',
      description: 'Focus the last focusable item in the list.',
    },
  ],
  usage: {
    description:
      'Manages keyboard navigation within a linear list following WAI-ARIA menu/listbox/toolbar patterns. Supports arrow key navigation (vertical or horizontal), Home/End for boundaries, optional wrap-around, and Escape to close. Suitable for dropdown menus, toolbars, and any 1D focusable list.',
    bestPractices: [
      { guidance: true, description: "Set orientation to 'horizontal' for toolbars and tab bars, 'vertical' for dropdown menus." },
      { guidance: true, description: 'Provide an onEscape callback for menus/dropdowns to return focus to the trigger.' },
      { guidance: false, description: 'Use for 2D grid navigation — prefer useGridFocus for grids and calendars.' },
    ],
  },
  relatedComponents: ['TabMenu', 'Toolbar'],
  relatedHooks: ['useGridFocus', 'useFocusTrap'],
  importPath: '@xds/core/hooks',
  category: 'focus',
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Keyboard nav for linear lists; WAI-ARIA menu/listbox/toolbar patterns. Arrow keys (vertical/horizontal), Home/End, optional wrap, Escape to close. For dropdown menus, toolbars + any 1D focusable list.',
  usage: {
    bestPractices: [
      { guidance: true, description: "Set orientation 'horizontal' for toolbars + tab bars, 'vertical' for dropdown menus." },
      { guidance: true, description: 'Provide onEscape for menus/dropdowns to return focus to trigger.' },
      { guidance: false, description: 'Use for 2D grid nav — prefer useGridFocus for grids + calendars.' },
    ],
  },
  paramDescriptions: {
    options: 'Config for list focus behavior; all fields optional.',
    'options.itemSelector': 'Selector for focusable items in list.',
    'options.wrap': 'Arrow nav wraps at ends.',
    'options.onEscape': 'Callback on Escape key (e.g., close menu).',
    'options.orientation': "Nav orientation; 'horizontal' = ArrowLeft/ArrowRight, 'vertical' = ArrowUp/ArrowDown.",
  },
  returnDescriptions: {
    listRef: 'Ref for list container element.',
    handleKeyDown: 'Key down handler for list container.',
    focusItem: 'Focus item by index (clamped to valid range).',
    focusFirst: 'Focus first focusable item.',
    focusLast: 'Focus last focusable item.',
  },
};
