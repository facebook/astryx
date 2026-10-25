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
    'pressable',
    'interaction state',
  ],
  params: [
    {
      name: 'options',
      type: 'UsePressFeedbackOptions',
      description: 'Optional configuration.',
      required: false,
    },
    {
      name: 'options.profile',
      type: "'control' | 'cell'",
      description:
        "How a finger's press is tracked and released, after UIKit. `control` (a button, a card, a switch): highlights in the frame the finger lands, or after UIScrollView's 150 ms content-touch delay inside a scroller, and fades at the lift, over UIButton's 250 ms (ease-in-out) under a coarse primary pointer and over 200 ms with any other, as before. Under reduced motion the release is an opacity cross-fade of 200 ms or less on a touch screen and immediate otherwise. `cell` (a list row): waits for that delay wherever it is, is cancelled by 10 px of travel, and releases on the deselect clock. A scroll that takes the touch cancels either with no fade and no click.",
      required: false,
      default: "'control'",
    },
  ],
  returns: [
    {
      name: 'pressableProps',
      type: "{'data-astryx-pressable': '' | 'cell'}",
      description:
        "The marker attribute to spread on the element that paints the press; its value is the profile. Compose one of `interactionOverlayStyles` (from `@astryxdesign/core/utils`) on the same element — `backgroundColor` or `backgroundImage` for a surface whose hover and press are the system's overlays, `pressedBackgroundColor` for one whose hover is its own — and it paints the pressed token on the first frame of a press and fades it over the profile's release, keeping `:active` for a mouse on a desktop. On a phone or tablet, where the stylesheet drops `:active`, a mouse, trackpad or Space-key press is painted too: at once, held while the button or key is down, faded at the release. A press is themed through `--color-overlay-pressed`.",
    },
  ],
  usage: {
    description:
      "The touch press model every Astryx pressable uses, for a local component that paints its own press. Under a finger, CSS `:active` paints on the touch itself and can outlive the start of a scroll; the press model instead tracks the touch the way UIKit tracks a control or a list cell (see `profile`): a control highlights as the finger lands (after the content-touch delay inside a scroller, where a flick paints nothing), a cell waits for that delay and yields to 10 px of travel, a quick tap answers at the lift, and a scroll that takes the touch cancels it with no fade. The release fades on the profile's clock. One document-level controller does this for every marked element (installed by the first pressable to mount, removed by the last to unmount), so calling the hook adds no listener or state to your element. On a desktop a mouse press is still your `:active` rule: keep it, and drop it under `@media (pointer: coarse)` the way the built-in components do. That query reads the primary pointer, so on a phone or tablet it also drops `:active` for a connected mouse, trackpad or keyboard; those presses are painted there (at once, faded at the release), so nothing goes unanswered.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread the result on the element whose background paints the press and compose one of `interactionOverlayStyles` on it; the composed style is the instant onset, the hold and the fade, and it is themed through `--color-overlay-pressed`.',
      },
      {
        guidance: true,
        description:
          'Let the composed style own the press on every pointer: it keeps `:active` for a desktop mouse and drops it under `@media (pointer: coarse)`, where every press is painted for you (a finger through the press model, a mouse or Space key at once). A rule of your own that paints `:active` would paint under a finger too, on the touch and through a scroll.',
      },
      {
        guidance: true,
        description:
          "Pass `profile: 'cell'` for a row in a list, and keep the default for a control.",
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
    "Marks an element as a pressable surface of the touch press model, tracked like a UIKit control (highlight as the finger lands, 150 ms inside a scroller, 250 ms release under a coarse primary pointer) or cell (150 ms, cancelled by 10 px of travel, deselect release), and installs the shared document controller; on a coarse primary pointer it also paints mouse, trackpad and Space-key presses at once. Returns the data-astryx-pressable marker to spread; compose one of interactionOverlayStyles on the same element to paint.",
  paramDescriptions: {
    options: 'optional config.',
    'options.profile':
      "'control' (default) or 'cell': how a finger's press is tracked and released.",
  },
  returnDescriptions: {
    pressableProps:
      'marker attribute to spread on the painting element; compose one of interactionOverlayStyles (backgroundColor, backgroundImage, pressedBackgroundColor) there, which paints the press on every pointer; themed through --color-overlay-pressed.',
  },
  usage: {
    description:
      "For a local component that paints its own press and must match Astryx under a finger. No per-element listener or state; one controller per document. profile: 'cell' for list rows.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread on the painting element and compose one of interactionOverlayStyles there; add no :active rule of your own.',
      },
      {
        guidance: false,
        description:
          'Track the press with your own pointer listeners or state, or call it on an Astryx component (already marked).',
      },
    ],
  },
};
