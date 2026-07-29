// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file require-xstyle-passthrough.test.mjs
 * @description Tests for the require-xstyle-passthrough ESLint rule.
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import rule from './require-xstyle-passthrough.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

ruleTester.run('require-xstyle-passthrough', rule, {
  valid: [
    // ✅ xstyle destructured and threaded into stylex.props on the root.
    {
      code: `
        interface FooProps extends BaseProps<HTMLDivElement> {}
        function Foo({xstyle}: FooProps) {
          return <div {...stylex.props(styles.root, xstyle)} />;
        }
        Foo.displayName = 'Foo';
      `,
    },
    // ✅ xstyle threaded via mergeProps.
    {
      code: `
        interface FooProps extends BaseProps<HTMLDivElement> {}
        function Foo({xstyle}: FooProps) {
          return <div {...mergeProps(themeProps('foo'), stylex.props(styles.root, xstyle))} />;
        }
        Foo.displayName = 'Foo';
      `,
    },
    // ✅ xstyle forwarded to a composed Astryx component via xstyle={...}.
    {
      code: `
        interface FooProps extends BaseProps<HTMLButtonElement> {}
        function Foo({xstyle}: FooProps) {
          return <Button xstyle={xstyle} />;
        }
        Foo.displayName = 'Foo';
      `,
    },
    // ✅ xstyle not destructured but rest spread onto a composed component,
    //    which accepts xstyle via its own BaseProps.
    {
      code: `
        interface FooProps extends BaseProps<HTMLButtonElement> {}
        function Foo({label, ...rest}: FooProps) {
          return <Button label={label} {...rest} />;
        }
        Foo.displayName = 'Foo';
      `,
    },
    // ✅ Explicit opt-out via Omit<BaseProps, 'xstyle'>.
    {
      code: `
        interface FooProps extends Omit<BaseProps<HTMLElement>, 'xstyle'> {}
        function Foo({as: Comp = 'span'}: FooProps) {
          return <Comp {...stylex.props(styles.root)} />;
        }
        Foo.displayName = 'Foo';
      `,
    },
    // ✅ className renamed with leading underscore = intentionally unused.
    {
      code: `
        interface FooProps extends BaseProps<HTMLButtonElement> {}
        function Foo({xstyle, className: _className, style}: FooProps) {
          return <Button xstyle={xstyle} style={style} />;
        }
        Foo.displayName = 'Foo';
      `,
    },
    // ✅ Internal helper (no displayName) reusing a props type is not checked.
    {
      code: `
        interface FooProps extends BaseProps<HTMLDivElement> {}
        function InternalHelper({label}: FooProps) {
          return <div {...stylex.props(styles.root)} />;
        }
      `,
    },
    // ✅ Props type does not extend BaseProps → not checked.
    {
      code: `
        interface FooProps {label: string;}
        function Foo({label}: FooProps) {
          return <div>{label}</div>;
        }
        Foo.displayName = 'Foo';
      `,
    },
    // ✅ Pick that includes xstyle and forwards it.
    {
      code: `
        interface FooProps extends Pick<BaseProps, 'xstyle'> {}
        function Foo({xstyle}: FooProps) {
          return <div {...stylex.props(styles.root, xstyle)} />;
        }
        Foo.displayName = 'Foo';
      `,
    },
    // ✅ Pick that does NOT include xstyle → opt-out.
    {
      code: `
        interface FooProps extends Pick<BaseProps, 'className' | 'style'> {}
        function Foo({className, style}: FooProps) {
          return <div className={className} style={style} />;
        }
        Foo.displayName = 'Foo';
      `,
    },
    // ✅ displayName assigned via cast form.
    {
      code: `
        interface FooProps extends BaseProps<HTMLInputElement> {}
        const Foo = function Foo({xstyle}: FooProps) {
          return <input {...stylex.props(styles.root, xstyle)} />;
        };
        (Foo as {displayName?: string}).displayName = 'Foo';
      `,
    },
  ],
  invalid: [
    // ❌ xstyle destructured but never used (dropped).
    {
      code: `
        interface FooProps extends BaseProps<HTMLDivElement> {}
        function Foo({xstyle}: FooProps) {
          return <div {...stylex.props(styles.root)} />;
        }
        Foo.displayName = 'Foo';
      `,
      errors: [{messageId: 'unusedStylingProp'}],
    },
    // ❌ xstyle rides ...rest onto a native DOM element (inert).
    {
      code: `
        interface FooProps extends BaseProps<HTMLButtonElement> {}
        function Foo({label, ...rest}: FooProps) {
          return <button {...rest} {...stylex.props(styles.root)}>{label}</button>;
        }
        Foo.displayName = 'Foo';
      `,
      errors: [{messageId: 'xstyleDropped'}],
    },
    // ❌ xstyle never destructured and no rest at all (dropped).
    {
      code: `
        interface FooProps extends BaseProps<HTMLDivElement> {}
        function Foo({label}: FooProps) {
          return <div {...stylex.props(styles.root)}>{label}</div>;
        }
        Foo.displayName = 'Foo';
      `,
      errors: [{messageId: 'xstyleDropped'}],
    },
    // ❌ className destructured but unused.
    {
      code: `
        interface FooProps extends BaseProps<HTMLDivElement> {}
        function Foo({xstyle, className}: FooProps) {
          return <div {...stylex.props(styles.root, xstyle)} />;
        }
        Foo.displayName = 'Foo';
      `,
      errors: [{messageId: 'unusedStylingProp'}],
    },
    // ❌ Omit that removes a different key still carries xstyle → must forward.
    {
      code: `
        interface FooProps extends Omit<BaseProps<HTMLDivElement>, 'onChange'> {}
        function Foo({value}: FooProps) {
          return <div {...stylex.props(styles.root)}>{value}</div>;
        }
        Foo.displayName = 'Foo';
      `,
      errors: [{messageId: 'xstyleDropped'}],
    },
  ],
});
