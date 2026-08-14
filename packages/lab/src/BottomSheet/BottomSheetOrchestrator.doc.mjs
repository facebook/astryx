// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BottomSheetOrchestrator',
  displayName: 'BottomSheetOrchestrator',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: ['bottom sheet', 'orchestrator', 'multi-step', 'flow', 'wizard'],
  theming: {
    targets: [
      {
        className: 'astryx-bottom-sheet-orchestrator-scrim',
        visualProps: [],
      },
    ],
  },
  description:
    'Coordinates multiple BottomSheets as a mutually exclusive flow. One activeSheet ID selects the only interactive sheet; during a handoff, the outgoing sheet stays visible and inert until its exit animation finishes. The orchestrator renders one shared scrim for the whole flow so handoffs never stack backdrops.',
  props: [
    {
      name: 'activeSheet',
      type: 'string | null',
      description:
        "ID of the interactive BottomSheet, or null when the flow should close. Match a nested BottomSheet's unique sheetId; the previous sheet may remain visually present and inert until its exit animation completes.",
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
      'Use one activeSheet value as the source of truth for a multi-step bottom-sheet flow. Set it to a child sheetId to open or switch steps, and set it to null to close. A previous sheet becomes inert immediately but remains visible through its exit animation while the new active sheet begins entering. The orchestrator owns one shared scrim, focus trap, and body scroll lock across the transition, and restores focus to the trigger that started the flow after the final exit finishes.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give every nested BottomSheet a stable, unique sheetId and model the flow as one activeSheet value.',
      },
      {
        guidance: true,
        description:
          'Keep form data above the individual sheets when it must persist while moving backward and forward.',
      },
      {
        guidance: true,
        description:
          'Configure hasScrim on BottomSheetOrchestrator, not its individual BottomSheet children, so the modal layer remains stable across handoffs.',
      },
      {
        guidance: true,
        description:
          'Treat activeSheet as the interaction state: an outgoing sheet can remain visually present during its exit, but it is inert and hidden from assistive technology.',
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
  <BottomSheetOrchestrator
    activeSheet={activeSheet}
    onActiveSheetChange={setActiveSheet}>
    <BottomSheet sheetId="details" label="Details">
      <Button label="Continue" onClick={() => setActiveSheet('confirm')} />
    </BottomSheet>
    <BottomSheet sheetId="confirm" label="Confirm">
      <Button label="Back" onClick={() => setActiveSheet('details')} />
      <Button label="Done" onClick={() => setActiveSheet(null)} />
    </BottomSheet>
  </BottomSheetOrchestrator>
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
      'One activeSheet ID makes one nested sheet interactive over one shared scrim. Change IDs to overlap the outgoing exit with the next entrance; null closes the flow.',
    bestPractices: [
      {
        guidance: true,
        description: 'Use stable, unique sheetId values for every child.',
      },
      {
        guidance: true,
        description: "Let the orchestrator own the flow's one shared scrim.",
      },
      {
        guidance: false,
        description: 'Coordinate a single flow with separate open booleans.',
      },
    ],
  },
};
