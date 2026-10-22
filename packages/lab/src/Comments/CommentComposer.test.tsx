// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {act, fireEvent, render, screen, within} from '@testing-library/react';
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

import {CommentComposer} from './CommentComposer';

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

describe('CommentComposer', () => {
  it('posts the draft from Post, and never an empty one', async () => {
    const onSubmit = vi.fn();
    const {rerender} = render(
      <CommentComposer value="" onChange={() => {}} onSubmit={onSubmit} />,
    );
    const post = screen.getByRole('button', {name: /send/i});
    expect(post).toBeDisabled();
    rerender(
      <CommentComposer
        value="Looks good"
        onChange={() => {}}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: /send/i}));
    expect(onSubmit).toHaveBeenCalledWith('Looks good');
  });

  it('shows the placeholder as the input’s name, and keeps Post focusable while submitting', () => {
    const onSubmit = vi.fn();
    const {container} = render(
      <CommentComposer
        value="Draft"
        onChange={() => {}}
        onSubmit={onSubmit}
        isSubmitting
      />,
    );
    expect(
      screen.getByRole('textbox', {name: 'Write a comment…'}),
    ).toBeTruthy();
    // Busy never disables Post, so focus can't drop to <body>; a second press
    // is refused, and the composer reports busy.
    const post = screen.getByRole('button', {name: /send/i});
    expect(post).not.toBeDisabled();
    fireEvent.click(post);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(container.querySelector('.astryx-comment-composer')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    // A button with a tooltip stays focusable while disabled.
    expect(screen.getByRole('button', {name: 'Add emoji'})).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('appends a picked emoji to the draft', async () => {
    function Host() {
      const [value, setValue] = useState('Ship it');
      return (
        <>
          <output data-testid="draft">{value}</output>
          <CommentComposer
            value={value}
            onChange={setValue}
            onSubmit={() => {}}
          />
        </>
      );
    }
    render(<Host />);
    fireEvent.click(screen.getByRole('button', {name: 'Add emoji'}));
    await settle();
    // The frequent row lists it before its group does.
    fireEvent.click(
      screen.getAllByRole('button', {name: 'Party popper', hidden: true})[0],
    );
    expect(screen.getByTestId('draft').textContent).toBe('Ship it 🎉');
  });

  it('uploads attached images and appends them as Markdown', async () => {
    const onChange = vi.fn();
    const onUploadImages = vi
      .fn()
      .mockResolvedValue([{url: 'https://example.com/a b.png', alt: 'Chart'}]);
    render(
      <CommentComposer
        value="See this"
        onChange={onChange}
        onSubmit={() => {}}
        onUploadImages={onUploadImages}
      />,
    );
    expect(screen.getByRole('button', {name: 'Attach images'})).toBeTruthy();
    const input = document.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('File input not found');
    }
    const file = new File(['png'], 'chart.png', {type: 'image/png'});
    await act(async () => {
      fireEvent.change(input, {target: {files: [file]}});
      await Promise.resolve();
    });
    await settle();
    expect(onUploadImages).toHaveBeenCalledWith([file]);
    expect(onChange).toHaveBeenCalledWith(
      'See this\n\n![Chart](https://example.com/a%20b.png)',
    );
  });

  it('refuses files that are not images', async () => {
    const onUploadImages = vi.fn();
    render(
      <CommentComposer
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        onUploadImages={onUploadImages}
      />,
    );
    const input = document.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('File input not found');
    }
    await act(async () => {
      fireEvent.change(input, {
        target: {
          files: [new File(['%PDF'], 'doc.pdf', {type: 'application/pdf'})],
        },
      });
    });
    expect(onUploadImages).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain(
      'Only image files can be added',
    );
  });

  it('shows an error with Retry, and a quoted passage the viewer can remove', () => {
    const onRetry = vi.fn();
    const onAnchorDismiss = vi.fn();
    render(
      <CommentComposer
        value="Draft"
        onChange={() => {}}
        onSubmit={() => {}}
        error="Your comment couldn't be posted."
        onRetry={onRetry}
        anchor={{quote: 'Guardrail alerts page within five minutes.'}}
        onAnchorDismiss={onAnchorDismiss}
        highlightColor="green"
      />,
    );
    const alert = screen.getByRole('alert');
    fireEvent.click(within(alert).getByRole('button', {name: 'Retry'}));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(
      document
        .querySelector('[data-composer-anchor="quote"] [data-quote-rule]')
        ?.getAttribute('data-highlight-color'),
    ).toBe('green');
    fireEvent.click(screen.getByRole('button', {name: 'Remove quoted text'}));
    expect(onAnchorDismiss).toHaveBeenCalledTimes(1);
  });

  it('leaves the emoji button out when hasEmojiPicker is false, and adds controls', () => {
    render(
      <CommentComposer
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        hasEmojiPicker={false}
        controls={<button type="button">Pin to moment</button>}
      />,
    );
    expect(screen.queryByRole('button', {name: 'Add emoji'})).toBeNull();
    expect(screen.getByRole('button', {name: 'Pin to moment'})).toBeTruthy();
  });
});
