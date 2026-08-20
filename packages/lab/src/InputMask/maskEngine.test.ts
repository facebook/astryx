// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file maskEngine.test.ts
 * @input Tests maskEngine pure functions with pattern masks
 * @output Regression coverage for format/caret/strip/ghost math (RFC #4946)
 * @position Colocated tests for the InputMask mask engine
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/InputMask/maskEngine.ts
 */

import {describe, expect, it} from 'vitest';

import {
  caretForRawIndex,
  formatRaw,
  ghostRemainder,
  maxRawLength,
  rawIndexForCaret,
  resolveMask,
  stripToRaw,
} from './maskEngine';

// Fixed-shape fixtures for the shapes the RFC motivates (phone, SSN, ZIP,
// card), expressed as plain patterns — the component ships no named presets.
const phone = resolveMask({pattern: '(###) ###-####'});
const ssn = resolveMask({pattern: '###-##-####'});
const zip = resolveMask({pattern: '#####'});
const card = resolveMask({pattern: '#### #### #### ####'});

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
    expect(maxRawLength(resolveMask({pattern: '##/##'}))).toBe(4);
  });
});

describe('stripToRaw', () => {
  it('reduces a formatted value to its digits', () => {
    expect(stripToRaw(phone, '(555) 123-4567')).toBe('5551234567');
  });

  it('drops every non-digit character', () => {
    expect(stripToRaw(phone, 'a1b2c3')).toBe('123');
  });

  it('clamps to the mask capacity', () => {
    expect(stripToRaw(zip, '0213899999')).toBe('02138');
  });

  it('returns an empty string for empty input', () => {
    expect(stripToRaw(phone, '')).toBe('');
  });
});

describe('formatRaw', () => {
  it('formats a complete value per mask', () => {
    expect(formatRaw(phone, '5551234567')).toBe('(555) 123-4567');
    expect(formatRaw(ssn, '123456789')).toBe('123-45-6789');
    expect(formatRaw(zip, '02138')).toBe('02138');
    expect(formatRaw(card, '4111111111111111')).toBe('4111 1111 1111 1111');
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
    expect(formatRaw(resolveMask({pattern: '(+1) ###'}), '')).toBe('');
  });

  it('flushes leading literals together with the first digit', () => {
    expect(formatRaw(resolveMask({pattern: '(+1) ###'}), '5')).toBe('(+1) 5');
  });
});

describe('caretForRawIndex', () => {
  it('maps a raw index to the display position after that digit and any flushed literals', () => {
    expect(caretForRawIndex(phone, 0)).toBe(0);
    expect(caretForRawIndex(phone, 1)).toBe(2); // "(5"
    expect(caretForRawIndex(phone, 3)).toBe(6); // "(555) "
    expect(caretForRawIndex(phone, 6)).toBe(10); // "(555) 123-"
    expect(caretForRawIndex(phone, 10)).toBe(14);
    expect(caretForRawIndex(ssn, 5)).toBe(7); // "123-45-"
  });
});

describe('rawIndexForCaret', () => {
  it('counts the digits before the display caret', () => {
    expect(rawIndexForCaret('(555) 123-4567', 0)).toBe(0);
    expect(rawIndexForCaret('(555) 123-4567', 1)).toBe(0);
    expect(rawIndexForCaret('(555) 123-4567', 2)).toBe(1);
    expect(rawIndexForCaret('(555) 123-4567', 6)).toBe(3);
    expect(rawIndexForCaret('(555) 123-4567', 14)).toBe(10);
    expect(rawIndexForCaret('123-', 4)).toBe(3);
    expect(rawIndexForCaret('', 0)).toBe(0);
  });
});

describe('caret round-trip', () => {
  it('rawIndexForCaret inverts caretForRawIndex at every fill level', () => {
    const raw = '5551234567';
    for (let n = 0; n <= raw.length; n++) {
      const prefix = raw.slice(0, n);
      const formatted = formatRaw(phone, prefix);
      expect(rawIndexForCaret(formatted, caretForRawIndex(phone, n))).toBe(n);
    }
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
