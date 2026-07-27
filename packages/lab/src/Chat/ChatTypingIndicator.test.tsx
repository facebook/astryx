// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatTypingIndicator} from './ChatTypingIndicator';

describe('ChatTypingIndicator', () => {
  it('renders "X is typing…" for one name', () => {
    render(<ChatTypingIndicator names={['Ana']} />);
    expect(screen.getByText('Ana is typing…')).toBeTruthy();
  });

  it('renders both names for two people', () => {
    render(<ChatTypingIndicator names={['Ana', 'Ben']} />);
    expect(screen.getByText('Ana and Ben are typing…')).toBeTruthy();
  });

  it('collapses three or more names to "and N others"', () => {
    render(<ChatTypingIndicator names={['Ana', 'Ben', 'Casey']} />);
    expect(screen.getByText('Ana and 2 others are typing…')).toBeTruthy();
  });

  it('renders dots only when names is empty', () => {
    render(<ChatTypingIndicator names={[]} data-testid="typing" />);
    const root = screen.getByTestId('typing');
    expect(root.textContent).toBe('');
    expect(root.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('renders dots only when names is omitted', () => {
    render(<ChatTypingIndicator data-testid="typing" />);
    expect(screen.getByTestId('typing').textContent).toBe('');
  });

  it('is a polite live region', () => {
    render(<ChatTypingIndicator names={['Ana']} data-testid="typing" />);
    const root = screen.getByTestId('typing');
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('aria-live')).toBe('polite');
  });

  it('applies the stable class name', () => {
    render(<ChatTypingIndicator names={['Ana']} data-testid="typing" />);
    expect(screen.getByTestId('typing').className).toContain(
      'astryx-chat-typing-indicator',
    );
  });
});
