/**
 * @file XDSHStack.test.tsx
 * @input Uses vitest, @testing-library/react, XDSHStack component
 * @output Unit tests for XDSHStack component behavior
 * @position Testing; validates XDSHStack.tsx implementation
 *
 * SYNC: When XDSHStack.tsx changes, update tests to match new behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XDSHStack } from './XDSHStack';

describe('XDSHStack', () => {
  it('renders children correctly', () => {
    render(
      <XDSHStack>
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSHStack>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    render(<XDSHStack data-testid="hstack">Content</XDSHStack>);
    const element = screen.getByTestId('hstack');
    expect(element.tagName).toBe('DIV');
  });

  it('renders with polymorphic element prop', () => {
    render(
      <XDSHStack element="nav" data-testid="hstack">
        Content
      </XDSHStack>
    );
    const element = screen.getByTestId('hstack');
    expect(element.tagName).toBe('NAV');
  });

  it('renders with gap prop', () => {
    render(
      <XDSHStack gap="space4">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSHStack>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with vAlign prop', () => {
    render(
      <XDSHStack vAlign="center">
        <div>Item 1</div>
      </XDSHStack>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with wrap prop', () => {
    render(
      <XDSHStack wrap="wrap">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSHStack>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSHStack ref={ref}>
        <div>Test</div>
      </XDSHStack>
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards ref with polymorphic element', () => {
    const ref = vi.fn();
    render(
      <XDSHStack element="section" ref={ref}>
        <div>Test</div>
      </XDSHStack>
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <XDSHStack data-testid="hstack">
        <div>Item</div>
      </XDSHStack>
    );
    expect(screen.getByTestId('hstack')).toBeInTheDocument();
  });
});
