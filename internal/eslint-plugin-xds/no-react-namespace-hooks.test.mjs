/**
 * @file no-react-namespace-hooks.test.mjs
 */

import {RuleTester} from 'eslint';
import rule from './no-react-namespace-hooks.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

ruleTester.run('no-react-namespace-hooks', rule, {
  valid: [
    // Direct import and call
    {
      code: `
        import { useEffect } from 'react';
        useEffect(() => {}, []);
      `,
    },
    // Multiple direct imports
    {
      code: `
        import { useState, useCallback, useMemo } from 'react';
        const [v, setV] = useState(0);
        const cb = useCallback(() => {}, []);
        const m = useMemo(() => v, [v]);
      `,
    },
    // React.createElement is fine (not a hook)
    {
      code: `
        import React from 'react';
        React.createElement('div');
      `,
    },
    // React.forwardRef is fine (not a hook)
    {
      code: `
        import React from 'react';
        React.forwardRef((props, ref) => null);
      `,
    },
    // React.memo is fine (not a hook)
    {
      code: `
        import React from 'react';
        React.memo(() => null);
      `,
    },
    // Custom hook call is fine
    {
      code: `
        import { useMyHook } from './hooks';
        useMyHook();
      `,
    },
    // Non-React namespace is fine
    {
      code: `
        const React = { useEffect: () => {} };
      `,
    },
  ],
  invalid: [
    // React.useEffect
    {
      code: `
        import React from 'react';
        React.useEffect(() => {}, []);
      `,
      output: `
        import React from 'react';
        useEffect(() => {}, []);
      `,
      errors: [{messageId: 'noNamespaceHook', data: {hook: 'useEffect'}}],
    },
    // React.useState
    {
      code: `
        import React from 'react';
        const [v, setV] = React.useState(0);
      `,
      output: `
        import React from 'react';
        const [v, setV] = useState(0);
      `,
      errors: [{messageId: 'noNamespaceHook', data: {hook: 'useState'}}],
    },
    // React.useCallback
    {
      code: `
        import React from 'react';
        const cb = React.useCallback(() => {}, []);
      `,
      output: `
        import React from 'react';
        const cb = useCallback(() => {}, []);
      `,
      errors: [{messageId: 'noNamespaceHook', data: {hook: 'useCallback'}}],
    },
    // React.useMemo
    {
      code: `
        import React from 'react';
        const val = React.useMemo(() => 42, []);
      `,
      output: `
        import React from 'react';
        const val = useMemo(() => 42, []);
      `,
      errors: [{messageId: 'noNamespaceHook', data: {hook: 'useMemo'}}],
    },
    // React.useContext
    {
      code: `
        import React from 'react';
        const ctx = React.useContext(MyContext);
      `,
      output: `
        import React from 'react';
        const ctx = useContext(MyContext);
      `,
      errors: [{messageId: 'noNamespaceHook', data: {hook: 'useContext'}}],
    },
    // React.useRef
    {
      code: `
        import React from 'react';
        const ref = React.useRef(null);
      `,
      output: `
        import React from 'react';
        const ref = useRef(null);
      `,
      errors: [{messageId: 'noNamespaceHook', data: {hook: 'useRef'}}],
    },
    // React.useId
    {
      code: `
        import React from 'react';
        const id = React.useId();
      `,
      output: `
        import React from 'react';
        const id = useId();
      `,
      errors: [{messageId: 'noNamespaceHook', data: {hook: 'useId'}}],
    },
    // Multiple violations in one file
    {
      code: `
        import React from 'react';
        React.useEffect(() => {}, []);
        React.useState(0);
      `,
      output: `
        import React from 'react';
        useEffect(() => {}, []);
        useState(0);
      `,
      errors: [
        {messageId: 'noNamespaceHook', data: {hook: 'useEffect'}},
        {messageId: 'noNamespaceHook', data: {hook: 'useState'}},
      ],
    },
  ],
});

console.log('All tests passed!');
