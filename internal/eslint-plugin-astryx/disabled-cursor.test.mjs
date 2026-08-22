// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file disabled-cursor.test.mjs
 */

import {RuleTester} from 'eslint';
import rule from './disabled-cursor.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

const GUARD = ':is(:disabled,[aria-disabled="true"])';

ruleTester.run('disabled-cursor', rule, {
  valid: [
    // The guarded form.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          trigger: {
            cursor: {default: 'pointer', '${GUARD}': 'default'},
          },
        });
      `,
    },
    // A hand-written condition that names the disabled state its own way.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          trigger: {
            cursor: {default: 'grab', ':disabled': 'default'},
          },
        });
      `,
    },
    // The disabled cursor itself is the one value that needs no guard.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          disabled: {cursor: 'default'},
        });
      `,
    },
    // A computed value is out of scope — the sweep measures it instead.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          handle: (interactive) => ({cursor: interactive ? 'grab' : undefined}),
        });
      `,
    },
    // Outside stylex.create this is not a style declaration at all.
    {
      code: `const options = {cursor: 'pointer'};`,
    },
  ],
  invalid: [
    // The plain declaration becomes the conditional form.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          trigger: {cursor: 'pointer'},
        });
      `,
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          trigger: {cursor: {default: 'pointer', '${GUARD}': 'default'}},
        });
      `,
      errors: [{messageId: 'unguardedCursor'}],
    },
    // An existing condition keeps its branches; the guard joins them.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          handle: {
            cursor: {
              default: 'col-resize',
              ':active': 'grabbing',
            },
          },
        });
      `,
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          handle: {
            cursor: {
              default: 'col-resize',
              ':active': 'grabbing', '${GUARD}': 'default',
            },
          },
        });
      `,
      errors: [{messageId: 'unguardedCursor'}],
    },
    // A flat value in a `disabled` style is the shape that defeats a guard
    // written on the base: StyleX replaces the whole property on merge, so
    // even a `disabled` style has to spell the condition out.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          disabled: {cursor: 'inherit'},
        });
      `,
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          disabled: {cursor: {default: 'inherit', '${GUARD}': 'default'}},
        });
      `,
      errors: [{messageId: 'unguardedCursor'}],
    },
    // No trailing comma: the fix has to supply the separator itself.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          field: {cursor: {default: 'text'}},
        });
      `,
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          field: {cursor: {default: 'text', '${GUARD}': 'default'}},
        });
      `,
      errors: [{messageId: 'unguardedCursor'}],
    },
    // The hover guard names :disabled to EXCLUDE it, so it does not count.
    {
      code: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {
            cursor: {
              default: 'pointer',
              ':hover:where(:not(:disabled,[aria-disabled="true"]))': 'pointer',
            },
          },
        });
      `,
      output: `
        import * as stylex from '@stylexjs/stylex';
        const styles = stylex.create({
          item: {
            cursor: {
              default: 'pointer',
              ':hover:where(:not(:disabled,[aria-disabled="true"]))': 'pointer', '${GUARD}': 'default',
            },
          },
        });
      `,
      errors: [{messageId: 'unguardedCursor'}],
    },
  ],
});

console.log('disabled-cursor: all tests passed');
