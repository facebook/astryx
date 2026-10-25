// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render} from '@testing-library/react';
import {useRef} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {useIsScrollable} from './useIsScrollable';

/** Gives every element the box sizes the test names. */
function mockBox({client, content}: {client: number; content: number}) {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(320);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(
    client,
  );
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(320);
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(
    content,
  );
}

function Scroller({isEnabled = true}: {isEnabled?: boolean}) {
  const ref = useRef<HTMLDivElement>(null);
  const isScrollable = useIsScrollable(ref, isEnabled);
  return (
    <div ref={ref} data-scrollable={String(isScrollable)}>
      <p>Message</p>
    </div>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useIsScrollable', () => {
  it('is true when the content overflows the block axis past the shared tolerance', () => {
    mockBox({client: 200, content: 480});
    const {container} = render(<Scroller />);
    expect(container.firstElementChild?.getAttribute('data-scrollable')).toBe(
      'true',
    );
  });

  it('is false when the content fits, or overflows by no more than the tolerance', () => {
    mockBox({client: 200, content: 201});
    const {container} = render(<Scroller />);
    expect(container.firstElementChild?.getAttribute('data-scrollable')).toBe(
      'false',
    );
  });

  it('measures nothing while disabled', () => {
    mockBox({client: 200, content: 480});
    const {container} = render(<Scroller isEnabled={false} />);
    expect(container.firstElementChild?.getAttribute('data-scrollable')).toBe(
      'false',
    );
  });
});
