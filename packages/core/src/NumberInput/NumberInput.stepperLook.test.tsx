// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInput.stepperLook.test.tsx
 * @input vitest (jsdom), React Testing Library, NumberInput with steppers,
 *   UIStepper's shape in motion/uikit/stepper.ts, and the raw CSS the StyleX
 *   runtime injects (recorded before jsdom parses it)
 * @output Checks the steppers' touch presentation: under a finger (a coarse
 *   pointer, iOS and Android alike) they sit beside the field as one 94 px
 *   wide capsule at the field size's element height (the field gives up that
 *   width and a gap), − at the inline start and + at the inline end (mirrored
 *   in a right-to-left page), a divider 4 px from the top and the bottom,
 *   transparent halves over the theme's neutral fill, UIKit's glyphs in place
 *   of the chevrons, with no iOS gate; with a mouse, inside an InputGroup and
 *   in a narrow field the column is unchanged; the width is measured through
 *   the shared resize observer; and the values NumberInput spells out match
 *   stepper.ts
 * @position Testing; validates NumberInput.tsx's touch presentation styles.
 *   jsdom's CSS parser drops media blocks, so the declarations are read from
 *   the rules StyleX hands to `insertRule`; real engines are covered by
 *   __tests__/NumberInputStepperLook.interaction.browser.spec.ts
 */

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {render, screen} from '@testing-library/react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import type {NumberInput as NumberInputComponent} from './NumberInput';
import type {InputGroup as InputGroupComponent} from '../InputGroup';
import {stepper} from '../motion/uikit/stepper';
import {TOUCH_QUERY} from '../utils/touchPresentation';

/** Every rule StyleX inserted, as the raw text it handed to `insertRule`. */
const rawRules: string[] = [];
let NumberInput: typeof NumberInputComponent;
let InputGroup: typeof InputGroupComponent;

beforeAll(async () => {
  const insertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (
    this: CSSStyleSheet,
    rule: string,
    index?: number,
  ) {
    rawRules.push(rule);
    return insertRule.call(this, rule, index);
  };
  // StyleX injects when the styles are created: load NumberInput after the
  // recorder is in place.
  ({NumberInput} = await import('./NumberInput'));
  ({InputGroup} = await import('../InputGroup'));
});

/**
 * The declarations `el`'s own classes make, by property, outside any media
 * block (`media` omitted) or inside `@media <media>`; `pseudo` reads a
 * pseudo-element's rules. StyleX minifies values: they are compared without
 * whitespace.
 */
function declared(
  el: Element,
  {at = [], pseudo = ''}: {at?: ReadonlyArray<string>; pseudo?: string} = {},
): Map<string, string> {
  const out = new Map<string, string>();
  for (const className of Array.from(el.classList)) {
    // Inside a media block StyleX repeats the class for specificity.
    const selector = new RegExp(
      `^\\.${className}(?:\\.${className})*(?::not\\(#\\\\#\\))*${pseudo.replace(/:/g, ':')}\\{([^}]*)\\}$`,
    );
    for (const rule of rawRules) {
      // The rule's at-rule blocks, outermost first, must be exactly `at`.
      const prefix = at.map(prelude => `${prelude}{`).join('');
      if (!rule.startsWith(prefix)) {
        continue;
      }
      const body = rule.slice(prefix.length, rule.length - at.length);
      if (body.startsWith('@')) {
        continue;
      }
      const match = selector.exec(body);
      if (match == null) {
        continue;
      }
      for (const declaration of match[1].split(';')) {
        const colon = declaration.indexOf(':');
        if (colon > 0) {
          out.set(
            declaration.slice(0, colon).trim(),
            declaration.slice(colon + 1).replace(/\s+/g, ''),
          );
        }
      }
    }
  }
  return out;
}

function renderSteppers(
  inGroup = false,
  width?: number,
  size?: 'sm' | 'md' | 'lg',
) {
  const field = (
    <NumberInput
      label="Quantity"
      value={5}
      onChange={() => {}}
      hasNumberSteppers
      width={width}
      size={size}
    />
  );
  render(inGroup ? <InputGroup label="Order">{field}</InputGroup> : field);
  const increment = screen.getByRole('button', {name: 'Increment Quantity'});
  const decrement = screen.getByRole('button', {name: 'Decrement Quantity'});
  const column = increment.parentElement as HTMLElement;
  const wrapper = column.parentElement as HTMLElement;
  // The Field box: the nearest ancestor that also holds the label.
  let fieldBox: HTMLElement | null = wrapper;
  while (fieldBox != null && fieldBox.querySelector('label') == null) {
    fieldBox = fieldBox.parentElement;
  }
  return {increment, decrement, column, wrapper, fieldBox};
}

// The touch key as the StyleX runtime writes it: a coarse primary pointer
// (the resolver's TOUCH_QUERY), with no iOS gate around it.
const TOUCH = [`@media ${TOUCH_QUERY}`];
// The iOS gate, in either nesting, which the control must not use.
const IOS_SUPPORTS = '@supports (-webkit-touch-callout: none)';

describe('NumberInput steppers under a finger, on iOS and Android alike', () => {
  it('sit beside the field as one 94 px wide capsule, centred on it', () => {
    const {column, wrapper, fieldBox} = renderSteppers();
    const touch = declared(column, {at: TOUCH});
    expect(touch.get('position')).toBe('absolute');
    expect(touch.get('inset-inline-start')).toBe(
      'calc(100%+var(--border-width)+var(--spacing-2))',
    );
    // StyleX writes block-axis logical properties as their physical ones.
    // Centred at any height: pinned top and bottom, auto margins.
    expect(touch.get('top')).toBe('0');
    expect(touch.get('bottom')).toBe('0');
    expect(touch.get('width')).toBe('94px');
    for (const corner of [
      'border-start-start-radius',
      'border-start-end-radius',
      'border-end-start-radius',
      'border-end-end-radius',
    ]) {
      // A capsule at any height: the browser clamps it to half the height.
      expect(touch.get(corner), corner).toBe('9999px');
    }
    expect(touch.get('background-color')).toBe('var(--color-neutral)');
    expect(touch.get('border-inline-start-width')).toBe('0');
    expect(touch.get('margin-top')).toBe('auto');
    expect(touch.get('margin-bottom')).toBe('auto');
    // The Field box gives up the capsule's width and a gap, so the input box
    // and an attached status under it end at the same edge; the input box
    // takes its own end padding back.
    expect(
      declared(fieldBox as HTMLElement, {at: TOUCH}).get('padding-inline-end'),
    ).toBe('calc(94px+var(--spacing-2))');
    const box = declared(wrapper, {at: TOUCH});
    expect(box.has('margin-inline-end')).toBe(false);
    expect(box.get('padding-inline-end')).toContain(
      '--astryx-number-input-padding-inline-end',
    );
  });

  it('keep the column in a Field box too narrow for the control', () => {
    // A quantity field sized to 96 px (the checkout-wizard template) cannot
    // hold the control (94 px and a gap) beside a usable box.
    const {column, wrapper, increment, fieldBox} = renderSteppers(false, 96);
    // The column keeps its place and shape: under a finger it declares nothing
    // of its own (no touch-target growth).
    expect(declared(column, {at: TOUCH})).toEqual(new Map());
    expect(declared(wrapper, {at: TOUCH})).toEqual(new Map());
    expect(declared(fieldBox as HTMLElement, {at: TOUCH})).toEqual(new Map());
    expect(declared(increment, {at: TOUCH, pseudo: '::before'})).toEqual(
      new Map(),
    );
  });

  it('measure a field through the shared resize observer, not one of its own', () => {
    // One ResizeObserver per document (utils/sharedResizeObserver.ts), however
    // many stepper fields measure their width under a finger.
    let constructed = 0;
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query === TOUCH_QUERY,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor() {
          constructed += 1;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    try {
      render(
        <>
          <NumberInput
            label="One"
            value={1}
            onChange={() => {}}
            hasNumberSteppers
            width="50%"
          />
          <NumberInput
            label="Two"
            value={2}
            onChange={() => {}}
            hasNumberSteppers
            width="50%"
          />
        </>,
      );
      expect(constructed).toBeLessThanOrEqual(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it.each([
    ['sm', '--size-element-sm'],
    ['md', '--size-element-md'],
    ['lg', '--size-element-lg'],
  ] as const)(
    "take the %s size's element height (the component-size rules)",
    (size, token) => {
      const {column} = renderSteppers(false, undefined, size);
      expect(declared(column, {at: TOUCH}).get('height')).toBe(`var(${token})`);
    },
  );

  it("round each half's outer corners at its inline side, with no right-to-left override", () => {
    const {increment, decrement} = renderSteppers();
    const plus = declared(increment, {at: TOUCH});
    const minus = declared(decrement, {at: TOUCH});
    // + is at the inline end, − at the inline start, in either direction.
    expect(plus.get('border-start-end-radius')).toBe('9999px');
    expect(plus.get('border-end-end-radius')).toBe('9999px');
    expect(plus.get('border-start-start-radius')).toBe('0');
    expect(minus.get('border-start-start-radius')).toBe('9999px');
    expect(minus.get('border-end-start-radius')).toBe('9999px');
    expect(minus.get('border-end-end-radius')).toBe('0');
    expect(
      rawRules.some(
        rule => rule.includes('[dir="rtl"]') && rule.includes('radius'),
      ),
    ).toBe(false);
  });

  it("keep the glyphs, the divider and the capsule's edge under forced colors", () => {
    // Forced colors repaint backgrounds as Canvas: the glyphs and the divider,
    // drawn as backgrounds, opt out and take system colours, and the capsule
    // keeps an outline for its edge.
    const FORCED = ['@media (forced-colors: active)'];
    const {column, increment} = renderSteppers();
    const divider = declared(column, {at: FORCED, pseudo: '::after'});
    expect(divider.get('background-color')).toBe('CanvasText');
    expect(divider.get('forced-color-adjust')).toBe('none');
    const glyph = declared(increment, {at: FORCED, pseudo: '::before'});
    expect(glyph.get('background-color')).toBe('CanvasText');
    expect(glyph.get('forced-color-adjust')).toBe('none');
    const edge = declared(column, {at: [...TOUCH, ...FORCED]});
    expect(edge.get('outline-style')).toBe('solid');
    expect(edge.get('outline-color')).toBe('CanvasText');
  });

  it('draw a half at its bound in GrayText under forced colors', () => {
    render(
      <NumberInput
        label="Quantity"
        value={5}
        max={5}
        onChange={() => {}}
        hasNumberSteppers
      />,
    );
    const increment = screen.getByRole('button', {name: 'Increment Quantity'});
    const glyph = declared(increment, {
      at: ['@media (forced-colors: active)'],
      pseudo: '::before',
    });
    expect(glyph.get('background-color')).toBe('GrayText');
  });

  it('show the control in a Field box wide enough for it', () => {
    const {column} = renderSteppers(false, 200);
    expect(declared(column, {at: TOUCH}).get('position')).toBe('absolute');
  });

  it('put − at the inline start and + at the inline end, mirrored in a right-to-left page (design:bidirectionality DR3)', () => {
    const {column} = renderSteppers();
    expect(declared(column, {at: TOUCH}).get('flex-direction')).toBe(
      'row-reverse',
    );
    // No right-to-left override: the reversed row follows the direction.
    const rtl = rawRules.find(
      rule =>
        rule.startsWith(TOUCH.map(prelude => `${prelude}{`).join('')) &&
        rule.includes('[dir="rtl"]') &&
        rule.includes('flex-direction'),
    );
    expect(rtl).toBeUndefined();
    // The increment button is first in the DOM, so a reversed row puts it
    // at the inline end.
    expect(column.firstElementChild?.getAttribute('aria-label')).toBe(
      'Increment Quantity',
    );
  });

  it('draw a 1 px divider 4px from the top and the bottom, at every height', () => {
    const {column} = renderSteppers();
    const divider = declared(column, {at: TOUCH, pseudo: '::after'});
    expect(divider.get('content')).toBe('""');
    const shape = declared(column, {pseudo: '::after'});
    expect(shape.get('width')).toBe('1px');
    expect(shape.has('height')).toBe(false);
    expect(shape.get('top')).toBe('4px');
    expect(shape.get('bottom')).toBe('4px');
    expect(shape.get('inset-inline-start')).toBe('calc(50%-.5px)');
    expect(shape.get('background-color')).toBe('var(--color-track)');
  });

  it('paint each half transparent over the capsule, glyphs in the primary icon colour', () => {
    const {increment, decrement} = renderSteppers();
    for (const half of [increment, decrement]) {
      const touch = declared(half, {at: TOUCH});
      expect(touch.get('background-color')).toBe('transparent');
      expect(touch.get('color')).toBe('var(--color-icon-primary)');
    }
    expect(declared(decrement, {at: TOUCH}).get('border-top-width')).toBe('0');
  });

  it('draw UIKit’s − and + glyphs in place of the chevrons, as decoration', () => {
    // Each half's glyph is its own pseudo-element (the half's label names it):
    // UIKit's 13pt vector glyph as a mask over the half's glyph colour.
    const {increment, decrement} = renderSteppers();
    const chevron = increment.children[0];
    expect(declared(chevron, {at: TOUCH}).get('display')).toBe('none');
    // Elsewhere the icon keeps its own display.
    expect(declared(chevron).get('display')).toBe('inline-flex');
    // One element per half: the icon; no second glyph element.
    expect(increment.children).toHaveLength(1);
    expect(decrement.children).toHaveLength(1);
    for (const half of [increment, decrement]) {
      expect(
        declared(half, {at: TOUCH, pseudo: '::before'}).get('content'),
      ).toBe('""');
      const glyph = declared(half, {pseudo: '::before'});
      expect(glyph.get('content')).toBe('none');
      expect(glyph.get('width')).toBe('13px');
      expect(glyph.get('height')).toBe('13px');
      expect(declared(half, {pseudo: '::after'})).toEqual(new Map());
    }
    // The paths, as the reader keeps them (whitespace dropped): − is one
    // stroke, + adds the upright.
    expect(
      declared(decrement, {pseudo: '::before'}).get('mask-image'),
    ).toContain("d='M06.5H13'");
    expect(
      declared(increment, {pseudo: '::before'}).get('mask-image'),
    ).toContain("d='M06.5H13M6.50V13'");
  });

  it('draw a disabled half’s glyph in the divider’s colour', () => {
    render(
      <NumberInput
        label="Quantity"
        value={10}
        max={10}
        onChange={() => {}}
        hasNumberSteppers
      />,
    );
    const increment = screen.getByRole('button', {name: 'Increment Quantity'});
    expect(declared(increment, {at: TOUCH}).get('color')).toBe(
      'var(--color-track)',
    );
  });

  it('key the control on a coarse pointer alone, with no iOS gate', () => {
    // One touch model: Android gets the control iOS does.
    const {column, wrapper, increment, decrement, fieldBox} = renderSteppers();
    const chevron = increment.children[0];
    expect(declared(column, {at: TOUCH}).get('position')).toBe('absolute');
    for (const el of [column, wrapper, increment, decrement, chevron]) {
      expect(declared(el, {at: [IOS_SUPPORTS, ...TOUCH]})).toEqual(new Map());
      expect(declared(el, {at: [...TOUCH, IOS_SUPPORTS]})).toEqual(new Map());
    }
    expect(
      declared(fieldBox as HTMLElement, {at: [IOS_SUPPORTS, ...TOUCH]}),
    ).toEqual(new Map());
  });

  it('keep the column in an InputGroup on a touch screen too', () => {
    const {column, wrapper, increment} = renderSteppers(true);
    // In the field: nothing of its own under a finger (no touch-target growth).
    expect(declared(column, {at: TOUCH}).has('position')).toBe(false);
    expect(declared(wrapper, {at: TOUCH}).has('margin-inline-end')).toBe(false);
    expect(declared(increment, {at: TOUCH, pseudo: '::before'})).toEqual(
      new Map(),
    );
  });
});

describe('NumberInput steppers with a mouse', () => {
  it('keep the column inside the field with a mouse', () => {
    // A fine pointer: this test's context has no coarse pointer.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const {column, wrapper, increment, fieldBox} = renderSteppers();
    const mouse = declared(column);
    expect(mouse.get('flex-direction')).toBe('column');
    expect(mouse.get('width')).toBe('var(--spacing-4)');
    // Outside the gate every touch style is a value, never null (a null would
    // erase the base): CSS initial values where the base sets nothing.
    expect(mouse.get('position')).toBe('static');
    expect(mouse.get('background-color')).toBe('transparent');
    expect(declared(wrapper).get('padding-inline-end')).toBe('0');
    expect(declared(wrapper).has('margin-inline-end')).toBe(false);
    expect(declared(fieldBox as HTMLElement).get('padding-inline-end')).toBe(
      '0',
    );
    expect(declared(increment).get('background-color')).toBe(
      'var(--color-background-surface)',
    );
  });

  it('leave each chevron icon its own inline-flex display', () => {
    // A fine pointer: this test's context has no coarse pointer.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    // The hide's default is the icon's own display (inline-flex), so nothing
    // of Icon's base style is erased where the touch key does not match.
    const {increment, decrement} = renderSteppers();
    for (const half of [increment, decrement]) {
      const icon = half.querySelector('svg')?.parentElement as HTMLElement;
      expect(declared(icon).get('display')).toBe('inline-flex');
    }
  });
});

describe('the values NumberInput spells out match stepper.ts', () => {
  // StyleX inlines only same-file or .stylex.ts values, so NumberInput writes
  // UIKit's shape as literals; this keeps them equal to the table. The height
  // follows the field's size (the component-size rules); md's is UIKit's.
  const source = readFileSync(join(__dirname, 'NumberInput.tsx'), 'utf8');
  const {look} = stepper;

  it.each([
    ['the width', `'${look.widthPt}px'`],
    ['the width the field gives up', `calc(${look.widthPt}px + `],
    ['the divider width', `'${look.dividerWidthPt}px'`],
    ['the divider inset', `'${(look.heightPt - look.dividerHeightPt) / 2}px'`],
    ['the glyph size', `'${look.glyphLengthPt}px'`],
    [
      'the glyph box',
      `viewBox='0 0 ${look.glyphLengthPt} ${look.glyphLengthPt}'`,
    ],
    ['the glyph stroke', `stroke-width='${look.glyphStrokePt}'`],
  ])('%s', (_, literal) => {
    expect(source).toContain(literal);
  });

  it("and its md height is UIKit's: the theme's md element height, a capsule at every height", () => {
    const tokens = readFileSync(
      join(__dirname, '../theme/tokens.stylex.ts'),
      'utf8',
    );
    expect(tokens).toContain(`'--size-element-md': '${look.heightPt}px'`);
    // UIKit's radius is half its height; the control keeps that at any size.
    expect(look.cornerRadiusPt * 2).toBe(look.heightPt);
    expect(source).toContain("'9999px'");
  });

  it('and its touch key is spelled as TOUCH_QUERY', () => {
    // A literal, not the imported key: StyleX gives an imported at-rule key a
    // different priority than its literal.
    expect(source).toContain(`const TOUCH = '@media ${TOUCH_QUERY}';`);
  });
});
