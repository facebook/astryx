// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatLayout} from './ChatLayout';

describe('ChatLayout', () => {
  it('renders children in the message area', () => {
    render(
      <ChatLayout composer={<div>composer</div>}>
        <div>Hello message</div>
      </ChatLayout>,
    );
    expect(screen.getByText('Hello message')).toBeTruthy();
  });

  it('renders composer in dock', () => {
    render(
      <ChatLayout composer={<div data-testid="composer">Compose</div>}>
        <div>msg</div>
      </ChatLayout>,
    );
    expect(screen.getByTestId('composer')).toBeTruthy();
  });

  it('renders empty state when children is empty array', () => {
    render(
      <ChatLayout
        composer={<div>composer</div>}
        emptyState={<div>No messages yet</div>}>
        {[]}
      </ChatLayout>,
    );
    expect(screen.getByText('No messages yet')).toBeTruthy();
  });

  it('prefers children over empty state when both present', () => {
    render(
      <ChatLayout
        composer={<div>composer</div>}
        emptyState={<div>No messages yet</div>}>
        <div>A message</div>
      </ChatLayout>,
    );
    expect(screen.getByText('A message')).toBeTruthy();
    expect(screen.queryByText('No messages yet')).toBeNull();
  });

  it('applies density attribute to root element', () => {
    const {rerender} = render(
      <ChatLayout
        composer={<div>composer</div>}
        data-testid="layout"
        density="compact">
        <div>msg</div>
      </ChatLayout>,
    );
    const root = screen.getByTestId('layout');
    expect(root.className).toContain('compact');

    rerender(
      <ChatLayout
        composer={<div>composer</div>}
        data-testid="layout"
        density="spacious">
        <div>msg</div>
      </ChatLayout>,
    );
    expect(root.className).toContain('spacious');
  });

  it('defaults density to balanced', () => {
    render(
      <ChatLayout composer={<div>composer</div>} data-testid="layout">
        <div>msg</div>
      </ChatLayout>,
    );
    const root = screen.getByTestId('layout');
    expect(root.className).toContain('balanced');
  });

  it('renders custom scrollButton slot', () => {
    render(
      <ChatLayout
        composer={<div>composer</div>}
        scrollButton={<button type="button">Scroll down</button>}>
        <div>msg</div>
      </ChatLayout>,
    );
    expect(screen.getByRole('button', {name: /Scroll down/})).toBeTruthy();
  });

  it('hides scrollButton when null', () => {
    render(
      <ChatLayout composer={<div>composer</div>} scrollButton={null}>
        <div>msg</div>
      </ChatLayout>,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('ChatLayout self-scroll overflow (#2573)', () => {
  it('does not force the message area to stack full height on top of the dock', () => {
    const {container} = render(
      <ChatLayout composer={<div data-testid="composer">c</div>}>
        <div>short message</div>
      </ChatLayout>,
    );
    const root = container.firstElementChild as HTMLElement;
    const messageArea = root.firstElementChild as HTMLElement;
    const dock = root.children[1] as HTMLElement;

    // Self-scroll mode: root is the scroll container.
    expect(getComputedStyle(root).overflowY).toBe('auto');
    // The dock stays sticky so the composer pins to the bottom on scroll.
    expect(getComputedStyle(dock).position).toBe('sticky');

    // The message area fills the viewport height and reserves bottom padding
    // equal to the dock height, so messages can scroll into view without being
    // hidden behind the sticky composer. The dock uses negative margin-top to
    // pull itself back into that padding space, avoiding extra scroll height.
    expect(getComputedStyle(messageArea).minHeight).toBe('100%');
  });

  it('keeps the composer docked at the bottom with short content', () => {
    const {container} = render(
      <ChatLayout composer={<div>c</div>}>
        <div>short message</div>
      </ChatLayout>,
    );
    const root = container.firstElementChild as HTMLElement;
    const messageArea = root.firstElementChild as HTMLElement;
    const dock = root.children[1] as HTMLElement;

    // Root is the scroll container.
    expect(getComputedStyle(root).overflowY).toBe('auto');
    // Message area fills viewport so dock is pushed to the bottom.
    expect(getComputedStyle(messageArea).minHeight).toBe('100%');
    // Dock is sticky at bottom — stays pinned regardless of content length.
    expect(getComputedStyle(dock).position).toBe('sticky');
  });
});
