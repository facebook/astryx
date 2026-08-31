// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useFocusReturnVisibility.ts
 * @input Uses the shared interaction-modality tracker
 * @output Preserves returned focus while suppressing pointer-only focus rings
 * @position Internal focus-return policy for adaptive overlays
 */

import {useCallback, useEffect, useState} from 'react';
import {
  getInteractionModality,
  trackInteractionModality,
} from '../utils/interactionModality';

export function useFocusReturnVisibility() {
  const [isFocusRingSuppressed, setIsFocusRingSuppressed] = useState(false);

  useEffect(() => {
    trackInteractionModality();
  }, []);

  const prepareFocusReturn = useCallback(() => {
    setIsFocusRingSuppressed(getInteractionModality() === 'pointer');
  }, []);

  const resetFocusReturn = useCallback(() => {
    setIsFocusRingSuppressed(false);
  }, []);

  const onFocusReturnTargetFocus = useCallback(() => {
    if (getInteractionModality() === 'keyboard') {
      setIsFocusRingSuppressed(false);
    }
  }, []);

  return {
    isFocusRingSuppressed,
    onFocusReturnTargetFocus,
    prepareFocusReturn,
    resetFocusReturn,
  };
}
