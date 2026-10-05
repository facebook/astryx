// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */

const anatomy = [
  {
    name: 'Shared dialog',
    required: true,
    description:
      'One native dialog that owns modality, focus, dismissal, and lifecycle for the complete flow.',
  },
  {
    name: 'Sheet panels',
    required: true,
    description:
      'Direct BottomSheet children; exactly one (the last id in activeSheets) is interactive while covered or retained panels stay visible and inert.',
  },
  {
    name: 'Scrim',
    required: false,
    description:
      'Native dialog backdrop shown by the default scrim-backed modal presentation.',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'BottomSheetSwitcher',
  displayName: 'Bottom Sheet Switcher',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: [
    'bottom sheet',
    'switcher',
    'multi-step',
    'flow',
    'wizard',
    'stack',
    'drill-in',
  ],
  playground: {
    overlay: true,
    overlayControl: {
      stateProp: 'activeSheets',
      openValue: ['details', 'details-help'],
    },
    defaults: {
      activeSheets: [],
      children: [
        {
          __element: 'BottomSheet',
          props: {
            sheetId: 'details',
            label: 'Setup details',
            height: 'hug',
          },
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
                  children: 'Setup details',
                },
                {
                  __element: 'Text',
                  props: {type: 'body'},
                  children: 'Add the essential information for this setup.',
                },
                {
                  __element: 'Text',
                  props: {type: 'supporting'},
                  children: 'You can review these details before saving.',
                },
              ],
            },
          },
        },
        {
          __element: 'BottomSheet',
          props: {
            sheetId: 'details-help',
            label: 'About setup details',
            height: 'hug',
          },
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
                  children: 'About setup details',
                },
                {
                  __element: 'Text',
                  props: {type: 'body'},
                  children:
                    'This help sheet is stacked on the ordered path; the ' +
                    'covered step stays mounted and recedes behind it.',
                },
                {
                  __element: 'Text',
                  props: {type: 'supporting'},
                  children:
                    'Escape or the scrim pops one level back to the step ' +
                    'below.',
                },
              ],
            },
          },
        },
        {
          __element: 'BottomSheet',
          props: {
            sheetId: 'preferences',
            label: 'Choose preferences',
            height: 'hug',
          },
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
                  children: 'Choose preferences',
                },
                {
                  __element: 'Text',
                  props: {type: 'body'},
                  children: 'Select how this setup should behave.',
                },
                {
                  __element: 'Text',
                  props: {type: 'supporting'},
                  children:
                    'Notifications can be sent immediately, daily, or weekly.',
                },
                {
                  __element: 'Text',
                  props: {type: 'supporting'},
                  children: 'You can update these preferences later.',
                },
              ],
            },
          },
        },
        {
          __element: 'BottomSheet',
          props: {
            sheetId: 'confirm',
            label: 'Confirm setup',
            height: 'hug',
          },
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
                  children: 'Confirm setup',
                },
                {
                  __element: 'Text',
                  props: {type: 'body'},
                  children: 'Everything is ready to save.',
                },
              ],
            },
          },
        },
      ],
    },
  },
  description:
    'Coordinates multiple BottomSheets in one shared native <dialog> through a controlled ordered path. The canonical activeSheets list is ordered bottom-to-top: [] closes the flow, one id presents a single sheet, appending an id pushes a drill-in sheet above the current one (which stays mounted, inert, and visually receded), removing the final id pops back, and replacing a suffix changes branch. Only the last id is interactive. The released singular activeSheet remains supported as a length ≤ 1 projection with the shipped handoff: the new sheet enters above the inert previous sheet, aligns a taller one downward, then fades it. Modal flows call showModal() once for one top-layer boundary and one ::backdrop across the whole flow, while no-scrim flows use a non-modal show() shell. Its ref and shared DOM props target that dialog.',
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
        'Called before the switcher handles a native dialog cancel request. Calling preventDefault() keeps the controlled flow open.',
    },
    {
      name: 'activeSheets',
      type: 'ReadonlyArray<string>',
      description:
        'Ordered bottom-to-top path of open BottomSheet ids — the canonical controlled value. [] closes the flow; the last id is the only interactive sheet while covered ids stay mounted, inert, and receded. Append one id to push a drill-in sheet, drop the final id to pop, replace a suffix to change branch, and set [] to close all. Ids must be non-empty, unique, and match nested sheetId values; presentation stops before the first invalid id and warns in development. Supply with onActiveSheetsChange instead of the singular form.',
    },
    {
      name: 'onActiveSheetsChange',
      type: "(activeSheets: ReadonlyArray<string>, details: {reason: 'escape' | 'scrim' | 'swipe', dismissedSheetId: string}) => void",
      description:
        "Called when the top sheet requests an implicit dismissal permitted by its purpose: Escape or platform close ('escape'), a visible modal-scrim click ('scrim'), or a completed swipe ('swipe'). One dismissal removes one visible level, so the next path is the presented path without its final id. Close-all stays an explicit caller update to [].",
    },
    {
      name: 'activeSheet',
      type: 'string | null',
      description:
        'ID of the interactive BottomSheet, or null when the flow should close — the released singular form, equivalent to activeSheets of length ≤ 1 (null ⇔ []). Existing single-sheet flows keep their shipped behavior unchanged. Prefer activeSheets for new flows; supplying both forms warns in development and the list form wins.',
    },
    {
      name: 'onActiveSheetChange',
      type: '(activeSheet: string | null) => void',
      description:
        "The singular counterpart of onActiveSheetsChange: called with the next path's last id (or null) and no details when the active sheet dismisses according to its purpose. Child BottomSheets may use purpose='form' or purpose='required' to limit implicit dismissal while flow controls can still use the same state setter to switch sheets or close the flow.",
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        "Whether the shared dialog is modal, at every path length. true uses showModal() once for one native ::backdrop, focus trap, scroll lock, and click-to-dismiss when the top BottomSheet has purpose='info'. false uses show() with no backdrop and leaves the page interactive; avoid transformed, contained, or clipping ancestors because the non-modal dialog remains in its containing context.",
      default: 'true',
    },
    {
      name: 'finalFocusRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        'Preferred focus destination after the path reaches [] and exit completes. Use when routing may replace the element that opened the flow; an absent or disconnected target falls back to the opener captured when a modal flow opened. A non-modal close never steals focus that already moved outside the flow.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'BottomSheets identified by unique sheetId values.',
      required: true,
    },
  ],
  usage: {
    anatomy,
    description:
      'Coordinates a multi-step or drill-in bottom-sheet flow in one shared dialog; set activeSheets to the ordered path of nested sheetId values (append to push, slice to pop, [] to close), or use the released singular activeSheet for one sheet at a time.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use when each step depends on the previous one and only one step needs attention at a time.',
      },
      {
        guidance: true,
        description:
          'Give every child a unique sheetId and non-empty label, choose its purpose to match dismissal requirements, and follow the WAI-ARIA Dialog (Modal) pattern for scrim-backed flows: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/.',
      },
      {
        guidance: false,
        description:
          "Don't split information across sheets when people need to compare it; use a full-page layout that keeps the relevant content visible together instead.",
      },
      {
        guidance: false,
        description:
          "Don't use the switcher when multiple panels must stay interactive together; the path intentionally keeps one interactive sheet, and covered levels are inert context, not parallel workspaces.",
      },
    ],
  },
  examples: [
    {
      label: 'Multi-step flow with a stacked help sheet',
      code: `const [activeSheets, setActiveSheets] = useState([]);

<>
  <Button label="Start" onClick={() => setActiveSheets(['details'])} />
  <BottomSheetSwitcher
    activeSheets={activeSheets}
    onActiveSheetsChange={setActiveSheets}>
    <BottomSheet sheetId="details" label="Details" height="hug">
      <SetupDetails />
      <Button
        label="What are these details?"
        variant="secondary"
        onClick={() => setActiveSheets(['details', 'details-help'])}
      />
      <Button label="Continue" onClick={() => setActiveSheets(['preferences'])} />
    </BottomSheet>
    {/* Help content sized to roughly match Details, so the covered step's
        recede reads clearly behind the stacked sheet. */}
    <BottomSheet sheetId="details-help" label="About these details" height="hug">
      <DetailsHelp />
      <Button
        label="Back"
        onClick={() => setActiveSheets(current => current.slice(0, -1))}
      />
    </BottomSheet>
    <BottomSheet sheetId="preferences" label="Preferences" height="hug">
      <Preferences />
      <Button label="Back" onClick={() => setActiveSheets(['details'])} />
      <Button label="Continue" onClick={() => setActiveSheets(['confirm'])} />
    </BottomSheet>
    <BottomSheet sheetId="confirm" label="Confirm" height="hug">
      <Confirmation />
      <Button label="Back" onClick={() => setActiveSheets(['preferences'])} />
      <Button label="Done" onClick={() => setActiveSheets([])} />
    </BottomSheet>
  </BottomSheetSwitcher>
</>`,
    },
    {
      label: 'Three-step flow (released singular form)',
      code: `const [activeSheet, setActiveSheet] = useState(null);

<>
  <Button label="Start" onClick={() => setActiveSheet('details')} />
  <BottomSheetSwitcher
    activeSheet={activeSheet}
    onActiveSheetChange={setActiveSheet}>
    <BottomSheet sheetId="details" label="Details" height="hug">
      <SetupDetails />
      <Button label="Continue" onClick={() => setActiveSheet('preferences')} />
    </BottomSheet>
    <BottomSheet sheetId="preferences" label="Preferences" height="hug">
      <Preferences />
      <Button label="Back" onClick={() => setActiveSheet('details')} />
      <Button label="Continue" onClick={() => setActiveSheet('confirm')} />
    </BottomSheet>
    <BottomSheet sheetId="confirm" label="Confirm" height="hug">
      <Confirmation />
      <Button label="Back" onClick={() => setActiveSheet('preferences')} />
      <Button label="Done" onClick={() => setActiveSheet(null)} />
    </BottomSheet>
  </BottomSheetSwitcher>
</>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'controller with one shared native dialog for an ordered path of BottomSheets: activeSheets stacks drill-in sheets bottom-to-top (only the top is interactive), singular activeSheet remains the one-sheet form',
  usage: {
    anatomy,
    description:
      'Coordinates a multi-step or drill-in bottom-sheet flow in one shared dialog; set activeSheets to the ordered path of nested sheetId values (append to push, slice to pop, [] to close), or use the released singular activeSheet for one sheet at a time.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use when each step depends on the previous one and only one step needs attention at a time.',
      },
      {
        guidance: true,
        description:
          'Give every child a unique sheetId and non-empty label, choose its purpose to match dismissal requirements, and follow the WAI-ARIA Dialog (Modal) pattern for scrim-backed flows: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/.',
      },
      {
        guidance: false,
        description:
          "Don't split information across sheets when people need to compare it; use a full-page layout that keeps the relevant content visible together instead.",
      },
      {
        guidance: false,
        description:
          "Don't use the switcher when multiple panels must stay interactive together; the path intentionally keeps one interactive sheet, and covered levels are inert context, not parallel workspaces.",
      },
    ],
  },
};
