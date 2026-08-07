// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeprops-reflection.test.mjs
 * @description Tests for the themeprops-reflection ESLint rule.
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import rule from './themeprops-reflection.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {jsx: true},
      sourceType: 'module',
    },
  },
});

const setup = `
import * as stylex from '@stylexjs/stylex';
import {Divider} from '../Divider';
import {themeProps, mergeProps} from '../utils';
const styles = stylex.create({root: {backgroundColor: 'red'}});
`;

ruleTester.run('themeprops-reflection', rule, {
  valid: [
    // The whole result is spread — class token and data-* together.
    {code: `${setup} const a = <div {...themeProps('card', {variant})} />;`},
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('card', {variant}), stylex.props(styles.root))} />;`,
    },
    // Spread onto a composed component, which forwards the attributes.
    {code: `${setup} const a = <Divider {...themeProps('x-divider')} />;`},
    // A test hook is not theming state.
    {
      code: `${setup} const a = <div data-testid="x" {...themeProps('card')} />;`,
    },
    // An identity/query hook the component's own JS reads is not state.
    {
      code: `${setup} const a = <div data-value={value} {...themeProps('card')} />;`,
    },
    // State on an element with no target of its own is out of scope.
    {code: `${setup} const a = <div data-state="open" />;`},
    // The spread comes last, so nothing overwrites the target.
    {
      code: `${setup} const a = <div className={className} {...themeProps('card')} />;`,
    },
    // Allowlisted.
    {
      code: `${setup} const a = <div data-state="open" {...themeProps('card')} />;`,
      options: [{allowDataAttributes: ['data-state']}],
    },
  ],

  invalid: [
    // The live bug: the props are passed, the attributes never render.
    {
      code: `${setup} const a = <Divider className={themeProps('x-divider', {size}).className} />;`,
      errors: [
        {
          messageId: 'droppedStateReflection',
          data: {target: 'x-divider', props: 'size', first: 'size'},
        },
      ],
    },
    // #4628's shape: no props today, so nothing is lost yet — the weaker
    // message, because the shape is what turns into the bug.
    {
      code: `${setup} const a = <Divider className={themeProps('multi-selector-select-all-divider').className} />;`,
      errors: [
        {
          messageId: 'classNameOnly',
          data: {target: 'multi-selector-select-all-divider'},
        },
      ],
    },
    // The same read outside JSX — a hook assembling a props object.
    {
      code: `${setup} const props = {className: themeProps('tooltip').className};`,
      errors: [{messageId: 'classNameOnly', data: {target: 'tooltip'}}],
    },
    // Hand-authored state next to the target it should have flowed through.
    {
      code: `${setup} const a = <div data-state="open" {...themeProps('card')} />;`,
      errors: [
        {
          messageId: 'handAuthoredState',
          data: {attribute: 'data-state', target: 'card', key: 'state'},
        },
      ],
    },
    {
      code: `${setup} const a = <div {...themeProps('card')} data-selected={isSelected} />;`,
      errors: [
        {
          messageId: 'handAuthoredState',
          data: {attribute: 'data-selected', target: 'card', key: 'selected'},
        },
      ],
    },
    // ChatSendButton's shape: the later className wins, so the target never
    // renders at all when the consumer passes none.
    {
      code: `${setup} const a = <Divider {...themeProps('x-divider')} className={className} />;`,
      errors: [
        {
          messageId: 'clobberedByLaterProp',
          data: {attribute: 'className', target: 'x-divider'},
        },
      ],
    },
    // The class token built by hand, bypassing the reflection surface.
    {
      code: `${setup} const a = <div className={stableClassName('more-menu')} />;`,
      errors: [
        {messageId: 'bypassedThemeProps', data: {target: 'more-menu'}},
      ],
    },
  ],
});
