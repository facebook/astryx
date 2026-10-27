// Copyright (c) Meta Platforms, Inc. and affiliates.

import {renderHook} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {installPressFeedback} from '../utils/pressFeedback';
import {takeOpenerActivation, useOpenerActivation} from './openerActivation';

/** A finger landing on `target`, as a browser sends it. */
function land(target: Element): void {
  const event = new Event('pointerdown', {bubbles: true, cancelable: true});
  Object.defineProperty(event, 'pointerType', {value: 'touch'});
  Object.defineProperty(event, 'pointerId', {value: 1});
  Object.defineProperty(event, 'isPrimary', {value: true});
  Object.defineProperty(event, 'button', {value: 0});
  target.dispatchEvent(event);
}

describe('openerActivation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    takeOpenerActivation();
  });

  it('reads where a finger landed, from the shared press controller a closed viewer holds, once', () => {
    const {unmount} = renderHook(() => useOpenerActivation(true));
    const opener = document.createElement('button');
    document.body.append(opener);
    land(opener);
    expect(takeOpenerActivation()?.target).toBe(opener);
    expect(takeOpenerActivation()).toBeNull();
    unmount();
    opener.remove();
  });

  it('adds no document listener of its own: the press controller, installed once per page, watches the landings (spec:AST-094 FR24)', () => {
    const release = installPressFeedback();
    const listen = vi.spyOn(document, 'addEventListener');
    const {unmount} = renderHook(() => useOpenerActivation(true));
    expect(listen).not.toHaveBeenCalled();
    unmount();
    release();
  });

  it('forgets the landing when the last viewer goes', () => {
    const {unmount} = renderHook(() => useOpenerActivation(true));
    const opener = document.createElement('button');
    document.body.append(opener);
    land(opener);
    unmount();
    expect(takeOpenerActivation()).toBeNull();
    opener.remove();
  });
});
