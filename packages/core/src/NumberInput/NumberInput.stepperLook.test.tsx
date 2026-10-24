// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInput.stepperLook.test.tsx
 * @input vitest (jsdom), React Testing Library, NumberInput with steppers,
 *   UIStepper's shape in motion/uikit/stepper.ts, and the raw CSS the StyleX
 *   runtime injects (recorded before jsdom parses it)
 * @output Checks the steppers' touch presentation: on a touch screen they
 *   sit beside the field as one 94 x 32 capsule (the field gives up that
 *   width and a gap), − on the left and + on the right in either writing
 *   direction, a 1 x 24 divider, transparent halves over the theme's
 *   neutral fill, UIKit's glyphs in place of the chevrons; with a mouse, and
 *   inside an InputGroup, the column is unchanged; and the values
 *   NumberInput spells out match stepper.ts
 * @position Testing; validates NumberInput.tsx's touch presentation styles.
 *   jsdom's CSS parser drops media blocks, so the declarations are read from
 *   the rules StyleX hands to `insertRule`; real engines are covered by
 *   __tests__/NumberInputStepperLook.interaction.browser.spec.ts
 */

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {render, screen} from '@testing-library/react';
import {beforeAll, describe, expect, it} from 'vitest';
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
  {media, pseudo = ''}: {media?: string; pseudo?: string} = {},
): Map<string, string> {
  const out = new Map<string, string>();
  for (const className of Array.from(el.classList)) {
    // Inside a media block StyleX repeats the class for specificity.
    const selector = new RegExp(
      `^\\.${className}(?:\\.${className})*(?::not\\(#\\\\#\\))*${pseudo.replace(/:/g, ':')}\\{([^}]*)\\}$`,
    );
    for (const rule of rawRules) {
      let body = rule;
      if (media != null) {
        const prefix = `@media ${media}{`;
        if (!rule.startsWith(prefix)) {
          continue;
        }
        body = rule.slice(prefix.length, -1);
      } else if (rule.startsWith('@')) {
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

function renderSteppers(inGroup = false) {
  const field = (
    <NumberInput
      label="Quantity"
      value={5}
      onChange={() => {}}
      hasNumberSteppers
    />
  );
  render(inGroup ? <InputGroup label="Order">{field}</InputGroup> : field);
  const increment = screen.getByRole('button', {name: 'Increment Quantity'});
  const decrement = screen.getByRole('button', {name: 'Decrement Quantity'});
  const column = increment.parentElement as HTMLElement;
  return {
    increment,
    decrement,
    column,
    wrapper: column.parentElement as HTMLElement,
  };
}

const TOUCH = TOUCH_QUERY;

describe('NumberInput steppers on a touch screen', () => {
  it('sit beside the field as one 94 x 32 capsule', () => {
    const {column, wrapper} = renderSteppers();
    const touch = declared(column, {media: TOUCH});
    expect(touch.get('position')).toBe('absolute');
    expect(touch.get('inset-inline-start')).toBe(
      'calc(100%+var(--border-width)+var(--spacing-2))',
    );
    // StyleX writes block-axis logical properties as their physical ones.
    expect(touch.get('top')).toBe('calc(50%-16px)');
    expect(touch.get('width')).toBe('94px');
    expect(touch.get('height')).toBe('32px');
    for (const corner of [
      'border-start-start-radius',
      'border-start-end-radius',
      'border-end-start-radius',
      'border-end-end-radius',
    ]) {
      expect(touch.get(corner), corner).toBe('16px');
    }
    expect(touch.get('background-color')).toBe('var(--color-neutral)');
    expect(touch.get('border-inline-start-width')).toBe('0');
    expect(touch.get('margin-top')).toBe('0');
    expect(touch.get('margin-bottom')).toBe('0');
    // The field gives up the capsule's width and a gap.
    const field = declared(wrapper, {media: TOUCH});
    expect(field.get('margin-inline-end')).toBe('calc(94px+var(--spacing-2))');
    expect(field.get('padding-inline-end')).toContain(
      '--astryx-number-input-padding-inline-end',
    );
  });

  it('put − on the left and + on the right in either writing direction', () => {
    const {column} = renderSteppers();
    expect(declared(column, {media: TOUCH}).get('flex-direction')).toBe(
      'row-reverse',
    );
    const rtl = rawRules.find(
      rule =>
        rule.startsWith(`@media ${TOUCH}{`) &&
        rule.includes('[dir="rtl"]') &&
        rule.includes('flex-direction:row'),
    );
    expect(rtl).toBeDefined();
    // The increment button is first in the DOM, so a reversed row puts it
    // on the right in a left-to-right page.
    expect(column.firstElementChild?.getAttribute('aria-label')).toBe(
      'Increment Quantity',
    );
  });

  it('draw a 1 x 24 divider, centred 4px from the top', () => {
    const {column} = renderSteppers();
    const divider = declared(column, {media: TOUCH, pseudo: '::after'});
    expect(divider.get('content')).toBe('""');
    const shape = declared(column, {pseudo: '::after'});
    expect(shape.get('width')).toBe('1px');
    expect(shape.get('height')).toBe('24px');
    expect(shape.get('top')).toBe('4px');
    expect(shape.get('inset-inline-start')).toBe('calc(50%-.5px)');
    expect(shape.get('background-color')).toBe('var(--color-track)');
  });

  it('paint each half transparent over the capsule, glyphs in the primary icon colour', () => {
    const {increment, decrement} = renderSteppers();
    for (const half of [increment, decrement]) {
      const touch = declared(half, {media: TOUCH});
      expect(touch.get('background-color')).toBe('transparent');
      expect(touch.get('color')).toBe('var(--color-icon-primary)');
    }
    expect(declared(decrement, {media: TOUCH}).get('border-top-width')).toBe(
      '0',
    );
  });

  it('show UIKit’s − and + glyphs in place of the chevrons', () => {
    const {increment, decrement} = renderSteppers();
    const [chevron, plus] = Array.from(increment.children);
    expect(declared(chevron, {media: TOUCH}).get('display')).toBe('none');
    expect(declared(plus, {media: TOUCH}).get('display')).toBe('block');
    expect(declared(plus).get('display')).toBe('none');
    expect(plus.querySelector('path')?.getAttribute('d')).toBe(
      'M0 6.5H13M6.5 0V13',
    );
    expect(plus.querySelector('path')?.getAttribute('stroke-width')).toBe(
      '1.67',
    );
    const minus = decrement.children[1];
    expect(minus.querySelector('path')?.getAttribute('d')).toBe('M0 6.5H13');
    expect(plus.getAttribute('aria-hidden')).toBe('true');
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
    expect(declared(increment, {media: TOUCH}).get('color')).toBe(
      'var(--color-track)',
    );
  });
});

describe('NumberInput steppers with a mouse, and in an InputGroup', () => {
  it('keep the column inside the field with a mouse', () => {
    const {column, wrapper, increment} = renderSteppers();
    const mouse = declared(column);
    expect(mouse.get('flex-direction')).toBe('column');
    expect(mouse.get('width')).toBe('var(--spacing-4)');
    expect(mouse.has('position')).toBe(false);
    expect(mouse.has('background-color')).toBe(false);
    expect(declared(wrapper).get('padding-inline-end')).toBe('0');
    expect(declared(wrapper).has('margin-inline-end')).toBe(false);
    expect(declared(increment).get('background-color')).toBe(
      'var(--color-background-surface)',
    );
  });

  it('keep the column in an InputGroup on a touch screen too', () => {
    const {column, wrapper, increment} = renderSteppers(true);
    expect(declared(column, {media: TOUCH}).has('position')).toBe(false);
    expect(declared(wrapper, {media: TOUCH}).has('margin-inline-end')).toBe(
      false,
    );
    expect(increment.querySelector('svg[viewBox="0 0 13 13"]')).toBeNull();
  });
});

describe('the values NumberInput spells out match stepper.ts', () => {
  // StyleX inlines only same-file or .stylex.ts values, so NumberInput writes
  // UIKit's shape as literals; this keeps them equal to the table.
  const source = readFileSync(join(__dirname, 'NumberInput.tsx'), 'utf8');
  const {look} = stepper;

  it.each([
    ['the width', `'${look.widthPt}px'`],
    ['the width the field gives up', `calc(${look.widthPt}px + `],
    ['the height', `'${look.heightPt}px'`],
    ['the vertical centring', `'calc(50% - ${look.heightPt / 2}px)'`],
    ['the corner radius', `'${look.cornerRadiusPt}px'`],
    ['the divider width', `'${look.dividerWidthPt}px'`],
    ['the divider height', `'${look.dividerHeightPt}px'`],
    ['the divider inset', `'${(look.heightPt - look.dividerHeightPt) / 2}px'`],
    [
      'the glyph box',
      `viewBox="0 0 ${look.glyphLengthPt} ${look.glyphLengthPt}"`,
    ],
    ['the glyph size', `'${look.glyphLengthPt}px'`],
    ['the glyph stroke', `strokeWidth={${look.glyphStrokePt}}`],
  ])('%s', (_, literal) => {
    expect(source).toContain(literal);
  });
});
