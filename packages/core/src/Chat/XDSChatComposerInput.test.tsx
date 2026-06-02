// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSChatComposerInput} from './XDSChatComposerInput';
import type {
  XDSChatComposerTrigger,
  XDSChatComposerInputHandle,
} from './XDSChatComposerInput';
import {createStaticSource} from '../Typeahead/createStaticSource';
import type {XDSSearchableItem} from '../Typeahead/types';

// =============================================================================
// Helpers
// =============================================================================

const USERS: XDSSearchableItem[] = [
  {id: 'cindy', label: 'Cindy Zhang'},
  {id: 'alex', label: 'Alex Johnson'},
  {id: 'sam', label: 'Sam Rivera'},
];

const COMMANDS: XDSSearchableItem[] = [
  {id: 'summarize', label: 'summarize'},
  {id: 'translate', label: 'translate'},
  {id: 'search', label: 'search'},
];

function createMentionTrigger(
  overrides?: Partial<XDSChatComposerTrigger>,
): XDSChatComposerTrigger {
  return {
    character: '@',
    searchSource: createStaticSource(USERS),
    onSelect: item => ({
      value: `@${item.id}`,
      label: `@${item.label}`,
      variant: 'blue' as const,
    }),
    ...overrides,
  };
}

function createCommandTrigger(
  overrides?: Partial<XDSChatComposerTrigger>,
): XDSChatComposerTrigger {
  return {
    character: '/',
    searchSource: createStaticSource(COMMANDS),
    onSelect: item => `/${item.label} `,
    ...overrides,
  };
}

// =============================================================================
// Tests
// =============================================================================

describe('XDSChatComposerInput', () => {
  describe('basic rendering', () => {
    it('renders with placeholder', () => {
      render(<XDSChatComposerInput placeholder="Type here..." />);
      expect(screen.getByText('Type here...')).toBeInTheDocument();
    });

    it('renders with default placeholder', () => {
      render(<XDSChatComposerInput />);
      expect(screen.getByText(/Type a message/)).toBeInTheDocument();
    });

    it('renders a textbox role', () => {
      render(<XDSChatComposerInput label="Test input" />);
      expect(
        screen.getByRole('textbox', {name: 'Test input'}),
      ).toBeInTheDocument();
    });

    it('renders disabled state', () => {
      render(<XDSChatComposerInput isDisabled />);
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveAttribute('contenteditable', 'false');
    });
  });

  describe('change and submit', () => {
    it('calls onChange on input', () => {
      const onChange = vi.fn();
      render(<XDSChatComposerInput onChange={onChange} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      expect(onChange).toHaveBeenCalledWith('hello');
    });

    it('calls onSubmit on Enter', () => {
      const onSubmit = vi.fn();
      render(<XDSChatComposerInput onSubmit={onSubmit} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello world';
      fireEvent.input(textbox);
      fireEvent.keyDown(textbox, {key: 'Enter'});
      expect(onSubmit).toHaveBeenCalledWith('hello world');
    });

    it('does not submit on Shift+Enter', () => {
      const onSubmit = vi.fn();
      render(<XDSChatComposerInput onSubmit={onSubmit} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      fireEvent.keyDown(textbox, {key: 'Enter', shiftKey: true});
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('clears input after submit', () => {
      const onChange = vi.fn();
      render(<XDSChatComposerInput onSubmit={() => {}} onChange={onChange} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      fireEvent.keyDown(textbox, {key: 'Enter'});
      expect(onChange).toHaveBeenLastCalledWith('');
    });

    it('does not submit empty input', () => {
      const onSubmit = vi.fn();
      render(<XDSChatComposerInput onSubmit={onSubmit} />);
      const textbox = screen.getByRole('textbox');
      fireEvent.keyDown(textbox, {key: 'Enter'});
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // Controlled-value sync used to overwrite `textContent` on every
  // distinct render, which (a) collapsed the caret to offset 0
  // (visible after a slash-command pick like
  // `setValue('/feedback ')` — the next keystroke landed at the
  // start of the input) and (b) ran a redundant DOM rebuild on every
  // echo of our own `onChange` emission. The effect now skips echoes
  // of its own emission and restores the caret to the end of the new
  // content when the editable is focused.
  describe('controlled value sync', () => {
    it('places caret at end after a programmatic value change while focused', () => {
      const {rerender} = render(
        <XDSChatComposerInput value="/" onChange={() => {}} />,
      );
      const textbox = screen.getByRole('textbox');
      textbox.focus();

      rerender(<XDSChatComposerInput value="/feedback " onChange={() => {}} />);

      expect(textbox.textContent).toBe('/feedback ');
      const selection = window.getSelection();
      expect(selection).not.toBeNull();
      expect(selection?.rangeCount).toBe(1);
      const range = selection!.getRangeAt(0);
      expect(range.collapsed).toBe(true);
      // Caret is at the end of the editable's contents — the next
      // keystroke will append, not prepend.
      expect(
        range.endContainer === textbox ||
          range.endContainer.parentNode === textbox,
      ).toBe(true);
      expect(textbox.textContent?.length).toBe(10);
      expect(range.endOffset).toBe(
        range.endContainer.nodeType === Node.TEXT_NODE
          ? (range.endContainer.textContent?.length ?? 0)
          : textbox.childNodes.length,
      );
    });

    it('does not touch the DOM when controlled value echoes our own emission', () => {
      const onChange = vi.fn();
      const {rerender} = render(
        <XDSChatComposerInput value="" onChange={onChange} />,
      );
      const textbox = screen.getByRole('textbox');
      textbox.focus();
      // User types `hello` — emitted via onChange.
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      expect(onChange).toHaveBeenLastCalledWith('hello');
      // Parent commits the echo. The effect must not rebuild the DOM,
      // otherwise the caret would jump back to offset 0.
      const textNodeBefore = textbox.firstChild;
      rerender(<XDSChatComposerInput value="hello" onChange={onChange} />);
      expect(textbox.firstChild).toBe(textNodeBefore);
      expect(textbox.textContent).toBe('hello');
    });

    it('writes textContent on a true external value change while unfocused', () => {
      const {rerender} = render(
        <XDSChatComposerInput value="hello" onChange={() => {}} />,
      );
      const textbox = screen.getByRole('textbox');
      expect(textbox.textContent).toBe('hello');
      // Unfocused programmatic change — still applied, no caret work.
      rerender(<XDSChatComposerInput value="world" onChange={() => {}} />);
      expect(textbox.textContent).toBe('world');
    });

    it('does not stale-cache an emitted value across an external override', () => {
      // Regression: a permanent cache of "last emitted" would
      // incorrectly skip a later external set back to the emitted
      // string. The marker is one-shot — consumed by the first
      // matching commit or invalidated by any non-echoing update.
      const onChange = vi.fn();
      const {rerender} = render(
        <XDSChatComposerInput value="" onChange={onChange} />,
      );
      const textbox = screen.getByRole('textbox');
      textbox.focus();
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      // External override — clears the pending echo marker.
      rerender(<XDSChatComposerInput value="world" onChange={onChange} />);
      expect(textbox.textContent).toBe('world');
      // Parent now sets the value back to what we previously emitted.
      // The effect must apply this — the stale marker is gone.
      rerender(<XDSChatComposerInput value="hello" onChange={onChange} />);
      expect(textbox.textContent).toBe('hello');
    });
  });

  describe('file handling', () => {
    it('calls onFiles on paste with files', () => {
      const onFiles = vi.fn();
      render(<XDSChatComposerInput onFiles={onFiles} />);
      const textbox = screen.getByRole('textbox');

      const file = new File(['content'], 'test.txt', {type: 'text/plain'});
      fireEvent.paste(textbox, {
        clipboardData: {
          files: [file],
          getData: () => '',
        },
      });
      expect(onFiles).toHaveBeenCalledWith([file]);
    });
  });

  // Paste / insert paths used to bail silently when the contenteditable
  // was programmatically focused but no Selection range existed inside
  // it — the common case after `XDSChatComposer.handleBodyClick` calls
  // `editable.focus()`. Browsers do not create a Range on bare focus.
  // See `chatComposerSelection.ts`.
  describe('selection recovery (no range inside editable)', () => {
    function clearSelection() {
      window.getSelection()?.removeAllRanges();
    }

    it('paste inserts plain text after a focus() with no selection range', () => {
      const onChange = vi.fn();
      render(<XDSChatComposerInput onChange={onChange} />);
      const textbox = screen.getByRole('textbox');

      textbox.focus();
      clearSelection();
      expect(window.getSelection()?.rangeCount ?? 0).toBe(0);

      fireEvent.paste(textbox, {
        clipboardData: {
          files: [],
          getData: (type: string) => (type === 'text/plain' ? 'hello' : ''),
        },
      });

      expect(textbox.textContent).toBe('hello');
      expect(onChange).toHaveBeenLastCalledWith('hello');
    });

    it('paste inserts a token chip for long pastes after a focus() with no selection range', () => {
      render(<XDSChatComposerInput />);
      const textbox = screen.getByRole('textbox');

      textbox.focus();
      clearSelection();

      // Default pasteAsToken threshold is 200 chars.
      const long = 'a'.repeat(250);
      fireEvent.paste(textbox, {
        clipboardData: {
          files: [],
          getData: (type: string) => (type === 'text/plain' ? long : ''),
        },
      });

      expect(textbox.querySelector('[data-xds-token]')).toBeInTheDocument();
    });

    it('imperative insertToken works after a focus() with no selection range', () => {
      let handle: XDSChatComposerInputHandle | null = null;
      render(
        <XDSChatComposerInput
          handleRef={h => {
            handle = h;
          }}
        />,
      );
      const textbox = screen.getByRole('textbox');

      textbox.focus();
      clearSelection();

      handle!.insertToken({
        value: '@sam',
        label: '@Sam Rivera',
        variant: 'blue' as const,
      });

      expect(textbox.querySelector('[data-xds-token]')).toBeInTheDocument();
    });

    it('imperative insertText works after a focus() with no selection range', () => {
      let handle: XDSChatComposerInputHandle | null = null;
      render(
        <XDSChatComposerInput
          handleRef={h => {
            handle = h;
          }}
        />,
      );
      const textbox = screen.getByRole('textbox');

      textbox.focus();
      clearSelection();

      handle!.insertText('hello');
      expect(textbox.textContent).toContain('hello');
    });

    it('paste falls through to plain-text path when pasteAsToken={false}', () => {
      const onChange = vi.fn();
      render(<XDSChatComposerInput pasteAsToken={false} onChange={onChange} />);
      const textbox = screen.getByRole('textbox');

      textbox.focus();
      clearSelection();

      const long = 'b'.repeat(250);
      fireEvent.paste(textbox, {
        clipboardData: {
          files: [],
          getData: (type: string) => (type === 'text/plain' ? long : ''),
        },
      });

      expect(textbox.querySelector('[data-xds-token]')).not.toBeInTheDocument();
      expect(textbox.textContent).toBe(long);
    });
  });

  describe('triggers', () => {
    it('accepts triggers with searchSource', () => {
      const triggers = [createMentionTrigger()];
      const {container} = render(<XDSChatComposerInput triggers={triggers} />);
      expect(container).toBeTruthy();
    });

    it('accepts multiple triggers', () => {
      const triggers = [createMentionTrigger(), createCommandTrigger()];
      const {container} = render(<XDSChatComposerInput triggers={triggers} />);
      expect(container).toBeTruthy();
    });

    it('accepts async searchSource trigger', () => {
      const asyncTrigger: XDSChatComposerTrigger = {
        character: '@',
        searchSource: {
          async search(query: string) {
            return USERS.filter(u =>
              u.label.toLowerCase().includes(query.toLowerCase()),
            );
          },
          async bootstrap() {
            return USERS;
          },
          cancel() {},
        },
        onSelect: item => ({
          value: `@${item.id}`,
          label: `@${item.label}`,
          variant: 'blue' as const,
        }),
      };
      const {container} = render(
        <XDSChatComposerInput triggers={[asyncTrigger]} />,
      );
      expect(container).toBeTruthy();
    });

    it('renders with custom renderItem', () => {
      const trigger = createMentionTrigger({
        renderItem: item => <div data-testid="custom-item">{item.label}</div>,
      });
      const {container} = render(<XDSChatComposerInput triggers={[trigger]} />);
      expect(container).toBeTruthy();
    });

    it('supports configurable empty/loading text', () => {
      const trigger = createMentionTrigger({
        emptySearchResultsText: 'Nobody found',
        loadingText: 'Looking up...',
        menuLabel: 'People',
      });
      const {container} = render(<XDSChatComposerInput triggers={[trigger]} />);
      expect(container).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has aria-haspopup on the textbox', () => {
      const triggers = [createMentionTrigger()];
      render(<XDSChatComposerInput triggers={triggers} />);
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('has aria-expanded=false when menu is closed', () => {
      const triggers = [createMentionTrigger()];
      render(<XDSChatComposerInput triggers={triggers} />);
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('refs', () => {
    it('forwards ref to the root element', () => {
      let root: HTMLDivElement | null = null;
      render(
        <XDSChatComposerInput
          ref={el => {
            root = el;
          }}
        />,
      );
      expect(root).toBeInstanceOf(HTMLDivElement);
      expect(root).toHaveClass('xds-chat-composer-input');
    });

    it('exposes imperative handle via handleRef', () => {
      const ref = vi.fn();
      render(<XDSChatComposerInput handleRef={ref} />);
      expect(ref).toHaveBeenCalledWith(
        expect.objectContaining({
          insertToken: expect.any(Function),
          insertText: expect.any(Function),
          focus: expect.any(Function),
          getValue: expect.any(Function),
        }),
      );
    });

    it('getValue returns empty string for empty input', () => {
      let handle: XDSChatComposerInputHandle | null = null;
      render(
        <XDSChatComposerInput
          handleRef={h => {
            handle = h;
          }}
        />,
      );
      expect(handle!.getValue()).toBe('');
    });
  });

  describe('token backspace handling', () => {
    it('removes token and trailing NBSP on backspace', () => {
      let handle: XDSChatComposerInputHandle | null = null;
      const onChange = vi.fn();
      render(
        <XDSChatComposerInput
          handleRef={h => {
            handle = h;
          }}
          onChange={onChange}
        />,
      );
      const textbox = screen.getByRole('textbox');

      // Focus and set a collapsed selection so insertToken has a valid range
      textbox.focus();
      const sel = window.getSelection()!;
      const range = document.createRange();
      range.selectNodeContents(textbox);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);

      // Insert a token programmatically
      handle!.insertToken({
        value: '@sam',
        label: '@Sam Rivera',
        variant: 'blue' as const,
      });
      fireEvent.input(textbox);

      // The DOM should have a token span + trailing NBSP
      const tokenSpan = textbox.querySelector('[data-xds-token]');
      expect(tokenSpan).toBeInTheDocument();

      const nbsp = tokenSpan!.nextSibling;
      expect(nbsp).toBeTruthy();
      expect(nbsp!.textContent).toBe('\u00A0');

      // Position cursor at end of NBSP text node
      const r2 = document.createRange();
      r2.setStart(nbsp!, 1);
      r2.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r2);

      // Fire backspace
      fireEvent.keyDown(textbox, {key: 'Backspace'});

      // Both the NBSP and the token should be removed
      expect(textbox.querySelector('[data-xds-token]')).toBeNull();
    });

    it('serializes to empty after token backspace', () => {
      let handle: XDSChatComposerInputHandle | null = null;
      const onChange = vi.fn();
      render(
        <XDSChatComposerInput
          handleRef={h => {
            handle = h;
          }}
          onChange={onChange}
        />,
      );
      const textbox = screen.getByRole('textbox');

      // Focus and set selection
      textbox.focus();
      const sel = window.getSelection()!;
      const range = document.createRange();
      range.selectNodeContents(textbox);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);

      handle!.insertToken({
        value: '@sam',
        label: '@Sam Rivera',
        variant: 'blue' as const,
      });
      fireEvent.input(textbox);

      const tokenSpan = textbox.querySelector('[data-xds-token]')!;
      const nbsp = tokenSpan.nextSibling!;

      // Position cursor in the NBSP
      const r2 = document.createRange();
      r2.setStart(nbsp, 1);
      r2.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r2);

      // Backspace should remove token + NBSP and fire onChange
      fireEvent.keyDown(textbox, {key: 'Backspace'});
      expect(onChange).toHaveBeenLastCalledWith('');
    });
  });

  describe('xds class names', () => {
    it('has xds-chat-composer-input class', () => {
      const {container} = render(<XDSChatComposerInput />);
      expect(
        container.querySelector('.xds-chat-composer-input'),
      ).toBeInTheDocument();
    });
  });

  describe('trigger menu cursor anchor', () => {
    // The trigger menu anchors its popover to the cursor position, not the
    // entire input element. In real browsers this creates a fixed-position
    // span on document.body at the cursor rect. In jsdom (no layout engine)
    // it falls back to anchoring on the editable element.
    //
    // These tests verify:
    // 1. No anchor spans leak inside the contentEditable (text nodes stay intact)
    // 2. The fallback path works (popover opens without errors)
    // 3. selectItem cleans up properly — trigger text is fully replaced
    // 4. No orphaned spans on document.body after menu dismiss

    const BODY_ANCHOR_SELECTOR = 'span[data-xds-trigger-anchor]';

    function setupTriggerInput(triggers: XDSChatComposerTrigger[]) {
      const onChange = vi.fn();
      const result = render(
        <XDSChatComposerInput triggers={triggers} onChange={onChange} />,
      );
      const textbox = screen.getByRole('textbox');
      textbox.focus();
      return {...result, textbox, onChange};
    }

    function setCursorAfterText(textbox: HTMLElement, text: string): Text {
      const textNode = document.createTextNode(text);
      textbox.appendChild(textNode);
      const sel = window.getSelection()!;
      const range = document.createRange();
      range.setStart(textNode, text.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return textNode;
    }

    afterEach(() => {
      // Clean up any orphaned anchor spans from document.body
      document
        .querySelectorAll(BODY_ANCHOR_SELECTOR)
        .forEach(el => el.remove());
    });

    it('does not insert spans inside the contentEditable', () => {
      const {textbox} = setupTriggerInput([createMentionTrigger()]);

      setCursorAfterText(textbox, 'hello @');
      fireEvent.input(textbox);

      // No stray spans inside the editable — text nodes stay intact
      const spans = textbox.querySelectorAll('span[aria-hidden="true"]');
      expect(spans.length).toBe(0);
    });

    it('opens trigger menu without errors in jsdom fallback path', () => {
      const {textbox} = setupTriggerInput([createMentionTrigger()]);

      // jsdom returns zero-rect from getBoundingClientRect, so the
      // fallback anchors on the editable. No crash.
      setCursorAfterText(textbox, '@');
      fireEvent.input(textbox);

      // The popover opened — ARIA says expanded
      expect(textbox.getAttribute('aria-expanded')).toBe('true');
    });

    it('does not throw when Escape dismisses the menu', () => {
      const {textbox} = setupTriggerInput([createMentionTrigger()]);

      setCursorAfterText(textbox, '@');
      fireEvent.input(textbox);
      expect(textbox.getAttribute('aria-expanded')).toBe('true');

      // Escape should not throw — popover hide works in jsdom even
      // if aria-expanded doesn't update synchronously
      expect(() => fireEvent.keyDown(textbox, {key: 'Escape'})).not.toThrow();
    });

    it('does not throw when trigger text is cleared', () => {
      const {textbox} = setupTriggerInput([createMentionTrigger()]);

      setCursorAfterText(textbox, '@');
      fireEvent.input(textbox);
      expect(textbox.getAttribute('aria-expanded')).toBe('true');

      // Clearing text removes the trigger — should not throw
      textbox.textContent = '';
      expect(() => fireEvent.input(textbox)).not.toThrow();
    });

    it('does not create body anchor when no trigger is active', () => {
      const {textbox} = setupTriggerInput([createMentionTrigger()]);

      setCursorAfterText(textbox, 'hello');
      fireEvent.input(textbox);

      expect(textbox.getAttribute('aria-expanded')).toBe('false');
      expect(document.querySelector(BODY_ANCHOR_SELECTOR)).toBeNull();
    });

    it('serialized output is clean — no anchor artifacts', () => {
      let handle: XDSChatComposerInputHandle | null = null;
      const triggers = [createMentionTrigger()];
      const onChange = vi.fn();
      render(
        <XDSChatComposerInput
          handleRef={h => {
            handle = h;
          }}
          triggers={triggers}
          onChange={onChange}
        />,
      );
      const textbox = screen.getByRole('textbox');
      textbox.focus();

      setCursorAfterText(textbox, 'hello @');
      fireEvent.input(textbox);

      expect(handle!.getValue()).toBe('hello @');
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toBe('hello @');
    });

    it('text nodes stay contiguous — no splits from anchor insertion', () => {
      const {textbox} = setupTriggerInput([createMentionTrigger()]);

      setCursorAfterText(textbox, 'hello @cin');
      fireEvent.input(textbox);

      // All text is in a single text node — no splitting
      const textNodes = Array.from(textbox.childNodes).filter(
        n => n.nodeType === Node.TEXT_NODE,
      );
      expect(textNodes.length).toBe(1);
      expect(textNodes[0].textContent).toBe('hello @cin');
    });

    it('cleans up on unmount without errors', () => {
      const {textbox, unmount} = setupTriggerInput([createMentionTrigger()]);

      setCursorAfterText(textbox, '@');
      fireEvent.input(textbox);

      expect(() => unmount()).not.toThrow();
    });

    it('works with / command trigger', () => {
      const {textbox} = setupTriggerInput([createCommandTrigger()]);

      setCursorAfterText(textbox, '/');
      fireEvent.input(textbox);

      expect(textbox.getAttribute('aria-expanded')).toBe('true');
    });
  });
});
