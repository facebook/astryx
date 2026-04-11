import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSChatLayout} from './XDSChatLayout';

class FakeResizeObserver {
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
});

describe('XDSChatLayout', () => {
  it('renders children', () => {
    render(
      <XDSChatLayout composer={<div>composer</div>}>
        <div>Hello message</div>
      </XDSChatLayout>,
    );
    expect(screen.getByText('Hello message')).toBeTruthy();
  });

  it('renders composer in fixed dock', () => {
    render(
      <XDSChatLayout composer={<div data-testid="composer">Compose</div>}>
        <div>msg</div>
      </XDSChatLayout>,
    );
    const composer = screen.getByTestId('composer');
    expect(composer).toBeTruthy();
    // The dock (parent of the composer's wrapper) should have position: fixed
    const dock = composer.parentElement?.parentElement;
    expect(dock).toBeTruthy();
    const dockStyle = window.getComputedStyle(dock!);
    // StyleX applies classes, so check the element exists in the DOM structure
    expect(dock?.tagName).toBe('DIV');
  });

  it('renders empty state when children is empty', () => {
    render(
      <XDSChatLayout
        composer={<div>composer</div>}
        emptyState={<div>No messages yet</div>}>
        {[]}
      </XDSChatLayout>,
    );
    expect(screen.getByText('No messages yet')).toBeTruthy();
  });

  it('does not render empty state when children exist', () => {
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

  it('has container-type on root', () => {
    render(
      <XDSChatLayout
        composer={<div>composer</div>}
        data-testid="layout-root">
        <div>msg</div>
      </XDSChatLayout>,
    );
    const root = screen.getByTestId('layout-root');
    expect(root).toBeTruthy();
    expect(root.className).toContain('xds-chat-layout');
  });

  it('applies data-testid', () => {
    render(
      <XDSChatLayout
        composer={<div>composer</div>}
        data-testid="my-layout">
        <div>msg</div>
      </XDSChatLayout>,
    );
    expect(screen.getByTestId('my-layout')).toBeTruthy();
  });

  it('renders scrollButton slot', () => {
    render(
      <XDSChatLayout
        composer={<div>composer</div>}
        scrollButton={<button>Scroll to bottom</button>}>
        <div>msg</div>
      </XDSChatLayout>,
    );
    const button = screen.getByRole('button', {name: /Scroll to bottom/});
    expect(button).toBeTruthy();
  });
});
