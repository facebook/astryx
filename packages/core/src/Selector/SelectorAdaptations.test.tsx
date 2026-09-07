// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SelectorAdaptations.test.tsx
 * @input Uses vitest, @testing-library/react, react-dom/server
 * @output Tests Selector's public presentation policy (spec:AST-031)
 * @position Tests; validates the `adaptations` prop, the `presentation`
 *   shorthand it subsumes, and the isolation between Selector and
 *   MultiSelector. Behavior that is not policy resolution — geometry,
 *   selection, search, read-only — stays in Selector.test.tsx.
 *
 * The environment here is a REAL query evaluator rather than a
 * `query === '<literal>'` stub: the boundary this migration changes is
 * `width < md` versus `max-width: md`, and only a stub that computes an answer
 * from an actual viewport width can tell those two apart at 768px.
 *
 * SYNC: When Selector's presentation policy changes, update these tests.
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, act, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToString} from 'react-dom/server';
import {hydrateRoot} from 'react-dom/client';
import {createElement, type ReactNode} from 'react';
import {Selector} from './Selector';
import type {SelectorAdaptationValue} from './Selector';
import type {ResolvedAdaptivePresentation} from '../hooks/useAdaptivePresentation';
import {MultiSelector} from '../MultiSelector';
import {Theme} from '../theme/Theme';
import {defineTheme} from '../theme/defineTheme';
import {resetThemes} from '../theme/themeRegistry';
import {resetAdaptationStores} from '../theme/useComponentAdaptations';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';
import {__resetInteractionModalityForTest} from '../utils/interactionModality';

const OPTIONS = ['Apple', 'Banana', 'Cherry'];

/** The one policy `presentation="adaptive"` is shorthand for. */
const ADAPTIVE_POLICY = {
  default: 'popover',
  rules: [
    {when: {width: {below: 'md'}, pointer: 'coarse'}, value: 'bottom-sheet'},
  ],
} as const;

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
   * Only the queries an AST-031 or legacy adaptive policy can produce.
   *
   * Unrelated hooks in the tree ask about `prefers-reduced-motion` and hover,
   * so "subscribed to nothing" has to mean "asked nothing about the viewport",
   * not "called matchMedia zero times".
   */
  presentationQueries: () => string[];
  /** Move the viewport and notify listeners, as a resize does. */
  set: (next: Partial<Viewport>) => void;
}

/**
 * Evaluate one media query against a viewport.
 *
 * Understands exactly the two grammars in play: AST-031's compiled range
 * syntax (`(width < 768px)`, `(width >= 1024px)`) and the legacy shared hook's
 * `(max-width: 768px)`. Anything else — `(hover: hover)`, `(prefers-*)` — is
 * reported as not matching rather than throwing, so an unrelated hook asking
 * about the environment does not fail the test that owns this stub.
 */
function evaluate(query: string, viewport: Viewport): boolean {
  return query.split(' and ').every(rawPart => {
    const part = rawPart.trim();
    const range = /^\(width (<|<=|>|>=) (\d+)px\)$/.exec(part);
    if (range) {
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
    const maxWidth = /^\(max-width: (\d+)px\)$/.exec(part);
    if (maxWidth) {
      return viewport.width <= Number(maxWidth[1]);
    }
    const minWidth = /^\(min-width: (\d+)px\)$/.exec(part);
    if (minWidth) {
      return viewport.width >= Number(minWidth[1]);
    }
    const pointer = /^\(pointer: (coarse|fine)\)$/.exec(part);
    if (pointer) {
      return pointer[1] === viewport.pointer;
    }
    return false;
  });
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
    presentationQueries: () =>
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
// jsdom surface stubs (mirrors Selector.test.tsx)
// =============================================================================

beforeEach(() => {
  __resetLiveRegionsForTest();
  __resetInteractionModalityForTest();
  resetThemes();
  resetAdaptationStores();
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    return originalMatches.call(this, selector);
  };
  installEnvironment({width: 1280, pointer: 'fine'});
});

afterEach(() => {
  __resetLiveRegionsForTest();
  resetAdaptationStores();
  vi.unstubAllGlobals();
});

/**
 * Which surface the closed trigger advertises.
 *
 * `aria-haspopup` is the resolved value made observable without opening
 * anything: `listbox` for the anchored popover, `dialog` for the modal sheet
 * (component:Selector AR1). Reading it keeps every resolution assertion a
 * single synchronous render.
 */
function advertisedSurface(label = 'Fruit'): string | null {
  // Exact name match: 'Fruit' and 'Fruits' are both on screen in the
  // Selector/MultiSelector isolation cases.
  return screen
    .getByRole('combobox', {name: label})
    .getAttribute('aria-haspopup');
}

function themeWithMd(name: string, md: number) {
  return defineTheme({name, adaptations: {widthBreakpoints: {md}}});
}

/**
 * jsdom never runs the sheet's exit transition, so BottomSheet's final-focus
 * handoff — the signal Selector waits for before releasing the latched value —
 * has to be delivered by hand. Mirrors Selector.test.tsx's read-only close.
 */
function finishSheetExit(dialog: HTMLElement): void {
  const panel = dialog.querySelector<HTMLElement>('.astryx-bottom-sheet');
  expect(panel).not.toBeNull();
  fireEvent.transitionEnd(panel!, {propertyName: 'transform'});
}

/** jsdom keeps popover content out of the accessibility tree. */
const hidden = {hidden: true} as const;

// =============================================================================
// Injected-CSS inspection (mirrors Field/InputClearButton.test.tsx)
// =============================================================================

interface InjectedRule {
  selector: string;
  text: string;
  media: string | null;
}

/**
 * Every style rule StyleX injected at runtime, flattened out of its at-rule
 * wrapper and tagged with that wrapper's condition — so a
 * `@media (pointer: coarse)` declaration stays distinguishable from the
 * unconditional one. jsdom resolves neither media queries nor pseudo-element
 * boxes, so this is where a pointer-gated floor is checkable at unit level.
 */
function injectedRules(): InjectedRule[] {
  const walk = (rules: CSSRuleList, condition: string | null): InjectedRule[] =>
    [...rules].flatMap((rule): InjectedRule[] => {
      const {selectorText} = rule as CSSStyleRule;
      if (typeof selectorText === 'string') {
        return [{selector: selectorText, text: rule.cssText, media: condition}];
      }
      const nested = (rule as CSSGroupingRule).cssRules;
      if (nested == null) {
        return [];
      }
      const own = (rule as CSSMediaRule).media?.mediaText;
      return walk(nested, own != null && own !== '' ? own : condition);
    });

  return [...document.styleSheets].flatMap(sheet => walk(sheet.cssRules, null));
}

/** Declaration lookup scoped to the classes actually on one element. */
function declarationsFor(element: Element) {
  const classes = element.className.split(' ').filter(Boolean);
  const rules = injectedRules().filter(({selector}) =>
    classes.some(name => selector.includes(`.${name}`)),
  );
  // Guards every assertion against passing silently if StyleX's runtime
  // injection or the class plumbing changes shape.
  expect(rules.length).toBeGreaterThan(0);
  return (pattern: RegExp, inMedia?: string) =>
    rules.some(
      ({text, media}) =>
        pattern.test(text) &&
        (inMedia == null ? media == null : (media ?? '').includes(inMedia)),
    );
}

function withTheme(theme: ReturnType<typeof defineTheme>) {
  return function Wrapper({children}: {children: ReactNode}) {
    return <Theme theme={theme}>{children}</Theme>;
  };
}

// =============================================================================
// FR3 — default is server truth
// =============================================================================

describe('server rendering', () => {
  it('renders `default` and never reads matchMedia', () => {
    // A viewport the rule matches: if the server consulted it, the markup
    // would carry the sheet's semantics instead of the default's.
    installEnvironment({width: 375, pointer: 'coarse'});

    const html = renderToString(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).not.toContain('aria-haspopup="dialog"');
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it('renders a `bottom-sheet` default as the sheet trigger', () => {
    installEnvironment({width: 1600, pointer: 'fine'});

    const html = renderToString(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={{
          default: 'bottom-sheet',
          rules: [{when: {width: {from: 'lg'}}, value: 'popover'}],
        }}
      />,
    );

    expect(html).toContain('aria-haspopup="dialog"');
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it('does not read matchMedia for the legacy shorthand either', () => {
    installEnvironment({width: 375, pointer: 'coarse'});

    const html = renderToString(
      <Selector label="Fruit" options={OPTIONS} presentation="adaptive" />,
    );

    expect(html).toContain('aria-haspopup="listbox"');
    expect(matchMedia).not.toHaveBeenCalled();
  });
});

// =============================================================================
// FR3/FR4 — client resolution
// =============================================================================

describe('client resolution', () => {
  it('publishes the matching rule after hydration', () => {
    installEnvironment({width: 375, pointer: 'coarse'});
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    expect(advertisedSurface()).toBe('dialog');
  });

  it('falls back to `default` when no rule matches', () => {
    installEnvironment({width: 375, pointer: 'fine'});
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    // Narrow, but a fine pointer: the ANDed condition does not match.
    expect(advertisedSurface()).toBe('listbox');
  });

  it('opens the resolved bottom sheet, with modal dialog semantics', async () => {
    installEnvironment({width: 375, pointer: 'coarse'});
    const user = userEvent.setup();
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    await user.click(screen.getByRole('combobox'));

    expect(
      await screen.findByRole('dialog', {name: 'Fruit'}),
    ).toBeInTheDocument();
    expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
  });

  it('opens the resolved popover, anchored', async () => {
    const user = userEvent.setup();
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    await user.click(screen.getByRole('combobox'));

    expect(HTMLElement.prototype.showPopover).toHaveBeenCalledOnce();
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it('follows the environment while closed', () => {
    const environment = installEnvironment({width: 1280, pointer: 'fine'});
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );
    expect(advertisedSurface()).toBe('listbox');

    environment.set({width: 375, pointer: 'coarse'});

    expect(advertisedSurface()).toBe('dialog');
  });
});

// =============================================================================
// FR4 — rule order is precedence
// =============================================================================

describe('rule order', () => {
  it('lets the LAST matching rule win, not the most specific', () => {
    installEnvironment({width: 375, pointer: 'coarse'});
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={{
          default: 'bottom-sheet',
          rules: [
            // Narrower condition first — it still loses to the later match.
            {
              when: {width: {below: 'md'}, pointer: 'coarse'},
              value: 'bottom-sheet',
            },
            {when: {width: {below: 'md'}}, value: 'popover'},
          ],
        }}
      />,
    );

    expect(advertisedSurface()).toBe('listbox');
  });

  it('reverses the outcome when the same rules are reordered', () => {
    installEnvironment({width: 375, pointer: 'coarse'});
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={{
          default: 'bottom-sheet',
          rules: [
            {when: {width: {below: 'md'}}, value: 'popover'},
            {
              when: {width: {below: 'md'}, pointer: 'coarse'},
              value: 'bottom-sheet',
            },
          ],
        }}
      />,
    );

    expect(advertisedSurface()).toBe('dialog');
  });

  it('resolves an empty rule list to `default` and subscribes to nothing', () => {
    const environment = installEnvironment({width: 375, pointer: 'coarse'});
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={{default: 'bottom-sheet', rules: []}}
      />,
    );

    expect(advertisedSurface()).toBe('dialog');
    expect(environment.presentationQueries()).toEqual([]);
  });
});

// =============================================================================
// FR5 — width points come from the nearest Theme
// =============================================================================

describe('theme width points', () => {
  it('uses the AST-012 defaults without a theme', () => {
    installEnvironment({width: 700, pointer: 'coarse'});
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    expect(advertisedSurface()).toBe('dialog');
  });

  it("follows the theme's `md` override", () => {
    installEnvironment({width: 850, pointer: 'coarse'});
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
      {wrapper: withTheme(themeWithMd('selector-adaptations-wide-md', 900))},
    );

    // 850 is above the default md (768) but below this theme's 900.
    expect(advertisedSurface()).toBe('dialog');
  });

  it('prefers the NEAREST theme when providers nest', () => {
    installEnvironment({width: 850, pointer: 'coarse'});
    const outer = themeWithMd('selector-adaptations-outer', 900);
    const inner = themeWithMd('selector-adaptations-inner', 800);

    render(
      <Theme theme={outer}>
        <Selector
          label="Outer"
          options={OPTIONS}
          adaptations={ADAPTIVE_POLICY}
        />
        <Theme theme={inner}>
          <Selector
            label="Inner"
            options={OPTIONS}
            adaptations={ADAPTIVE_POLICY}
          />
        </Theme>
      </Theme>,
    );

    // One viewport, two answers: 850 < 900 but 850 >= 800.
    expect(advertisedSurface('Outer')).toBe('dialog');
    expect(advertisedSurface('Inner')).toBe('listbox');
  });

  it('moves the shorthand boundary with the theme too', () => {
    installEnvironment({width: 850, pointer: 'coarse'});
    render(
      <Selector label="Fruit" options={OPTIONS} presentation="adaptive" />,
      {
        wrapper: withTheme(themeWithMd('selector-adaptations-shorthand', 900)),
      },
    );

    expect(advertisedSurface()).toBe('dialog');
  });
});

// =============================================================================
// FR7/DEC-6 — the exclusive `below` edge
// =============================================================================

describe('the exact md boundary', () => {
  it('anchors at exactly the default md point (768px)', () => {
    installEnvironment({width: 768, pointer: 'coarse'});
    render(
      <Selector label="Fruit" options={OPTIONS} presentation="adaptive" />,
    );

    // `below` is exclusive. The legacy `max-width: 768px` query included this
    // width; this single pixel is the reviewed breaking change (AST-031 DEC-6).
    expect(advertisedSurface()).toBe('listbox');
  });

  it('presents a sheet one pixel below it (767px)', () => {
    installEnvironment({width: 767, pointer: 'coarse'});
    render(
      <Selector label="Fruit" options={OPTIONS} presentation="adaptive" />,
    );

    expect(advertisedSurface()).toBe('dialog');
  });

  it("moves that edge with the theme's md", () => {
    installEnvironment({width: 768, pointer: 'coarse'});
    render(
      <Selector label="Fruit" options={OPTIONS} presentation="adaptive" />,
      {wrapper: withTheme(themeWithMd('selector-adaptations-edge', 769))},
    );

    // Restoring the old inclusive behavior at 768 is a global theme change,
    // not a per-callsite one — exactly what FR7 says the migration costs.
    expect(advertisedSurface()).toBe('dialog');
  });

  it('compiles the range query rather than a max-width query', () => {
    const environment = installEnvironment({width: 767, pointer: 'coarse'});
    render(
      <Selector label="Fruit" options={OPTIONS} presentation="adaptive" />,
    );

    expect(environment.presentationQueries()).toEqual([
      '(width < 768px) and (pointer: coarse)',
    ]);
  });
});

// =============================================================================
// FR7/DEC-5 — the legacy shorthand
// =============================================================================

describe('presentation shorthand', () => {
  it('defaults to an anchored popover and reads no media query', () => {
    const environment = installEnvironment({width: 375, pointer: 'coarse'});
    render(<Selector label="Fruit" options={OPTIONS} />);

    expect(advertisedSurface()).toBe('listbox');
    expect(environment.presentationQueries()).toEqual([]);
  });

  it('keeps `bottom-sheet` constant on a wide fine-pointer viewport', () => {
    const environment = installEnvironment({width: 1600, pointer: 'fine'});
    render(
      <Selector label="Fruit" options={OPTIONS} presentation="bottom-sheet" />,
    );

    expect(advertisedSurface()).toBe('dialog');
    expect(environment.presentationQueries()).toEqual([]);
  });

  it('keeps `popover` constant on a compact touch viewport', () => {
    installEnvironment({width: 375, pointer: 'coarse'});
    render(<Selector label="Fruit" options={OPTIONS} presentation="popover" />);

    expect(advertisedSurface()).toBe('listbox');
  });

  it('resolves `adaptive` exactly as the equivalent explicit policy', () => {
    installEnvironment({width: 375, pointer: 'coarse'});
    const {unmount} = render(
      <Selector label="Fruit" options={OPTIONS} presentation="adaptive" />,
    );
    const shorthand = advertisedSurface();
    unmount();

    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    expect(shorthand).toBe('dialog');
    expect(advertisedSurface()).toBe(shorthand);
  });
});

// =============================================================================
// FR6 — one policy per call site
// =============================================================================

describe('mutual exclusivity', () => {
  it('throws when both props are defined', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() =>
      render(
        // @ts-expect-error -- the two props are exclusive at type level too
        <Selector
          label="Fruit"
          options={OPTIONS}
          presentation="adaptive"
          adaptations={ADAPTIVE_POLICY}
        />,
      ),
    ).toThrow(/both `presentation` and `adaptations`/);

    consoleError.mockRestore();
  });

  it('accepts an explicitly undefined counterpart', () => {
    installEnvironment({width: 375, pointer: 'coarse'});
    const spread = {presentation: undefined};

    expect(() =>
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          {...spread}
          adaptations={ADAPTIVE_POLICY}
        />,
      ),
    ).not.toThrow();
    expect(advertisedSurface()).toBe('dialog');
  });

  it('accepts an explicitly undefined `adaptations` beside a presentation', () => {
    const spread = {adaptations: undefined};

    expect(() =>
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          {...spread}
          presentation="bottom-sheet"
        />,
      ),
    ).not.toThrow();
    expect(advertisedSurface()).toBe('dialog');
  });

  it('rejects an unadmitted value with a path-specific message', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() =>
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          adaptations={{
            default: 'popover',
            // @ts-expect-error -- 'native' is DateInput's domain, not Selector's
            rules: [{when: {pointer: 'coarse'}, value: 'native'}],
          }}
        />,
      ),
    ).toThrow('<Selector adaptations>.rules[0].value');

    consoleError.mockRestore();
  });

  it('rejects an empty condition with a path-specific message', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() =>
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          adaptations={{
            default: 'popover',
            rules: [{when: {}, value: 'bottom-sheet'}],
          }}
        />,
      ),
    ).toThrow('<Selector adaptations>.rules[0].when');

    consoleError.mockRestore();
  });
});

// =============================================================================
// The `presentation` value is validated, not trusted
// =============================================================================

describe('presentation validation', () => {
  /**
   * TypeScript covers a typed caller, so every case here is one that reaches
   * the component anyway: JavaScript, an untyped props bag, a value read from
   * config, or a stale `presentation="modal"` left behind by a rename. Each
   * one used to index the policy map to `undefined` and resolve to an anchored
   * popover — the wrong surface, reported as a correct one.
   */
  function renderWithPresentation(presentation: unknown) {
    const props = {presentation} as {presentation?: never};
    return render(<Selector label="Fruit" options={OPTIONS} {...props} />);
  }

  const rejected: ReadonlyArray<[string, unknown]> = [
    ['an unknown string', 'modal'],
    ['a stale renamed value', 'sheet'],
    ['a value differing only in case', 'Popover'],
    ['a non-string', 3],
    ['null', null],
    // `in` would find these on Object.prototype and hand back a function or a
    // prototype object as though it were a policy.
    ['a prototype key', 'toString'],
    ['the constructor key', 'constructor'],
  ];

  it.each(rejected)(
    'rejects %s with a path-specific message',
    (_label, value) => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => renderWithPresentation(value)).toThrow(
        /<Selector presentation> must be one of popover, bottom-sheet, adaptive/,
      );

      consoleError.mockRestore();
    },
  );

  it('names the value it received', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => renderWithPresentation('modal')).toThrow(/received "modal"/);

    consoleError.mockRestore();
  });

  it('accepts every admitted value, and an absent one', () => {
    for (const presentation of [
      undefined,
      'popover',
      'bottom-sheet',
      'adaptive',
    ] as const) {
      const {unmount} = render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          presentation={presentation}
        />,
      );
      unmount();
    }
  });

  it('does not reject an unknown value that never reaches the prop', () => {
    // An `adaptations` policy with no `presentation` must not be dragged into
    // the shorthand's validation path.
    expect(() =>
      render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          adaptations={{default: 'bottom-sheet', rules: []}}
        />,
      ),
    ).not.toThrow();
  });
});

describe('type-level contract', () => {
  it('keeps the public value union identical to the internal one', () => {
    // `SelectorAdaptationValue` is spelled as literals so consumer
    // diagnostics never name an unexported type. This is what keeps that
    // spelling honest: if the shared adaptive hook's resolved union ever
    // gains or loses a member, these assignments stop compiling.
    type Exact<A, B> = [A] extends [B]
      ? [B] extends [A]
        ? true
        : never
      : never;
    const publicCoversInternal: Exact<
      SelectorAdaptationValue,
      ResolvedAdaptivePresentation
    > = true;
    // And the controller still accepts what the public type produces.
    const passedToController: ResolvedAdaptivePresentation =
      'bottom-sheet' satisfies SelectorAdaptationValue;

    expect(publicCoversInternal).toBe(true);
    expect(passedToController).toBe('bottom-sheet');
  });

  it('keeps the hasClear union usable with either spelling', () => {
    // Not an assertion about runtime — this block exists so `tsc` checks that
    // adding the exclusive policy pair did not multiply the value contract.
    // Both arms of `hasClear` must still compose with both spellings.
    const clearableWithAdaptations = (
      <Selector
        label="Fruit"
        options={OPTIONS}
        hasClear
        value={null}
        onChange={(next: string | null) => next}
        adaptations={ADAPTIVE_POLICY}
      />
    );
    const clearableWithPresentation = (
      <Selector
        label="Fruit"
        options={OPTIONS}
        hasClear
        value={null}
        onChange={(next: string | null) => next}
        presentation="adaptive"
      />
    );
    const plainWithAdaptations = (
      <Selector
        label="Fruit"
        options={OPTIONS}
        value="Apple"
        onChange={(next: string) => next}
        adaptations={ADAPTIVE_POLICY}
      />
    );

    expect(clearableWithAdaptations).toBeTruthy();
    expect(clearableWithPresentation).toBeTruthy();
    expect(plainWithAdaptations).toBeTruthy();
  });

  it('rejects `adaptive` and unknown values inside a policy', () => {
    const bad = (
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={{
          // @ts-expect-error -- 'adaptive' is shorthand, never a resolved value
          default: 'adaptive',
          rules: [],
        }}
      />
    );
    const worse = (
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={{
          default: 'popover',
          // @ts-expect-error -- contrast is CSS-owned, not a component axis
          rules: [{when: {contrast: 'more'}, value: 'bottom-sheet'}],
        }}
      />
    );

    expect(bad).toBeTruthy();
    expect(worse).toBeTruthy();
  });
});

// =============================================================================
// Newly reachable combinations: coarse + popover, fine + bottom sheet
// =============================================================================

describe('coarse pointer with an anchored popover', () => {
  /**
   * Before this policy existed, a coarse pointer under `adaptive` below 768px
   * always got the sheet. A caller can now hold the popover there — at 768px
   * exactly, by policy, or with `presentation="popover"` — so the popover's
   * touch affordances have to hold on a coarse pointer.
   *
   * They are CSS media rules, not JavaScript: they key off the POINTER, and
   * nothing in the presentation policy can reach them. That independence is
   * the invariant these assert.
   *
   * Measured in Chromium against the built Storybook, one touch context
   * (`hasTouch`/`isMobile`, so `(pointer: coarse)` really matches) versus a
   * desktop one, with the anchored popover open in both:
   *
   *   coarse: trigger font-size 16px, clear-button hit area 24x24, option
   *           rows 32px, surface = anchored popover
   *   fine:   trigger font-size 14px, clear-button hit area 20x20, option
   *           rows 32px
   *
   * So both pointer-gated floors hold with the popover resolved. Option rows
   * carry no coarse-pointer floor at all — 32px on either pointer — but that
   * is presentation-independent and pre-existing: the same rows measure 32px
   * inside the bottom sheet, on both pointers. Choosing the popover on a
   * coarse pointer takes nothing away that the sheet was providing.
   */
  beforeEach(() => {
    installEnvironment({width: 375, pointer: 'coarse'});
  });

  function renderCoarsePopover() {
    return render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        value="Apple"
        hasClear
        onChange={() => {}}
        adaptations={{default: 'popover', rules: []}}
      />,
    );
  }

  it('styles its trigger identically whichever surface the policy picks', () => {
    // The structural half of the claim: on ONE coarse-pointer environment, the
    // trigger's class set must not depend on the resolved surface. Every
    // pointer-gated rule that reaches the sheet's trigger therefore reaches the
    // popover's, including the ones jsdom cannot evaluate.
    const triggerClasses = (policy: 'popover' | 'bottom-sheet') => {
      const {unmount} = render(
        <Selector
          label="Fruit"
          options={OPTIONS}
          adaptations={{default: policy, rules: []}}
        />,
      );
      const element = screen
        .getByRole('combobox')
        .closest('.astryx-selector') as HTMLElement;
      const classes = element.className.split(' ').filter(Boolean).sort();
      unmount();
      return classes;
    };

    expect(triggerClasses('popover')).toEqual(triggerClasses('bottom-sheet'));
  });

  it('keeps a coarse-pointer rule attached to the trigger', () => {
    renderCoarsePopover();
    const trigger = screen
      .getByRole('combobox')
      .closest('.astryx-selector') as HTMLElement;
    expect(trigger).not.toBeNull();

    const classes = trigger.className.split(' ').filter(Boolean);
    const coarseRules = injectedRules().filter(
      ({selector, media}) =>
        (media ?? '').includes('pointer: coarse') &&
        classes.some(name => selector.includes(`.${name}`)),
    );

    // That block is where the trigger's `max(1rem, …)` text floor lives — the
    // rule that keeps mobile Safari from zooming on focus and never zooming
    // back. Its VALUE is unassertable here: jsdom's CSS parser drops a
    // `max()` containing a var(), so the rule arrives with an empty body (the
    // clear button's floors below survive only because custom properties skip
    // that parser). What is checkable is that the coarse block still attaches
    // to this trigger when the policy resolved to a popover.
    expect(coarseRules.length).toBeGreaterThan(0);
  });

  it('keeps the clear button at the 24px coarse hit area (WCAG 2.5.8 AA)', () => {
    renderCoarsePopover();
    const clear = screen.getByRole('button', {name: /clear/i});

    const declares = declarationsFor(clear);
    // Same floors InputClearButton.test.tsx owns, asserted here because the
    // combination that reaches them — coarse pointer, anchored surface — is
    // what this change made reachable.
    expect(
      declares(/--_input-clear-hit-inset\s*:\s*-2px/, 'pointer: coarse'),
    ).toBe(true);
    expect(
      declares(/--_input-clear-hit-content\s*:\s*""/, 'pointer: coarse'),
    ).toBe(true);
  });

  it('resolves to the popover and stays operable by touch and by keyboard', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        onChange={onChange}
        adaptations={{default: 'popover', rules: []}}
      />,
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');

    await user.click(trigger);
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalledOnce();
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();

    // The anchored listbox is reachable and selectable, not merely mounted.
    await user.click(screen.getByRole('option', {name: 'Cherry', ...hidden}));
    expect(onChange).toHaveBeenCalledWith('Cherry');
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

describe('fine pointer with a modal bottom sheet', () => {
  /**
   * The mirror combination. Reaching it is not new — `presentation="bottom-sheet"`
   * has always rendered the modal sheet on any pointer — so what these cover is
   * the keyboard contract on that surface, which a policy can now select and
   * which had thin coverage: a sheet is a modal dialog, and entry, movement,
   * dismissal, and restoration are AR2's promise.
   *
   * jsdom stubs `showModal` and never runs the exit transition, so these
   * assert against a simulation. The real-browser half is the
   * `KeyboardBottomSheetPolicy` story, run in Chromium by the story play
   * guard.
   */
  const SHEET_ON_FINE = {
    default: 'bottom-sheet',
    rules: [{when: {pointer: 'fine'}, value: 'bottom-sheet'}],
  } as const;

  beforeEach(() => {
    installEnvironment({width: 1440, pointer: 'fine'});
  });

  it('opens the sheet from the keyboard and moves focus into the listbox', async () => {
    const user = userEvent.setup();
    render(
      <Selector label="Fruit" options={OPTIONS} adaptations={SHEET_ON_FINE} />,
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    trigger.focus();
    await user.keyboard('{Enter}');

    await screen.findByRole('dialog', {name: 'Fruit'});
    await waitFor(() => expect(screen.getByRole('listbox')).toHaveFocus());
  });

  it('selects with the keyboard and restores focus to the trigger', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        onChange={onChange}
        adaptations={SHEET_ON_FINE}
      />,
    );

    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', {name: 'Fruit'});
    await waitFor(() => expect(screen.getByRole('listbox')).toHaveFocus());

    // The listbox opens with the first option highlighted, so one ArrowDown
    // moves to the second.
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledWith('Banana');
    await waitFor(() => expect(dialog).toHaveAttribute('inert'));
    finishSheetExit(dialog);
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('dismisses on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <Selector label="Fruit" options={OPTIONS} adaptations={SHEET_ON_FINE} />,
    );

    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', {name: 'Fruit'});
    await waitFor(() => expect(screen.getByRole('listbox')).toHaveFocus());

    await user.keyboard('{Escape}');

    await waitFor(() => expect(dialog).toHaveAttribute('inert'));
    finishSheetExit(dialog);
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the sheet reachable through the search control', async () => {
    const user = userEvent.setup();
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        hasSearch
        adaptations={SHEET_ON_FINE}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Fruit'}));
    await screen.findByRole('dialog', {name: 'Fruit'});

    // With search, the sheet owns the combobox and focus lands on it.
    await waitFor(() =>
      expect(screen.getByRole('combobox', hidden)).toHaveFocus(),
    );
  });
});

// =============================================================================
// Known limitation: SSR + `adaptive` + `isDefaultOpen`
// =============================================================================

describe('server-rendered default-open', () => {
  /**
   * A CHARACTERIZATION test, not an endorsement. `isDefaultOpen` opens from a
   * mount effect, which runs with the hydration render's resolved value — the
   * server one, by FR3 — while the post-hydration render has already published
   * the browser's. Under `adaptive` on a compact touch client the two disagree
   * and the field comes up collapsed.
   *
   * This predates AST-031: the released `useAdaptivePresentation` returns its
   * `serverDefault` during hydration for exactly the same reason, and the
   * MultiSelector case below — still on that untouched hook — reproduces it.
   * Fixing it means changing when the default-open effect fires, which is
   * `isDefaultOpen`'s contract and not this migration's to move.
   *
   * The workaround is a policy whose server and client values already agree.
   */
  /**
   * Hydrated roots live outside Testing Library's cleanup, so each one is
   * tracked and torn down: a container left in `document.body` makes every
   * later `getByRole('combobox')` ambiguous.
   */
  const mounted: {
    container: HTMLElement;
    root: ReturnType<typeof hydrateRoot>;
  }[] = [];

  afterEach(() => {
    for (const {container, root} of mounted.splice(0)) {
      act(() => root.unmount());
      container.remove();
    }
  });

  function hydrate(element: React.ReactElement): HTMLElement {
    const container = document.createElement('div');
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);
    act(() => {
      mounted.push({container, root: hydrateRoot(container, element)});
    });
    return container;
  }

  const triggerIn = (container: HTMLElement) =>
    container.querySelector('[role="combobox"]');

  it('comes up collapsed for hydrated `adaptive` on a compact touch client', () => {
    installEnvironment({width: 375, pointer: 'coarse'});

    const container = hydrate(
      createElement(Selector, {
        label: 'Fruit',
        options: OPTIONS,
        presentation: 'adaptive',
        isDefaultOpen: true,
      }),
    );

    // Documented, not desired: the resolved value is the sheet, but the
    // default-open effect already ran against the server's popover.
    expect(triggerIn(container)).toHaveAttribute('aria-haspopup', 'dialog');
    expect(triggerIn(container)).toHaveAttribute('aria-expanded', 'false');
  });

  it('reproduces identically on MultiSelector, which never migrated', () => {
    installEnvironment({width: 375, pointer: 'coarse'});

    const container = hydrate(
      createElement(MultiSelector, {
        label: 'Fruits',
        options: OPTIONS,
        value: [],
        onChange: () => {},
        presentation: 'adaptive',
        isDefaultOpen: true,
      }),
    );

    // The control that makes "pre-existing" a measurement rather than a claim:
    // MultiSelector still runs the legacy adaptive hook.
    expect(triggerIn(container)).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens correctly with a policy whose server value already agrees', () => {
    installEnvironment({width: 375, pointer: 'coarse'});

    const container = hydrate(
      createElement(Selector, {
        label: 'Fruit',
        options: OPTIONS,
        adaptations: {default: 'bottom-sheet', rules: []},
        isDefaultOpen: true,
      }),
    );

    // The documented workaround: no value changes between server and client,
    // so the mount effect and the render agree.
    expect(triggerIn(container)).toHaveAttribute('aria-haspopup', 'dialog');
    expect(triggerIn(container)).toHaveAttribute('aria-expanded', 'true');
  });

  it('is not a defect of default-open itself: a constant popover hydrates open', () => {
    installEnvironment({width: 375, pointer: 'coarse'});

    const container = hydrate(
      createElement(Selector, {
        label: 'Fruit',
        options: OPTIONS,
        presentation: 'popover',
        isDefaultOpen: true,
      }),
    );

    expect(triggerIn(container)).toHaveAttribute('aria-expanded', 'true');
  });
});

// =============================================================================
// FR10 — an open surface does not switch trees
// =============================================================================

describe('latching', () => {
  it('keeps an open sheet mounted when the environment stops matching', async () => {
    const environment = installEnvironment({width: 375, pointer: 'coarse'});
    const user = userEvent.setup();
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const dialog = await screen.findByRole('dialog', {name: 'Fruit'});

    environment.set({width: 1280, pointer: 'fine'});

    expect(dialog).toBeInTheDocument();
    expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
    expect(advertisedSurface()).toBe('dialog');
  });

  it('returns focus to the trigger and adopts the new value on reopen', async () => {
    const environment = installEnvironment({width: 375, pointer: 'coarse'});
    const user = userEvent.setup();
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', {name: 'Fruit'});

    environment.set({width: 1280, pointer: 'fine'});
    await user.keyboard('{Escape}');
    await waitFor(() => expect(dialog).toHaveAttribute('inert'));
    finishSheetExit(dialog);

    await waitFor(() => expect(trigger).toHaveFocus());
    await waitFor(() => expect(advertisedSurface()).toBe('listbox'));

    await user.click(trigger);
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalledOnce();
  });
});

// =============================================================================
// AR1/AR2 — accessibility follows the resolved surface
// =============================================================================

describe('accessibility', () => {
  it('moves focus into the sheet listbox and restores it on close', async () => {
    installEnvironment({width: 375, pointer: 'coarse'});
    const user = userEvent.setup();
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', {name: 'Fruit'});

    await waitFor(() => expect(screen.getByRole('listbox')).toHaveFocus());

    await user.keyboard('{Escape}');
    await waitFor(() => expect(dialog).toHaveAttribute('inert'));
    finishSheetExit(dialog);
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps combobox semantics at the trigger for a resolved popover', async () => {
    const user = userEvent.setup();
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', hidden)).toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('selects a value from the resolved sheet and closes it', async () => {
    installEnvironment({width: 375, pointer: 'coarse'});
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Selector
        label="Fruit"
        options={OPTIONS}
        onChange={onChange}
        adaptations={ADAPTIVE_POLICY}
      />,
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', {name: 'Fruit'});

    await user.click(screen.getByRole('option', {name: 'Banana'}));

    expect(onChange).toHaveBeenCalledWith('Banana');
    await waitFor(() => expect(dialog).toHaveAttribute('inert'));
    finishSheetExit(dialog);
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

// =============================================================================
// IR5 — Selector's migration does not move MultiSelector
// =============================================================================

describe('MultiSelector isolation', () => {
  it('disagrees with Selector at exactly 768px, deliberately', () => {
    installEnvironment({width: 768, pointer: 'coarse'});

    render(
      <>
        <Selector label="Fruit" options={OPTIONS} presentation="adaptive" />
        <MultiSelector
          label="Fruits"
          options={OPTIONS}
          value={[]}
          onChange={() => {}}
          presentation="adaptive"
        />
      </>,
    );

    // Selector resolves `width < md`; MultiSelector keeps the released
    // `max-width: 768px`, which includes equality. AST-031 accepts the split
    // until MultiSelector is separately migrated.
    expect(advertisedSurface('Fruit')).toBe('listbox');
    expect(advertisedSurface('Fruits')).toBe('dialog');
  });

  it('agrees below the boundary', () => {
    installEnvironment({width: 500, pointer: 'coarse'});

    render(
      <>
        <Selector label="Fruit" options={OPTIONS} presentation="adaptive" />
        <MultiSelector
          label="Fruits"
          options={OPTIONS}
          value={[]}
          onChange={() => {}}
          presentation="adaptive"
        />
      </>,
    );

    expect(advertisedSurface('Fruit')).toBe('dialog');
    expect(advertisedSurface('Fruits')).toBe('dialog');
  });

  it('leaves MultiSelector on the legacy query string', () => {
    const environment = installEnvironment({width: 500, pointer: 'coarse'});

    render(
      <MultiSelector
        label="Fruits"
        options={OPTIONS}
        value={[]}
        onChange={() => {}}
        presentation="adaptive"
      />,
    );

    expect(environment.presentationQueries()).toEqual([
      '(max-width: 768px) and (pointer: coarse)',
    ]);
  });

  it('ignores a Theme md override, as the released hook does', () => {
    installEnvironment({width: 850, pointer: 'coarse'});

    render(
      <MultiSelector
        label="Fruits"
        options={OPTIONS}
        value={[]}
        onChange={() => {}}
        presentation="adaptive"
      />,
      {wrapper: withTheme(themeWithMd('multi-selector-untouched-md', 900))},
    );

    // A theme point that moves Selector must not move MultiSelector.
    expect(advertisedSurface('Fruits')).toBe('listbox');
  });
});
