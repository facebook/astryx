// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useBusyAnnouncement.test.tsx
 * @input Uses vitest, @testing-library/react, useBusyAnnouncement
 * @output Unit tests for the busy-start announcement and its settle function
 * @position Testing; validates useBusyAnnouncement.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {useRef} from 'react';
import {useBusyAnnouncement} from './useBusyAnnouncement';
import {__resetLiveRegionsForTest} from './useAnnounce';

function politeText(): string {
  return (
    document.querySelector('[data-astryx-live-region="polite"]')?.textContent ??
    ''
  );
}

interface BusyProps {
  isBusy: boolean;
  message?: string;
}

function renderBusy() {
  return renderHook<() => void, BusyProps>(
    ({isBusy, message = 'Loading'}) =>
      useBusyAnnouncement(isBusy, message, useRef(null)),
    {initialProps: {isBusy: true}},
  );
}

function runFrames() {
  act(() => {
    vi.advanceTimersByTime(50);
  });
}

describe('useBusyAnnouncement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    __resetLiveRegionsForTest();
    vi.useRealTimers();
  });

  it('announces a busy start a frame after it begins', () => {
    renderBusy();
    runFrames();
    expect(politeText()).toBe('Loading');
  });

  it('drops a busy start its owner settled before it was announced (AST-086 FR8)', () => {
    const {result} = renderBusy();
    act(() => {
      result.current();
    });
    runFrames();
    expect(politeText()).toBe('');
  });

  it('keeps a settled busy start dropped until the next busy start', () => {
    const {result, rerender} = renderBusy();
    act(() => {
      result.current();
    });
    // Still busy until the settled state commits: nothing is rescheduled,
    // even when the busy message changes (a locale switch, say).
    rerender({isBusy: true, message: 'Chargement'});
    runFrames();
    expect(politeText()).toBe('');

    rerender({isBusy: false});
    rerender({isBusy: true});
    runFrames();
    expect(politeText()).toBe('Loading');
  });
});
