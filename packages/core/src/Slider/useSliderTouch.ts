// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSliderTouch.ts
 * @input The touch presentation's state (Slider.tsx), the slider's value
 *   model and parts; sliderTouchController.ts
 * @output Exports `useSliderTouch` (the React wiring), `SLIDER_HIT_ATTRIBUTE`
 *   and the `SliderTouchModel` and `SliderTouchParts` types
 * @position Internal to Slider: wires its touch presentation. The touch
 *   layer itself (the gesture recognizers, the animator and the UIKit tables)
 *   is sliderTouchController.ts, and this is its one import site, so a build
 *   can swap that module whole (a desktop build without the touch layer).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Slider/sliderTouchController.ts
 * - /packages/core/src/Slider/Slider.tsx (the state it returns)
 * - /packages/core/src/Slider/useSliderTouch.test.tsx
 */

import {useEffect, useRef, useState} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  SliderTouchController,
  type SliderTouchModel,
  type SliderTouchParts,
} from './sliderTouchController';

export type {SliderTouchModel, SliderTouchParts} from './sliderTouchController';

/** Marks a thumb's touch target: an invisible square centered on the thumb. */
export const SLIDER_HIT_ATTRIBUTE = 'data-slider-hit';

export interface UseSliderTouchOptions {
  /** The touch presentation applies and the slider is enabled. */
  readonly isEnabled: boolean;
  readonly model: SliderTouchModel;
  readonly getParts: () => SliderTouchParts | null;
  /** Re-attaches when the thumbs or the orientation change. */
  readonly thumbCount: number;
}

/**
 * Wires UISlider's touch tracking to a rendered Slider. Returns whether the
 * touch presentation takes touches (it applies and the slider is enabled);
 * Slider's own pointer handlers take every other pointer.
 */
export function useSliderTouch({
  isEnabled,
  model,
  getParts,
  thumbCount,
}: UseSliderTouchOptions): boolean {
  const getPartsRef = useRef(getParts);
  useIsomorphicLayoutEffect(() => {
    getPartsRef.current = getParts;
  });
  const [controller] = useState(
    () => new SliderTouchController(model, () => getPartsRef.current()),
  );
  useIsomorphicLayoutEffect(() => {
    controller.setModel(model);
  });
  const {isHorizontal} = model;
  // Synchronizes the thumbs' touch targets with the document's gesture host:
  // their PressTrackers and pans attach while the touch presentation is on,
  // and detach (ending any interaction silently) when it goes off or the
  // touch targets change.
  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }
    return controller.attach();
  }, [controller, isEnabled, thumbCount, isHorizontal]);
  useEffect(() => () => controller.dispose(), [controller]);
  return isEnabled;
}
