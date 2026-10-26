// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'createReorderable',
  displayName: 'createReorderable',
  keywords: [
    'reorder',
    'reorderable',
    'drag',
    'sort',
    'list',
    'handle',
    'grip',
    'move',
    'UIKit',
    'UITableView',
    'touch',
    'keyboard',
  ],
  params: [
    {
      name: 'onReorder',
      type: '(move: {key: Key; to: number}) => void',
      description:
        "Called once per committed move (a drop) with the moved item's key and its index after the move, in the full order of the collection's items. Apply it by rendering the items in their new order. A cancelled move calls nothing. The latest function given is the one called, so the object may be made on every render.",
      required: true,
    },
    {
      name: 'isReorderable',
      type: '(key: Key) => boolean',
      description:
        'Whether the item with this key can move. An item it rejects shows no handle and cannot be picked up; one at either end of the collection also bounds the drop range, so nothing drops beyond it. Every item moves without it.',
    },
  ],
  returns: [
    {
      name: 'reorderable',
      type: 'Reorderable',
      description:
        "The collection's reorder behavior: pass it as `List`'s `reorderable` prop, with an `itemKey` on each `ListItem`. One object may serve several collections; each reorders on its own.",
    },
  ],
  usage: {
    description:
      "Makes a collection's rows reorderable the way an iOS table's edit mode does. On a touch screen a finger held still on a row's handle for a moment picks it up (a flick on the handle still scrolls); the row follows the finger, the rows it passes slide out of its way, the page scrolls near its edges, and on release the row settles into its new place. A mouse drags a handle at once, and the rows take their places without motion. From the keyboard, Space or Enter on a handle picks its row up, the arrow keys, Home and End move it, Space or Enter drops it, and Escape puts it back; screen readers hear the pick-up, each move, the drop and a cancel. The reorder code ships with this function: a collection without the prop loads none of it.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Give each row a stable key from your data (`itemKey={item.id}`), and apply each move by rendering the items in their new order in the same task.',
      },
      {
        guidance: true,
        description:
          'Use `isReorderable` for rows that must stay put, such as a pinned first row.',
      },
      {
        guidance: false,
        description:
          "Use React's `key` as the reorder key, or index-based keys: a move changes every index after it.",
      },
    ],
  },
  relatedComponents: ['List'],
  importPath: '@astryxdesign/core',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    "A collection's reorder behavior, for List's reorderable prop; ListItem itemKey on each row.",
  paramDescriptions: {
    onReorder:
      '({key, to}) once per committed move; to is the index after the move.',
    isReorderable:
      '(key) => boolean; a rejected row has no handle, and at an end bounds the drop.',
  },
  returnDescriptions: {
    reorderable: "pass as List's reorderable prop.",
  },
  usage: {
    description:
      'UIKit edit-mode reorder: hold then drag (touch), drag (mouse), Space/Enter, arrows, Home, End, Escape (keys).',
    bestPractices: [
      {
        guidance: true,
        description: 'Stable data keys as itemKey; apply the move at once.',
      },
      {
        guidance: false,
        description: "React's key or indexes as reorder keys.",
      },
    ],
  },
};
