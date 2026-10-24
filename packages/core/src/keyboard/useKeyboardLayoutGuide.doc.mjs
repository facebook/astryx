// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useKeyboardLayoutGuide',
  displayName: 'useKeyboardLayoutGuide',
  stability: 'experimental',
  keywords: [
    'keyboard',
    'software keyboard',
    'virtual keyboard',
    'visual viewport',
    'iOS',
    'Safari',
    'Android',
    'Chrome',
    'VirtualKeyboard',
    'UIKit',
    'touch',
    'composer',
    'keyboard layout guide',
    'experimental',
  ],
  params: [
    {
      name: 'onTransition',
      type: '(transition: KeyboardTransition) => void',
      description:
        'Called with every keyboard transition while the component is mounted: `{kind, from, to, start, velocity, animated, predicted, curve}`, insets in CSS px from the bottom of the layout viewport, `start` on the document timeline, `curve` the eased slide on Chrome (null for UIKit\u2019s spring). Read through a ref, so a new function on each render subscribes nothing new.',
      required: false,
    },
    {
      name: 'options.overlayFor',
      type: 'RefObject<Element | null>',
      description:
        'A field that keeps itself above the keyboard. While focus is in it, the page overlays the keyboard on Chrome (`navigator.virtualKeyboard.overlaysContent`), so Chrome neither resizes nor pans the page to reveal the field. The flag is set only if the page had not set it, and restored when focus leaves the field or the component unmounts.',
      required: false,
    },
  ],
  returns: [
    {
      name: 'guide',
      type: 'KeyboardLayoutGuide | null',
      description:
        'The window\u2019s guide (null while rendering on a server): `inset` (where the keyboard rests), `transition` (the latest one), `presentation(time)` (the inset on screen at any time), `subscribe(listener)`, `profile` (`webkit` on iOS, `chromium` elsewhere) and `overlayWhileFocused(element)`.',
    },
  ],
  usage: {
    description:
      'Experimental: this hook and everything exported from `@astryxdesign/core/keyboard/experimental` are outside the stable compatibility promise and may change or be removed in a patch release. The web\u2019s UIKeyboardLayoutGuide: where the software keyboard covers the page and how it moves, for content that stays above it (a composer, a field docked at the bottom). Mobile Safari reports the keyboard once, after it starts to move, and a hide only after it ends; each transition is dated back to the keyboard\u2019s own start, and a hide starts at the blur. Chrome reports the keyboard at the start of its slide and plays Android\u2019s keyboard curve from there. Move your element from the listener with `rideKeyboard(animator, values, transition)`, which uses UIKit\u2019s keyboard spring on iOS and Android\u2019s curve on Chrome from `transition.start`, so it rides in step with the keyboard. The same subpath exports `getKeyboardLayoutGuide(window)` for non-React code.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Animate with `rideKeyboard`: it starts at `transition.start` on the keyboard\u2019s own motion and keeps it under Reduce Motion, as the keyboard does.',
      },
      {
        guidance: true,
        description:
          'Pass `overlayFor` for a field that moves itself above the keyboard, so Chrome does not also pan the page to reveal it.',
      },
      {
        guidance: true,
        description:
          'Lift a docked element only while a keyboard is up: `to > 0 ? max(0, restingBottom - (innerHeight - to)) : 0`.',
      },
      {
        guidance: false,
        description:
          'Read the visual viewport every frame to follow the keyboard: Safari reports one final value, so there is nothing to follow.',
      },
      {
        guidance: false,
        description:
          'Rely on this API from stable product code: it is experimental and may change in a patch release.',
      },
    ],
  },
  relatedHooks: ['useAnimator'],
  importPath: '@astryxdesign/core/keyboard/experimental',
};
