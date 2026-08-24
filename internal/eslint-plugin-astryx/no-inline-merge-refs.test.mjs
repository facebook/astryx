// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-inline-merge-refs.test.mjs
 */

import {RuleTester} from 'eslint';
import rule from './no-inline-merge-refs.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

ruleTester.run('no-inline-merge-refs', rule, {
  valid: [
    {
      code: `
        import {useMergedRefs} from '../hooks';
        const ref = useMergedRefs(forwardedRef, internalRef);
        <div ref={ref} />;
      `,
    },
    {
      code: `
        import {useMergedRefs} from '../hooks';
        <div ref={useMergedRefs(forwardedRef, internalRef)} />;
      `,
    },
    {
      code: `
        import {mergeRefs} from '../utils';
        function createRef() {
          const ref = mergeRefs(forwardedRef, internalRef);
          return ref;
        }
      `,
    },
    {
      code: `
        function mergeRefs() {}
        <div ref={mergeRefs(forwardedRef, internalRef)} />;
      `,
    },
    {
      code: '<div ref={callbackRef} />;',
    },
  ],
  invalid: [
    {
      code: `
        import {mergeRefs} from '../utils';
        <div ref={mergeRefs(forwardedRef, internalRef)} />;
      `,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `
        import {mergeRefs as combineRefs} from '@astryxdesign/core/utils';
        <div ref={combineRefs(forwardedRef, internalRef)} />;
      `,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `
        import {mergeRefs} from '../utils';
        <div
          ref={enabled ? mergeRefs(forwardedRef, internalRef) : forwardedRef}
        />;
      `,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `
        import {useMergedRefs} from '../hooks';
        useMergedRefs(forwardedRef, node => setNode(node));
      `,
      errors: [{messageId: 'stableInput'}],
    },
    {
      code: `
        import {useMergedRefs as combineRefs} from '@astryxdesign/core/hooks';
        combineRefs(forwardedRef, function (node) { setNode(node); });
      `,
      errors: [{messageId: 'stableInput'}],
    },
  ],
});

console.log('All tests passed!');
