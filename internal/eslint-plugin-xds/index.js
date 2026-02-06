/**
 * @file ESLint plugin for XDS design system
 * @description Enforces usage of design tokens instead of hardcoded values in StyleX
 *
 * Philosophy: Strict for agents (CI), lenient for humans (local dev)
 * - "strict" config: All rules as errors - use in CI/agent environments
 * - "recommended" config: All rules as warnings - use for human development
 */

// =============================================================================
// Rule: no-hardcoded-styles
// Detects hardcoded CSS values that should use XDS tokens
// =============================================================================

const STYLE_PROPERTIES = {
  // Font properties that should use tokens
  fontSize: {
    pattern: /^['"]?\d+(\.\d+)?(px|rem|em)['"]?$/,
    tokenVar: 'textSizeVars',
    message: 'Use textSizeVars token instead of hardcoded fontSize',
    examples: ["textSizeVars['--text-xsm']", "textSizeVars['--text-base']"],
  },
  fontWeight: {
    pattern: /^\d{3}$/,
    tokenVar: 'fontWeightVars',
    message: 'Use fontWeightVars token instead of hardcoded fontWeight',
    examples: ["fontWeightVars['--font-weight-medium']"],
  },
  lineHeight: {
    pattern: /^['"]?\d+(\.\d+)?(px|rem|em)?['"]?$/,
    tokenVar: 'lineHeightVars',
    message: 'Consider using lineHeightVars token for consistency',
    examples: ["lineHeightVars['--leading-normal']"],
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
    examples: ["colorVars['--color-surface']"],
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
      description: 'Enforce usage of XDS design tokens instead of hardcoded values in StyleX',
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
    name: '@xds/eslint-plugin',
    version: '0.0.1',
  },
  rules: {
    'no-hardcoded-styles': noHardcodedStylesRule,
  },
  configs: {},
};

// Strict config - for agents/CI (all errors)
plugin.configs.strict = {
  plugins: {
    '@xds': plugin,
  },
  rules: {
    '@xds/no-hardcoded-styles': 'error',
  },
};

// Recommended config - for humans (all warnings)
plugin.configs.recommended = {
  plugins: {
    '@xds': plugin,
  },
  rules: {
    '@xds/no-hardcoded-styles': 'warn',
  },
};

export default plugin;
