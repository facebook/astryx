// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ChatReactionBar} from './ChatReactionBar';

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

const REACTIONS = [
  {
    emoji: '🎉',
    count: 4,
    isSelected: true,
    label: 'You and Dana reacted with 🎉',
  },
  {emoji: '👀', count: 2},
];

describe('ChatReactionBar', () => {
  it('renders a pill per reaction with its count', () => {
    render(<ChatReactionBar reactions={REACTIONS} />);
    expect(
      screen.getByRole('button', {name: 'You and Dana reacted with 🎉'}),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', {name: '2 reactions with 👀'}),
    ).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('reflects isSelected via aria-pressed', () => {
    render(<ChatReactionBar reactions={REACTIONS} />);
    const selected = screen.getByRole('button', {
      name: 'You and Dana reacted with 🎉',
    });
    const unselected = screen.getByRole('button', {
      name: '2 reactions with 👀',
    });
    expect(selected.getAttribute('aria-pressed')).toBe('true');
    expect(unselected.getAttribute('aria-pressed')).toBe('false');
  });

  it('uses a singular label for a single reaction', () => {
    render(<ChatReactionBar reactions={[{emoji: '🔥', count: 1}]} />);
    expect(
      screen.getByRole('button', {name: '1 reaction with 🔥'}),
    ).toBeTruthy();
  });

  it('calls onToggle with the pill emoji', () => {
    const onToggle = vi.fn();
    render(<ChatReactionBar reactions={REACTIONS} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', {name: '2 reactions with 👀'}));
    expect(onToggle).toHaveBeenCalledWith('👀');
  });

  it('renders as a labeled group', () => {
    render(<ChatReactionBar reactions={REACTIONS} data-testid="bar" />);
    const bar = screen.getByTestId('bar');
    expect(bar.getAttribute('role')).toBe('group');
    expect(bar.getAttribute('aria-label')).toBe('Reactions');
  });

  it('hides the add button when onAdd is not provided', () => {
    render(<ChatReactionBar reactions={REACTIONS} />);
    expect(screen.queryByRole('button', {name: 'Add reaction'})).toBeNull();
  });

  it('shows the add button when onAdd is provided', () => {
    render(<ChatReactionBar reactions={REACTIONS} onAdd={() => {}} />);
    expect(screen.getByRole('button', {name: 'Add reaction'})).toBeTruthy();
  });

  it('calls onAdd with the emoji picked from the picker', () => {
    const onAdd = vi.fn();
    render(<ChatReactionBar reactions={REACTIONS} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', {name: 'Add reaction'}));
    fireEvent.click(
      screen.getByRole('button', {name: 'React with fire', hidden: true}),
    );
    expect(onAdd).toHaveBeenCalledWith('🔥');
  });

  it('applies the stable class name', () => {
    render(<ChatReactionBar reactions={REACTIONS} data-testid="bar" />);
    expect(screen.getByTestId('bar').className).toContain(
      'astryx-chat-reaction-bar',
    );
  });
});
