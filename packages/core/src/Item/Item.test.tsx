// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Item.test.tsx
 * @input Uses vitest, @testing-library/react, Item component
 * @output Unit tests for Item
 * @position Testing; validates Item component implementation
 *
 * SYNC: When Item component changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Item} from './Item';

describe('Item', () => {
  // ===========================================================================
  // Basic rendering
  // ===========================================================================

  it('renders label text', () => {
    render(<Item label="Contact Name" />);
    expect(screen.getByText('Contact Name')).toBeInTheDocument();
  });

  it('renders label and description', () => {
    render(<Item label="Settings" description="Manage your preferences" />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your preferences')).toBeInTheDocument();
  });

  it('renders marker', () => {
    render(<Item label="Item" marker={<span data-testid="marker">•</span>} />);
    expect(screen.getByTestId('marker')).toBeInTheDocument();
  });

  it('renders startContent', () => {
    render(
      <Item label="Item" startContent={<span data-testid="avatar">A</span>} />,
    );
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <Item label="Item" endContent={<span data-testid="badge">3</span>} />,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('renders all slots together', () => {
    render(
      <Item
        marker={<span data-testid="marker">•</span>}
        startContent={<span data-testid="start">S</span>}
        label="Label"
        description="Description"
        endContent={<span data-testid="end">E</span>}
      />,
    );
    expect(screen.getByTestId('marker')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(<Item label="Item" data-testid="my-item" />);
    expect(screen.getByTestId('my-item')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const {container} = render(<Item label="Item" />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  // ===========================================================================
  // Ref forwarding
  // ===========================================================================

  it('forwards ref to the root element', () => {
    let refValue: HTMLElement | null = null;
    render(
      <Item
        label="Item"
        ref={el => {
          refValue = el;
        }}
      />,
    );
    expect(refValue).toBeInstanceOf(HTMLDivElement);
  });

  // ===========================================================================
  // Interactive — onClick (invisible button pattern)
  // ===========================================================================

  it('renders an invisible button when onClick is provided', () => {
    const onClick = vi.fn();
    const {container} = render(<Item label="Clickable" onClick={onClick} />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.textContent).toContain('Clickable');
  });

  it('fires onClick when invisible button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Item label="Clickable" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick when container area is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Item
        label="Clickable"
        onClick={onClick}
        data-testid="item"
        startContent={<span data-testid="start">S</span>}
      />,
    );
    await user.click(screen.getByTestId('start'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire item onClick when endContent interactive element is clicked', async () => {
    const user = userEvent.setup();
    const itemClick = vi.fn();
    const buttonClick = vi.fn();
    render(
      <Item
        label="Item"
        onClick={itemClick}
        endContent={
          <button type="button" onClick={buttonClick}>
            Action
          </button>
        }
      />,
    );
    await user.click(screen.getByText('Action'));
    expect(buttonClick).toHaveBeenCalledTimes(1);
    expect(itemClick).not.toHaveBeenCalled();
  });

  it('does not fire item onClick when startContent interactive element is clicked', async () => {
    const user = userEvent.setup();
    const itemClick = vi.fn();
    const buttonClick = vi.fn();
    render(
      <Item
        label="Item"
        onClick={itemClick}
        startContent={
          <button type="button" onClick={buttonClick}>
            Open
          </button>
        }
      />,
    );
    await user.click(screen.getByText('Open'));
    expect(buttonClick).toHaveBeenCalledTimes(1);
    expect(itemClick).not.toHaveBeenCalled();
  });

  it('invisible button is focusable via keyboard', async () => {
    const user = userEvent.setup();
    render(<Item label="Focusable" onClick={() => {}} />);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('invisible button can be activated via keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Item label="Pressable" onClick={onClick} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render nested buttons — only one invisible button', () => {
    const {container} = render(<Item label="Item" onClick={() => {}} />);
    const buttons = container.querySelectorAll('div button');
    expect(buttons).toHaveLength(1);
  });

  // ===========================================================================
  // Interactive — href (invisible anchor pattern)
  // ===========================================================================

  it('renders an invisible anchor when href is provided', () => {
    const {container} = render(<Item label="Link" href="/docs" />);
    const anchor = container.querySelector('a');
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', '/docs');
    expect(anchor?.textContent).toContain('Link');
  });

  it('sets target on anchor when provided', () => {
    const {container} = render(
      <Item label="External" href="https://example.com" target="_blank" />,
    );
    const anchor = container.querySelector('a');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves existing rel tokens when target is blank', () => {
    const {container} = render(
      <Item
        label="External"
        href="https://example.com"
        target="_blank"
        rel="sponsored noopener"
      />,
    );
    const anchor = container.querySelector('a');
    expect(anchor).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('does not render button or anchor for static items', () => {
    const {container} = render(<Item label="Static" />);
    expect(container.querySelector('button')).not.toBeInTheDocument();
    expect(container.querySelector('a')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Disabled state
  // ===========================================================================

  it('applies aria-disabled when isDisabled', () => {
    render(<Item label="Disabled" isDisabled data-testid="item" />);
    expect(screen.getByTestId('item')).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables the invisible button when isDisabled', () => {
    const {container} = render(
      <Item label="Disabled" onClick={() => {}} isDisabled />,
    );
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('does not fire onClick when disabled item is clicked', async () => {
    const onClick = vi.fn();
    render(
      <Item label="Disabled" onClick={onClick} isDisabled data-testid="item" />,
    );
    const item = screen.getByTestId('item');
    item.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not set aria-disabled when not disabled', () => {
    render(<Item label="Item" data-testid="item" />);
    expect(screen.getByTestId('item')).not.toHaveAttribute('aria-disabled');
  });

  // ===========================================================================
  // Selected state
  // ===========================================================================

  it('applies aria-selected when isSelected', () => {
    render(<Item label="Selected" isSelected data-testid="item" />);
    expect(screen.getByTestId('item')).toHaveAttribute('aria-selected', 'true');
  });

  it('does not apply aria-selected when not selected', () => {
    render(<Item label="Not Selected" data-testid="item" />);
    expect(screen.getByTestId('item')).not.toHaveAttribute('aria-selected');
  });

  // ===========================================================================
  // Highlighted state
  // ===========================================================================

  it('renders with isHighlighted without errors', () => {
    render(<Item label="Highlighted" isHighlighted data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  // ===========================================================================
  // Marker, start, and end slot positions
  // ===========================================================================

  it('marker, startContent, and endContent are siblings to invisible button', () => {
    const {container} = render(
      <Item
        label="Item"
        onClick={() => {}}
        marker={<span data-testid="marker">•</span>}
        startContent={<span data-testid="start">S</span>}
        endContent={<span data-testid="end">E</span>}
      />,
    );
    const button = container.querySelector('button');
    const root = container.firstElementChild;
    expect(root?.querySelector('[data-testid="marker"]')).toBeInTheDocument();
    expect(root?.querySelector('[data-testid="start"]')).toBeInTheDocument();
    expect(root?.querySelector('[data-testid="end"]')).toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="marker"]'),
    ).not.toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="start"]'),
    ).not.toBeInTheDocument();
    expect(
      button?.querySelector('[data-testid="end"]'),
    ).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Density variants
  // ===========================================================================

  it('renders with balanced density by default', () => {
    render(<Item label="Item" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
    expect(screen.getByTestId('item').className).toContain('balanced');
  });

  it('renders with compact density', () => {
    render(<Item label="Item" density="compact" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  it('renders with spacious density', () => {
    render(<Item label="Item" density="spacious" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
    expect(screen.getByTestId('item').className).toContain('spacious');
  });

  // ===========================================================================
  // Alignment
  // ===========================================================================

  it('renders with center alignment by default', () => {
    render(<Item label="Item" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  it('renders with start alignment', () => {
    render(<Item label="Item" align="start" data-testid="item" />);
    expect(screen.getByTestId('item')).toBeInTheDocument();
  });

  // ===========================================================================
  // Description rendering
  // ===========================================================================

  it('does not render description when not provided', () => {
    render(<Item label="Label Only" />);
    expect(screen.getByText('Label Only')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('accepts ReactNode as description', () => {
    render(
      <Item
        label="Item"
        description={
          <div>
            <span>Rich</span> <span>description</span>
          </div>
        }
      />,
    );
    expect(screen.getByText('Rich')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('accepts ReactNode as label', () => {
    render(
      <Item
        label={
          <span>
            <b>Alice</b> commented
          </span>
        }
      />,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/commented/)).toBeInTheDocument();
  });

  // ===========================================================================
  // Variants (#4179)
  //
  // These assert the *compiled CSS*, not just prop plumbing. StyleX runs with
  // `runtimeInjection: true` under vitest (see vitest.config.ts), so the real
  // atomic rules land in document.styleSheets and can be read back.
  // ===========================================================================

  type MatchedRule = {selector: string; css: string; media: string};

  /** Every injected rule whose selector targets one of this element's atomic classes. */
  function rulesFor(el: HTMLElement): MatchedRule[] {
    // StyleX debug classes (`Item__styles.root`) carry a dot and are escaped in
    // selectors; the atomic classes are what actually hold declarations.
    const atomics = el.className
      .split(/\s+/)
      .filter(c => /^x[0-9a-z]+$/i.test(c));
    const found: MatchedRule[] = [];

    const walk = (rules: CSSRuleList, media: string) => {
      for (const rule of Array.from(rules)) {
        const grouping = rule as CSSGroupingRule;
        if (grouping.cssRules != null && grouping.cssRules.length > 0) {
          const condition = (rule as CSSMediaRule).conditionText ?? '';
          walk(grouping.cssRules, condition || media);
          continue;
        }
        const styleRule = rule as CSSStyleRule;
        if (!styleRule.selectorText) {
          continue;
        }
        if (atomics.some(c => styleRule.selectorText.includes(`.${c}`))) {
          found.push({
            selector: styleRule.selectorText,
            css: styleRule.style.cssText,
            media,
          });
        }
      }
    };

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walk(sheet.cssRules, '');
      } catch {
        continue;
      }
    }
    return found;
  }

  /** StyleX bumps specificity with `:not(#\#)` — strip it to see real pseudos. */
  const realSelector = (selector: string) =>
    selector.replace(/:not\(#\\?#\)/g, '');

  /**
   * jsdom's CSS serializer differs from the authored source in two harmless
   * ways: it rewrites the block-direction logical longhands to their physical
   * equivalents (`padding-block-start` → `padding-top`) and drops the space
   * after commas inside functions. Normalize both so assertions can be written
   * in the spelling the component actually uses.
   */
  const normalize = (css: string) =>
    css
      .replace(/,\s*/g, ', ')
      .replace(/\bpadding-top\b/g, 'padding-block-start')
      .replace(/\bpadding-bottom\b/g, 'padding-block-end');

  /** Declarations that apply in the resting state (no pseudo-class, no media). */
  function baseCss(el: HTMLElement): string {
    return normalize(
      rulesFor(el)
        .filter(r => r.media === '' && !realSelector(r.selector).includes(':'))
        .map(r => r.css)
        .join(' '),
    );
  }

  /** Declarations that apply only while hovered. */
  function hoverCss(el: HTMLElement): string {
    return normalize(
      rulesFor(el)
        .filter(r => realSelector(r.selector).includes(':hover'))
        .map(r => r.css)
        .join(' '),
    );
  }

  const renderItem = (props: Record<string, unknown>) => {
    render(<Item label="Item" data-testid="item" {...props} />);
    return screen.getByTestId('item');
  };

  it('reflects variant as a data attribute for theming', () => {
    expect(renderItem({variant: 'outline'})).toHaveAttribute(
      'data-variant',
      'outline',
    );
  });

  it('omits the variant data attribute when no variant is set', () => {
    expect(renderItem({})).not.toHaveAttribute('data-variant');
  });

  it('paints the card background for the default variant', () => {
    expect(baseCss(renderItem({variant: 'default'}))).toContain(
      'background-color: var(--color-background-card)',
    );
  });

  it('paints the muted background for the muted variant', () => {
    expect(baseCss(renderItem({variant: 'muted'}))).toContain(
      'background-color: var(--color-background-muted)',
    );
  });

  it('draws a border for the default variant', () => {
    const css = baseCss(renderItem({variant: 'default'}));
    expect(css).toContain('border-style: solid');
    expect(css).toContain('border-color: var(--color-border-emphasized)');
    expect(css).toContain('border-width: var(--border-width)');
  });

  it('draws a border for the outline variant without the card background', () => {
    const css = baseCss(renderItem({variant: 'outline'}));
    expect(css).toContain('border-style: solid');
    expect(css).toContain('border-color: var(--color-border-emphasized)');
    expect(css).not.toContain('background-color: var(--color-background-card)');
  });

  it('draws no border for the muted variant', () => {
    expect(baseCss(renderItem({variant: 'muted'}))).not.toContain(
      'border-style: solid',
    );
  });

  it('leaves a no-variant item without border or background surface', () => {
    const css = baseCss(renderItem({}));
    expect(css).not.toContain('border-style: solid');
    expect(css).not.toContain('background-color: var(--color-background-card)');
    expect(css).not.toContain(
      'background-color: var(--color-background-muted)',
    );
  });

  it('subtracts the border width from padding so the inset stays on the spacing scale', () => {
    const css = baseCss(renderItem({variant: 'default'}));
    // Longhands, so they outrank the shorthand padding StyleX gives lower
    // specificity — same technique as Card's withBorder.
    for (const side of [
      'padding-inline-start',
      'padding-inline-end',
      'padding-block-start',
      'padding-block-end',
    ]) {
      expect(css).toMatch(
        new RegExp(
          `${side}: calc\\(var\\(--[\\w-]+\\) - var\\(--border-width\\)\\)`,
        ),
      );
    }
  });

  it('keeps element radius on a bordered variant rather than container radius', () => {
    const css = baseCss(renderItem({variant: 'default'}));
    expect(css).toContain('border-radius: var(--radius-element)');
    expect(css).not.toContain('--radius-container');
  });

  // --- Interaction states must LAYER over the variant surface, not replace it.
  //
  // --color-background-muted and --color-overlay-hover are byte-identical in
  // light mode (both light-dark(#0536590C, ...)). So a hover that writes
  // background-color would give a muted Item *zero* hover feedback, and would
  // strip the opaque surface off a default Item. The overlays therefore ride on
  // background-image (a separate layer painted above background-color) — the
  // same technique used by TreeListItem and AvatarGroupOverflow.

  it('layers the hover overlay above the variant surface instead of replacing it', () => {
    const el = renderItem({variant: 'muted', onClick: () => {}});
    expect(hoverCss(el)).toContain(
      'background-image: linear-gradient(var(--color-overlay-hover), var(--color-overlay-hover))',
    );
    expect(hoverCss(el)).not.toContain('background-color');
    // ...and the surface underneath survives the hover.
    expect(baseCss(el)).toContain(
      'background-color: var(--color-background-muted)',
    );
  });

  it('layers the selected state above the variant surface', () => {
    const el = renderItem({variant: 'muted', isSelected: true});
    expect(baseCss(el)).toContain(
      'background-image: linear-gradient(var(--color-accent-muted), var(--color-accent-muted))',
    );
    expect(baseCss(el)).toContain(
      'background-color: var(--color-background-muted)',
    );
  });

  it('layers the highlighted state above the variant surface', () => {
    const el = renderItem({variant: 'muted', isHighlighted: true});
    expect(baseCss(el)).toContain(
      'background-image: linear-gradient(var(--color-overlay-hover), var(--color-overlay-hover))',
    );
    expect(baseCss(el)).toContain(
      'background-color: var(--color-background-muted)',
    );
  });

  it('does not give a no-variant item a background-color surface for its states', () => {
    // Guards the refactor: overlays moved off background-color entirely, so a
    // plain Item composites exactly as before over whatever is behind it.
    const el = renderItem({isSelected: true, onClick: () => {}});
    expect(baseCss(el)).not.toContain('background-color: var(--color-accent');
    expect(hoverCss(el)).not.toContain('background-color');
  });
});
