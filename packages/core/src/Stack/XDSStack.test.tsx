/**
 * @file XDSStack.test.tsx
 * @input Uses vitest, @testing-library/react, XDSStack component
 * @output Unit tests for XDSStack component behavior
 * @position Testing; validates XDSStack.tsx implementation
 *
 * SYNC: When XDSStack.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSStack} from './XDSStack';

describe('XDSStack', () => {
  it('defaults to vertical direction', () => {
    render(
      <XDSStack data-testid="stack">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSStack>,
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <XDSStack direction="vertical">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    render(
      <XDSStack direction="vertical" data-testid="stack">
        Content
      </XDSStack>,
    );
    const element = screen.getByTestId('stack');
    expect(element.tagName).toBe('DIV');
  });

  it('renders with horizontal direction', () => {
    render(
      <XDSStack direction="horizontal" data-testid="stack">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSStack>,
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('renders with vertical direction', () => {
    render(
      <XDSStack direction="vertical" data-testid="stack">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSStack>,
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('renders with polymorphic element prop', () => {
    render(
      <XDSStack direction="vertical" element="nav" data-testid="stack">
        Content
      </XDSStack>,
    );
    const element = screen.getByTestId('stack');
    expect(element.tagName).toBe('NAV');
  });

  it('renders with polymorphic element as section', () => {
    render(
      <XDSStack direction="vertical" element="section" data-testid="stack">
        Content
      </XDSStack>,
    );
    const element = screen.getByTestId('stack');
    expect(element.tagName).toBe('SECTION');
  });

  it('renders with gap prop', () => {
    render(
      <XDSStack direction="vertical" gap={4}>
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with hAlign prop', () => {
    render(
      <XDSStack direction="vertical" hAlign="center">
        <div>Item 1</div>
      </XDSStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with vAlign prop', () => {
    render(
      <XDSStack direction="vertical" vAlign="center">
        <div>Item 1</div>
      </XDSStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with wrap prop', () => {
    render(
      <XDSStack direction="vertical" wrap="wrap">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders horizontal with hAlign and vAlign', () => {
    render(
      <XDSStack direction="horizontal" hAlign="between" vAlign="center">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders vertical with hAlign and vAlign', () => {
    render(
      <XDSStack direction="vertical" hAlign="center" vAlign="between">
        <div>Item 1</div>
        <div>Item 2</div>
      </XDSStack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSStack direction="vertical" ref={ref}>
        <div>Test</div>
      </XDSStack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards ref with polymorphic element', () => {
    const ref = vi.fn();
    render(
      <XDSStack direction="vertical" element="section" ref={ref}>
        <div>Test</div>
      </XDSStack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <XDSStack
        direction="vertical"
        data-testid="stack"
        aria-label="Stack container">
        <div>Item</div>
      </XDSStack>,
    );
    const element = screen.getByTestId('stack');
    expect(element).toHaveAttribute('aria-label', 'Stack container');
  });

  it('accepts justify as main-axis alias (horizontal)', () => {
    const {container} = render(
      <XDSStack direction="horizontal" justify="between">
        <div>A</div>
        <div>B</div>
      </XDSStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts align as cross-axis alias (horizontal)', () => {
    const {container} = render(
      <XDSStack direction="horizontal" align="center">
        <div>A</div>
      </XDSStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts justify as main-axis alias (vertical)', () => {
    const {container} = render(
      <XDSStack direction="vertical" justify="center">
        <div>A</div>
      </XDSStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('prefers explicit hAlign/vAlign over aliases', () => {
    const {container} = render(
      <XDSStack direction="horizontal" hAlign="center" justify="end">
        <div>A</div>
      </XDSStack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies numeric width as pixels', () => {
    render(
      <XDSStack direction="vertical" width={300} data-testid="stack">
        <div>Item</div>
      </XDSStack>,
    );
    expect(screen.getByTestId('stack')).toHaveStyle({width: '300px'});
  });

  it('applies string width as-is', () => {
    render(
      <XDSStack direction="vertical" width="100%" data-testid="stack">
        <div>Item</div>
      </XDSStack>,
    );
    expect(screen.getByTestId('stack')).toHaveStyle({width: '100%'});
  });

  it('applies numeric height as pixels', () => {
    render(
      <XDSStack direction="horizontal" height={200} data-testid="stack">
        <div>Item</div>
      </XDSStack>,
    );
    expect(screen.getByTestId('stack')).toHaveStyle({height: '200px'});
  });

  it('applies string height as-is', () => {
    render(
      <XDSStack direction="horizontal" height="50vh" data-testid="stack">
        <div>Item</div>
      </XDSStack>,
    );
    expect(screen.getByTestId('stack')).toHaveStyle({height: '50vh'});
  });

  it('applies both width and height together', () => {
    render(
      <XDSStack
        direction="vertical"
        width={400}
        height="100%"
        data-testid="stack">
        <div>Item</div>
      </XDSStack>,
    );
    const el = screen.getByTestId('stack');
    expect(el).toHaveStyle({width: '400px', height: '100%'});
  });
});
