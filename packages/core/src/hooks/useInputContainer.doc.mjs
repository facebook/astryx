// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useInputContainer',
  displayName: 'useInputContainer',
  keywords: ['input', 'container', 'focus', 'delegate', 'wrapper', 'text', 'textarea', 'click', 'icon', 'padding'],
  params: [
    {
      name: 'options',
      type: 'UseInputContainerOptions',
      description: 'Configuration object for the input container.',
      required: true,
    },
    {
      name: 'options.containerRef',
      type: 'RefObject<HTMLElement | null>',
      description: 'Ref to the outer container/wrapper element.',
      required: true,
    },
    {
      name: 'options.inputRef',
      type: 'RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLElement | null>',
      description: 'Ref to the inner input or textarea element.',
      required: true,
    },
    {
      name: 'options.disabled',
      type: 'boolean',
      description: 'Whether the input is disabled.',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'onClick',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: 'Click handler to attach to the container wrapper.',
    },
    {
      name: 'onMouseUp',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: 'Mouse up handler to attach to the container wrapper.',
    },
  ],
  usage: {
    description:
      'Makes an input container wrapper clickable, delegating focus to the inner input/textarea when the user clicks non-interactive areas (icons, padding, status indicators). Built on top of useClickableContainer, so nested interactive elements (clear buttons, calendar toggles, links) are handled safely — clicking them does NOT steal focus from the input. Automatically detects input type: text-like inputs receive .focus(), while other types (checkbox, radio, file) receive .click().',
    bestPractices: [
      { guidance: true, description: 'Use inside input wrapper components (XDSTextInput, XDSNumberInput, XDSTimeInput, XDSTextArea) to make the full container area clickable.' },
      { guidance: true, description: 'Attach both onClick and onMouseUp to the wrapper div for full interaction handling.' },
      { guidance: false, description: 'Use on bare inputs without a wrapper — there is no benefit if the input already fills the full clickable area.' },
    ],
  },
  relatedComponents: ['TextInput', 'NumberInput', 'TimeInput', 'TextArea'],
  relatedHooks: ['useClickableContainer'],
  importPath: '@xds/core/hooks',
  category: 'interaction',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description:
    'Makes input container wrapper clickable, delegating focus to inner input/textarea when user clicks non-interactive areas (icons, padding, status indicators). Built on useClickableContainer, so nested interactive elements (clear buttons, calendar toggles, links) handled safely — clicking them does NOT steal focus from input. Automatically detects input type: text-like inputs receive .focus(), other types (checkbox, radio, file) receive .click().',
  paramDescriptions: {
    options: 'config for input container.',
    'options.containerRef': 'ref to outer container/wrapper element.',
    'options.inputRef': 'ref to inner input / textarea element.',
    'options.disabled': 'whether input disabled.',
  },
  returnDescriptions: {
    onClick: 'click handler for container wrapper.',
    onMouseUp: 'mouse up handler for container wrapper.',
  },
  usage: {
    description:
      'Makes input container wrapper clickable, delegating focus to inner input/textarea when user clicks non-interactive areas (icons, padding, status indicators). Built on useClickableContainer, so nested interactive elements (clear buttons, calendar toggles, links) handled safely — clicking them does NOT steal focus from input. Automatically detects input type: text-like inputs receive .focus(), other types (checkbox, radio, file) receive .click().',
    bestPractices: [
      { guidance: true, description: 'Use inside input wrapper components (XDSTextInput, XDSNumberInput, XDSTimeInput, XDSTextArea) to make full container area clickable.' },
      { guidance: true, description: 'Attach both onClick + onMouseUp to wrapper div for full interaction handling.' },
      { guidance: false, description: 'Use on bare inputs w/o wrapper — no benefit if input already fills full clickable area.' },
    ],
  },
};
