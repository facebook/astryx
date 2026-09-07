// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BottomSheetStack',
  displayName: 'Bottom Sheet Stack',
  group: 'BottomSheet',
  category: 'Overlay',
  keywords: [
    'bottom sheet',
    'stack',
    'stacked sheet',
    'drill down',
    'detail',
    'navigation',
  ],
  playground: {
    overlay: true,
    overlayControl: {
      stateProp: 'openSheetIds',
      openValue: ['filters'],
    },
    defaults: {
      openSheetIds: [],
      children: [
        {
          __element: 'BottomSheet',
          props: {
            sheetId: 'filters',
            label: 'Filters',
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
                  children: 'Filters',
                },
                {
                  __element: 'Text',
                  props: {type: 'body'},
                  children:
                    'Choose a filter, then open a detail sheet without replacing this context.',
                },
              ],
            },
          },
        },
        {
          __element: 'BottomSheet',
          props: {
            sheetId: 'details',
            label: 'Filter details',
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
                  children: 'Filter details',
                },
                {
                  __element: 'Text',
                  props: {type: 'body'},
                  children: 'Configure the selected filter.',
                },
              ],
            },
          },
        },
      ],
    },
  },
  description:
    'Coordinates multiple BottomSheets as one ordered visual stack. openSheetIds lists open sheets bottom-to-top; the last sheet is interactive while covered sheets remain mounted, inert, and slightly scaled and translated beneath it. Pushing appends an ID, Back removes the last ID, and an empty array closes the stack. Escape, scrim click, and swipe request dismissal of only the top sheet. The stack owns one native <dialog>, scrim, focus boundary, and scroll lock across the complete flow.',
  props: [
    {
      name: 'openSheetIds',
      type: 'ReadonlyArray<string>',
      description:
        'Open BottomSheet IDs ordered bottom-to-top. IDs must be unique and match nested BottomSheet sheetId values. Append one ID to push, remove the final ID to pop, and pass [] to close the stack.',
      required: true,
    },
    {
      name: 'onOpenSheetIdsChange',
      type: '(openSheetIds: ReadonlyArray<string>) => void',
      description:
        'Called with the top ID removed when the top sheet requests dismissal according to its purpose. Flow controls may use the same state setter to append an ID, pop, or close with [].',
      required: true,
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        "Whether the shared dialog is modal. true uses showModal() for one native ::backdrop, focus trap, scroll lock, and click-to-dismiss when the top BottomSheet has purpose='info'. false uses show() and leaves the page interactive.",
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
      'Use for drill-down interactions where a new sheet should preserve visible context beneath it. Keep the ordered array as the single source of truth; do not model stack order with independent child booleans.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Append one sheet ID for forward navigation and remove the last ID for Back so motion and focus return follow the visible stack.',
      },
      {
        guidance: true,
        description:
          'Keep sheet IDs unique. Covered sheets stay mounted, so local form and scroll state are preserved while a detail sheet is above them.',
      },
      {
        guidance: false,
        description:
          "Don't use BottomSheetStack for mutually exclusive wizard steps that replace one another; use BottomSheetSwitcher instead.",
      },
    ],
  },
  examples: [
    {
      label: 'Stacked detail flow',
      code: `const [openSheetIds, setOpenSheetIds] =
  useState<ReadonlyArray<string>>([]);

const push = (sheetId: string) =>
  setOpenSheetIds(current => [...current, sheetId]);
const pop = () =>
  setOpenSheetIds(current => current.slice(0, -1));

<>
  <Button label="Open filters" onClick={() => push('filters')} />
  <BottomSheetStack
    openSheetIds={openSheetIds}
    onOpenSheetIdsChange={setOpenSheetIds}>
    <BottomSheet sheetId="filters" label="Filters">
      <Filters />
      <Button label="Show details" onClick={() => push('details')} />
    </BottomSheet>
    <BottomSheet sheetId="details" label="Filter details">
      <FilterDetails />
      <Button label="Back" onClick={pop} />
    </BottomSheet>
  </BottomSheetStack>
</>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'controlled BottomSheet stack; IDs are ordered bottom-to-top and only the final sheet is interactive',
  usage: {
    description:
      'Use for drill-down interactions where each pushed sheet preserves visible context beneath it.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Append one ID to push and remove the final ID to pop; [] closes the stack.',
      },
      {
        guidance: false,
        description:
          "Don't use for mutually exclusive wizard steps; use BottomSheetSwitcher.",
      },
    ],
  },
};
