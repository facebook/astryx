/**
 * @file XDSScrollableArea.test.tsx
 * @input Uses vitest, @testing-library/react, XDSScrollableArea component
 * @output Unit tests for XDSScrollableArea component behavior
 * @position Testing; validates XDSScrollableArea.tsx implementation
 *
 * SYNC: When XDSScrollableArea.tsx changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSScrollableArea} from './XDSScrollableArea';

describe('XDSScrollableArea', () => {
  it('renders children', () => {
    render(
      <XDSScrollableArea data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(
      <XDSScrollableArea data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll').tagName.toLowerCase()).toBe('div');
  });

  it('is keyboard focusable', () => {
    render(
      <XDSScrollableArea data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll')).toHaveAttribute('tabindex', '0');
  });

  it('adds landmark semantics when label is provided', () => {
    render(
      <XDSScrollableArea label="Sidebar navigation" data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    const el = screen.getByTestId('scroll');
    expect(el).toHaveAttribute('role', 'region');
    expect(el).toHaveAttribute('aria-label', 'Sidebar navigation');
  });

  it('does not add landmark semantics without label', () => {
    render(
      <XDSScrollableArea data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    const el = screen.getByTestId('scroll');
    expect(el).not.toHaveAttribute('role');
    expect(el).not.toHaveAttribute('aria-label');
  });

  it('applies maxHeight as inline style (number)', () => {
    render(
      <XDSScrollableArea maxHeight={400} data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll').style.maxHeight).toBe('400px');
  });

  it('applies maxHeight as inline style (string)', () => {
    render(
      <XDSScrollableArea maxHeight="calc(100vh - 64px)" data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll').style.maxHeight).toBe(
      'calc(100vh - 64px)',
    );
  });

  it('applies maxWidth as inline style (number)', () => {
    render(
      <XDSScrollableArea
        orientation="horizontal"
        maxWidth={800}
        data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll').style.maxWidth).toBe('800px');
  });

  it('applies maxWidth as inline style (string)', () => {
    render(
      <XDSScrollableArea
        orientation="horizontal"
        maxWidth="100%"
        data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll').style.maxWidth).toBe('100%');
  });

  it('accepts data-testid', () => {
    render(
      <XDSScrollableArea data-testid="my-scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('my-scroll')).toBeInTheDocument();
  });

  it('renders with orientation="horizontal"', () => {
    render(
      <XDSScrollableArea orientation="horizontal" data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll')).toBeInTheDocument();
  });

  it('renders with orientation="both"', () => {
    render(
      <XDSScrollableArea orientation="both" data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll')).toBeInTheDocument();
  });

  it('renders with size="sm"', () => {
    render(
      <XDSScrollableArea size="sm" data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll')).toBeInTheDocument();
  });

  it('renders with isAlwaysVisible', () => {
    render(
      <XDSScrollableArea isAlwaysVisible data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(screen.getByTestId('scroll')).toBeInTheDocument();
  });

  it('forwards ref to the container div', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(
      <XDSScrollableArea ref={ref} data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId('scroll'));
  });

  it('renders with both maxHeight and maxWidth', () => {
    render(
      <XDSScrollableArea
        orientation="both"
        maxHeight={600}
        maxWidth="100%"
        data-testid="scroll">
        <p>Content</p>
      </XDSScrollableArea>,
    );
    const el = screen.getByTestId('scroll');
    expect(el.style.maxHeight).toBe('600px');
    expect(el.style.maxWidth).toBe('100%');
  });
});
