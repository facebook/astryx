// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file The loose type-text rules the prop comparison falls back to. */

import {describe, expect, it} from 'vitest';
import {normalizeTypeText, typeTextMatches} from './type-text.mjs';

describe('normalizeTypeText', () => {
  it.each([
    ["'b' | 'a'", '"a" | "b"'],
    ['React.ReactNode', 'ReactNode'],
    ['Array<string>', 'string[]'],
    ['ReadonlyArray<"a" | "b">', "('a' | 'b')[]"],
    ['readonly string[]', 'string[]'],
    ['Readonly<Status>', 'Status'],
    ['true | false', 'boolean'],
    ["'sm' | string", 'string'],
    ['(e: MouseEvent) => void', '(event: MouseEvent) => void'],
    ['{b: number; a?: string}', '{ a?: string, b: number }'],
    ['{ /** doc */ a: string; }', '{a: string}'],
  ])('reads %s as %s', (a, b) => {
    expect(normalizeTypeText(a)).toEqual(normalizeTypeText(b));
  });

  it('drops undefined only on an optional prop', () => {
    expect(normalizeTypeText('string | undefined', {optional: true})).toEqual([
      'string',
    ]);
    expect(normalizeTypeText('string | undefined')).toEqual([
      'string',
      'undefined',
    ]);
  });

  it('keeps different types different', () => {
    expect(normalizeTypeText("'a' | 'b'")).not.toEqual(
      normalizeTypeText("'a'"),
    );
    expect(normalizeTypeText('(a: string) => void')).not.toEqual(
      normalizeTypeText('(a: number) => void'),
    );
  });
});

describe('typeTextMatches', () => {
  it('lets a name without type arguments match the name with arguments', () => {
    expect(
      typeTextMatches(
        '(e: MouseEvent) => void',
        [['(e: MouseEvent<HTMLElement>) => void']],
        false,
      ),
    ).toBe(true);
    expect(
      typeTextMatches(
        '(e: MouseEvent<HTMLElement>) => void',
        [['(e: MouseEvent) => void']],
        false,
      ),
    ).toBe(false);
  });
});
