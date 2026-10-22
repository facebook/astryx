// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'DropdownMenuGroup',
  name: 'DropdownMenuGroup — Selectable rows',
  displayName: 'DropdownMenuGroup — Selectable rows',
  description:
    'A radio set titled by its own title and a titled group of checkbox rows — the rows the data API cannot express, which is why the headings live in compound mode. A section holding one radio set titles the set itself rather than a group around it, so it is one group with one name.',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: [
    'DropdownMenu',
    'DropdownMenuGroup',
    'DropdownMenuRadioGroup',
    'DropdownMenuRadioItem',
    'DropdownMenuCheckboxItem',
  ],
};
