/**
 * @file boolean-prop-naming.js
 * @description ESLint rule enforcing XDS boolean prop naming conventions.
 *
 * Boolean props in *Props interfaces/types must use:
 *   - `is` prefix for state/condition booleans (isDisabled, isRequired, isLoading)
 *   - `has` prefix for feature toggles (hasAutoFocus, hasClear, hasSeconds)
 *   - `defaultIs` / `defaultHas` for uncontrolled boolean defaults
 *   - `initialIs` / `initialHas` (deprecated aliases, kept for backward compat)
 *
 * Exceptions:
 *   - aria-* and data-* attributes (follow their own conventions)
 *   - Properties in interfaces/types that don't end with "Props"
 *   - Union types containing boolean (e.g. boolean | string) — not purely boolean
 */

// Well-known native HTML boolean attributes that get a specific suggestion
const NATIVE_BOOLEAN_SUGGESTIONS = {
  disabled: 'isDisabled',
  required: 'isRequired',
  checked: 'isChecked',
  readOnly: 'isReadOnly',
  hidden: 'isHidden',
  selected: 'isSelected',
  open: 'isOpen',
  loading: 'isLoading',
  inline: 'isInline',
  standalone: 'isStandalone',
  striped: 'isStriped',
  hover: 'hasHover',
  wrap: 'hasWrap',
};

/**
 * Check if a property name follows the boolean naming convention.
 */
function isValidBooleanPropName(name) {
  return (
    name.startsWith('is') ||
    name.startsWith('has') ||
    name.startsWith('defaultIs') ||
    name.startsWith('defaultHas') ||
    name.startsWith('initialIs') ||
    name.startsWith('initialHas')
  );
}

// Props that are excluded from the naming convention check.
// These are either native HTML attributes or standard React controlled-component patterns.
const EXCLUDED_PROP_NAMES = new Set([
  'value',          // Controlled component value (can be boolean for toggles)
  'defaultValue',   // Uncontrolled default value
  'defaultChecked', // Native HTML uncontrolled checkbox default
]);

/**
 * Check if a property name should be excluded from the rule.
 */
function isExcludedPropName(name) {
  return (
    name.startsWith('aria-') ||
    name.startsWith('data-') ||
    EXCLUDED_PROP_NAMES.has(name)
  );
}

/**
 * Suggest a corrected name for a boolean prop.
 */
function suggestName(name) {
  if (NATIVE_BOOLEAN_SUGGESTIONS[name]) {
    return NATIVE_BOOLEAN_SUGGESTIONS[name];
  }
  // Default: prefix with "is" and capitalize
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  return `is${capitalized}`;
}

/**
 * Check if a type annotation node is purely `boolean` (not a union like `boolean | string`).
 */
function isPureBooleanType(typeAnnotation) {
  if (!typeAnnotation) return false;

  // Direct boolean keyword: `prop: boolean`
  if (typeAnnotation.type === 'TSBooleanKeyword') {
    return true;
  }

  // Handle TSTypeAnnotation wrapper
  if (typeAnnotation.type === 'TSTypeAnnotation') {
    return isPureBooleanType(typeAnnotation.typeAnnotation);
  }

  return false;
}

/**
 * Get the name of the enclosing interface or type alias, if it ends with "Props".
 */
function getEnclosingPropsName(node) {
  let current = node.parent;
  while (current) {
    // Interface declaration: `interface XDSButtonProps { ... }`
    if (current.type === 'TSInterfaceDeclaration') {
      const name = current.id?.name;
      if (name && name.endsWith('Props')) {
        return name;
      }
      return null;
    }
    // Type alias: `type XDSButtonProps = { ... }`
    if (current.type === 'TSTypeAliasDeclaration') {
      const name = current.id?.name;
      if (name && name.endsWith('Props')) {
        return name;
      }
      return null;
    }
    current = current.parent;
  }
  return null;
}

const booleanPropNamingRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce XDS boolean prop naming conventions (is/has prefix)',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      invalidBooleanPropName:
        'Boolean prop "{{name}}" in {{interfaceName}} should use "is" or "has" prefix. Suggested: "{{suggestion}}".',
    },
    hasSuggestions: true,
    schema: [],
  },
  create(context) {
    return {
      TSPropertySignature(node) {
        // Only check properties with a type annotation
        if (!node.typeAnnotation) return;

        // Only check purely boolean types (skip unions like boolean | string)
        if (!isPureBooleanType(node.typeAnnotation)) return;

        // Get property name
        const propName = node.key?.name || node.key?.value;
        if (!propName) return;

        // Skip aria-* and data-* attributes
        if (isExcludedPropName(propName)) return;

        // Only apply to interfaces/types ending with "Props"
        const interfaceName = getEnclosingPropsName(node);
        if (!interfaceName) return;

        // Check if the name follows convention
        if (isValidBooleanPropName(propName)) return;

        const suggestion = suggestName(propName);

        context.report({
          node: node.key,
          messageId: 'invalidBooleanPropName',
          data: {
            name: propName,
            interfaceName,
            suggestion,
          },
          suggest: [
            {
              desc: `Rename to "${suggestion}"`,
              fix(fixer) {
                return fixer.replaceText(node.key, suggestion);
              },
            },
          ],
        });
      },
    };
  },
};

export default booleanPropNamingRule;
