// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'ComplexSelector',
  name: 'Complex Selector — Multi-select Filter',
  displayName: 'Complex Selector — Multi-select Filter',
  description:
    'A stage filter that keeps the popup open while several checkboxes are toggled and closes only when the apply button calls close().',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['ComplexSelector', 'CheckboxList', 'Button', 'VStack'],
};
