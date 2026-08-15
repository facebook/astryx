// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BottomSheetSwitcher',
  displayName: 'Bottom Sheet Switcher',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: ['bottom sheet', 'switcher', 'multi-step', 'flow', 'wizard'],
  playground: {
    overlay: {stateProp: 'activeSheet', openValue: 'details'},
    defaults: {
      activeSheet: null,
      children: [
        {
          __element: 'BottomSheet',
          props: {
            sheetId: 'details',
            label: 'Setup details',
            height: 'capped',
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
                  children: 'This first step uses the capped height.',
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
                  children: 'This shorter confirmation step hugs its content.',
                },
              ],
            },
          },
        },
      ],
    },
  },
  theming: {
    targets: [
      {
        className: 'astryx-bottom-sheet-scrim',
        visualProps: [],
      },
      {
        className: 'astryx-bottom-sheet-switcher-scrim',
        visualProps: [],
        deprecatedFor: 'bottom-sheet-scrim',
      },
    ],
  },
  description:
    'Coordinates multiple BottomSheets as a mutually exclusive flow. One activeSheet ID selects the only interactive sheet; during a handoff, the new sheet enters above the inert previous sheet. If the new sheet is shorter, the previous sheet simultaneously moves down until their top edges align, then fades after both transforms complete. The switcher owns one shared native <dialog>: modal flows call showModal() once for one top-layer boundary and one ::backdrop across the whole flow, while no-scrim flows use a non-modal show() shell. Its ref and shared DOM props target that dialog.',
  props: [
    {
      name: 'activeSheet',
      type: 'string | null',
      description:
        "ID of the interactive BottomSheet, or null when the flow should close. Match a nested BottomSheet's unique sheetId; the previous sheet may remain visually present and inert while the new sheet enters, simultaneously align downward behind a shorter step, then fade away.",
      required: true,
    },
    {
      name: 'onActiveSheetChange',
      type: '(activeSheet: string | null) => void',
      description:
        'Called with null when the active sheet dismisses. The same state setter can be used by flow controls to switch to another sheet ID.',
      required: true,
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        'Whether the shared dialog is modal. true uses showModal() once for one native ::backdrop, focus trap, scroll lock, and click-to-dismiss across the whole flow. false uses show() with no backdrop and leaves the page interactive; avoid transformed, contained, or clipping ancestors because the non-modal dialog remains in its containing context.',
      default: 'true',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'BottomSheets identified by unique sheetId values.',
      required: true,
    },
  ],
  usage: {
    description:
      "Coordinates a multi-step bottom-sheet flow in one shared dialog; set activeSheet to a nested BottomSheet's sheetId to open or switch steps, and to null to close.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Give every nested BottomSheet a stable, unique sheetId and model the flow as one activeSheet value.',
      },
      {
        guidance: true,
        description:
          'Keep state local to the sheet that owns it; lift only data that another sheet needs.',
      },
      {
        guidance: true,
        description:
          "Treat each switcher sheet's content as a new ownership scope. A BottomSheet opened from that content is standalone; wrap it in a nested BottomSheetSwitcher when it starts another multi-step flow.",
      },
      {
        guidance: true,
        description:
          'Configure hasScrim on BottomSheetSwitcher, not its individual BottomSheet children, so the modal layer remains stable across handoffs.',
      },
      {
        guidance: true,
        description:
          'When hasScrim is false, keep the switcher outside transformed, contained, and overflow-clipping ancestors so its non-modal dialog can remain viewport-aligned.',
      },
      {
        guidance: true,
        description:
          'Treat activeSheet as the interaction state: a previous sheet can remain visually present and move beneath the entering sheet, but it is inert and hidden from assistive technology.',
      },
      {
        guidance: false,
        description:
          'Use separate isOpen booleans for sheets in the same flow; they can drift and request overlapping dialogs.',
      },
    ],
  },
  examples: [
    {
      label: 'Two-step flow',
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
    'controller with one shared native dialog for mutually exclusive multi-step BottomSheets',
  usage: {
    description:
      "Coordinates a multi-step bottom-sheet flow in one shared dialog; set activeSheet to a nested BottomSheet's sheetId to open or switch steps, and to null to close.",
    bestPractices: [
      {
        guidance: true,
        description: 'Use stable, unique sheetId values for every child.',
      },
      {
        guidance: true,
        description:
          "Let the switcher own the flow's shared dialog and scrim setting.",
      },
      {
        guidance: true,
        description:
          'Nested sheets start a new standalone or nested-switcher scope.',
      },
      {
        guidance: false,
        description: 'Coordinate a single flow with separate open booleans.',
      },
    ],
  },
};
