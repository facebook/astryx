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
      'Traps focus within a container element following the WAI-ARIA dialog focus trap pattern. Listens to focus events on the document and redirects focus back into the container if it escapes via keyboard navigation. Handles both Tab and Shift+Tab wrapping. When the trap deactivates or unmounts, focus is restored to the element that was focused before activation, unless focus was already moved elsewhere. Mouse clicks outside the container are not intercepted; use a light-dismiss handler for that.',
    bestPractices: [
      { guidance: true, description: 'Call focusFirst() when opening a dialog/modal to move focus into the trapped region.' },
      { guidance: true, description: 'Provide an onEscape callback to close the dialog when Escape is pressed.' },
      { guidance: true, description: 'Rely on the built-in focus restoration on close; only add your own onHide focus handling when you need to send focus somewhere other than the previously-focused element.' },
      { guidance: false, description: 'Use on non-modal content like tooltips or dropdowns; those need light-dismiss, not focus trapping.' },
    ],
  },
  relatedComponents: ['Dialog', 'DatePicker'],
  relatedHooks: ['useListFocus', 'useScrollLock'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description:
    'Traps focus within container element following WAI-ARIA dialog focus trap pattern. Listens to document focus events + redirects focus back into container if it escapes via keyboard navigation. Handles both Tab + Shift+Tab wrapping. Mouse clicks outside container not intercepted; use light-dismiss handler for that.',
  paramDescriptions: {
    options: 'config for focus trap.',
    'options.isActive': 'whether focus trap currently active.',
    'options.onEscape': 'callback when Escape key pressed inside trapped container.',
  },
  returnDescriptions: {
    containerRef: 'ref to attach to container element that should trap focus.',
    focusFirst: 'focuses first focusable element inside container.',
  },
  usage: {
    description:
      'Traps focus within container element following WAI-ARIA dialog focus trap pattern. Listens to document focus events + redirects focus back into container if it escapes via keyboard navigation. Handles both Tab + Shift+Tab wrapping. On deactivate/unmount, restores focus to the element focused before activation unless focus already moved elsewhere. Mouse clicks outside container not intercepted; use light-dismiss handler for that.',
    bestPractices: [
      { guidance: true, description: 'Call focusFirst() when opening dialog/modal to move focus into trapped region.' },
      { guidance: true, description: 'Provide onEscape callback to close dialog when Escape pressed.' },
      { guidance: true, description: 'Rely on built-in focus restoration on close; add own onHide focus handling only to send focus somewhere other than previously-focused element.' },
      { guidance: false, description: 'Use on non-modal content like tooltips / dropdowns; those need light-dismiss, not focus trapping.' },
    ],
  },
};
