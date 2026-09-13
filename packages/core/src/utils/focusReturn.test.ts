// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterEach} from 'vitest';
import {isFocusDetached} from './focusReturn';

describe('isFocusDetached', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('is true when focus rests on the body (Escape / empty-space dismiss)', () => {
    // Nothing focused → activeElement is <body>.
    (document.activeElement as HTMLElement | null)?.blur();
    expect(isFocusDetached()).toBe(true);
  });

  it('is false when a real element holds focus (the user moved focus there)', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    expect(document.activeElement).toBe(input);
    expect(isFocusDetached()).toBe(false);
  });

  it('treats the documentElement as detached', () => {
    const doc = {
      activeElement: document.documentElement,
      body: document.body,
      documentElement: document.documentElement,
    } as unknown as Document;
    expect(isFocusDetached(doc)).toBe(true);
  });

  it('treats a null activeElement as detached', () => {
    const doc = {
      activeElement: null,
      body: document.body,
      documentElement: document.documentElement,
    } as unknown as Document;
    expect(isFocusDetached(doc)).toBe(true);
  });
});
