// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file VisuallyHidden.test.tsx
 * @input Uses vitest, @testing-library/react, VisuallyHidden component
 * @output Unit tests for VisuallyHidden rendering + a11y behavior
 * @position Testing; validates VisuallyHidden.tsx implementation
 *
 * SYNC: When VisuallyHidden.tsx changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {createRef} from 'react';
import {VisuallyHidden} from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('renders its children in the accessibility tree', () => {
    render(<VisuallyHidden>Delete incident</VisuallyHidden>);
    // Present in the a11y tree (getByText finds it — it is not display:none).
    expect(screen.getByText('Delete incident')).toBeInTheDocument();
  });

  it('renders a <span> by default', () => {
    render(<VisuallyHidden>Label</VisuallyHidden>);
    expect(screen.getByText('Label').tagName).toBe('SPAN');
  });

  it('renders a custom element via the `as` prop', () => {
    render(
      <VisuallyHidden as="div" aria-live="polite">
        Moved task to Done
      </VisuallyHidden>,
    );
    const el = screen.getByText('Moved task to Done');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('applies the clip styles that hide it visually', () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    const el = screen.getByText('Hidden');
    // jsdom does not apply the stylesheet, but the StyleX class is attached.
    expect(el.getAttribute('class')).toBeTruthy();
    // It must NOT be display:none / hidden — it stays in the a11y tree.
    expect(el).not.toHaveAttribute('hidden');
  });

  it('forwards a ref to the rendered element', () => {
    const ref = createRef<HTMLElement>();
    render(<VisuallyHidden ref={ref}>Ref target</VisuallyHidden>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.textContent).toBe('Ref target');
  });

  it('passes through arbitrary BaseProps (id, role, data-*)', () => {
    render(
      <VisuallyHidden id="announcer" role="status" data-testid="vh">
        Status
      </VisuallyHidden>,
    );
    const el = screen.getByTestId('vh');
    expect(el).toHaveAttribute('id', 'announcer');
    expect(el).toHaveAttribute('role', 'status');
  });

  it('gives an icon-only control an accessible name', () => {
    render(
      <button type="button">
        <span aria-hidden="true">🗑️</span>
        <VisuallyHidden>Delete</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole('button', {name: 'Delete'})).toBeInTheDocument();
  });
});
