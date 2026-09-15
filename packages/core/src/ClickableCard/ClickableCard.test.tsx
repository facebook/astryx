// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ClickableCard} from './ClickableCard';

describe('ClickableCard', () => {
  it('renders children', () => {
    render(
      <ClickableCard label="Test card" onClick={() => {}}>
        <span>Card content</span>
      </ClickableCard>,
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders a hidden button for onClick cards', () => {
    render(
      <ClickableCard label="Test card" onClick={() => {}}>
        <span>Content</span>
      </ClickableCard>,
    );
    const button = screen.getByRole('button', {name: 'Test card'});
    expect(button).toBeInTheDocument();
  });

  it('renders a hidden link for href cards', () => {
    render(
      <ClickableCard label="Nav card" href="/settings">
        Content
      </ClickableCard>,
    );
    const link = screen.getByRole('link', {name: 'Nav card'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('calls onClick when card surface is clicked', () => {
    const handleClick = vi.fn();
    render(
      <ClickableCard label="Test card" onClick={handleClick}>
        <span>Content</span>
      </ClickableCard>,
    );
    // Click the card surface (the text), not the hidden button
    fireEvent.click(screen.getByText('Content'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick once when the accessible control itself is clicked', () => {
    const handleClick = vi.fn();
    render(
      <ClickableCard label="Test card" onClick={handleClick}>
        <span>Content</span>
      </ClickableCard>,
    );
    // Pointer activation aimed at the element carrying the role — what
    // speech input, assistive technology, and automation dispatch.
    fireEvent.click(screen.getByRole('button', {name: 'Test card'}));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('passes the card surface as currentTarget for surface clicks', () => {
    const seen: EventTarget[] = [];
    render(
      <ClickableCard
        label="Test card"
        onClick={e => seen.push(e.currentTarget)}>
        <span>Content</span>
      </ClickableCard>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(seen).toHaveLength(1);
    expect(seen[0]).toBe(screen.getByText('Content').parentElement);
  });

  it('passes the card surface as currentTarget when the accessible control is clicked', () => {
    const seen: EventTarget[] = [];
    render(
      <ClickableCard
        label="Test card"
        onClick={e => seen.push(e.currentTarget)}>
        <span>Content</span>
      </ClickableCard>,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Test card'}));
    expect(seen).toHaveLength(1);
    expect(seen[0]).toBe(screen.getByText('Content').parentElement);
  });

  it('runs onClick against the card surface when the accessible link is clicked and lets it cancel navigation', () => {
    const seen: EventTarget[] = [];
    render(
      <ClickableCard
        label="Nav card"
        href="/settings"
        onClick={e => {
          seen.push(e.currentTarget);
          e.preventDefault();
        }}>
        <span>Content</span>
      </ClickableCard>,
    );
    const proceeded = fireEvent.click(
      screen.getByRole('link', {name: 'Nav card'}),
    );
    expect(seen).toHaveLength(1);
    expect(seen[0]).toBe(screen.getByText('Content').parentElement);
    expect(proceeded).toBe(false);
  });

  it('calls onClick exactly once when the surface of an href card is clicked without preventDefault', () => {
    const handleClick = vi.fn();
    render(
      <ClickableCard label="Nav card" href="/settings" onClick={handleClick}>
        <span>Content</span>
      </ClickableCard>,
    );
    // The container hook proxies the surface click to the link with
    // `link.click()`; that synthetic click bubbles back through the card and
    // must not run the consumer callback a second time.
    fireEvent.click(screen.getByText('Content'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('seals the disabled link control from the pointer', () => {
    const {rerender} = render(
      <ClickableCard label="Link" href="/settings">
        Content
      </ClickableCard>,
    );
    const enabledClass = screen.getByRole('link', {name: 'Link'}).className;
    rerender(
      <ClickableCard label="Link" href="/settings" isDisabled>
        Content
      </ClickableCard>,
    );
    const link = screen.getByRole('link', {name: 'Link'});
    // StyleX emits a distinct class for the disabled seal; the pointer paths
    // it closes (click, middle-click, context menu) are proven in Chromium.
    expect(link.className).not.toBe(enabledClass);
    expect(link.className.split(' ')).toEqual(
      expect.arrayContaining(enabledClass.split(' ')),
    );
  });

  it('does NOT call onClick when a nested button is clicked', () => {
    const handleCardClick = vi.fn();
    const handleButtonClick = vi.fn();
    render(
      <ClickableCard label="Test card" onClick={handleCardClick}>
        <button type="button" onClick={handleButtonClick}>
          Nested
        </button>
      </ClickableCard>,
    );
    fireEvent.click(screen.getByText('Nested'));
    expect(handleButtonClick).toHaveBeenCalledTimes(1);
    // Card's onClick should NOT fire because click was on a nested interactive
    expect(handleCardClick).not.toHaveBeenCalled();
  });

  it('hidden button has correct aria-label', () => {
    render(
      <ClickableCard label="Settings card" onClick={() => {}}>
        Content
      </ClickableCard>,
    );
    const button = screen.getByRole('button', {name: 'Settings card'});
    expect(button).toHaveAttribute('aria-label', 'Settings card');
  });

  it('hidden link passes target attribute', () => {
    render(
      <ClickableCard
        label="External"
        href="https://example.com"
        target="_blank">
        Content
      </ClickableCard>,
    );
    const link = screen.getByRole('link', {name: 'External'});
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('disabled button is disabled and the surface runs nothing', () => {
    const handleClick = vi.fn();
    render(
      <ClickableCard label="Disabled" onClick={handleClick} isDisabled>
        <span>Content</span>
      </ClickableCard>,
    );
    const button = screen.getByRole('button', {name: 'Disabled'});
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByText('Content'));
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disabled link has aria-disabled, leaves the tab order, and the surface runs nothing', () => {
    const handleClick = vi.fn();
    render(
      <ClickableCard
        label="Disabled link"
        href="/settings"
        onClick={handleClick}
        isDisabled>
        <span>Content</span>
      </ClickableCard>,
    );
    const link = screen.getByRole('link', {name: 'Disabled link'});
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
    fireEvent.click(screen.getByText('Content'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('runs onClick once from the keyboard via the hidden button', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ClickableCard label="Test card" onClick={handleClick}>
        <span>Content</span>
      </ClickableCard>,
    );
    await user.tab();
    expect(screen.getByRole('button', {name: 'Test card'})).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('does NOT call onClick when a nested input is clicked', () => {
    const handleCardClick = vi.fn();
    render(
      <ClickableCard label="Test card" onClick={handleCardClick}>
        <input aria-label="Quantity" readOnly value="1" />
      </ClickableCard>,
    );
    fireEvent.click(screen.getByRole('textbox', {name: 'Quantity'}));
    expect(handleCardClick).not.toHaveBeenCalled();
  });

  it('does NOT call onClick when text inside the card is selected', () => {
    const handleClick = vi.fn();
    render(
      <ClickableCard label="Test card" onClick={handleClick}>
        <span>Selectable body text</span>
      </ClickableCard>,
    );
    const text = screen.getByText('Selectable body text');
    const range = document.createRange();
    range.selectNodeContents(text);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    fireEvent.click(text);
    expect(handleClick).not.toHaveBeenCalled();
    selection.removeAllRanges();
  });

  describe('elevation', () => {
    it('forwards a distinct elevation class to the card for each level', () => {
      const classFor = (elevation: 'none' | 'low' | 'med' | 'high') => {
        const {container} = render(
          <ClickableCard label="Card" elevation={elevation}>
            Content
          </ClickableCard>,
        );
        return container.firstElementChild!.className;
      };
      const classes = new Set([
        classFor('none'),
        classFor('low'),
        classFor('med'),
        classFor('high'),
      ]);
      expect(classes.size).toBe(4);
    });

    it('defaults to flat (elevation none)', () => {
      const {container: def} = render(
        <ClickableCard label="Card">Content</ClickableCard>,
      );
      const {container: none} = render(
        <ClickableCard label="Card" elevation="none">
          Content
        </ClickableCard>,
      );
      expect(def.firstElementChild!.className).toBe(
        none.firstElementChild!.className,
      );
    });
  });
});
