// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {readLiveNumberDraft} from '../lib/useLiveNumberInput';

describe('readLiveNumberDraft', () => {
  it('returns an in-range machine number for live preview', () => {
    expect(readLiveNumberDraft('12.5', {min: 0, max: 20})).toEqual({
      liveValue: 12.5,
      shouldRevert: false,
    });
  });

  it('marks unreadable and non-integral drafts for rollback', () => {
    expect(readLiveNumberDraft('1·234', {})).toEqual({
      liveValue: null,
      shouldRevert: true,
    });
    expect(readLiveNumberDraft('3.5', {isIntegerOnly: true})).toEqual({
      liveValue: null,
      shouldRevert: true,
    });
  });

  it('leaves empty and out-of-range drafts to NumberInput commit policy', () => {
    expect(readLiveNumberDraft('', {})).toEqual({
      liveValue: null,
      shouldRevert: false,
    });
    expect(readLiveNumberDraft('100', {max: 10})).toEqual({
      liveValue: null,
      shouldRevert: false,
    });
  });
});
