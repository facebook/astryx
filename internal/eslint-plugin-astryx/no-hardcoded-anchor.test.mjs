// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-hardcoded-anchor.test.mjs
 * @description Tests for the no-hardcoded-anchor ESLint rule.
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import noHardcodedAnchorRule from './no-hardcoded-anchor.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {jsx: true},
    },
  },
});

// RuleTester registers its own describe/it blocks internally, so it
// must run at the top level. Vitest 4 forbids calling suite functions
// (describe/it) from inside another it() callback.
ruleTester.run('no-hardcoded-anchor', noHardcodedAnchorRule, {
  valid: [
    // Using LinkComponent (the pattern we want)
    {code: '<LinkComponent href="/foo">text</LinkComponent>'},
    // In-page anchor with # href is allowed
    {code: '<a href="#section">Jump</a>'},
    // In-page anchor with template literal # href is allowed
    {code: '<a href={`#${id}`}>Jump</a>'},
    // Non-anchor elements are fine
    {code: '<button onClick={fn}>click</button>'},
    {code: '<div>content</div>'},
  ],
  invalid: [
    // Hardcoded <a> with dynamic href
    {
      code: '<a href={href}>link</a>',
      errors: [{messageId: 'hardcodedAnchor'}],
    },
    // Hardcoded <a> with string href
    {
      code: '<a href="/foo">link</a>',
      errors: [{messageId: 'hardcodedAnchor'}],
    },
    // Hardcoded <a> with no href
    {
      code: '<a onClick={fn}>link</a>',
      errors: [{messageId: 'hardcodedAnchor'}],
    },
  ],
});
