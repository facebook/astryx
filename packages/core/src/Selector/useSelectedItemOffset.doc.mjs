// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useSelectedItemOffset',
  displayName: 'useSelectedItemOffset',
  group: 'Selector',
  category: 'layout',
  keywords: [
    'selector',
    'selected item',
    'popover',
    'anchor positioning',
    'dropdown alignment',
    'viewport clamp',
    'position fallback',
  ],
  params: [
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        'Whether the selection surface is open and should be measured. Closing resets the result.',
      required: true,
    },
    {
      name: 'selectedItemIndex',
      type: 'number',
      description:
        'Flat index of the selected option. A negative index aligns the first option.',
      required: true,
    },
    {
      name: 'listboxId',
      type: 'string',
      description:
        'DOM id of the listbox. Option ids must follow `${listboxId}-item-${index}`.',
      required: true,
    },
    {
      name: 'listboxRef',
      type: 'RefObject<HTMLDivElement | null>',
      description:
        'Ref for the rendered listbox whose height and selected row are measured.',
      required: true,
    },
    {
      name: 'anchorRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        'Ref for the outer control that the selected row should align over.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'offset',
      type: 'number',
      description:
        'Released non-negative distance from the below-anchor origin. Apply it as a negative block-start margin when using the original composition.',
    },
    {
      name: 'translateY',
      type: 'number',
      description:
        'Signed correction from the browser-resolved layer top to the viewport-clamped target. Apply it with CSS translate so position-try fallback selection stays stable.',
    },
    {
      name: 'isPositioned',
      type: 'boolean',
      description:
        'Whether the open-surface measurement is complete and the surface can be revealed.',
    },
  ],
  usage: {
    description:
      'Headless selected-row alignment for Selector-like anchored surfaces. It measures during the open surface’s existing hidden layout pass, aligns the selected option over the outer control, and clamps the result to the viewport. Use offset for compatibility with the original negative-margin composition or translateY for anchor-positioned layers that may flip.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use translateY with CSS translate when the layer uses position-try-fallbacks, so applying the correction cannot trigger a different fallback.',
      },
      {
        guidance: true,
        description:
          'Keep the surface hidden until isPositioned is true so the measurement does not create a visible intermediate position.',
      },
      {
        guidance: true,
        description:
          'Use offset only when maintaining the original below-anchor negative-margin composition.',
      },
      {
        guidance: false,
        description:
          'Use for ordinary popovers that do not align a selected row over their trigger: use Layer placement and offset instead.',
      },
    ],
  },
  relatedComponents: ['Selector', 'Popover'],
  relatedHooks: ['useLayer'],
  importPath: '@astryxdesign/core/Selector',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Aligns a selected option over an outer control and clamps it to the viewport during the existing hidden open-surface measurement pass.',
  paramDescriptions: {
    isOpen: 'surface open and ready to measure?',
    selectedItemIndex:
      'flat selected-option index; negative uses first option.',
    listboxId: 'listbox id; option ids follow `${listboxId}-item-${index}`.',
    listboxRef: 'rendered listbox ref.',
    anchorRef: 'outer alignment-control ref.',
  },
  returnDescriptions: {
    offset:
      'non-negative distance from below-anchor origin; negate for legacy block-start margin composition.',
    translateY:
      'signed correction from resolved layer top; apply with CSS translate for flip-stable composition.',
    isPositioned: 'measurement complete; surface may be revealed.',
  },
  usage: {
    description:
      'Headless selected-row overlay alignment. Use translateY for anchor-positioned layers that may flip; offset preserves the original negative-margin composition.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use translateY + CSS translate with position-try-fallbacks so correction does not change fallback selection.',
      },
      {
        guidance: true,
        description: 'Hide surface until isPositioned is true.',
      },
      {
        guidance: true,
        description:
          'Use offset only for original below-anchor margin composition.',
      },
      {
        guidance: false,
        description:
          'Use for ordinary popovers without selected-row overlay; use Layer placement/offset.',
      },
    ],
  },
};
