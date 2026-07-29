// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file require-xstyle-passthrough.js
 * @description ESLint rule ensuring components actually forward the styling
 * props they accept via BaseProps (`xstyle`, `className`, `style`).
 *
 * A component whose props extend BaseProps promises consumers an `xstyle`
 * (plus `className`/`style`) escape hatch. Two common bugs break that promise:
 *
 *   Mode A — the prop is destructured out of props but never referenced, so
 *   it is silently dropped:
 *     function Foo({xstyle, ...rest}: FooProps) {
 *       return <div {...stylex.props(styles.root)} {...rest} />; // xstyle lost
 *     }
 *
 *   Mode B — the prop is NOT destructured and `xstyle` never reaches a place
 *   that can apply it. `xstyle` is a StyleX style object, not a valid HTML
 *   attribute, so it cannot ride a rest spread onto a native DOM element (it
 *   renders as an inert attribute), and with no rest at all it is dropped
 *   outright:
 *     function Foo({...rest}: FooProps) {
 *       return <button {...rest} {...stylex.props(styles.root)} />; // xstyle inert
 *     }
 *     function Bar({icon}: BarProps) {
 *       return <div {...stylex.props(styles.root)} />; // xstyle dropped
 *     }
 *
 * The fix in both cases is to destructure `xstyle` and thread it into the
 * root `stylex.props(...)` / `mergeProps(...)` call (or forward it via an
 * `xstyle={...}` prop to a composed Astryx component).
 *
 * Because `xstyle` is not a DOM attribute, the ONLY way an un-destructured
 * `xstyle` can be forwarded correctly is by spreading the rest object onto a
 * composed Astryx component (a capitalized JSX element), which accepts
 * `xstyle` through its own BaseProps. That case is allowed.
 *
 * `className` and `style` are valid DOM attributes, so they survive a rest
 * spread; this rule only flags the leak case for `xstyle`. Their
 * destructured-but-unused case (Mode A) is still flagged for all three props.
 *
 * Opt out by omitting the prop from the props type (e.g.
 * `Omit<BaseProps, 'xstyle'>`), which is how components like VisuallyHidden
 * intentionally drop it, or by marking an intentionally-unused binding with a
 * leading underscore (e.g. `className: _className`).
 *
 * Scoped to public components — those registered via `<Name>.displayName`.
 */

const STYLING_PROPS = ['xstyle', 'className', 'style'];

/**
 * Collect the names of interfaces in this file that (transitively, within the
 * file) expose an `xstyle` contract through BaseProps, accounting for
 * Omit/Pick opt-outs.
 */
function collectBasePropsInterfaces(program) {
  const interfaces = new Map();
  for (const stmt of program.body) {
    const decl =
      stmt.type === 'ExportNamedDeclaration' ? stmt.declaration : stmt;
    if (decl && decl.type === 'TSInterfaceDeclaration') {
      interfaces.set(decl.id.name, decl);
    }
  }

  const carries = new Map();
  function extendsBaseProps(name, seen) {
    if (carries.has(name)) return carries.get(name);
    if (seen.has(name)) return false;
    seen.add(name);
    const node = interfaces.get(name);
    if (!node || !node.extends) {
      carries.set(name, false);
      return false;
    }
    for (const heritage of node.extends) {
      const expr = heritage.expression;
      if (expr.type === 'Identifier') {
        if (expr.name === 'BaseProps') {
          carries.set(name, true);
          return true;
        }
        if (expr.name === 'Omit' || expr.name === 'Pick') {
          const params = heritage.typeArguments?.params;
          const first = params?.[0];
          const inner = first?.typeName?.name;
          const keys = literalStringUnion(params?.[1]);
          const carriesXstyle =
            expr.name === 'Omit' ? !keys.has('xstyle') : keys.has('xstyle');
          if (inner === 'BaseProps') {
            carries.set(name, carriesXstyle);
            return carriesXstyle;
          }
          if (inner && interfaces.has(inner) && extendsBaseProps(inner, seen)) {
            carries.set(name, carriesXstyle);
            return carriesXstyle;
          }
        }
        if (
          expr.name.endsWith('Props') &&
          interfaces.has(expr.name) &&
          extendsBaseProps(expr.name, seen)
        ) {
          carries.set(name, true);
          return true;
        }
      }
    }
    carries.set(name, false);
    return false;
  }

  const result = new Set();
  for (const name of interfaces.keys()) {
    if (extendsBaseProps(name, new Set())) result.add(name);
  }
  return result;
}

/**
 * Extract the set of string-literal keys from a type node that is either a
 * single string literal (`'xstyle'`) or a union of them
 * (`'xstyle' | 'className'`). Used to read the key list of an Omit/Pick.
 */
function literalStringUnion(typeNode) {
  const keys = new Set();
  if (!typeNode) return keys;
  if (typeNode.type === 'TSLiteralType' && typeNode.literal?.value != null) {
    keys.add(String(typeNode.literal.value));
  } else if (typeNode.type === 'TSUnionType') {
    for (const t of typeNode.types) {
      if (t.type === 'TSLiteralType' && t.literal?.value != null) {
        keys.add(String(t.literal.value));
      }
    }
  }
  return keys;
}

/**
 * Names assigned a `.displayName` at the top level — the codebase convention
 * for a public component (`Foo.displayName = 'Foo'` or the cast form
 * `(Foo as {...}).displayName = 'Foo'`).
 */
function collectDisplayNamedComponents(program) {
  const names = new Set();
  for (const stmt of program.body) {
    if (
      stmt.type !== 'ExpressionStatement' ||
      stmt.expression.type !== 'AssignmentExpression'
    ) {
      continue;
    }
    const left = stmt.expression.left;
    if (
      left.type !== 'MemberExpression' ||
      left.property.type !== 'Identifier' ||
      left.property.name !== 'displayName'
    ) {
      continue;
    }
    if (left.object.type === 'Identifier') {
      names.add(left.object.name);
    } else if (
      left.object.type === 'TSAsExpression' &&
      left.object.expression.type === 'Identifier'
    ) {
      names.add(left.object.expression.name);
    }
  }
  return names;
}

/**
 * Resolve the binding name of a component function — either its own id
 * (`function Foo() {}`) or the variable it is assigned to
 * (`const Foo = function () {}` / `const Foo = () => {}`).
 */
function resolveFunctionName(fn) {
  if (fn.id?.name) return fn.id.name;
  const parent = fn.parent;
  if (
    parent?.type === 'VariableDeclarator' &&
    parent.id.type === 'Identifier'
  ) {
    return parent.id.name;
  }
  return null;
}

/** Get the destructured property name/value pairs from an object pattern. */
function getDestructuredProps(objectPattern) {
  const named = new Map();
  let restName = null;
  for (const prop of objectPattern.properties) {
    if (prop.type === 'RestElement' && prop.argument.type === 'Identifier') {
      restName = prop.argument.name;
    } else if (prop.type === 'Property' && prop.key.type === 'Identifier') {
      const local =
        prop.value.type === 'Identifier'
          ? prop.value.name
          : prop.value.type === 'AssignmentPattern' &&
              prop.value.left.type === 'Identifier'
            ? prop.value.left.name
            : null;
      named.set(prop.key.name, local);
    }
  }
  return {named, restName};
}

/** Does the props-type annotation of a param reference a BaseProps interface? */
function paramCarriesBaseProps(param, basePropsInterfaces) {
  const ann = param.typeAnnotation?.typeAnnotation;
  if (!ann) return false;
  if (ann.type === 'TSTypeReference' && ann.typeName.type === 'Identifier') {
    return basePropsInterfaces.has(ann.typeName.name);
  }
  return false;
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require components to forward the styling props (xstyle/className/style) they accept via BaseProps',
      category: 'Possible Errors',
      recommended: true,
    },
    messages: {
      unusedStylingProp:
        '`{{prop}}` is destructured from props but never forwarded, so the ' +
        'consumer override is silently dropped. Thread it into the root ' +
        '`stylex.props(...)` / `mergeProps(...)` call, or forward it to a ' +
        'composed component.',
      xstyleDropped:
        'This component accepts `xstyle` via BaseProps but never forwards it, ' +
        'so the consumer’s `xstyle` override is silently dropped. `xstyle` is a ' +
        'StyleX style object, not an HTML attribute, so it cannot ride a rest ' +
        'spread onto a DOM element. Destructure `xstyle` and pass it into the ' +
        'root `stylex.props(...)` / `mergeProps(...)` call.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const basePropsInterfaces = collectBasePropsInterfaces(sourceCode.ast);
    // Public components are those registered via `<Name>.displayName = ...`.
    // Scoping to these keeps the rule focused on the public prop contract and
    // skips internal render helpers that reuse a props type.
    const componentNames = collectDisplayNamedComponents(sourceCode.ast);

    function checkComponent(fn) {
      const name = resolveFunctionName(fn);
      if (!name || !componentNames.has(name)) return;

      const param = fn.params[0];
      if (!param || param.type !== 'ObjectPattern') return;
      const objectPattern = param;

      const {named, restName} = getDestructuredProps(objectPattern);

      // Mode A: destructured styling prop that is never referenced in the body.
      for (const prop of STYLING_PROPS) {
        if (!named.has(prop)) continue;
        const local = named.get(prop) ?? prop;
        // A leading underscore is the conventional "intentionally unused"
        // marker (e.g. `className: _className`) — an explicit opt-out.
        if (local.startsWith('_')) continue;
        const refs = countReferences(sourceCode, fn.body, local);
        if (refs === 0) {
          const propNode = objectPattern.properties.find(
            p =>
              p.type === 'Property' &&
              p.key.type === 'Identifier' &&
              p.key.name === prop,
          );
          context.report({
            node: propNode ?? objectPattern,
            messageId: 'unusedStylingProp',
            data: {prop},
          });
        }
      }

      // Mode B: props carry the xstyle contract but xstyle is neither
      // destructured nor forwarded. Since xstyle is not a DOM attribute, it can
      // only be forwarded by spreading rest onto a composed Astryx component
      // (a capitalized JSX element). A rest spread onto a native DOM element,
      // or no forwarding path at all, drops xstyle.
      const carries = paramCarriesBaseProps(param, basePropsInterfaces);
      if (carries && !named.has('xstyle')) {
        const forwardedToComponent = restName
          ? isRestSpreadOnComponent(sourceCode, fn.body, restName)
          : false;
        if (!forwardedToComponent) {
          const domLeak = restName
            ? findRestSpreadOnDomElement(sourceCode, fn.body, restName)
            : null;
          context.report({
            node: domLeak ? domLeak.node : objectPattern,
            messageId: 'xstyleDropped',
            data: {},
          });
        }
      }
    }

    return {
      FunctionDeclaration: checkComponent,
      FunctionExpression: checkComponent,
      ArrowFunctionExpression: checkComponent,
    };
  },
};

/** Count identifier references to `name` inside a body subtree. */
function countReferences(sourceCode, body, name) {
  let count = 0;
  const visited = new Set();
  function walk(node) {
    if (!node || typeof node !== 'object' || visited.has(node)) return;
    visited.add(node);
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node.type === 'Identifier' && node.name === name) {
      count += 1;
    }
    for (const key of Object.keys(node)) {
      if (key === 'parent') continue;
      const child = node[key];
      if (child && typeof child === 'object') walk(child);
    }
  }
  walk(body);
  return count;
}

/**
 * Find a JSXSpreadAttribute `{...restName}` applied to a native (lowercase)
 * JSX element. Returns {node, element} or null.
 */
function findRestSpreadOnDomElement(sourceCode, body, restName) {
  let found = null;
  const visited = new Set();
  function walk(node) {
    if (!node || typeof node !== 'object' || visited.has(node) || found) return;
    visited.add(node);
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node.type === 'JSXOpeningElement') {
      const nameNode = node.name;
      const isDom =
        nameNode.type === 'JSXIdentifier' && /^[a-z]/.test(nameNode.name);
      if (isDom) {
        for (const attr of node.attributes) {
          if (
            attr.type === 'JSXSpreadAttribute' &&
            attr.argument.type === 'Identifier' &&
            attr.argument.name === restName
          ) {
            found = {node: attr, element: nameNode.name};
            return;
          }
        }
      }
    }
    for (const key of Object.keys(node)) {
      if (key === 'parent') continue;
      const child = node[key];
      if (child && typeof child === 'object') walk(child);
    }
  }
  walk(body);
  return found;
}

/**
 * Is `{...restName}` spread onto a composed component (a capitalized JSX
 * element)? Such a component accepts `xstyle` through its own BaseProps, so
 * forwarding the rest object there is a valid passthrough.
 */
function isRestSpreadOnComponent(sourceCode, body, restName) {
  let found = false;
  const visited = new Set();
  function walk(node) {
    if (!node || typeof node !== 'object' || visited.has(node) || found) return;
    visited.add(node);
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node.type === 'JSXOpeningElement') {
      const nameNode = node.name;
      const isComponent =
        (nameNode.type === 'JSXIdentifier' && /^[A-Z]/.test(nameNode.name)) ||
        nameNode.type === 'JSXMemberExpression';
      if (isComponent) {
        for (const attr of node.attributes) {
          if (
            attr.type === 'JSXSpreadAttribute' &&
            attr.argument.type === 'Identifier' &&
            attr.argument.name === restName
          ) {
            found = true;
            return;
          }
        }
      }
    }
    for (const key of Object.keys(node)) {
      if (key === 'parent') continue;
      const child = node[key];
      if (child && typeof child === 'object') walk(child);
    }
  }
  walk(body);
  return found;
}

export default rule;
