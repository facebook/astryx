// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTruncation.test.tsx
 * Tests for useTruncation
 */

import {render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, it, expect, vi} from 'vitest';
import {useTruncation} from './useTruncation';

function Probe({text}: {text: string}) {
  const truncation = useTruncation({maxLines: 1});
  return (
    <>
      <span ref={truncation.ref}>{text}</span>
      <output data-testid="full-text">{truncation.fullText}</output>
    </>
  );
}

// A status line at a fixed width never resizes when its message changes, so
// the tooltip text must follow the content, not only the element's size.
describe('useTruncation', () => {
  it('re-measures when the text changes without a resize', async () => {
    const {rerender} = render(<Probe text="planning the first step" />);
    expect(screen.getByTestId('full-text')).toHaveTextContent(
      'planning the first step',
    );

    rerender(<Probe text="writing the second step" />);

    await waitFor(() =>
      expect(screen.getByTestId('full-text')).toHaveTextContent(
        'writing the second step',
      ),
    );
  });

  describe('content observation', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('shares one observer across every truncating instance', () => {
      const NativeMutationObserver = globalThis.MutationObserver;
      let created = 0;
      vi.stubGlobal(
        'MutationObserver',
        class extends NativeMutationObserver {
          constructor(callback: MutationCallback) {
            super(callback);
            created += 1;
          }
        },
      );

      render(
        <>
          {Array.from({length: 50}, (_, index) => (
            <Probe key={index} text={`cell ${index}`} />
          ))}
        </>,
      );

      expect(created).toBe(1);
    });
  });
});
