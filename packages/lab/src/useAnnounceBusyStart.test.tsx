// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useAnnounceBusyStart.test.tsx
 * @input useAnnounceBusyStart with a mocked announcement channel
 * @output Proof that an owner announces each busy start once and nothing else
 *   (`spec:AST-086` FR6, FR8)
 * @position Unit test beside useAnnounceBusyStart.ts
 */

import {render} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {useAnnounceBusyStart} from './useAnnounceBusyStart';

const {announce} = vi.hoisted(() => ({announce: vi.fn()}));
vi.mock('@astryxdesign/core/hooks', async importOriginal => ({
  ...(await importOriginal<object>()),
  useAnnounce: () => announce,
}));

function Owner({isBusy}: {isBusy: boolean}) {
  useAnnounceBusyStart(isBusy, 'Loading events');
  return null;
}

beforeEach(() => announce.mockClear());

describe('useAnnounceBusyStart', () => {
  it('announces each busy start once, and nothing while busy or idle', () => {
    const {rerender} = render(<Owner isBusy={false} />);
    expect(announce).not.toHaveBeenCalled();
    rerender(<Owner isBusy={true} />);
    rerender(<Owner isBusy={true} />);
    expect(announce).toHaveBeenCalledExactlyOnceWith(
      'Loading events',
      'polite',
    );
    rerender(<Owner isBusy={false} />);
    rerender(<Owner isBusy={true} />);
    expect(announce).toHaveBeenCalledTimes(2);
  });

  it('announces an owner that mounts busy after the page loaded', () => {
    render(<Owner isBusy={true} />);
    expect(announce).toHaveBeenCalledExactlyOnceWith(
      'Loading events',
      'polite',
    );
  });
});
