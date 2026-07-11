// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ChatEmojiPicker, DEFAULT_CHAT_EMOJIS} from './ChatEmojiPicker';

// Store original matches to restore later
const originalMatches = HTMLElement.prototype.matches;

// Track popover open state per element (jsdom lacks the Popover API)
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = originalMatches;
});

function renderPicker(onSelect: (emoji: string) => void = () => {}) {
  return render(
    <ChatEmojiPicker onSelect={onSelect}>
      <button type="button">Open picker</button>
    </ChatEmojiPicker>,
  );
}

function getGridButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll('button[data-emoji]'));
}

describe('ChatEmojiPicker', () => {
  it('renders the trigger', () => {
    renderPicker();
    expect(screen.getByRole('button', {name: 'Open picker'})).toBeTruthy();
  });

  it('renders the default emoji set in the grid', () => {
    renderPicker();
    expect(getGridButtons().length).toBe(DEFAULT_CHAT_EMOJIS.length);
    expect(
      screen.getByRole('button', {name: 'React with tada', hidden: true}),
    ).toBeTruthy();
  });

  it('renders custom emojis when provided', () => {
    render(
      <ChatEmojiPicker
        onSelect={() => {}}
        emojis={[{emoji: '🦄', name: 'unicorn'}]}>
        <button type="button">Open</button>
      </ChatEmojiPicker>,
    );
    expect(getGridButtons().length).toBe(1);
    expect(
      screen.getByRole('button', {name: 'React with unicorn', hidden: true}),
    ).toBeTruthy();
  });

  it('filters the grid by shortname', () => {
    renderPicker();
    fireEvent.change(screen.getByLabelText('Search emoji'), {
      target: {value: 'fire'},
    });
    const buttons = getGridButtons();
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('data-emoji')).toBe('🔥');
  });

  it('shows a no-match message for an empty filter result', () => {
    renderPicker();
    fireEvent.change(screen.getByLabelText('Search emoji'), {
      target: {value: 'zzzz'},
    });
    expect(getGridButtons().length).toBe(0);
    expect(screen.getByText(/No emoji match/)).toBeTruthy();
  });

  it('calls onSelect with the picked emoji', () => {
    const onSelect = vi.fn();
    renderPicker(onSelect);
    fireEvent.click(screen.getByRole('button', {name: 'Open picker'}));
    fireEvent.click(
      screen.getByRole('button', {name: 'React with tada', hidden: true}),
    );
    expect(onSelect).toHaveBeenCalledWith('🎉');
  });

  it('clears the filter after selection', () => {
    renderPicker();
    fireEvent.change(screen.getByLabelText('Search emoji'), {
      target: {value: 'fire'},
    });
    fireEvent.click(
      screen.getByRole('button', {name: 'React with fire', hidden: true}),
    );
    expect(getGridButtons().length).toBe(DEFAULT_CHAT_EMOJIS.length);
  });

  it('moves focus right/left with arrow keys', () => {
    renderPicker();
    const grid = screen.getByRole('group', {name: 'Emoji', hidden: true});
    const buttons = getGridButtons();
    buttons[0].focus();
    fireEvent.keyDown(grid, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(buttons[1]);
    fireEvent.keyDown(grid, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('moves focus by a row with ArrowDown/ArrowUp', () => {
    renderPicker();
    const grid = screen.getByRole('group', {name: 'Emoji', hidden: true});
    const buttons = getGridButtons();
    buttons[0].focus();
    fireEvent.keyDown(grid, {key: 'ArrowDown'});
    expect(document.activeElement).toBe(buttons[8]);
    fireEvent.keyDown(grid, {key: 'ArrowUp'});
    expect(document.activeElement).toBe(buttons[0]);
  });
});
