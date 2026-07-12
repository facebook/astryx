// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file StackItem.test.tsx
 * @input Uses vitest, @testing-library/react, StackItem component
 * @output Unit tests for StackItem component behavior
 * @position Testing; validates StackItem.tsx implementation
 *
 * SYNC: When StackItem.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {StackItem} from './StackItem';
import {stackItem, type StackItemOptions} from './stackItem.stylex';

describe('StackItem', () => {
  it('renders children correctly', () => {
    render(<StackItem>Test content</StackItem>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    render(<StackItem data-testid="stack-item">Content</StackItem>);
    const element = screen.getByTestId('stack-item');
    expect(element.tagName).toBe('DIV');
  });

  it('renders with polymorphic as prop', () => {
    render(
      <StackItem as="section" data-testid="stack-item">
        Content
      </StackItem>,
    );
    const element = screen.getByTestId('stack-item');
    expect(element.tagName).toBe('SECTION');
  });

  it('renders with size prop', () => {
    render(<StackItem size="fill">Content</StackItem>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with static size', () => {
    render(<StackItem size="static">Content</StackItem>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with crossAlignSelf prop', () => {
    render(<StackItem crossAlignSelf="center">Content</StackItem>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <StackItem ref={ref}>
        <div>Test</div>
      </StackItem>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('forwards ref with polymorphic as', () => {
    const ref = vi.fn();
    render(
      <StackItem as="section" ref={ref}>
        <div>Test</div>
      </StackItem>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(
      <StackItem data-testid="stack-item" aria-label="Stack item">
        Content
      </StackItem>,
    );
    const element = screen.getByTestId('stack-item');
    expect(element).toHaveAttribute('aria-label', 'Stack item');
  });

  it('applies an overflow class when isScrollable is set', () => {
    const {rerender} = render(
      <StackItem data-testid="stack-item">Content</StackItem>,
    );
    const withoutScroll = screen.getByTestId('stack-item').className;
    rerender(
      <StackItem isScrollable data-testid="stack-item">
        Content
      </StackItem>,
    );
    const withScroll = screen.getByTestId('stack-item').className;
    expect(withScroll).not.toBe(withoutScroll);
  });

  it('composes isScrollable with size="fill"', () => {
    render(
      <StackItem size="fill" isScrollable data-testid="stack-item">
        Content
      </StackItem>,
    );
    expect(screen.getByTestId('stack-item').className).not.toBe('');
  });
});

/**
 * Flex-item props (issue #2623). StackItem is the canonical home for
 * grow/shrink/basis per the layout-prop standard (#3223).
 */
describe('StackItem flex-item props', () => {
  it('lets shrink override the flexShrink:0 baked into the default size', () => {
    // `size` defaults to 'static', which always applies flexGrow:0 + flexShrink:0.
    // An explicit `shrink` must be layered after it, or it is silently eaten.
    render(
      <StackItem shrink data-testid="stack-item">
        Content
      </StackItem>,
    );
    expect(getComputedStyle(screen.getByTestId('stack-item')).flexShrink).toBe(
      '1',
    );
  });

  it('lets grow override the flexGrow:0 baked into the default size', () => {
    render(
      <StackItem grow data-testid="stack-item">
        Content
      </StackItem>,
    );
    expect(getComputedStyle(screen.getByTestId('stack-item')).flexGrow).toBe(
      '1',
    );
  });

  it('lets grow={false} cancel size="fill"', () => {
    render(
      <StackItem size="fill" grow={false} data-testid="stack-item">
        Content
      </StackItem>,
    );
    expect(getComputedStyle(screen.getByTestId('stack-item')).flexGrow).toBe(
      '0',
    );
  });

  it('keeps size="fill" semantics when no explicit grow is given', () => {
    render(
      <StackItem size="fill" shrink={false} data-testid="stack-item">
        Content
      </StackItem>,
    );
    const el = screen.getByTestId('stack-item');
    expect(getComputedStyle(el).flexGrow).toBe('1');
    expect(getComputedStyle(el).flexShrink).toBe('0');
  });

  it('accepts numeric factors and a size basis', () => {
    render(
      <StackItem grow={2} shrink={3} basis={320} data-testid="stack-item">
        Content
      </StackItem>,
    );
    const style = screen.getByTestId('stack-item').getAttribute('style') ?? '';
    expect(style).toContain('--x-flexGrow: 2');
    expect(style).toContain('--x-flexShrink: 3');
    expect(style).toContain('--x-flexBasis: 320px');
  });

  it('accepts a string basis', () => {
    render(
      <StackItem basis="50%" data-testid="stack-item">
        Content
      </StackItem>,
    );
    expect(screen.getByTestId('stack-item').getAttribute('style')).toContain(
      '--x-flexBasis: 50%',
    );
  });

  it('emits no flex declarations by default', () => {
    render(<StackItem data-testid="stack-item">Content</StackItem>);
    expect(screen.getByTestId('stack-item').getAttribute('style')).toBeNull();
  });

  it('emits no inline custom property for boolean grow/shrink', () => {
    // The common case is a plain static class: no style attribute, no custom
    // property, fully cacheable CSS.
    render(
      <StackItem grow shrink={false} data-testid="stack-item">
        Content
      </StackItem>,
    );
    expect(screen.getByTestId('stack-item').getAttribute('style')).toBeNull();
  });

  it('does not leak the new props to the DOM', () => {
    render(
      <StackItem
        grow
        shrink={false}
        basis={320}
        isScrollable
        data-testid="stack-item">
        Content
      </StackItem>,
    );
    const el = screen.getByTestId('stack-item');
    for (const attr of ['grow', 'shrink', 'basis', 'isscrollable']) {
      expect(el.hasAttribute(attr)).toBe(false);
    }
  });
});

describe('stackItem() style utility', () => {
  function Probe(options: StackItemOptions) {
    return <div data-testid="probe" {...stylex.props(...stackItem(options))} />;
  }

  it('exposes grow/shrink/basis to direct stylex consumers', () => {
    render(<Probe shrink basis={200} />);
    const el = screen.getByTestId('probe');
    expect(getComputedStyle(el).flexShrink).toBe('1');
    expect(el.getAttribute('style')).toContain('--x-flexBasis: 200px');
  });

  it('exposes isScrollable to direct stylex consumers', () => {
    render(<Probe isScrollable />);
    expect(getComputedStyle(screen.getByTestId('probe')).overflow).toBe('auto');
  });
});
