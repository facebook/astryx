// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSChatMessageList} from './XDSChatMessageList';
import {XDSChatMessage} from './XDSChatMessage';
import {XDSChatMessageBubble} from './XDSChatMessageBubble';

describe('XDSChatMessageList', () => {
  it('renders children', () => {
    render(
      <XDSChatMessageList>
        <XDSChatMessage sender="assistant">
          <XDSChatMessageBubble>Hello</XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>,
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders with role="log"', () => {
    render(
      <XDSChatMessageList data-testid="list">
        <div>msg</div>
      </XDSChatMessageList>,
    );
    const el = screen.getByTestId('list');
    expect(el.getAttribute('role')).toBe('log');
  });

  it('renders empty state when no children', () => {
    render(
      <XDSChatMessageList emptyState={<div>No messages yet</div>}>
        {[]}
      </XDSChatMessageList>,
    );
    expect(screen.getByText('No messages yet')).toBeTruthy();
  });

  it('applies density class', () => {
    render(
      <XDSChatMessageList density="compact" data-testid="list">
        <div>msg</div>
      </XDSChatMessageList>,
    );
    const el = screen.getByTestId('list');
    expect(el.className).toContain('compact');
  });

  it('accepts gap independently from density', () => {
    render(
      <XDSChatMessageList density="compact" gap={6} data-testid="list">
        <div>msg</div>
      </XDSChatMessageList>,
    );
    const el = screen.getByTestId('list');
    expect(el.className).toContain('compact');
  });

  it('applies data-testid', () => {
    render(
      <XDSChatMessageList data-testid="chat-list">
        <div>msg</div>
      </XDSChatMessageList>,
    );
    expect(screen.getByTestId('chat-list')).toBeTruthy();
  });
});
