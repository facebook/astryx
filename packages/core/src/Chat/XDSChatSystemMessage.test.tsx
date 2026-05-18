// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSChatSystemMessage} from './XDSChatSystemMessage';

describe('XDSChatSystemMessage', () => {
  it('renders children', () => {
    render(<XDSChatSystemMessage>Conversation started</XDSChatSystemMessage>);
    expect(screen.getByText('Conversation started')).toBeTruthy();
  });

  it('has role="status"', () => {
    render(
      <XDSChatSystemMessage data-testid="sys">Notice</XDSChatSystemMessage>,
    );
    const el = screen.getByTestId('sys');
    expect(el.getAttribute('role')).toBe('status');
  });

  it('renders default variant without divider lines', () => {
    const {container} = render(
      <XDSChatSystemMessage>Hello</XDSChatSystemMessage>,
    );
    // Divider lines have aria-hidden, so check there are none
    const hiddenElements = container.querySelectorAll('[aria-hidden]');
    expect(hiddenElements.length).toBe(0);
  });

  it('renders divider variant with XDSDivider', () => {
    render(
      <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>,
    );
    expect(screen.getByText('Today')).toBeTruthy();
  });

  it('renders icon', () => {
    render(
      <XDSChatSystemMessage icon={<span data-testid="icon">*</span>}>
        Notice
      </XDSChatSystemMessage>,
    );
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('applies variant class', () => {
    render(
      <XDSChatSystemMessage variant="divider" data-testid="sys">
        Today
      </XDSChatSystemMessage>,
    );
    const el = screen.getByTestId('sys');
    expect(el.className).toContain('divider');
  });

  it('applies data-testid', () => {
    render(
      <XDSChatSystemMessage data-testid="my-sys">Hello</XDSChatSystemMessage>,
    );
    expect(screen.getByTestId('my-sys')).toBeTruthy();
  });
});
