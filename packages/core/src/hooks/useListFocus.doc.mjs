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
      description: "navigation orientation. 'horizontal' uses ArrowLeft/ArrowRight, 'vertical' uses ArrowUp/ArrowDown.",
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

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description:
    'Manages keyboard navigation within linear list following WAI-ARIA menu/listbox/toolbar patterns. Supports arrow key navigation (vertical / horizontal), Home/End for boundaries, optional wrap-around, Escape to close. Suitable for dropdown menus, toolbars, any 1D focusable list.',
  paramDescriptions: {
    options: 'config for list focus behavior. All fields optional.',
    'options.itemSelector': 'selector for focusable items in list.',
    'options.wrap': 'whether arrow navigation wraps around at ends.',
    'options.onEscape': 'callback when Escape key pressed (e.g. close menu).',
    'options.orientation': "navigation orientation. 'horizontal' uses ArrowLeft/ArrowRight, 'vertical' uses ArrowUp/ArrowDown.",
  },
  returnDescriptions: {
    listRef: 'ref to attach to list container element.',
    handleKeyDown: 'key down handler for list container.',
    focusItem: 'focus specific item by index (clamped to valid range).',
    focusFirst: 'focus first focusable item in list.',
    focusLast: 'focus last focusable item in list.',
  },
  usage: {
    description:
      'Manages keyboard navigation within linear list following WAI-ARIA menu/listbox/toolbar patterns. Supports arrow key navigation (vertical / horizontal), Home/End for boundaries, optional wrap-around, Escape to close. Suitable for dropdown menus, toolbars, any 1D focusable list.',
    bestPractices: [
      { guidance: true, description: "Set orientation to 'horizontal' for toolbars + tab bars, 'vertical' for dropdown menus." },
      { guidance: true, description: 'Provide onEscape callback for menus/dropdowns to return focus to trigger.' },
      { guidance: false, description: 'Use for 2D grid navigation — prefer useGridFocus for grids + calendars.' },
    ],
  },
};
