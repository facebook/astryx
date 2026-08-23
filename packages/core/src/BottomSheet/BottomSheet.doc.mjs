// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BottomSheet',
  displayName: 'Bottom Sheet',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: [
    'bottom sheet',
    'sheet',
    'mobile',
    'touch',
    'drag',
    'swipe',
    'snap point',
    'detent',
    'resize',
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
    targets: [{className: 'astryx-bottom-sheet', visualProps: []}],
  },
  description:
    "A mobile touch sheet that rises from the bottom edge, with animated entrance and exit, a grab handle, optional drag-to-resize snap points, and purpose-controlled dismissal. A standalone sheet owns a native <dialog>; inside BottomSheetSwitcher it renders a panel in the switcher's shared dialog. In both modes, ref and shared DOM props target the visual panel <div>.",
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
        'For a standalone sheet, called when it requests an open-state change. Automatic calls follow purpose: info dismisses on Escape, scrim click, or swipe; form dismisses on Escape only; required never dismisses implicitly. Omit inside BottomSheetSwitcher.',
    },
    {
      name: 'purpose',
      type: "'required' | 'form' | 'info'",
      description:
        "Controls implicit dismissal behavior, matching Dialog. info allows Escape, scrim click, and swipe-to-dismiss. form protects entered data by blocking scrim click and swipe while allowing Escape. required blocks every implicit dismissal path and uses role='alertdialog'. Explicit controls may still update the controlled state. Works for standalone and BottomSheetSwitcher-managed sheets.",
      default: "'info'",
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
        "Sheet content, rendered below the grab handle in a scrollable area. If it includes a text-entry control that can bring up the mobile keyboard, use height='tall' and keep the sheet fully expanded while editing.",
      required: true,
    },
    {
      name: 'height',
      type: "'hug' | 'capped' | 'tall' | number | string",
      description:
        "How tall the sheet is. Named budgets: 'hug' fits its content up to 92% of the viewport, 'capped' is a scrolling mid-height panel (~62%), and 'tall' is a pinned near-full panel (~92%) for content that streams in. Or pass a number (px) / CSS length for a custom budget. Give snapPoints to let the user drag between heights. On shorter viewports the sheet fills the available height. Only a fully expanded 'tall' sheet provides mobile-keyboard accommodation: it stays put and scrolls each focused control above the keyboard. Hug, Capped, numeric and CSS-length heights never do, and a Tall sheet stops doing it the moment the user drags it to a shorter detent, resuming when they drag it back. Outside that state the sheet neither moves nor adds keyboard scroll space, and the browser's own focus reveal is left in place; on iOS that reveal can shift the whole page.",
      default: "'capped'",
    },
    {
      name: 'snapPoints',
      type: 'ReadonlyArray<number | string>',
      description:
        "Extra heights the sheet can rest at when dragged; its own height is always the tallest stop, and omitting this gives a sheet that only opens and closes. Each stop is the sheet's visible height: a number is a viewport fraction (0.5 is half the screen), '50%' the same in CSS, '320px' an absolute length. A stop of a quarter of the sheet or less is a peek: it slides away instead of reflowing, and thins the scrim.",
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        "For a standalone BottomSheet, whether to render a scrim, the semi-transparent overlay that covers and blocks the background. true (default) uses showModal(): top layer, focus trap, ::backdrop scrim, body scroll lock, and tap-scrim-to-dismiss when purpose='info', with the background inert. false uses show() with no scrim, leaving the page behind interactive and scrollable. For a multi-step flow, configure hasScrim on BottomSheetSwitcher instead; it owns one shared dialog across every child.",
      default: 'true',
    },
  ],
  usage: {
    description:
      'A mobile touch surface for filters, actions, forms, and detail views that should rise from the bottom of the viewport; use BottomSheetSwitcher for multi-step flows.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for mobile-first surfaces (filters, share sheets, quick actions) where the content should rise from the bottom edge.',
      },
      {
        guidance: true,
        description:
          "Pick the starting height that fits the content: 'hug' for short bounded content, 'capped' for lists, and 'tall' for forms or streaming/resizing content.",
      },
      {
        guidance: true,
        description:
          "Use purpose='form' to protect entered data from scrim clicks and swipes while keeping Escape available; reserve purpose='required' for flows that must end through an explicit action.",
      },
      {
        guidance: false,
        description:
          "Don't make the sheet content overly long. Consider breaking it into steps and using Bottom Sheet Switcher.",
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
      label: 'Collapsible to half the screen',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Nearby places"
  height="tall"
  snapPoints={[0.5]}>
  <PlaceList />
</BottomSheet>`,
    },
    {
      label: 'A peek, a working height, and full',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Route"
  height="tall"
  snapPoints={['96px', '50%']}>
  <RouteDetails />
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
      label: 'Long scrolling content',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Release notes"
  height="hug">
  <ReleaseNotes />
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
      label: 'Mobile keyboard',
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
    {
      label: 'Protect form input',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  purpose="form"
  label="Edit profile">
  <ProfileForm onSave={() => setIsOpen(false)} />
</BottomSheet>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'mobile touch sheet rising from the bottom edge (native <dialog>): grab handle, opt-in transform-based drag-to-resize snap points (snapPoints: viewport fraction, percent or px length), scrolling area resizes to the snapped visible height on release (a peek stop, a quarter of the sheet or less, keeps the full height and slides instead), Dialog-aligned dismissal purpose (info/form/required), purpose-gated swipe-to-dismiss, fully-expanded Tall visual-viewport mobile-keyboard handling, named height scale, modal (default) or non-modal (hasScrim={false}) presentation',
  usage: {
    description:
      'Mobile touch surface for filters, actions, forms, and detail views that should rise from the bottom of the viewport; use BottomSheetSwitcher for multi-step flows.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for mobile-first surfaces (filters, share sheets, quick actions) where the content should rise from the bottom edge.',
      },
      {
        guidance: true,
        description:
          "Pick the starting height that fits the content: 'hug' for short bounded content, 'capped' for lists, and 'tall' for forms or streaming/resizing content.",
      },
      {
        guidance: true,
        description:
          "Use purpose='form' to protect entered data from scrim clicks and swipes while keeping Escape available; reserve purpose='required' for flows that must end through an explicit action.",
      },
      {
        guidance: false,
        description:
          "Don't make the sheet content overly long. Consider breaking it into steps and using Bottom Sheet Switcher.",
      },
    ],
  },
};
