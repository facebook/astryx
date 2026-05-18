// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSChatMessage} from './XDSChatMessage';
import {XDSChatMessageBubble} from './XDSChatMessageBubble';
import {XDSChatMessageMetadata} from './XDSChatMessageMetadata';

describe('XDSChatMessageBubble', () => {
  it('renders children', () => {
    render(
      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble>Hello world</XDSChatMessageBubble>
      </XDSChatMessage>,
    );
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('applies sender-aware class from context', () => {
    render(
      <XDSChatMessage sender="user">
        <XDSChatMessageBubble data-testid="bubble">Hi</XDSChatMessageBubble>
      </XDSChatMessage>,
    );
    const el = screen.getByTestId('bubble');
    expect(el.className).toContain('user');
  });

  it('defaults to assistant when no context', () => {
    render(
      <XDSChatMessageBubble data-testid="bubble">
        Standalone
      </XDSChatMessageBubble>,
    );
    const el = screen.getByTestId('bubble');
    expect(el.className).toContain('assistant');
  });

  it('applies data-testid', () => {
    render(
      <XDSChatMessage sender="assistant">
        <XDSChatMessageBubble data-testid="my-bubble">Hi</XDSChatMessageBubble>
      </XDSChatMessage>,
    );
    expect(screen.getByTestId('my-bubble')).toBeTruthy();
  });
});

describe('XDSChatMessageMetadata', () => {
  it('renders timestamp', () => {
    render(
      <XDSChatMessage sender="assistant">
        <XDSChatMessageMetadata timestamp="2:30 PM" />
      </XDSChatMessage>,
    );
    expect(screen.getByText('2:30 PM')).toBeTruthy();
  });

  it('renders footer content', () => {
    render(
      <XDSChatMessage sender="assistant">
        <XDSChatMessageMetadata footer={<span>Liked</span>} />
      </XDSChatMessage>,
    );
    expect(screen.getByText('Liked')).toBeTruthy();
  });

  it('renders status', () => {
    render(
      <XDSChatMessage sender="user">
        <XDSChatMessageMetadata status="sent" />
      </XDSChatMessage>,
    );
    expect(screen.getByLabelText('Message sent')).toBeTruthy();
  });

  it('renders timestamp and status on one row', () => {
    render(
      <XDSChatMessage sender="user">
        <XDSChatMessageMetadata timestamp="2:30 PM" status="read" />
      </XDSChatMessage>,
    );
    expect(screen.getByText('2:30 PM')).toBeTruthy();
    expect(screen.getByLabelText('Message read')).toBeTruthy();
    expect(screen.getByText('·')).toBeTruthy();
  });

  it('renders nothing when all props are empty', () => {
    const {container} = render(
      <XDSChatMessage sender="user">
        <XDSChatMessageMetadata />
      </XDSChatMessage>,
    );
    // Only the article wrapper from XDSChatMessage
    expect(container.querySelectorAll('article').length).toBe(1);
  });
});
