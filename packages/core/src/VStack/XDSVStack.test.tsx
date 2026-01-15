/**
 * @file XDSVStack.test.tsx
 * @input Uses vitest, @testing-library/react, XDSVStack component
 * @output Unit tests for XDSVStack component behavior
 * @position Testing; validates XDSVStack.tsx implementation
 *
 * SYNC: When XDSVStack.tsx changes, update tests to match new behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XDSVStack } from './XDSVStack';

describe('XDSVStack', () => {
  it('renders children correctly', () => {
    render(
      <XDSVStack>
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSVStack>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders with gap prop', () => {
    render(
      <XDSVStack gap={16}>
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSVStack>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with hAlign prop', () => {
    render(
      <XDSVStack hAlign="center">
        <div>Item 1</div>
      </XDSVStack>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with wrap prop', () => {
    render(
      <XDSVStack wrap="wrap">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSVStack>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSVStack ref={ref}>
        <div>Test</div>
      </XDSVStack>
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('passes through additional props', () => {
    render(
      <XDSVStack data-testid="vstack">
        <div>Item</div>
      </XDSVStack>
    );
    expect(screen.getByTestId('vstack')).toBeInTheDocument();
  });
});
