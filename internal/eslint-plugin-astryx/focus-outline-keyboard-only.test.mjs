// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focus-outline-keyboard-only.test.mjs
 */

import {RuleTester} from 'eslint';
import rule from './focus-outline-keyboard-only.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

ruleTester.run('focus-outline-keyboard-only', rule, {
  valid: [
    // The standard shape.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          base: {
            outline: {default: 'none', ':focus-visible': '2px solid blue'},
            outlineOffset: {default: '0', ':focus-visible': '3px'},
          },
        });
      `,
    },
    // A ring drawn on a wrapper around the focusable element.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          wrapper: {
            outlineWidth: {default: '0', ':has(:focus-visible)': '2px'},
            outlineStyle: {default: 'none', ':has(:focus-visible)': 'solid'},
          },
        });
      `,
    },
    // :focus-within on something that is not an outline — the field border and
    // its inset ring are out of scope for this rule.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          field: {
            borderColor: {default: 'gray', ':focus-within': 'blue'},
            boxShadow: {default: 'none', ':focus-within': 'inset 0 0 0 2px blue'},
          },
        });
      `,
    },
    // A hover style stepping aside for a focused field is an exclusion, not a
    // focus state.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          base: {
            outlineColor: {
              default: null,
              ':hover:not(:focus-within)': 'gray',
              ':focus-visible': 'blue',
            },
          },
        });
      `,
    },
    // Menu rows highlight roving focus with a background, not a ring.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {
            backgroundColor: {default: 'transparent', ':focus': 'gray'},
            outline: 'none',
          },
        });
      `,
    },
    // Outside stylex.create() this rule says nothing.
    {
      code: `
        const notStyles = {
          base: {outline: {default: 'none', ':focus': '2px solid blue'}},
        };
      `,
    },
    // SUPPRESSING a ring on a broader selector is legitimate — AppShell kills
    // the UA ring on its programmatic focus target for every kind of focus.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          mainFocusTarget: {
            outline: {default: null, ':focus': 'none'},
          },
        });
      `,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          base: {
            outlineWidth: {default: '2px', ':focus-within': '0'},
          },
        });
      `,
    },
  ],
  invalid: [
    // Shape 1: :focus condition on an outline property.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          base: {
            outline: {default: 'none', ':focus': '2px solid blue'},
          },
        });
      `,
      errors: [{messageId: 'pointerFocusOutline', data: {key: ':focus'}}],
    },
    // Shape 1, longhand + :focus-within.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          base: {
            outlineWidth: {default: '0', ':focus-within': '2px'},
          },
        });
      `,
      errors: [{messageId: 'pointerFocusOutline'}],
    },
    // Shape 2: outline nested inside a :focus-within block — what
    // ComplexSelector shipped.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          focusRing: {
            ':focus-within': {
              outline: '2px solid blue',
              outlineOffset: '2px',
            },
          },
        });
      `,
      errors: [{messageId: 'pointerFocusOutline'}],
    },
    // Every offending condition is reported, not just the first.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          base: {
            outline: {
              default: 'none',
              ':focus': '2px solid blue',
              ':focus-within': '2px solid blue',
            },
          },
        });
      `,
      errors: [
        {messageId: 'pointerFocusOutline'},
        {messageId: 'pointerFocusOutline'},
      ],
    },
  ],
});

console.log('✅ focus-outline-keyboard-only tests passed');
