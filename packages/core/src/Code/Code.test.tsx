// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Code.test.tsx
 * @input Uses vitest, @testing-library/react, Code component
 * @output Unit tests for Code component behavior
 * @position Testing; validates Code.tsx implementation
 *
 * SYNC: When Code.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Code} from './Code';

describe('Code', () => {
  it('renders children inside a <code> element', () => {
    render(<Code>const x = 1</Code>);
    const el = screen.getByText('const x = 1');
    expect(el.tagName).toBe('CODE');
  });

  it('forwards ref to the root element', () => {
    const ref = vi.fn();
    render(<Code ref={ref}>code</Code>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('defaults color to primary', () => {
    render(<Code>code</Code>);
    expect(screen.getByText('code')).toHaveClass('astryx-code', 'primary');
  });

  it('applies the secondary color', () => {
    render(<Code color="secondary">code</Code>);
    expect(screen.getByText('code')).toHaveClass('astryx-code', 'secondary');
  });

  it('applies the inherit color', () => {
    render(<Code color="inherit">code</Code>);
    expect(screen.getByText('code')).toHaveClass('astryx-code', 'inherit');
  });

  it('adds a size class when size="inherit" (font-size + line-height inherit)', () => {
    const {rerender} = render(<Code>code</Code>);
    const defaultClass = screen.getByText('code').getAttribute('class');

    rerender(<Code size="inherit">code</Code>);
    const inheritClass = screen.getByText('code').getAttribute('class');

    // size="inherit" adds an extra StyleX class beyond the default rendering.
    expect(inheritClass).not.toEqual(defaultClass);
  });
});
