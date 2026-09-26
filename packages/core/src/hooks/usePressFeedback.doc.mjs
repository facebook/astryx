// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'usePressFeedback',
  displayName: 'usePressFeedback',
  keywords: [
    'press',
    'pressed',
    'active',
    'touch',
    'tap',
    'coarse pointer',
    'data-pressed',
    'pressable',
    'interaction state',
  ],
  params: [],
  returns: [
    {
      name: 'pressableProps',
      type: "{'data-astryx-pressable': ''}",
      description:
        'The marker attribute to spread on the element that paints the press. The controller writes `data-pressed="on"` on it while a touch press is believed and `data-pressed="fading"` for the release; your styles paint the pressed overlay off those arms — the pressed token at the press\'s strength, `var(--astryx-press-alpha)`, which `interactionOverlayStyles.pressedAlpha` (from `@astryxdesign/core/utils`) sets to 1 while on and fades 1 → 0 over the release — and keep `:active` for a mouse.',
    },
  ],
  usage: {
    description:
      'The touch press model every Astryx pressable uses, for a local component that paints its own press. Under a finger, CSS `:active` paints on the touch itself and can outlive the start of a scroll; the press model instead waits 150 ms before believing a press, cancels it the moment the finger travels 10 px or a scroll claims the gesture, never brings it back inside that gesture, answers a quick tap at the lift, and fades the release over 200 ms — the clocks a native list uses. One document-level controller does this for every marked element (installed by the first pressable to mount, removed by the last to unmount), so calling the hook adds no listener or state to your element. Under a mouse nothing changes: keep your `:active` rule, and drop it under `@media (pointer: coarse)` the way the built-in components do.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread the result on the element whose background paints the press, compose `interactionOverlayStyles.pressedAlpha` on it, and paint both `[data-pressed="on"]` and `[data-pressed="fading"]` as a background image of the pressed token at the press\'s strength: `color-mix(in srgb, var(--color-overlay-pressed) calc(var(--astryx-press-alpha) * 100%), transparent)`. The strength is 1 on the first frame of a believed press and animates to 0 over the release, so the same declaration is the instant onset and the fade.',
      },
      {
        guidance: true,
        description:
          'Keep `:active` for the mouse and drop it under `@media (pointer: coarse)`, so a finger sees only the press model and a mouse sees only `:active`.',
      },
      {
        guidance: false,
        description:
          'Add a pointer listener or React state to the element to track the press; the controller already writes the attribute, and per-element listeners are what a long list cannot afford.',
      },
      {
        guidance: false,
        description:
          'Call it for a control rendered by an Astryx component; those are marked already, and the innermost marked element takes the press.',
      },
    ],
  },
  relatedComponents: ['Button', 'Item', 'ClickableCard'],
  relatedHooks: ['useLongPress'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Marks an element as a pressable surface of the touch press model (150 ms onset, 10 px slop, cancel on scroll, tap answers at lift, 200 ms fade) and installs the shared document controller. Returns the data-astryx-pressable marker to spread; the controller writes data-pressed="on"/"fading".',
  paramDescriptions: {},
  returnDescriptions: {
    pressableProps:
      'marker attribute to spread on the painting element; compose interactionOverlayStyles.pressedAlpha there, paint [data-pressed="on"] and [data-pressed="fading"] as the pressed token at var(--astryx-press-alpha) strength, keep :active for mouse.',
  },
  usage: {
    description:
      'For a local component that paints its own press and must match Astryx under a finger. No per-element listener or state; one controller per document.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread on the painting element; compose pressedAlpha; paint both data-pressed arms through var(--astryx-press-alpha); drop :active under @media (pointer: coarse).',
      },
      {
        guidance: false,
        description:
          'Track the press with your own pointer listeners or state, or call it on an Astryx component (already marked).',
      },
    ],
  },
};
