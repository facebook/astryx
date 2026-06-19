// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSChatLayout} from './XDSChatLayout';

describe('XDSChatLayout', () => {
  it('renders children in the message area', () => {
    render(
      <XDSChatLayout composer={<div>composer</div>}>
        <div>Hello message</div>
      </XDSChatLayout>,
    );
    expect(screen.getByText('Hello message')).toBeTruthy();
  });

  it('renders composer in dock', () => {
    render(
      <XDSChatLayout composer={<div data-testid="composer">Compose</div>}>
        <div>msg</div>
      </XDSChatLayout>,
    );
    expect(screen.getByTestId('composer')).toBeTruthy();
  });

  it('renders empty state when children is empty array', () => {
    render(
      <XDSChatLayout
        composer={<div>composer</div>}
        emptyState={<div>No messages yet</div>}>
        {[]}
      </XDSChatLayout>,
    );
    expect(screen.getByText('No messages yet')).toBeTruthy();
  });

  it('prefers children over empty state when both present', () => {
    render(
      <XDSChatLayout
        composer={<div>composer</div>}
        emptyState={<div>No messages yet</div>}>
        <div>A message</div>
      </XDSChatLayout>,
    );
    expect(screen.getByText('A message')).toBeTruthy();
    expect(screen.queryByText('No messages yet')).toBeNull();
  });

  it('applies density attribute to root element', () => {
    const {rerender} = render(
      <XDSChatLayout
        composer={<div>composer</div>}
        data-testid="layout"
        density="compact">
        <div>msg</div>
      </XDSChatLayout>,
    );
    const root = screen.getByTestId('layout');
    expect(root.className).toContain('compact');

    rerender(
      <XDSChatLayout
        composer={<div>composer</div>}
        data-testid="layout"
        density="spacious">
        <div>msg</div>
      </XDSChatLayout>,
    );
    expect(root.className).toContain('spacious');
  });

  it('defaults density to balanced', () => {
    render(
      <XDSChatLayout composer={<div>composer</div>} data-testid="layout">
        <div>msg</div>
      </XDSChatLayout>,
    );
    const root = screen.getByTestId('layout');
    expect(root.className).toContain('balanced');
  });

  it('renders custom scrollButton slot', () => {
    render(
      <XDSChatLayout
        composer={<div>composer</div>}
        scrollButton={<button type="button">Scroll down</button>}>
        <div>msg</div>
      </XDSChatLayout>,
    );
    expect(screen.getByRole('button', {name: /Scroll down/})).toBeTruthy();
  });

  it('hides scrollButton when null', () => {
    render(
      <XDSChatLayout composer={<div>composer</div>} scrollButton={null}>
        <div>msg</div>
      </XDSChatLayout>,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
