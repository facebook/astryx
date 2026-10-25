// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TruncatedText.test.tsx
 * @input Uses @testing-library/react, Text, Heading
 * @output Tests that Text and Heading keep their element mounted when a caller
 *   toggles truncation (show more / less)
 * @position Testing; validates the client-part choice in Text.tsx and
 *   Heading.tsx (TruncatedText for any explicit `maxLines`)
 *
 * SYNC: When the TruncatedText condition in Text.tsx or Heading.tsx changes,
 * update these tests.
 */

import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {Text} from './Text';
import {Heading} from '../Heading/Heading';

describe('truncation toggles keep the element mounted', () => {
  it('Text keeps its element when maxLines toggles', () => {
    const {container, rerender} = render(
      <Text maxLines={3}>A long paragraph</Text>,
    );
    const before = container.firstElementChild;
    rerender(<Text maxLines={0}>A long paragraph</Text>);
    expect(container.firstElementChild).toBe(before);
    rerender(<Text maxLines={3}>A long paragraph</Text>);
    expect(container.firstElementChild).toBe(before);
  });

  it('Heading keeps its element when maxLines toggles', () => {
    const {container, rerender} = render(
      <Heading level={2} maxLines={1}>
        A long title
      </Heading>,
    );
    const before = container.firstElementChild;
    rerender(
      <Heading level={2} maxLines={0}>
        A long title
      </Heading>,
    );
    expect(container.firstElementChild).toBe(before);
  });
});
