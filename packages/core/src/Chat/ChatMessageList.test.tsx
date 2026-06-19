// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatMessageList} from './ChatMessageList';
import {ChatMessage} from './ChatMessage';
import {ChatMessageBubble} from './ChatMessageBubble';

describe('ChatMessageList', () => {
  it('renders children', () => {
    render(
      <ChatMessageList>
        <ChatMessage sender="assistant">
          <ChatMessageBubble>Hello</ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>,
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders with role="log"', () => {
    render(
      <ChatMessageList data-testid="list">
        <div>msg</div>
      </ChatMessageList>,
    );
    const el = screen.getByTestId('list');
    expect(el.getAttribute('role')).toBe('log');
  });

  it('renders empty state when no children', () => {
    render(
      <ChatMessageList emptyState={<div>No messages yet</div>}>
        {[]}
      </ChatMessageList>,
    );
    expect(screen.getByText('No messages yet')).toBeTruthy();
  });

  it('applies density class', () => {
    render(
      <ChatMessageList density="compact" data-testid="list">
        <div>msg</div>
      </ChatMessageList>,
    );
    const el = screen.getByTestId('list');
    expect(el.className).toContain('compact');
  });

  it('accepts gap independently from density', () => {
    render(
      <ChatMessageList density="compact" gap={6} data-testid="list">
        <div>msg</div>
      </ChatMessageList>,
    );
    const el = screen.getByTestId('list');
    expect(el.className).toContain('compact');
  });

  it('applies data-testid', () => {
    render(
      <ChatMessageList data-testid="chat-list">
        <div>msg</div>
      </ChatMessageList>,
    );
    expect(screen.getByTestId('chat-list')).toBeTruthy();
  });
});
