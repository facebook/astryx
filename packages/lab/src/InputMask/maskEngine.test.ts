// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file maskEngine.test.ts
 * @input Tests maskEngine pure functions with pattern masks
 * @output Regression coverage for format/edit/caret/clamp/ghost math (RFC #4946)
 * @position Colocated tests for the InputMask mask engine
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/InputMask/maskEngine.ts
 */

import {describe, expect, it} from 'vitest';

import {
  caretForRawIndex,
  clampRaw,
  formatRaw,
  ghostRemainder,
  maxRawLength,
  resolveEdit,
  resolveMask,
} from './maskEngine';

// Fixed-shape fixtures for the shapes the RFC motivates (phone, SSN, ZIP,
// card), expressed as plain patterns — the component ships no named presets.
const phone = resolveMask({pattern: '(###) ###-####'});
const ssn = resolveMask({pattern: '###-##-####'});
const zip = resolveMask({pattern: '#####'});
const card = resolveMask({pattern: '#### #### #### ####'});
// A pattern whose literals include a digit: the mask must never read its
// own "1" back as typed data.
const country = resolveMask({pattern: '(+1) ### ### ####'});

describe('resolveMask', () => {
  it('passes the pattern through and defaults the placeholder to `_`', () => {
    expect(resolveMask({pattern: '##/##'})).toEqual({
      pattern: '##/##',
      placeholder: '_',
    });
  });

  it('keeps a custom placeholder character', () => {
    expect(resolveMask({pattern: '###', placeholder: '•'})).toEqual({
      pattern: '###',
      placeholder: '•',
    });
  });
});

describe('maxRawLength', () => {
  it('counts the digit slots of a pattern', () => {
    expect(maxRawLength(phone)).toBe(10);
    expect(maxRawLength(ssn)).toBe(9);
    expect(maxRawLength(zip)).toBe(5);
    expect(maxRawLength(card)).toBe(16);
    expect(maxRawLength(country)).toBe(10);
    expect(maxRawLength(resolveMask({pattern: '##/##'}))).toBe(4);
  });
});

describe('clampRaw', () => {
  it('keeps the digits of a raw value', () => {
    expect(clampRaw(phone, '5551234567')).toBe('5551234567');
  });

  it('drops every non-digit character', () => {
    expect(clampRaw(phone, 'a1b2c3')).toBe('123');
  });

  it('clamps to the mask capacity', () => {
    expect(clampRaw(zip, '0213899999')).toBe('02138');
  });

  it('returns an empty string for empty input', () => {
    expect(clampRaw(phone, '')).toBe('');
  });
});

describe('formatRaw', () => {
  it('formats a complete value per mask', () => {
    expect(formatRaw(phone, '5551234567')).toBe('(555) 123-4567');
    expect(formatRaw(ssn, '123456789')).toBe('123-45-6789');
    expect(formatRaw(zip, '02138')).toBe('02138');
    expect(formatRaw(card, '4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatRaw(country, '5551234567')).toBe('(+1) 555 123 4567');
  });

  it('inserts literals eagerly: a literal appears as soon as the digit before it lands', () => {
    expect(formatRaw(phone, '5')).toBe('(5');
    expect(formatRaw(phone, '555')).toBe('(555) ');
    expect(formatRaw(phone, '555123')).toBe('(555) 123-');
    expect(formatRaw(ssn, '123')).toBe('123-');
    expect(formatRaw(ssn, '12345')).toBe('123-45-');
    expect(formatRaw(card, '4111')).toBe('4111 ');
  });

  it('renders nothing (not the leading literal) while the value is empty', () => {
    expect(formatRaw(phone, '')).toBe('');
    expect(formatRaw(country, '')).toBe('');
  });

  it('flushes leading literals together with the first digit', () => {
    expect(formatRaw(country, '5')).toBe('(+1) 5');
  });
});

describe('caretForRawIndex', () => {
  it('maps a raw index to the display position of that slot, after any flushed literals', () => {
    expect(caretForRawIndex(phone, 0)).toBe(1); // "(" — after the leading literal
    expect(caretForRawIndex(country, 0)).toBe(5); // "(+1) "
    expect(caretForRawIndex(phone, 1)).toBe(2); // "(5"
    expect(caretForRawIndex(phone, 3)).toBe(6); // "(555) "
    expect(caretForRawIndex(phone, 6)).toBe(10); // "(555) 123-"
    expect(caretForRawIndex(phone, 10)).toBe(14);
    expect(caretForRawIndex(ssn, 5)).toBe(7); // "123-45-"
  });
});

describe('resolveEdit', () => {
  it('reads the kept display by slot position, so a literal digit is never typed data', () => {
    expect(resolveEdit(country, '(+1) 5', '(+1) 55', 7)).toEqual({
      raw: '55',
      caret: 7,
    });
  });

  it('reads pasted text that carries the mask literals in place against the pattern', () => {
    expect(resolveEdit(country, '', '(+1) 555 123 4567', 17)).toEqual({
      raw: '5551234567',
      caret: 17,
    });
  });

  it('reads pasted text without the mask literals as loose digits', () => {
    expect(resolveEdit(country, '', '555 123 4567', 12)).toEqual({
      raw: '5551234567',
      caret: 17,
    });
  });

  it('harvests every digit of a messy paste and clamps to capacity', () => {
    expect(resolveEdit(ssn, '', 'id: 123-45-6789 (verified)', 26)).toEqual({
      raw: '123456789',
      caret: 11,
    });
  });

  it('inserts mid-value and leaves the caret after the typed digit', () => {
    expect(resolveEdit(phone, '(555) 123-', '(5955) 123-', 3)).toEqual({
      raw: '5955123',
      caret: 3,
    });
  });

  it('typing at the slot caret of any fill level lands in that slot', () => {
    const raw = '5551234567';
    const full = formatRaw(phone, raw);
    for (let k = 0; k < raw.length; k++) {
      const at = caretForRawIndex(phone, k);
      const next = full.slice(0, at) + '9' + full.slice(at);
      expect(resolveEdit(phone, full, next, at + 1)).toEqual({
        raw: (raw.slice(0, k) + '9' + raw.slice(k)).slice(0, 10),
        caret: caretForRawIndex(phone, k + 1),
      });
    }
  });

  it('backspacing only literals deletes through to the digit before them', () => {
    expect(
      resolveEdit(phone, '(555) 123-', '(555)123-', 5, 'backward'),
    ).toEqual({raw: '55123', caret: 3});
  });

  it('forward-deleting only literals deletes through to the digit after them', () => {
    expect(resolveEdit(phone, '(555) 123-', '(555 123-', 4, 'forward')).toEqual(
      {raw: '55523', caret: 6},
    );
  });

  it('leaves the digits alone when only literals go and the direction is unknown', () => {
    expect(resolveEdit(phone, '(555) 123-', '(555123-', 4)).toEqual({
      raw: '555123',
      caret: 6,
    });
  });

  it('empties the value when everything is selected and deleted', () => {
    expect(resolveEdit(phone, '(555) 123-', '', 0, 'backward')).toEqual({
      raw: '',
      caret: 0,
    });
  });

  it('drops a digit typed past capacity and keeps the caret at the end', () => {
    expect(resolveEdit(phone, '(555) 123-4567', '(555) 123-45679', 15)).toEqual(
      {raw: '5551234567', caret: 14},
    );
  });

  it('ignores a non-digit keystroke and keeps the caret in place', () => {
    expect(resolveEdit(phone, '(555) 123-', '(555) x123-', 7)).toEqual({
      raw: '555123',
      caret: 6,
    });
  });

  it('puts the caret before the first slot, not the leading literals, when the first digit goes', () => {
    expect(resolveEdit(country, '(+1) 55', '(+1) 5', 5, 'backward')).toEqual({
      raw: '5',
      caret: 5,
    });
  });
});

describe('ghostRemainder', () => {
  it('shows the whole pattern (with placeholder chars) when empty', () => {
    expect(ghostRemainder(phone, '')).toBe('(___) ___-____');
  });

  it('shows only the unfilled tail as the value grows', () => {
    expect(ghostRemainder(phone, '555')).toBe('___-____');
    expect(ghostRemainder(zip, '021')).toBe('__');
  });

  it('is empty when the mask is complete', () => {
    expect(ghostRemainder(phone, '5551234567')).toBe('');
  });

  it('uses the custom placeholder character', () => {
    expect(
      ghostRemainder(resolveMask({pattern: '###', placeholder: '•'}), '1'),
    ).toBe('••');
  });
});
