// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'Step',
  name: 'Step — Content Slot',
  displayName: 'Step — Content Slot',
  description:
    'Children passed to a Step render below its label, indented to line up with it, and stay outside the clickable label area so buttons inside remain their own targets. Rendering the slot only for the active step is what turns a vertical stepper into an expanding flow.',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['Stepper', 'Step', 'Text', 'Button'],
};
