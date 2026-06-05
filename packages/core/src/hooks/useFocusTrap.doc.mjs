// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useFocusTrap',
  displayName: 'useFocusTrap',
  keywords: ['focus', 'trap', 'modal', 'dialog', 'accessibility', 'a11y', 'keyboard', 'tab', 'escape', 'wai-aria'],
  params: [
    {
      name: 'options',
      type: 'UseFocusTrapOptions',
      description: 'Configuration object for the focus trap.',
      required: true,
    },
    {
      name: 'options.isActive',
      type: 'boolean',
      description: 'Whether the focus trap is currently active.',
      required: true,
    },
    {
      name: 'options.onEscape',
      type: '() => void',
      description: 'Callback when Escape key is pressed inside the trapped container.',
      required: false,
    },
  ],
  returns: [
    {
      name: 'containerRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: 'Ref to attach to the container element that should trap focus.',
    },
    {
      name: 'focusFirst',
      type: '() => void',
      description: 'Focuses the first focusable element inside the container.',
    },
  ],
  usage: {
    description:
      'Traps focus within a container element following the WAI-ARIA dialog focus trap pattern. Listens to focus events on the document and redirects focus back into the container if it escapes via keyboard navigation. Handles both Tab and Shift+Tab wrapping. Mouse clicks outside the container are not intercepted — use a light-dismiss handler for that.',
    bestPractices: [
      { guidance: true, description: 'Call focusFirst() when opening a dialog/modal to move focus into the trapped region.' },
      { guidance: true, description: 'Provide an onEscape callback to close the dialog when Escape is pressed.' },
      { guidance: false, description: 'Use on non-modal content like tooltips or dropdowns — those need light-dismiss, not focus trapping.' },
    ],
  },
  relatedComponents: ['Dialog', 'DatePicker'],
  relatedHooks: ['useListFocus', 'useScrollLock'],
  importPath: '@xds/core/hooks',
  category: 'focus',
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Traps focus within container per WAI-ARIA dialog pattern; listens to document focus events + redirects focus back if it escapes via keyboard. Handles Tab + Shift+Tab wrapping. Mouse clicks outside not intercepted — use light-dismiss handler instead.',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Call focusFirst() when opening dialog/modal to move focus into trapped region.' },
      { guidance: true, description: 'Provide onEscape callback to close dialog when Escape pressed.' },
      { guidance: false, description: 'Use on non-modal content like tooltips/dropdowns — those need light-dismiss, not focus trapping.' },
    ],
  },
  paramDescriptions: {
    options: 'Config object for focus trap **(required)**',
    'options.isActive': 'Focus trap currently active **(required)**',
    'options.onEscape': 'Callback when Escape pressed inside trapped container',
  },
  returnDescriptions: {
    containerRef: 'Ref to attach to container element that traps focus',
    focusFirst: 'Focuses first focusable element inside container',
  },
};
