// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ESLint plugin for Astryx design system
 * @description Enforces usage of design tokens and Astryx conventions
 *
 * Rules:
 * - no-hardcoded-styles: Enforces usage of design tokens instead of hardcoded values in StyleX
 * - boolean-prop-naming: Enforces is/has prefix on boolean props in *Props interfaces
 * - docblock-example-format: Enforces @example blocks use ``` fenced code on a separate line
 * - no-raw-paragraph: Disallows components from rendering a <p> by default (render <div> so any content composes)
 *
 * Philosophy: Strict for agents (CI), lenient for humans (local dev)
 * - "strict" config: All rules as errors - use in CI/agent environments
 * - "recommended" config: All rules as warnings - use for human development
 */

import booleanPropNamingRule from './boolean-prop-naming.js';
import presentationalComponentRule from './presentational-component.js';
import docblockExampleFormatRule from './docblock-example-format.js';
import noStylexNullOverrideRule from './no-stylex-null-override.js';
import noReactIntrospectionRule from './no-react-introspection.js';
import noClassnameClobberRule from './no-classname-clobber.js';
import noHardcodedAnchorRule from './no-hardcoded-anchor.js';
import noRawParagraphRule from './no-raw-paragraph.js';
import noBorderShorthandRule from './no-border-shorthand.js';
import noReactNamespaceHooksRule from './no-react-namespace-hooks.js';
import copyrightHeaderRule from './copyright-header.js';
import noRawConsoleCliRule from './no-raw-console-cli.js';
import requireBasePropsRule from './require-base-props.js';
import requireRefPropRule from './require-ref-prop.js';
import noHardcodedI18nStringRule from './no-hardcoded-i18n-string.js';

// =============================================================================
// Rule: no-hardcoded-styles
// Detects hardcoded CSS values that should use Astryx tokens
// =============================================================================

const STYLE_PROPERTIES = {
  // Font properties that should use tokens
  fontSize: {
    pattern: /^['"]?\d+(\.\d+)?(px|rem|em)['"]?$/,
    tokenVar: 'textSizeVars',
    message: 'Use textSizeVars token instead of hardcoded fontSize',
    examples: ["textSizeVars['--font-size-xs']", "textSizeVars['--font-size-base']"],
  },
  fontWeight: {
    pattern: /^\d{3}$/,
    tokenVar: 'fontWeightVars',
    message: 'Use fontWeightVars token instead of hardcoded fontWeight',
    examples: ["fontWeightVars['--font-weight-medium']"],
  },
  lineHeight: {
    pattern: /^['"]?\d+(\.\d+)?(px|rem|em)?['"]?$/,
    tokenVar: 'typeScaleVars',
    message: 'Consider using a typeScaleVars leading token for consistency',
    examples: ["typeScaleVars['--text-body-leading']"],
  },
  // Spacing properties
  padding: {
    pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/,
    tokenVar: 'spacingVars',
    message: 'Use spacingVars token instead of hardcoded padding',
    examples: ["spacingVars['--spacing-2']"],
  },
  paddingTop: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  paddingRight: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  paddingBottom: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  paddingLeft: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  paddingBlock: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  paddingInline: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  margin: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  marginTop: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  marginRight: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  marginBottom: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  marginLeft: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  marginBlock: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  marginInline: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  gap: { pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/, tokenVar: 'spacingVars', message: 'Use spacingVars token' },
  // Border radius
  borderRadius: {
    pattern: /^['"]?\d+(\.\d+)?(px|rem)['"]?$/,
    tokenVar: 'radiusVars',
    message: 'Use radiusVars token instead of hardcoded borderRadius',
    examples: ["radiusVars['--radius-element']"],
  },
  // Colors - detect hex codes and rgb values
  color: {
    pattern: /^['"]?(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))['"]?$/,
    tokenVar: 'colorVars',
    message: 'Use colorVars token instead of hardcoded color',
    examples: ["colorVars['--color-text-primary']"],
  },
  backgroundColor: {
    pattern: /^['"]?(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))['"]?$/,
    tokenVar: 'colorVars',
    message: 'Use colorVars token instead of hardcoded backgroundColor',
    examples: ["colorVars['--color-background-surface']"],
  },
  borderColor: {
    pattern: /^['"]?(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))['"]?$/,
    tokenVar: 'colorVars',
    message: 'Use colorVars token instead of hardcoded borderColor',
  },
};

// Properties to skip (these are typically fine as hardcoded values)
const SKIP_VALUES = [
  '0', '0px', 'inherit', 'initial', 'unset', 'auto', 'none',
  '100%', '50%', '0%', 'transparent', 'currentColor',
];

/**
 * Check if we're inside a stylex.create() call
 */
function isInsideStylexCreate(node) {
  let current = node;
  while (current) {
    if (
      current.type === 'CallExpression' &&
      current.callee?.type === 'MemberExpression' &&
      current.callee.object?.name === 'stylex' &&
      current.callee.property?.name === 'create'
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/**
 * Get the string value from a node
 */
function getValueFromNode(node) {
  if (node.type === 'Literal') {
    return String(node.value);
  }
  if (node.type === 'TemplateLiteral' && node.quasis.length === 1) {
    return node.quasis[0].value.raw;
  }
  return null;
}

const noHardcodedStylesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce usage of Astryx design tokens instead of hardcoded values in StyleX',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      useToken: '{{message}}. Example: {{examples}}',
      useTokenSimple: '{{message}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Allow specific properties to be ignored
          ignore: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const ignoredProperties = new Set(options.ignore || []);

    return {
      Property(node) {
        // Only check inside stylex.create()
        if (!isInsideStylexCreate(node)) {
          return;
        }

        // Get property name
        const propName = node.key?.name || node.key?.value;
        if (!propName || ignoredProperties.has(propName)) {
          return;
        }

        // Check if this property has a rule
        const rule = STYLE_PROPERTIES[propName];
        if (!rule) {
          return;
        }

        // Get the value
        const value = getValueFromNode(node.value);
        if (value === null) {
          // Value is a variable/expression - that's fine
          return;
        }

        // Skip allowed values
        if (SKIP_VALUES.includes(value)) {
          return;
        }

        // Check if value matches the hardcoded pattern
        if (rule.pattern.test(value)) {
          context.report({
            node: node.value,
            messageId: rule.examples ? 'useToken' : 'useTokenSimple',
            data: {
              message: rule.message,
              examples: rule.examples ? rule.examples.join(' or ') : '',
            },
          });
        }
      },
    };
  },
};

// =============================================================================
// Plugin Export
// =============================================================================

const plugin = {
  meta: {
    name: '@astryx/eslint-plugin',
    version: '0.0.1',
  },
  rules: {
    'no-hardcoded-styles': noHardcodedStylesRule,
    'boolean-prop-naming': booleanPropNamingRule,
    'presentational-component': presentationalComponentRule,
    'docblock-example-format': docblockExampleFormatRule,
    'no-stylex-null-override': noStylexNullOverrideRule,
    'no-react-introspection': noReactIntrospectionRule,
    'no-classname-clobber': noClassnameClobberRule,
    'no-hardcoded-anchor': noHardcodedAnchorRule,
    'no-raw-paragraph': noRawParagraphRule,
    'no-border-shorthand': noBorderShorthandRule,
    'no-react-namespace-hooks': noReactNamespaceHooksRule,
    'require-base-props': requireBasePropsRule,
    'require-ref-prop': requireRefPropRule,
    'copyright-header': copyrightHeaderRule,
    'no-raw-console-cli': noRawConsoleCliRule,
    'no-hardcoded-i18n-string': noHardcodedI18nStringRule,
  },
  configs: {},
};

// Strict config - for agents/CI (all errors)
plugin.configs.strict = {
  plugins: {
    '@astryx': plugin,
  },
  rules: {
    '@astryx/no-hardcoded-styles': 'error',
    '@astryx/boolean-prop-naming': 'error',
    '@astryx/presentational-component': 'error',
    '@astryx/docblock-example-format': 'error',
    '@astryx/no-stylex-null-override': 'error',
    '@astryx/no-react-introspection': 'error',
    '@astryx/no-classname-clobber': 'error',
    '@astryx/no-hardcoded-anchor': 'error',
    '@astryx/no-raw-paragraph': 'error',
    '@astryx/no-border-shorthand': 'error',
    '@astryx/no-react-namespace-hooks': 'error',
    '@astryx/require-base-props': 'error',
    '@astryx/require-ref-prop': 'error',
    '@astryx/copyright-header': 'error',
    '@astryx/no-hardcoded-i18n-string': 'error',
  },
};

// Recommended config - for humans (all warnings)
plugin.configs.recommended = {
  plugins: {
    '@astryx': plugin,
  },
  rules: {
    '@astryx/no-hardcoded-styles': 'warn',
    '@astryx/boolean-prop-naming': 'warn',
    '@astryx/presentational-component': 'error',
    '@astryx/docblock-example-format': 'warn',
    '@astryx/no-stylex-null-override': 'warn',
    '@astryx/no-react-introspection': 'error',
    '@astryx/no-classname-clobber': 'error',
    '@astryx/no-hardcoded-anchor': 'warn',
    '@astryx/no-raw-paragraph': 'warn',
    '@astryx/no-border-shorthand': 'warn',
    '@astryx/no-react-namespace-hooks': 'error',
    '@astryx/require-base-props': 'warn',
    '@astryx/require-ref-prop': 'warn',
    '@astryx/copyright-header': 'error',
    '@astryx/no-hardcoded-i18n-string': 'warn',
  },
};

export default plugin;
