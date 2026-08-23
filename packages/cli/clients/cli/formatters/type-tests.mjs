// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Compile-time guards for the formatter contract. Never executed — its
 * only job is to make `tsc` (checkJs + strict, via tsconfig.strict.json) prove
 * that `emit` accepts renderer output and rejects raw strings. If any
 * `@ts-expect-error` below stops erroring, the contract has regressed and the
 * type check fails.
 */

import {emit, section, text, list, record, records, code} from './index.mjs';

/** @returns {void} */
export function __formatterTypeGuards() {
  // Renderer output is emittable.
  emit(section('s'), section('H', 'subtitle'), text('p'));
  emit(list(['a', ['head', 'detail']]));
  emit(record({name: 'Button', domain: 'component'}, {fields: ['name', 'domain']}));
  emit(records([{name: 'A'}, {name: 'B'}], {format: {name: v => String(v)}}));
  emit(code('const x = 1;'));

  // Falsy placeholders are allowed (inline conditionals).
  const show = false;
  emit(section('s'), show && section('maybe'), null, undefined);

  // @ts-expect-error a bare string is not a Block — must go through a renderer.
  emit('raw string');

  // @ts-expect-error a number is not a Block.
  emit(42);
}
