// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-wrapper-transform.js
 * @description Disallow a `<div>`/`<span>` that exists to apply a `transform`
 * to the icon or component inside it — put the transform on that element.
 *
 * A state-driven transform (the chevron that rotates when a section opens, a
 * caret that flips when a menu expands) is part of how the glyph looks in that
 * state. When it lives on a parent wrapper instead, the element a theme can
 * target and the element that actually moves are two different nodes, so a
 * theme can restyle the glyph but not its rotation — the one property most
 * themes want to change about a disclosure affordance.
 *
 * Bad — the target and the movement are on different elements:
 *   <span {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)}>
 *     <Icon icon="chevronDown" {...themeProps('thing-icon', {state})} />
 *   </span>
 *
 * Good — one element carries both:
 *   <Icon
 *     icon="chevronDown"
 *     xstyle={[styles.chevron, isOpen && styles.chevronOpen]}
 *     {...themeProps('thing-icon', {state})}
 *   />
 *
 * This is deliberately narrower than {@link no-style-only-wrapper}, which
 * fires only when a wrapper can be deleted outright. A transform wrapper often
 * also does real layout (`display: flex`, centering, a fixed box), which
 * exempts it there — but the transform still belongs on the child even when
 * the wrapper itself has to stay. The remedy differs too: move one property,
 * rather than remove an element.
 *
 * Two transforms on one element: `transform` is a single property, so folding
 * an RTL mirror and a state rotation onto the same node means the later value
 * wins. Spell both out per state instead — the pattern used across core:
 *
 *   chevronExpanded: {
 *     transform: {
 *       default: 'rotate(90deg)',
 *       ':is([dir="rtl"] *)': 'scaleX(-1) rotate(90deg)',
 *     },
 *   },
 *
 * Scope — the rule only fires where moving the transform is behavior-preserving
 * and the payoff (a themeable, targetable element) is real:
 *   - the wrapper is a host `div`/`span` carrying a `stylex.props()` spread
 *     whose styles include a transform property;
 *   - it has exactly one meaningful child, and that child is either an Astryx
 *     icon component (a name ending in `Icon`, which takes `xstyle`) or an
 *     identifier holding a `useIcon()` result (the registry glyph pattern,
 *     where the wrapper IS the icon element and should carry the transform and
 *     the theme target). A transform around a non-glyph component is usually
 *     positioning the wrapper's own box — Carousel floats a button pill with
 *     `translateX(-50%)` — and moving that onto the child would be wrong;
 *   - the style resolves to a local `stylex.create()` entry. An unresolvable
 *     style is left alone rather than guessed at.
 *
 * Transforms that are not state-driven glyph movement — a `Spinner` keyframe,
 * a popover's positioning translate — do not match the shape above: they either
 * live in keyframes or sit on an element wrapping arbitrary content.
 */

/** Properties whose value moves the element rather than painting it. */
const TRANSFORM_PROPERTIES = new Set([
  'transform',
  'rotate',
  'scale',
  'translate',
]);

/** Host elements treated as candidate wrappers. */
const DEFAULT_WRAPPER_ELEMENTS = ['div', 'span'];

/** Import sources whose components accept `xstyle`. */
const DEFAULT_COMPONENT_SOURCES = ['^@astryxdesign/', '^@xds/', '^\\.\\.?/'];

function isStylexPropsCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee?.type === 'MemberExpression' &&
    node.callee.object?.name === 'stylex' &&
    node.callee.property?.name === 'props'
  );
}

function isStylexCreateCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee?.type === 'MemberExpression' &&
    node.callee.object?.name === 'stylex' &&
    node.callee.property?.name === 'create'
  );
}

function isUseIconCall(node) {
  return node?.type === 'CallExpression' && node.callee?.name === 'useIcon';
}

/** Root identifier of a JSX name: `Icon` → Icon, `Card.Body` → Card. */
function jsxNameRoot(nameNode) {
  let current = nameNode;
  while (current?.type === 'JSXMemberExpression') {
    current = current.object;
  }
  return current?.type === 'JSXIdentifier' ? current.name : null;
}

/** Children that render nothing: whitespace-only text and comment expressions. */
function isIgnorableChild(child) {
  if (child.type === 'JSXText') {
    return child.value.trim() === '';
  }
  if (child.type === 'JSXExpressionContainer') {
    return child.expression?.type === 'JSXEmptyExpression';
  }
  return false;
}

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow div/span wrappers that apply a transform to the icon inside them — put the transform on the icon so it is the element themes target',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      wrapperTransform:
        'This <{{wrapper}}> applies a transform to the {{childLabel}} inside it. ' +
        'Put the transform on that element instead, so the element a theme can ' +
        'target is the element that moves. Keep any layout styles here; move ' +
        'only the transform and its transition.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          wrapperElements: {type: 'array', items: {type: 'string'}},
          componentSources: {type: 'array', items: {type: 'string'}},
          allowFiles: {type: 'array', items: {type: 'string'}},
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] ?? {};
    const filename = context.filename ?? context.getFilename();
    const allowFiles = options.allowFiles ?? [];
    if (allowFiles.some(pattern => filename.includes(pattern))) {
      return {};
    }

    const wrapperElements = new Set(
      options.wrapperElements ?? DEFAULT_WRAPPER_ELEMENTS,
    );
    const componentSources = (
      options.componentSources ?? DEFAULT_COMPONENT_SOURCES
    ).map(pattern => new RegExp(pattern));

    /** Local names imported from a source whose components take `xstyle`. */
    const astryxImports = new Set();
    /** `stylex.create` binding → style key → property names. */
    const stylexCreateProperties = new Map();
    /** Identifiers assigned from `useIcon(...)`. */
    const useIconBindings = new Set();
    /** Checked after the whole file is walked, so imports/styles are known. */
    const candidates = [];

    function styleKeyProperties(binding, key) {
      if (key == null) {
        return null;
      }
      return stylexCreateProperties.get(binding)?.get(key) ?? null;
    }

    /**
     * Property names a style expression applies, or null when it cannot be
     * resolved to a local `stylex.create()` entry.
     */
    function resolveStyleProperties(expression) {
      if (
        expression.type === 'MemberExpression' &&
        !expression.computed &&
        expression.object?.type === 'Identifier'
      ) {
        return styleKeyProperties(
          expression.object.name,
          expression.property.name ?? expression.property.value,
        );
      }
      if (
        expression.type === 'CallExpression' &&
        expression.callee?.type === 'MemberExpression' &&
        !expression.callee.computed &&
        expression.callee.object?.type === 'Identifier'
      ) {
        return styleKeyProperties(
          expression.callee.object.name,
          expression.callee.property.name ?? expression.callee.property.value,
        );
      }
      if (expression.type === 'LogicalExpression') {
        return resolveStyleProperties(expression.right);
      }
      if (expression.type === 'ConditionalExpression') {
        const consequent = resolveStyleProperties(expression.consequent) ?? [];
        const alternate = resolveStyleProperties(expression.alternate) ?? [];
        return [...consequent, ...alternate];
      }
      if (expression.type === 'ArrayExpression') {
        const all = [];
        for (const element of expression.elements ?? []) {
          if (element == null) continue;
          all.push(...(resolveStyleProperties(element) ?? []));
        }
        return all;
      }
      return null;
    }

    function appliesTransform(styleExpressions) {
      return styleExpressions.some(expression => {
        const properties = resolveStyleProperties(expression);
        if (properties == null) {
          return false;
        }
        return properties.some(name => TRANSFORM_PROPERTIES.has(name));
      });
    }

    /**
     * The single meaningful child, described for the report — or null when the
     * wrapper holds anything other than one icon-ish element.
     */
    function soleIconChild(element) {
      const meaningful = element.children.filter(
        child => !isIgnorableChild(child),
      );
      if (meaningful.length !== 1) {
        return null;
      }
      const [child] = meaningful;

      if (child.type === 'JSXElement') {
        const root = jsxNameRoot(child.openingElement.name);
        // Icons only. A transform around a non-glyph component is usually
        // positioning the wrapper itself (Carousel floats a button pill with
        // `translateX(-50%)`), where the transform belongs to the wrapper's own
        // box and moving it onto the child would be wrong.
        if (root != null && astryxImports.has(root) && /Icon$/.test(root)) {
          return `<${root}>`;
        }
        return null;
      }

      // `{chevronIcon}` where chevronIcon came from useIcon()
      if (
        child.type === 'JSXExpressionContainer' &&
        child.expression?.type === 'Identifier' &&
        useIconBindings.has(child.expression.name)
      ) {
        return `icon (${child.expression.name})`;
      }

      return null;
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== 'string') return;
        if (!componentSources.some(pattern => pattern.test(source))) return;
        for (const specifier of node.specifiers) {
          if (specifier.local?.name) {
            astryxImports.add(specifier.local.name);
          }
        }
      },

      VariableDeclarator(node) {
        if (node.id?.type !== 'Identifier') return;

        if (isUseIconCall(node.init)) {
          useIconBindings.add(node.id.name);
          return;
        }

        if (!isStylexCreateCall(node.init)) return;
        const [argument] = node.init.arguments;
        if (argument?.type !== 'ObjectExpression') return;

        const keys = new Map();
        for (const property of argument.properties) {
          if (property.type !== 'Property') continue;
          const key = property.key?.name ?? property.key?.value;
          if (key == null) continue;

          // `key: {…}` or `key: (arg) => ({…})` for dynamic styles
          let body = property.value;
          if (
            body?.type === 'ArrowFunctionExpression' &&
            body.body?.type === 'ObjectExpression'
          ) {
            body = body.body;
          }
          if (body?.type !== 'ObjectExpression') continue;

          keys.set(
            key,
            body.properties
              .filter(entry => entry.type === 'Property')
              .map(entry => entry.key?.name ?? entry.key?.value)
              .filter(name => name != null),
          );
        }
        stylexCreateProperties.set(node.id.name, keys);
      },

      JSXElement(node) {
        const name = node.openingElement.name;
        if (name.type !== 'JSXIdentifier') return;
        if (!wrapperElements.has(name.name)) return;

        const styleExpressions = [];
        for (const attribute of node.openingElement.attributes) {
          if (
            attribute.type === 'JSXSpreadAttribute' &&
            isStylexPropsCall(attribute.argument)
          ) {
            styleExpressions.push(...attribute.argument.arguments);
          }
        }
        if (styleExpressions.length === 0) return;

        candidates.push({node, wrapper: name.name, styleExpressions});
      },

      'Program:exit'() {
        for (const {node, wrapper, styleExpressions} of candidates) {
          if (!appliesTransform(styleExpressions)) continue;
          const childLabel = soleIconChild(node);
          if (childLabel == null) continue;

          context.report({
            node: node.openingElement,
            messageId: 'wrapperTransform',
            data: {wrapper, childLabel},
          });
        }
      },
    };
  },
};

export default rule;
