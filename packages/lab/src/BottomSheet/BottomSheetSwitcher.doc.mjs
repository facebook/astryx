// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BottomSheetSwitcher',
  displayName: 'BottomSheetSwitcher',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: ['bottom sheet', 'switcher', 'multi-step', 'flow', 'wizard'],
  theming: {
    targets: [
      {
        className: 'astryx-bottom-sheet-switcher-scrim',
        visualProps: [],
      },
    ],
  },
  description:
    'Coordinates multiple BottomSheets as a mutually exclusive flow. One activeSheet ID selects the only interactive sheet; during a handoff, the new sheet enters above the inert previous sheet. If the new sheet is shorter, the previous sheet simultaneously moves down until their top edges align, then fades after both transforms complete. The switcher renders one shared scrim for the whole flow so handoffs never stack backdrops.',
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
      type: '(sheetId: string | null) => void',
      description:
        'Called with null when the active sheet dismisses. The same state setter can be used by flow controls to switch to another sheet ID.',
      required: true,
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        'Whether to render one shared modal scrim for the entire flow, with focus trapping, scroll lock, and click-to-dismiss. Disable for a non-modal flow.',
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
      'Use one activeSheet value as the source of truth for a multi-step bottom-sheet flow. Set it to a child sheetId to open or switch steps, and set it to null to close. On a handoff, the previous sheet becomes inert immediately while the new active sheet enters above it. A taller previous sheet simultaneously moves down until its top edge aligns with the shorter new sheet; it fades only after both transforms complete. Equal-height or shorter previous sheets stay stationary and fade after the entrance. The switcher owns one shared scrim, focus trap, and body scroll lock across the transition, and restores focus to the trigger that started the flow after the final exit finishes.',
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
          'Configure hasScrim on BottomSheetSwitcher, not its individual BottomSheet children, so the modal layer remains stable across handoffs.',
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
    'controller with one shared scrim for mutually exclusive multi-step BottomSheets',
  usage: {
    description:
      'One activeSheet ID makes one nested sheet interactive over one shared scrim. Change IDs to enter a new top sheet while simultaneously aligning a taller previous sheet behind a shorter one, then fade it; null closes the flow.',
    bestPractices: [
      {
        guidance: true,
        description: 'Use stable, unique sheetId values for every child.',
      },
      {
        guidance: true,
        description: "Let the switcher own the flow's one shared scrim.",
      },
      {
        guidance: false,
        description: 'Coordinate a single flow with separate open booleans.',
      },
    ],
  },
};
