// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'Stepper',
  name: 'Stepper — Multi-Step Form',
  displayName: 'Stepper — Multi-Step Form',
  description:
    'A vertical stepper driving a multi-step form. Each step renders its own fields in the content slot for the active step, with Back/Continue buttons advancing activeStep.',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['Stepper', 'TextInput', 'Button', 'Text'],
};
