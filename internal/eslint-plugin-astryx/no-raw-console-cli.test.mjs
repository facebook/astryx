// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-raw-console-cli.test.mjs
 */

import {RuleTester} from 'eslint';
import rule from './no-raw-console-cli.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

ruleTester.run('no-raw-console-cli', rule, {
  valid: [
    // console.error is allowed (stderr — never corrupts --json stdout)
    {
      code: `console.error('boom');`,
      filename: '/repo/packages/cli/src/commands/search.mjs',
    },
    // console.warn is allowed (stderr)
    {
      code: `console.warn('heads up');`,
      filename: '/repo/packages/cli/src/commands/search.mjs',
    },
    // humanLog is the sanctioned json-aware stdout primitive
    {
      code: `import {humanLog} from '../lib/json.mjs'; humanLog('hi');`,
      filename: '/repo/packages/cli/src/commands/search.mjs',
    },
    // Exempt: lib/json.mjs defines the raw writers
    {
      code: `console.log('raw');`,
      filename: '/repo/packages/cli/src/lib/json.mjs',
    },
    // Exempt: index.mjs (wiring / banner)
    {
      code: `console.log('banner');`,
      filename: '/repo/packages/cli/src/index.mjs',
    },
    // Exempt: bin/astryx.mjs (entrypoint / error boundary)
    {
      code: `console.log('raw');`,
      filename: '/repo/packages/cli/bin/astryx.mjs',
    },
    // Exemption is path-suffix based and tolerant of Windows separators
    {
      code: `console.log('raw');`,
      filename: 'C:\\repo\\packages\\cli\\src\\lib\\json.mjs',
    },
  ],
  invalid: [
    // Bare console.log -> humanLog
    {
      code: `console.log('hello');`,
      filename: '/repo/packages/cli/src/commands/search.mjs',
      output: `humanLog('hello');`,
      errors: [{messageId: 'noRawConsoleLog'}],
    },
    // Member access preserved, only the callee renamed
    {
      code: `console.log(\`a \${b}\`);`,
      filename: '/repo/packages/cli/src/api/component.mjs',
      output: `humanLog(\`a \${b}\`);`,
      errors: [{messageId: 'noRawConsoleLog'}],
    },
    // Multiple violations
    {
      code: `console.log('a'); console.log('b');`,
      filename: '/repo/packages/cli/src/commands/init.mjs',
      output: `humanLog('a'); humanLog('b');`,
      errors: [
        {messageId: 'noRawConsoleLog'},
        {messageId: 'noRawConsoleLog'},
      ],
    },
  ],
});

console.log('All tests passed!');
