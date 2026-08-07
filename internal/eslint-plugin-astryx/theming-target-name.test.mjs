// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theming-target-name.test.mjs
 * @description Tests for the theming-target-name ESLint rule.
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import rule from './theming-target-name.js';

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
import {Icon} from '../Icon';
import {CheckboxInput} from '../CheckboxInput';
import {Divider} from '../Divider';
import {Item} from '../Item';
import {themeProps, mergeProps} from '../utils';
`;

const filename = 'packages/core/src/Selector/Selector.tsx';

ruleTester.run('theming-target-name', rule, {
  valid: [
    // {parent}-{position}-{component}: position `clear`, component `icon`.
    {
      code: `${setup} const a = <Icon icon="close" {...themeProps('selector-clear-icon')} />;`,
      filename,
    },
    // The component slot may be multi-word.
    {
      code: `${setup} const a = <CheckboxInput label="" {...themeProps('multi-selector-option-checkbox')} />;`,
      filename,
    },
    {
      code: `${setup} const a = <Divider {...themeProps('dropdown-menu-section-divider')} />;`,
      filename,
    },
    // Host elements are not held to the component slot — there is no composed
    // component to name.
    {
      code: `${setup} const a = <span {...themeProps('selector-check')} />;`,
      filename,
    },
    // Row/container primitives are out of the slot vocabulary on purpose:
    // principle 3 makes `{component}-option` the right name everywhere.
    {
      code: `${setup} const a = <Item {...themeProps('selector-option')} />;`,
      filename,
    },
    // The component's own root target names the component, not a position.
    {
      code: `${setup} const a = <Icon icon="x" {...themeProps('selector')} />;`,
      filename,
    },
    {
      code: `${setup} const a = <Icon icon="x" {...themeProps('empty-state')} />;`,
      filename: 'packages/core/src/EmptyState/EmptyState.tsx',
    },
    // A state word that is not the last segment is just a word.
    {
      code: `${setup} const a = <span {...themeProps('calendar-selected-day')} />;`,
      filename,
    },
    // Grandfathered.
    {
      code: `${setup} const a = <Icon icon="check" {...themeProps('selector-check')} />;`,
      filename,
      options: [{allowTargets: ['selector-check']}],
    },
  ],

  invalid: [
    // #4627's shape: an appearance word where the component belongs.
    {
      code: `${setup} const a = <Icon icon="check" {...themeProps('selector-check')} />;`,
      filename,
      errors: [
        {
          messageId: 'appearanceInComponentSlot',
          data: {
            target: 'selector-check',
            component: 'Icon',
            slot: 'check',
            expected: 'icon',
          },
        },
      ],
    },
    // Names the component, but has no position segment.
    {
      code: `${setup} const a = <Icon icon="x" {...themeProps('selector-icon')} />;`,
      filename,
      errors: [
        {
          messageId: 'missingPosition',
          data: {
            target: 'selector-icon',
            component: 'Icon',
            slot: 'icon',
          },
        },
      ],
    },
    // State minted as its own sub-target.
    {
      code: `${setup} const a = <span {...themeProps('selector-option-selected')} />;`,
      filename,
      errors: [
        {
          messageId: 'stateSubTarget',
          data: {
            target: 'selector-option-selected',
            state: 'selected',
            base: 'selector-option',
          },
        },
      ],
    },
    {
      code: `${setup} const a = <span {...themeProps('selector-trigger-disabled')} />;`,
      filename,
      errors: [{messageId: 'stateSubTarget'}],
    },
    // The alias table: CheckboxInput's slot is `checkbox`.
    {
      code: `${setup} const a = <CheckboxInput label="" {...themeProps('multi-selector-option-tick')} />;`,
      filename,
      errors: [
        {
          messageId: 'appearanceInComponentSlot',
          data: {
            target: 'multi-selector-option-tick',
            component: 'CheckboxInput',
            slot: 'tick',
            expected: 'checkbox',
          },
        },
      ],
    },
  ],
});
