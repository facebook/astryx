// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTriggerMenu.test.tsx
 * @input Uses vitest, @testing-library/react, useTriggerMenu hook
 * @output Unit tests for trigger detection, whitespace tolerance, and punctuation termination
 * @position Testing; validates useTriggerMenu.tsx implementation
 *
 * SYNC: When useTriggerMenu.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useTriggerMenu} from './useTriggerMenu';
import type {ChatComposerTrigger} from './ChatComposerInput';
import {createStaticSource} from '../Typeahead/createStaticSource';
import type {SearchableItem} from '../Typeahead/types';

const USERS: SearchableItem[] = [
  {id: 'cindy', label: 'Cindy Zhang'},
  {id: 'alex', label: 'Alex Johnson'},
  {id: 'sam', label: 'Sam Rivera'},
  {id: 'obrien', label: "O'Brien"},
  {id: 'jeanluc', label: "Jean-Luc's Task"},
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
    allowSpaces: true,
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
    allowSpaces: false,
    ...overrides,
  };
}

describe('useTriggerMenu', () => {
  let editable: HTMLDivElement;

  beforeEach(() => {
    editable = document.createElement('div');
    editable.contentEditable = 'true';
    document.body.appendChild(editable);
  });

  afterEach(() => {
    editable.remove();
    const selection = window.getSelection();
    selection?.removeAllRanges();
  });

  function setCursor(text: string, cursorOffset?: number) {
    editable.textContent = text;
    const textNode = editable.firstChild;
    const offset = cursorOffset ?? text.length;

    const selection = window.getSelection();
    if (!selection) {
      return;
    }
    selection.removeAllRanges();

    if (textNode) {
      const range = document.createRange();
      range.setStart(textNode, offset);
      range.collapse(true);
      selection.addRange(range);
    }
  }

  function renderTriggerHook(triggers?: ChatComposerTrigger[]) {
    return renderHook(() =>
      useTriggerMenu({
        triggers: triggers ?? [createMentionTrigger(), createCommandTrigger()],
        editableRef: {current: editable},
        onInsertToken: vi.fn(),
        onInsertText: vi.fn(),
        onEmitChange: vi.fn(),
        debounceMs: 0,
      }),
    );
  }

  // 1. Single-token / behavior unchanged (own dedicated test, not merged with @ cases)
  it('1. single-token / command behavior is unchanged and terminates on space', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('/summarize');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('summarize');
    expect(result.current.state.activeTrigger?.character).toBe('/');

    // Space immediately terminates single-token trigger
    await act(async () => {
      setCursor('/summarize ');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);

    // Further typing after space remains inactive
    await act(async () => {
      setCursor('/summarize now');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);
  });

  // 2. allowSpaces: true multi-word match (@Project Alpha)
  it('2. allows multi-word queries when allowSpaces is true', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('@Project');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('Project');

    await act(async () => {
      setCursor('@Project Alpha');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('Project Alpha');
  });

  // 3. Trailing-space browse-all (@ )
  it('3. supports trailing-space browse-all query', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('@ ');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe(' ');

    await act(async () => {
      setCursor('@Project ');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('Project ');
  });

  // 4. Punctuation termination, attached and spaced
  it('4. terminates on punctuation terminators (attached or spaced)', async () => {
    const {result} = renderTriggerHook();
    const terminators = ['.', ',', '!', '?', ';', ':'];

    for (const term of terminators) {
      // Attached punctuation
      await act(async () => {
        setCursor(`@Project Alpha${term}`);
        result.current.handleInput();
        await Promise.resolve();
      });
      expect(result.current.state.isActive).toBe(false);

      // Spaced punctuation
      await act(async () => {
        setCursor(`@Project Alpha ${term}`);
        result.current.handleInput();
        await Promise.resolve();
      });
      expect(result.current.state.isActive).toBe(false);
    }
  });

  // 5. Zero-length query + immediate punctuation -> null (dedicated test)
  it('5. returns null on zero-length query immediately followed by punctuation', async () => {
    const {result} = renderTriggerHook();
    const terminators = ['.', ',', '!', '?', ';', ':'];

    for (const term of terminators) {
      await act(async () => {
        setCursor(`@${term}`);
        result.current.handleInput();
        await Promise.resolve();
      });
      expect(result.current.state.isActive).toBe(false);
      expect(result.current.state.activeTrigger).toBeNull();
    }
  });

  // 6. Apostrophe/hyphen preserved (O'Brien, Jean-Luc's Task)
  it("6. preserves apostrophes and hyphens without terminating (O'Brien, Jean-Luc's Task)", async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor("@O'Brien");
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe("O'Brien");

    await act(async () => {
      setCursor("@Jean-Luc's Task");
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe("Jean-Luc's Task");
  });

  // 7. Word cap: 5 words active, 6 closes
  it('7. enforces 5-word cap (5 words active, 6 words closes)', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('@one two three four five');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('one two three four five');

    await act(async () => {
      setCursor('@one two three four five six');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);
  });

  // 8. Double space does not close or over-count words
  it('8. tolerates double spaces without closing or over-counting words', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('@Project  Alpha');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('Project  Alpha');

    await act(async () => {
      setCursor('@one  two  three  four  five');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('one  two  three  four  five');
  });

  // 9. Backspace past a terminator reactivates statelessly
  it('9. reactivates statelessly when backspacing past a terminator', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('@Project Alpha,');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);

    // User backspaces the comma
    await act(async () => {
      setCursor('@Project Alpha');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('Project Alpha');
  });

  // 10. Cursor repositioned into an earlier mention binds correctly
  it('10. binds correctly to earlier mention when cursor is repositioned', async () => {
    const {result} = renderTriggerHook();
    const fullText = 'Hello @First and @Second Name';

    // Reposition cursor right after "@First and" (offset 16)
    await act(async () => {
      setCursor(fullText, 16);
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('First and');

    // Reposition cursor at end of fullText
    await act(async () => {
      setCursor(fullText, fullText.length);
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('Second Name');
  });

  // 11. Word-boundary gate holds (email@domain.com does not activate)
  it('11. preserves word-boundary gate (email@domain.com, foo/bar do not activate)', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('email@domain.com');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);

    await act(async () => {
      setCursor('foo/bar');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);
  });

  // 12. Newline hard-terminates even with allowSpaces: true
  it('12. terminates on newline even with allowSpaces: true', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('@Project\nAlpha');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);

    await act(async () => {
      setCursor('@\n');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);
  });
});
