// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateInputAdaptations.test.tsx
 * @input Uses vitest, @testing-library/react, react-dom/server
 * @output Tests DateInput's public surface policy (spec:AST-031)
 * @position Tests; validates the `adaptations` prop — resolution, eager
 *   validation, latching — and the deprecated `nativePicker` compatibility
 *   path beside it, including the documented migration mapping.
 *   Behavior that is not surface selection (month geometry, typing, the sheet's
 *   internals) stays in DateInput.test.tsx and DateInputTouch.test.tsx.
 *
 * The environment here is a REAL query evaluator rather than a
 * `query === '<literal>'` stub: an exact-boundary rule (`width < md`) can only
 * be told apart from an inclusive one by a stub that computes an answer from an
 * actual viewport width, and a latch test needs listeners that actually fire.
 *
 * SYNC: When DateInput's surface policy changes, update these tests.
 * - /packages/core/src/DateInput/DateInput.tsx
 * - /packages/core/src/hooks/useAdaptationSurfaceLatch.ts
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, act, fireEvent, waitFor} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {hydrateRoot} from 'react-dom/client';
import {useState, type ReactNode} from 'react';
import {DateInput} from './DateInput';
import type {DateInputAdaptationValue, DateInputProps} from './DateInput';
import {Theme} from '../theme/Theme';
import {defineTheme} from '../theme/defineTheme';
import {resetThemes} from '../theme/themeRegistry';
import {
  getAdaptationStoreCount,
  resetAdaptationStores,
} from '../theme/useComponentAdaptations';
import type {ComponentAdaptations} from '../theme/componentAdaptations';
import type {ISODateString} from '../utils';

// =============================================================================
// A viewport, not a query allowlist
// =============================================================================

interface Viewport {
  width: number;
  pointer: 'coarse' | 'fine';
}

interface FakeMediaQueryList {
  media: string;
  matches: boolean;
  listeners: Set<() => void>;
}

interface Environment {
  /** Every distinct query anything asked about. */
  queries: () => string[];
  /**
   * Only the queries a surface policy can produce. Unrelated hooks in the tree
   * ask about hover and reduced motion, so "subscribed to nothing" has to mean
   * "asked nothing about the viewport", not "never called matchMedia".
   */
  policyQueries: () => string[];
  /** Move the viewport and notify listeners, as a resize or rotation does. */
  set: (next: Partial<Viewport>) => void;
}

/** Matches the repo-wide setup polyfill, so hover-gated behavior still works. */
const HOVER_CAPABLE = /\(\s*hover\s*:\s*hover\s*\)/;

/**
 * Evaluate one media query against a viewport.
 *
 * Understands the grammars in play: AST-031's compiled range syntax
 * (`(width < 768px)`), the legacy `(max-width: …)` / `(min-width: …)` forms,
 * and pointer precision. Anything else falls back to the repo's default
 * answer so unrelated hooks keep behaving.
 */
function evaluate(query: string, viewport: Viewport): boolean {
  const parts = query.split(' and ').map(part => part.trim());
  let understood = false;
  const value = parts.every(part => {
    const range = /^\(width (<|<=|>|>=) (\d+)px\)$/.exec(part);
    if (range) {
      understood = true;
      const point = Number(range[2]);
      switch (range[1]) {
        case '<':
          return viewport.width < point;
        case '<=':
          return viewport.width <= point;
        case '>':
          return viewport.width > point;
        default:
          return viewport.width >= point;
      }
    }
    const maxWidth = /^\(max-width:\s*(\d+)px\)$/.exec(part);
    if (maxWidth) {
      understood = true;
      return viewport.width <= Number(maxWidth[1]);
    }
    const minWidth = /^\(min-width:\s*(\d+)px\)$/.exec(part);
    if (minWidth) {
      understood = true;
      return viewport.width >= Number(minWidth[1]);
    }
    const anyPointer = /^\(any-pointer:\s*(coarse|fine)\)$/.exec(part);
    if (anyPointer) {
      understood = true;
      return anyPointer[1] === viewport.pointer;
    }
    const pointer = /^\(pointer:\s*(coarse|fine)\)$/.exec(part);
    if (pointer) {
      understood = true;
      return pointer[1] === viewport.pointer;
    }
    return false;
  });
  return understood ? value : HOVER_CAPABLE.test(query);
}

function installEnvironment(initial: Viewport): Environment {
  const viewport: Viewport = {...initial};
  const lists = new Map<string, FakeMediaQueryList>();

  vi.stubGlobal(
    'matchMedia',
    vi.fn((media: string) => {
      let list = lists.get(media);
      if (!list) {
        list = {
          media,
          matches: evaluate(media, viewport),
          listeners: new Set(),
        };
        lists.set(media, list);
      }
      // Re-evaluate on every read: a list created before a `set` must not
      // report the viewport it was born in.
      list.matches = evaluate(media, viewport);
      const handle = list;
      return {
        get matches() {
          return handle.matches;
        },
        media,
        onchange: null,
        addEventListener: (type: string, listener: () => void) => {
          if (type === 'change') {
            handle.listeners.add(listener);
          }
        },
        removeEventListener: (type: string, listener: () => void) => {
          if (type === 'change') {
            handle.listeners.delete(listener);
          }
        },
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList;
    }),
  );

  return {
    queries: () => [...lists.keys()],
    policyQueries: () =>
      [...lists.keys()].filter(
        query => query.includes('width') || query.includes('pointer'),
      ),
    set(next) {
      Object.assign(viewport, next);
      act(() => {
        for (const list of lists.values()) {
          const matches = evaluate(list.media, viewport);
          if (matches === list.matches) {
            continue;
          }
          list.matches = matches;
          for (const listener of [...list.listeners]) {
            listener();
          }
        }
      });
    },
  };
}

// =============================================================================
// jsdom scaffolding (mirrors DateInputTouch.test.tsx)
// =============================================================================

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let environment: Environment;

beforeEach(() => {
  resetThemes();
  resetAdaptationStores();
  Element.prototype.scrollTo = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.open = true;
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
  environment = installEnvironment({width: 1280, pointer: 'fine'});
});

afterEach(() => {
  resetAdaptationStores();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

// =============================================================================
// Reading the resolved surface out of the DOM
// =============================================================================

type Surface = DateInputAdaptationValue;

/**
 * Which of the three trees is mounted.
 *
 * Each surface has one unmistakable mark: the platform control is a real
 * `<input type="date">`, the touch field is the combobox that refuses the
 * keyboard (`inputmode="none"`), and the pointer field is the typable one.
 */
function surfaceIn(root: ParentNode = document): Surface {
  if (root.querySelector('input[type="date"]') != null) {
    return 'native';
  }
  const combobox = root.querySelector('input[role="combobox"]');
  if (combobox == null) {
    throw new Error('No DateInput field is mounted.');
  }
  return combobox.getAttribute('inputmode') === 'none'
    ? 'bottom-sheet'
    : 'popover';
}

/** The same read against server-rendered markup, before any DOM exists. */
function surfaceInMarkup(html: string): Surface {
  if (html.includes('type="date"')) {
    return 'native';
  }
  // React server-renders `inputMode` in its camelCase spelling; the DOM read
  // above sees the lowercased attribute. Matching case-insensitively keeps the
  // two readings of the same mark from drifting apart.
  return /inputmode="none"/i.test(html) ? 'bottom-sheet' : 'popover';
}

function field(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>(
    'input[role="combobox"], input[type="date"]',
  );
  if (input == null) {
    throw new Error('No DateInput field is mounted.');
  }
  return input;
}

const policy = (
  value: ComponentAdaptations<DateInputAdaptationValue>,
): ComponentAdaptations<DateInputAdaptationValue> => value;

function themeWithMd(name: string, md: number) {
  return defineTheme({name, adaptations: {widthBreakpoints: {md}}});
}

function withTheme(theme: ReturnType<typeof defineTheme>) {
  return function Wrapper({children}: {children: ReactNode}) {
    return <Theme theme={theme}>{children}</Theme>;
  };
}

async function focusField(element: HTMLElement): Promise<void> {
  await act(async () => {
    element.focus();
  });
}

async function blurField(element: HTMLElement): Promise<void> {
  await act(async () => {
    element.blur();
  });
}

/** Drop focus wherever it currently is — inside an open sheet, for instance. */
async function blurActiveElement(): Promise<void> {
  await act(async () => {
    (document.activeElement as HTMLElement | null)?.blur();
  });
}

/**
 * jsdom never runs the sheet's exit transition, so a closed BottomSheet stays
 * an open `<dialog>` until the transition is delivered by hand — and that open
 * dialog is one of the two signals the latch waits on.
 */
function finishSheetExit(): void {
  const panel = document.querySelector<HTMLElement>('.astryx-bottom-sheet');
  if (panel != null) {
    fireEvent.transitionEnd(panel, {propertyName: 'transform'});
  }
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.open = false;
  }
}

// =============================================================================
// FR3 — `default` is server truth
// =============================================================================

describe('server rendering', () => {
  it.each([
    ['popover', 'popover'],
    ['bottom-sheet', 'bottom-sheet'],
    ['native', 'native'],
  ] as const)(
    'renders the `%s` default without reading matchMedia',
    (value, expected) => {
      const html = renderToString(
        <DateInput
          label="Event date"
          adaptations={policy({
            default: value,
            rules: [
              {when: {width: {below: 'md'}}, value: 'bottom-sheet'},
              {when: {pointer: 'coarse'}, value: 'native'},
            ],
          })}
        />,
      );

      expect(surfaceInMarkup(html)).toBe(expected);
      expect(environment.policyQueries()).toEqual([]);
    },
  );

  it('leaves the registry empty after a render that never commits', () => {
    renderToString(
      <DateInput
        label="Event date"
        adaptations={policy({
          default: 'popover',
          rules: [{when: {width: {below: 'md'}}, value: 'bottom-sheet'}],
        })}
      />,
    );

    expect(environment.queries()).toEqual([]);
  });

  it('hydrates the server default, then publishes the browser answer', async () => {
    const adaptations = policy({
      default: 'popover',
      rules: [
        {
          when: {width: {below: 'md'}, pointer: 'coarse'},
          value: 'bottom-sheet',
        },
      ],
    });
    const tree = <DateInput label="Event date" adaptations={adaptations} />;
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    document.body.appendChild(container);
    // The client is the phone the rule was written for; the server was not.
    expect(surfaceIn(container)).toBe('popover');
    environment.set({width: 390, pointer: 'coarse'});

    const errors: unknown[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args);
    });
    await act(async () => {
      hydrateRoot(container, tree);
    });
    spy.mockRestore();

    expect(errors).toEqual([]);
    expect(surfaceIn(container)).toBe('bottom-sheet');
    container.remove();
  });
});

// =============================================================================
// FR2/FR4 — exact values, on either pointer
// =============================================================================

describe('exact surfaces', () => {
  const pointers = ['fine', 'coarse'] as const;
  const surfaces: ReadonlyArray<Surface> = [
    'native',
    'popover',
    'bottom-sheet',
  ];

  for (const pointer of pointers) {
    for (const value of surfaces) {
      it(`renders ${value} on a ${pointer} pointer`, () => {
        environment.set({
          pointer,
          width: pointer === 'coarse' ? 390 : 1280,
        });
        render(
          <DateInput
            label="Event date"
            adaptations={policy({default: value, rules: []})}
          />,
        );

        expect(surfaceIn()).toBe(value);
      });
    }
  }

  it('keeps the touch sheet on a mouse when a rule says so', async () => {
    environment.set({width: 1280, pointer: 'fine'});
    render(
      <DateInput
        label="Event date"
        adaptations={policy({
          default: 'popover',
          rules: [{when: {width: {from: 'lg'}}, value: 'bottom-sheet'}],
        })}
      />,
    );

    expect(surfaceIn()).toBe('bottom-sheet');
    fireEvent.click(field());
    await waitFor(() => {
      expect(document.querySelector('dialog')).not.toBeNull();
    });
  });

  it('keeps the anchored popover on a finger when a rule says so', async () => {
    environment.set({width: 390, pointer: 'coarse'});
    render(
      <DateInput
        label="Event date"
        adaptations={policy({
          default: 'popover',
          rules: [{when: {pointer: 'coarse'}, value: 'popover'}],
        })}
      />,
    );

    expect(surfaceIn()).toBe('popover');
    fireEvent.click(
      screen.getByRole('button', {name: /open calendar|calendar/i}),
    );
    await waitFor(() => {
      expect(field().getAttribute('aria-expanded')).toBe('true');
    });
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('follows the environment while the field is idle', () => {
    render(
      <DateInput
        label="Event date"
        adaptations={policy({
          default: 'popover',
          rules: [
            {when: {width: {below: 'md'}}, value: 'bottom-sheet'},
            {when: {width: {below: 'sm'}, pointer: 'coarse'}, value: 'native'},
          ],
        })}
      />,
    );

    expect(surfaceIn()).toBe('popover');
    environment.set({width: 700});
    expect(surfaceIn()).toBe('bottom-sheet');
    environment.set({width: 390, pointer: 'coarse'});
    expect(surfaceIn()).toBe('native');
    environment.set({width: 1280, pointer: 'fine'});
    expect(surfaceIn()).toBe('popover');
  });
});

// =============================================================================
// FR2 — rule order is precedence
// =============================================================================

describe('rule order', () => {
  it('lets the LAST matching rule win, not the most specific', () => {
    render(
      <DateInput
        label="Event date"
        adaptations={policy({
          default: 'popover',
          rules: [
            {
              when: {width: {below: 'md'}, pointer: 'coarse'},
              value: 'bottom-sheet',
            },
            {when: {pointer: 'coarse'}, value: 'native'},
          ],
        })}
      />,
    );
    environment.set({width: 390, pointer: 'coarse'});

    expect(surfaceIn()).toBe('native');
  });

  it('reverses the outcome when the same rules are reordered', () => {
    render(
      <DateInput
        label="Event date"
        adaptations={policy({
          default: 'popover',
          rules: [
            {when: {pointer: 'coarse'}, value: 'native'},
            {
              when: {width: {below: 'md'}, pointer: 'coarse'},
              value: 'bottom-sheet',
            },
          ],
        })}
      />,
    );
    environment.set({width: 390, pointer: 'coarse'});

    expect(surfaceIn()).toBe('bottom-sheet');
  });

  it('resolves an empty rule list to `default` and subscribes to nothing', () => {
    render(
      <DateInput
        label="Event date"
        adaptations={policy({default: 'bottom-sheet', rules: []})}
      />,
    );

    expect(surfaceIn()).toBe('bottom-sheet');
    // No rules, so nothing can change the answer: no shared media connection
    // is opened at all. (The pointer query still on the list belongs to the
    // component's own legacy switch, which every call site runs.)
    expect(getAdaptationStoreCount()).toBe(0);
    expect(environment.queries().some(query => query.includes('width'))).toBe(
      false,
    );
    environment.set({width: 390, pointer: 'coarse'});
    expect(surfaceIn()).toBe('bottom-sheet');
  });
});

// =============================================================================
// FR4/IR4 — the nearest Theme's width points
// =============================================================================

describe('theme width points', () => {
  const belowMd = policy({
    default: 'popover',
    rules: [{when: {width: {below: 'md'}}, value: 'bottom-sheet'}],
  });

  it('anchors at exactly the default md point (768px), and swaps 1px below', () => {
    render(<DateInput label="Event date" adaptations={belowMd} />);

    environment.set({width: 768});
    expect(surfaceIn()).toBe('popover');
    environment.set({width: 767});
    expect(surfaceIn()).toBe('bottom-sheet');
  });

  it("moves that edge with the theme's md", () => {
    render(<DateInput label="Event date" adaptations={belowMd} />, {
      wrapper: withTheme(themeWithMd('wide-md', 900)),
    });

    environment.set({width: 850});
    expect(surfaceIn()).toBe('bottom-sheet');
    environment.set({width: 900});
    expect(surfaceIn()).toBe('popover');
  });

  it('prefers the NEAREST theme when providers nest', () => {
    render(
      <Theme theme={themeWithMd('outer-md', 700)}>
        <Theme theme={themeWithMd('inner-md', 1000)}>
          <DateInput label="Event date" adaptations={belowMd} />
        </Theme>
      </Theme>,
    );

    // 850 is above the outer point and below the inner one, so the two themes
    // disagree and only the inner one's answer is visible.
    environment.set({width: 850});
    expect(surfaceIn()).toBe('bottom-sheet');
    environment.set({width: 1100});
    expect(surfaceIn()).toBe('popover');
  });

  it('compiles a range query rather than a max-width query', () => {
    render(<DateInput label="Event date" adaptations={belowMd} />);

    expect(environment.queries()).toContain('(width < 768px)');
    expect(
      environment.queries().some(query => query.includes('max-width')),
    ).toBe(false);
  });
});

// =============================================================================
// FR6 — the two surface props are exclusive
// =============================================================================

describe('mutual exclusivity with nativePicker', () => {
  it('throws when both props are defined', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <DateInput
          label="Event date"
          nativePicker="always"
          adaptations={policy({default: 'popover', rules: []})}
        />,
      ),
    ).toThrow(/received both `nativePicker` and `adaptations`/);
    spy.mockRestore();
  });

  it('accepts an explicitly undefined `adaptations` beside a nativePicker', () => {
    environment.set({width: 1280, pointer: 'fine'});
    render(
      <DateInput
        label="Event date"
        nativePicker="always"
        adaptations={undefined}
      />,
    );

    expect(surfaceIn()).toBe('native');
  });

  it('accepts an explicitly undefined `nativePicker` beside a policy', () => {
    render(
      <DateInput
        label="Event date"
        nativePicker={undefined}
        adaptations={policy({default: 'bottom-sheet', rules: []})}
      />,
    );

    expect(surfaceIn()).toBe('bottom-sheet');
  });
});

// =============================================================================
// IR3 — invalid policies fail with a path-specific message
// =============================================================================

describe('policy validation', () => {
  function expectRenderToThrow(node: ReactNode, message: RegExp) {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(node)).toThrow(message);
    spy.mockRestore();
  }

  it('rejects a value outside the admitted three', () => {
    expectRenderToThrow(
      <DateInput
        label="Event date"
        adaptations={
          {
            default: 'inline',
            rules: [],
          } as unknown as ComponentAdaptations<DateInputAdaptationValue>
        }
      />,
      /<DateInput adaptations>\.default must be one of native, popover, bottom-sheet; received "inline"\./,
    );
  });

  it('names the offending rule, not just the policy', () => {
    expectRenderToThrow(
      <DateInput
        label="Event date"
        adaptations={
          {
            default: 'popover',
            rules: [
              {when: {pointer: 'coarse'}, value: 'bottom-sheet'},
              {when: {pointer: 'fine'}, value: 'adaptive'},
            ],
          } as unknown as ComponentAdaptations<DateInputAdaptationValue>
        }
      />,
      /<DateInput adaptations>\.rules\[1\]\.value must be one of native, popover, bottom-sheet/,
    );
  });

  it('rejects a missing rule list rather than assuming none', () => {
    expectRenderToThrow(
      <DateInput
        label="Event date"
        adaptations={
          {
            default: 'popover',
          } as unknown as ComponentAdaptations<DateInputAdaptationValue>
        }
      />,
      /<DateInput adaptations>\.rules is required; pass \[\] for no rules\./,
    );
  });

  it('rejects an empty condition', () => {
    expectRenderToThrow(
      <DateInput
        label="Event date"
        adaptations={policy({
          default: 'popover',
          rules: [{when: {}, value: 'native'}],
        })}
      />,
      /<DateInput adaptations>\.rules\[0\]\.when/,
    );
  });

  it.each([null, false, 0, ''])(
    'rejects the falsy non-object %p instead of treating it as no policy',
    falsy => {
      expectRenderToThrow(
        <DateInput
          label="Event date"
          adaptations={
            falsy as unknown as ComponentAdaptations<DateInputAdaptationValue>
          }
        />,
        /<DateInput adaptations>/,
      );
    },
  );

  it('treats an absent policy as no policy at all', () => {
    environment.set({width: 1280, pointer: 'fine'});
    render(<DateInput label="Event date" />);

    expect(surfaceIn()).toBe('popover');
    expect(getAdaptationStoreCount()).toBe(0);
  });
});

// =============================================================================
// IR3 — a `native` value is checked against the props it cannot draw
// =============================================================================

describe('eager native-surface validation', () => {
  function expectRenderToThrow(node: ReactNode, message: RegExp) {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(node)).toThrow(message);
    spy.mockRestore();
  }

  it('rejects numberOfMonths={2} beside a native default', () => {
    expectRenderToThrow(
      <DateInput
        label="Event date"
        numberOfMonths={2}
        adaptations={policy({default: 'native', rules: []})}
      />,
      /<DateInput adaptations>\.default is "native", which cannot honor `numberOfMonths=\{2\}`/,
    );
  });

  it('rejects an explicit weekStartsOn even when it is falsy', () => {
    expectRenderToThrow(
      <DateInput
        label="Event date"
        weekStartsOn={0}
        adaptations={policy({default: 'native', rules: []})}
      />,
      /<DateInput adaptations>\.default is "native", which cannot honor `weekStartsOn=\{0\}`/,
    );
  });

  it('names every conflicting prop at once', () => {
    expectRenderToThrow(
      <DateInput
        label="Event date"
        numberOfMonths={2}
        weekStartsOn="mon"
        adaptations={policy({default: 'native', rules: []})}
      />,
      /`numberOfMonths=\{2\}`.*or.*`weekStartsOn=\{"mon"\}`/s,
    );
  });

  it('rejects a native value in a rule the current viewport cannot match', () => {
    // A wide fine-pointer laptop: the coarse rule is unreachable here, which is
    // exactly why it has to fail here rather than on the phone that selects it.
    environment.set({width: 1280, pointer: 'fine'});
    expectRenderToThrow(
      <DateInput
        label="Event date"
        numberOfMonths={2}
        adaptations={policy({
          default: 'popover',
          rules: [{when: {pointer: 'coarse'}, value: 'native'}],
        })}
      />,
      /<DateInput adaptations>\.rules\[0\]\.value is "native"/,
    );
  });

  it('throws in production too, not only in development', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expectRenderToThrow(
      <DateInput
        label="Event date"
        numberOfMonths={2}
        adaptations={policy({default: 'native', rules: []})}
      />,
      /cannot honor `numberOfMonths=\{2\}`/,
    );
  });

  it('accepts the shapes native mode already has', () => {
    render(
      <DateInput
        label="Event date"
        numberOfMonths={1}
        adaptations={policy({
          default: 'native',
          rules: [{when: {pointer: 'fine'}, value: 'native'}],
        })}
      />,
    );

    expect(surfaceIn()).toBe('native');
  });

  it('keeps min, max and dateConstraints supported on the native surface', () => {
    const noWeekends = vi.fn(
      (date: Date) => date.getDay() !== 0 && date.getDay() !== 6,
    );
    render(
      <DateInput
        label="Event date"
        min="2026-03-01"
        max="2026-03-31"
        dateConstraints={[noWeekends]}
        adaptations={policy({default: 'native', rules: []})}
      />,
    );

    const input = field();
    expect(input.getAttribute('type')).toBe('date');
    expect(input.getAttribute('min')).toBe('2026-03-01');
    expect(input.getAttribute('max')).toBe('2026-03-31');
  });

  it('refuses a constrained date on commit in native mode', async () => {
    const onChange = vi.fn();
    render(
      <DateInput
        label="Event date"
        onChange={onChange}
        min="2026-03-10"
        max="2026-03-20"
        adaptations={policy({default: 'native', rules: []})}
      />,
    );

    const input = field();
    fireEvent.change(input, {target: {value: '2026-03-25'}});
    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalledWith('2026-03-25');
    });

    fireEvent.change(input, {target: {value: '2026-03-15'}});
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('2026-03-15');
    });
  });

  it('leaves the legacy nativePicker path to its own fallback', () => {
    // Same incompatible prop, no policy: the released contract drops what the
    // platform picker cannot draw instead of throwing.
    environment.set({width: 390, pointer: 'coarse'});
    expect(() =>
      render(
        <DateInput
          label="Event date"
          numberOfMonths={2}
          weekStartsOn="mon"
          nativePicker="always"
        />,
      ),
    ).not.toThrow();
    expect(surfaceIn()).toBe('native');
  });
});

// =============================================================================
// FR5 — the resolved surface is latched while the field is in use
// =============================================================================

describe('latching', () => {
  const popoverBelowMd = policy({
    default: 'popover',
    rules: [{when: {width: {below: 'md'}}, value: 'bottom-sheet'}],
  });

  /**
   * A real browser's focus move, in its real order.
   *
   * A user's Tab or click dispatches `focusout` on the old control, DRAINS
   * MICROTASKS, and only then dispatches `focusin` on the new one. Everything
   * that used to defer the release decision — a microtask, a promise callback —
   * therefore ran in the gap, saw focus nowhere, and released the latch mid-
   * interaction. jsdom's own `blur()`/`focus()` pair cannot reproduce that: it
   * runs both inside one task. So the gap is modelled here explicitly, and
   * `inTheGap` is where the assertions that matter live.
   */
  async function moveFocus(
    from: HTMLElement,
    to: HTMLElement | null,
    inTheGap: () => void,
  ): Promise<void> {
    fireEvent.focusOut(from, {relatedTarget: to});
    // Drain microtasks — the whole width of the gap.
    await act(async () => {});
    inTheGap();
    if (to != null) {
      fireEvent.focusIn(to, {relatedTarget: from});
      to.focus();
      await act(async () => {});
    }
  }

  const toggleButton = () => screen.getByRole('button', {name: /calendar/i});

  it('holds from the input to its calendar toggle, across the focusout gap', async () => {
    function Controlled() {
      const [value, setValue] = useState<ISODateString | undefined>();
      return (
        <DateInput
          label="Event date"
          value={value}
          onChange={setValue}
          adaptations={popoverBelowMd}
        />
      );
    }
    render(<Controlled />);
    const input = field();
    await focusField(input);
    // A COMPLETE date, deliberately: blurring the text field commits what was
    // typed, which is the field's own long-standing contract and nothing to do
    // with the latch (a partial "3/2" reverts on blur whatever the policy is
    // doing). What the latch owes this move is that the entry survives it at
    // all, rather than leaving with an unmounted tree.
    fireEvent.change(input, {target: {value: '3/2/2026'}});
    const toggle = toggleButton();

    // The policy now wants the sheet; the field is mid-entry, so it must not
    // get it — not even for the instant between the two focus events.
    environment.set({width: 390, pointer: 'coarse'});

    await moveFocus(input, toggle, () => {
      expect(surfaceIn()).toBe('popover');
      expect(field()).toBe(input);
      expect(input.value).toBe('March 2, 2026');
      // The button the pointer is travelling towards is still the same node:
      // a swap here would unmount it under the cursor and eat the click.
      expect(toggleButton()).toBe(toggle);
    });

    expect(surfaceIn()).toBe('popover');
    expect(field()).toBe(input);
    expect(input.value).toBe('March 2, 2026');

    // And the click that started this actually lands on the surface that was
    // there when the user pressed the pointer down.
    fireEvent.click(toggle);
    await waitFor(() => {
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });
    expect(surfaceIn()).toBe('popover');
  });

  it('holds from the input to its clear button, across the focusout gap', async () => {
    function Controlled() {
      const [value, setValue] = useState<ISODateString | undefined>(
        '2026-03-21' as ISODateString,
      );
      return (
        <DateInput
          label="Event date"
          hasClear
          value={value}
          onChange={setValue}
          adaptations={popoverBelowMd}
        />
      );
    }
    render(<Controlled />);
    const input = field();
    await focusField(input);
    const clear = screen.getByRole('button', {name: /clear/i});
    environment.set({width: 390, pointer: 'coarse'});

    await moveFocus(input, clear, () => {
      expect(surfaceIn()).toBe('popover');
      expect(screen.getByRole('button', {name: /clear/i})).toBe(clear);
    });

    fireEvent.click(clear);
    await waitFor(() => {
      expect(field().value).toBe('');
    });
    // Clearing unmounts the button, which is a focus change of its own; the
    // field still holds the surface because focus came back to it.
    expect(surfaceIn()).toBe('popover');
  });

  it('releases when the focusout names a target outside the field', async () => {
    render(
      <>
        <DateInput label="Event date" adaptations={popoverBelowMd} />
        <button type="button">Elsewhere</button>
      </>,
    );
    const input = field();
    await focusField(input);
    environment.set({width: 390, pointer: 'coarse'});
    const outside = screen.getByRole('button', {name: 'Elsewhere'});

    fireEvent.focusOut(input, {relatedTarget: outside});
    await act(async () => {});

    expect(surfaceIn()).toBe('bottom-sheet');
  });

  it('releases when the focusout names no target at all', async () => {
    render(<DateInput label="Event date" adaptations={popoverBelowMd} />);
    const input = field();
    await focusField(input);
    environment.set({width: 390, pointer: 'coarse'});

    // `relatedTarget` is null when focus leaves for the document, another
    // window, or a target the browser withholds. All of them are "outside".
    fireEvent.focusOut(input, {relatedTarget: null});
    await act(async () => {});

    expect(surfaceIn()).toBe('bottom-sheet');
  });

  it('keeps holding on a null focusout while a surface is still open', async () => {
    render(<DateInput label="Event date" adaptations={popoverBelowMd} />);
    const input = field();
    await focusField(input);
    fireEvent.click(input);
    await waitFor(() => {
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });
    environment.set({width: 390, pointer: 'coarse'});

    // Focus went nowhere the field can name, but the calendar is still open —
    // the surface arm is what keeps an anchored popover, portaled out of this
    // subtree, from being torn out from under itself.
    fireEvent.focusOut(input, {relatedTarget: null});
    await act(async () => {});

    expect(surfaceIn()).toBe('popover');
  });

  it('holds the focused tree across a viewport change, keeping the draft', async () => {
    render(<DateInput label="Event date" adaptations={popoverBelowMd} />);
    const input = field();
    await focusField(input);
    fireEvent.change(input, {target: {value: '3/2'}});
    expect(input.value).toBe('3/2');

    environment.set({width: 390, pointer: 'coarse'});

    // Same node, same uncommitted text, same focus: nothing was remounted.
    expect(surfaceIn()).toBe('popover');
    expect(field()).toBe(input);
    expect(input.value).toBe('3/2');
    expect(document.activeElement).toBe(input);
  });

  it('applies the pending surface once focus leaves', async () => {
    render(<DateInput label="Event date" adaptations={popoverBelowMd} />);
    const input = field();
    await focusField(input);
    environment.set({width: 390, pointer: 'coarse'});
    expect(surfaceIn()).toBe('popover');

    await blurField(input);

    await waitFor(() => {
      expect(surfaceIn()).toBe('bottom-sheet');
    });
  });

  it('does not swap while the anchored calendar is open', async () => {
    render(<DateInput label="Event date" adaptations={popoverBelowMd} />);
    const input = field();
    await focusField(input);
    fireEvent.click(input);
    await waitFor(() => {
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });

    environment.set({width: 390, pointer: 'coarse'});

    expect(surfaceIn()).toBe('popover');
    expect(input.getAttribute('aria-expanded')).toBe('true');
  });

  it('holds while an open surface outlives focus, then releases when it closes', async () => {
    render(
      <>
        <DateInput label="Event date" adaptations={popoverBelowMd} />
        <button type="button">Elsewhere</button>
      </>,
    );
    const input = field();
    await focusField(input);
    fireEvent.click(input);
    await waitFor(() => {
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });
    environment.set({width: 390, pointer: 'coarse'});
    expect(surfaceIn()).toBe('popover');

    // Focus moves to another control with the calendar still open: the
    // surface, not the caret, is what holds the latch now.
    await focusField(screen.getByRole('button', {name: 'Elsewhere'}));
    expect(surfaceIn()).toBe('popover');
    expect(input.getAttribute('aria-expanded')).toBe('true');

    // Closing it is the release signal on its own — focus never comes back,
    // so nothing else would tell the latch the field is done.
    await act(async () => {
      fireEvent.keyDown(input, {key: 'Escape'});
    });
    await waitFor(() => {
      expect(surfaceIn()).toBe('bottom-sheet');
    });
    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'Elsewhere'}),
    );
  });

  it('holds the touch sheet through its own lifecycle', async () => {
    environment.set({width: 390, pointer: 'coarse'});
    render(
      <DateInput
        label="Event date"
        adaptations={policy({
          default: 'popover',
          rules: [{when: {width: {below: 'md'}}, value: 'bottom-sheet'}],
        })}
      />,
    );
    expect(surfaceIn()).toBe('bottom-sheet');
    const input = field();
    await focusField(input);
    fireEvent.click(input);
    await waitFor(() => {
      expect(document.querySelector('dialog')?.hasAttribute('open')).toBe(true);
    });

    // A rotation to a wide viewport mid-pick must not pull the sheet out.
    environment.set({width: 1280, pointer: 'fine'});
    expect(surfaceIn()).toBe('bottom-sheet');
    expect(document.querySelector('dialog')).not.toBeNull();

    await act(async () => {
      fireEvent.keyDown(document.querySelector('dialog')!, {key: 'Escape'});
    });
    // Focus is inside the sheet, which jsdom leaves there: it never runs the
    // exit transition that hands focus back. Dropping focus by hand is the
    // "focus has left, the surface has not" case.
    await blurActiveElement();
    expect(surfaceIn()).toBe('bottom-sheet');

    // Completing the exit is what hands focus back to the field, so the sheet
    // is still the right tree to be in — the release waits for that focus to
    // leave as well.
    await act(async () => {
      finishSheetExit();
    });
    expect(document.activeElement).toBe(field());
    expect(surfaceIn()).toBe('bottom-sheet');

    await blurField(field());
    await waitFor(() => {
      expect(surfaceIn()).toBe('popover');
    });
  });

  it('holds across a theme change that moves the boundary', async () => {
    // 800px sits above the default md point and below the widened one, so the
    // theme swap alone flips which rule matches.
    environment.set({width: 800, pointer: 'fine'});
    function ThemeSwitch() {
      const [md, setMd] = useState(768);
      return (
        <Theme theme={themeWithMd(`md-${md}`, md)}>
          <DateInput label="Event date" adaptations={popoverBelowMd} />
          <button type="button" onClick={() => setMd(1000)}>
            Widen
          </button>
        </Theme>
      );
    }
    render(<ThemeSwitch />);
    expect(surfaceIn()).toBe('popover');
    const input = field();
    await focusField(input);
    fireEvent.change(input, {target: {value: '3/2'}});

    await act(async () => {
      // Clicking does not move focus in jsdom, so the field stays engaged.
      screen.getByRole('button', {name: 'Widen'}).click();
    });

    expect(surfaceIn()).toBe('popover');
    expect(field()).toBe(input);
    expect(input.value).toBe('3/2');

    await blurField(input);
    await waitFor(() => {
      expect(surfaceIn()).toBe('bottom-sheet');
    });
  });

  it('holds across a policy change, then applies it on release', async () => {
    function PolicySwitch() {
      const [value, setValue] = useState<DateInputAdaptationValue>('popover');
      return (
        <>
          <DateInput
            label="Event date"
            adaptations={policy({default: value, rules: []})}
          />
          <button type="button" onClick={() => setValue('native')}>
            Go native
          </button>
        </>
      );
    }
    render(<PolicySwitch />);
    const input = field();
    await focusField(input);
    fireEvent.change(input, {target: {value: '3/2'}});

    await act(async () => {
      screen.getByRole('button', {name: 'Go native'}).click();
    });
    expect(surfaceIn()).toBe('popover');
    expect(input.value).toBe('3/2');

    await blurField(input);
    await waitFor(() => {
      expect(surfaceIn()).toBe('native');
    });
  });

  it('holds the native control while it has focus, and releases on blur', async () => {
    const nativeUntilMd = policy({
      default: 'native',
      rules: [{when: {width: {from: 'md'}}, value: 'popover'}],
    });
    environment.set({width: 390, pointer: 'coarse'});
    render(<DateInput label="Event date" adaptations={nativeUntilMd} />);
    expect(surfaceIn()).toBe('native');

    const input = field();
    await focusField(input);
    environment.set({width: 1280, pointer: 'fine'});
    expect(surfaceIn()).toBe('native');
    expect(document.activeElement).toBe(input);

    await blurField(input);
    await waitFor(() => {
      expect(surfaceIn()).toBe('popover');
    });
  });

  it('swaps immediately when the field was never touched', () => {
    render(<DateInput label="Event date" adaptations={popoverBelowMd} />);

    environment.set({width: 390, pointer: 'coarse'});

    expect(surfaceIn()).toBe('bottom-sheet');
  });

  it('keeps a committed value across a released swap', async () => {
    function Controlled() {
      const [value, setValue] = useState<ISODateString | undefined>(
        '2026-03-21' as ISODateString,
      );
      return (
        <DateInput
          label="Event date"
          value={value}
          onChange={setValue}
          adaptations={popoverBelowMd}
        />
      );
    }
    render(<Controlled />);
    const input = field();
    expect(input.value).toBe('March 21, 2026');

    await focusField(input);
    environment.set({width: 390, pointer: 'coarse'});
    await blurField(input);

    await waitFor(() => {
      expect(surfaceIn()).toBe('bottom-sheet');
    });
    expect(field().value).toBe('March 21, 2026');
  });

  it('still runs the caller’s own focus handlers', async () => {
    const onFocusCapture = vi.fn();
    const onBlurCapture = vi.fn();
    render(
      <DateInput
        label="Event date"
        adaptations={popoverBelowMd}
        onFocusCapture={onFocusCapture}
        onBlurCapture={onBlurCapture}
      />,
    );

    const input = field();
    await focusField(input);
    await blurField(input);

    expect(onFocusCapture).toHaveBeenCalled();
    expect(onBlurCapture).toHaveBeenCalled();
  });
});

// =============================================================================
// Deprecated `nativePicker` compatibility and migration
// =============================================================================

describe('deprecated nativePicker compatibility', () => {
  it.each([
    ['touch', 'fine', 'popover'],
    ['touch', 'coarse', 'native'],
    ['always', 'fine', 'native'],
    ['always', 'coarse', 'native'],
    ['never', 'fine', 'popover'],
    ['never', 'coarse', 'bottom-sheet'],
  ] as const)(
    'nativePicker="%s" on a %s pointer renders %s',
    (nativePicker, pointer, expected) => {
      environment.set({
        pointer,
        width: pointer === 'coarse' ? 390 : 1280,
      });
      render(
        <DateInput
          label="Event date"
          nativePicker={nativePicker as DateInputProps['nativePicker']}
        />,
      );

      expect(surfaceIn()).toBe(expected);
    },
  );

  it.each(['fine', 'coarse'] as const)(
    'matches the documented idle adaptations policy on a %s pointer',
    pointer => {
      environment.set({
        pointer,
        width: pointer === 'coarse' ? 390 : 1280,
      });
      const migrations = [
        [
          'touch',
          policy({
            default: 'popover',
            rules: [{when: {pointer: 'coarse'}, value: 'native'}],
          }),
        ],
        ['always', policy({default: 'native', rules: []})],
        [
          'never',
          policy({
            default: 'popover',
            rules: [{when: {pointer: 'coarse'}, value: 'bottom-sheet'}],
          }),
        ],
      ] as const;

      for (const [nativePicker, adaptations] of migrations) {
        const legacy = render(
          <DateInput label="Event date" nativePicker={nativePicker} />,
        );
        const legacySurface = surfaceIn();
        legacy.unmount();

        const migrated = render(
          <DateInput label="Event date" adaptations={adaptations} />,
        );
        expect(surfaceIn()).toBe(legacySurface);
        migrated.unmount();
      }
    },
  );

  it('asks only the pointer question, never a width one', () => {
    environment.set({width: 390, pointer: 'coarse'});
    render(<DateInput label="Event date" nativePicker="never" />);

    expect(environment.policyQueries()).toEqual(['(pointer: coarse)']);
  });

  it('still follows the pointer with no latch of its own', async () => {
    render(<DateInput label="Event date" nativePicker="never" />);
    const input = field();
    await focusField(input);
    fireEvent.change(input, {target: {value: '3/2'}});

    environment.set({width: 390, pointer: 'coarse'});

    // Legacy behavior is deliberately left as it was: the pointer switch wins
    // mid-interaction, which is the very thing `adaptations` fixes.
    expect(surfaceIn()).toBe('bottom-sheet');
  });
});
