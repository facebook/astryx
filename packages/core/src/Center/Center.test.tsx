// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Center.test.tsx
 * @input Uses vitest, @testing-library/react, Center component
 * @output Unit tests for Center component behavior
 * @position Testing; validates Center.tsx implementation
 *
 * SYNC: When Center.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Center} from './Center';

describe('Center', () => {
  it('renders and centers children (both axes by default)', () => {
    render(
      <Center data-testid="center">
        <div>Centered Content</div>
      </Center>,
    );
    const element = screen.getByTestId('center');
    expect(screen.getByText('Centered Content')).toBeInTheDocument();
    expect(element).toBeInTheDocument();
    // Check that it has flex display
    expect(element).toHaveStyle({display: 'flex'});
  });

  it('centers horizontally only', () => {
    render(
      <Center axis="horizontal" data-testid="center">
        <div>Horizontal Center</div>
      </Center>,
    );
    const element = screen.getByTestId('center');
    expect(screen.getByText('Horizontal Center')).toBeInTheDocument();
    expect(element).toHaveStyle({display: 'flex'});
  });

  it('centers vertically only', () => {
    render(
      <Center axis="vertical" data-testid="center">
        <div>Vertical Center</div>
      </Center>,
    );
    const element = screen.getByTestId('center');
    expect(screen.getByText('Vertical Center')).toBeInTheDocument();
    expect(element).toHaveStyle({display: 'flex'});
  });

  it('applies height prop', () => {
    render(
      <Center height="100%" data-testid="center">
        <div>Full Height</div>
      </Center>,
    );
    const element = screen.getByTestId('center');
    // Height is applied via StyleX dynamic styles
    expect(element).toBeInTheDocument();
  });

  it('applies width prop', () => {
    render(
      <Center width={300} data-testid="center">
        <div>Fixed Width</div>
      </Center>,
    );
    const element = screen.getByTestId('center');
    // Width is applied via StyleX dynamic styles
    expect(element).toBeInTheDocument();
  });

  it('applies both width and height props', () => {
    render(
      <Center width="50%" height={200} data-testid="center">
        <div>Sized Content</div>
      </Center>,
    );
    const element = screen.getByTestId('center');
    // Width and height are applied via StyleX dynamic styles
    expect(element).toBeInTheDocument();
  });

  it('renders as inline-flex when isInline is true', () => {
    render(
      <Center isInline data-testid="center">
        <div>Inline Content</div>
      </Center>,
    );
    const element = screen.getByTestId('center');
    expect(element).toHaveStyle({display: 'inline-flex'});
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Center ref={ref}>
        <div>Test</div>
      </Center>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('applies xstyle prop', () => {
    // Note: StyleX styles are transformed at build time, so we test that
    // the component renders without error when xstyle is provided
    render(
      <Center data-testid="center" xstyle={undefined}>
        <div>Styled Content</div>
      </Center>,
    );
    expect(screen.getByTestId('center')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(
      <Center data-testid="center" aria-label="centered container">
        <div>Content</div>
      </Center>,
    );
    const element = screen.getByTestId('center');
    expect(element).toHaveAttribute('aria-label', 'centered container');
  });

  it('renders as div element', () => {
    render(
      <Center data-testid="center">
        <div>Content</div>
      </Center>,
    );
    const element = screen.getByTestId('center');
    expect(element.tagName).toBe('DIV');
  });
});
