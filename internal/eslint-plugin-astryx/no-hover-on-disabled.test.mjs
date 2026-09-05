// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-hover-on-disabled.test.mjs
 */

import {RuleTester} from 'eslint';
import rule from './no-hover-on-disabled.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

const GUARD = ':where(:not(:disabled,[aria-disabled="true"]))';

ruleTester.run('no-hover-on-disabled', rule, {
  valid: [
    // The guarded form, property-first.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {
            backgroundColor: {
              default: 'transparent',
              ':hover${GUARD}': 'rgba(0,0,0,0.05)',
            },
          },
        });
      `,
    },
    // The guarded form, condition-first with a nested media query.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {
            ':hover${GUARD}': {
              '@media (hover: hover)': {backgroundColor: 'red'},
            },
          },
        });
      `,
    },
    // Not a hover condition at all.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {color: {default: 'red', ':active': 'blue', ':focus-visible': 'green'}},
        });
      `,
    },
    // An ANCESTOR's hover styling a descendant — a row may legitimately
    // highlight around a disabled control, so this is out of scope.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          cell: {opacity: {default: 0, ':is(th:hover *)': 1}},
        });
      `,
    },
    // Plain object literals outside stylex.create are not styles.
    {
      code: `const handlers = {':hover': () => {}};`,
    },
    // :hover combined with a pseudo-ELEMENT in one of the three files this PR
    // hand-verified is JS-gated (facebook/astryx#5442) stays unreported —
    // everywhere else, the same key is reported (see invalid below).
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          overlay: {opacity: {default: 0, ':hover::after': 1}},
        });
      `,
      filename: '/repo/packages/core/src/SelectableCard/SelectableCard.tsx',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          overlay: {opacity: {default: 0, ':hover::before': 1}},
        });
      `,
      filename: '/repo/packages/core/src/Thumbnail/Thumbnail.tsx',
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          overlay: {opacity: {default: 0, ':hover::after': 1}},
        });
      `,
      filename: '/repo/packages/core/src/ClickableCard/ClickableCard.tsx',
    },
  ],
  invalid: [
    // The bare key, property-first.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {backgroundColor: {default: 'transparent', ':hover': 'red'}},
        });
      `,
      errors: [{messageId: 'unguardedHover'}],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {backgroundColor: {default: 'transparent', ':hover${GUARD}': 'red'}},
        });
      `,
    },
    // Condition-first, nested media block preserved by the fix.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {':hover': {'@media (hover: hover)': {backgroundColor: 'red'}}},
        });
      `,
      errors: [{messageId: 'unguardedHover'}],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {':hover${GUARD}': {'@media (hover: hover)': {backgroundColor: 'red'}}},
        });
      `,
    },
    // An existing qualifier is kept and the guard appended after it.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          field: {borderColor: {default: 'grey', ':hover:not(:focus-within)': 'black'}},
        });
      `,
      errors: [{messageId: 'unguardedHover'}],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          field: {borderColor: {default: 'grey', ':hover:not(:focus-within)${GUARD}': 'black'}},
        });
      `,
    },
    // A double-quoted key is rewritten single-quoted: the guard carries its
    // own double quotes.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {color: {default: 'red', ":hover": 'blue'}},
        });
      `,
      errors: [{messageId: 'unguardedHover'}],
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {color: {default: 'red', ':hover${GUARD}': 'blue'}},
        });
      `,
    },
    // :hover + a pseudo-element outside the three hand-verified files is
    // reported (unlike the exempt cases above), but not autofixed: the
    // fixer would hit the tokenizer bug and reintroduce facebook/astryx#5442.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          tab: {opacity: {default: 0, ':hover::after': 1}},
        });
      `,
      filename: '/repo/packages/core/src/Tabs/Tabs.tsx',
      errors: [{messageId: 'unguardedHoverPseudoElement'}],
      output: null,
    },
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          tab: {opacity: {default: 0, ':hover::before': 1}},
        });
      `,
      errors: [{messageId: 'unguardedHoverPseudoElement'}],
      output: null,
    },
  ],
});
