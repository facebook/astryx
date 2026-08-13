// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useSheetGestures',
  displayName: 'useSheetGestures',
  keywords: ['sheet', 'drag', 'swipe', 'snap', 'detent', 'dismiss', 'gesture', 'pointer', 'touch', 'bottom sheet'],
  params: [
    {
      name: 'options',
      type: 'UseSheetGesturesOptions',
      description: 'isOpen, onDismiss, optional snapHeights (candidate detent heights in px), onSnap, and onScrimOpacity (the scrim opacity to show, fading from 1 toward a faint floor as the sheet collapses onto its peek detent, for a glance affordance). Internal to BottomSheet, not exported from the lab entry point.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'result',
      type: 'UseSheetGesturesResult',
      description: 'contentProps (spread on the sliding surface for the live translate + touch-action guard), handleProps (spread on the grab handle for the pointer drag), plus dragOffset, settledOffset, and isDragging for callers that want to drive their own animation.',
    },
  ],
  usage: {
    description:
      'Drag + snap machinery for the bottom sheet. A slow drag on the handle resizes the sheet live and, on release, settles to the nearest snap detent; a fast downward flick dismisses (swipe-to-close); a fast upward flick expands to the tallest detent. The measured sheet height is always the tallest detent, and snapHeights add shorter rest points beneath it. Pointer-events based (one path for mouse + touch), SSR-safe, and respects prefers-reduced-motion. Escape (routed by the owning dialog) provides the keyboard equivalent of the dismiss swipe.',
    bestPractices: [
      { guidance: true, description: 'Spread handleProps on the grab-handle element and contentProps on the sliding surface (the panel that carries the translate).' },
      { guidance: true, description: 'Pass snapHeights in px relative to the viewport; the hook filters out any that are >= the measured sheet height.' },
      { guidance: false, description: 'Wire onDismiss to anything other than the owning sheet close; it fires on a swipe-to-close or a drag past the shortest detent.' },
    ],
  },
};
