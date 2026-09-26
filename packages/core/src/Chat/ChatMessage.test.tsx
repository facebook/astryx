// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createElement, createRef, Fragment, type ReactNode} from 'react';
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatMessage} from './ChatMessage';
import {ChatMessageBubble} from './ChatMessageBubble';
import {ChatMessageList} from './ChatMessageList';

const inspectablyEmptyNodes: [string, ReactNode][] = [
  ['an empty array', []],
  ['an array of non-rendering values', [null, false, '']],
  ['an empty Fragment', createElement(Fragment)],
];

const renderableCompositeNodes: [string, ReactNode][] = [
  ['an array', [null, <span key="name">Navi</span>, false]],
  ['a Fragment', createElement(Fragment, null, null, <span>Navi</span>)],
];

const inspectablyEmptyIterables: [string, () => Iterable<ReactNode>][] = [
  ['an empty Set', () => new Set<ReactNode>()],
  [
    'a Set of non-rendering values',
    () => new Set<ReactNode>([null, false, '']),
  ],
];

function* renderableGenerator(): Generator<ReactNode> {
  yield 0;
  yield ' items';
}

function OpaqueName() {
  return <span>Navi</span>;
}

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

  it.each([false, true, ''])('does not render a name wrapper for %j', name => {
    render(
      <ChatMessage sender="assistant" name={name}>
        <span>Summary</span>
      </ChatMessage>,
    );
    const article = screen.getByRole('article');
    expect(article).toHaveAccessibleName('Message from assistant');
    expect(article).not.toHaveAttribute('aria-labelledby');
    expect(article.querySelector('div:empty')).toBeNull();
  });

  it('preserves a numeric name', () => {
    render(
      <ChatMessage sender="assistant" name={0}>
        <span>Summary</span>
      </ChatMessage>,
    );
    expect(screen.getByRole('article')).toHaveAccessibleName('0');
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it.each(inspectablyEmptyNodes)(
    'uses the fallback label and omits the name wrapper for %s',
    (_label, name) => {
      render(
        <ChatMessage sender="assistant" name={name}>
          <span>Summary</span>
        </ChatMessage>,
      );
      const article = screen.getByRole('article');
      expect(article).toHaveAccessibleName('Message from assistant');
      expect(article).not.toHaveAttribute('aria-labelledby');
      expect(article.querySelector('div:empty')).toBeNull();
    },
  );

  it.each(renderableCompositeNodes)(
    'preserves a visible name inside %s',
    (_label, name) => {
      render(
        <ChatMessage sender="assistant" name={name}>
          <span>Summary</span>
        </ChatMessage>,
      );
      expect(screen.getByRole('article')).toHaveAccessibleName('Navi');
    },
  );

  it('treats an opaque component element as content', () => {
    render(
      <ChatMessage sender="assistant" name={<OpaqueName />}>
        <span>Summary</span>
      </ChatMessage>,
    );
    expect(screen.getByRole('article')).toHaveAccessibleName('Navi');
  });

  it.each(inspectablyEmptyIterables)(
    'uses the fallback label and omits the name wrapper for %s',
    (_label, createName) => {
      render(
        <ChatMessage sender="assistant" name={createName()}>
          <span>Summary</span>
        </ChatMessage>,
      );
      const article = screen.getByRole('article');
      expect(article).toHaveAccessibleName('Message from assistant');
      expect(article).not.toHaveAttribute('aria-labelledby');
      expect(article.querySelector('div:empty')).toBeNull();
    },
  );

  it('preserves numeric and text content from a name iterable', () => {
    render(
      <ChatMessage
        sender="assistant"
        name={new Set<ReactNode>([null, 0, ' items'])}>
        <span>Summary</span>
      </ChatMessage>,
    );
    expect(screen.getByRole('article')).toHaveAccessibleName('0 items');
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
      <ChatMessage sender="system" avatar={<div data-testid="avatar">S</div>}>
        <span>Notice</span>
      </ChatMessage>,
    );
    expect(screen.queryByTestId('avatar')).toBeNull();
  });

  it.each([false, true, ''])(
    'does not render an avatar wrapper for %j',
    avatar => {
      render(
        <ChatMessage sender="assistant" avatar={avatar}>
          <span>Summary</span>
        </ChatMessage>,
      );
      expect(screen.getByRole('article').querySelector('div:empty')).toBeNull();
    },
  );

  it('preserves a numeric avatar', () => {
    render(
      <ChatMessage sender="assistant" avatar={0}>
        <span>Summary</span>
      </ChatMessage>,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it.each(inspectablyEmptyNodes)(
    'omits the avatar wrapper for %s',
    (_label, avatar) => {
      render(
        <ChatMessage sender="assistant" avatar={avatar}>
          <span>Summary</span>
        </ChatMessage>,
      );
      expect(screen.getByRole('article').querySelector('div:empty')).toBeNull();
    },
  );

  it.each(inspectablyEmptyIterables)(
    'omits the avatar wrapper for %s',
    (_label, createAvatar) => {
      render(
        <ChatMessage sender="assistant" avatar={createAvatar()}>
          <span>Summary</span>
        </ChatMessage>,
      );
      expect(screen.getByRole('article').querySelector('div:empty')).toBeNull();
    },
  );

  it('preserves numeric and text content from an avatar iterable', () => {
    render(
      <ChatMessage
        sender="assistant"
        avatar={new Set<ReactNode>([null, 0, ' avatars'])}>
        <span>Summary</span>
      </ChatMessage>,
    );
    expect(screen.getByText('0 avatars')).toBeInTheDocument();
  });

  it('applies sender class', () => {
    render(
      <ChatMessage sender="user" data-testid="msg">
        <ChatMessageBubble>Hi</ChatMessageBubble>
      </ChatMessage>,
    );
    const el = screen.getByTestId('msg');
    expect(el).toHaveAttribute('data-sender', 'user');
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
    expect(el.querySelector(`#${CSS.escape(labelId!)}`)?.textContent).toBe(
      'Navi',
    );
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

  it('renders metadata for a non-system sender', () => {
    render(
      <ChatMessage sender="assistant" metadata={<span>Updated just now</span>}>
        <span>Summary</span>
      </ChatMessage>,
    );
    expect(screen.getByText('Updated just now')).toBeInTheDocument();
  });

  it('hides metadata for a system sender', () => {
    render(
      <ChatMessage sender="system" metadata={<span>Hidden metadata</span>}>
        <span>Maintenance complete</span>
      </ChatMessage>,
    );
    expect(screen.queryByText('Hidden metadata')).not.toBeInTheDocument();
  });

  it.each([false, true, ''])(
    'does not render an empty metadata wrapper for %j',
    metadata => {
      render(
        <ChatMessage sender="assistant" metadata={metadata}>
          <span>Summary</span>
        </ChatMessage>,
      );
      expect(screen.getByRole('article').querySelector('div:empty')).toBeNull();
    },
  );

  it('preserves numeric metadata', () => {
    render(
      <ChatMessage sender="assistant" metadata={0}>
        <span>Summary</span>
      </ChatMessage>,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it.each(inspectablyEmptyNodes)(
    'omits the metadata wrapper for %s',
    (_label, metadata) => {
      render(
        <ChatMessage sender="assistant" metadata={metadata}>
          <span>Summary</span>
        </ChatMessage>,
      );
      expect(screen.getByRole('article').querySelector('div:empty')).toBeNull();
    },
  );

  it.each(inspectablyEmptyIterables)(
    'omits the metadata wrapper for %s',
    (_label, createMetadata) => {
      render(
        <ChatMessage sender="assistant" metadata={createMetadata()}>
          <span>Summary</span>
        </ChatMessage>,
      );
      expect(screen.getByRole('article').querySelector('div:empty')).toBeNull();
    },
  );

  it('preserves a one-shot iterable by materializing its numeric and text content', () => {
    render(
      <ChatMessage sender="assistant" metadata={renderableGenerator()}>
        <span>Summary</span>
      </ChatMessage>,
    );
    expect(screen.getByText('0 items')).toBeInTheDocument();
  });

  it('rejects cyclic iterable slot content without recursing indefinitely', () => {
    const cyclic = new Set<ReactNode>();
    cyclic.add(cyclic);
    expect(() =>
      render(
        <ChatMessage sender="assistant" metadata={cyclic}>
          <span>Summary</span>
        </ChatMessage>,
      ),
    ).toThrow('ChatMessage slot content cannot contain a cycle');
  });

  it('uses balanced density without list context', () => {
    render(
      <ChatMessage sender="assistant" data-testid="message">
        <span>Summary</span>
      </ChatMessage>,
    );
    expect(screen.getByTestId('message')).toHaveAttribute(
      'data-density',
      'balanced',
    );
  });

  it('inherits list density and lets an explicit prop override it', () => {
    render(
      <ChatMessageList density="spacious">
        <ChatMessage sender="assistant" data-testid="inherited">
          <span>Inherited</span>
        </ChatMessage>
        <ChatMessage
          sender="assistant"
          density="compact"
          data-testid="explicit">
          <span>Explicit</span>
        </ChatMessage>
      </ChatMessageList>,
    );
    expect(screen.getByTestId('inherited')).toHaveAttribute(
      'data-density',
      'spacious',
    );
    expect(screen.getByTestId('explicit')).toHaveAttribute(
      'data-density',
      'compact',
    );
  });

  it('forwards root props and ref while preserving the theme target', () => {
    const ref = createRef<HTMLElement>();
    render(
      <ChatMessage
        ref={ref}
        sender="assistant"
        data-testid="message"
        data-purpose="summary"
        className="consumer-message"
        style={{order: 2}}>
        <span>Summary</span>
      </ChatMessage>,
    );
    const message = screen.getByTestId('message');
    expect(ref.current).toBe(message);
    expect(message).toHaveAttribute('data-purpose', 'summary');
    expect(message).toHaveClass('astryx-chat-message', 'consumer-message');
    expect(message.style.order).toBe('2');
  });
});
