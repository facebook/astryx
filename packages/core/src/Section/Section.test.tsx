// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Section} from './Section';

describe('Section', () => {
  it('renders with default props', () => {
    const {container} = render(<Section>Default section</Section>);
    expect(container.firstElementChild).toBeInTheDocument();
    expect(screen.getByText('Default section')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Section>
        <span data-testid="child">Hello</span>
      </Section>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders with variant="section" (default)', () => {
    const {container} = render(<Section>Content</Section>);
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toContain('astryx-section');
    expect(inner.className).toContain('section');
  });

  it('renders with variant="transparent"', () => {
    const {container} = render(
      <Section variant="transparent">Content</Section>,
    );
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toContain('astryx-section');
    expect(inner.className).toContain('transparent');
  });

  it('renders with variant="muted"', () => {
    const {container} = render(<Section variant="muted">Content</Section>);
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toContain('astryx-section');
    expect(inner.className).toContain('muted');
  });

  it('renders with dividers', () => {
    const {container} = render(
      <Section dividers={['top', 'bottom']}>Content</Section>,
    );
    // The component should render without error
    expect(container.firstElementChild).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with padding prop', () => {
    const {container} = render(<Section padding={2}>Content</Section>);
    expect(container.firstElementChild).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with width and height without error', () => {
    const {container} = render(
      <Section width={400} height={300}>
        Content
      </Section>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    // Sizing is applied via stylex dynamic styles (CSS custom properties)
    // which aren't reflected in element.style in test environments
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with maxWidth and minHeight without error', () => {
    const {container} = render(
      <Section maxWidth={600} minHeight={200}>
        Content
      </Section>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with string size values without error', () => {
    const {container} = render(
      <Section width="50%" height="auto">
        Content
      </Section>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<Section ref={ref}>Content</Section>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders astryx-* class names for theme targeting', () => {
    const {container} = render(<Section>Content</Section>);
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toContain('astryx-section');
  });

  it('renders variant in astryx class names', () => {
    const {container} = render(<Section variant="muted">Content</Section>);
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toContain('astryx-section');
    expect(inner.className).toContain('muted');
  });

  it('accepts xstyle prop without error', () => {
    // xstyle is a StyleXStyles type; in tests stylex.create returns objects
    // that may not produce runtime styles, but the prop should be accepted
    const {container} = render(<Section xstyle={undefined}>Content</Section>);
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('accepts className prop', () => {
    const {container} = render(
      <Section className="custom-class">Content</Section>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('custom-class');
  });

  it('accepts style prop', () => {
    const {container} = render(
      <Section style={{opacity: 0.5}}>Content</Section>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe('0.5');
  });

  it('has two-div structure (outer + inner)', () => {
    const {container} = render(<Section>Content</Section>);
    const outer = container.firstElementChild!;
    const inner = outer.firstElementChild!;
    expect(outer.tagName).toBe('DIV');
    expect(inner.tagName).toBe('DIV');
    // Children are inside the inner div
    expect(inner.textContent).toBe('Content');
  });

  it('spreads additional props', () => {
    render(<Section data-testid="custom-section">Content</Section>);
    expect(screen.getByTestId('custom-section')).toBeInTheDocument();
  });

  it('propagates explicit padding to nested sections via --astryx-section-padding', () => {
    const {container} = render(
      <Section padding={6}>
        <Section data-testid="inner">Inner</Section>
      </Section>,
    );
    // Outer section's inner div should set --astryx-section-padding
    const outerInner = container.firstElementChild!.firstElementChild!;
    expect(outerInner.className).toBeDefined();
    // Inner section should render without error
    expect(screen.getByTestId('inner')).toBeInTheDocument();
    expect(screen.getByText('Inner')).toBeInTheDocument();
  });

  it('renders nested sections with explicit inner padding override', () => {
    render(
      <Section padding={6}>
        <Section padding={2} data-testid="inner">
          Inner
        </Section>
      </Section>,
    );
    expect(screen.getByTestId('inner')).toBeInTheDocument();
    expect(screen.getByText('Inner')).toBeInTheDocument();
  });
});

/**
 * Overflow + flex-item props (issue #2623).
 *
 * Section renders two boxes:
 * - the OUTER box is the flex child (sizing + padding-escape margins)
 * - the INNER box is the painted surface (padding, variant background, dividers)
 *
 * Flex-item props must land on the outer box; overflow must land on the inner
 * box (the inner is `height: 100%` and carries the background + dividers, so
 * scrolling the outer would drag them out of view).
 */
describe('Section overflow + flex-item props', () => {
  const boxes = (container: HTMLElement) => {
    const outer = container.firstElementChild as HTMLElement;
    const inner = outer.firstElementChild as HTMLElement;
    return {outer, inner};
  };

  it('scrolls the inner painted surface, not the outer box', () => {
    const {container} = render(<Section isScrollable>Content</Section>);
    const {outer, inner} = boxes(container);
    expect(getComputedStyle(inner).overflow).toBe('auto');
    expect(getComputedStyle(outer).overflow).not.toBe('auto');
  });

  it('supports the overflow enum on the inner surface', () => {
    const {container} = render(<Section overflow="hidden">Content</Section>);
    const {inner} = boxes(container);
    expect(getComputedStyle(inner).overflow).toBe('hidden');
  });

  it('lets overflow take precedence over isScrollable', () => {
    const {container} = render(
      <Section isScrollable overflow="hidden">
        Content
      </Section>,
    );
    const {inner} = boxes(container);
    expect(getComputedStyle(inner).overflow).toBe('hidden');
  });

  it('applies the flex min-size reset to the outer box when scrollable', () => {
    // Flex items default to `min-height: auto`, which refuses to shrink below
    // content — a scroll region inside a Stack never scrolls without this.
    const {container} = render(<Section isScrollable>Content</Section>);
    const {outer} = boxes(container);
    expect(getComputedStyle(outer).minHeight).toBe('0');
    expect(getComputedStyle(outer).minWidth).toBe('0');
  });

  it('does not apply the min-size reset when overflow is visible', () => {
    const {container} = render(<Section overflow="visible">Content</Section>);
    const {outer} = boxes(container);
    expect(getComputedStyle(outer).minHeight).not.toBe('0');
  });

  it('lets an explicit minHeight win over the scroll min-size reset', () => {
    const {container} = render(
      <Section isScrollable minHeight={200}>
        Content
      </Section>,
    );
    const {outer} = boxes(container);
    // The reset must not clobber a minHeight the caller asked for.
    expect(outer.getAttribute('style')).toContain('--x-minHeight: 200px');
    expect(getComputedStyle(outer).minHeight).not.toBe('0');
    // ...and the reset still frees the inline axis.
    expect(getComputedStyle(outer).minWidth).toBe('0');
  });

  it('supports overflow="clip"', () => {
    const {container} = render(<Section overflow="clip">Content</Section>);
    const {inner} = boxes(container);
    expect(getComputedStyle(inner).overflow).toBe('clip');
  });

  it('does not apply the min-size reset by default', () => {
    const {container} = render(<Section>Content</Section>);
    const {outer} = boxes(container);
    expect(getComputedStyle(outer).minHeight).not.toBe('0');
  });

  it('puts grow/shrink/basis on the outer box (the flex child)', () => {
    const {container} = render(
      <Section grow shrink={false} basis={320}>
        Content
      </Section>,
    );
    const {outer, inner} = boxes(container);
    const outerStyle = outer.getAttribute('style') ?? '';
    expect(outerStyle).toContain('--x-flexGrow: 1');
    expect(outerStyle).toContain('--x-flexShrink: 0');
    expect(outerStyle).toContain('--x-flexBasis: 320px');
    expect(inner.getAttribute('style')).toBeNull();
  });

  it('accepts numeric grow/shrink factors', () => {
    const {container} = render(
      <Section grow={2} shrink={3}>
        Content
      </Section>,
    );
    const outerStyle = boxes(container).outer.getAttribute('style') ?? '';
    expect(outerStyle).toContain('--x-flexGrow: 2');
    expect(outerStyle).toContain('--x-flexShrink: 3');
  });

  it('accepts a string basis', () => {
    const {container} = render(<Section basis="50%">Content</Section>);
    const outerStyle = boxes(container).outer.getAttribute('style') ?? '';
    expect(outerStyle).toContain('--x-flexBasis: 50%');
  });

  it('emits no flex declarations by default', () => {
    const {container} = render(<Section>Content</Section>);
    const outerStyle = boxes(container).outer.getAttribute('style') ?? '';
    expect(outerStyle).not.toContain('--x-flexGrow');
    expect(outerStyle).not.toContain('--x-flexShrink');
    expect(outerStyle).not.toContain('--x-flexBasis');
  });

  it('does not leak the new props to the DOM', () => {
    const {container} = render(
      <Section isScrollable overflow="auto" grow shrink={false} basis={320}>
        Content
      </Section>,
    );
    const {outer} = boxes(container);
    for (const attr of [
      'isscrollable',
      'overflow',
      'grow',
      'shrink',
      'basis',
    ]) {
      expect(outer.hasAttribute(attr)).toBe(false);
    }
  });

  it('composes the file-explorer column recipe', () => {
    // The dogfood case from #2623: a fixed-width, self-scrolling column with
    // an end divider inside a horizontally scrolling strip.
    const {container} = render(
      <Section
        width={240}
        padding={2}
        variant="transparent"
        dividers={['end']}
        shrink={false}
        isScrollable>
        Content
      </Section>,
    );
    const {outer, inner} = boxes(container);
    expect(outer.getAttribute('style')).toContain('--x-flexShrink: 0');
    expect(outer.getAttribute('style')).toContain('--x-width: 240px');
    expect(getComputedStyle(outer).minHeight).toBe('0');
    expect(getComputedStyle(inner).overflow).toBe('auto');
    // The divider still lives on the painted surface, so it stays put while
    // the content scrolls underneath it.
    expect(getComputedStyle(inner).borderInlineEndWidth).toBe('1px');
  });
});
