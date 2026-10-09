// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTriggerMenu.test.tsx
 * @input Uses vitest, @testing-library/react, useTriggerMenu hook
 * @output Unit tests for trigger detection, multi-word queries, IME guard, stale results, and Escape dismissal
 * @position Testing; validates useTriggerMenu.tsx implementation
 *
 * SYNC: When useTriggerMenu.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useTriggerMenu} from './useTriggerMenu';
import type {ChatComposerTrigger} from './ChatComposerInput';
import {createStaticSource} from '../Typeahead/createStaticSource';
import type {SearchableItem, SearchSource} from '../Typeahead/types';

const USERS: SearchableItem[] = [
  {id: 'cindy', label: 'Cindy Zhang'},
  {id: 'alex', label: 'Alex Johnson'},
  {id: 'sam', label: 'Sam Rivera'},
  {id: 'obrien', label: "O'Brien"},
  {id: 'jeanluc', label: "Jean-Luc's Task"},
  {id: 'maria', label: 'María José García de la Fuente'},
  {id: 'rdj', label: 'Robert Downey Jr.'},
  {id: 'q4_review', label: 'Design Review: Q4'},
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
    hasMultiWordQuery: true,
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
    hasMultiWordQuery: false,
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

  // 1. Single-token / behavior unchanged
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

  // 2. hasMultiWordQuery: true allows multi-word names with spaces, punctuation, etc.
  it('2. allows multi-word queries without word count or punctuation cutoffs', async () => {
    const {result} = renderTriggerHook();

    // Multi-word name: "María José García de la Fuente" (6 words)
    await act(async () => {
      setCursor('@María José García de la Fuente');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('María José García de la Fuente');
    expect(result.current.state.items.some(u => u.id === 'maria')).toBe(true);

    // Name with dot: "Robert Downey Jr."
    await act(async () => {
      setCursor('@Robert Downey Jr.');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('Robert Downey Jr.');
    expect(result.current.state.items.some(u => u.id === 'rdj')).toBe(true);

    // Phrase with colon: "Design Review: Q4"
    await act(async () => {
      setCursor('@Design Review: Q4');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('Design Review: Q4');
    expect(result.current.state.items.some(u => u.id === 'q4_review')).toBe(
      true,
    );
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

  // 4. Bounded length (64 chars)
  it('4. bounds active multi-word query length to 64 characters', async () => {
    const {result} = renderTriggerHook();
    const query64 = 'a'.repeat(64);
    const query65 = 'a'.repeat(65);

    await act(async () => {
      setCursor(`@${query64}`);
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe(query64);

    await act(async () => {
      setCursor(`@${query65}`);
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);
  });

  // 5. Apostrophe/hyphen preserved
  it("5. preserves apostrophes and hyphens without terminating (O'Brien, Jean-Luc's Task)", async () => {
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

  // 6. Double space does not close
  it('6. tolerates double spaces without closing', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('@Project  Alpha');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('Project  Alpha');
  });

  // 7. Cursor repositioned into an earlier mention binds correctly
  it('7. binds correctly to earlier mention when cursor is repositioned', async () => {
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

  // 8. Word-boundary gate holds
  it('8. preserves word-boundary gate (email@domain.com, foo/bar do not activate)', async () => {
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

  // 9. Newline hard-terminates even with hasMultiWordQuery: true
  it('9. terminates on newline even with hasMultiWordQuery: true', async () => {
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

  // 10. Punctuation trigger characters (e.g. ':' emoji trigger) activate correctly
  it('10. allows triggers configured with punctuation characters (e.g. ":")', async () => {
    const emojiTrigger: ChatComposerTrigger = {
      character: ':',
      searchSource: createStaticSource([
        {id: 'smile', label: 'smile'},
        {id: 'wave', label: 'wave'},
      ]),
      onSelect: item => `:${item.label}:`,
      hasMultiWordQuery: false,
    };
    const {result} = renderTriggerHook([emojiTrigger, createMentionTrigger()]);

    await act(async () => {
      setCursor(':smile');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.activeTrigger?.character).toBe(':');
    expect(result.current.state.query).toBe('smile');
  });

  // 11. Non-opt-in triggers retain punctuation in queries (e.g. /v1.2, @john.doe)
  it('11. allows punctuation in queries for triggers that do not opt into hasMultiWordQuery', async () => {
    const singleTokenMention: ChatComposerTrigger = {
      character: '@',
      searchSource: createStaticSource([{id: 'john.doe', label: 'john.doe'}]),
      onSelect: item => `@${item.label}`,
      hasMultiWordQuery: false,
    };
    const {result} = renderTriggerHook([
      singleTokenMention,
      createCommandTrigger(),
    ]);

    // Command query with dot: /v1.2
    await act(async () => {
      setCursor('/v1.2');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('v1.2');

    // Single-token mention query with dot: @john.doe
    await act(async () => {
      setCursor('@john.doe');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('john.doe');
  });

  // 12. No matches: hides menu when hasMultiWordQuery matches nothing without emptySearchResultsText
  it('12. hides menu when multi-word query matches nothing and no emptySearchResultsText is set', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('@NonExistentUser12345');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.items).toEqual([]);
    // renderMenu returns null when hasMultiWordQuery matches nothing and emptySearchResultsText is not set
    expect(result.current.renderMenu()).toBeNull();
    expect(result.current.ariaProps['aria-expanded']).toBe(false);
  });

  // 13. Callers with emptySearchResultsText still display empty panel
  it('13. shows empty panel when caller provides emptySearchResultsText', async () => {
    const customEmptyTrigger = createMentionTrigger({
      emptySearchResultsText: 'No matching team members',
    });
    const {result} = renderTriggerHook([customEmptyTrigger]);

    await act(async () => {
      setCursor('@NonExistentUser');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.renderMenu()).not.toBeNull();
    expect(result.current.ariaProps['aria-expanded']).toBe(true);
  });

  // 14. Enter with no matching row does not consume event
  it('14. does not consume Enter when there is no matching row', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('@NonExistentUser');
      result.current.handleInput();
      await Promise.resolve();
    });

    const enterEvent = {
      key: 'Enter',
      preventDefault: vi.fn(),
      nativeEvent: {} as KeyboardEvent,
    } as unknown as React.KeyboardEvent;

    let consumed = false;
    act(() => {
      consumed = result.current.handleKeyDown(enterEvent);
    });

    expect(consumed).toBe(false);
    expect(enterEvent.preventDefault).not.toHaveBeenCalled();
  });

  // 15. Guard IME composition: Enter during IME does not select
  it('15. guards IME composition so Enter during candidate selection does not pick a row', async () => {
    const {result} = renderTriggerHook();

    await act(async () => {
      setCursor('@Cindy');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.items.length).toBeGreaterThan(0);

    const imeEnterEvent = {
      key: 'Enter',
      preventDefault: vi.fn(),
      nativeEvent: {isComposing: true} as unknown as KeyboardEvent,
    } as unknown as React.KeyboardEvent;

    let consumed = false;
    act(() => {
      consumed = result.current.handleKeyDown(imeEnterEvent);
    });

    expect(consumed).toBe(false);
    expect(imeEnterEvent.preventDefault).not.toHaveBeenCalled();
  });

  // 16. Guard stale results: older query search cannot overwrite newer results or be pickable
  it('16. guards against stale search results from in-flight queries', async () => {
    let resolveFirstSearch: (items: SearchableItem[]) => void = () => {};
    let resolveSecondSearch: (items: SearchableItem[]) => void = () => {};

    const asyncSource: SearchSource = {
      async search(query: string) {
        if (query === 'C') {
          return new Promise(resolve => {
            resolveFirstSearch = resolve;
          });
        }
        if (query === 'Ci') {
          return new Promise(resolve => {
            resolveSecondSearch = resolve;
          });
        }
        return [];
      },
      bootstrap: async () => [],
    };

    const asyncTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: asyncSource,
      onSelect: item => `@${item.id}`,
      hasMultiWordQuery: true,
    };

    const {result} = renderTriggerHook([asyncTrigger]);

    // Type @C (search 1 starts)
    await act(async () => {
      setCursor('@C');
      result.current.handleInput();
    });
    expect(result.current.state.isLoading).toBe(true);
    expect(result.current.state.items).toEqual([]);

    // Type @Ci (search 2 starts)
    await act(async () => {
      setCursor('@Ci');
      result.current.handleInput();
    });

    // Older search 1 completes later with stale data
    await act(async () => {
      resolveFirstSearch([{id: 'stale', label: 'Stale Item'}]);
      await Promise.resolve();
    });

    // Stale result should be ignored
    expect(result.current.state.items).toEqual([]);

    // Newer search 2 completes
    await act(async () => {
      resolveSecondSearch([{id: 'cindy', label: 'Cindy Zhang'}]);
      await Promise.resolve();
    });

    expect(result.current.state.items).toEqual([
      {id: 'cindy', label: 'Cindy Zhang'},
    ]);
  });

  // 17. Escape keeps menu hidden while same query keeps growing
  it('17. keeps menu hidden after Escape while that same query keeps growing', async () => {
    const {result} = renderTriggerHook();

    // Type @Cindy -> active
    await act(async () => {
      setCursor('@Cindy');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);

    // Press Escape -> dismissed
    const escapeEvent = {
      key: 'Escape',
      preventDefault: vi.fn(),
      nativeEvent: {} as KeyboardEvent,
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(escapeEvent);
    });
    expect(result.current.state.isActive).toBe(false);

    // User continues typing in the same query "@Cindy " -> stays hidden
    await act(async () => {
      setCursor('@Cindy ');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);

    // User continues typing in the same query "@Cindy Zhang" -> stays hidden
    await act(async () => {
      setCursor('@Cindy Zhang');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(false);

    // User backspaces past the Escape point to "@Cin" -> reactivates
    await act(async () => {
      setCursor('@Cin');
      result.current.handleInput();
      await Promise.resolve();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.query).toBe('Cin');
  });

  // 18. Enter while newer search is pending does not pick previous query's item
  it('18. does not pick a row on Enter while a newer search is pending (isLoading)', async () => {
    let resolveFirstSearch: (items: SearchableItem[]) => void = () => {};
    let resolveSecondSearch: (items: SearchableItem[]) => void = () => {};

    const asyncSource: SearchSource = {
      async search(query: string) {
        if (query === 'C') {
          return new Promise(resolve => {
            resolveFirstSearch = resolve;
          });
        }
        if (query === 'Ci') {
          return new Promise(resolve => {
            resolveSecondSearch = resolve;
          });
        }
        return [];
      },
      bootstrap: async () => [],
    };

    const asyncTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: asyncSource,
      onSelect: vi.fn(item => `@${item.id}`),
      hasMultiWordQuery: true,
    };

    const {result} = renderTriggerHook([asyncTrigger]);

    // Type @C (search 1 starts)
    await act(async () => {
      setCursor('@C');
      result.current.handleInput();
    });

    // Resolve search 1 -> rows populated
    await act(async () => {
      resolveFirstSearch([{id: 'cindy', label: 'Cindy Zhang'}]);
      await Promise.resolve();
    });
    expect(result.current.state.items.length).toBe(1);
    expect(result.current.state.isLoading).toBe(false);

    // Type @Ci (search 2 starts, isLoading becomes true, older items preserved in state)
    await act(async () => {
      setCursor('@Ci');
      result.current.handleInput();
    });
    expect(result.current.state.isLoading).toBe(true);

    // Press Enter while newer search is still loading
    const enterEvent = {
      key: 'Enter',
      preventDefault: vi.fn(),
      nativeEvent: {} as KeyboardEvent,
    } as unknown as React.KeyboardEvent;

    let consumed = false;
    act(() => {
      consumed = result.current.handleKeyDown(enterEvent);
    });

    // Enter must NOT be consumed or pick the old item
    expect(consumed).toBe(false);
    expect(enterEvent.preventDefault).not.toHaveBeenCalled();
    expect(asyncTrigger.onSelect).not.toHaveBeenCalled();

    // Now resolve search 2
    await act(async () => {
      resolveSecondSearch([{id: 'cindy_new', label: 'Cindy New'}]);
      await Promise.resolve();
    });
    expect(result.current.state.isLoading).toBe(false);
  });

  // 19. Arrows are not swallowed when multi-word no-matches menu is hidden
  it('19. does not swallow ArrowDown or ArrowUp when multi-word query has no matches and menu is hidden', async () => {
    const {result} = renderTriggerHook();

    // Type query with no matches -> menu is hidden (renderMenu is null, isMenuVisible is false)
    await act(async () => {
      setCursor('@UnknownNameThatDoesNotMatch');
      result.current.handleInput();
      await Promise.resolve();
    });

    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.items.length).toBe(0);
    expect(result.current.renderMenu()).toBeNull();

    const arrowDownEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
      nativeEvent: {} as KeyboardEvent,
    } as unknown as React.KeyboardEvent;

    let consumedDown = false;
    act(() => {
      consumedDown = result.current.handleKeyDown(arrowDownEvent);
    });

    expect(consumedDown).toBe(false);
    expect(arrowDownEvent.preventDefault).not.toHaveBeenCalled();

    const arrowUpEvent = {
      key: 'ArrowUp',
      preventDefault: vi.fn(),
      nativeEvent: {} as KeyboardEvent,
    } as unknown as React.KeyboardEvent;

    let consumedUp = false;
    act(() => {
      consumedUp = result.current.handleKeyDown(arrowUpEvent);
    });

    expect(consumedUp).toBe(false);
    expect(arrowUpEvent.preventDefault).not.toHaveBeenCalled();
  });

  // 20. Stale search resolving after Escape does not populate items or reopen menu
  it('20. ignores async search results that resolve after Escape dismisses the menu', async () => {
    let resolveSearch: (items: SearchableItem[]) => void = () => {};

    const asyncSource: SearchSource = {
      async search(query: string) {
        if (query === 'C') {
          return new Promise(resolve => {
            resolveSearch = resolve;
          });
        }
        return [];
      },
      bootstrap: async () => [],
    };

    const asyncTrigger: ChatComposerTrigger = {
      character: '@',
      searchSource: asyncSource,
      onSelect: item => `@${item.id}`,
      hasMultiWordQuery: true,
    };

    const {result} = renderTriggerHook([asyncTrigger]);

    // Type @C -> search starts
    await act(async () => {
      setCursor('@C');
      result.current.handleInput();
    });
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.isLoading).toBe(true);

    // Press Escape -> reset called, state inactive
    const escapeEvent = {
      key: 'Escape',
      preventDefault: vi.fn(),
      nativeEvent: {} as KeyboardEvent,
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(escapeEvent);
    });
    expect(result.current.state.isActive).toBe(false);

    // Later, the pending search resolves
    await act(async () => {
      resolveSearch([{id: 'cindy', label: 'Cindy Zhang'}]);
      await Promise.resolve();
    });

    // Results must be dropped and state must remain clean and empty
    expect(result.current.state.isActive).toBe(false);
    expect(result.current.state.items).toEqual([]);
    expect(result.current.state.isLoading).toBe(false);
  });
});
