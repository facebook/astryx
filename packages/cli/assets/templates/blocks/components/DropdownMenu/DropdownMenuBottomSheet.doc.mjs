// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'DropdownMenu',
  alsoExampleFor: ['BottomSheet'],
  name: 'DropdownMenu — Adaptive presentation',
  displayName: 'DropdownMenu — Adaptive presentation',
  description:
    'Opens the actions in a bottom sheet on compact touch screens and in an anchored popover otherwise. This is the default adaptive presentation, so the call site needs no media query.',
  isReady: true,
  aspectRatio: 3 / 4,
  componentsUsed: ['DropdownMenu', 'Stack', 'Text'],
};
