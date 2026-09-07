// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateTimeInputAdaptations.test.tsx
 * @input Uses vitest, @testing-library/react, react-dom/server
 * @output Tests DateTimeInput's public surface policy (spec:AST-031)
 * @position Tests; validates the `adaptations` prop — resolution, eager
 *   validation, latching — and the untouched `nativePicker` path beside it.
 *   Behavior that is not surface selection (typing, the calendar, the sheet's
 *   panels, the native segments' own commit rules) stays in
 *   DateTimeInput.test.tsx, DateTimeInputTouch.test.tsx and
 *   NativePickerSegments.test.tsx.
 *
 * A policy value here is a promise about BOTH halves of the field, so the
 * readings below check the date and the time segment together: `native` means
 * two platform controls, never a native date beside a retained Astryx time.
 * That per-segment fallback is precisely what the legacy `nativePicker` still
 * does, and the last describe block pins it in place unchanged.
 *
 * The environment is a REAL query evaluator rather than a
 * `query === '<literal>'` stub: an exact-boundary rule (`width < md`) can only
 * be told apart from an inclusive one by a stub that computes an answer from an
 * actual viewport width, and a latch test needs listeners that actually fire.
 *
 * SYNC: When DateTimeInput's surface policy changes, update these tests.
 * - /packages/core/src/DateTimeInput/DateTimeInput.tsx
 * - /packages/core/src/DateTimeInput/TouchDateTimeField.tsx
 * - /packages/core/src/hooks/useAdaptationSurfaceLatch.ts
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, act, fireEvent, waitFor} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {hydrateRoot} from 'react-dom/client';
import {useState, type ReactNode} from 'react';
import {DateTimeInput} from './DateTimeInput';
import type {
  DateTimeInputAdaptationValue,
  DateTimeInputProps,
  ISODateTimeString,
} from './DateTimeInput';
import {Theme} from '../theme/Theme';
import {defineTheme} from '../theme/defineTheme';
import {resetThemes} from '../theme/themeRegistry';
import {
  getAdaptationStoreCount,
  resetAdaptationStores,
} from '../theme/useComponentAdaptations';
import type {ComponentAdaptations} from '../theme/componentAdaptations';

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
// jsdom scaffolding (mirrors DateTimeInputTouch.test.tsx)
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

type Surface = DateTimeInputAdaptationValue;

const LABEL = 'Starts';
/** The time half's accessible name is derived from the field label. */
const TIME_LABEL = `${LABEL} time`;

const noop = () => {};

/**
 * Which of the three trees is mounted.
 *
 * Each surface has one unmistakable mark on its date half: the platform control
 * is a real `<input type="date">`, the touch segment is the combobox that
 * refuses the keyboard (`inputmode="none"`), and the pointer field is the
 * typable one. `expectSegments` then proves the time half agrees.
 */
function surfaceIn(root: ParentNode = document): Surface {
  if (root.querySelector('input[type="date"]') != null) {
    return 'native';
  }
  const combobox = root.querySelector('input[role="combobox"]');
  if (combobox == null) {
    throw new Error('No DateTimeInput field is mounted.');
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

/**
 * The input inside one half of the field.
 *
 * Addressed through the segment's stable theme target rather than by role or
 * label, because those differ per surface: the time half is a combobox only in
 * the sheet, and the native halves carry no combobox role at all.
 */
function segmentInput(half: 'date' | 'time'): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>(
    `.astryx-date-time-input-${half}-segment input`,
  );
  if (input == null) {
    throw new Error(`No DateTimeInput ${half} segment is mounted.`);
  }
  return input;
}

const dateField = () => segmentInput('date');
const timeField = () => segmentInput('time');

/**
 * Both halves belong to the surface the policy named.
 *
 * The point of an exact value: `native` is not "native where convenient", and
 * `bottom-sheet` is not "a sheet on the date half". Each surface's two segments
 * are asserted together, so a per-segment fallback leaking into the policy path
 * fails here rather than passing a date-only reading.
 */
function expectSegments(value: Surface): void {
  const date = dateField();
  const time = timeField();
  if (value === 'native') {
    expect(date.type).toBe('date');
    expect(time.type).toBe('time');
    return;
  }
  expect(date.type).toBe('text');
  expect(time.type).toBe('text');
  if (value === 'bottom-sheet') {
    for (const input of [date, time]) {
      expect(input).toHaveAttribute('role', 'combobox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveAttribute('inputmode', 'none');
    }
    return;
  }
  // The anchored surface is the typable one: no read-only segment, and no
  // suppressed on-screen keyboard on either half.
  for (const input of [date, time]) {
    expect(input).not.toHaveAttribute('readonly');
    expect(input).not.toHaveAttribute('inputmode');
  }
}

const policy = (
  value: ComponentAdaptations<DateTimeInputAdaptationValue>,
): ComponentAdaptations<DateTimeInputAdaptationValue> => value;

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
        <DateTimeInput
          label={LABEL}
          onChange={noop}
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

  it('server-renders both halves of the native default, not just the date', () => {
    const html = renderToString(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={policy({default: 'native', rules: []})}
      />,
    );

    expect(html).toContain('type="date"');
    expect(html).toContain('type="time"');
  });

  it('leaves the registry empty after a render that never commits', () => {
    renderToString(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={policy({
          default: 'popover',
          rules: [{when: {width: {below: 'md'}}, value: 'bottom-sheet'}],
        })}
      />,
    );

    expect(environment.queries()).toEqual([]);
    expect(getAdaptationStoreCount()).toBe(0);
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
    const tree = (
      <DateTimeInput label={LABEL} onChange={noop} adaptations={adaptations} />
    );
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
          <DateTimeInput
            label={LABEL}
            onChange={noop}
            adaptations={policy({default: value, rules: []})}
          />,
        );

        expect(surfaceIn()).toBe(value);
        expectSegments(value);
      });
    }
  }

  it('keeps the touch sheet on a mouse when a rule says so', async () => {
    environment.set({width: 1280, pointer: 'fine'});
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={policy({
          default: 'popover',
          rules: [{when: {width: {from: 'lg'}}, value: 'bottom-sheet'}],
        })}
      />,
    );

    expect(surfaceIn()).toBe('bottom-sheet');
    fireEvent.click(dateField());
    await waitFor(() => {
      expect(document.querySelector('dialog')).not.toBeNull();
    });
  });

  it('keeps the anchored popover on a finger when a rule says so', async () => {
    environment.set({width: 390, pointer: 'coarse'});
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
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
      expect(dateField().getAttribute('aria-expanded')).toBe('true');
    });
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('opens the coordinated sheet from the time half too', async () => {
    environment.set({width: 390, pointer: 'coarse'});
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={policy({default: 'bottom-sheet', rules: []})}
      />,
    );

    // Both segments belong to one sheet, so the time half opens the same
    // dialog the date half does — the value picked a whole tree, not a widget.
    expect(timeField()).toBe(screen.getByRole('combobox', {name: TIME_LABEL}));
    fireEvent.click(timeField());
    await waitFor(() => {
      expect(document.querySelector('dialog')).not.toBeNull();
    });
    expect(timeField()).toHaveAttribute('aria-expanded', 'true');
    expect(dateField()).toHaveAttribute('aria-expanded', 'false');
  });

  it('follows the environment while the field is idle', () => {
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
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
      <DateTimeInput
        label={LABEL}
        onChange={noop}
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
      <DateTimeInput
        label={LABEL}
        onChange={noop}
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
      <DateTimeInput
        label={LABEL}
        onChange={noop}
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
    render(
      <DateTimeInput label={LABEL} onChange={noop} adaptations={belowMd} />,
    );

    environment.set({width: 768});
    expect(surfaceIn()).toBe('popover');
    environment.set({width: 767});
    expect(surfaceIn()).toBe('bottom-sheet');
  });

  it("moves that edge with the theme's md", () => {
    // 900 sits between sm (640) and lg (1024): `defineTheme` requires strictly
    // increasing width points, so a moved md has to stay inside its neighbors.
    render(
      <DateTimeInput label={LABEL} onChange={noop} adaptations={belowMd} />,
      {wrapper: withTheme(themeWithMd('wide-md', 900))},
    );

    environment.set({width: 850});
    expect(surfaceIn()).toBe('bottom-sheet');
    environment.set({width: 900});
    expect(surfaceIn()).toBe('popover');
  });

  it('prefers the NEAREST theme when providers nest', () => {
    render(
      <Theme theme={themeWithMd('outer-md', 700)}>
        <Theme theme={themeWithMd('inner-md', 1000)}>
          <DateTimeInput label={LABEL} onChange={noop} adaptations={belowMd} />
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
    render(
      <DateTimeInput label={LABEL} onChange={noop} adaptations={belowMd} />,
    );

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
        <DateTimeInput
          label={LABEL}
          onChange={noop}
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
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        nativePicker="always"
        adaptations={undefined}
      />,
    );

    expect(surfaceIn()).toBe('native');
  });

  it('accepts an explicitly undefined `nativePicker` beside a policy', () => {
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
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
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={
          {
            default: 'inline',
            rules: [],
          } as unknown as ComponentAdaptations<DateTimeInputAdaptationValue>
        }
      />,
      /<DateTimeInput adaptations>\.default must be one of native, popover, bottom-sheet; received "inline"\./,
    );
  });

  it('names the offending rule, not just the policy', () => {
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={
          {
            default: 'popover',
            rules: [
              {when: {pointer: 'coarse'}, value: 'bottom-sheet'},
              {when: {pointer: 'fine'}, value: 'adaptive'},
            ],
          } as unknown as ComponentAdaptations<DateTimeInputAdaptationValue>
        }
      />,
      /<DateTimeInput adaptations>\.rules\[1\]\.value must be one of native, popover, bottom-sheet/,
    );
  });

  it('rejects a missing rule list rather than assuming none', () => {
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={
          {
            default: 'popover',
          } as unknown as ComponentAdaptations<DateTimeInputAdaptationValue>
        }
      />,
      /<DateTimeInput adaptations>\.rules is required; pass \[\] for no rules\./,
    );
  });

  it('rejects an empty condition', () => {
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={policy({
          default: 'popover',
          rules: [{when: {}, value: 'native'}],
        })}
      />,
      /<DateTimeInput adaptations>\.rules\[0\]\.when must contain at least one condition\./,
    );
  });

  it.each([null, false, 0, ''])(
    'rejects the falsy non-object %p instead of treating it as no policy',
    falsy => {
      expectRenderToThrow(
        <DateTimeInput
          label={LABEL}
          onChange={noop}
          adaptations={
            falsy as unknown as ComponentAdaptations<DateTimeInputAdaptationValue>
          }
        />,
        /<DateTimeInput adaptations>/,
      );
    },
  );

  it('treats an absent policy as no policy at all', () => {
    environment.set({width: 1280, pointer: 'fine'});
    render(<DateTimeInput label={LABEL} onChange={noop} />);

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

  const nativeDefault = policy({default: 'native', rules: []});

  it('rejects numberOfMonths={2} beside a native default', () => {
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        numberOfMonths={2}
        adaptations={nativeDefault}
      />,
      /<DateTimeInput adaptations>\.default is "native", which cannot honor `numberOfMonths=\{2\}`/,
    );
  });

  it('rejects an explicit weekStartsOn even when it is falsy', () => {
    // `weekStartsOn={0}` is Sunday, not "unset": presence is what conflicts, so
    // a falsy-but-stated value has to be rejected like any other.
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        weekStartsOn={0}
        adaptations={nativeDefault}
      />,
      /<DateTimeInput adaptations>\.default is "native", which cannot honor `weekStartsOn=\{0\}`/,
    );
  });

  it('rejects hasSeconds beside a native default', () => {
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        hasSeconds
        adaptations={nativeDefault}
      />,
      /<DateTimeInput adaptations>\.default is "native", which cannot honor `hasSeconds=\{true\}`/,
    );
  });

  it('rejects a non-default timeIncrement beside a native default', () => {
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        timeIncrement={15}
        adaptations={nativeDefault}
      />,
      /<DateTimeInput adaptations>\.default is "native", which cannot honor `timeIncrement=\{15\}`/,
    );
  });

  it('rejects any timeOptionInterval beside a native default', () => {
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        timeOptionInterval={30}
        adaptations={nativeDefault}
      />,
      /<DateTimeInput adaptations>\.default is "native", which cannot honor `timeOptionInterval=\{30\}`/,
    );
  });

  it('names every conflicting prop at once', () => {
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        numberOfMonths={2}
        weekStartsOn="mon"
        hasSeconds
        timeIncrement={5}
        timeOptionInterval={15}
        adaptations={nativeDefault}
      />,
      /`numberOfMonths=\{2\}`.*or.*`weekStartsOn=\{"mon"\}`.*or.*`hasSeconds=\{true\}`.*or.*`timeIncrement=\{5\}`.*or.*`timeOptionInterval=\{15\}`/s,
    );
  });

  it('rejects a native value in a rule the current viewport cannot match', () => {
    // A wide fine-pointer laptop: the coarse rule is unreachable here, which is
    // exactly why it has to fail here rather than on the phone that selects it.
    environment.set({width: 1280, pointer: 'fine'});
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        timeOptionInterval={15}
        adaptations={policy({
          default: 'popover',
          rules: [{when: {pointer: 'coarse'}, value: 'native'}],
        })}
      />,
      /<DateTimeInput adaptations>\.rules\[0\]\.value is "native"/,
    );
  });

  it('throws in production too, not only in development', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        hasSeconds
        adaptations={nativeDefault}
      />,
      /cannot honor `hasSeconds=\{true\}`/,
    );
  });

  it('rejects a TRUTHY untyped hasSeconds, matching how the render reads it', () => {
    // `usesNativeTimePicker` is gated on `!hasSeconds`, so an untyped caller's
    // `hasSeconds={1}` retains the Astryx time field. Validating on `=== true`
    // would admit exactly that call under a policy promising two platform
    // controls, and the field would render one of each while claiming
    // "native" — the silent half-native state this rule exists to prevent.
    expectRenderToThrow(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        hasSeconds={1 as unknown as boolean}
        adaptations={policy({default: 'native', rules: []})}
      />,
      /<DateTimeInput adaptations>\.default is "native", which cannot honor `hasSeconds=\{1\}`/,
    );
  });

  it.each([false, undefined, 0, ''])(
    'accepts the falsy hasSeconds %p, which leaves the time half native',
    falsy => {
      render(
        <DateTimeInput
          label={LABEL}
          onChange={noop}
          hasSeconds={falsy as unknown as boolean}
          adaptations={policy({default: 'native', rules: []})}
        />,
      );

      expect(surfaceIn()).toBe('native');
      expectSegments('native');
    },
  );

  it('accepts the shapes native mode already has', () => {
    // Each of these states the shape the platform controls already have, so
    // stating them is agreement, not contradiction.
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        numberOfMonths={1}
        hasSeconds={false}
        timeIncrement={1}
        adaptations={policy({
          default: 'native',
          rules: [{when: {pointer: 'fine'}, value: 'native'}],
        })}
      />,
    );

    expect(surfaceIn()).toBe('native');
    expectSegments('native');
  });

  it('keeps min and max forwarded to both native halves', () => {
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        value={'2026-03-10T10:00' as ISODateTimeString}
        min={'2026-03-10T09:00' as ISODateTimeString}
        max={'2026-03-20T17:00' as ISODateTimeString}
        adaptations={nativeDefault}
      />,
    );

    expect(dateField()).toHaveAttribute('min', '2026-03-10');
    expect(dateField()).toHaveAttribute('max', '2026-03-20');
    // The time bound is the one that applies on the selected day: the value is
    // on the min date, so the earliest allowed time rides the time control.
    expect(timeField()).toHaveAttribute('min', '09:00');
  });

  it('keeps dateConstraints enforced on commit in native mode', async () => {
    const noWeekends = vi.fn(
      (date: Date) => date.getDay() !== 0 && date.getDay() !== 6,
    );
    const onChange = vi.fn();
    render(
      <DateTimeInput
        label={LABEL}
        value={'2026-03-16T14:30' as ISODateTimeString}
        onChange={onChange}
        dateConstraints={[noWeekends]}
        adaptations={nativeDefault}
      />,
    );

    // 2026-03-21 is a Saturday, which the constraint refuses; the platform
    // control cannot grey it out, so the commit is where it is caught.
    fireEvent.change(dateField(), {target: {value: '2026-03-21'}});
    await waitFor(() => {
      expect(dateField()).toHaveAttribute('aria-invalid', 'true');
    });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(dateField(), {target: {value: '2026-03-20'}});
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('2026-03-20T14:30');
    });
  });

  it('leaves the legacy nativePicker path to its own fallback', () => {
    // The same props with no policy: the released contract quietly retains an
    // Astryx time field instead of throwing.
    environment.set({width: 390, pointer: 'coarse'});
    expect(() =>
      render(
        <DateTimeInput
          label={LABEL}
          onChange={noop}
          numberOfMonths={2}
          weekStartsOn="mon"
          hasSeconds
          timeIncrement={5}
          timeOptionInterval={15}
          nativePicker="always"
        />,
      ),
    ).not.toThrow();
    expect(dateField().type).toBe('date');
    expect(timeField().type).toBe('text');
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
   * MICROTASKS, and only then dispatches `focusin` on the new one. A latch that
   * defers its release decision therefore decides inside that gap, sees focus
   * nowhere, and lets go in the middle of the interaction. jsdom's own
   * `blur()`/`focus()` pair runs inside a single task and cannot show it, so
   * the gap is modelled explicitly here and `inTheGap` holds the assertions
   * that matter. This field has two halves, which makes the move an ordinary
   * one: crossing from the date segment to the time segment is not leaving.
   */
  async function moveFocus(
    from: HTMLElement,
    to: HTMLElement | null,
    inTheGap: () => void,
  ): Promise<void> {
    fireEvent.focusOut(from, {relatedTarget: to});
    await act(async () => {});
    inTheGap();
    if (to != null) {
      fireEvent.focusIn(to, {relatedTarget: from});
      to.focus();
      await act(async () => {});
    }
  }

  it('holds from the date half to the time half, across the focusout gap', async () => {
    function Controlled() {
      const [value, setValue] = useState<ISODateTimeString | undefined>();
      return (
        <DateTimeInput
          label={LABEL}
          value={value}
          onChange={setValue}
          adaptations={popoverBelowMd}
        />
      );
    }
    render(<Controlled />);
    const date = dateField();
    await focusField(date);
    // A complete date: blurring commits what was typed, which is the field's
    // own contract. What the latch owes the move is that the entry survives it.
    fireEvent.change(date, {target: {value: '3/2/2026'}});
    const time = timeField();

    // The policy now wants the coordinated sheet, whose halves are different
    // controls in a different tree. Crossing between the two segments must not
    // hand the user that tree mid-entry.
    environment.set({width: 390, pointer: 'coarse'});

    await moveFocus(date, time, () => {
      expect(surfaceIn()).toBe('popover');
      expect(dateField()).toBe(date);
      expect(timeField()).toBe(time);
      expect(date.value).toBe('March 2, 2026');
    });

    expect(surfaceIn()).toBe('popover');
    expect(dateField()).toBe(date);
    expect(document.activeElement).toBe(time);

    // The time half is still the typable one it was, so the entry the user
    // crossed over to make actually reaches it.
    fireEvent.change(time, {target: {value: '2:30 PM'}});
    expect(time.value).toBe('2:30 PM');
    expect(surfaceIn()).toBe('popover');
  });

  it('releases when the focusout names a target outside the field', async () => {
    render(
      <>
        <DateTimeInput
          label={LABEL}
          onChange={noop}
          adaptations={popoverBelowMd}
        />
        <button type="button">Elsewhere</button>
      </>,
    );
    const date = dateField();
    await focusField(date);
    environment.set({width: 390, pointer: 'coarse'});

    fireEvent.focusOut(date, {
      relatedTarget: screen.getByRole('button', {name: 'Elsewhere'}),
    });
    await act(async () => {});

    expect(surfaceIn()).toBe('bottom-sheet');
  });

  it('releases when the focusout names no target at all', async () => {
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={popoverBelowMd}
      />,
    );
    const date = dateField();
    await focusField(date);
    environment.set({width: 390, pointer: 'coarse'});

    // `relatedTarget` is null when focus leaves for the document, another
    // window, or a target the browser withholds. All of them are "outside".
    fireEvent.focusOut(date, {relatedTarget: null});
    await act(async () => {});

    expect(surfaceIn()).toBe('bottom-sheet');
  });

  it('keeps holding on a null focusout while the calendar is still open', async () => {
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={popoverBelowMd}
      />,
    );
    const date = dateField();
    await focusField(date);
    fireEvent.click(date);
    await waitFor(() => {
      expect(date.getAttribute('aria-expanded')).toBe('true');
    });
    environment.set({width: 390, pointer: 'coarse'});

    // This field's calendar is PORTALED out of the row, so focus moving into it
    // names a target the field does not contain — the open surface is the only
    // thing that can say the interaction is still the field's.
    fireEvent.focusOut(date, {relatedTarget: null});
    await act(async () => {});

    expect(surfaceIn()).toBe('popover');
    expect(date.getAttribute('aria-expanded')).toBe('true');
  });

  it('holds the focused tree across a viewport change, keeping the draft', async () => {
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={popoverBelowMd}
      />,
    );
    const input = dateField();
    await focusField(input);
    fireEvent.change(input, {target: {value: 'Feb'}});
    expect(input.value).toBe('Feb');

    environment.set({width: 390, pointer: 'coarse'});

    // Same node, same uncommitted text, same focus: nothing was remounted.
    expect(surfaceIn()).toBe('popover');
    expect(dateField()).toBe(input);
    expect(input.value).toBe('Feb');
    expect(document.activeElement).toBe(input);
  });

  it('applies the pending surface once focus leaves', async () => {
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={popoverBelowMd}
      />,
    );
    const input = dateField();
    await focusField(input);
    environment.set({width: 390, pointer: 'coarse'});
    expect(surfaceIn()).toBe('popover');

    await blurField(input);

    await waitFor(() => {
      expect(surfaceIn()).toBe('bottom-sheet');
    });
  });

  it('keeps holding while focus moves from the date half to the time half', async () => {
    // The two halves are one field, so the blur that hands focus across them is
    // not focus leaving — the deferred re-check is what tells those apart.
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={popoverBelowMd}
      />,
    );
    const date = dateField();
    await focusField(date);
    environment.set({width: 390, pointer: 'coarse'});
    expect(surfaceIn()).toBe('popover');

    const time = timeField();
    await focusField(time);
    expect(surfaceIn()).toBe('popover');
    expect(document.activeElement).toBe(time);
    expect(dateField()).toBe(date);

    await blurField(time);
    await waitFor(() => {
      expect(surfaceIn()).toBe('bottom-sheet');
    });
  });

  it('does not swap while the anchored calendar is open', async () => {
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={popoverBelowMd}
      />,
    );
    const input = dateField();
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
        <DateTimeInput
          label={LABEL}
          onChange={noop}
          adaptations={popoverBelowMd}
        />
        <button type="button">Elsewhere</button>
      </>,
    );
    const input = dateField();
    await focusField(input);
    fireEvent.click(input);
    await waitFor(() => {
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });
    environment.set({width: 390, pointer: 'coarse'});
    expect(surfaceIn()).toBe('popover');

    // Focus moves to another control with the calendar still open: the
    // surface, not the caret, is what holds the latch now. The calendar is a
    // sibling of the row, so focus never bubbles back through the field.
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
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={popoverBelowMd}
      />,
    );
    expect(surfaceIn()).toBe('bottom-sheet');
    const input = dateField();
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

    // Completing the exit is what hands focus back to the segment, so the
    // sheet is still the right tree to be in — the release waits for that
    // focus to leave as well.
    await act(async () => {
      finishSheetExit();
    });
    expect(document.activeElement).toBe(dateField());
    expect(surfaceIn()).toBe('bottom-sheet');

    await blurField(dateField());
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
          <DateTimeInput
            label={LABEL}
            onChange={noop}
            adaptations={popoverBelowMd}
          />
          <button type="button" onClick={() => setMd(1000)}>
            Widen
          </button>
        </Theme>
      );
    }
    render(<ThemeSwitch />);
    expect(surfaceIn()).toBe('popover');
    const input = dateField();
    await focusField(input);
    fireEvent.change(input, {target: {value: 'Feb'}});

    await act(async () => {
      // Clicking does not move focus in jsdom, so the field stays engaged.
      screen.getByRole('button', {name: 'Widen'}).click();
    });

    expect(surfaceIn()).toBe('popover');
    expect(dateField()).toBe(input);
    expect(input.value).toBe('Feb');

    await blurField(input);
    await waitFor(() => {
      expect(surfaceIn()).toBe('bottom-sheet');
    });
  });

  it('holds across a policy change, then applies it on release', async () => {
    function PolicySwitch() {
      const [value, setValue] =
        useState<DateTimeInputAdaptationValue>('popover');
      return (
        <>
          <DateTimeInput
            label={LABEL}
            onChange={noop}
            adaptations={policy({default: value, rules: []})}
          />
          <button type="button" onClick={() => setValue('native')}>
            Go native
          </button>
        </>
      );
    }
    render(<PolicySwitch />);
    const input = dateField();
    await focusField(input);
    fireEvent.change(input, {target: {value: 'Feb'}});

    await act(async () => {
      screen.getByRole('button', {name: 'Go native'}).click();
    });
    expect(surfaceIn()).toBe('popover');
    expect(input.value).toBe('Feb');

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
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={nativeUntilMd}
      />,
    );
    expect(surfaceIn()).toBe('native');

    // The OS picker draws outside the page and reflects no disclosure state, so
    // focus is the only signal holding the latch for this surface.
    const input = dateField();
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
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={popoverBelowMd}
      />,
    );

    environment.set({width: 390, pointer: 'coarse'});

    expect(surfaceIn()).toBe('bottom-sheet');
  });

  it('keeps a committed value across a released swap', async () => {
    function Controlled() {
      const [value, setValue] = useState<ISODateTimeString | undefined>(
        '2026-03-21T14:30' as ISODateTimeString,
      );
      return (
        <DateTimeInput
          label={LABEL}
          value={value}
          onChange={setValue}
          adaptations={popoverBelowMd}
        />
      );
    }
    render(<Controlled />);
    expect(dateField().value).toBe('March 21, 2026');
    expect(timeField().value).toBe('2:30 PM');

    const input = dateField();
    await focusField(input);
    environment.set({width: 390, pointer: 'coarse'});
    await blurField(input);

    await waitFor(() => {
      expect(surfaceIn()).toBe('bottom-sheet');
    });
    // Both halves survive the swap: the value lives above the surface.
    expect(dateField().value).toBe('March 21, 2026');
    expect(timeField().value).toBe('2:30 PM');
  });

  it('still runs the caller’s own focus handlers', async () => {
    const onFocusCapture = vi.fn();
    const onBlurCapture = vi.fn();
    render(
      <DateTimeInput
        label={LABEL}
        onChange={noop}
        adaptations={popoverBelowMd}
        onFocusCapture={onFocusCapture}
        onBlurCapture={onBlurCapture}
      />,
    );

    const input = dateField();
    await focusField(input);
    await blurField(input);

    expect(onFocusCapture).toHaveBeenCalled();
    expect(onBlurCapture).toHaveBeenCalled();
  });
});

// =============================================================================
// The released `nativePicker` contract, unchanged beside the new one
// =============================================================================

describe('legacy nativePicker parity', () => {
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
        <DateTimeInput
          label={LABEL}
          onChange={noop}
          nativePicker={nativePicker as DateTimeInputProps['nativePicker']}
        />,
      );

      expect(surfaceIn()).toBe(expected);
      expectSegments(expected);
    },
  );

  it('asks only the pointer question, never a width one', () => {
    environment.set({width: 390, pointer: 'coarse'});
    render(
      <DateTimeInput label={LABEL} onChange={noop} nativePicker="never" />,
    );

    expect(environment.policyQueries()).toEqual(['(pointer: coarse)']);
  });

  it('still follows the pointer with no latch of its own', async () => {
    render(
      <DateTimeInput label={LABEL} onChange={noop} nativePicker="never" />,
    );
    const input = dateField();
    await focusField(input);
    fireEvent.change(input, {target: {value: 'Feb'}});

    environment.set({width: 390, pointer: 'coarse'});

    // Legacy behavior is deliberately left as it was: the pointer switch wins
    // mid-interaction, which is the very thing `adaptations` fixes.
    expect(surfaceIn()).toBe('bottom-sheet');
  });
});
