// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Stack.test.tsx
 * @input Uses vitest, @testing-library/react, Stack component
 * @output Unit tests for Stack component behavior
 * @position Testing; validates Stack.tsx implementation
 *
 * SYNC: When Stack.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Stack} from './Stack';

/**
 * The functional class output, as an order-insensitive set. StyleX's dev
 * runtime also emits readable debug classes naming the style object a
 * declaration came from ("padding__paddingBlockStyles.2"); those record
 * provenance rather than applied CSS and survive even when the declaration
 * they name loses a merge, so they are dropped here.
 */
function classSet(el: HTMLElement): Set<string> {
  return new Set(
    el.className
      .split(' ')
      .filter(Boolean)
      .filter(c => !c.includes('__') && !c.includes('.')),
  );
}

describe('Stack', () => {
  it('defaults to vertical direction', () => {
    render(
      <Stack data-testid="stack">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <Stack direction="vertical">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    render(
      <Stack direction="vertical" data-testid="stack">
        Content
      </Stack>,
    );
    const element = screen.getByTestId('stack');
    expect(element.tagName).toBe('DIV');
  });

  it('renders with horizontal direction', () => {
    render(
      <Stack direction="horizontal" data-testid="stack">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('renders with vertical direction', () => {
    render(
      <Stack direction="vertical" data-testid="stack">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('renders with polymorphic as prop', () => {
    render(
      <Stack direction="vertical" as="nav" data-testid="stack">
        Content
      </Stack>,
    );
    const element = screen.getByTestId('stack');
    expect(element.tagName).toBe('NAV');
  });

  it('renders with polymorphic as section', () => {
    render(
      <Stack direction="vertical" as="section" data-testid="stack">
        Content
      </Stack>,
    );
    const element = screen.getByTestId('stack');
    expect(element.tagName).toBe('SECTION');
  });

  it('renders with gap prop', () => {
    render(
      <Stack direction="vertical" gap={4}>
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with hAlign prop', () => {
    render(
      <Stack direction="vertical" hAlign="center">
        <div>Item 1</div>
      </Stack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with vAlign prop', () => {
    render(
      <Stack direction="vertical" vAlign="center">
        <div>Item 1</div>
      </Stack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with wrap prop', () => {
    render(
      <Stack direction="vertical" wrap="wrap">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders horizontal with hAlign and vAlign', () => {
    render(
      <Stack direction="horizontal" hAlign="between" vAlign="center">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders vertical with hAlign and vAlign', () => {
    render(
      <Stack direction="vertical" hAlign="center" vAlign="between">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Stack direction="vertical" ref={ref}>
        <div>Test</div>
      </Stack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards ref with polymorphic as', () => {
    const ref = vi.fn();
    render(
      <Stack direction="vertical" as="section" ref={ref}>
        <div>Test</div>
      </Stack>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <Stack
        direction="vertical"
        data-testid="stack"
        aria-label="Stack container">
        <div>Item</div>
      </Stack>,
    );
    const element = screen.getByTestId('stack');
    expect(element).toHaveAttribute('aria-label', 'Stack container');
  });

  it('accepts justify as main-axis alias (horizontal)', () => {
    const {container} = render(
      <Stack direction="horizontal" justify="between">
        <div>A</div>
        <div>B</div>
      </Stack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts align as cross-axis alias (horizontal)', () => {
    const {container} = render(
      <Stack direction="horizontal" align="center">
        <div>A</div>
      </Stack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts justify as main-axis alias (vertical)', () => {
    const {container} = render(
      <Stack direction="vertical" justify="center">
        <div>A</div>
      </Stack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('prefers explicit hAlign/vAlign over aliases', () => {
    const {container} = render(
      <Stack direction="horizontal" hAlign="center" justify="end">
        <div>A</div>
      </Stack>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies numeric width as pixels', () => {
    render(
      <Stack direction="vertical" width={300} data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveStyle({width: '300px'});
  });

  it('applies string width as-is', () => {
    render(
      <Stack direction="vertical" width="100%" data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveStyle({width: '100%'});
  });

  it('applies numeric height as pixels', () => {
    render(
      <Stack direction="horizontal" height={200} data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveStyle({height: '200px'});
  });

  it('applies string height as-is', () => {
    render(
      <Stack direction="horizontal" height="50vh" data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toHaveStyle({height: '50vh'});
  });

  it('applies both width and height together', () => {
    render(
      <Stack direction="vertical" width={400} height="100%" data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    const el = screen.getByTestId('stack');
    expect(el).toHaveStyle({width: '400px', height: '100%'});
  });

  it('applies a class when padding is set', () => {
    render(
      <Stack padding={3} data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack').className).not.toBe('');
  });

  it('accepts paddingInline and paddingBlock without error', () => {
    render(
      <Stack paddingInline={4} paddingBlock={2} data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('lets paddingInline/paddingBlock override padding on their axis', () => {
    // padding sets both axes; paddingInline overrides the inline axis. The
    // component should render without conflict and carry a class.
    render(
      <Stack padding={2} paddingInline={5} data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack').className).not.toBe('');
  });

  it('applies a class when isScrollable is set', () => {
    render(
      <Stack isScrollable data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack').className).not.toBe('');
  });

  it('does not set overflow class when isScrollable is false', () => {
    const {rerender} = render(
      <Stack data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    const withoutScroll = screen.getByTestId('stack').className;
    rerender(
      <Stack isScrollable data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    const withScroll = screen.getByTestId('stack').className;
    expect(withScroll).not.toBe(withoutScroll);
  });

  it('applies a class when paddingBlockStart is set on its own', () => {
    const {rerender} = render(
      <Stack data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    const baseline = screen.getByTestId('stack').className;
    rerender(
      <Stack paddingBlockStart={2} data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack').className).not.toBe(baseline);
  });

  it('lets paddingBlockStart/paddingBlockEnd override only their own edge', () => {
    const {rerender} = render(
      <Stack padding={4} paddingBlockStart={2} data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    const perEdge = classSet(screen.getByTestId('stack'));
    rerender(
      <Stack
        paddingInline={4}
        paddingBlockStart={2}
        paddingBlockEnd={4}
        data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    expect(perEdge).toEqual(classSet(screen.getByTestId('stack')));
  });

  it('gives paddingBlockEnd precedence over paddingBlock', () => {
    const {rerender} = render(
      <Stack paddingBlock={6} paddingBlockEnd={0} data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    const overridden = classSet(screen.getByTestId('stack'));
    rerender(
      <Stack paddingBlockStart={6} paddingBlockEnd={0} data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    expect(overridden).toEqual(classSet(screen.getByTestId('stack')));
  });

  it('leaves padding/paddingBlock output unchanged when no edge prop is set', () => {
    const {rerender} = render(
      <Stack padding={3} data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    const uniform = classSet(screen.getByTestId('stack'));
    rerender(
      <Stack paddingInline={3} paddingBlock={3} data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    expect(uniform).toEqual(classSet(screen.getByTestId('stack')));
  });

  it('applies a class when paddingInlineStart is set on its own', () => {
    const {rerender} = render(
      <Stack data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    const baseline = screen.getByTestId('stack').className;
    rerender(
      <Stack paddingInlineStart={2} data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    expect(screen.getByTestId('stack').className).not.toBe(baseline);
  });

  it('lets paddingInlineStart/paddingInlineEnd override only their own edge', () => {
    const {rerender} = render(
      <Stack padding={4} paddingInlineStart={2} data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    const perEdge = classSet(screen.getByTestId('stack'));
    rerender(
      <Stack
        paddingInlineStart={2}
        paddingInlineEnd={4}
        paddingBlock={4}
        data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    expect(perEdge).toEqual(classSet(screen.getByTestId('stack')));
  });

  it('gives paddingInlineEnd precedence over paddingInline', () => {
    const {rerender} = render(
      <Stack paddingInline={6} paddingInlineEnd={0} data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    const overridden = classSet(screen.getByTestId('stack'));
    rerender(
      <Stack paddingInlineStart={6} paddingInlineEnd={0} data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    expect(overridden).toEqual(classSet(screen.getByTestId('stack')));
  });

  it('resolves all four edges independently', () => {
    // One prop per edge, each a different step: the four-edge spelling and the
    // shorthand-plus-overrides spelling must agree.
    const {rerender} = render(
      <Stack
        paddingInlineStart={1}
        paddingInlineEnd={2}
        paddingBlockStart={3}
        paddingBlockEnd={4}
        data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    const explicit = classSet(screen.getByTestId('stack'));
    rerender(
      <Stack
        padding={4}
        paddingInlineStart={1}
        paddingInlineEnd={2}
        paddingBlockStart={3}
        data-testid="stack">
        <div>Content</div>
      </Stack>,
    );
    expect(explicit).toEqual(classSet(screen.getByTestId('stack')));
  });
});
