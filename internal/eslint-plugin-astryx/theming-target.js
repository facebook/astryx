// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theming-target.js
 * @description Shared analysis for the theming-target rules: find the
 * `themeProps()` targets attached to a JSX element, find the StyleX styles that
 * element applies, and classify those styles as paint / layout / neutral.
 *
 * A theming target (`themeProps('selector-option')`) is a public API
 * commitment — a stable `.astryx-*` class a theme can write CSS against. The
 * wiki's "Principles for authoring theming targets" say *where* a target may
 * sit and *what* it may expose; the rules in
 * `theming-target-shape.js`, `theming-target-name.js` and
 * `themeprops-reflection.js` encode the mechanically checkable subset. All
 * three need the same three facts about an element, which live here:
 *
 *   1. which `themeProps()` calls land on it — directly, through `mergeProps`,
 *      through a local `const p = themeProps(...)`, or via
 *      `className={themeProps(...).className}`;
 *   2. which `stylex.props()` arguments it applies;
 *   3. what those styles actually declare.
 *
 * (3) reuses `stylex-style-source.js` (from `@astryx/no-style-only-wrapper`)
 * to follow a style object into the module it was imported from.
 *
 * <!-- SYNC: internal/eslint-plugin-astryx/no-style-only-wrapper.js — its
 *      private resolveStyleProperties() is the same walk as
 *      createStyleResolver() here; collapse the two once #4758 lands. -->
 */

import {resolveImportedStyleProperties} from './stylex-style-source.js';

/**
 * Properties that PAINT: they change how the element looks without changing
 * where anything sits. These are what a class target exists to expose — the
 * "paint seam" of the authoring criteria.
 */
export const PAINT_PROPERTIES = new Set([
  // Fill and image
  'background',
  'backgroundColor',
  'backgroundImage',
  'backgroundClip',
  'backgroundOrigin',
  'backgroundRepeat',
  'backgroundSize',
  'backgroundPosition',
  'backgroundAttachment',
  'backgroundBlendMode',
  'mixBlendMode',
  // Border and outline (colors, styles, widths, radii)
  'border',
  'borderColor',
  'borderStyle',
  'borderWidth',
  'borderRadius',
  'outline',
  'outlineColor',
  'outlineStyle',
  'outlineWidth',
  'outlineOffset',
  // Depth
  'boxShadow',
  'textShadow',
  'filter',
  'backdropFilter',
  // Ink
  'color',
  'caretColor',
  'accentColor',
  'fill',
  'stroke',
  'strokeWidth',
  'scrollbarColor',
  // Typography
  'font',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'fontVariant',
  'fontVariantNumeric',
  'fontFeatureSettings',
  'fontVariationSettings',
  'letterSpacing',
  'lineHeight',
  'textTransform',
  'textDecoration',
  'textDecorationLine',
  'textDecorationColor',
  'textDecorationStyle',
  'textDecorationThickness',
  'textUnderlineOffset',
  'listStyle',
  'listStyleType',
  'listStyleImage',
]);

/**
 * Properties that LAY OUT: the component's structural contract. Per the
 * authoring criteria these are themed through declared vars (the derived-var /
 * container-padding pipeline), never through a raw class target.
 */
export const LAYOUT_PROPERTIES = new Set([
  'display',
  'position',
  'inset',
  'insetBlock',
  'insetBlockStart',
  'insetBlockEnd',
  'insetInline',
  'insetInlineStart',
  'insetInlineEnd',
  'top',
  'right',
  'bottom',
  'left',
  'float',
  'clear',
  'zIndex',
  'boxSizing',
  'overflow',
  'overflowX',
  'overflowY',
  'overflowBlock',
  'overflowInline',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexFlow',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'order',
  'alignContent',
  'alignItems',
  'alignSelf',
  'justifyContent',
  'justifyItems',
  'justifySelf',
  'placeContent',
  'placeItems',
  'placeSelf',
  'grid',
  'gridArea',
  'gridAutoColumns',
  'gridAutoFlow',
  'gridAutoRows',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnStart',
  'gridRow',
  'gridRowEnd',
  'gridRowStart',
  'gridTemplate',
  'gridTemplateAreas',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gap',
  'rowGap',
  'columnGap',
  'columns',
  'columnCount',
  'width',
  'minWidth',
  'maxWidth',
  'height',
  'minHeight',
  'maxHeight',
  'blockSize',
  'minBlockSize',
  'maxBlockSize',
  'inlineSize',
  'minInlineSize',
  'maxInlineSize',
  'aspectRatio',
  'margin',
  'marginBlock',
  'marginBlockEnd',
  'marginBlockStart',
  'marginBottom',
  'marginInline',
  'marginInlineEnd',
  'marginInlineStart',
  'marginLeft',
  'marginRight',
  'marginTop',
  'padding',
  'paddingBlock',
  'paddingBlockEnd',
  'paddingBlockStart',
  'paddingBottom',
  'paddingInline',
  'paddingInlineEnd',
  'paddingInlineStart',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'transform',
  'transformOrigin',
  'translate',
  'rotate',
  'scale',
  'verticalAlign',
  'whiteSpace',
  'wordBreak',
  'overflowWrap',
  'textOverflow',
  'textAlign',
  'textIndent',
  'objectFit',
  'objectPosition',
  'containerType',
  'containerName',
  'contain',
  'resize',
]);

/**
 * Everything else a component routinely declares that neither paints nor lays
 * out: motion, interactivity, and visibility toggles. A target whose element
 * declares *only* these has nothing for a theme to paint either — `opacity`
 * and `transition` are how a component animates itself, not a paint seam.
 */
const NEUTRAL_HEURISTIC = new Set([
  'opacity',
  'visibility',
  'cursor',
  'pointerEvents',
  'userSelect',
  'touchAction',
  'appearance',
  'content',
  'willChange',
  'isolation',
  'scrollBehavior',
  'scrollSnapAlign',
  'scrollSnapType',
  'colorScheme',
]);

/** Substrings that make an unlisted property a paint property. */
const PAINT_PATTERN =
  /(color|background|border|shadow|font|fill|stroke|outline|decoration|gradient)/i;

/**
 * Bindings that carry the CONSUMER's styles into a component's own
 * `stylex.props()` call. They are an escape hatch, not part of the component's
 * declared theming surface.
 */
const CONSUMER_STYLE_BINDINGS = new Set(['xstyle', 'undefined']);

/** True when a style expression pulls in consumer-supplied styles. */
export function mentionsConsumerStyles(node) {
  let found = false;
  const visit = (current) => {
    if (found || current == null || typeof current.type !== 'string') return;
    if (current.type === 'Identifier' && current.name === 'xstyle') {
      found = true;
      return;
    }
    for (const key of Object.keys(current)) {
      if (key === 'parent') continue;
      const value = current[key];
      if (Array.isArray(value)) value.forEach(visit);
      else visit(value);
    }
  };
  visit(node);
  return found;
}

/**
 * Bucket for a single CSS property name as StyleX spells it.
 *
 * @returns {'paint' | 'layout' | 'neutral' | 'var'} `'var'` for a custom
 *   property (`--_card-radius`): the element is feeding the derived-var
 *   pipeline, and what that var ends up painting is not visible from here.
 */
export function bucketOf(property) {
  if (typeof property !== 'string') {
    return 'neutral';
  }
  if (property.startsWith('--')) {
    return 'var';
  }
  if (PAINT_PROPERTIES.has(property)) {
    return 'paint';
  }
  if (LAYOUT_PROPERTIES.has(property)) {
    return 'layout';
  }
  if (NEUTRAL_HEURISTIC.has(property)) {
    return 'neutral';
  }
  // Longhands and vendor spellings the lists miss (`borderInlineStartColor`,
  // `WebkitTextFillColor`, `transitionProperty`): classify by name so a new
  // property is not silently counted as "no paint".
  if (PAINT_PATTERN.test(property)) {
    // `transitionProperty: 'background-color'` names a property but paints
    // nothing on its own.
    if (/^(transition|animation)/.test(property)) {
      return 'neutral';
    }
    return 'paint';
  }
  if (/^(margin|padding|inset|grid|flex|place|align|justify)/.test(property)) {
    return 'layout';
  }
  return 'neutral';
}

/** Split resolved property names into buckets. */
export function classifyProperties(properties) {
  const paint = [];
  const layout = [];
  const neutral = [];
  let hasVar = false;
  for (const property of properties) {
    switch (bucketOf(property)) {
      case 'paint':
        paint.push(property);
        break;
      case 'layout':
        layout.push(property);
        break;
      case 'var':
        hasVar = true;
        break;
      default:
        neutral.push(property);
    }
  }
  return {paint, layout, neutral, hasVar};
}

// ---------------------------------------------------------------------------
// AST helpers
// ---------------------------------------------------------------------------

/** `stylex.props(...)` */
export function isStylexPropsCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee?.type === 'MemberExpression' &&
    node.callee.object?.name === 'stylex' &&
    node.callee.property?.name === 'props'
  );
}

/** `themeProps(...)` — matched by callee name, as themingTargets.test.ts does. */
export function isThemePropsCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee?.type === 'Identifier' &&
    node.callee.name === 'themeProps'
  );
}

/** Root identifier of a JSX name: `Icon` → Icon, `Card.Body` → Card. */
export function jsxNameRoot(nameNode) {
  let current = nameNode;
  while (current?.type === 'JSXMemberExpression') {
    current = current.object;
  }
  return current?.type === 'JSXIdentifier' ? current.name : null;
}

/** Full JSX name as written, for report messages. */
export function jsxNameText(nameNode) {
  if (nameNode?.type === 'JSXIdentifier') {
    return nameNode.name;
  }
  if (nameNode?.type === 'JSXMemberExpression') {
    return `${jsxNameText(nameNode.object)}.${nameNode.property.name}`;
  }
  return 'element';
}

/** A lowercase JSX name is a host element (`div`), not a component (`Icon`). */
export function isHostElement(nameNode) {
  return (
    nameNode?.type === 'JSXIdentifier' && /^[a-z]/.test(nameNode.name ?? '')
  );
}

/** Children that render nothing: whitespace-only text and comment expressions. */
export function isIgnorableChild(child) {
  if (child.type === 'JSXText') {
    return child.value.trim() === '';
  }
  if (child.type === 'JSXExpressionContainer') {
    return child.expression?.type === 'JSXEmptyExpression';
  }
  return false;
}

/**
 * Depth-first walk of an ESTree subtree, skipping `parent` back-links. The
 * visitor gets the walk's own parent rather than `node.parent`, so it works on
 * synthesized roots (a `const` initializer reached from a `{...p}` spread)
 * whose back-links point somewhere else in the file.
 *
 * The walk stops at a nested JSX element. An attribute can hold a whole
 * subtree — `<Item marker={<span {...themeProps('x')} />} />` — and that
 * `themeProps` belongs to the `<span>`, not to `<Item>`; the span is visited
 * on its own turn as a JSXElement.
 */
function walk(node, visit, parent = null) {
  if (node == null || typeof node.type !== 'string') {
    return;
  }
  visit(node, parent);
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;
    const value = node[key];
    const children = Array.isArray(value) ? value : [value];
    for (const child of children) {
      if (child == null || typeof child.type !== 'string') continue;
      if (child.type === 'JSXElement' || child.type === 'JSXFragment') continue;
      walk(child, visit, node);
    }
  }
}

/**
 * The scanner every theming-target rule builds on.
 *
 * Wire `importDeclaration` / `variableDeclarator` into the rule's visitor, then
 * ask about elements in `Program:exit` — `stylex.create()` usually sits at the
 * bottom of a component file, so the style table is only complete once the
 * whole program has been walked.
 */
export function createFileScanner(context) {
  const filename = context.filename ?? context.getFilename();

  /** Local name → true when imported from a source that ships Astryx components. */
  const astryxImports = new Set();
  /** Local name of a `stylex.create()` result → style key → property names. */
  const stylexCreateProperties = new Map();
  /** Local name → the module it was imported from, for cross-file styles. */
  const importedBindings = new Map();
  /** Local name → the `themeProps()`/`mergeProps()` expression it holds. */
  const localPropsBindings = new Map();

  const componentSources = [/^@astryxdesign\//, /^@xds\//, /^\.\.?\//];

  return {
    filename,

    importDeclaration(node) {
      const source = node.source.value;
      if (typeof source !== 'string') {
        return;
      }
      for (const specifier of node.specifiers) {
        const local = specifier.local?.name;
        if (!local) continue;
        if (specifier.type === 'ImportSpecifier') {
          importedBindings.set(local, {
            source,
            name: specifier.imported?.name ?? local,
          });
        } else if (specifier.type === 'ImportDefaultSpecifier') {
          importedBindings.set(local, {source, name: 'default'});
        }
      }
      if (!componentSources.some((pattern) => pattern.test(source))) {
        return;
      }
      for (const specifier of node.specifiers) {
        const local = specifier.local?.name;
        // Components are PascalCase; `themeProps`, `mergeProps` and style
        // objects come from the same relative modules.
        if (local && /^[A-Z]/.test(local)) {
          astryxImports.add(local);
        }
      }
    },

    variableDeclarator(node) {
      if (node.id?.type !== 'Identifier') {
        return;
      }
      const init = node.init;
      // `const p = themeProps('x')` / `const p = mergeProps(themeProps('x'), …)`
      if (
        init?.type === 'CallExpression' &&
        init.callee?.type === 'Identifier' &&
        (init.callee.name === 'themeProps' || init.callee.name === 'mergeProps')
      ) {
        localPropsBindings.set(node.id.name, init);
        return;
      }
      // `const styles = stylex.create({...})`
      if (
        init?.type !== 'CallExpression' ||
        init.callee?.type !== 'MemberExpression' ||
        init.callee.object?.name !== 'stylex' ||
        init.callee.property?.name !== 'create'
      ) {
        return;
      }
      const definition = init.arguments[0];
      if (definition?.type !== 'ObjectExpression') {
        return;
      }
      const byKey = new Map();
      for (const styleEntry of definition.properties) {
        if (styleEntry.type !== 'Property') continue;
        const key = styleEntry.key?.name ?? styleEntry.key?.value;
        if (key == null) continue;
        // A dynamic style is an arrow function returning the style object.
        let body = styleEntry.value;
        if (
          body?.type === 'ArrowFunctionExpression' &&
          body.body?.type === 'ObjectExpression'
        ) {
          body = body.body;
        }
        if (body?.type !== 'ObjectExpression') {
          byKey.set(key, []);
          continue;
        }
        byKey.set(key, collectObjectProperties(body));
      }
      stylexCreateProperties.set(node.id.name, byKey);
    },

    /** True when the JSX name resolves to an imported Astryx component. */
    isAstryxComponent(nameNode) {
      const root = jsxNameRoot(nameNode);
      return root != null && astryxImports.has(root);
    },

    /**
     * Every `themeProps()` target attached to an opening element.
     *
     * @returns {{node: object, name: string | null, propKeys: string[],
     *   isOpaque: boolean, viaClassName: boolean}[]}
     */
    themeTargets(opening) {
      const targets = [];
      for (const attribute of opening.attributes) {
        const subtree =
          attribute.type === 'JSXSpreadAttribute'
            ? attribute.argument
            : attribute.value;
        if (subtree == null) continue;

        const roots = [subtree];
        // `{...p}` where `const p = themeProps('x')`.
        if (
          attribute.type === 'JSXSpreadAttribute' &&
          subtree.type === 'Identifier' &&
          localPropsBindings.has(subtree.name)
        ) {
          roots.push(localPropsBindings.get(subtree.name));
        }

        for (const root of roots) {
          walk(root, (node, parent) => {
            if (!isThemePropsCall(node)) {
              return;
            }
            const [nameArg, propsArg] = node.arguments;
            const target = {
              node,
              name:
                nameArg?.type === 'Literal' && typeof nameArg.value === 'string'
                  ? nameArg.value
                  : null,
              propKeys: [],
              isOpaque: false,
              // A target reached through `.className` loses the data-*
              // reflection the same call would have spread.
              viaClassName: isClassNameAccess(node, parent),
            };
            if (propsArg != null) {
              if (propsArg.type === 'ObjectExpression') {
                for (const property of propsArg.properties) {
                  if (property.type !== 'Property') {
                    target.isOpaque = true;
                    continue;
                  }
                  const key = property.key?.name ?? property.key?.value;
                  if (key == null || property.computed) {
                    target.isOpaque = true;
                    continue;
                  }
                  target.propKeys.push(String(key));
                }
              } else {
                target.isOpaque = true;
              }
            }
            targets.push(target);
          });
        }
      }

      return targets;
    },

    /**
     * Arguments of every `stylex.props()` call on an opening element, split
     * into all arguments and the STATE-SELECTED ones: `cond && styles.x`,
     * `cond ? a : b`, and table lookups (`sizeStyles[size]`). All three are
     * how a component varies its styles with a prop or runtime state.
     */
    styleArguments(opening) {
      const all = [];
      const conditional = [];
      for (const attribute of opening.attributes) {
        const subtree =
          attribute.type === 'JSXSpreadAttribute'
            ? attribute.argument
            : attribute.value;
        if (subtree == null) continue;
        walk(subtree, (node) => {
          if (!isStylexPropsCall(node)) return;
          for (const argument of node.arguments) {
            all.push(argument);
            if (
              argument.type === 'LogicalExpression' ||
              argument.type === 'ConditionalExpression' ||
              (argument.type === 'MemberExpression' && argument.computed)
            ) {
              conditional.push(argument);
            }
          }
        });
      }
      return {all, conditional};
    },

    /**
     * CSS property names a style expression applies, or `null` when it cannot
     * be resolved to a `stylex.create()` entry — locally or in the module it
     * was imported from. Callers must treat `null` as "unknown", not "empty".
     */
    resolveStyleProperties(expression) {
      const resolve = (node) => {
        if (node == null) return null;
        // The consumer's own escape hatch (`xstyle`) rides in the same
        // `stylex.props()` call as the component's styles. It is not part of
        // the component's declared theming surface, so it contributes no
        // properties rather than making the whole element unknowable — 117 of
        // the 234 host targets in packages/ apply `xstyle` this way.
        if (node.type === 'Identifier') {
          return CONSUMER_STYLE_BINDINGS.has(node.name) ? [] : null;
        }
        // `cond ? styles.a : null` — a falsy branch applies nothing.
        if (
          node.type === 'Literal' &&
          (node.value === null || node.value === false)
        ) {
          return [];
        }
        // `styles.root`
        if (
          node.type === 'MemberExpression' &&
          !node.computed &&
          node.object?.type === 'Identifier'
        ) {
          return lookupStyleKey(
            node.object.name,
            node.property.name ?? node.property.value,
          );
        }
        // `sizeStyles[size]` — a computed lookup selects one of several keys;
        // the union of all of them is what the element may apply.
        if (
          node.type === 'MemberExpression' &&
          node.computed &&
          node.object?.type === 'Identifier'
        ) {
          const table = stylexCreateProperties.get(node.object.name);
          if (table == null) return null;
          const union = [];
          for (const properties of table.values()) union.push(...properties);
          return union;
        }
        // `styles.variant(size)` — a dynamic style function, same key lookup.
        if (
          node.type === 'CallExpression' &&
          node.callee?.type === 'MemberExpression' &&
          !node.callee.computed &&
          node.callee.object?.type === 'Identifier'
        ) {
          return lookupStyleKey(
            node.callee.object.name,
            node.callee.property.name ?? node.callee.property.value,
          );
        }
        if (node.type === 'LogicalExpression') {
          return resolve(node.right);
        }
        if (node.type === 'ConditionalExpression') {
          const consequent = resolve(node.consequent);
          const alternate = resolve(node.alternate);
          if (consequent == null || alternate == null) return null;
          return [...consequent, ...alternate];
        }
        if (node.type === 'ArrayExpression') {
          const union = [];
          for (const element of node.elements) {
            if (element == null) continue;
            const resolved = resolve(element);
            if (resolved == null) return null;
            union.push(...resolved);
          }
          return union;
        }
        return null;
      };
      return resolve(expression);
    },
  };

  /** Property names for `<binding>.<key>`, in this file or the one it came from. */
  function lookupStyleKey(binding, key) {
    if (key == null) {
      return null;
    }
    const local = stylexCreateProperties.get(binding);
    if (local != null) {
      return local.get(key) ?? null;
    }
    const imported = importedBindings.get(binding);
    if (imported == null) {
      return null;
    }
    return resolveImportedStyleProperties(
      filename,
      imported.source,
      imported.name,
      key,
    );
  }
}

/** `themeProps('x').className` — the call sits under a `.className` member. */
function isClassNameAccess(callNode, parent) {
  const owner = parent ?? callNode.parent;
  return (
    owner?.type === 'MemberExpression' &&
    owner.object === callNode &&
    !owner.computed &&
    owner.property?.name === 'className'
  );
}

/**
 * CSS property names an object literal declares, descending into conditional
 * groups (`':hover'`, `'@media …'`) the way stylex-style-source.js does for
 * imported modules.
 */
function collectObjectProperties(objectExpression) {
  const names = [];
  for (const property of objectExpression.properties) {
    if (property.type !== 'Property') continue;
    const key = property.key?.name ?? property.key?.value;
    if (key == null) continue;
    const name = String(key);
    if (
      (name.startsWith(':') || name.startsWith('@')) &&
      property.value?.type === 'ObjectExpression'
    ) {
      names.push(...collectObjectProperties(property.value));
      continue;
    }
    names.push(name);
  }
  return names;
}
