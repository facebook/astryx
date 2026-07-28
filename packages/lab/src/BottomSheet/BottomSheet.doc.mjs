// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('../../../core/src/docs-types').ComponentDoc} */

export const docs = {
  name: 'BottomSheet',
  displayName: 'BottomSheet',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: ["bottom sheet","sheet","mobile","touch","drag","swipe","dismiss","snap","snap points","detent","grab handle","dialog","overlay","modal"],
  theming: {
    targets: [
      {className: 'astryx-bottom-sheet', visualProps: []},
    ],
  },
  description: 'A mobile touch sheet that rises from the bottom edge, with a grab handle, swipe-to-dismiss, and optional snap points. Built on the Drawer <dialog> engine; the drag machinery lives in the reusable useSheetGestures hook.',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the sheet is open. Fully controlled; pair with onClose.',
      required: true,
    },
    {
      name: 'onClose',
      type: '() => void',
      description: 'Called when the sheet requests to be closed (Escape, scrim click, built-in close button, or a swipe past the dismiss threshold). The caller owns the open state.',
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
      name: 'snapPoints',
      type: 'Array<number | string>',
      description: 'Detents the sheet can settle to, ordered most-collapsed to most-expanded (e.g. [0.3, 0.6, 1] for peek / half / full). A number in (0, 1] is a fraction of the height budget; a string is any CSS length. Omit for a single-height sheet.',
    },
    {
      name: 'snapIndex',
      type: 'number',
      description: 'Controlled active detent index. Pair with onSnapChange.',
    },
    {
      name: 'onSnapChange',
      type: '(index: number) => void',
      description: 'Called when the active detent changes (drag settle or keyboard nav on the handle).',
    },
    {
      name: 'size',
      type: 'number | string',
      description: 'Height budget when snapPoints is not provided. A number is pixels; a string is any CSS length. On shorter viewports the sheet fills the available height.',
      default: "'50dvh'",
    },
    {
      name: 'hasDragHandle',
      type: 'boolean',
      description: 'Render the visual grab handle at the top of the sheet.',
      default: 'true',
    },
    {
      name: 'hasSwipeToDismiss',
      type: 'boolean',
      description: 'Allow swipe / drag to dismiss and resize. When false the drag wiring is inert; use for sheets with a text form so vertical drag does not fight input/scroll gestures.',
      default: 'true',
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description: 'Modal scrim behind the sheet. true uses showModal() (top layer, focus trap, scroll lock; clicking the scrim closes).',
      default: 'true',
    },
    {
      name: 'hasCloseButton',
      type: 'boolean',
      description: 'Built-in close button in the top-trailing corner. Defaults to the hasScrim value.',
      default: 'hasScrim',
    },
  ],
  usage: {
    description: 'A mobile touch surface for filters, actions, and detail views that should rise from the bottom of the screen. The grab handle is keyboard-operable (Arrow keys move between snap points) and Escape dismisses, so the swipe gesture always has an assistive-technology equivalent. Focus is trapped while open and restored to the opener on close, inherited from the Drawer <dialog> engine. Content padding clears the home indicator via env(safe-area-inset-bottom).',
    bestPractices: [
      { guidance: true, description: 'Use for mobile-first surfaces (filters, share sheets, quick actions) where the content should rise from the bottom edge.' },
      { guidance: true, description: 'Keep the caller as the source of truth: derive isOpen from state and clear it in onClose.' },
      { guidance: true, description: 'Use snapPoints for peek / half / full experiences; pair snapIndex + onSnapChange for a controlled detent.' },
      { guidance: true, description: 'Set hasSwipeToDismiss={false} for sheets with a text form, so vertical drag does not fight input focus and scrolling.' },
      { guidance: false, description: 'Use a BottomSheet for desktop inspectors or master-detail; use Drawer (side="end", hasScrim={false}) instead.' },
    ],
  },
  examples: [
    {
      label: 'Basic',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  label="Filters">
  <FilterControls />
</BottomSheet>`,
    },
    {
      label: 'Snap points (peek / half / full)',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  label="Nearby places"
  snapPoints={[0.3, 0.6, 1]}>
  <PlaceList />
</BottomSheet>`,
    },
    {
      label: 'Form sheet (swipe disabled)',
      code: `const [isOpen, setIsOpen] = useState(false);
<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  label="Add a comment"
  hasSwipeToDismiss={false}>
  <CommentForm />
</BottomSheet>`,
    },
  ],
};

/** @type {import('../../../core/src/docs-types').TranslationDoc} */
export const docsDense = {
  description: 'mobile touch sheet rising from the bottom edge (built on the Drawer <dialog> engine): grab handle, swipe-to-dismiss, optional snap points',
  usage: {
    description: 'Mobile surface for filters, actions, and detail views. Handle is keyboard-operable (Arrow keys move detents); Escape dismisses, so swipe has an AT equivalent. Focus trap + restore inherited from the dialog engine. Content clears the home indicator via safe-area inset.',
    bestPractices: [
      { guidance: true, description: 'Use for mobile-first bottom surfaces (filters, share sheets, quick actions).' },
      { guidance: true, description: 'Derive isOpen from state; clear it in onClose.' },
      { guidance: true, description: 'Use snapPoints for peek/half/full; pair snapIndex + onSnapChange for a controlled detent.' },
      { guidance: true, description: 'Set hasSwipeToDismiss={false} for sheets with a text form.' },
      { guidance: false, description: 'Use for desktop inspectors or master-detail; use Drawer instead.' },
    ],
  },
};
