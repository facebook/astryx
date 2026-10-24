// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useGestureDelegate',
  displayName: 'useGestureDelegate',
  stability: 'experimental',
  keywords: [
    'gesture',
    'delegate',
    'conflict',
    'require to fail',
    'simultaneous',
    'veto',
    'BottomSheet',
    'NavigationStack',
    'back swipe',
    'UIGestureRecognizerDelegate',
  ],
  params: [
    {
      name: 'match',
      type: 'GestureMatcher',
      description:
        "Which recognizers the delegate applies to, usually `gestureNamed('BottomSheet.drag', {within: ref})`: a component recognizer by its published name (PUBLISHED_GESTURES), optionally only the instances attached at or inside `within`, or at or around `containing`. Matched when a touch asks, so a component that remounts needs nothing redone.",
      required: true,
    },
    {
      name: 'delegate',
      type: 'GestureDelegate',
      description:
        "UIKit's delegate methods for recognizers you do not own: `shouldBegin` and `shouldReceiveTouch` (return false to veto), `shouldRecognizeSimultaneously`, `shouldRequireFailureOf` (it waits for the other to fail) and `shouldBeRequiredToFailBy` (the other waits for it). They add to the component's own delegate, which still runs: any false veto wins, any true relationship applies. Read when a touch asks, so they always see current state.",
      required: true,
    },
    {
      name: 'options.isEnabled',
      type: 'boolean',
      description: 'Live toggle; off removes the delegate.',
      default: 'true',
      required: false,
    },
  ],
  returns: [],
  usage: {
    description:
      "Experimental: this hook may change or be removed in a patch release. Lets code outside a component relate to the component's own gesture recognizers, the way a UIKit app uses a recognizer's name and its own delegate. Components publish their main recognizers under stable names (PUBLISHED_GESTURES, such as 'NavigationStack.backSwipe', 'Item.swipe', 'Lightbox.dismissPan'). To relate your own recognizer to one, use its existing delegate options with `gestureNamed` (for example a canvas pan inside a sheet that waits for the sheet's drag: `shouldRequireFailureOf: (_, other) => gestureNamed('BottomSheet.drag', {containing: canvasRef})(other)`). Use this hook for a recognizer you do not own: a veto (no back swipe while a form has unsaved changes) or a relationship between two components' recognizers. Code that declares nothing changes nothing.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Scope the name to the instance you mean with `within` or `containing`; a bare name matches every instance of the component on the page.',
      },
      {
        guidance: true,
        description:
          "Relate your own recognizer through its own delegate options; keep this hook for recognizers you don't own.",
      },
      {
        guidance: false,
        description:
          "Use it to make a component's gesture begin: an outside delegate can veto or relate, never overrule the component's own veto.",
      },
    ],
  },
  relatedHooks: ['useGestureRecognizer'],
  importPath: '@astryxdesign/core/gestures/experimental',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    "Experimental (may change or be removed in a patch release). Delegate methods for a component's recognizer you do not own, matched by published name and scope (gestureNamed); additive to the component's own delegate.",
  paramDescriptions: {
    match:
      "gestureNamed('Component.role', {within|containing}): which recognizers; matched at touch time.",
    delegate:
      'shouldBegin / shouldReceiveTouch (false vetoes), shouldRecognizeSimultaneously, shouldRequireFailureOf, shouldBeRequiredToFailBy (true applies).',
    'options.isEnabled': 'live toggle; off removes it.',
  },
  returnDescriptions: {},
  usage: {
    description:
      "Experimental. Relate to a component's published recognizers (PUBLISHED_GESTURES) from outside: your own recognizer uses its delegate options with gestureNamed; this hook covers recognizers you do not own (vetoes, relations between components). Declaring nothing changes nothing.",
    bestPractices: [
      {guidance: true, description: 'Scope with within / containing.'},
      {
        guidance: true,
        description: 'Relate your own recognizer through its own options.',
      },
      {
        guidance: false,
        description: "Expect to overrule a component's own veto.",
      },
    ],
  },
};
