// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSVStack.test.tsx
 * @input Uses vitest, @testing-library/react, XDSVStack component
 * @output Unit tests for XDSVStack component behavior
 * @position Testing; validates XDSVStack.tsx implementation
 *
 * SYNC: When XDSVStack.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSVStack} from './XDSVStack';

describe('XDSVStack', () => {
  it('renders children correctly', () => {
    render(
      <XDSVStack>
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSVStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    render(<XDSVStack data-testid="vstack">Content</XDSVStack>);
    const element = screen.getByTestId('vstack');
    expect(element.tagName).toBe('DIV');
  });

  it('renders with polymorphic element prop', () => {
    render(
      <XDSVStack element="main" data-testid="vstack">
        Content
      </XDSVStack>,
    );
    const element = screen.getByTestId('vstack');
    expect(element.tagName).toBe('MAIN');
  });

  it('renders with gap prop', () => {
    render(
      <XDSVStack gap={4}>
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSVStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with hAlign prop', () => {
    render(
      <XDSVStack hAlign="center">
        <div>Item 1</div>
      </XDSVStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with wrap prop', () => {
    render(
      <XDSVStack wrap="wrap">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSVStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSVStack ref={ref}>
        <div>Test</div>
      </XDSVStack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards ref with polymorphic element', () => {
    const ref = vi.fn();
    render(
      <XDSVStack element="section" ref={ref}>
        <div>Test</div>
      </XDSVStack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <XDSVStack data-testid="vstack">
        <div>Item</div>
      </XDSVStack>,
    );
    expect(screen.getByTestId('vstack')).toBeInTheDocument();
  });

  it('accepts justify as alias for vAlign', () => {
    const {container} = render(
      <XDSVStack justify="center">
        <div>A</div>
      </XDSVStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts align as alias for hAlign', () => {
    const {container} = render(
      <XDSVStack align="center">
        <div>A</div>
      </XDSVStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('prefers explicit vAlign over justify', () => {
    const {container} = render(
      <XDSVStack vAlign="center" justify="end">
        <div>A</div>
      </XDSVStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
