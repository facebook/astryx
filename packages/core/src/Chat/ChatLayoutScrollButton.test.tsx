// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatLayoutScrollButton} from './ChatLayoutScrollButton';

describe('ChatLayoutScrollButton', () => {
  it('renders a scroll button', () => {
    render(
      <ChatLayoutScrollButton
        isVisible
        onClick={() => {}}
        data-testid="scroll"
      />,
    );
    expect(screen.getByTestId('scroll')).toBeTruthy();
  });

  it('renders icon-only (no visible label text) in the default, label-less state', () => {
    render(<ChatLayoutScrollButton isVisible onClick={() => {}} />);
    const button = screen.getByRole('button', {name: 'Scroll to bottom'});
    // The translated name must stay accessible-only. Button renders visible
    // text whenever isIconOnly is false (its default), so a missing
    // isIconOnly here previously rendered the full translation as clipped
    // visible text inside the circular button instead of just the chevron.
    expect(button.textContent).toBe('');
  });

  it('renders the label as visible text when provided', () => {
    render(
      <ChatLayoutScrollButton
        isVisible
        onClick={() => {}}
        label="New messages"
      />,
    );
    const button = screen.getByRole('button', {name: 'New messages'});
    expect(button).toHaveTextContent('New messages');
  });

  it('forwards rest props (data-*, aria-*, id) to the root element', () => {
    render(
      <ChatLayoutScrollButton
        isVisible
        onClick={() => {}}
        data-testid="scroll"
        data-custom="x"
        id="scroll-1"
      />,
    );
    const root = screen.getByTestId('scroll');
    expect(root).toHaveAttribute('data-custom', 'x');
    expect(root).toHaveAttribute('id', 'scroll-1');
  });
});
