import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSChatMessage} from './XDSChatMessage';
import {XDSChatMessageBubble} from './XDSChatMessageBubble';

describe('XDSChatMessage', () => {
  it('renders children', () => {
    render(
      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble>Hello world</XDSChatMessageBubble>
      </XDSChatMessage>,
    );
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('renders sender name', () => {
    render(
      <XDSChatMessage sender="assistant" name="Navi">
        <XDSChatMessageBubble>Hi</XDSChatMessageBubble>
      </XDSChatMessage>,
    );
    expect(screen.getByText('Navi')).toBeTruthy();
  });

  it('hides name for system sender', () => {
    render(
      <XDSChatMessage sender="system" name="System">
        <span>Notice</span>
      </XDSChatMessage>,
    );
    expect(screen.queryByText('System')).toBeNull();
  });

  it('renders avatar for assistant', () => {
    render(
      <XDSChatMessage
        sender="assistant"
        avatar={<div data-testid="avatar">A</div>}>
        <XDSChatMessageBubble>Hi</XDSChatMessageBubble>
      </XDSChatMessage>,
    );
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });

  it('hides avatar for system', () => {
    render(
      <XDSChatMessage
        sender="system"
        avatar={<div data-testid="avatar">S</div>}>
        <span>Notice</span>
      </XDSChatMessage>,
    );
    expect(screen.queryByTestId('avatar')).toBeNull();
  });

  it('applies sender class', () => {
    render(
      <XDSChatMessage sender="user" data-testid="msg">
        <XDSChatMessageBubble>Hi</XDSChatMessageBubble>
      </XDSChatMessage>,
    );
    const el = screen.getByTestId('msg');
    expect(el.className).toContain('user');
  });

  it('sets accessible aria-labelledby with name', () => {
    render(
      <XDSChatMessage sender="assistant" name="Navi" data-testid="msg">
        <XDSChatMessageBubble>Hi</XDSChatMessageBubble>
      </XDSChatMessage>,
    );
    const el = screen.getByTestId('msg');
    const labelId = el.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(el.querySelector(`#${CSS.escape(labelId!)}`)?.textContent).toBe('Navi');
  });

  it('sets accessible aria-label without name', () => {
    render(
      <XDSChatMessage sender="user" data-testid="msg">
        <XDSChatMessageBubble>Hi</XDSChatMessageBubble>
      </XDSChatMessage>,
    );
    const el = screen.getByTestId('msg');
    expect(el.getAttribute('aria-label')).toBe('Message from user');
  });

  it('renders non-bubble children', () => {
    render(
      <XDSChatMessage sender="assistant">
        <div data-testid="custom-content">Custom widget</div>
      </XDSChatMessage>,
    );
    expect(screen.getByTestId('custom-content')).toBeTruthy();
  });
});
