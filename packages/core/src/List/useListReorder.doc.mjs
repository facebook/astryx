// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useListReorder',
  displayName: 'useListReorder',
  stability: 'experimental',
  keywords: [
    'reorder',
    'drag',
    'sort',
    'list',
    'handle',
    'grip',
    'UIKit',
    'UITableView',
    'touch',
    'keyboard',
    'experimental',
  ],
  params: [
    {
      name: 'listRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        'The list element. Its direct children are the rows, in order; each row is an `li` (or contains its handle inside one).',
      required: true,
    },
    {
      name: 'onReorder',
      type: '((fromIndex: number, toIndex: number) => void) | undefined',
      description:
        'Called once per move with the row\u2019s old and new index. Commit the new order in the same task, rows keyed by item. Without it the session is off and `ListReorderHandle` renders nothing.',
      required: true,
    },
    {
      name: 'hintId',
      type: 'string',
      description:
        'The id of an element holding the reorder instructions (the `@astryx.list.reorderHint` string); every handle is described by it.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'session',
      type: 'ListReorderContextValue | null',
      description:
        'The reorder session, opaque; null without `onReorder`. Provide it with `<ListReorderContext value={session}>` around the rows.',
    },
  ],
  usage: {
    description:
      'Experimental: this hook and everything exported from `@astryxdesign/core/List/experimental` are outside the stable compatibility promise and may change or be removed in a patch release. The reorder session of core `List` (`onReorder`), for a list whose rows are not `ListItem`s, such as rows of form fields. Put a `ListReorderHandle` in each row (named \u201cReorder {label}\u201d, or by its `aria-label`; `isDisabled` keeps it focusable but inert); a row that keeps its place carries `LIST_REORDER_FIXED_ROW_ATTRIBUTE` and no handle, and no row moves past it. A finger held still on a handle for a moment picks its row up (a flick on it scrolls, a pinch zooms); the row follows the finger, the rows it passes slide out of its way on UIKit\u2019s table spring, the list autoscrolls near its edges, and the drop springs the row into its slot. A mouse drags at once, without motion. A focused handle\u2019s arrow keys, Home and End move its row, Space picks it up and Escape puts it back, and screen readers hear each move.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use core `List` with `onReorder` when the rows are `ListItem`s; reach for this hook only when they cannot be.',
      },
      {
        guidance: true,
        description:
          'Commit the new order synchronously in `onReorder`, keeping each row\u2019s key, so the drop settles from where the row is.',
      },
      {
        guidance: false,
        description:
          'Animate the rows\u2019 `translate` yourself while a session can move them, or wrap the list in a View Transition for the drop.',
      },
      {
        guidance: false,
        description:
          'Rely on this API from stable product code: it is experimental and may change in a patch release.',
      },
    ],
  },
  relatedComponents: ['List'],
  relatedHooks: ['useGestureRecognizer'],
  importPath: '@astryxdesign/core/List/experimental',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Experimental (may change or be removed in a patch release). core List\u2019s reorder session for rows that are not ListItems: ListReorderHandle per row, LIST_REORDER_FIXED_ROW_ATTRIBUTE for a row that keeps its place, ListReorderContext provides the session.',
  paramDescriptions: {
    listRef: 'the list; its direct children are the rows.',
    onReorder: '(fromIndex, toIndex); commit the new order in the same task.',
    hintId: 'id of the element holding @astryx.list.reorderHint.',
  },
  returnDescriptions: {
    session: 'opaque; null without onReorder; give it to ListReorderContext.',
  },
  usage: {
    description:
      'Experimental. UIKit edit-mode reorder for custom rows: hold then drag (touch), drag (mouse), arrows/Home/End/Space/Escape (keys).',
    bestPractices: [
      {
        guidance: true,
        description: 'Prefer List onReorder with ListItem rows.',
      },
      {
        guidance: false,
        description: 'Own animations or View Transitions on the rows.',
      },
    ],
  },
};
