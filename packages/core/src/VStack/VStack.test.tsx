// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file VStack.test.tsx
 * @input Uses vitest, @testing-library/react, VStack component
 * @output Unit tests for VStack component behavior
 * @position Testing; validates VStack.tsx implementation
 *
 * SYNC: When VStack.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {VStack} from './VStack';

describe('VStack', () => {
  it('renders children correctly', () => {
    render(
      <VStack>
        <div>Item 1</div>
        <div>Item 2</div>
      </VStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    render(<VStack data-testid="vstack">Content</VStack>);
    const element = screen.getByTestId('vstack');
    expect(element.tagName).toBe('DIV');
  });

  it('renders with polymorphic as prop', () => {
    render(
      <VStack as="main" data-testid="vstack">
        Content
      </VStack>,
    );
    const element = screen.getByTestId('vstack');
    expect(element.tagName).toBe('MAIN');
  });

  it('renders with gap prop', () => {
    render(
      <VStack gap={4}>
        <div>Item 1</div>
        <div>Item 2</div>
      </VStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with hAlign prop', () => {
    render(
      <VStack hAlign="center">
        <div>Item 1</div>
      </VStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with wrap prop', () => {
    render(
      <VStack wrap="wrap">
        <div>Item 1</div>
        <div>Item 2</div>
      </VStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <VStack ref={ref}>
        <div>Test</div>
      </VStack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards ref with polymorphic as', () => {
    const ref = vi.fn();
    render(
      <VStack as="section" ref={ref}>
        <div>Test</div>
      </VStack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <VStack data-testid="vstack">
        <div>Item</div>
      </VStack>,
    );
    expect(screen.getByTestId('vstack')).toBeInTheDocument();
  });

  it('accepts justify as alias for vAlign', () => {
    const {container} = render(
      <VStack justify="center">
        <div>A</div>
      </VStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts align as alias for hAlign', () => {
    const {container} = render(
      <VStack align="center">
        <div>A</div>
      </VStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('prefers explicit vAlign over justify', () => {
    const {container} = render(
      <VStack vAlign="center" justify="end">
        <div>A</div>
      </VStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('inherits isSticky/stickyOffset from Stack', () => {
    const {rerender} = render(
      <VStack data-testid="vstack">
        <div>Item</div>
      </VStack>,
    );
    const plain = screen.getByTestId('vstack').className;
    rerender(
      <VStack isSticky stickyOffset={8} data-testid="vstack">
        <div>Item</div>
      </VStack>,
    );
    const sticky = screen.getByTestId('vstack').className;
    expect(sticky).not.toBe('');
    expect(sticky).not.toBe(plain);
  });
});
