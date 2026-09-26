// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {isImeKeyEvent} from './ime';

describe('isImeKeyEvent', () => {
  it('detects the modern isComposing signal', () => {
    expect(isImeKeyEvent({isComposing: true})).toBe(true);
    expect(isImeKeyEvent({isComposing: true, keyCode: 13})).toBe(true);
  });

  it('detects the legacy keyCode 229 fallback (IME processing sentinel)', () => {
    // Some IMEs / older Safari fire the composing keydown with isComposing
    // not yet set to true but report keyCode 229.
    expect(isImeKeyEvent({keyCode: 229})).toBe(true);
    expect(isImeKeyEvent({isComposing: false, keyCode: 229})).toBe(true);
  });

  it('returns false for ordinary (non-composing) keydowns', () => {
    expect(isImeKeyEvent({})).toBe(false);
    expect(isImeKeyEvent({isComposing: false})).toBe(false);
    expect(isImeKeyEvent({keyCode: 13})).toBe(false); // plain Enter
    expect(isImeKeyEvent({keyCode: 27})).toBe(false); // plain Escape
    expect(isImeKeyEvent({isComposing: false, keyCode: 13})).toBe(false);
  });

  it('only treats a literal `true` isComposing as composing', () => {
    // Guards against truthy-but-not-true values leaking through.
    // @ts-expect-error intentionally passing a non-boolean to assert strictness
    expect(isImeKeyEvent({isComposing: 1})).toBe(false);
  });
});
