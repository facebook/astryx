// Copyright (c) Meta Platforms, Inc. and affiliates.

import {act, fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
// The full emoji set renders slowly in jsdom; the composer only needs a few.
vi.mock('../EmojiPicker/emojiData', () => ({
  EMOJI_GROUPS: [
    {
      name: 'Activities',
      emojis: [
        ['🎉', 'Party popper', 'celebration tada'],
        ['🎈', 'Balloon', 'celebration'],
      ],
    },
  ],
}));

import {CommentThread} from './CommentThread';
import type {
  CommentComposerRenderProps,
  CommentThreadData,
  CommentUser,
} from './types';

const VIEWER: CommentUser = {id: 'avery', name: 'Avery Kim'};
const OTHER: CommentUser = {id: 'maya', name: 'Maya Chen'};

const THREAD: CommentThreadData = {
  id: 'margin',
  author: OTHER,
  body: 'Should this say three days?',
  createdAt: '2026-09-30T19:00:00Z',
  anchor: {quote: 'The final cohort completes rollout in two days.'},
  replies: [
    {
      id: 'margin-reply',
      author: VIEWER,
      body: 'Good catch, updating it.',
      createdAt: '2026-09-30T19:20:00Z',
    },
  ],
};

const originalMatches = HTMLElement.prototype.matches;
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  Object.defineProperty(HTMLElement.prototype, 'matches', {
    configurable: true,
    writable: true,
    value(this: HTMLElement, selector: string): boolean {
      if (selector === ':popover-open') {
        return popoverOpenState.get(this) ?? false;
      }
      return originalMatches.call(this, selector);
    },
  });
});

afterAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'matches', {
    configurable: true,
    writable: true,
    value: originalMatches,
  });
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  Element.prototype.scrollIntoView = () => {};
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function settle() {
  await act(() => new Promise<void>(resolve => setTimeout(resolve, 0)));
}

describe('CommentThread', () => {
  it('renders one thread with its quoted passage, collapsed replies, and no rules', () => {
    render(<CommentThread comment={THREAD} container="card" />);
    const surface = document.querySelector('[data-thread-id="margin"]');
    expect(surface?.getAttribute('data-thread-surface')).toBe('section');
    expect(screen.getByText(THREAD.anchor?.quote ?? '')).toBeTruthy();
    expect(screen.getByText('View 1 reply')).toBeTruthy();
    expect(screen.queryByText('Good catch, updating it.')).toBeNull();
  });

  it('opens on a press, showing its replies and reply composer', async () => {
    const onSelectedChange = vi.fn();
    render(
      <CommentThread
        comment={THREAD}
        currentUser={VIEWER}
        onSubmit={vi.fn()}
        onSelectedChange={onSelectedChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Thread by Maya Chen'}));
    await settle();
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Good catch, updating it.')).toBeTruthy();
    expect(
      screen.getByRole('textbox', {name: 'Reply to Maya Chen…'}),
    ).toBeTruthy();
  });

  it('opens when the host selects it', async () => {
    const {rerender} = render(
      <CommentThread
        comment={THREAD}
        currentUser={VIEWER}
        onSubmit={vi.fn()}
        isSelected={false}
      />,
    );
    expect(screen.queryByText('Good catch, updating it.')).toBeNull();
    rerender(
      <CommentThread
        comment={THREAD}
        currentUser={VIEWER}
        onSubmit={vi.fn()}
        isSelected
      />,
    );
    await settle();
    expect(screen.getByText('Good catch, updating it.')).toBeTruthy();
  });

  it('opens a thread selected at mount without opening its composer or taking focus', async () => {
    render(
      <CommentThread
        comment={THREAD}
        currentUser={VIEWER}
        onSubmit={vi.fn()}
        isSelected
      />,
    );
    await settle();
    // Restored host state opens the body and replies. Only a viewer Reply action
    // opens the composer, so controlled selection never steals focus.
    expect(screen.getByText('Good catch, updating it.')).toBeTruthy();
    expect(
      screen.queryByRole('textbox', {name: 'Reply to Maya Chen…'}),
    ).toBeNull();
    expect(document.body).toHaveFocus();
  });

  it('opens from the keyboard and keeps focus on the thread', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <CommentThread
        comment={THREAD}
        currentUser={VIEWER}
        onSubmit={vi.fn()}
        onSelectedChange={onSelectedChange}
      />,
    );
    const toggle = screen.getByRole('button', {name: 'Thread by Maya Chen'});
    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard('{Enter}');
    await settle();
    expect(onSelectedChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByText('Good catch, updating it.')).toBeTruthy();
    // A key press leaves focus on the thread rather than moving it.
    expect(toggle).toHaveFocus();
    await user.keyboard(' ');
    await settle();
    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
    expect(toggle).toHaveFocus();
  });

  it('forwards the reply draft lifecycle through a standalone thread', async () => {
    const onComposerDraftChange = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const renderComposer = (props: CommentComposerRenderProps) => (
      <section aria-label="Live reply">
        <button type="button" onClick={() => props.onChange('Live reply body')}>
          Set live draft
        </button>
        <button type="button" onClick={() => props.onSubmit(props.value)}>
          Submit live draft
        </button>
      </section>
    );
    render(
      <CommentThread
        comment={THREAD}
        currentUser={VIEWER}
        isSelected
        onSubmit={onSubmit}
        onComposerDraftChange={onComposerDraftChange}
        renderComposer={renderComposer}
      />,
    );
    await settle();

    const context = {
      kind: 'reply' as const,
      parentCommentId: 'margin',
      repliedToCommentId: 'margin',
    };
    fireEvent.click(
      within(screen.getByRole('article', {name: 'Maya Chen'})).getByRole(
        'button',
        {name: 'Reply'},
      ),
    );
    await settle();
    fireEvent.click(screen.getByText('Set live draft'));
    expect(onComposerDraftChange).toHaveBeenLastCalledWith(
      'Live reply body',
      context,
    );
    fireEvent.click(screen.getByText('Submit live draft'));
    await settle();
    expect(onSubmit).toHaveBeenCalledWith('Live reply body', 'margin');
    expect(onComposerDraftChange).toHaveBeenLastCalledWith('', context);
  });

  it('forwards root props', () => {
    render(<CommentThread comment={THREAD} data-testid="margin-thread" />);
    expect(screen.getByTestId('margin-thread').className).toContain(
      'astryx-comment-thread',
    );
  });
});
