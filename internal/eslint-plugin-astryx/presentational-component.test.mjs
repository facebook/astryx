// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file presentational-component.test.mjs
 * Tests for the presentational-component ESLint rule
 */

import {RuleTester} from 'eslint';
import presentationalComponentRule from './presentational-component.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {jsx: true},
    },
  },
});

ruleTester.run('presentational-component', presentationalComponentRule, {
  valid: [
    // Non-presentational component — anything goes
    {
      code: `
        import {useState} from 'react';
        export function Button() {
          const [x, setX] = useState(0);
          return <button>{x}</button>;
        }
      `,
      filename: 'packages/core/src/Button/Button.tsx',
    },
    // Presentational component — allowed hooks (useId, useMemo, useCallback, useContext)
    {
      code: `
        import {useId, useMemo, useCallback, useContext} from 'react';
        export function Badge({label}) {
          const id = useId();
          const style = useMemo(() => ({}), []);
          const handler = useCallback(() => {}, []);
          const theme = useContext(ThemeContext);
          return <span id={id}>{label}</span>;
        }
      `,
      filename: 'packages/core/src/Badge/Badge.tsx',
    },
    // Presentational component — no hooks at all
    {
      code: `
        export function StatusDot({color}) {
          return <span style={{backgroundColor: color}} />;
        }
      `,
      filename: 'packages/core/src/StatusDot/StatusDot.tsx',
    },
    // File not in presentational list — anything goes
    {
      code: `
        import {useState, useEffect, createContext} from 'react';
        export function Table() {
          const [data, setData] = useState([]);
          useEffect(() => {}, []);
          return <table />;
        }
      `,
      filename: 'packages/core/src/Table/Table.tsx',
    },
  ],
  invalid: [
    // useState in presentational component
    {
      code: `
        import {useState} from 'react';
        export function Badge() {
          const [x, setX] = useState(0);
          return <span>{x}</span>;
        }
      `,
      filename: 'packages/core/src/Badge/Badge.tsx',
      errors: [{messageId: 'remembers'}],
    },
    // useReducer in presentational component
    {
      code: `
        import {useReducer} from 'react';
        export function Card() {
          const [state, dispatch] = useReducer(reducer, {});
          return <div>{state.value}</div>;
        }
      `,
      filename: 'packages/core/src/Card/Card.tsx',
      errors: [{messageId: 'remembers'}],
    },
    // useTransition in presentational component
    {
      code: `
        import {useTransition} from 'react';
        export function Token() {
          const [isPending, startTransition] = useTransition();
          return <span>{isPending ? 'loading' : 'done'}</span>;
        }
      `,
      filename: 'packages/core/src/Token/Token.tsx',
      errors: [{messageId: 'remembers'}],
    },
    // useEffect in presentational component
    {
      code: `
        import {useEffect} from 'react';
        export function Divider() {
          useEffect(() => console.log('mounted'), []);
          return <hr />;
        }
      `,
      filename: 'packages/core/src/Divider/Divider.tsx',
      errors: [{messageId: 'watches'}],
    },
    // useRef in presentational component
    {
      code: `
        import {useRef} from 'react';
        export function Grid() {
          const ref = useRef(null);
          return <div ref={ref} />;
        }
      `,
      filename: 'packages/core/src/Grid/Grid.tsx',
      errors: [{messageId: 'watches'}],
    },
    // ResizeObserver in presentational component
    {
      code: `
        export function Stack() {
          const observer = new ResizeObserver(() => {});
          return <div />;
        }
      `,
      filename: 'packages/core/src/Stack/Stack.tsx',
      errors: [{messageId: 'watches'}],
    },
    // createContext in presentational component
    {
      code: `
        import {createContext} from 'react';
        const MyContext = createContext(null);
        export function Section() {
          return <MyContext.Provider value={{}}><div /></MyContext.Provider>;
        }
      `,
      filename: 'packages/core/src/Section/Section.tsx',
      errors: [{messageId: 'coordinates'}],
    },
    // React.useState form
    {
      code: `
        import React from 'react';
        export function Center() {
          const [x, setX] = React.useState(0);
          return <div>{x}</div>;
        }
      `,
      filename: 'packages/core/src/Center/Center.tsx',
      errors: [{messageId: 'remembers'}],
    },
  ],
});

console.log('✓ presentational-component rule tests passed');
