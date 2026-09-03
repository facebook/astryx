// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-physical-properties.js
 * @description Disallow physical left/right CSS properties (and physical
 *   left/right VALUES) inside stylex.create(). Physical properties don't flip
 *   under RTL; the CSS logical-property equivalents (inline-start/inline-end,
 *   start/end) do, so they're required for correct right-to-left rendering.
 *
 *   Three kinds of violation are detected:
 *   1. KEY-BASED — the object key is itself a banned physical property
 *      (e.g. `marginLeft`, `borderRightColor`, `left`, `borderTopLeftRadius`).
 *      The suggested fix renames the key to the logical equivalent.
 *   2. VALUE-BASED — the key is fine, but a specific physical VALUE is used
 *      (e.g. `textAlign: 'left'`, `float: 'right'`, `clear: 'left'`). The
 *      suggested fix replaces only the value; the key is left alone.
 *   3. RELATIONSHIP-BASED — a logical 50% inline anchor is paired with a
 *      physical horizontal translate under the same conditions, but has no RTL
 *      transform counterpart. Each declaration looks safe alone; together they
 *      displace the element by its own width under RTL.
 *
 *   EXCEPTION — inline centering: `left: '50%'` paired with a `translate`/
 *   `translateX` in the same style object is a deliberate, direction-symmetric
 *   centering idiom (physical anchor + physical translate reference the same
 *   edge). Logicalizing it to `insetInlineStart` BREAKS RTL centering, so the
 *   rule flags it with a distinct, non-autofixing message that points to the
 *   shared `rtlStyles.centerInline()` helper (the one sanctioned place the
 *   physical `left` lives, behind a single suppression).
 *
 * SEVERITY: shipped at `error` in both the `strict` and `recommended` tiers
 *   (see index.js). The RTL physical→logical migration is complete, so this
 *   rule gates against regressions rather than merely warning.
 *
 * AUTOFIX: this rule is fixable (`meta.fixable: 'code'`).
 *   - VALUE-BASED fixes are always safe: only the value literal is replaced.
 *   - KEY-BASED fixes rename the key token, but ONLY when the logical key is not
 *     already present in the same style object. If BOTH the physical and logical
 *     key are present, renaming would produce a duplicate property (and the two
 *     silently collide — last one wins in LTR), so instead of autofixing we
 *     surface a distinct `physicalKeyConflict` message for a human to resolve.
 */

/**
 * Physical property KEYS → their CSS logical equivalent.
 * When one of these appears as an object key inside stylex.create(), flag it
 * and suggest the logical rename.
 *
 * The corner-radius mappings are diagonal-aware: a physical corner is named
 * <vertical><horizontal>, while the logical corner is named <block><inline>.
 *   top-left     → start(block) start(inline) → borderStartStartRadius
 *   top-right    → start(block) end(inline)   → borderStartEndRadius
 *   bottom-left  → end(block)   start(inline) → borderEndStartRadius
 *   bottom-right → end(block)   end(inline)   → borderEndEndRadius
 */
const PHYSICAL_KEY_MAP = {
  // Margin
  marginLeft: 'marginInlineStart',
  marginRight: 'marginInlineEnd',
  // Padding
  paddingLeft: 'paddingInlineStart',
  paddingRight: 'paddingInlineEnd',
  // Border side shorthands
  borderLeft: 'borderInlineStart',
  borderRight: 'borderInlineEnd',
  // Border side longhands (left)
  borderLeftWidth: 'borderInlineStartWidth',
  borderLeftStyle: 'borderInlineStartStyle',
  borderLeftColor: 'borderInlineStartColor',
  // Border side longhands (right)
  borderRightWidth: 'borderInlineEndWidth',
  borderRightStyle: 'borderInlineEndStyle',
  borderRightColor: 'borderInlineEndColor',
  // Inset
  left: 'insetInlineStart',
  right: 'insetInlineEnd',
  // Corner radii (diagonal-aware: vertical+horizontal → block+inline)
  borderTopLeftRadius: 'borderStartStartRadius',
  borderTopRightRadius: 'borderStartEndRadius',
  borderBottomLeftRadius: 'borderEndStartRadius',
  borderBottomRightRadius: 'borderEndEndRadius',
};

/**
 * Property KEYS whose physical left/right VALUES should be flagged. The key
 * itself is fine — only the specific physical value literal is a violation.
 * Maps `key → { physicalValue → logicalValue }`.
 */
const PHYSICAL_VALUE_MAP = {
  textAlign: { left: 'start', right: 'end' },
  float: { left: 'inline-start', right: 'inline-end' },
  clear: { left: 'inline-start', right: 'inline-end' },
};

export function isInsideStylexCreate(node) {
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

function getStaticValue(node) {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  return null;
}

function getStaticText(node) {
  const value = getStaticValue(node);
  if (value !== null) return value;
  if (node?.type === 'TemplateLiteral') {
    return node.quasis.map((quasi) => quasi.value.raw).join(' ');
  }
  return null;
}

function propertyName(property) {
  return property?.key?.name ?? property?.key?.value ?? null;
}

/**
 * Flatten a StyleX conditional value into its static leaves. `default` is kept
 * in the path here and normalized only when conditions are compared.
 */
function conditionalLeaves(node, path = []) {
  const text = getStaticText(node);
  if (text !== null) return [{path, text}];
  if (node?.type !== 'ObjectExpression') return [];

  return node.properties.flatMap((property) => {
    if (property.type !== 'Property') return [];
    const name = propertyName(property);
    if (typeof name !== 'string') return [];
    return conditionalLeaves(property.value, [...path, name]);
  });
}

function isRtlCondition(condition) {
  return (
    /\[dir\s*=\s*["']rtl["']\]/.test(condition) ||
    /:dir\(\s*rtl\s*\)/.test(condition)
  );
}

function normalizedConditions(path) {
  return path.filter(
    (condition) => condition !== 'default' && !isRtlCondition(condition),
  );
}

function sameConditions(a, b) {
  const left = normalizedConditions(a);
  const right = normalizedConditions(b);
  return (
    left.length === right.length &&
    left.every((condition, index) => condition === right[index])
  );
}

function horizontalTranslate(text) {
  const match = text.match(/\btranslate(?:X)?\s*\(\s*([^,\s)]+)/);
  if (!match) return null;
  const value = match[1];
  return /^[-+]?0(?:[a-z%]*)?$/.test(value) ? null : value;
}

function oppositeTranslations(a, b) {
  if (a === b) return false;
  const simple = /^([-+]?\d+(?:\.\d+)?)([a-z%]*)$/;
  const left = a.match(simple);
  const right = b.match(simple);
  if (!left || !right || left[2] !== right[2]) return true;
  return Number(left[1]) === -Number(right[1]);
}

function siblingProperty(node, keyName) {
  const object = node.parent;
  if (object?.type !== 'ObjectExpression') return null;
  return (
    object.properties.find(
      (property) =>
        property.type === 'Property' && propertyName(property) === keyName,
    ) ?? null
  );
}

/**
 * Does the given ObjectExpression already contain a Property whose key is
 * `keyName`? Handles both identifier keys (`marginLeft`) and string-literal
 * keys (`'marginLeft'`).
 */
function objectHasKey(objectExpression, keyName) {
  if (!objectExpression || objectExpression.type !== 'ObjectExpression') {
    return false;
  }
  return objectExpression.properties.some((prop) => {
    if (prop.type !== 'Property') return false;
    const name = prop.key?.name ?? prop.key?.value;
    return name === keyName;
  });
}

/**
 * Returns the fixed inline-centering anchor value when a physical `left` and
 * horizontal translate are active under the same StyleX conditions.
 */
function inlineCenteringValue(node) {
  const transform = siblingProperty(node, 'transform');
  if (!transform) return null;
  const transforms = conditionalLeaves(transform.value).filter((leaf) =>
    horizontalTranslate(leaf.text),
  );

  for (const anchor of conditionalLeaves(node.value)) {
    if (anchor.text !== '50%' && anchor.text !== '-50%') continue;
    if (transforms.some((leaf) => sameConditions(anchor.path, leaf.path))) {
      return anchor.text;
    }
  }
  return null;
}

/**
 * Returns the broken logical anchor value when a logical 50% inset and physical
 * horizontal translate share a conditional branch without an opposite RTL
 * transform in that branch.
 */
export function logicalCenteringStatuses(node) {
  const transform = siblingProperty(node, 'transform');
  if (!transform) return [];
  const transforms = conditionalLeaves(transform.value)
    .map((leaf) => ({...leaf, horizontal: horizontalTranslate(leaf.text)}))
    .filter((leaf) => leaf.horizontal !== null);
  const statuses = [];

  for (const anchor of conditionalLeaves(node.value)) {
    if (anchor.text !== '50%' && anchor.text !== '-50%') continue;
    const defaults = transforms.filter(
      (leaf) =>
        !leaf.path.some(isRtlCondition) &&
        sameConditions(anchor.path, leaf.path),
    );
    if (defaults.length === 0) continue;

    const rtlTransforms = transforms.filter(
      (leaf) =>
        leaf.path.some(isRtlCondition) &&
        sameConditions(anchor.path, leaf.path),
    );
    const compensated = defaults.every((defaultTransform) =>
      rtlTransforms.some((rtlTransform) =>
        oppositeTranslations(
          defaultTransform.horizontal,
          rtlTransform.horizontal,
        ),
      ),
    );
    statuses.push({compensated, value: anchor.text});
  }
  return statuses;
}

function unmirroredLogicalCenteringValue(node) {
  return (
    logicalCenteringStatuses(node).find((status) => !status.compensated)
      ?.value ?? null
  );
}

const rule = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        'Disallow physical left/right CSS properties and values, plus unsafe ' +
        'logical-centering transforms, inside stylex.create(). Use logical ' +
        'properties for directional placement and rtlStyles.centerInline() ' +
        'for fixed geometric centering.',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      physicalKey:
        'Use `{{logical}}` instead of `{{physical}}` for RTL support.',
      physicalValue:
        'Use `{{prop}}: \'{{logical}}\'` instead of ' +
        '`{{prop}}: \'{{physical}}\'` for RTL support.',
      physicalKeyConflict:
        '`{{physical}}` conflicts with `{{logical}}` already set on this ' +
        'style object — remove `{{physical}}`.',
      inlineCentering:
        '`left: {{value}}` with a `translate` centers this element — do NOT ' +
        'rename it to `insetInlineStart` (that breaks centering under RTL). ' +
        'Use the shared `rtlStyles.centerInline(blockOffset)` helper instead.',
      logicalCenteringTransform:
        '`{{property}}: {{value}}` flips its anchor under RTL, but its paired ' +
        'horizontal `translate` does not. Use `rtlStyles.centerInline(blockOffset)` ' +
        'for fixed centering, or add an opposite RTL transform for a variable position.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowLogicalCentering: {type: 'boolean'},
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const allowLogicalCentering =
      context.options[0]?.allowLogicalCentering === true;
    return {
      Property(node) {
        if (!isInsideStylexCreate(node)) return;

        const propName = node.key?.name || node.key?.value;
        if (!propName) return;

        // KEY-BASED: the object key is itself a physical property.
        const logicalKey = PHYSICAL_KEY_MAP[propName];
        if (logicalKey) {
          // Special case: `left: '50%'` + a centering `translate` must NOT be
          // logicalized (it would break RTL centering). Point at the shared
          // helper instead, and do NOT autofix.
          const centeringValue =
            propName === 'left' ? inlineCenteringValue(node) : null;
          if (centeringValue !== null) {
            context.report({
              node: node.key,
              messageId: 'inlineCentering',
              data: {value: centeringValue},
            });
            return;
          }

          // Guard: if the logical key is ALSO present in the same object,
          // renaming would create a duplicate/silent collision. Ambiguous
          // which value the author meant — surface a distinct message, no fix.
          if (objectHasKey(node.parent, logicalKey)) {
            context.report({
              node: node.key,
              messageId: 'physicalKeyConflict',
              data: {
                physical: propName,
                logical: logicalKey,
              },
            });
            return;
          }

          // Preserve the original key's quoting: a string-literal key is
          // replaced with a quoted string; an identifier key stays unquoted.
          // All logical names are valid identifiers.
          const isStringLiteralKey =
            node.key.type === 'Literal' && typeof node.key.value === 'string';
          const newKeyText = isStringLiteralKey
            ? `'${logicalKey}'`
            : logicalKey;

          context.report({
            node: node.key,
            messageId: 'physicalKey',
            data: {
              physical: propName,
              logical: logicalKey,
            },
            fix(fixer) {
              return fixer.replaceText(node.key, newKeyText);
            },
          });
          return;
        }

        // RELATIONSHIP-BASED: a logical 50% anchor flips under RTL while a
        // physical horizontal translation does not. Inspect matching nested
        // media/state branches and accept an explicit opposite RTL transform.
        if (
          !allowLogicalCentering &&
          (propName === 'insetInlineStart' ||
            propName === 'insetInlineEnd')
        ) {
          const centeringValue = unmirroredLogicalCenteringValue(node);
          if (centeringValue !== null) {
            context.report({
              node: node.key,
              messageId: 'logicalCenteringTransform',
              data: {property: propName, value: centeringValue},
            });
            return;
          }
        }

        // VALUE-BASED: the key is fine, but the value may be physical.
        const valueMap = PHYSICAL_VALUE_MAP[propName];
        if (valueMap) {
          const value = getStaticValue(node.value);
          if (value !== null && valueMap[value]) {
            const logicalValue = valueMap[value];
            context.report({
              node: node.value,
              messageId: 'physicalValue',
              data: {
                prop: propName,
                physical: value,
                logical: logicalValue,
              },
              fix(fixer) {
                return fixer.replaceText(node.value, `'${logicalValue}'`);
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
