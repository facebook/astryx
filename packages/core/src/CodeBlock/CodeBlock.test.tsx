// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CodeBlock.test.tsx
 * @input Uses vitest, @testing-library/react, CodeBlock component
 * @output Unit tests for CodeBlock line accents (highlight/add/remove)
 * @position Testing; validates CodeBlock.tsx implementation
 *
 * SYNC: When modified, update this header
 */

import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {CodeBlock} from './CodeBlock';

const CODE = 'line one\nline two\nline three\nline four';

function getLine(container: HTMLElement, line: number): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[data-line="${line}"]`);
  if (el == null) {
    throw new Error(`line ${line} not rendered`);
  }
  return el;
}

describe('CodeBlock highlightLines', () => {
  it('renders plain number arrays with the neutral accent (backward compat)', () => {
    const {container} = render(
      <CodeBlock code={CODE} highlightLines={[2, 3]} />,
    );

    const plain = getLine(container, 1);
    const second = getLine(container, 2);
    const third = getLine(container, 3);

    expect(second.dataset.lineType).toBe('highlight');
    expect(third.dataset.lineType).toBe('highlight');
    expect(plain.dataset.lineType).toBeUndefined();

    // Highlighted lines share styling with each other but not with plain lines.
    expect(second.className).toBe(third.className);
    expect(second.className).not.toBe(plain.className);
  });

  it('renders mixed numbers and objects with per-type accents', () => {
    const {container} = render(
      <CodeBlock
        code={CODE}
        highlightLines={[
          1,
          {line: 2, type: 'add'},
          {line: 3, type: 'remove'},
          {line: 4, type: 'highlight'},
        ]}
      />,
    );

    const neutral = getLine(container, 1);
    const added = getLine(container, 2);
    const removed = getLine(container, 3);
    const explicitHighlight = getLine(container, 4);

    expect(neutral.dataset.lineType).toBe('highlight');
    expect(added.dataset.lineType).toBe('add');
    expect(removed.dataset.lineType).toBe('remove');
    expect(explicitHighlight.dataset.lineType).toBe('highlight');

    // Each accent type gets distinct styling.
    expect(added.className).not.toBe(removed.className);
    expect(added.className).not.toBe(neutral.className);
    expect(removed.className).not.toBe(neutral.className);

    // A plain number entry is identical to an explicit type: 'highlight'.
    expect(explicitHighlight.className).toBe(neutral.className);
  });

  it('defaults object entries without a type to the neutral accent', () => {
    const {container} = render(
      <CodeBlock code={CODE} highlightLines={[1, {line: 2}]} />,
    );

    const plainNumber = getLine(container, 1);
    const untypedObject = getLine(container, 2);

    expect(untypedObject.dataset.lineType).toBe('highlight');
    expect(untypedObject.className).toBe(plainNumber.className);
  });

  it('ignores out-of-range lines', () => {
    const {container} = render(
      <CodeBlock
        code={CODE}
        highlightLines={[{line: 99, type: 'add'}, {line: 0, type: 'remove'}, -5]}
      />,
    );

    expect(container.querySelector('[data-line="99"]')).toBeNull();
    expect(container.querySelector('[data-line-type]')).toBeNull();
    // All in-range lines still render, unaccented.
    for (const line of [1, 2, 3, 4]) {
      expect(getLine(container, line).dataset.lineType).toBeUndefined();
    }
  });

  it('renders no accent when highlightLines is empty or absent', () => {
    const {container: absent} = render(<CodeBlock code={CODE} />);
    expect(absent.querySelector('[data-line-type]')).toBeNull();

    const {container: empty} = render(
      <CodeBlock code={CODE} highlightLines={[]} />,
    );
    expect(empty.querySelector('[data-line-type]')).toBeNull();
  });
});
