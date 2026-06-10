// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useClickableContainer',
  displayName: 'useClickableContainer',
  keywords: ['click', 'container', 'card', 'pressable', 'interactive', 'nested', 'link', 'button', 'delegate'],
  params: [
    {
      name: 'options',
      type: 'UseClickableContainerOptions',
      description: 'Configuration object for the clickable container.',
      required: true,
    },
    {
      name: 'options.containerRef',
      type: 'RefObject<HTMLElement | null>',
      description: 'Ref to the outer container element.',
      required: true,
    },
    {
      name: 'options.interactiveRef',
      type: 'RefObject<HTMLElement | null>',
      description: 'Ref to the primary interactive element inside (link, button). If no onClick or href is provided, clicks are proxied to this element.',
      required: false,
    },
    {
      name: 'options.onClick',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: 'Click handler fired when the container surface (not a nested interactive element) is clicked.',
      required: false,
    },
    {
      name: 'options.href',
      type: 'string',
      description: 'Navigation URL. When provided, clicking the container navigates to this URL.',
      required: false,
    },
    {
      name: 'options.target',
      type: 'string',
      description: "Link target (e.g., '_blank'). Used with href for navigation behavior.",
      required: false,
    },
    {
      name: 'options.disabled',
      type: 'boolean',
      description: 'Whether the container is disabled.',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'onClick',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: 'Click handler to attach to the container element.',
    },
    {
      name: 'onMouseUp',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: 'Mouse up handler to attach to the container (handles middle-click navigation for href).',
    },
  ],
  usage: {
    description:
      'Makes a container element clickable while preserving nested interactive element behavior. Solves the "nested interactive elements" problem: when a card is clickable but contains buttons/links, clicking those should NOT trigger the card\'s action. Detects interactive ancestors between the click target and the container, and ignores text selections. Supports href navigation (including middle-click and Ctrl/Cmd+click for new tabs).',
    bestPractices: [
      { guidance: true, description: 'Attach both onClick and onMouseUp to the container element for full click handling including middle-click.' },
      { guidance: true, description: 'Use inside XDSClickableCard or XDSSelectableCard for the standard card interaction pattern.' },
      { guidance: false, description: 'Use when the entire container is a single interactive element — just use a <button> or <a> directly.' },
    ],
  },
  relatedComponents: ['ClickableCard', 'SelectableCard'],
  relatedHooks: ['useInputContainer'],
  importPath: '@xds/core/hooks',
  category: 'interaction',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description:
    'Makes container element clickable while preserving nested interactive element behavior. Solves "nested interactive elements" problem: when card is clickable but contains buttons/links, clicking those must NOT trigger card\'s action. Detects interactive ancestors between click target + container, ignores text selections. Supports href navigation (incl. middle-click + Ctrl/Cmd+click for new tabs).',
  paramDescriptions: {
    options: 'config for clickable container.',
    'options.containerRef': 'ref to outer container element.',
    'options.interactiveRef': 'ref to primary interactive element inside (link, button). If no onClick / href provided, clicks proxied to this element.',
    'options.onClick': 'click handler fired when container surface (not nested interactive element) clicked.',
    'options.href': 'navigation URL. When provided, clicking container navigates to it.',
    'options.target': "link target (e.g. '_blank'). Used w/ href for navigation behavior.",
    'options.disabled': 'whether container disabled.',
  },
  returnDescriptions: {
    onClick: 'click handler for container element.',
    onMouseUp: 'mouse up handler for container (handles middle-click navigation for href).',
  },
  usage: {
    description:
      'Makes container element clickable while preserving nested interactive element behavior. Solves "nested interactive elements" problem: when card is clickable but contains buttons/links, clicking those must NOT trigger card\'s action. Detects interactive ancestors between click target + container, ignores text selections. Supports href navigation (incl. middle-click + Ctrl/Cmd+click for new tabs).',
    bestPractices: [
      { guidance: true, description: 'Attach both onClick + onMouseUp to container element for full click handling incl. middle-click.' },
      { guidance: true, description: 'Use inside XDSClickableCard / XDSSelectableCard for standard card interaction pattern.' },
      { guidance: false, description: 'Use when entire container is single interactive element — just use <button> / <a> directly.' },
    ],
  },
};
