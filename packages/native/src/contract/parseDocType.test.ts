// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {parseDocType} from './parseDocType.js';

describe('parseDocType', () => {
  it('reads portable forms', () => {
    expect(parseDocType('string')).toEqual({ok: true, type: {kind: 'string'}});
    expect(parseDocType("'sm' | 'md' | 'lg'")).toEqual({
      ok: true,
      type: {kind: 'enum', values: ['sm', 'md', 'lg']},
    });
    expect(parseDocType('SelectorOption[]')).toEqual({
      ok: true,
      type: {kind: 'array', of: {kind: 'named', name: 'SelectorOption'}},
    });
    expect(parseDocType('(value: string) => void')).toEqual({
      ok: true,
      type: {kind: 'fn', args: [{kind: 'string'}]},
    });
    expect(
      parseDocType("{type: 'error' | 'warning', message?: string}"),
    ).toEqual({
      ok: true,
      type: {
        kind: 'record',
        fields: {
          type: {
            type: {kind: 'enum', values: ['error', 'warning']},
            optional: false,
          },
          message: {type: {kind: 'string'}, optional: true},
        },
      },
    });
  });

  it.each([
    ['ReactNode', 'free-form content'],
    ['IconType | ReactNode', 'web icon component'],
    ['(option: SelectorOptionData) => ReactNode', 'render function'],
    ['(event: MouseEvent) => void', 'DOM event'],
    ['StyleXStyles', 'web styling input'],
    ['number | string', 'union of different kinds'],
  ])('keeps %s out of the core', (type, reason) => {
    const parsed = parseDocType(type);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.reason).toContain(reason);
    }
  });
});
