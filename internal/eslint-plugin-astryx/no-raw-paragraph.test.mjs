// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-raw-paragraph.test.mjs
 * @description Tests for the no-raw-paragraph ESLint rule.
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import noRawParagraphRule from './no-raw-paragraph.js';

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
ruleTester.run('no-raw-paragraph', noRawParagraphRule, {
  valid: [
    // <div> is the compositional default we want.
    {code: '<div>{children}</div>'},
    // Other phrasing/block elements are unaffected.
    {code: '<span>{text}</span>'},
    {code: '<section>{children}</section>'},
    // `as` defaulting to 'div' is correct.
    {code: 'function C({as: Component = "div"}) { return <Component/>; }'},
    {code: 'function C({as = "div"}) { return null; }'},
    // 'p' as an opt-in value (not a default) is allowed: it appears only
    // in the type union, never as the default the component renders.
    {code: 'const Tag = as ?? "div";'},
    {code: 'const Tag = as || "div";'},
    // A consumer passing as="p" is their choice — not flagged here (this
    // rule guards Astryx source defaults, not prop usage call sites).
    {code: '<Text as="p">{text}</Text>'},
  ],
  invalid: [
    // Raw <p> JSX.
    {
      code: '<p {...props}>{children}</p>',
      errors: [{messageId: 'rawParagraph'}],
    },
    {
      code: '<p>text</p>',
      errors: [{messageId: 'rawParagraph'}],
    },
    // `as` prop defaulting to 'p' (renamed).
    {
      code: 'function C({as: Component = "p"}) { return <Component/>; }',
      errors: [{messageId: 'defaultParagraph'}],
    },
    // `as` prop defaulting to 'p' (shorthand).
    {
      code: 'function C({as = "p"}) { return null; }',
      errors: [{messageId: 'defaultParagraph'}],
    },
    // Defaulting via nullish/or fallback expression.
    {
      code: 'const Tag = as ?? "p";',
      errors: [{messageId: 'defaultParagraph'}],
    },
    {
      code: 'const Tag = as || "p";',
      errors: [{messageId: 'defaultParagraph'}],
    },
  ],
});
