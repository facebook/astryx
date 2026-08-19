// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'Selector',
  name: 'Selector — Option descriptions',
  displayName: 'Selector — Option descriptions',
  description:
    'Options carry a description, so the dropdown draws a two-line row. The closed trigger stays one line at the size token; valueLayout="stacked" gives the description its own line at a taller fixed height on the same 4px rhythm, and an InputGroup pins it back to one line.',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Selector', 'SelectorOption', 'InputGroup', 'Button', 'Stack'],
};
