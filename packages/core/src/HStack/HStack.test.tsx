// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file HStack.test.tsx
 * @input Uses vitest, @testing-library/react, HStack component
 * @output Unit tests for HStack component behavior
 * @position Testing; validates HStack.tsx implementation
 *
 * SYNC: When HStack.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {HStack} from './HStack';

describe('HStack', () => {
  it('renders children correctly', () => {
    render(
      <HStack>
        <div>Item 1</div>
        <div>Item 2</div>
      </HStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    render(<HStack data-testid="hstack">Content</HStack>);
    const element = screen.getByTestId('hstack');
    expect(element.tagName).toBe('DIV');
  });

  it('renders with polymorphic as prop', () => {
    render(
      <HStack as="nav" data-testid="hstack">
        Content
      </HStack>,
    );
    const element = screen.getByTestId('hstack');
    expect(element.tagName).toBe('NAV');
  });

  it('renders with gap prop', () => {
    render(
      <HStack gap={4}>
        <div>Item 1</div>
        <div>Item 2</div>
      </HStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with vAlign prop', () => {
    render(
      <HStack vAlign="center">
        <div>Item 1</div>
      </HStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with wrap prop', () => {
    render(
      <HStack wrap="wrap">
        <div>Item 1</div>
        <div>Item 2</div>
      </HStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <HStack ref={ref}>
        <div>Test</div>
      </HStack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards ref with polymorphic as', () => {
    const ref = vi.fn();
    render(
      <HStack as="section" ref={ref}>
        <div>Test</div>
      </HStack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <HStack data-testid="hstack">
        <div>Item</div>
      </HStack>,
    );
    expect(screen.getByTestId('hstack')).toBeInTheDocument();
  });

  it('accepts justify as alias for hAlign', () => {
    const {container} = render(
      <HStack justify="between">
        <div>A</div>
        <div>B</div>
      </HStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts align as alias for vAlign', () => {
    const {container} = render(
      <HStack align="center">
        <div>A</div>
      </HStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('prefers explicit hAlign over justify', () => {
    const {container} = render(
      <HStack hAlign="center" justify="end">
        <div>A</div>
      </HStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('inherits isSticky/stickyOffset from Stack', () => {
    const {rerender} = render(
      <HStack data-testid="hstack">
        <div>Item</div>
      </HStack>,
    );
    const plain = screen.getByTestId('hstack').className;
    rerender(
      <HStack isSticky stickyOffset={4} data-testid="hstack">
        <div>Item</div>
      </HStack>,
    );
    const sticky = screen.getByTestId('hstack').className;
    expect(sticky).not.toBe('');
    expect(sticky).not.toBe(plain);
  });
});
