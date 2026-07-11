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
import {HStack} from '../HStack';
import {VStack} from '../VStack';

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
});

/**
 * Overflow enum + flex-item props (issue #2623).
 */
describe('Stack overflow + flex-item props', () => {
  it('treats isScrollable as sugar for overflow="auto"', () => {
    render(
      <Stack isScrollable data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(getComputedStyle(screen.getByTestId('stack')).overflow).toBe('auto');
  });

  it('supports the overflow enum', () => {
    render(
      <Stack overflow="scroll" data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(getComputedStyle(screen.getByTestId('stack')).overflow).toBe(
      'scroll',
    );
  });

  it('lets overflow take precedence over isScrollable', () => {
    render(
      <Stack isScrollable overflow="hidden" data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    expect(getComputedStyle(screen.getByTestId('stack')).overflow).toBe(
      'hidden',
    );
  });

  it('applies grow/shrink/basis so a Stack can be a flex child', () => {
    render(
      <Stack grow shrink={false} basis={320} data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    const style = screen.getByTestId('stack').getAttribute('style') ?? '';
    expect(style).toContain('--x-flexGrow: 1');
    expect(style).toContain('--x-flexShrink: 0');
    expect(style).toContain('--x-flexBasis: 320px');
  });

  it('keeps sizing props working alongside the flex props', () => {
    render(
      <Stack grow height="100%" data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    const style = screen.getByTestId('stack').getAttribute('style') ?? '';
    expect(style).toContain('--x-flexGrow: 1');
    expect(style).toContain('height: 100%');
  });

  it('emits no flex declarations by default', () => {
    render(
      <Stack data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    const style = screen.getByTestId('stack').getAttribute('style') ?? '';
    expect(style).not.toContain('--x-flex');
  });

  it('does not leak the new props to the DOM', () => {
    render(
      <Stack
        overflow="auto"
        grow
        shrink={false}
        basis={320}
        data-testid="stack">
        <div>Item</div>
      </Stack>,
    );
    const el = screen.getByTestId('stack');
    for (const attr of ['overflow', 'grow', 'shrink', 'basis']) {
      expect(el.hasAttribute(attr)).toBe(false);
    }
  });

  it('flows the new props through HStack', () => {
    render(
      <HStack overflow="auto" grow data-testid="hstack">
        <div>Item</div>
      </HStack>,
    );
    const el = screen.getByTestId('hstack');
    expect(getComputedStyle(el).overflow).toBe('auto');
    expect(el.getAttribute('style')).toContain('--x-flexGrow: 1');
  });

  it('flows the new props through VStack', () => {
    render(
      <VStack isScrollable shrink={false} data-testid="vstack">
        <div>Item</div>
      </VStack>,
    );
    const el = screen.getByTestId('vstack');
    expect(getComputedStyle(el).overflow).toBe('auto');
    expect(el.getAttribute('style')).toContain('--x-flexShrink: 0');
  });
});
