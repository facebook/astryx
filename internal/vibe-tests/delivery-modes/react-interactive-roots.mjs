// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Stable component-root classes observed from real packages/core renders.
 *
 * DeliveryModesInteractiveRoots.test.tsx renders every listed component,
 * derives its nearest Astryx root from the resulting DOM, and fails if this
 * manifest drifts. Content containers and shared slot primitives such as Card
 * and Item are intentionally absent.
 */
export const REACT_INTERACTIVE_ROOT_CLASSES_BY_COMPONENT = Object.freeze({
  CheckboxInput: Object.freeze(['astryx-checkbox-input']),
  DateInput: Object.freeze(['astryx-date-input']),
  NumberInput: Object.freeze(['astryx-number-input']),
  RadioList: Object.freeze(['astryx-radio-list-item']),
  Selector: Object.freeze(['astryx-selector']),
  Slider: Object.freeze(['astryx-slider-thumb']),
  Switch: Object.freeze(['astryx-switch-field']),
  TextInput: Object.freeze(['astryx-text-input']),
});

export const REACT_INTERACTIVE_ROOT_CLASSES = Object.freeze([
  ...new Set(Object.values(REACT_INTERACTIVE_ROOT_CLASSES_BY_COMPONENT).flat()),
]);
