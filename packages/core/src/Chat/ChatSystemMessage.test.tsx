// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatSystemMessage} from './ChatSystemMessage';

describe('ChatSystemMessage', () => {
  it('renders children', () => {
    render(<ChatSystemMessage>Conversation started</ChatSystemMessage>);
    expect(screen.getByText('Conversation started')).toBeTruthy();
  });

  it('has role="status"', () => {
    render(<ChatSystemMessage data-testid="sys">Notice</ChatSystemMessage>);
    const el = screen.getByTestId('sys');
    expect(el.getAttribute('role')).toBe('status');
  });

  it('renders default variant without divider lines', () => {
    const {container} = render(<ChatSystemMessage>Hello</ChatSystemMessage>);
    // Divider lines have aria-hidden, so check there are none
    const hiddenElements = container.querySelectorAll('[aria-hidden]');
    expect(hiddenElements.length).toBe(0);
  });

  it('renders divider variant with Divider', () => {
    render(<ChatSystemMessage variant="divider">Today</ChatSystemMessage>);
    expect(screen.getByText('Today')).toBeTruthy();
  });

  it('renders icon', () => {
    render(
      <ChatSystemMessage icon={<span data-testid="icon">*</span>}>
        Notice
      </ChatSystemMessage>,
    );
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('applies variant class', () => {
    render(
      <ChatSystemMessage variant="divider" data-testid="sys">
        Today
      </ChatSystemMessage>,
    );
    const el = screen.getByTestId('sys');
    expect(el.className).toContain('divider');
  });

  it('applies data-testid', () => {
    render(<ChatSystemMessage data-testid="my-sys">Hello</ChatSystemMessage>);
    expect(screen.getByTestId('my-sys')).toBeTruthy();
  });

  it('forwards rest props (data-*, id) while keeping its own role', () => {
    render(
      <ChatSystemMessage data-testid="sys" data-custom="x" id="sys-1">
        Hello
      </ChatSystemMessage>,
    );
    const el = screen.getByTestId('sys');
    expect(el).toHaveAttribute('data-custom', 'x');
    expect(el).toHaveAttribute('id', 'sys-1');
    expect(el.getAttribute('role')).toBe('status');
  });

  it('forwards rest props in the divider variant', () => {
    render(
      <ChatSystemMessage variant="divider" data-testid="sys" data-custom="x">
        Today
      </ChatSystemMessage>,
    );
    const el = screen.getByTestId('sys');
    expect(el).toHaveAttribute('data-custom', 'x');
    expect(el.getAttribute('role')).toBe('status');
  });
});
