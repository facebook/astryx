// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-wrapper-transform.test.mjs
 * @description Tests for the no-wrapper-transform ESLint rule.
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import noWrapperTransformRule from './no-wrapper-transform.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {jsx: true},
      sourceType: 'module',
    },
  },
});

/** An Astryx import plus a local style table covering each shape under test. */
const setup = `
import * as stylex from '@stylexjs/stylex';
import {Icon} from '../Icon';
const styles = stylex.create({
  chevron: {display: 'flex', alignItems: 'center'},
  chevronOpen: {transform: 'rotate(180deg)'},
  chevronRtl: {transform: {default: 'rotate(90deg)', ':is([dir="rtl"] *)': 'scaleX(-1) rotate(90deg)'}},
  rotateProp: {rotate: '45deg'},
  box: {width: 16, height: 16},
  sized: (n) => ({transform: 'rotate(' + n + 'deg)'}),
});
`;

const error = [{messageId: 'wrapperTransform'}];

ruleTester.run('no-wrapper-transform', noWrapperTransformRule, {
  valid: [
    // The transform is already on the component — the shape we want.
    {
      code: `${setup} const A = () => <Icon icon="chevronDown" xstyle={[styles.chevron, styles.chevronOpen]} />;`,
    },
    // Wrapper styles it, but with no transform: no-style-only-wrapper's job.
    {
      code: `${setup} const A = () => <span {...stylex.props(styles.box)}><Icon icon="x" /></span>;`,
    },
    // A transform around arbitrary content is not the glyph pattern.
    {
      code: `${setup} const A = () => <span {...stylex.props(styles.chevronOpen)}>text</span>;`,
    },
    // More than one child: the wrapper is positioning a group, not a glyph.
    {
      code: `${setup} const A = () => <span {...stylex.props(styles.chevronOpen)}><Icon icon="a" /><Icon icon="b" /></span>;`,
    },
    // Not an Astryx component — the rule cannot assume it takes xstyle.
    {
      code: `${setup} const A = () => <span {...stylex.props(styles.chevronOpen)}><svg /></span>;`,
    },
    // An Astryx component that is not a glyph: the transform is positioning
    // the wrapper's own box (Carousel's floating button pill), so it stays.
    {
      code: `import * as stylex from '@stylexjs/stylex';
import {Button} from '../Button';
const styles = stylex.create({pill: {position: 'absolute', transform: 'translateX(-50%)'}});
const A = () => <div {...stylex.props(styles.pill)}><Button label="x" /></div>;`,
    },
    // Unresolvable style: left alone rather than guessed at.
    {
      code: `import * as stylex from '@stylexjs/stylex';
import {Icon} from '../Icon';
import {shared} from './shared.stylex';
const A = () => <span {...stylex.props(shared.mirror)}><Icon icon="x" /></span>;`,
    },
    // A bare identifier child that is not a useIcon() result.
    {
      code: `${setup} const A = ({node}) => <span {...stylex.props(styles.chevronOpen)}>{node}</span>;`,
    },
    // Exempt file.
    {
      code: `${setup} const A = () => <span {...stylex.props(styles.chevronOpen)}><Icon icon="x" /></span>;`,
      filename: '/repo/packages/core/src/Legacy/Legacy.tsx',
      options: [{allowFiles: ['/Legacy/']}],
    },
  ],

  invalid: [
    // The core case: rotation on the wrapper, glyph inside.
    {
      code: `${setup} const A = () => <span {...stylex.props(styles.chevronOpen)}><Icon icon="chevronDown" /></span>;`,
      errors: error,
    },
    // Conditional rotation — the branch carrying the transform is enough.
    {
      code: `${setup} const A = ({isOpen}) => <span {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)}><Icon icon="chevronDown" /></span>;`,
      errors: error,
    },
    // Ternary between two transform states.
    {
      code: `${setup} const A = ({isOpen}) => <span {...stylex.props(isOpen ? styles.chevronOpen : styles.chevron)}><Icon icon="chevronDown" /></span>;`,
      errors: error,
    },
    // Still reported when the wrapper ALSO does layout — this is exactly the
    // case no-style-only-wrapper exempts, and the transform still belongs on
    // the child.
    {
      code: `${setup} const A = () => <span {...stylex.props(styles.chevron, styles.box, styles.chevronOpen)}><Icon icon="chevronDown" /></span>;`,
      errors: error,
    },
    // The RTL-folded transform shape.
    {
      code: `${setup} const A = () => <span {...stylex.props(styles.chevronRtl)}><Icon icon="chevronDown" /></span>;`,
      errors: error,
    },
    // Standalone `rotate` longhand, not just the `transform` shorthand.
    {
      code: `${setup} const A = () => <span {...stylex.props(styles.rotateProp)}><Icon icon="chevronDown" /></span>;`,
      errors: error,
    },
    // Dynamic style function.
    {
      code: `${setup} const A = ({deg}) => <span {...stylex.props(styles.sized(deg))}><Icon icon="chevronDown" /></span>;`,
      errors: error,
    },
    // The useIcon() registry-glyph pattern: the wrapper IS the icon element.
    {
      code: `${setup} const A = () => { const chevronIcon = useIcon('chevronDown'); return <span {...stylex.props(styles.chevronOpen)}>{chevronIcon}</span>; };`,
      errors: error,
    },
    // div wrappers too.
    {
      code: `${setup} const A = () => <div {...stylex.props(styles.chevronOpen)}><Icon icon="chevronDown" /></div>;`,
      errors: error,
    },
  ],
});
