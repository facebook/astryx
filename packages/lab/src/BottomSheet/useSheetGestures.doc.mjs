// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').HookDoc} */
export const docs = {
  name: 'useSheetGestures',
  displayName: 'useSheetGestures',
  keywords: ['sheet', 'drag', 'swipe', 'dismiss', 'gesture', 'pointer', 'touch', 'bottom sheet'],
  params: [
    {
      name: 'options',
      type: 'UseSheetGesturesOptions',
      description: 'isOpen and onDismiss. Internal to BottomSheet — not exported from the lab entry point.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'result',
      type: 'UseSheetGesturesResult',
      description: 'contentProps (spread on the sliding surface for the live translate + touch-action guard), handleProps (spread on the grab handle for the pointer drag), plus dragOffset and isDragging for callers that want to drive their own animation.',
    },
  ],
  usage: {
    description:
      'Drag-to-dismiss machinery for the bottom sheet. Tracks a pointer drag down the block axis, translates the sliding surface live, and on release either dismisses (past a distance or velocity threshold) or springs back to fully open. Pointer-events based (one path for mouse + touch), SSR-safe, and respects prefers-reduced-motion. Escape (routed by the owning dialog) provides the keyboard equivalent of the swipe.',
    bestPractices: [
      { guidance: true, description: 'Spread handleProps on the grab-handle element and contentProps on the sliding surface (the panel that carries the translate).' },
      { guidance: false, description: 'Wire onDismiss to anything other than the owning sheet close — it fires when a swipe crosses the dismiss threshold.' },
    ],
  },
};
