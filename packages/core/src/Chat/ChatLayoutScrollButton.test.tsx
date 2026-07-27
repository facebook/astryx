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
