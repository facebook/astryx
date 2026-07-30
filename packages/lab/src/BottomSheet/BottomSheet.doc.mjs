// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('../../../core/src/docs-types').ComponentDoc} */

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
  description: 'A mobile touch sheet that rises from the bottom edge, with a grab handle and swipe-to-dismiss. Built on the Drawer <dialog> engine.',
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
      type: "'short' | 'medium' | 'tall' | 'auto'",
      description: "How tall the sheet is: 'short' is a fixed peek height, 'medium' is half the viewport, 'tall' is nearly the full viewport, and 'auto' fits its content up to the 'tall' budget. On shorter viewports the sheet fills the available height.",
      default: "'medium'",
    },
  ],
  usage: {
    description: 'A mobile touch surface for filters, actions, and detail views that should rise from the bottom of the screen. The sheet is modal: focus is trapped while open and restored to the opener on close, and Escape dismisses, so the swipe gesture always has a keyboard equivalent. Content padding clears the home indicator via env(safe-area-inset-bottom).',
    bestPractices: [
      { guidance: true, description: 'Use for mobile-first surfaces (filters, share sheets, quick actions) where the content should rise from the bottom edge.' },
      { guidance: true, description: 'Keep the caller as the source of truth: derive isOpen from state and clear it in onOpenChange.' },
      { guidance: true, description: "Pick a height that fits the content: 'auto' for short sheets, 'medium'/'tall' for lists and forms." },
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
      label: 'Auto height (fits content)',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Share"
  height="auto">
  <ShareActions />
</BottomSheet>`,
    },
  ],
};

/** @type {import('../../../core/src/docs-types').TranslationDoc} */
export const docsDense = {
  description: 'mobile touch sheet rising from the bottom edge (built on the Drawer <dialog> engine): grab handle, swipe-to-dismiss, named height scale',
  usage: {
    description: 'Mobile surface for filters, actions, and detail views. Modal: focus trap + restore, and Escape dismisses so swipe has a keyboard equivalent. Content clears the home indicator via safe-area inset.',
    bestPractices: [
      { guidance: true, description: 'Use for mobile-first bottom surfaces (filters, share sheets, quick actions).' },
      { guidance: true, description: 'Derive isOpen from state; clear it in onOpenChange.' },
      { guidance: true, description: "Pick a height that fits: 'auto' for short sheets, 'medium'/'tall' for lists and forms." },
      { guidance: false, description: 'Use for desktop inspectors or master-detail; use Drawer instead.' },
    ],
  },
};
