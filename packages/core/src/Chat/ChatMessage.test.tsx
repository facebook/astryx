// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatMessage} from './ChatMessage';
import {ChatMessageBubble} from './ChatMessageBubble';

describe('ChatMessage', () => {
  it('renders children', () => {
    render(
      <ChatMessage sender="assistant">
        <ChatMessageBubble>Hello world</ChatMessageBubble>
      </ChatMessage>,
    );
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('renders sender name', () => {
    render(
      <ChatMessage sender="assistant" name="Navi">
        <ChatMessageBubble>Hi</ChatMessageBubble>
      </ChatMessage>,
    );
    expect(screen.getByText('Navi')).toBeTruthy();
  });

  it('hides name for system sender', () => {
    render(
      <ChatMessage sender="system" name="System">
        <span>Notice</span>
      </ChatMessage>,
    );
    expect(screen.queryByText('System')).toBeNull();
  });

  it('renders avatar for assistant', () => {
    render(
      <ChatMessage
        sender="assistant"
        avatar={<div data-testid="avatar">A</div>}>
        <ChatMessageBubble>Hi</ChatMessageBubble>
      </ChatMessage>,
    );
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });

  it('hides avatar for system', () => {
    render(
      <ChatMessage
        sender="system"
        avatar={<div data-testid="avatar">S</div>}>
        <span>Notice</span>
      </ChatMessage>,
    );
    expect(screen.queryByTestId('avatar')).toBeNull();
  });

  it('applies sender class', () => {
    render(
      <ChatMessage sender="user" data-testid="msg">
        <ChatMessageBubble>Hi</ChatMessageBubble>
      </ChatMessage>,
    );
    const el = screen.getByTestId('msg');
    expect(el.className).toContain('user');
  });

  it('sets accessible aria-labelledby with name', () => {
    render(
      <ChatMessage sender="assistant" name="Navi" data-testid="msg">
        <ChatMessageBubble>Hi</ChatMessageBubble>
      </ChatMessage>,
    );
    const el = screen.getByTestId('msg');
    const labelId = el.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(el.querySelector(`#${CSS.escape(labelId!)}`)?.textContent).toBe('Navi');
  });

  it('sets accessible aria-label without name', () => {
    render(
      <ChatMessage sender="user" data-testid="msg">
        <ChatMessageBubble>Hi</ChatMessageBubble>
      </ChatMessage>,
    );
    const el = screen.getByTestId('msg');
    expect(el.getAttribute('aria-label')).toBe('Message from user');
  });

  it('renders non-bubble children', () => {
    render(
      <ChatMessage sender="assistant">
        <div data-testid="custom-content">Custom widget</div>
      </ChatMessage>,
    );
    expect(screen.getByTestId('custom-content')).toBeTruthy();
  });
});
