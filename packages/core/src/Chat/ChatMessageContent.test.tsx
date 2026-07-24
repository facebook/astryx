// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatMessage} from './ChatMessage';
import {ChatMessageBubble} from './ChatMessageBubble';
import {ChatMessageContent} from './ChatMessageContent';
import {ChatMessageList} from './ChatMessageList';

/**
 * Classes shared between two elements. StyleX emits one atomic class per
 * style declaration, so two elements share a class exactly when they share
 * a declaration — e.g. the same density paddingInline.
 */
function sharedClasses(a: Element, b: Element): string[] {
  const bClasses = new Set(Array.from(b.classList));
  return Array.from(a.classList).filter(c => bClasses.has(c));
}

describe('ChatMessageContent', () => {
  it('renders children', () => {
    render(
      <ChatMessage sender="assistant">
        <ChatMessageContent>
          <div data-testid="card">Attachment card</div>
        </ChatMessageContent>
      </ChatMessage>,
    );
    expect(screen.getByTestId('card')).toBeTruthy();
  });

  it('insets content to the bubble text column (#2574)', () => {
    // Repro from the issue: a raw child renders flush with the message
    // edge — it carries none of the inset the bubble's name slot gets.
    const {container} = render(
      <ChatMessage sender="assistant">
        <ChatMessageBubble name="Navi">Hello</ChatMessageBubble>
        <div data-testid="raw">Artifact card</div>
        <ChatMessageContent data-testid="content">
          Artifact card
        </ChatMessageContent>
      </ChatMessage>,
    );
    const nameSlot = container.querySelector('[data-chat-name]')!;
    expect(nameSlot).toBeTruthy();

    // Unwrapped custom content: no shared inset — the misalignment case.
    expect(sharedClasses(screen.getByTestId('raw'), nameSlot)).toEqual([]);

    // Wrapped custom content: shares the bubble slot's paddingInline
    // declaration, so its text column matches the bubble exactly. This
    // pins the fix — if the bubble's slot padding changes without
    // ChatMessageContent following, this intersection goes empty.
    expect(
      sharedClasses(screen.getByTestId('content'), nameSlot).length,
    ).toBeGreaterThan(0);
  });

  it('inset tracks message density', () => {
    const renderAtDensity = (density: 'balanced' | 'spacious') => {
      const {container} = render(
        <ChatMessage sender="assistant" density={density}>
          <ChatMessageBubble name="Navi">Hello</ChatMessageBubble>
          <ChatMessageContent data-testid={`content-${density}`}>
            Card
          </ChatMessageContent>
        </ChatMessage>,
      );
      return sharedClasses(
        screen.getByTestId(`content-${density}`),
        container.querySelector('[data-chat-name]')!,
      );
    };

    const balancedInset = renderAtDensity('balanced');
    const spaciousInset = renderAtDensity('spacious');

    // Both densities align with their own bubble's slot padding...
    expect(balancedInset.length).toBeGreaterThan(0);
    expect(spaciousInset.length).toBeGreaterThan(0);
    // ...and spacious uses a wider inset than balanced.
    expect(spaciousInset).not.toEqual(balancedInset);
  });

  it('stretches to the full message column', () => {
    render(
      <ChatMessage sender="assistant">
        <ChatMessageContent data-testid="content">Card</ChatMessageContent>
      </ChatMessage>,
    );
    const el = screen.getByTestId('content');
    expect(getComputedStyle(el).alignSelf).toBe('stretch');
  });

  it('applies sender-aware class from context', () => {
    render(
      <ChatMessage sender="user">
        <ChatMessageContent data-testid="content">Card</ChatMessageContent>
      </ChatMessage>,
    );
    const el = screen.getByTestId('content');
    expect(el.className).toContain('astryx-chat-message-content');
    expect(el.className).toContain('user');
  });

  it('applies inherited compact density class', () => {
    render(
      <ChatMessageList density="compact">
        <ChatMessage sender="assistant">
          <ChatMessageContent data-testid="content">Card</ChatMessageContent>
        </ChatMessage>
      </ChatMessageList>,
    );
    expect(screen.getByTestId('content').className).toContain('compact');
  });

  it('defaults to assistant when no context', () => {
    render(
      <ChatMessageContent data-testid="content">Standalone</ChatMessageContent>,
    );
    expect(screen.getByTestId('content').className).toContain('assistant');
  });
});
