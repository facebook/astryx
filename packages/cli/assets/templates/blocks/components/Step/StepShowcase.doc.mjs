// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'Step',
  name: 'Step',
  displayName: 'Step',
  description:
    'Step is the unit a Stepper is built from: an indicator, a label, and optionally a description, an isOptional marker, and trailing endContent. A step never sets its own completed/current state — it declares its index and reads the rest off the parent Stepper.',
  isReady: true,
  isShowcase: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['Stepper', 'Step', 'Text'],
};
