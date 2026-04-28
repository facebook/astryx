/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useGridFocus',
  keywords: ['grid', 'focus', 'keyboard', 'navigation', 'arrow', 'calendar', 'a11y', 'wai-aria', 'cells'],
  params: [
    {
      name: 'options',
      type: 'UseGridFocusOptions',
      description: 'Configuration object for grid focus behavior.',
      required: true,
    },
    {
      name: 'options.columns',
      type: 'number',
      description: 'Number of columns in the grid. Used for up/down navigation (moves by this many cells).',
      required: true,
    },
    {
      name: 'options.cellSelector',
      type: 'string',
      description: 'Selector for focusable cells within the grid.',
      default: "'button:not([disabled]), [tabindex]:not([tabindex=\"-1\"])'",
      required: false,
    },
    {
      name: 'options.onNavigateBefore',
      type: '(column: number, offset: number) => void',
      description: 'Callback when navigation would go before the first cell. Receives the column index and offset (1 for horizontal, columns for vertical).',
      required: false,
    },
    {
      name: 'options.onNavigateAfter',
      type: '(column: number, offset: number) => void',
      description: 'Callback when navigation would go after the last cell. Receives the column index and offset.',
      required: false,
    },
    {
      name: 'options.onPageUp',
      type: '() => void',
      description: 'Callback for Page Up key (e.g., navigate to previous month in calendars).',
      required: false,
    },
    {
      name: 'options.onPageDown',
      type: '() => void',
      description: 'Callback for Page Down key (e.g., navigate to next month in calendars).',
      required: false,
    },
  ],
  returns: [
    {
      name: 'gridRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: 'Ref to attach to the grid container element.',
    },
    {
      name: 'handleKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description: 'Key down handler to attach to the grid container.',
    },
    {
      name: 'focusCell',
      type: '(index: number) => void',
      description: 'Focus a specific cell by index (clamped to valid range).',
    },
    {
      name: 'focusFirst',
      type: '() => void',
      description: 'Focus the first focusable cell in the grid.',
    },
    {
      name: 'focusLast',
      type: '() => void',
      description: 'Focus the last focusable cell in the grid.',
    },
  ],
  usage: {
    description:
      'Manages keyboard navigation within a 2D grid following the WAI-ARIA grid pattern. Supports arrow keys for cell-to-cell navigation, Home/End for row boundaries, Ctrl+Home/Ctrl+End for grid boundaries, and Page Up/Down for custom callbacks (e.g., month navigation in calendars). Boundary navigation callbacks allow seamless cross-grid navigation.',
    bestPractices: [
      { guidance: true, description: 'Use for calendar date grids — wire onPageUp/onPageDown to month navigation and onNavigateBefore/onNavigateAfter for cross-month arrow key navigation.' },
      { guidance: true, description: 'Attach both gridRef and handleKeyDown to the grid container element.' },
      { guidance: false, description: 'Use for simple linear lists — prefer useListFocus for 1D navigation.' },
    ],
  },
  relatedComponents: ['Calendar'],
  relatedHooks: ['useListFocus', 'useFocusTrap'],
  importPath: '@xds/core/hooks',
  category: 'focus',
};
