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
      type: "'horizontal' | 'vertical' | 'both'",
      description: "Navigation orientation. 'horizontal' uses ArrowLeft/ArrowRight, 'vertical' uses ArrowUp/ArrowDown, 'both' accepts all four arrows.",
      default: "'vertical'",
      required: false,
    },
    {
      name: 'options.hasHomeEnd',
      type: 'boolean',
      description: 'Whether Home/End jump to the first/last enabled item.',
      default: 'true',
      required: false,
    },
    {
      name: 'options.isRtl',
      type: 'boolean',
      description: 'Whether the list is in a right-to-left context. When true, ArrowLeft/ArrowRight are swapped for horizontal navigation so it follows visual direction.',
      default: 'false',
      required: false,
    },
    {
      name: 'options.hasRovingTabIndex',
      type: 'boolean',
      description: 'Opt into roving-tabindex ownership: the hook stamps a single tab stop (one item tabindex="0", the rest -1), repairs it as items mount/unmount or toggle disabled, and moves it with arrow navigation. When false, the hook only moves focus and never touches tabindex.',
      default: 'false',
      required: false,
    },
    {
      name: 'options.hasCaretGuard',
      type: 'boolean',
      description: "When true, arrow keys are not stolen from a nested text input/textarea whose caret is not at the boundary in the direction of travel (or that has a selection), and are never stolen from a nested contenteditable (rich-text editor / chat composer). Preserves inline text editing within the list.",
      default: 'false',
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
      name: 'handleFocus',
      type: '(e: React.FocusEvent) => void',
      description: 'Focus handler for the container. Keeps the roving tab stop in sync when hasRovingTabIndex is enabled; a no-op otherwise, so it is always safe to attach.',
    },
    {
      name: 'focusItem',
      type: '(index: number) => void',
      description: 'Focus a specific item by index (clamped to valid range).',
    },
    {
      name: 'focusFirst',
      type: '() => boolean',
      description: 'Focus the first enabled item. Returns true when an item was focused.',
    },
    {
      name: 'focusLast',
      type: '() => boolean',
      description: 'Focus the last enabled item. Returns true when an item was focused.',
    },
  ],
  usage: {
    description:
      'Manages keyboard navigation within a linear list following WAI-ARIA menu/listbox/toolbar patterns. Supports arrow key navigation (vertical, horizontal, or both), Home/End for boundaries, optional wrap-around, RTL, and Escape to close. Opt into hasRovingTabIndex for composite widgets (toolbars, segmented controls, tab strips) that own a single tab stop. Suitable for dropdown menus, toolbars, and any 1D focusable list.',
    bestPractices: [
      { guidance: true, description: "Set orientation to 'horizontal' for toolbars and tab bars, 'vertical' for dropdown menus." },
      { guidance: true, description: 'Provide an onEscape callback for menus/dropdowns to return focus to the trigger.' },
      { guidance: true, description: 'Enable hasRovingTabIndex (and hasCaretGuard when the widget can contain text inputs) for toolbar-style composites that should be a single tab stop.' },
      { guidance: false, description: 'Use for 2D grid navigation; prefer useGridFocus for grids and calendars.' },
    ],
  },
  relatedComponents: ['TabMenu', 'Toolbar'],
  relatedHooks: ['useGridFocus', 'useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
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
    'options.orientation': "navigation orientation. 'horizontal' uses ArrowLeft/ArrowRight, 'vertical' uses ArrowUp/ArrowDown, 'both' accepts all four arrows.",
    'options.hasHomeEnd': 'whether Home/End jump to first/last enabled item.',
    'options.isRtl': 'when true, ArrowLeft/ArrowRight swap for horizontal nav (RTL).',
    'options.hasRovingTabIndex': 'opt into roving-tabindex ownership: hook stamps + repairs a single tab stop across items.',
    'options.hasCaretGuard': "when true, don't steal arrow keys from a nested text input/textarea mid-line or from a contenteditable.",
  },
  returnDescriptions: {
    listRef: 'ref to attach to list container element.',
    handleKeyDown: 'key down handler for list container.',
    handleFocus: 'focus handler; keeps roving tab stop in sync when hasRovingTabIndex is on (else no-op).',
    focusItem: 'focus specific item by index (clamped to valid range).',
    focusFirst: 'focus first enabled item; returns true when focused.',
    focusLast: 'focus last enabled item; returns true when focused.',
  },
  usage: {
    description:
      'Manages keyboard navigation within linear list following WAI-ARIA menu/listbox/toolbar patterns. Supports arrow key navigation (vertical / horizontal), Home/End for boundaries, optional wrap-around, Escape to close. Suitable for dropdown menus, toolbars, any 1D focusable list.',
    bestPractices: [
      { guidance: true, description: "Set orientation to 'horizontal' for toolbars + tab bars, 'vertical' for dropdown menus." },
      { guidance: true, description: 'Provide onEscape callback for menus/dropdowns to return focus to trigger.' },
      { guidance: true, description: 'Enable hasRovingTabIndex (+ hasCaretGuard when widget can contain text inputs) for toolbar-style composites that should be a single tab stop.' },
      { guidance: false, description: 'Use for 2D grid navigation; prefer useGridFocus for grids + calendars.' },
    ],
  },
};
