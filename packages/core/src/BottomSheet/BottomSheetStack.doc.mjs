// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetStack.doc.mjs
 * @input BottomSheetStack props, level anatomy, and story-aligned examples
 * @output Consumer documentation and examples for BottomSheetStack
 * @position CLI and rendered component documentation
 */

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Host dialog',
    required: true,
    description:
      'One native <dialog> shared by every level: the single scrim, modal boundary, scroll lock, and Escape owner for the whole stack.',
  },
  {
    name: 'Level',
    required: true,
    description:
      'One BottomSheet (isOpen / onOpenChange) or one whole BottomSheetSwitcher (activeSheet / onActiveSheetChange) rendered anywhere under the stack: directly, behind your own wrapper components, inside DOM elements, Suspense, Activity, providers, or a mapped list. Levels stack in tree order; a sheet rendered inside another level’s content sits right above that level. The last open level is the top.',
  },
  {
    name: 'Covered level',
    required: false,
    description:
      'An open level below the top. It stays mounted with its scroll position and inputs, is inert and hidden from assistive technology, and recedes behind the top: the nearest two covered levels shrink and lift a step each, deeper ones sit behind the second step.',
  },
  {
    name: 'Scrim',
    required: false,
    description:
      'The host dialog backdrop (hasScrim, the default). A tap on it closes only the top level, as that level’s purpose allows.',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'BottomSheetStack',
  displayName: 'Bottom Sheet Stack',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: [
    'bottom sheet',
    'stack',
    'stacked sheets',
    'drill-in',
    'nested sheets',
    'mobile',
    'touch',
    'overlay',
    'deep link',
  ],
  description:
    'Stacks bottom sheets. Put the sheets of a flow anywhere inside one BottomSheetStack and open them with their own isOpen or activeSheet state; every BottomSheet and BottomSheetSwitcher rendered under the stack is one level, stacked in tree order, and only the top level is interactive. Covered levels stay mounted with their state and recede behind the top. Escape, a scrim tap, and a swipe close one level at a time through that level’s own callback.',
  props: [
    {
      name: 'ref',
      type: 'Ref<HTMLDialogElement>',
      description: 'Ref forwarded to the one shared native dialog.',
    },
    {
      name: 'onCancel',
      type: '(event: SyntheticEvent<HTMLDialogElement>) => void',
      description:
        'Called when the shared native dialog receives a cancel request (Escape). The stack always keeps the dialog open and applies the top level’s purpose to the request after your handler runs.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The subtree whose BottomSheets (isOpen / onOpenChange) and BottomSheetSwitchers (activeSheet / onActiveSheetChange) are the levels, wherever they are rendered in it: directly, behind your own components whatever their props are called, inside DOM wrappers, Suspense, Activity, providers, or a mapped list. A whole switcher is one level and keeps switching in place. Levels stack in tree order, bottom to top; give mapped sheets stable keys.',
      required: true,
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        'Whether the stack opens its one shared dialog modally with a scrim, focus containment, and page scroll lock. Set it here only: hasScrim on a sheet or switcher inside the stack is ignored with a development warning.',
      default: 'true',
    },
  ],
  usage: {
    anatomy,
    description:
      'Use a stack when a touch flow drills in: a list opens a detail, the detail opens an editor, and each step should remain visible beneath the next. Every BottomSheet and BottomSheetSwitcher rendered under the stack is a level, however deep: the stack never looks at its children, so your own wrapper components, DOM wrappers, Suspense, Activity, providers, and mapped lists all work. A BottomSheet level opens with isOpen and closes through onOpenChange(false); a BottomSheetSwitcher level opens when activeSheet is set, switches its own sheets in place while it is the top, and closes through onActiveSheetChange(null). Open several levels in one update to deep-link into a flow; they appear together, already ordered.\n\nLevels stack in tree order, not in the order they opened: the order in which the sheets appear in the document, with a sheet rendered inside another level’s content directly above that level. That lets a detail sheet live next to the row that opens it, inside the list sheet, with no state hoisting. Reordering sheets while they are open reorders the stack and keeps each sheet’s state.\n\nDismissal reaches only the top level: Escape, a scrim tap, and a downward swipe each call the top level’s own callback, and that level’s purpose applies (required blocks all three, form blocks swipe and scrim). Nothing closes the stack at once; close every level yourself, in one update when the whole flow is done, and the levels animate out together.\n\nFocus follows the levels. Opening a level moves focus into it; closing it moves focus back into the level beneath, to the control that opened the closed level when it is still there. When the last level closes, focus returns to the element that opened the first level, or to the bottom level’s finalFocusRef when it has one. A BottomSheet level keeps its own finalFocusRef; a switcher level has none.\n\nThe stack owns the shared dialog, so sheets inside it never set hasScrim. A single open level behaves like a normal sheet. A Dialog, AlertDialog, Popover, Lightbox, or MobileNav opened from a level opens above the stack as usual, and a BottomSheet inside that layer is a normal standalone sheet above it, not a level (a stack inside it is its own stack). The same rule applies to a LayerDepthProvider you place yourself: sheets inside it are one layer deeper and stay standalone. A BottomSheetStack rendered inside another one, at the same layer, merges into the outer stack with a development warning.\n\nTwo caveats follow from how levels are placed. Each level’s panel is rendered into the shared dialog, not where the sheet sits in your markup, so CSS that a wrapper applies by inheritance (a font or colour set on a div around one sheet) does not reach that sheet’s panel; React context does, so a ThemeProvider around a sheet still applies. And a sheet you render through your own createPortal is ordered by where that portal’s content lands in the document, not by where the portal is called.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep each level’s open state where its data lives: derive isOpen from the selected item and clear the selection in onOpenChange.',
      },
      {
        guidance: true,
        description:
          'Order sheets bottom-to-top as the flow drills in; the stack orders levels by tree position, not by when they opened.',
      },
      {
        guidance: true,
        description:
          'Render a detail sheet inside the sheet that opens it when the two belong together; it stacks directly above its parent.',
      },
      {
        guidance: true,
        description:
          'Use a BottomSheetSwitcher as a level when steps replace each other (edit → saved) and standalone sheets when steps pile up.',
      },
      {
        guidance: true,
        description:
          'For a flow of unknown depth, map a path to BottomSheet children with stable keys and keep closed entries mounted until their exit finishes.',
      },
      {
        guidance: false,
        description:
          'Do not set hasScrim on a sheet or switcher inside the stack; set it once on the stack.',
      },
      {
        guidance: false,
        description:
          'Do not rely on CSS inherited from a wrapper around one sheet to style its panel; panels render in the shared dialog. Use the sheet’s own props or a theme.',
      },
      {
        guidance: false,
        description:
          'Do not nest a BottomSheetStack inside another to get a second scrim; nested stacks merge into the outer one.',
      },
    ],
    accessibility: [
      {
        name: 'One reachable level',
        requirement:
          'Only the top level is reachable. Covered levels are inert and hidden from assistive technology, and the host dialog takes the top level’s label.',
        description:
          'The stack marks every level below the top as inert and aria-hidden, so Tab, screen readers, and pointer input reach only the top level. Each level still needs its own label.',
      },
      {
        name: 'Way out',
        requirement:
          'Give a required or form level a visible close control. Escape and the scrim do not close it.',
        description:
          'A required level blocks Escape, the scrim, and swipe; a form level blocks the scrim and swipe. Its content must offer a button that calls the level’s own callback.',
      },
    ],
  },
  examples: [
    {
      label: 'Drill-in: list, detail, editor',
      code: `const [order, setOrder] = useState<string | null>(null);
const [isEditing, setIsEditing] = useState(false);

<BottomSheetStack>
  <BottomSheet isOpen={isListOpen} onOpenChange={setIsListOpen} label="Orders">
    {orders.map(id => (
      <Button key={id} onClick={() => setOrder(id)}>Order {id}</Button>
    ))}
  </BottomSheet>
  <BottomSheet
    isOpen={order != null}
    onOpenChange={open => !open && setOrder(null)}
    label="Order">
    <Button onClick={() => setIsEditing(true)}>Edit</Button>
  </BottomSheet>
  <BottomSheet isOpen={isEditing} onOpenChange={setIsEditing} label="Edit order">
    …
  </BottomSheet>
</BottomSheetStack>`,
    },
    {
      label: 'Switcher base with a help overlay',
      code: `<BottomSheetStack>
  <BottomSheetSwitcher activeSheet={step} onActiveSheetChange={setStep}>
    <BottomSheet sheetId="categories" label="Categories">…</BottomSheet>
    <BottomSheet sheetId="options" label="Options">…</BottomSheet>
  </BottomSheetSwitcher>
  <BottomSheet isOpen={isHelpOpen} onOpenChange={setIsHelpOpen} label="Help">
    …
  </BottomSheet>
</BottomSheetStack>`,
    },
    {
      label: 'Detail sheet next to the row that opens it',
      code: `<BottomSheetStack>
  <BottomSheet isOpen={isListOpen} onOpenChange={setIsListOpen} label="Orders">
    {orders.map(order => (
      <OrderRow key={order.id} order={order} />
    ))}
  </BottomSheet>
</BottomSheetStack>

function OrderRow({order}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button label={order.title} onClick={() => setIsOpen(true)} />
      {/* A level right above the list: the list recedes while this is open. */}
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label={order.title}>
        …
      </BottomSheet>
    </>
  );
}`,
    },
    {
      label: 'Variable depth from a path',
      code: `<BottomSheetStack>
  {path.map((folder, index) => (
    <BottomSheet
      key={folder.id}
      isOpen={index < openDepth}
      onOpenChange={open => !open && setOpenDepth(index)}
      label={folder.name}>
      …
    </BottomSheet>
  ))}
</BottomSheetStack>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'host that stacks BottomSheet and BottomSheetSwitcher levels in one shared dialog; tree order, top level interactive, covered levels inert and receded',
  usage: {
    anatomy,
    description:
      'Wrap the sheets of a drill-in flow in one BottomSheetStack and open each with its own isOpen or activeSheet; every sheet rendered anywhere under the stack is one level, in tree order. Escape, scrim, and swipe close the top level through its own callback.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep each level’s open state where its data lives, order sheets bottom-to-top, and render a detail sheet inside the sheet that opens it when they belong together.',
      },
      {
        guidance: true,
        description:
          'Use a BottomSheetSwitcher as a level when steps replace each other and standalone sheets when steps pile up; close every level yourself when the flow is done.',
      },
      {
        guidance: false,
        description:
          'Do not set hasScrim on a sheet inside the stack, rely on CSS inherited from a wrapper to style a panel, or nest a stack to get a second scrim.',
      },
    ],
  },
};
