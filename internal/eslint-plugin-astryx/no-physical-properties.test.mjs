// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-physical-properties.test.mjs
 */

import {RuleTester} from 'eslint';
import rule from './no-physical-properties.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

/** Wrap a style-object body in a stylex.create() call. */
function inStylex(body) {
  return `
    import * as stylex from '@stylexjs/stylex';
    const styles = stylex.create({
      base: { ${body} },
    });
  `;
}

ruleTester.run('no-physical-properties', rule, {
  valid: [
    // Logical margin/padding are fine
    {code: inStylex(`marginInlineStart: 8`)},
    {code: inStylex(`paddingInlineEnd: 12`)},
    // Logical inset is fine
    {code: inStylex(`insetInlineStart: 0`)},
    // Logical border longhands are fine
    {code: inStylex(`borderInlineStartWidth: 1, borderInlineEndColor: 'red'`)},
    // Logical corner radii are fine
    {code: inStylex(`borderStartStartRadius: 4, borderEndEndRadius: 4`)},
    // textAlign with a logical value is fine
    {code: inStylex(`textAlign: 'start'`)},
    // float/clear with logical values are fine
    {code: inStylex(`float: 'inline-start'`)},
    {code: inStylex(`clear: 'inline-end'`)},
    // textAlign with a non-physical value (center) is fine
    {code: inStylex(`textAlign: 'center'`)},
    // Block-direction properties are never physical — fine
    {code: inStylex(`marginTop: 4, paddingBottom: 8`)},
    // SCOPING: physical key on a plain object OUTSIDE stylex.create — fine
    {code: `const x = { left: 5, marginLeft: 10, borderTopLeftRadius: 4 };`},
    // SCOPING: physical VALUE on a plain object outside stylex — fine
    {code: `const x = { textAlign: 'left', float: 'right' };`},
    // SCOPING: `left`/`right` as ordinary variable names — fine
    {code: `const left = 5; const right = 10; const sum = left + right;`},
  ],
  invalid: [
    // --- KEY-BASED: margin (autofix renames the key) ---
    {
      code: inStylex(`marginLeft: 8`),
      output: inStylex(`marginInlineStart: 8`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'marginLeft', logical: 'marginInlineStart'}},
      ],
    },
    {
      code: inStylex(`marginRight: 8`),
      output: inStylex(`marginInlineEnd: 8`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'marginRight', logical: 'marginInlineEnd'}},
      ],
    },
    // --- KEY-BASED: padding ---
    {
      code: inStylex(`paddingLeft: 8`),
      output: inStylex(`paddingInlineStart: 8`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'paddingLeft', logical: 'paddingInlineStart'}},
      ],
    },
    {
      code: inStylex(`paddingRight: 8`),
      output: inStylex(`paddingInlineEnd: 8`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'paddingRight', logical: 'paddingInlineEnd'}},
      ],
    },
    // --- KEY-BASED: border side shorthands ---
    {
      code: inStylex(`borderLeft: '1px solid red'`),
      output: inStylex(`borderInlineStart: '1px solid red'`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderLeft', logical: 'borderInlineStart'}},
      ],
    },
    {
      code: inStylex(`borderRight: '1px solid red'`),
      output: inStylex(`borderInlineEnd: '1px solid red'`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderRight', logical: 'borderInlineEnd'}},
      ],
    },
    // --- KEY-BASED: border side longhands (width/style/color) ---
    {
      code: inStylex(`borderLeftWidth: 1`),
      output: inStylex(`borderInlineStartWidth: 1`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderLeftWidth', logical: 'borderInlineStartWidth'}},
      ],
    },
    {
      code: inStylex(`borderLeftStyle: 'solid'`),
      output: inStylex(`borderInlineStartStyle: 'solid'`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderLeftStyle', logical: 'borderInlineStartStyle'}},
      ],
    },
    {
      code: inStylex(`borderLeftColor: 'red'`),
      output: inStylex(`borderInlineStartColor: 'red'`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderLeftColor', logical: 'borderInlineStartColor'}},
      ],
    },
    {
      code: inStylex(`borderRightWidth: 1`),
      output: inStylex(`borderInlineEndWidth: 1`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderRightWidth', logical: 'borderInlineEndWidth'}},
      ],
    },
    {
      code: inStylex(`borderRightStyle: 'solid'`),
      output: inStylex(`borderInlineEndStyle: 'solid'`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderRightStyle', logical: 'borderInlineEndStyle'}},
      ],
    },
    {
      code: inStylex(`borderRightColor: 'red'`),
      output: inStylex(`borderInlineEndColor: 'red'`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderRightColor', logical: 'borderInlineEndColor'}},
      ],
    },
    // --- KEY-BASED: inset left/right ---
    {
      code: inStylex(`left: 0`),
      output: inStylex(`insetInlineStart: 0`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'left', logical: 'insetInlineStart'}},
      ],
    },
    {
      code: inStylex(`right: 0`),
      output: inStylex(`insetInlineEnd: 0`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'right', logical: 'insetInlineEnd'}},
      ],
    },
    // --- KEY-BASED: string-literal key preserves quoting on rename ---
    {
      code: inStylex(`'left': 0`),
      output: inStylex(`'insetInlineStart': 0`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'left', logical: 'insetInlineStart'}},
      ],
    },
    // --- KEY-BASED: corner radii (verify the diagonal mapping) ---
    {
      code: inStylex(`borderTopLeftRadius: 4`),
      output: inStylex(`borderStartStartRadius: 4`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderTopLeftRadius', logical: 'borderStartStartRadius'}},
      ],
    },
    {
      code: inStylex(`borderTopRightRadius: 4`),
      output: inStylex(`borderStartEndRadius: 4`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderTopRightRadius', logical: 'borderStartEndRadius'}},
      ],
    },
    {
      code: inStylex(`borderBottomLeftRadius: 4`),
      output: inStylex(`borderEndStartRadius: 4`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderBottomLeftRadius', logical: 'borderEndStartRadius'}},
      ],
    },
    {
      code: inStylex(`borderBottomRightRadius: 4`),
      output: inStylex(`borderEndEndRadius: 4`),
      errors: [
        {messageId: 'physicalKey', data: {physical: 'borderBottomRightRadius', logical: 'borderEndEndRadius'}},
      ],
    },
    // --- KEY-BASED CONFLICT: both physical + logical present → no autofix ---
    {
      code: inStylex(`marginLeft: 8, marginInlineStart: 4`),
      // Fix is skipped: `output: null` asserts the code is left unchanged.
      output: null,
      errors: [
        {messageId: 'physicalKeyConflict', data: {physical: 'marginLeft', logical: 'marginInlineStart'}},
      ],
    },
    // Conflict also detected when the logical key is a string literal.
    {
      code: inStylex(`left: 0, 'insetInlineStart': 10`),
      output: null,
      errors: [
        {messageId: 'physicalKeyConflict', data: {physical: 'left', logical: 'insetInlineStart'}},
      ],
    },
    // --- VALUE-BASED: textAlign (autofix replaces the value only) ---
    {
      code: inStylex(`textAlign: 'left'`),
      output: inStylex(`textAlign: 'start'`),
      errors: [
        {messageId: 'physicalValue', data: {prop: 'textAlign', physical: 'left', logical: 'start'}},
      ],
    },
    {
      code: inStylex(`textAlign: 'right'`),
      output: inStylex(`textAlign: 'end'`),
      errors: [
        {messageId: 'physicalValue', data: {prop: 'textAlign', physical: 'right', logical: 'end'}},
      ],
    },
    // --- VALUE-BASED: float ---
    {
      code: inStylex(`float: 'left'`),
      output: inStylex(`float: 'inline-start'`),
      errors: [
        {messageId: 'physicalValue', data: {prop: 'float', physical: 'left', logical: 'inline-start'}},
      ],
    },
    {
      code: inStylex(`float: 'right'`),
      output: inStylex(`float: 'inline-end'`),
      errors: [
        {messageId: 'physicalValue', data: {prop: 'float', physical: 'right', logical: 'inline-end'}},
      ],
    },
    // --- VALUE-BASED: clear ---
    {
      code: inStylex(`clear: 'left'`),
      output: inStylex(`clear: 'inline-start'`),
      errors: [
        {messageId: 'physicalValue', data: {prop: 'clear', physical: 'left', logical: 'inline-start'}},
      ],
    },
    {
      code: inStylex(`clear: 'right'`),
      output: inStylex(`clear: 'inline-end'`),
      errors: [
        {messageId: 'physicalValue', data: {prop: 'clear', physical: 'right', logical: 'inline-end'}},
      ],
    },
  ],
});

console.log('All tests passed!');
