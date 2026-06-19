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
