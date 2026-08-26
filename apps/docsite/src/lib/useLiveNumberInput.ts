// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  useCallback,
  useRef,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

interface LiveNumberInputOptions {
  min?: number | null;
  max?: number | null;
  isIntegerOnly?: boolean;
}

export function readLiveNumberDraft(
  text: string,
  {min, max, isIntegerOnly}: LiveNumberInputOptions,
): {liveValue: number | null; shouldRevert: boolean} {
  const trimmed = text.trim();
  if (trimmed === '') {
    return {liveValue: null, shouldRevert: false};
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || (isIntegerOnly && !Number.isInteger(value))) {
    return {liveValue: null, shouldRevert: true};
  }
  if ((min != null && value < min) || (max != null && value > max)) {
    return {liveValue: null, shouldRevert: false};
  }
  return {liveValue: value, shouldRevert: false};
}

export function useLiveNumberInput(
  value: number | null,
  onChange: (value: number | null) => void,
  options: LiveNumberInputOptions = {},
) {
  const editStartValueRef = useRef(value);
  const lastDraftShouldRevertRef = useRef(false);
  const committedAtBoundaryRef = useRef(false);

  const handleChange = useCallback(
    (nextValue: number | null) => {
      committedAtBoundaryRef.current = true;
      editStartValueRef.current = nextValue;
      onChange(nextValue);
    },
    [onChange],
  );
  const handleFocus = useCallback(() => {
    editStartValueRef.current = value;
    lastDraftShouldRevertRef.current = false;
    committedAtBoundaryRef.current = false;
  }, [value]);
  const handleInput = useCallback(
    (event: FormEvent<HTMLElement>) => {
      committedAtBoundaryRef.current = false;
      const {liveValue, shouldRevert} = readLiveNumberDraft(
        (event.currentTarget as HTMLInputElement).value,
        options,
      );
      lastDraftShouldRevertRef.current = shouldRevert;
      if (liveValue !== null && liveValue !== value) {
        onChange(liveValue);
      }
    },
    [onChange, options, value],
  );
  const restoreRejectedDraft = useCallback(() => {
    if (
      lastDraftShouldRevertRef.current &&
      !committedAtBoundaryRef.current &&
      value !== editStartValueRef.current
    ) {
      onChange(editStartValueRef.current);
    }
    committedAtBoundaryRef.current = false;
  }, [onChange, value]);
  const handleBlur = useCallback(
    (_event: FocusEvent<HTMLInputElement>) => {
      restoreRejectedDraft();
    },
    [restoreRejectedDraft],
  );
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        restoreRejectedDraft();
      }
    },
    [restoreRejectedDraft],
  );

  return {handleBlur, handleChange, handleFocus, handleInput, handleKeyDown};
}
