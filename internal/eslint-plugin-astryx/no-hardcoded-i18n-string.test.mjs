// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-hardcoded-i18n-string.test.mjs
 * @description Tests for the no-hardcoded-i18n-string ESLint rule, focused on
 * the call-argument surface (announce() live-region messages) plus a few
 * anchor cases for the pre-existing JSX-attribute surface.
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import noHardcodedI18nStringRule from './no-hardcoded-i18n-string.js';

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
ruleTester.run('no-hardcoded-i18n-string', noHardcodedI18nStringRule, {
  valid: [
    // --- Call arguments (announce) ---
    // t(...) result is the pattern we want
    {code: "announce(t('codeblock.announce.copied'));"},
    // Variables are fine — we can't know their provenance
    {code: 'announce(message);'},
    // Interpolation-only template has no literal chunk to translate
    {code: 'announce(`${count}`);'},
    // A ternary between two t() results is the pattern we want
    {
      code: "announce(cond ? t('a.b.c') : t('a.b.d'));",
    },
    // Empty string (used to clear the live region) is not user-facing
    {code: "announce('');"},
    // Identifier-shaped single lowercase word is not user-facing
    {code: "announce('copied');"},
    // No arguments
    {code: 'announce();'},
    // Only the configured callees are checked (default: announce)
    {code: "notify('Something happened');"},
    // Member calls are not matched (callee-name matching only)
    {code: "screenReader.announce('Copied');"},
    // Allowlisted string (grandfathered site awaiting its sweep PR)
    {
      code: "announce('Copied');",
      options: [{allowedCalleeStrings: ['Copied']}],
    },
    // Test files are ignored by the rule itself
    {
      code: "announce('Copied');",
      filename: 'CodeBlock.test.tsx',
    },
    // Stories are ignored by the rule itself
    {
      code: "announce('Copied');",
      filename: 'CodeBlock.stories.tsx',
    },
    // --- Pre-existing surfaces still behave ---
    {code: "<button aria-label={t('dialog.close')}>x</button>"},
  ],
  invalid: [
    // Plain hardcoded string
    {
      code: "announce('Copied');",
      errors: [{messageId: 'hardcodedCallArg'}],
    },
    {
      code: "announce('Selection cleared');",
      errors: [{messageId: 'hardcodedCallArg'}],
    },
    // Expression-free template literal is equivalent to a string literal
    {
      code: 'announce(`All selected`);',
      errors: [{messageId: 'hardcodedCallArg'}],
    },
    // Allowlist is exact-match — other strings still flagged
    {
      code: "announce('Removed item');",
      options: [{allowedCalleeStrings: ['Copied']}],
      errors: [{messageId: 'hardcodedCallArg'}],
    },
    // Custom callees option
    {
      code: "notify('Something happened');",
      options: [{callees: ['notify']}],
      errors: [{messageId: 'hardcodedCallArg'}],
    },
    // Ternary branches are walked, like an aria-label expression container
    {
      code: "announce(n === 0 ? 'No results found' : 'Results found');",
      errors: [
        {messageId: 'hardcodedCallArg'},
        {messageId: 'hardcodedCallArg'},
      ],
    },
    // Only the offending branch is reported
    {
      code: "announce(n === 0 ? t('a.b.empty') : 'Results found');",
      errors: [{messageId: 'hardcodedCallArg'}],
    },
    // Interpolated template: the literal chunks are still English
    {
      code: 'announce(`Added ${item.label}`);',
      errors: [{messageId: 'hardcodedCallArg'}],
    },
    {
      code: 'announce(`${count} of ${total} selected`);',
      errors: [{messageId: 'hardcodedCallArg'}],
    },
    // Fallback on the right of ?? / ||
    {
      code: "announce(emptyText ?? 'No results found');",
      errors: [{messageId: 'hardcodedCallArg'}],
    },
    // --- Pre-existing surfaces still behave ---
    {
      code: '<button aria-label="Close">x</button>',
      errors: [{messageId: 'hardcodedString'}],
    },
  ],
});
