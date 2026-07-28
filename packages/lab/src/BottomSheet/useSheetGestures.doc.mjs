// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').HookDoc} */
export const docs = {
  name: 'useSheetGestures',
  displayName: 'useSheetGestures',
  keywords: ['sheet', 'drag', 'swipe', 'dismiss', 'snap', 'gesture', 'pointer', 'touch', 'bottom sheet', 'detent'],
  params: [
    {
      name: 'options',
      type: 'UseSheetGesturesOptions',
      description: 'isOpen, onDismiss, and optional snapPoints / snapIndex / onSnapChange / enabled / axis. Component-agnostic: any sliding sheet surface can consume it.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'result',
      type: 'UseSheetGesturesResult',
      description: 'contentProps (spread on the sliding surface for live translate + touch-action), handleProps (spread on the grab handle for a11y + pointer/keyboard drag), plus dragOffset, activeSnapIndex, and isDragging for callers that want to drive their own animation.',
    },
  ],
  usage: {
    description:
      'Component-agnostic drag machinery for edge-anchored sheets. Tracks a pointer drag along the block axis, translates the sliding surface live, and on release either dismisses (past a distance or velocity threshold) or settles to the nearest snap point. Pointer-events based (one path for mouse + touch), SSR-safe, and respects prefers-reduced-motion. The grab handle is keyboard-operable — Arrow keys move between snap points and Escape (via the owning dialog) dismisses — so the swipe gesture always has an assistive-technology equivalent.',
    bestPractices: [
      { guidance: true, description: 'Spread handleProps on a real focusable grab-handle element and contentProps on the sliding surface (the <dialog> or panel that carries the slide transform).' },
      { guidance: true, description: 'Pass enabled={false} for sheets with a text form, so vertical drag does not fight input/scroll gestures.' },
      { guidance: true, description: 'Provide snapPoints as fractions (0..1 of the height budget) or CSS lengths; pair snapIndex + onSnapChange for controlled detents.' },
      { guidance: false, description: 'Wire onDismiss to anything other than the owning sheet close — it is called when a swipe crosses the dismiss threshold.' },
    ],
  },
};
