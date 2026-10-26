// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-core-internal-import.test.mjs
 */

import {RuleTester} from 'eslint';
import rule from './no-core-internal-import.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

const message = source =>
  `'${source}' is one of Core's internal subpaths, reserved for Astryx's own packages (Core and Lab) and outside the compatibility promise. Use Core's public API instead.`;

ruleTester.run('no-core-internal-import', rule, {
  valid: [
    // Core's public subpaths stay open.
    {code: `import {List} from '@astryxdesign/core/List';`},
    {code: `import {createReorderable} from '@astryxdesign/core/reorderable';`},
    // A path that only contains the word is not the internal subpath.
    {code: `import {x} from '@astryxdesign/core/internalization';`},
    {code: `import {x} from './internal/reorder';`},
  ],
  invalid: [
    {
      code: `import {useReorderSession} from '@astryxdesign/core/internal/reorder';`,
      errors: [{message: message('@astryxdesign/core/internal/reorder')}],
    },
    {
      code: `export {useReorderSession} from '@astryxdesign/core/internal/reorder';`,
      errors: [{message: message('@astryxdesign/core/internal/reorder')}],
    },
    {
      code: `export * from '@astryxdesign/core/internal/touch';`,
      errors: [{message: message('@astryxdesign/core/internal/touch')}],
    },
    {
      code: `const m = import('@astryxdesign/core/internal/reorder');`,
      errors: [{message: message('@astryxdesign/core/internal/reorder')}],
    },
    {
      code: `import '@astryxdesign/core/internal';`,
      errors: [{message: message('@astryxdesign/core/internal')}],
    },
  ],
});
