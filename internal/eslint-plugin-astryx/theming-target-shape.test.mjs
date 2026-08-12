// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theming-target-shape.test.mjs
 * @description Tests for the theming-target-shape ESLint rule.
 */

import {RuleTester} from 'eslint';
import tseslint from 'typescript-eslint';
import rule from './theming-target-shape.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {jsx: true},
      sourceType: 'module',
    },
  },
});

/**
 * Preamble: the imports a component file has, plus a style table covering the
 * three buckets — paint, layout, and neither.
 */
const setup = `
import * as stylex from '@stylexjs/stylex';
import {Icon} from '../Icon';
import {CheckboxInput} from '../CheckboxInput';
import {themeProps, mergeProps} from '../utils';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
const styles = stylex.create({
  painted: {backgroundColor: 'red', borderRadius: 4},
  label: {fontWeight: '600', color: 'blue', overflow: 'hidden'},
  plainLabel: {overflow: 'hidden', minWidth: 0},
  dropdown: {boxSizing: 'border-box', maxHeight: 300, overflowY: 'auto', padding: 4},
  fade: {opacity: 1, transition: 'opacity 100ms'},
  row: {display: 'flex', alignItems: 'center'},
  rotated: {transform: 'rotate(180deg)'},
  selected: {backgroundColor: 'blue'},
  radius: {'--_card-radius': '4px'},
  hovered: {':hover': {backgroundColor: 'grey'}},
});
const sizeStyles = stylex.create({
  sm: {paddingBlock: 2},
  md: {paddingBlock: 4},
});
`;

const stateOptions = [{checkStateSurface: true}];

ruleTester.run('theming-target-shape', rule, {
  valid: [
    // A target on an element that paints — the shape the rule steers toward.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('card'), stylex.props(styles.painted))} />;`,
    },
    // Paint reached only through a pseudo-selector still counts.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('card'), stylex.props(styles.hovered))} />;`,
    },
    // focusOutlineProps.* forwards its arguments to stylex.props(), so the
    // styles it carries are the element's styles.
    {
      code: `${setup} const a = <button {...mergeProps(themeProps('card'), focusOutlineProps.focusVisible(styles.painted))} />;`,
    },
    // …and the ring it adds is itself paint, so a bare call is not "unstyled".
    {
      code: `${setup} const a = <button {...mergeProps(themeProps('card'), focusOutlineProps.focusWithin())} />;`,
    },
    // A target spread onto an Astryx component: the paint lives in the
    // component, which this file cannot see.
    {
      code: `${setup} const a = <Icon icon="check" {...themeProps('selector-option-icon')} />;`,
    },
    // No themeProps at all — not this rule's business.
    {code: `${setup} const a = <div {...stylex.props(styles.dropdown)} />;`},
    // An unresolvable style is unknown, not "no paint".
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('card'), stylex.props(mystery))} />;`,
    },
    // A custom property means the element feeds the derived-var pipeline.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('card'), stylex.props(styles.radius))} />;`,
    },
    // The consumer's xstyle is not the component's declared surface, but it
    // does mean "no styles here" is not a finding.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('card'), stylex.props(xstyle))} />;`,
    },
    // SVG paints through presentation attributes, not CSS.
    {
      code: `${setup} const a = <svg fill="none" {...themeProps('avatar-status-dot-glyph')} />;`,
    },
    // Two children: a layout container, not a wrapper minted for the target.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-row'), stylex.props(styles.painted))}><Icon icon="a" /><Icon icon="b" /></div>;`,
    },
    // A paint-free box around a HOST element is not the wrapper case — it is
    // reported as layout-only, not as a misplaced target.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-row'), stylex.props(styles.painted))}><span /></div>;`,
    },
    // Grandfathered by name.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('banner-icon'), stylex.props(styles.row))} />;`,
      options: [{allowTargets: ['banner-icon']}],
    },
    // A root target is out of scope unless checkRootTargets is on. The
    // filename gives the root name.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('card'), stylex.props(styles.row))} />;`,
      filename: 'packages/core/src/Card/Card.tsx',
    },
    // --- checkStateSurface ---
    // State that selects a paint style is exactly what a state seam is for.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option', {selected}), stylex.props(styles.painted, isSelected && styles.selected))} />;`,
      options: stateOptions,
    },
    // A size table the target already declares.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option', {size}), stylex.props(styles.painted, sizeStyles[size]))} />;`,
      options: stateOptions,
    },
    // --- render-prop fallback (on by default) ---
    // No render prop in play: an ordinary styled child is not this check's
    // business (the broad version is `checkInheritableHoisting`, off).
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option'), stylex.props(styles.painted))}><span {...stylex.props(styles.label)}>t</span></div>;`,
    },
    // The fallback declares nothing inheritable, so there is nothing to hoist.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option'), stylex.props(styles.painted))}>{renderOption ? renderOption(item) : <span {...stylex.props(styles.plainLabel)}>t</span>}</div>;`,
    },
    // No target on the ancestor: not a theming question.
    {
      code: `${setup} const a = <div {...stylex.props(styles.painted)}>{renderOption ? renderOption(item) : <span {...stylex.props(styles.label)}>t</span>}</div>;`,
    },
    // The fallback is a composed component; its styles are not in this file.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option'), stylex.props(styles.painted))}>{renderOption ? renderOption(item) : <Icon icon="x" />}</div>;`,
    },
    // Off by default, even though the state only moves layout.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-indicator', {state}), stylex.props(styles.painted, isOpen && styles.rotated))} />;`,
    },
  ],

  invalid: [
    // The flagship: a target on a box that only lays out. (#4756's shape.)
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('selector-dropdown'), stylex.props(styles.dropdown))} />;`,
      errors: [
        {
          messageId: 'layoutOnlyTarget',
          data: {
            target: 'selector-dropdown',
            properties: 'boxSizing, maxHeight, overflowY, padding',
          },
        },
      ],
    },
    // Motion and opacity are not paint either: there is still nothing to
    // restyle on this element.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-overlay'), stylex.props(styles.fade))} />;`,
      errors: [{messageId: 'layoutOnlyTarget'}],
    },
    // The target belongs on the component the wrapper holds. (#4628's shape.)
    {
      code: `${setup} const a = <div inert {...mergeProps(themeProps('x-option-checkbox'), stylex.props(styles.row))}><CheckboxInput label="" /></div>;`,
      errors: [
        {
          messageId: 'wrapperTarget',
          data: {
            target: 'x-option-checkbox',
            wrapper: 'div',
            component: 'CheckboxInput',
          },
        },
      ],
    },
    // A wrapper with no styles at all is still a wrapper.
    {
      code: `${setup} const a = <div {...themeProps('power-search')}><Icon icon="x" /></div>;`,
      errors: [{messageId: 'wrapperTarget'}],
    },
    // Nothing wrapped, nothing styled: the target has no surface.
    {
      code: `${setup} const a = <div {...themeProps('x-slot')}>text</div>;`,
      errors: [{messageId: 'unstyledTarget', data: {target: 'x-slot'}}],
    },
    // Both targets on one element are reported.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option'), themeProps('x-select-all'), stylex.props(styles.row))} />;`,
      errors: [
        {messageId: 'layoutOnlyTarget', data: {target: 'x-option', properties: 'display, alignItems'}},
        {messageId: 'layoutOnlyTarget', data: {target: 'x-select-all', properties: 'display, alignItems'}},
      ],
    },
    // A root target, when asked for.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('card'), stylex.props(styles.row))} />;`,
      filename: 'packages/core/src/Card/Card.tsx',
      options: [{checkRootTargets: true}],
      errors: [
        {
          messageId: 'layoutOnlyRootTarget',
          data: {target: 'card', properties: 'display, alignItems'},
        },
      ],
    },
    // --- render-prop fallback ---
    // Inheritable typography on a fallback the callback replaces.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option'), stylex.props(styles.painted))}>{renderOption ? renderOption(item) : <span {...stylex.props(styles.label)}>t</span>}</div>;`,
      errors: [
        {
          messageId: 'inheritableOnRenderPropFallback',
          data: {
            target: 'x-option',
            callback: 'renderOption',
            properties: 'fontWeight, color',
          },
        },
      ],
    },
    // Branch order does not matter.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option'), stylex.props(styles.painted))}>{!renderOption ? <span {...stylex.props(styles.label)}>t</span> : renderOption(item)}</div>;`,
      errors: [{messageId: 'inheritableOnRenderPropFallback'}],
    },
    // #4628's shape: giving the fallback its own target is principle 4's named
    // anti-pattern, not an exemption — the callback's output never carries it.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option'), stylex.props(styles.painted))}>{renderOption ? renderOption(item) : <span {...mergeProps(themeProps('x-option-label'), stylex.props(styles.label))}>t</span>}</div>;`,
      errors: [
        {
          messageId: 'targetOnRenderPropFallback',
          data: {
            target: 'x-option',
            fallbackTarget: 'x-option-label',
            callback: 'renderOption',
            properties: 'fontWeight, color',
          },
        },
      ],
    },
    // --- checkInheritableHoisting (broad, opt-in) ---
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option'), stylex.props(styles.painted))}><span {...stylex.props(styles.label)}>t</span></div>;`,
      options: [{checkInheritableHoisting: true}],
      errors: [
        {
          messageId: 'inheritablePropertyOnChild',
          data: {target: 'x-option', properties: 'fontWeight, color'},
        },
      ],
    },
    // --- checkStateSurface ---
    // The state seam only rotates the element. (#4626's shape.)
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('selector-indicator', {state}), stylex.props(styles.painted, isOpen && styles.rotated))} />;`,
      options: stateOptions,
      errors: [
        {
          messageId: 'stateVariesOnlyLayout',
          data: {
            target: 'selector-indicator',
            props: 'state',
            properties: 'transform',
          },
        },
      ],
    },
    // The element's styles vary with a state the target does not declare.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option'), stylex.props(styles.painted, isSelected && styles.selected))} />;`,
      options: stateOptions,
      errors: [
        {
          messageId: 'underDeclaredState',
          data: {
            target: 'x-option',
            missing: 'selected',
            example: 'selected option',
          },
        },
      ],
    },
    // A size table counts as state variation too.
    {
      code: `${setup} const a = <div {...mergeProps(themeProps('x-option', {selected}), stylex.props(styles.painted, sizeStyles[size]))} />;`,
      options: stateOptions,
      errors: [
        {
          messageId: 'underDeclaredState',
          data: {target: 'x-option', missing: 'size', example: 'size option'},
        },
      ],
    },
  ],
});
