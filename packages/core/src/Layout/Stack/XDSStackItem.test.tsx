/**
 * @file XDSStackItem.test.tsx
 * @input Uses vitest, @testing-library/react, XDSStackItem component
 * @output Unit tests for XDSStackItem component behavior
 * @position Testing; validates XDSStackItem.tsx implementation
 *
 * SYNC: When XDSStackItem.tsx changes, update tests to match new behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XDSStackItem } from './XDSStackItem';

describe('XDSStackItem', () => {
  it('renders children correctly', () => {
    render(<XDSStackItem>Test content</XDSStackItem>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    render(<XDSStackItem data-testid="stack-item">Content</XDSStackItem>);
    const element = screen.getByTestId('stack-item');
    expect(element.tagName).toBe('DIV');
  });

  it('renders with polymorphic element prop', () => {
    render(
      <XDSStackItem element="section" data-testid="stack-item">
        Content
      </XDSStackItem>
    );
    const element = screen.getByTestId('stack-item');
    expect(element.tagName).toBe('SECTION');
  });

  it('renders with size prop', () => {
    render(<XDSStackItem size="fill">Content</XDSStackItem>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with static size', () => {
    render(<XDSStackItem size="static">Content</XDSStackItem>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with crossAlignSelf prop', () => {
    render(<XDSStackItem crossAlignSelf="center">Content</XDSStackItem>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSStackItem ref={ref}>
        <div>Test</div>
      </XDSStackItem>
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('forwards ref with polymorphic element', () => {
    const ref = vi.fn();
    render(
      <XDSStackItem element="section" ref={ref}>
        <div>Test</div>
      </XDSStackItem>
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <XDSStackItem data-testid="stack-item" aria-label="Stack item">
        Content
      </XDSStackItem>
    );
    const element = screen.getByTestId('stack-item');
    expect(element).toHaveAttribute('aria-label', 'Stack item');
  });
});
