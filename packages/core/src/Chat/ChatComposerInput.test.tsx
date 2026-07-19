// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {ChatComposer} from './ChatComposer';
import {ChatComposerInput} from './ChatComposerInput';
import type {
  ChatComposerTrigger,
  ChatComposerInputHandle,
} from './ChatComposerInput';
import {createStaticSource} from '../Typeahead/createStaticSource';
import type {SearchableItem} from '../Typeahead/types';

// =============================================================================
// Helpers
// =============================================================================

const USERS: SearchableItem[] = [
  {id: 'cindy', label: 'Cindy Zhang'},
  {id: 'alex', label: 'Alex Johnson'},
  {id: 'sam', label: 'Sam Rivera'},
];

const COMMANDS: SearchableItem[] = [
  {id: 'summarize', label: 'summarize'},
  {id: 'translate', label: 'translate'},
  {id: 'search', label: 'search'},
];

function createMentionTrigger(
  overrides?: Partial<ChatComposerTrigger>,
): ChatComposerTrigger {
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
  overrides?: Partial<ChatComposerTrigger>,
): ChatComposerTrigger {
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

describe('ChatComposerInput', () => {
  describe('basic rendering', () => {
    it('renders with placeholder', () => {
      render(<ChatComposerInput placeholder="Type here..." />);
      expect(screen.getByText('Type here...')).toBeInTheDocument();
    });

    it('renders with default placeholder', () => {
      render(<ChatComposerInput />);
      expect(screen.getByText(/Type a message/)).toBeInTheDocument();
    });

    it('renders a textbox role', () => {
      render(<ChatComposerInput label="Test input" />);
      expect(
        screen.getByRole('textbox', {name: 'Test input'}),
      ).toBeInTheDocument();
    });

    it('renders disabled state', () => {
      render(<ChatComposerInput isDisabled />);
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveAttribute('contenteditable', 'false');
    });
  });

  describe('change and submit', () => {
    it('calls onChange on input', () => {
      const onChange = vi.fn();
      render(<ChatComposerInput onChange={onChange} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      expect(onChange).toHaveBeenCalledWith('hello');
    });

    it('calls onSubmit on Enter', () => {
      const onSubmit = vi.fn();
      render(<ChatComposerInput onSubmit={onSubmit} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello world';
      fireEvent.input(textbox);
      fireEvent.keyDown(textbox, {key: 'Enter'});
      expect(onSubmit).toHaveBeenCalledWith('hello world');
    });

    it('does not submit on Shift+Enter', () => {
      const onSubmit = vi.fn();
      render(<ChatComposerInput onSubmit={onSubmit} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      fireEvent.keyDown(textbox, {key: 'Enter', shiftKey: true});
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('clears input after submit', () => {
      const onChange = vi.fn();
      render(<ChatComposerInput onSubmit={() => {}} onChange={onChange} />);
      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      fireEvent.keyDown(textbox, {key: 'Enter'});
      expect(onChange).toHaveBeenLastCalledWith('');
    });

    it('does not submit empty input', () => {
      const onSubmit = vi.fn();
      render(<ChatComposerInput onSubmit={onSubmit} />);
      const textbox = screen.getByRole('textbox');
      fireEvent.keyDown(textbox, {key: 'Enter'});
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('keeps parent submit flow when child onChange observes input changes', () => {
      const onSubmit = vi.fn();
      const onInputChange = vi.fn();
      render(
        <ChatComposer
          onSubmit={onSubmit}
          input={<ChatComposerInput onChange={onInputChange} />}
        />,
      );

      const textbox = screen.getByRole('textbox');
      textbox.textContent = 'hello world';
      fireEvent.input(textbox);

      expect(onInputChange).toHaveBeenLastCalledWith('hello world');

      fireEvent.keyDown(textbox, {key: 'Enter'});

      expect(onSubmit).toHaveBeenCalledWith('hello world');
      expect(onInputChange).toHaveBeenLastCalledWith('');
      expect(textbox.textContent).toBe('');
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
        <ChatComposerInput value="/" onChange={() => {}} />,
      );
      const textbox = screen.getByRole('textbox');
      textbox.focus();

      rerender(<ChatComposerInput value="/feedback " onChange={() => {}} />);

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
        <ChatComposerInput value="" onChange={onChange} />,
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
      rerender(<ChatComposerInput value="hello" onChange={onChange} />);
      expect(textbox.firstChild).toBe(textNodeBefore);
      expect(textbox.textContent).toBe('hello');
    });

    it('writes textContent on a true external value change while unfocused', () => {
      const {rerender} = render(
        <ChatComposerInput value="hello" onChange={() => {}} />,
      );
      const textbox = screen.getByRole('textbox');
      expect(textbox.textContent).toBe('hello');
      // Unfocused programmatic change — still applied, no caret work.
      rerender(<ChatComposerInput value="world" onChange={() => {}} />);
      expect(textbox.textContent).toBe('world');
    });

    it('does not stale-cache an emitted value across an external override', () => {
      // Regression: a permanent cache of "last emitted" would
      // incorrectly skip a later external set back to the emitted
      // string. The marker is one-shot — consumed by the first
      // matching commit or invalidated by any non-echoing update.
      const onChange = vi.fn();
      const {rerender} = render(
        <ChatComposerInput value="" onChange={onChange} />,
      );
      const textbox = screen.getByRole('textbox');
      textbox.focus();
      textbox.textContent = 'hello';
      fireEvent.input(textbox);
      // External override — clears the pending echo marker.
      rerender(<ChatComposerInput value="world" onChange={onChange} />);
      expect(textbox.textContent).toBe('world');
      // Parent now sets the value back to what we previously emitted.
      // The effect must apply this — the stale marker is gone.
      rerender(<ChatComposerInput value="hello" onChange={onChange} />);
      expect(textbox.textContent).toBe('hello');
    });

    it('keeps newer internal state when the parent commits a late echo of an earlier emission', () => {
      // Two rapid inputs emit 'ab' then 'abc' before the parent's
      // state commit for 'ab' lands. That late value='ab' re-render
      // is a stale echo of our own emission — not an external
      // override — and must not wipe the trailing 'c' the user
      // typed in the meantime.
      const onChange = vi.fn();
      const {rerender} = render(
        <ChatComposerInput value="" onChange={onChange} />,
      );
      const textbox = screen.getByRole('textbox');
      textbox.focus();
      textbox.textContent = 'ab';
      fireEvent.input(textbox);
      textbox.textContent = 'abc';
      fireEvent.input(textbox);
      expect(onChange).toHaveBeenNthCalledWith(1, 'ab');
      expect(onChange).toHaveBeenNthCalledWith(2, 'abc');
      // The parent's LATE commit of the first emission arrives after
      // the second emission. Internal state ('abc') is newer and
      // stays authoritative.
      rerender(<ChatComposerInput value="ab" onChange={onChange} />);
      expect(textbox.textContent).toBe('abc');
    });

    it('setValue writes synchronously, places the caret at the end, and emits one echo-free onChange', () => {
      let handle: ChatComposerInputHandle | null = null;
      const onChange = vi.fn();
      const {rerender} = render(
        <ChatComposerInput
          value=""
          onChange={onChange}
          handleRef={h => {
            handle = h;
          }}
        />,
      );
      const textbox = screen.getByRole('textbox');
      textbox.focus();

      handle!.setValue('/feedback ');

      // Synchronous DOM write + exactly one informational onChange.
      expect(textbox.textContent).toBe('/feedback ');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('/feedback ');

      // Caret is collapsed at the end of the new content — the next
      // keystroke appends, not prepends.
      const selection = window.getSelection()!;
      expect(selection.rangeCount).toBe(1);
      const range = selection.getRangeAt(0);
      expect(range.collapsed).toBe(true);
      expect(
        range.endContainer === textbox ||
          range.endContainer.parentNode === textbox,
      ).toBe(true);
      expect(range.endOffset).toBe(
        range.endContainer.nodeType === Node.TEXT_NODE
          ? (range.endContainer.textContent?.length ?? 0)
          : textbox.childNodes.length,
      );

      // A subsequent parent echo of that value must cause ZERO DOM
      // writes — observed via MutationObserver + node identity.
      const textNodeBefore = textbox.firstChild;
      const observer = new MutationObserver(() => {});
      observer.observe(textbox, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      rerender(
        <ChatComposerInput
          value="/feedback "
          onChange={onChange}
          handleRef={h => {
            handle = h;
          }}
        />,
      );
      expect(observer.takeRecords()).toEqual([]);
      observer.disconnect();
      expect(textbox.firstChild).toBe(textNodeBefore);
      expect(textbox.textContent).toBe('/feedback ');
      // No re-emission on the echo — still exactly one onChange.
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('keeps keystrokes typed after setValue when the parent echoes it late', () => {
      let handle: ChatComposerInputHandle | null = null;
      const onChange = vi.fn();
      const {rerender} = render(
        <ChatComposerInput
          value=""
          onChange={onChange}
          handleRef={h => {
            handle = h;
          }}
        />,
      );
      const textbox = screen.getByRole('textbox');
      textbox.focus();

      handle!.setValue('/feedback ');
      // The user keeps typing before the parent's state commit for the
      // setValue emission lands.
      textbox.textContent = '/feedback great';
      fireEvent.input(textbox);

      // The parent's LATE echo of the setValue emission is a stale echo
      // — not an external override — and must not wipe the keystrokes
      // typed after it. This only holds if setValue records its
      // emission in the same pending-emissions ledger as typing.
      rerender(
        <ChatComposerInput
          value="/feedback "
          onChange={onChange}
          handleRef={h => {
            handle = h;
          }}
        />,
      );
      expect(textbox.textContent).toBe('/feedback great');
    });

    it('setValue leaves the document selection alone when the input is not focused', () => {
      let handle: ChatComposerInputHandle | null = null;
      const onChange = vi.fn();
      render(
        <ChatComposerInput
          value=""
          onChange={onChange}
          handleRef={h => {
            handle = h;
          }}
        />,
      );
      const textbox = screen.getByRole('textbox');

      // The user is working in a different editable surface — focus
      // and the document selection both live there.
      const other = document.createElement('div');
      other.setAttribute('contenteditable', 'true');
      other.tabIndex = -1;
      other.textContent = 'elsewhere';
      document.body.appendChild(other);
      other.focus();
      const selection = window.getSelection()!;
      const range = document.createRange();
      range.setStart(other.firstChild!, 4);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      act(() => {
        handle!.setValue('restored draft');
      });

      // The replacement and emission happen, but the other surface
      // keeps its caret — a background setValue must not yank the
      // document selection (and with it, in some browsers, focus)
      // away from where the user is typing.
      expect(textbox.textContent).toBe('restored draft');
      expect(onChange).toHaveBeenCalledWith('restored draft');
      expect(selection.rangeCount).toBe(1);
      expect(selection.getRangeAt(0).startContainer).toBe(other.firstChild);
      expect(selection.getRangeAt(0).startOffset).toBe(4);
      other.remove();
    });
  });

  describe('file handling', () => {
    it('calls onFiles on paste with files', () => {
      const onFiles = vi.fn();
      render(<ChatComposerInput onFiles={onFiles} />);
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
  // it — the common case after `ChatComposer.handleBodyClick` calls
  // `editable.focus()`. Browsers do not create a Range on bare focus.
  // See `chatComposerSelection.ts`.
  describe('selection recovery (no range inside editable)', () => {
    function clearSelection() {
      window.getSelection()?.removeAllRanges();
    }

    it('paste inserts plain text after a focus() with no selection range', () => {
      const onChange = vi.fn();
      render(<ChatComposerInput onChange={onChange} />);
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
      render(<ChatComposerInput />);
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

      expect(textbox.querySelector('[data-astryx-token]')).toBeInTheDocument();
    });

    it('imperative insertToken works after a focus() with no selection range', () => {
      let handle: ChatComposerInputHandle | null = null;
      render(
        <ChatComposerInput
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

      expect(textbox.querySelector('[data-astryx-token]')).toBeInTheDocument();
    });

    it('imperative insertText works after a focus() with no selection range', () => {
      let handle: ChatComposerInputHandle | null = null;
      render(
        <ChatComposerInput
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
      render(<ChatComposerInput pasteAsToken={false} onChange={onChange} />);
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

      expect(
        textbox.querySelector('[data-astryx-token]'),
      ).not.toBeInTheDocument();
      expect(textbox.textContent).toBe(long);
    });
  });

  describe('triggers', () => {
    it('accepts triggers with searchSource', () => {
      const triggers = [createMentionTrigger()];
      const {container} = render(<ChatComposerInput triggers={triggers} />);
      expect(container).toBeTruthy();
    });

    it('accepts multiple triggers', () => {
      const triggers = [createMentionTrigger(), createCommandTrigger()];
      const {container} = render(<ChatComposerInput triggers={triggers} />);
      expect(container).toBeTruthy();
    });

    it('accepts async searchSource trigger', () => {
      const asyncTrigger: ChatComposerTrigger = {
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
        <ChatComposerInput triggers={[asyncTrigger]} />,
      );
      expect(container).toBeTruthy();
    });

    it('renders with custom renderItem', () => {
      const trigger = createMentionTrigger({
        renderItem: item => <div data-testid="custom-item">{item.label}</div>,
      });
      const {container} = render(<ChatComposerInput triggers={[trigger]} />);
      expect(container).toBeTruthy();
    });

    it('supports configurable empty/loading text', () => {
      const trigger = createMentionTrigger({
        emptySearchResultsText: 'Nobody found',
        loadingText: 'Looking up...',
        menuLabel: 'People',
      });
      const {container} = render(<ChatComposerInput triggers={[trigger]} />);
      expect(container).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('exposes role=combobox when triggers are configured', () => {
      const triggers = [createMentionTrigger()];
      render(<ChatComposerInput triggers={triggers} />);
      // aria-expanded/haspopup/controls/activedescendant are only valid on
      // role="combobox", so the editable element must be a combobox (not a
      // plain textbox) whenever trigger-menu behavior is wired.
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('has aria-haspopup on the combobox', () => {
      const triggers = [createMentionTrigger()];
      render(<ChatComposerInput triggers={triggers} />);
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('has aria-expanded=false when menu is closed', () => {
      const triggers = [createMentionTrigger()];
      render(<ChatComposerInput triggers={triggers} />);
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
    });

    it('stays role=textbox with no combobox attributes when no triggers are configured', () => {
      render(<ChatComposerInput label="Message" />);
      const textbox = screen.getByRole('textbox', {name: 'Message'});
      // A plain textbox must not carry combobox-only ARIA (axe: aria-allowed-attr).
      expect(textbox).not.toHaveAttribute('aria-expanded');
      expect(textbox).not.toHaveAttribute('aria-haspopup');
    });
  });

  describe('refs', () => {
    it('forwards ref to the root element', () => {
      let root: HTMLDivElement | null = null;
      render(
        <ChatComposerInput
          ref={el => {
            root = el;
          }}
        />,
      );
      expect(root).toBeInstanceOf(HTMLDivElement);
      expect(root).toHaveClass('astryx-chat-composer-input');
    });

    it('exposes imperative handle via handleRef', () => {
      const ref = vi.fn();
      render(<ChatComposerInput handleRef={ref} />);
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
      let handle: ChatComposerInputHandle | null = null;
      render(
        <ChatComposerInput
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
      let handle: ChatComposerInputHandle | null = null;
      const onChange = vi.fn();
      render(
        <ChatComposerInput
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
      const tokenSpan = textbox.querySelector('[data-astryx-token]');
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
      expect(textbox.querySelector('[data-astryx-token]')).toBeNull();
    });

    it('serializes to empty after token backspace', () => {
      let handle: ChatComposerInputHandle | null = null;
      const onChange = vi.fn();
      render(
        <ChatComposerInput
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

      const tokenSpan = textbox.querySelector('[data-astryx-token]')!;
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

  describe('astryx class names', () => {
    it('has astryx-chat-composer-input class', () => {
      const {container} = render(<ChatComposerInput />);
      expect(
        container.querySelector('.astryx-chat-composer-input'),
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

    const BODY_ANCHOR_SELECTOR = 'span[data-astryx-trigger-anchor]';

    function setupTriggerInput(triggers: ChatComposerTrigger[]) {
      const onChange = vi.fn();
      const result = render(
        <ChatComposerInput triggers={triggers} onChange={onChange} />,
      );
      // With triggers configured the editable is a combobox, not a textbox.
      const textbox = screen.getByRole('combobox');
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

    it('setValue closes a stale trigger menu left open over replaced content', () => {
      let handle: ChatComposerInputHandle | null = null;
      render(
        <ChatComposerInput
          triggers={[createMentionTrigger()]}
          onChange={vi.fn()}
          handleRef={h => {
            handle = h;
          }}
        />,
      );
      const textbox = screen.getByRole('combobox');
      textbox.focus();
      setCursorAfterText(textbox, '@');
      fireEvent.input(textbox);
      expect(textbox.getAttribute('aria-expanded')).toBe('true');

      // Replacing the content invalidates the menu's stored trigger
      // position — an item pick on the stale menu would splice the
      // wrong range of the new text. setValue re-evaluates the menu
      // the same way typing does, so the stale menu closes.
      act(() => {
        handle!.setValue('/done ');
      });
      expect(textbox.getAttribute('aria-expanded')).toBe('false');
    });

    it('serialized output is clean — no anchor artifacts', () => {
      let handle: ChatComposerInputHandle | null = null;
      const triggers = [createMentionTrigger()];
      const onChange = vi.fn();
      render(
        <ChatComposerInput
          handleRef={h => {
            handle = h;
          }}
          triggers={triggers}
          onChange={onChange}
        />,
      );
      const textbox = screen.getByRole('combobox');
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
