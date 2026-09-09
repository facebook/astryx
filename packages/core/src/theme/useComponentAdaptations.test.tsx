// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useComponentAdaptations.test.tsx
 * Tests the shared component-adaptation resolver (spec:AST-031 FR3/FR4/FR5 and
 * IR2/IR3): server truth, last-matching-rule precedence, nearest-Theme width
 * points, one shared subscription per compiled query set, and path-specific
 * runtime validation.
 */

import {createElement, StrictMode, type ReactNode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {act, render, renderHook, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Theme} from './Theme';
import {defineTheme} from './defineTheme';
import {resetThemes} from './themeRegistry';
import {
  getAdaptationStoreCount,
  resetAdaptationStores,
  useComponentAdaptations,
} from './useComponentAdaptations';
import type {ComponentAdaptations} from './componentAdaptations';

type Presentation = 'popover' | 'bottom-sheet';
const PRESENTATIONS = ['popover', 'bottom-sheet'] as const;
const OPTIONS = {path: '<Selector adaptations>', values: PRESENTATIONS};

// =============================================================================
// Controllable matchMedia
// =============================================================================

interface FakeMediaQueryList {
  media: string;
  matches: boolean;
  listeners: Set<() => void>;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface MediaEnvironment {
  /** Every query passed to matchMedia, in call order. */
  queries: string[];
  /** One list per distinct query. */
  lists: Map<string, FakeMediaQueryList>;
  matchMedia: ReturnType<typeof vi.fn>;
  /** Flip one query and notify its listeners, as a real browser does. */
  setMatches: (query: string, matches: boolean) => void;
  listenerCount: () => number;
}

function installMatchMedia(
  matching: ReadonlyArray<string> = [],
): MediaEnvironment {
  const lists = new Map<string, FakeMediaQueryList>();
  const queries: string[] = [];

  const matchMedia = vi.fn((media: string) => {
    queries.push(media);
    let list = lists.get(media);
    if (!list) {
      const listeners = new Set<() => void>();
      list = {
        media,
        matches: matching.includes(media),
        listeners,
        addEventListener: (type, listener) => {
          if (type === 'change') {
            listeners.add(listener);
          }
        },
        removeEventListener: (type, listener) => {
          if (type === 'change') {
            listeners.delete(listener);
          }
        },
      };
      lists.set(media, list);
    }
    return list as unknown as MediaQueryList;
  });

  vi.stubGlobal('matchMedia', matchMedia);

  return {
    queries,
    lists,
    matchMedia,
    setMatches(query, matches) {
      const list = lists.get(query);
      if (!list) {
        throw new Error(`No MediaQueryList for ${query}`);
      }
      act(() => {
        list.matches = matches;
        for (const listener of [...list.listeners]) {
          listener();
        }
      });
    },
    listenerCount() {
      let total = 0;
      for (const list of lists.values()) {
        total += list.listeners.size;
      }
      return total;
    },
  };
}

const COMPACT_TOUCH = '(width < 768px) and (pointer: coarse)';
const WIDE = '(width >= 1024px)';

function compactTouchPolicy(): ComponentAdaptations<Presentation> {
  return {
    default: 'popover',
    rules: [
      {when: {width: {below: 'md'}, pointer: 'coarse'}, value: 'bottom-sheet'},
    ],
  };
}

beforeEach(() => {
  resetThemes();
  resetAdaptationStores();
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetAdaptationStores();
});

// =============================================================================
// Resolution
// =============================================================================

describe('resolution', () => {
  it('publishes the default and index -1 when no rule matches', () => {
    installMatchMedia([]);

    const {result} = renderHook(() =>
      useComponentAdaptations(compactTouchPolicy(), OPTIONS),
    );

    expect(result.current).toEqual({value: 'popover', matchedRuleIndex: -1});
  });

  it('publishes the matching rule after hydration', () => {
    installMatchMedia([COMPACT_TOUCH]);

    const {result} = renderHook(() =>
      useComponentAdaptations(compactTouchPolicy(), OPTIONS),
    );

    expect(result.current).toEqual({
      value: 'bottom-sheet',
      matchedRuleIndex: 0,
    });
  });

  it('lets the LAST matching rule win, whatever the condition shape', () => {
    installMatchMedia([COMPACT_TOUCH, '(pointer: coarse)']);
    const policy: ComponentAdaptations<Presentation> = {
      default: 'popover',
      // The first rule is far more specific; author order still decides.
      rules: [
        {
          when: {width: {below: 'md'}, pointer: 'coarse'},
          value: 'bottom-sheet',
        },
        {when: {pointer: 'coarse'}, value: 'popover'},
      ],
    };

    const {result} = renderHook(() => useComponentAdaptations(policy, OPTIONS));

    expect(result.current).toEqual({value: 'popover', matchedRuleIndex: 1});
  });

  it('reorders behavior when the rules are reordered', () => {
    installMatchMedia([COMPACT_TOUCH, '(pointer: coarse)']);
    const policy: ComponentAdaptations<Presentation> = {
      default: 'popover',
      rules: [
        {when: {pointer: 'coarse'}, value: 'popover'},
        {
          when: {width: {below: 'md'}, pointer: 'coarse'},
          value: 'bottom-sheet',
        },
      ],
    };

    const {result} = renderHook(() => useComponentAdaptations(policy, OPTIONS));

    expect(result.current).toEqual({
      value: 'bottom-sheet',
      matchedRuleIndex: 1,
    });
  });

  it('republishes when the environment changes', () => {
    const media = installMatchMedia([]);
    const {result} = renderHook(() =>
      useComponentAdaptations(compactTouchPolicy(), OPTIONS),
    );
    expect(result.current.value).toBe('popover');

    media.setMatches(COMPACT_TOUCH, true);
    expect(result.current).toEqual({
      value: 'bottom-sheet',
      matchedRuleIndex: 0,
    });

    media.setMatches(COMPACT_TOUCH, false);
    expect(result.current).toEqual({value: 'popover', matchedRuleIndex: -1});
  });

  it('treats `below` as exclusive at the exact named point', () => {
    // The compiled query carries the exclusivity; a browser at exactly 768px
    // reports no match for `(width < 768px)`.
    const media = installMatchMedia([]);
    renderHook(() => useComponentAdaptations(compactTouchPolicy(), OPTIONS));

    expect(media.queries).toContain(COMPACT_TOUCH);
    expect(media.queries.join(' ')).not.toContain('max-width');
  });

  it('returns undefined without a policy and subscribes to nothing', () => {
    const media = installMatchMedia([]);

    const {result} = renderHook(() =>
      useComponentAdaptations(undefined, OPTIONS),
    );

    expect(result.current).toEqual({value: undefined, matchedRuleIndex: -1});
    expect(media.matchMedia).not.toHaveBeenCalled();
  });

  it('resolves an empty policy to the default, subscribing to nothing', () => {
    const media = installMatchMedia([COMPACT_TOUCH]);
    const empty: ComponentAdaptations<Presentation> = {
      default: 'bottom-sheet',
      rules: [],
    };

    const {result, rerender} = renderHook(() =>
      useComponentAdaptations(empty, OPTIONS),
    );

    expect(result.current).toEqual({
      value: 'bottom-sheet',
      matchedRuleIndex: -1,
    });
    // Nothing can change the answer, so no MediaQueryList and no shared store.
    expect(media.matchMedia).not.toHaveBeenCalled();
    expect(media.listenerCount()).toBe(0);
    expect(getAdaptationStoreCount()).toBe(0);

    rerender();

    expect(result.current.value).toBe('bottom-sheet');
    expect(getAdaptationStoreCount()).toBe(0);
  });

  it('keeps an empty policy on the default when the environment changes', () => {
    const media = installMatchMedia([]);
    // A sibling policy owns the only live query; the empty one must not follow
    // it, and must not be handed that store by the shared registry.
    renderHook(() => useComponentAdaptations(compactTouchPolicy(), OPTIONS));
    const {result} = renderHook(() =>
      useComponentAdaptations(
        {
          default: 'popover',
          rules: [],
        } satisfies ComponentAdaptations<Presentation>,
        OPTIONS,
      ),
    );

    media.setMatches(COMPACT_TOUCH, true);

    expect(result.current).toEqual({value: 'popover', matchedRuleIndex: -1});
    expect(getAdaptationStoreCount()).toBe(1);
  });

  it('renders the default for an empty policy during SSR', () => {
    const matchMedia = vi.fn();
    vi.stubGlobal('matchMedia', matchMedia);

    function Probe() {
      const {value} = useComponentAdaptations(
        {
          default: 'popover',
          rules: [],
        } satisfies ComponentAdaptations<Presentation>,
        OPTIONS,
      );
      return createElement('output', null, value);
    }

    expect(renderToString(createElement(Probe))).toContain('popover');
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it('drops the subscription when a policy loses its last rule', () => {
    const media = installMatchMedia([COMPACT_TOUCH]);
    const withRule = compactTouchPolicy();
    const {result, rerender} = renderHook(
      ({policy}: {policy: ComponentAdaptations<Presentation>}) =>
        useComponentAdaptations(policy, OPTIONS),
      {initialProps: {policy: withRule}},
    );

    expect(result.current.value).toBe('bottom-sheet');
    expect(media.listenerCount()).toBe(1);

    rerender({policy: {default: 'popover', rules: []}});

    expect(result.current).toEqual({value: 'popover', matchedRuleIndex: -1});
    expect(media.listenerCount()).toBe(0);
    expect(getAdaptationStoreCount()).toBe(0);
  });

  it('keeps a stable result object while the match is unchanged', () => {
    installMatchMedia([]);
    const {result, rerender} = renderHook(() =>
      useComponentAdaptations(compactTouchPolicy(), OPTIONS),
    );
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});

// =============================================================================
// Server truth (FR3)
// =============================================================================

describe('server and hydration', () => {
  it('renders the default during SSR without reading matchMedia', () => {
    const matchMedia = vi.fn();
    vi.stubGlobal('matchMedia', matchMedia);

    function Probe() {
      const {value, matchedRuleIndex} = useComponentAdaptations(
        compactTouchPolicy(),
        OPTIONS,
      );
      return createElement('output', {'data-index': matchedRuleIndex}, value);
    }

    const html = renderToString(createElement(Probe));

    expect(html).toContain('popover');
    expect(html).toContain('data-index="-1"');
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it('hydrates with the default, then publishes the browser match', async () => {
    installMatchMedia([COMPACT_TOUCH]);

    function Probe() {
      const {value} = useComponentAdaptations(compactTouchPolicy(), OPTIONS);
      return createElement('output', null, value);
    }

    const serverHTML = renderToString(createElement(Probe));
    expect(serverHTML).toContain('popover');

    const container = document.createElement('div');
    container.innerHTML = serverHTML;
    document.body.appendChild(container);

    const recoverableErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, createElement(Probe), {
        onRecoverableError: error => recoverableErrors.push(error),
      });
    });

    // The hydration render used the server snapshot, so React reconciled the
    // real match afterwards rather than reporting a mismatch.
    await waitFor(() =>
      expect(container.querySelector('output')?.textContent).toBe(
        'bottom-sheet',
      ),
    );
    expect(recoverableErrors).toEqual([]);

    act(() => root?.unmount());
    container.remove();
  });

  it('falls back to the default when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);

    const {result} = renderHook(() =>
      useComponentAdaptations(compactTouchPolicy(), OPTIONS),
    );

    expect(result.current).toEqual({value: 'popover', matchedRuleIndex: -1});
  });
});

// =============================================================================
// Nearest Theme (FR5)
// =============================================================================

describe('effective width points', () => {
  function Probe() {
    const {value} = useComponentAdaptations(compactTouchPolicy(), OPTIONS);
    return createElement('output', null, value);
  }

  function wrapper(theme: ReturnType<typeof defineTheme>) {
    return function Wrapper({children}: {children: ReactNode}) {
      return <Theme theme={theme}>{children}</Theme>;
    };
  }

  it('uses AST-012 defaults without a theme', () => {
    const media = installMatchMedia([]);

    renderHook(() => useComponentAdaptations(compactTouchPolicy(), OPTIONS));

    expect(media.queries).toContain('(width < 768px) and (pointer: coarse)');
  });

  it("uses the nearest Theme's overridden point", () => {
    const media = installMatchMedia([]);
    const theme = {
      ...defineTheme({
        name: 'adaptation-points',
        adaptations: {widthBreakpoints: {md: 900}},
      }),
      __built: true as const,
    };

    renderHook(() => useComponentAdaptations(compactTouchPolicy(), OPTIONS), {
      wrapper: wrapper(theme),
    });

    expect(media.queries).toContain('(width < 900px) and (pointer: coarse)');
    expect(media.queries).not.toContain(COMPACT_TOUCH);
  });

  it('lets a nested Theme select a different value at one viewport width', () => {
    const media = installMatchMedia(['(width < 900px) and (pointer: coarse)']);
    const outer = {
      ...defineTheme({
        name: 'adaptation-outer',
        adaptations: {widthBreakpoints: {md: 700}},
      }),
      __built: true as const,
    };
    const inner = {
      ...defineTheme({
        name: 'adaptation-inner',
        adaptations: {widthBreakpoints: {md: 900}},
      }),
      __built: true as const,
    };

    render(
      <Theme theme={outer}>
        <div data-testid="outer">
          <Probe />
        </div>
        <Theme theme={inner}>
          <div data-testid="inner">
            <Probe />
          </div>
        </Theme>
      </Theme>,
    );

    // 700px point does not match, 900px point does — same viewport, two values.
    expect(screen.getByTestId('outer').textContent).toBe('popover');
    expect(screen.getByTestId('inner').textContent).toBe('bottom-sheet');
    expect(media.queries).toContain('(width < 700px) and (pointer: coarse)');
  });

  it('follows the registered root theme without provider context', () => {
    const media = installMatchMedia([]);
    defineTheme({
      name: 'adaptation-root-fallback',
      adaptations: {widthBreakpoints: {md: 700}},
    });
    const original = document.documentElement.getAttribute.bind(
      document.documentElement,
    );
    vi.spyOn(document.documentElement, 'getAttribute').mockImplementation(
      name =>
        name === 'data-astryx-theme'
          ? 'adaptation-root-fallback'
          : original(name),
    );

    renderHook(() => useComponentAdaptations(compactTouchPolicy(), OPTIONS));

    expect(media.queries).toContain('(width < 700px) and (pointer: coarse)');
  });
});

// =============================================================================
// Subscription identity and cleanup (IR2)
// =============================================================================

describe('subscriptions', () => {
  it('does not resubscribe when an inline policy literal is re-created', () => {
    const media = installMatchMedia([]);
    const {rerender} = renderHook(() =>
      // A NEW object and a NEW rules array on every render, as documented.
      useComponentAdaptations(
        {
          default: 'popover',
          rules: [
            {
              when: {width: {below: 'md'}, pointer: 'coarse'},
              value: 'bottom-sheet',
            },
          ],
        } satisfies ComponentAdaptations<Presentation>,
        OPTIONS,
      ),
    );

    const listenersAfterMount = media.listenerCount();
    const listsAfterMount = media.lists.size;
    rerender();
    rerender();
    rerender();

    expect(listenersAfterMount).toBe(1);
    expect(media.listenerCount()).toBe(1);
    expect(media.lists.size).toBe(listsAfterMount);
    expect(getAdaptationStoreCount()).toBe(1);
  });

  it('shares one store across components with identical queries', () => {
    const media = installMatchMedia([]);

    function Probe() {
      const {value} = useComponentAdaptations(compactTouchPolicy(), OPTIONS);
      return createElement('output', null, value);
    }

    const view = render(
      createElement(
        'div',
        null,
        createElement(Probe),
        createElement(Probe),
        createElement(Probe),
      ),
    );

    expect(media.lists.size).toBe(1);
    expect(media.listenerCount()).toBe(1);
    expect(getAdaptationStoreCount()).toBe(1);

    view.unmount();

    expect(media.listenerCount()).toBe(0);
    expect(getAdaptationStoreCount()).toBe(0);
  });

  it('subscribes per distinct compiled query and cleans every listener up', () => {
    const media = installMatchMedia([]);
    const policy: ComponentAdaptations<Presentation> = {
      default: 'popover',
      rules: [
        {when: {width: {below: 'md'}}, value: 'bottom-sheet'},
        {when: {width: {from: 'lg'}}, value: 'popover'},
      ],
    };

    const {unmount} = renderHook(() =>
      useComponentAdaptations(policy, OPTIONS),
    );

    expect([...media.lists.keys()]).toEqual(['(width < 768px)', WIDE]);
    expect(media.listenerCount()).toBe(2);

    unmount();

    expect(media.listenerCount()).toBe(0);
    expect(getAdaptationStoreCount()).toBe(0);
  });

  it('resubscribes when the compiled queries actually change', () => {
    const media = installMatchMedia([]);
    const {rerender} = renderHook(
      ({below}: {below: 'md' | 'lg'}) =>
        useComponentAdaptations(
          {
            default: 'popover',
            rules: [{when: {width: {below}}, value: 'bottom-sheet'}],
          } satisfies ComponentAdaptations<Presentation>,
          OPTIONS,
        ),
      {initialProps: {below: 'md'}},
    );

    expect([...media.lists.keys()]).toEqual(['(width < 768px)']);

    rerender({below: 'lg'});

    expect([...media.lists.keys()]).toEqual([
      '(width < 768px)',
      '(width < 1024px)',
    ]);
    // The abandoned query's listener is released, not stranded.
    expect(media.lists.get('(width < 768px)')?.listeners.size).toBe(0);
    expect(media.lists.get('(width < 1024px)')?.listeners.size).toBe(1);
    expect(getAdaptationStoreCount()).toBe(1);
  });

  it('keeps other subscribers alive when one component unmounts', () => {
    const media = installMatchMedia([]);

    function Probe() {
      const {value} = useComponentAdaptations(compactTouchPolicy(), OPTIONS);
      return createElement('output', null, value);
    }

    const view = render(
      createElement(
        'div',
        null,
        createElement(Probe, {key: 'a'}),
        createElement(Probe, {key: 'b'}),
      ),
    );
    view.rerender(createElement('div', null, createElement(Probe, {key: 'a'})));

    expect(media.listenerCount()).toBe(1);

    media.setMatches(COMPACT_TOUCH, true);
    expect(screen.getByText('bottom-sheet')).toBeInTheDocument();
  });

  it('shares one connection between callers with different value domains', () => {
    const media = installMatchMedia([]);

    // Two components admit different policy values but compile to the SAME
    // query text, so they share one connection. The connection publishes a
    // matching-rule INDEX, never a value: each caller maps that index through
    // its own values array. A connection that cached a resolved value — or
    // that keyed on anything other than the queries — would leak one
    // component's vocabulary into the other.
    type Picker = 'astryx' | 'native';
    const PICKERS = ['astryx', 'native'] as const;

    function SelectorProbe() {
      const {value, matchedRuleIndex} = useComponentAdaptations(
        compactTouchPolicy(),
        OPTIONS,
      );
      return createElement(
        'output',
        {'data-testid': 'selector', 'data-index': matchedRuleIndex},
        value,
      );
    }

    function DateProbe() {
      const {value, matchedRuleIndex} = useComponentAdaptations(
        {
          default: 'astryx',
          rules: [
            {
              when: {width: {below: 'md'}, pointer: 'coarse'},
              value: 'native',
            },
          ],
        } satisfies ComponentAdaptations<Picker>,
        {path: '<DateInput adaptations>', values: PICKERS},
      );
      return createElement(
        'output',
        {'data-testid': 'date', 'data-index': matchedRuleIndex},
        value,
      );
    }

    render(
      createElement(
        'div',
        null,
        createElement(SelectorProbe),
        createElement(DateProbe),
      ),
    );

    // One connection, one MediaQueryList, one listener — for both callers.
    expect(getAdaptationStoreCount()).toBe(1);
    expect(media.lists.size).toBe(1);
    expect(media.listenerCount()).toBe(1);

    // No match: each caller falls back to its OWN default.
    expect(screen.getByTestId('selector')).toHaveTextContent('popover');
    expect(screen.getByTestId('date')).toHaveTextContent('astryx');
    expect(screen.getByTestId('selector')).toHaveAttribute('data-index', '-1');
    expect(screen.getByTestId('date')).toHaveAttribute('data-index', '-1');

    media.setMatches(COMPACT_TOUCH, true);

    // Same shared index, two different values.
    expect(screen.getByTestId('selector')).toHaveAttribute('data-index', '0');
    expect(screen.getByTestId('date')).toHaveAttribute('data-index', '0');
    expect(screen.getByTestId('selector')).toHaveTextContent('bottom-sheet');
    expect(screen.getByTestId('date')).toHaveTextContent('native');

    media.setMatches(COMPACT_TOUCH, false);

    expect(screen.getByTestId('selector')).toHaveTextContent('popover');
    expect(screen.getByTestId('date')).toHaveTextContent('astryx');
  });

  it('keeps each caller inside its own value domain when rules diverge', () => {
    // Same shared query set, but the two callers order their values
    // differently: index 1 must mean each caller's OWN second rule.
    const media = installMatchMedia([]);
    const WIDE_QUERY = '(width >= 1024px)';

    function make(
      testid: string,
      first: string,
      second: string,
      fallback: string,
    ) {
      return function Probe() {
        const {value, matchedRuleIndex} = useComponentAdaptations(
          {
            default: fallback,
            rules: [
              {when: {width: {below: 'md'}, pointer: 'coarse'}, value: first},
              {when: {width: {from: 'lg'}}, value: second},
            ],
          } satisfies ComponentAdaptations<string>,
          {path: `<${testid} adaptations>`},
        );
        return createElement(
          'output',
          {'data-testid': testid, 'data-index': matchedRuleIndex},
          value,
        );
      };
    }

    const First = make('first', 'sheet', 'anchored', 'anchored');
    const Second = make('second', 'native', 'astryx', 'astryx');

    render(
      createElement('div', null, createElement(First), createElement(Second)),
    );

    expect(getAdaptationStoreCount()).toBe(1);
    expect(media.listenerCount()).toBe(2);

    media.setMatches(WIDE_QUERY, true);

    expect(screen.getByTestId('first')).toHaveAttribute('data-index', '1');
    expect(screen.getByTestId('second')).toHaveAttribute('data-index', '1');
    expect(screen.getByTestId('first')).toHaveTextContent('anchored');
    expect(screen.getByTestId('second')).toHaveTextContent('astryx');
  });
});

// =============================================================================
// Store lifecycle (IR2) — StrictMode, server renders, late polyfills
// =============================================================================

describe('connection lifecycle', () => {
  function Probe() {
    const {value} = useComponentAdaptations(compactTouchPolicy(), OPTIONS);
    return createElement('output', null, value);
  }

  it('re-registers after a StrictMode remount, so later mounts still share', () => {
    const media = installMatchMedia([]);

    // The first Probe keeps a STABLE position across the rerender below, so it
    // stays mounted and subscribed; only the second one is new. Otherwise
    // React remounts everything and any implementation re-registers.
    const first = render(
      createElement(
        StrictMode,
        null,
        createElement('div', null, createElement(Probe, {key: 'a'})),
      ),
    );

    expect(getAdaptationStoreCount()).toBe(1);
    expect(media.listenerCount()).toBe(1);

    // A second identical policy mounting AFTERWARDS must join the connection
    // the surviving subscriber holds. StrictMode's subscribe → unsubscribe →
    // subscribe closed and reopened it; a design that only registered once,
    // at creation, leaves the registry empty here and opens a second
    // connection — two MediaQueryList sets and two listener registrations.
    first.rerender(
      createElement(
        StrictMode,
        null,
        createElement(
          'div',
          null,
          createElement(Probe, {key: 'a'}),
          createElement(Probe, {key: 'b'}),
        ),
      ),
    );

    expect(getAdaptationStoreCount()).toBe(1);
    expect(media.lists.size).toBe(1);
    expect(media.listenerCount()).toBe(1);

    // And the shared connection is live for every subscriber.
    media.setMatches(COMPACT_TOUCH, true);
    expect(screen.getAllByText('bottom-sheet')).toHaveLength(2);

    first.unmount();
    expect(getAdaptationStoreCount()).toBe(0);
    expect(media.listenerCount()).toBe(0);
  });

  it('leaves the registry empty across repeated server renders', () => {
    const matchMedia = vi.fn();
    vi.stubGlobal('matchMedia', matchMedia);

    for (let index = 0; index < 3; index++) {
      expect(renderToString(createElement(Probe))).toContain('popover');
    }

    // A render that never commits must register nothing: on a server this map
    // is process-wide and would grow without bound.
    expect(getAdaptationStoreCount()).toBe(0);
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it('leaves the registry empty when a client render is abandoned', () => {
    installMatchMedia([]);

    // A concurrent render that is thrown away calls getSnapshot but never
    // subscribes.
    renderToString(createElement(Probe));

    expect(getAdaptationStoreCount()).toBe(0);
  });

  it('attaches listeners when matchMedia only appears after the first subscriber', () => {
    // First subscriber arrives with no matchMedia at all. It renders inside a
    // stable container so the rerender below ADDS a sibling rather than
    // remounting it — a remount would re-attach on any implementation.
    vi.stubGlobal('matchMedia', undefined);
    const view = render(
      createElement('div', null, createElement(Probe, {key: 'early'})),
    );

    expect(screen.getByText('popover')).toBeInTheDocument();
    expect(getAdaptationStoreCount()).toBe(1);

    // The polyfill lands, and a second identical subscriber joins the SAME
    // connection. Attachment must not be inferred from "this is the first
    // subscriber": the lists did not exist then, so nothing was attached, and
    // the surviving early subscriber means the count is no longer zero.
    const media = installMatchMedia([]);
    view.rerender(
      createElement(
        'div',
        null,
        createElement(Probe, {key: 'early'}),
        createElement(Probe, {key: 'late'}),
      ),
    );

    expect(media.listenerCount()).toBe(1);

    media.setMatches(COMPACT_TOUCH, true);
    expect(screen.getAllByText('bottom-sheet')).toHaveLength(2);

    view.unmount();
    expect(media.listenerCount()).toBe(0);
    expect(getAdaptationStoreCount()).toBe(0);
  });
});

// =============================================================================
// Runtime validation (IR3)
// =============================================================================

describe('runtime validation', () => {
  function renderPolicy(policy: unknown) {
    return renderHook(() =>
      useComponentAdaptations(
        policy as ComponentAdaptations<Presentation>,
        OPTIONS,
      ),
    );
  }

  beforeEach(() => {
    installMatchMedia([]);
    // React logs the thrown render error; the assertion is the throw itself.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it.each([
    [
      {
        default: 'popover',
        rules: [{when: {contrast: 'more'}, value: 'popover'}],
      },
      '<Selector adaptations>.rules[0].when.contrast is not supported.',
    ],
    [
      {default: 'popover', rules: [{when: {}, value: 'popover'}]},
      '<Selector adaptations>.rules[0].when must contain at least one condition.',
    ],
    [
      {
        default: 'popover',
        rules: [{when: {width: {below: 'xs'}}, value: 'popover'}],
      },
      '<Selector adaptations>.rules[0].when.width.below must be one of sm, md, lg, xl, 2xl.',
    ],
    [
      {
        default: 'popover',
        rules: [{when: {width: {from: 'lg', below: 'sm'}}, value: 'popover'}],
      },
      '<Selector adaptations>.rules[0].when.width must resolve to `from < below`',
    ],
    [
      {default: 'popover'},
      '<Selector adaptations>.rules is required; pass [] for no rules.',
    ],
    [
      {
        default: 'popover',
        rules: [{when: {pointer: 'coarse'}, value: 'modal'}],
      },
      '<Selector adaptations>.rules[0].value must be one of popover, bottom-sheet',
    ],
  ])(
    'rejects an unusable policy before any surface opens %#',
    (policy, message) => {
      expect(() => renderPolicy(policy)).toThrow(message);
    },
  );

  it.each([
    ['null', null],
    ['false', false],
    ['zero', 0],
    ['empty string', ''],
    ['NaN', Number.NaN],
  ])('rejects the falsy non-undefined policy %s', (_label, policy) => {
    // Only `undefined` means "no policy". A truthiness guard would treat each
    // of these as an absent prop and publish `undefined`, hiding an untyped
    // caller's mistake behind a component that silently never adapts.
    expect(() => renderPolicy(policy)).toThrow(
      '<Selector adaptations> must be an object.',
    );
  });

  it.each([
    ['an array', []],
    ['a string', 'popover'],
    ['a number', 1],
    ['true', true],
  ])('rejects the truthy non-object policy %s', (_label, policy) => {
    expect(() => renderPolicy(policy)).toThrow(
      '<Selector adaptations> must be an object.',
    );
  });

  it('still treats an explicitly spread undefined as no policy', () => {
    // The documented escape hatch: `{...maybeAdaptations}` spreading nothing
    // must stay a no-op, not a thrown render.
    const props: {adaptations?: ComponentAdaptations<Presentation>} = {
      adaptations: undefined,
    };

    const {result} = renderHook(() =>
      useComponentAdaptations(props.adaptations, OPTIONS),
    );

    expect(result.current).toEqual({value: undefined, matchedRuleIndex: -1});
    expect(getAdaptationStoreCount()).toBe(0);
  });

  it('rejects a falsy policy without leaving a connection behind', () => {
    expect(() => renderPolicy(null)).toThrow();

    expect(getAdaptationStoreCount()).toBe(0);
  });

  it('rejects a width edge the active theme cannot order', () => {
    const theme = {
      ...defineTheme({
        name: 'adaptation-equal-edges',
        // Legal on its own; `{from: 'md', below: 'lg'}` becomes an empty band.
        adaptations: {widthBreakpoints: {md: 1000, lg: 1001}},
      }),
      __built: true as const,
    };

    expect(() =>
      renderHook(
        () =>
          useComponentAdaptations(
            {
              default: 'popover',
              rules: [
                {when: {width: {from: 'lg', below: 'md'}}, value: 'popover'},
              ],
            } satisfies ComponentAdaptations<Presentation>,
            OPTIONS,
          ),
        {
          wrapper: ({children}: {children: ReactNode}) => (
            <Theme theme={theme}>{children}</Theme>
          ),
        },
      ),
    ).toThrow('must resolve to `from < below`; lg is 1001px and md is 1000px.');
  });
});

// =============================================================================
// No CSS, no new context (IR4)
// =============================================================================

describe('no CSS emission', () => {
  it('does not inject a stylesheet for a resolved policy', () => {
    installMatchMedia([COMPACT_TOUCH]);
    const before = document.head.querySelectorAll('style').length;

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(
        createElement(function Probe() {
          const {value} = useComponentAdaptations(
            compactTouchPolicy(),
            OPTIONS,
          );
          return createElement('output', null, value);
        }),
      );
    });

    expect(document.head.querySelectorAll('style').length).toBe(before);
    act(() => root.unmount());
  });
});
