// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputPresentation.ts
 * @input A presentation policy, the deprecated nativePicker value, and pointer type
 * @output The resolved picker surface for DateInput, DateTimeInput, and TimeInput
 * @position Shared presentation vocabulary owned by spec:AST-043
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /docs/specs/AST-043-input-presentation/spec.md (FR1–FR3 tables)
 * - /packages/core/src/DateInput/DateInput.tsx
 * - /packages/core/src/DateTimeInput/DateTimeInput.tsx
 * - /packages/core/src/TimeInput/TimeInput.tsx
 */

/** Picker-surface policy for date/time inputs (`spec:AST-043` FR1). */
export type InputPresentation =
  | 'text-input'
  | 'popover'
  | 'bottom-sheet'
  | 'native'
  | 'adaptive-bottom-sheet'
  | 'adaptive-native';

/** The surface a resolved `InputPresentation` actually renders. */
export type InputPresentationSurface =
  'text-input' | 'desktop' | 'sheet' | 'native';

/** Deprecated picker policy (`spec:AST-043` FR3). */
export type LegacyNativePicker = 'touch' | 'always' | 'never';

export const DEFAULT_INPUT_PRESENTATION: InputPresentation = 'adaptive-native';

/**
 * Map a deprecated `nativePicker` value to its `presentation` equivalent.
 * `TimeInput` differs: its released `never` is the typed field on every
 * pointer, so it maps to `text-input`, not a sheet policy.
 */
export function presentationFromNativePicker(
  nativePicker: LegacyNativePicker,
  component: 'date' | 'time',
): InputPresentation {
  switch (nativePicker) {
    case 'touch':
      return 'adaptive-native';
    case 'always':
      return 'native';
    case 'never':
      return component === 'time' ? 'text-input' : 'adaptive-bottom-sheet';
  }
}

/** The effective policy: explicit `presentation` wins over the deprecated prop. */
export function effectiveInputPresentation(
  presentation: InputPresentation | undefined,
  nativePicker: LegacyNativePicker | undefined,
  component: 'date' | 'time',
): InputPresentation {
  if (presentation !== undefined) {
    return presentation;
  }
  if (nativePicker !== undefined) {
    return presentationFromNativePicker(nativePicker, component);
  }
  return DEFAULT_INPUT_PRESENTATION;
}

/** Resolve a policy to the surface rendered for the current pointer. */
export function resolveInputPresentation(
  presentation: InputPresentation,
  isCoarsePointer: boolean,
): InputPresentationSurface {
  switch (presentation) {
    case 'text-input':
      return 'text-input';
    case 'popover':
      return 'desktop';
    case 'bottom-sheet':
      return 'sheet';
    case 'native':
      return 'native';
    case 'adaptive-bottom-sheet':
      return isCoarsePointer ? 'sheet' : 'desktop';
    case 'adaptive-native':
      return isCoarsePointer ? 'native' : 'desktop';
  }
}
