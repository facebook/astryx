// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BottomSheet',
  displayName: 'BottomSheet',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: ["bottom sheet","sheet","mobile","touch","drag","swipe","dismiss","grab handle","dialog","overlay","modal"],
  theming: {
    targets: [
      {className: 'astryx-bottom-sheet', visualProps: []},
    ],
  },
  description: 'A mobile touch sheet that rises from the bottom edge, with a grab handle, drag-to-resize snap points, and swipe-to-dismiss. Built on a native modal <dialog>.',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the sheet is open. Fully controlled; pair with onOpenChange.',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Called when the sheet opens or closes. The boolean is the requested next state (false on Escape, scrim click, or a swipe past the dismiss threshold). The caller owns the open state.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the sheet. Required; the sheet has no built-in heading to derive a name from.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Sheet content, rendered below the grab handle in a scrollable area.',
      required: true,
    },
    {
      name: 'height',
      type: "'hug' | 'capped' | 'tall' | number | string",
      description: "How tall the sheet is. Named budgets: 'hug' fits its content up to 92% of the viewport, 'capped' is a scrolling mid-height panel (~62%), and 'tall' is a pinned near-full panel (~92%) for content that streams in. Or pass a number (px) / CSS length for a custom budget. The user can drag between snap points regardless. On shorter viewports the sheet fills the available height.",
      default: "'capped'",
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description: "Whether to render a modal scrim behind the sheet. true (default) uses showModal(): top layer, focus trap, ::backdrop scrim, body scroll lock, and tap-scrim-to-dismiss, with the background inert. false uses show(): a non-modal sheet with no scrim, leaving the page behind interactive and scrollable (like Material's standard bottom sheet or an iOS undimmed detent). Escape still closes while focus is inside, and drag/flick-to-dismiss still work.",
      default: 'true',
    },
  ],
  usage: {
    description: 'A mobile touch surface for filters, actions, and detail views that should rise from the bottom of the screen. Drag the grab handle to resize: a slow drag settles to the nearest snap point (a short peek, ~half, and ~full detent, filtered to those shorter than the sheet), a fast flick down dismisses, a fast flick up expands. Pulling down on the content when it is scrolled to the top also drags the sheet, giving a larger, more forgiving target. The scrim thins to a faint glance state (but never fully clears) as the sheet collapses onto its shortest "peek" detent — the sheet stays modal, so the background remains inert until dismissed; a residual dim keeps that legible. The sheet is modal: focus is trapped while open and restored to the opener on close, and Escape dismisses, so the swipe gesture always has a keyboard equivalent. Content padding clears the home indicator via env(safe-area-inset-bottom).',
    bestPractices: [
      { guidance: true, description: 'Use for mobile-first surfaces (filters, share sheets, quick actions) where the content should rise from the bottom edge.' },
      { guidance: true, description: 'Keep the caller as the source of truth: derive isOpen from state and clear it in onOpenChange.' },
      { guidance: true, description: "Pick the starting height that fits the content: 'hug' for short bounded content, 'capped' for lists, 'tall' for streaming/resizing content; the user can then drag between snap points." },
      { guidance: true, description: "Use hasScrim={false} (non-modal, no scrim) for a peek surface that must coexist with a live page behind it (e.g. a panel over a map); keep the default (hasScrim) for focused tasks where the background should be inert." },
      { guidance: false, description: 'Use a BottomSheet for desktop inspectors or master-detail; use Drawer (side="end", hasScrim={false}) instead.' },
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
      label: 'Non-modal sheet (no scrim) — page stays interactive',
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
  description: 'mobile touch sheet rising from the bottom edge (native <dialog>): grab handle, drag-to-resize snap points, swipe-to-dismiss, named height scale, modal (default) or non-modal (hasScrim={false}) presentation',
  usage: {
    description: 'Mobile surface for filters, actions, and detail views. Drag the handle to resize between snap points; flick down to dismiss, up to expand. Modal: focus trap + restore, and Escape dismisses so swipe has a keyboard equivalent. Content clears the home indicator via safe-area inset.',
    bestPractices: [
      { guidance: true, description: 'Use for mobile-first bottom surfaces (filters, share sheets, quick actions).' },
      { guidance: true, description: 'Derive isOpen from state; clear it in onOpenChange.' },
      { guidance: true, description: "Pick a height that fits: 'hug' for short content, 'capped' for lists, 'tall' for streaming content." },
      { guidance: true, description: "hasScrim={false} for a non-modal peek over a live page; default (hasScrim) for focused tasks (inert background)." },
      { guidance: false, description: 'Use for desktop inspectors or master-detail; use Drawer instead.' },
    ],
  },
};
