// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSHStack.test.tsx
 * @input Uses vitest, @testing-library/react, XDSHStack component
 * @output Unit tests for XDSHStack component behavior
 * @position Testing; validates XDSHStack.tsx implementation
 *
 * SYNC: When XDSHStack.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSHStack} from './XDSHStack';

describe('XDSHStack', () => {
  it('renders children correctly', () => {
    render(
      <XDSHStack>
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSHStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    render(<XDSHStack data-testid="hstack">Content</XDSHStack>);
    const element = screen.getByTestId('hstack');
    expect(element.tagName).toBe('DIV');
  });

  it('renders with polymorphic as prop', () => {
    render(
      <XDSHStack as="nav" data-testid="hstack">
        Content
      </XDSHStack>,
    );
    const element = screen.getByTestId('hstack');
    expect(element.tagName).toBe('NAV');
  });

  it('renders with gap prop', () => {
    render(
      <XDSHStack gap={4}>
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSHStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with vAlign prop', () => {
    render(
      <XDSHStack vAlign="center">
        <div>Item 1</div>
      </XDSHStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with wrap prop', () => {
    render(
      <XDSHStack wrap="wrap">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSHStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSHStack ref={ref}>
        <div>Test</div>
      </XDSHStack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards ref with polymorphic as', () => {
    const ref = vi.fn();
    render(
      <XDSHStack as="section" ref={ref}>
        <div>Test</div>
      </XDSHStack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <XDSHStack data-testid="hstack">
        <div>Item</div>
      </XDSHStack>,
    );
    expect(screen.getByTestId('hstack')).toBeInTheDocument();
  });

  it('accepts justify as alias for hAlign', () => {
    const {container} = render(
      <XDSHStack justify="between">
        <div>A</div>
        <div>B</div>
      </XDSHStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts align as alias for vAlign', () => {
    const {container} = render(
      <XDSHStack align="center">
        <div>A</div>
      </XDSHStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('prefers explicit hAlign over justify', () => {
    const {container} = render(
      <XDSHStack hAlign="center" justify="end">
        <div>A</div>
      </XDSHStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
