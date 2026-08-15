// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BottomSheet',
  displayName: 'BottomSheet',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: [
    'bottom sheet',
    'sheet',
    'mobile',
    'touch',
    'drag',
    'swipe',
    'dismiss',
    'grab handle',
    'dialog',
    'overlay',
    'modal',
    'form',
    'mobile keyboard',
    'visual viewport',
  ],
  playground: {
    overlay: true,
    defaults: {
      isOpen: false,
      label: 'Filters',
      height: 'hug',
      children: {
        __element: 'Section',
        props: {padding: 4},
        children: {
          __element: 'VStack',
          props: {gap: 2},
          children: [
            {
              __element: 'Heading',
              props: {level: 3},
              children: 'Filters',
            },
            {
              __element: 'Text',
              props: {type: 'body'},
              children: 'Adjust the properties below, then open the preview.',
            },
          ],
        },
      },
    },
  },
  theming: {
    targets: [
      {className: 'astryx-bottom-sheet', visualProps: ['height']},
      {className: 'astryx-bottom-sheet-handle', visualProps: []},
      {className: 'astryx-bottom-sheet-body', visualProps: []},
      {className: 'astryx-bottom-sheet-scrim', visualProps: []},
    ],
  },
  description:
    "A mobile touch sheet that rises from the bottom edge, with animated entrance and exit, a grab handle, drag-to-resize snap points, and swipe-to-dismiss. A standalone sheet owns a native <dialog>; inside BottomSheetSwitcher it renders a panel in the switcher's shared dialog. In both modes, ref and shared DOM props target the visual panel <div>.",
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        'Whether a standalone sheet is open. Fully controlled; pair with onOpenChange. Omit inside BottomSheetSwitcher.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        'For a standalone sheet, called when it requests an open-state change (false on Escape, scrim click, or a swipe past the dismiss threshold). Omit inside BottomSheetSwitcher.',
    },
    {
      name: 'sheetId',
      type: 'string',
      description:
        'Unique ID for this sheet inside BottomSheetSwitcher. The switcher opens it when activeSheet matches. Omit isOpen and onOpenChange when sheetId is used.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the sheet. Required; the sheet has no built-in heading to derive a name from.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Sheet content, rendered below the grab handle in a scrollable, mobile-keyboard-aware area.',
      required: true,
    },
    {
      name: 'height',
      type: "'hug' | 'capped' | 'tall' | number | string",
      description:
        "How tall the sheet is. Named budgets: 'hug' fits its content up to 92% of the viewport, 'capped' is a scrolling mid-height panel (~62%), and 'tall' is a pinned near-full panel (~92%) for content that streams in. Or pass a number (px) / CSS length for a custom budget. The user can drag between snap points regardless. On shorter viewports the sheet fills the available height.",
      default: "'capped'",
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        'For a standalone BottomSheet, whether to render a scrim—the semi-transparent overlay that covers and blocks the background. true (default) uses showModal(): top layer, focus trap, ::backdrop scrim, body scroll lock, and tap-scrim-to-dismiss, with the background inert. false uses show() with no scrim, leaving the page behind interactive and scrollable. For a multi-step flow, configure hasScrim on BottomSheetSwitcher instead; it owns one shared dialog across every child.',
      default: 'true',
    },
  ],
  usage: {
    description:
      'A mobile touch surface for filters, actions, and detail views that should rise from the bottom of the screen. Opening slides the sheet in; closing keeps its native dialog presented but inert until the slide-out and scrim fade complete. Drag the grab handle to resize: a slow drag settles to the nearest snap point (a short peek, ~half, and ~full detent, filtered to those shorter than the sheet), a fast flick down dismisses, a fast flick up expands. Keyboard users can focus the handle and use Arrow Up / Arrow Down to move one detent or Home / End to jump to the tallest / shortest detent. Pulling down on the content when it is scrolled to the top also drags the sheet, giving a larger, more forgiving target. The scrim thins to a faint glance state (but never fully clears) as the sheet collapses onto its shortest "peek" detent; the sheet stays modal, so the background remains inert until dismissed; a residual dim keeps that legible. The sheet is modal: focus is trapped while open and restored to the opener after its exit, and Escape dismisses. Visual-viewport overlap adds internal scroll range and keeps focused controls above the mobile keyboard without changing the measured sheet height; short sheets temporarily lift when they otherwise have no usable focus area. Actual sheet travel or closing dismisses the keyboard. Content padding clears the home indicator via env(safe-area-inset-bottom).',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for mobile-first surfaces (filters, share sheets, quick actions) where the content should rise from the bottom edge.',
      },
      {
        guidance: true,
        description:
          'Keep the caller as the source of truth: derive isOpen from state and clear it in onOpenChange.',
      },
      {
        guidance: true,
        description:
          'Use BottomSheetSwitcher with a unique sheetId per sheet for multi-step flows; it owns one shared dialog while the new top sheet enters and a taller previous sheet simultaneously aligns downward behind a shorter step, then fades it afterward.',
      },
      {
        guidance: true,
        description:
          "Pick the starting height that fits the content: 'hug' for short bounded content, 'capped' for lists, 'tall' for streaming/resizing content; the user can then drag between snap points.",
      },
      {
        guidance: true,
        description:
          "Use 'tall' for long mobile forms. 'hug' also supports short forms by temporarily lifting when the keyboard leaves too little usable space. Keep controls in the built-in scroll body.",
      },
      {
        guidance: true,
        description:
          'Use hasScrim={false} for a floating, no-scrim overlay that must coexist with a live page behind it (e.g. a panel over a map). It remains viewport-anchored rather than rendering inline. Keep the default for focused tasks where the background should be inert.',
      },
      {
        guidance: false,
        description:
          'Use a BottomSheet for desktop inspectors or master-detail; use Drawer (side="end", hasScrim={false}) instead.',
      },
    ],
  },
  examples: [
    {
      label: 'Basic',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Filters">
  <FilterControls />
</BottomSheet>`,
    },
    {
      label: 'Tall sheet (a list)',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Nearby places"
  height="tall">
  <PlaceList />
</BottomSheet>`,
    },
    {
      label: 'Hug height (fits content)',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Share"
  height="hug">
  <ShareActions />
</BottomSheet>`,
    },
    {
      label: 'Multi-step flow (one sheet at a time)',
      code: `const [activeSheet, setActiveSheet] = useState(null);
<>
  <Button label="Start" onClick={() => setActiveSheet('details')} />
  <BottomSheetSwitcher
    activeSheet={activeSheet}
    onActiveSheetChange={setActiveSheet}>
    <BottomSheet sheetId="details" label="Details">
      <Button label="Continue" onClick={() => setActiveSheet('confirm')} />
    </BottomSheet>
    <BottomSheet sheetId="confirm" label="Confirm">
      <Button label="Back" onClick={() => setActiveSheet('details')} />
    </BottomSheet>
  </BottomSheetSwitcher>
</>`,
    },
    {
      label: 'Mobile keyboard (a long form)',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Add a comment"
  height="tall">
  <LongCommentForm />
</BottomSheet>`,
    },
    {
      label: 'Mobile keyboard (a short form)',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Quick note"
  height="hug">
  <QuickNoteForm />
</BottomSheet>`,
    },
    {
      label: 'No scrim',
      code: `const [isOpen, setIsOpen] = useState(true);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Nearby places"
  hasScrim={false}>
  <PlaceList />
</BottomSheet>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'mobile touch sheet rising from the bottom edge (native <dialog>): grab handle, drag-to-resize snap points, swipe-to-dismiss, visual-viewport mobile-keyboard handling, named height scale, modal (default) or non-modal (hasScrim={false}) presentation',
  usage: {
    description:
      'Mobile surface for filters, actions, forms, and detail views. Drag the handle to resize between snap points; flick down to dismiss, up to expand. Modal: focus trap + restore, and Escape dismisses so swipe has a keyboard equivalent. Focused form controls scroll above the visual-viewport keyboard; short sheets temporarily lift without changing height. Actual sheet travel or closing dismisses the keyboard. Content clears the home indicator via safe-area inset.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for mobile-first bottom surfaces (filters, share sheets, quick actions).',
      },
      {
        guidance: true,
        description: 'Derive isOpen from state; clear it in onOpenChange.',
      },
      {
        guidance: true,
        description:
          'Use BottomSheetSwitcher + sheetId for mutually exclusive multi-step flows in one shared dialog.',
      },
      {
        guidance: true,
        description:
          "Pick a height that fits: 'hug' for short content, 'capped' for lists, 'tall' for streaming content.",
      },
      {
        guidance: true,
        description:
          "Use 'tall' for long forms. 'hug' supports short forms by lifting temporarily when the keyboard leaves too little usable space.",
      },
      {
        guidance: true,
        description:
          'hasScrim={false} for a floating no-scrim overlay over a live page; it is not inline. Keep the default for focused tasks (inert background).',
      },
      {
        guidance: false,
        description:
          'Use for desktop inspectors or master-detail; use Drawer instead.',
      },
    ],
  },
};
