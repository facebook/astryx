// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-unstable-merged-refs.test.mjs
 */

import {RuleTester} from 'eslint';
import tsParser from '@typescript-eslint/parser';
import rule from './no-unstable-merged-refs.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tsParser,
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

ruleTester.run('no-unstable-merged-refs', rule, {
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
        import {mergeRefs} from '../utils';
        const mergedRef = mergeRefs(forwardedRef, internalRef);
        function Component({mergedRef}) {
          return <div ref={mergedRef} />;
        }
      `,
    },
    {
      code: `
        import {mergeRefs} from '../utils';
        const mergedRef = mergeRefs(forwardedRef, internalRef);
        function Component() {
          return <div ref={mergedRef} />;
        }
      `,
    },
    {
      code: `
        import {mergeRefs} from '../utils';
        function Component(mergeRefs) {
          const mergedRef = mergeRefs(forwardedRef, internalRef);
          return <div ref={mergedRef} />;
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
        import {mergeRefs} from '../utils';
        function Component() {
          const mergedRef = mergeRefs(forwardedRef, internalRef);
          return <div ref={mergedRef} />;
        }
      `,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `
        import {mergeRefs as combineRefs} from '@astryxdesign/core/utils';
        function Component() {
          const mergedRef = combineRefs(forwardedRef, internalRef);
          return <div ref={enabled ? mergedRef : forwardedRef} />;
        }
      `,
      errors: [{messageId: 'useHook'}],
    },
    {
      code: `
        import {mergeRefs} from '../utils';
        function Component() {
          const mergedRef = mergeRefs(
            forwardedRef,
            internalRef,
          ) as React.Ref<HTMLDivElement>;
          return <div ref={mergedRef!} />;
        }
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
