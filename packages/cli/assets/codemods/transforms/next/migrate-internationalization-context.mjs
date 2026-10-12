// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Migrate a raw `InternationalizationContext` value to the provider.
 *
 * Rendering a value straight into `InternationalizationContext` no longer
 * configures Astryx: `useLocale`, `useDirection`, `useCollator` and every
 * core component read a runtime context that only `InternationalizationProvider`
 * writes. The provider takes the same configuration under its own prop names,
 * so the rewrite is mechanical where the value is plain:
 *
 *   <InternationalizationContext value={v}>          → <InternationalizationProvider
 *   <InternationalizationContext.Provider value={v}>     locale={v.locale}
 *                                                        dir={v.direction}
 *                                                        messages={v.messages}>
 *
 * A variable maps the fields every context value has (`overrides` is
 * optional, so a variable's type may lack it; the TODO names it); an inline
 * object literal maps key by key and keeps only the keys it has. The provider has no `translate` input, and
 * `translate` is a field of every context value, so every rewrite carries a
 * TODO naming where those strings go (`messages` or `overrides`); a literal's
 * `translate` key is kept beside it. A value that is any other expression
 * (a call, a spread into a literal, a conditional) is left unchanged behind a
 * TODO that says why: a call would run once per prop, and a spread of the
 * ambient value would mount a provider without the app's catalogs.
 *
 * Only an element whose name resolves, unshadowed, to an Astryx import is
 * rewritten (named, aliased, or namespace; a type-only import proves nothing;
 * a same-named declaration in any block, function, loop head or catch clause
 * between the element and the module shadows it, as does a `var` anywhere in
 * the enclosing function and a named class expression's own name). The
 * provider is imported under a free name when the module already binds
 * `InternationalizationProvider` to something of its own, and the name
 * written must itself reach that import at the edit site. An element whose
 * value arrives through spread props gets the TODO and no rewrite.
 * The import gains `InternationalizationProvider` under the file's existing
 * local name for it when it has one, and loses the context import when
 * nothing else reads it. A second run changes nothing.
 */

const PACKAGE_PATTERN = /^@(astryxdesign|xds)\/core(\/i18n)?$/u;
const CONTEXT = 'InternationalizationContext';
const PROVIDER = 'InternationalizationProvider';

/** Context value key → provider prop. */
const PROP_FOR_KEY = new Map([
  ['locale', 'locale'],
  ['direction', 'dir'],
  ['messages', 'messages'],
  ['overrides', 'overrides'],
]);

/**
 * The keys every context value has. A variable's inferred type may lack the
 * optional `overrides`, and reading it would fail to typecheck, so a variable
 * maps only these and the TODO names `overrides` beside `translate`.
 */
const REQUIRED_KEYS = ['locale', 'direction', 'messages'];

const TODO_PREFIX = ' TODO(astryx upgrade): ';
const TODO_TRANSLATE =
  `${TODO_PREFIX}InternationalizationProvider has no \`translate\` input; ` +
  'express those strings as `messages` (a catalog per locale) or `overrides`. ';
const TODO_VARIABLE =
  `${TODO_PREFIX}InternationalizationProvider has no \`translate\` input; ` +
  'express those strings as `messages` (a catalog per locale) or `overrides`; ' +
  'pass the value\u2019s `overrides`, if it has any, as `overrides`. ';
const TODO_EXPRESSION =
  `${TODO_PREFIX}a raw InternationalizationContext value no longer configures Astryx; ` +
  'mount InternationalizationProvider with this value\u2019s `locale`, `direction` (as `dir`), ' +
  '`messages` and `overrides`. Not rewritten here: the value is an expression, ' +
  'and a provider takes no catalogs from a parent, so a spread of the ambient ' +
  'value would lose them and a call would run once per prop. ';

export const meta = {
  title:
    'Migrate a raw InternationalizationContext value to InternationalizationProvider',
  description:
    'Rewrites `<InternationalizationContext value={…}>` (or its `.Provider`) to `<InternationalizationProvider locale dir messages>` (plus `overrides` from an inline literal), the only way to configure Astryx; `translate`, a variable’s `overrides`, and any other value are left behind a TODO.',
  fileExtensions: ['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs'],
};

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | undefined}
 */
export default function migrateInternationalizationContext(file, api) {
  if (!file.source.includes(CONTEXT)) return undefined;

  const j = api.jscodeshift;
  const root = j(file.source);

  // Runtime bindings to the Astryx context (named/aliased), namespaces, and
  // the file's local name for the provider if it already imports one.
  /** @type {Set<string>} */
  const contextNames = new Set();
  /** @type {Set<string>} */
  const namespaceNames = new Set();
  /** @type {string | null} */
  let importedProviderName = null;
  /** @type {any[]} */
  const astryxImports = [];
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    const source = path.node.source.value;
    if (path.node.importKind === 'type') return;
    if (typeof source !== 'string' || !PACKAGE_PATTERN.test(source)) return;
    astryxImports.push(path);
    for (const specifier of path.node.specifiers ?? []) {
      if (specifier.importKind === 'type') continue;
      if (specifier.type === 'ImportSpecifier') {
        if (specifier.imported?.name === CONTEXT) {
          contextNames.add(specifier.local?.name ?? CONTEXT);
        } else if (specifier.imported?.name === PROVIDER) {
          importedProviderName = specifier.local?.name ?? PROVIDER;
        }
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        namespaceNames.add(specifier.local.name);
      }
    }
  });
  if (contextNames.size === 0 && namespaceNames.size === 0) return undefined;

  // Every identifier the module binds anywhere (declarations, imports,
  // parameters, catch clauses, class and function names), so a provider
  // import added here takes a name nothing else holds.
  /** @type {Set<string>} */
  const boundNames = new Set();
  root.find(j.Identifier).forEach((/** @type {any} */ p) => {
    const parent = p.parent?.node;
    if (!parent) return;
    const binds =
      (parent.type === 'VariableDeclarator' && parent.id === p.node) ||
      ((parent.type === 'FunctionDeclaration' ||
        parent.type === 'FunctionExpression' ||
        parent.type === 'ClassDeclaration' ||
        parent.type === 'ClassExpression') &&
        parent.id === p.node) ||
      parent.type === 'ImportSpecifier' ||
      parent.type === 'ImportDefaultSpecifier' ||
      parent.type === 'ImportNamespaceSpecifier' ||
      parent.type === 'CatchClause' ||
      parent.type === 'RestElement' ||
      parent.type === 'AssignmentPattern' ||
      parent.type === 'ArrayPattern' ||
      (parent.type === 'ObjectProperty' &&
        parent.value === p.node &&
        p.parent.parent?.node.type === 'ObjectPattern') ||
      (parent.type === 'Property' &&
        parent.value === p.node &&
        p.parent.parent?.node.type === 'ObjectPattern') ||
      ((parent.type === 'FunctionDeclaration' ||
        parent.type === 'FunctionExpression' ||
        parent.type === 'ArrowFunctionExpression' ||
        parent.type === 'ObjectMethod' ||
        parent.type === 'ClassMethod') &&
        parent.params.includes(p.node));
    if (binds) boundNames.add(p.node.name);
  });
  // The name a named import of the provider takes: the file's own when it has
  // one; otherwise `InternationalizationProvider`, or a free alias when the
  // module already binds that name to something else (its own wrapper, say).
  /** @type {string} */
  let providerLocalName = importedProviderName ?? PROVIDER;
  if (importedProviderName === null) {
    for (let n = 2; boundNames.has(providerLocalName); n += 1) {
      providerLocalName = `${PROVIDER}${n}`;
    }
  }
  // A `type` specifier of the provider proves nothing at runtime, so it does
  // not count as an import either.
  const providerNeedsImport = !astryxImports.some((/** @type {any} */ path) =>
    (path.node.specifiers ?? []).some(
      (/** @type {any} */ s) =>
        s.type === 'ImportSpecifier' &&
        s.importKind !== 'type' &&
        s.imported?.name === PROVIDER,
    ),
  );

  /** The identifiers a binding pattern declares. */
  const patternNames = (
    /** @type {any} */ node,
    /** @type {string[]} */ out = [],
  ) => {
    if (!node) return out;
    switch (node.type) {
      case 'Identifier':
        out.push(node.name);
        break;
      case 'ObjectPattern':
        for (const property of node.properties) {
          patternNames(
            property.type === 'RestElement'
              ? property.argument
              : property.value,
            out,
          );
        }
        break;
      case 'ArrayPattern':
        for (const element of node.elements) patternNames(element, out);
        break;
      case 'RestElement':
        patternNames(node.argument, out);
        break;
      case 'AssignmentPattern':
        patternNames(node.left, out);
        break;
      case 'TSParameterProperty':
        patternNames(node.parameter, out);
        break;
      default:
        break;
    }
    return out;
  };

  /**
   * Whether a `var` named `name` is declared anywhere inside `node` without
   * crossing into a nested function: a `var` hoists to its whole function.
   */
  const declaresVar = (/** @type {any} */ node, /** @type {string} */ name) => {
    let found = false;
    const visit = (/** @type {any} */ n) => {
      if (found || !n || typeof n !== 'object') return;
      if (Array.isArray(n)) {
        n.forEach(visit);
        return;
      }
      if (
        n.type === 'FunctionDeclaration' ||
        n.type === 'FunctionExpression' ||
        n.type === 'ArrowFunctionExpression' ||
        n.type === 'ObjectMethod' ||
        n.type === 'ClassMethod'
      ) {
        return;
      }
      if (
        n.type === 'VariableDeclaration' &&
        n.kind === 'var' &&
        n.declarations.some((/** @type {any} */ d) =>
          patternNames(d.id).includes(name),
        )
      ) {
        found = true;
        return;
      }
      for (const key of Object.keys(n)) {
        if (key === 'loc' || key === 'comments' || key === 'type') continue;
        visit(n[key]);
      }
    };
    visit(node);
    return found;
  };

  /** Whether a statement list declares `name` (as a variable, function or class). */
  const bodyDeclares = (
    /** @type {any[]} */ statements,
    /** @type {string} */ name,
  ) =>
    statements.some((/** @type {any} */ statement) => {
      if (statement.type === 'VariableDeclaration') {
        return statement.declarations.some((/** @type {any} */ d) =>
          patternNames(d.id).includes(name),
        );
      }
      if (
        statement.type === 'FunctionDeclaration' ||
        statement.type === 'ClassDeclaration'
      ) {
        return statement.id?.name === name;
      }
      return false;
    });

  /**
   * The binding a JSX identifier resolves to is the module-level import:
   * no block, function, catch clause or loop head between the element and
   * the module declares the same name. Blocks get their own scope here
   * (`let`/`const`/`class` are block-scoped), which the generic scope model
   * does not give them.
   * @param {any} path a JSXElement path
   * @param {string} name
   */
  const isImportBinding = (path, name) => {
    for (let p = path.parent; p; p = p.parent) {
      const node = p.node;
      switch (node.type) {
        case 'Program':
          return (
            !bodyDeclares(node.body, name) && !declaresVar(node.body, name)
          );
        case 'BlockStatement':
          if (bodyDeclares(node.body, name)) return false;
          break;
        case 'SwitchStatement':
          if (
            bodyDeclares(
              node.cases.flatMap((/** @type {any} */ c) => c.consequent),
              name,
            )
          ) {
            return false;
          }
          break;
        case 'ForStatement':
          if (
            node.init?.type === 'VariableDeclaration' &&
            bodyDeclares([node.init], name)
          ) {
            return false;
          }
          break;
        case 'ForInStatement':
        case 'ForOfStatement':
          if (
            node.left?.type === 'VariableDeclaration' &&
            bodyDeclares([node.left], name)
          ) {
            return false;
          }
          break;
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
        case 'ObjectMethod':
        case 'ClassMethod':
          if (
            node.params.some((/** @type {any} */ param) =>
              patternNames(param).includes(name),
            )
          ) {
            return false;
          }
          if (node.type === 'FunctionExpression' && node.id?.name === name) {
            return false;
          }
          if (declaresVar(node.body, name)) return false;
          break;
        case 'ClassExpression':
          if (node.id?.name === name) return false;
          break;
        case 'CatchClause':
          if (node.param && patternNames(node.param).includes(name))
            return false;
          break;
        default:
          break;
      }
    }
    return false;
  };

  /**
   * How the element names the Astryx context: `''` for a named binding, the
   * namespace's local name for `ns.Ctx`, or null when it is not the context
   * (an unrelated name, or a shadowed one). Accepts a trailing `.Provider`.
   * @param {any} path a JSXElement path
   * @returns {string | null}
   */
  const contextNamespaceOf = path => {
    let name = path.node.openingElement.name;
    if (
      name.type === 'JSXMemberExpression' &&
      name.property?.type === 'JSXIdentifier' &&
      name.property.name === 'Provider'
    ) {
      name = name.object;
    }
    if (name.type === 'JSXIdentifier') {
      return contextNames.has(name.name) && isImportBinding(path, name.name)
        ? ''
        : null;
    }
    if (
      name.type === 'JSXMemberExpression' &&
      name.object?.type === 'JSXIdentifier' &&
      name.property?.type === 'JSXIdentifier' &&
      name.property.name === CONTEXT &&
      namespaceNames.has(name.object.name) &&
      isImportBinding(path, name.object.name)
    ) {
      return name.object.name;
    }
    return null;
  };

  const hasComment = (/** @type {any} */ node, /** @type {string} */ text) =>
    (node.comments ?? []).some((/** @type {any} */ c) => c.value === text);
  const addComment = (/** @type {any} */ node, /** @type {string} */ text) => {
    if (hasComment(node, text)) return false;
    node.comments ??= [];
    node.comments.push(j.commentBlock(text, true, false));
    return true;
  };

  let changed = false;
  let needsNamedProvider = false;
  root.find(j.JSXElement).forEach((/** @type {any} */ path) => {
    const namespace = contextNamespaceOf(path);
    if (namespace === null) return;
    const opening = path.node.openingElement;
    const valueAttribute = (opening.attributes ?? []).find(
      (/** @type {any} */ a) =>
        a.type === 'JSXAttribute' && a.name?.name === 'value',
    );
    if (!valueAttribute) {
      // The value arrives through spread props: nothing to map, but the
      // element still needs the upgrade's marker.
      const spread = (opening.attributes ?? []).find(
        (/** @type {any} */ a) => a.type === 'JSXSpreadAttribute',
      );
      if (spread && addComment(spread, TODO_EXPRESSION)) changed = true;
      return;
    }
    if (valueAttribute.value?.type !== 'JSXExpressionContainer') return;
    const value = valueAttribute.value.expression;

    /** @type {any[]} */
    const props = [];
    /** @type {any[]} */
    const keptKeys = [];
    if (value.type === 'Identifier') {
      for (const key of REQUIRED_KEYS) {
        const prop = /** @type {string} */ (PROP_FOR_KEY.get(key));
        props.push(
          j.jsxAttribute(
            j.jsxIdentifier(prop),
            j.jsxExpressionContainer(
              j.memberExpression(j.identifier(value.name), j.identifier(key)),
            ),
          ),
        );
      }
    } else if (
      value.type === 'ObjectExpression' &&
      value.properties.every(
        (/** @type {any} */ p) =>
          (p.type === 'Property' || p.type === 'ObjectProperty') &&
          !p.computed &&
          (p.key.type === 'Identifier' ||
            p.key.type === 'StringLiteral' ||
            p.key.type === 'Literal'),
      )
    ) {
      for (const property of value.properties) {
        const key = property.key.name ?? property.key.value;
        const prop = PROP_FOR_KEY.get(key);
        if (prop == null) {
          keptKeys.push(property);
          continue;
        }
        props.push(
          j.jsxAttribute(
            j.jsxIdentifier(prop),
            j.jsxExpressionContainer(property.value),
          ),
        );
      }
    } else {
      // A call, a spread, a conditional: nothing mechanical is safe.
      if (addComment(valueAttribute, TODO_EXPRESSION)) changed = true;
      return;
    }

    // The name written must reach the provider import from here: a local
    // that shadows it at the edit site would capture the element.
    if (namespace === '' && !isImportBinding(path, providerLocalName)) {
      if (addComment(valueAttribute, TODO_EXPRESSION)) changed = true;
      return;
    }
    const providerName =
      namespace === ''
        ? j.jsxIdentifier(providerLocalName)
        : j.jsxMemberExpression(
            j.jsxIdentifier(namespace),
            j.jsxIdentifier(PROVIDER),
          );
    if (namespace === '' && providerNeedsImport) {
      needsNamedProvider = true;
    }

    const otherAttributes = (opening.attributes ?? []).filter(
      (/** @type {any} */ a) => a !== valueAttribute,
    );
    opening.name = providerName;
    opening.attributes = [...otherAttributes, ...props];
    if (path.node.closingElement) {
      path.node.closingElement.name = providerName;
    }
    // Every context value has a `translate`; the provider has no input for it.
    const todo = props[props.length - 1] ?? opening;
    if (keptKeys.length > 0) {
      const kept = j.jsxAttribute(
        j.jsxIdentifier('data-astryx-upgrade-translate'),
        j.jsxExpressionContainer(j.objectExpression(keptKeys)),
      );
      addComment(kept, TODO_TRANSLATE);
      opening.attributes.push(kept);
    } else {
      addComment(
        todo,
        value.type === 'Identifier' ? TODO_VARIABLE : TODO_TRANSLATE,
      );
    }
    changed = true;
  });

  if (!changed) return undefined;

  if (needsNamedProvider) {
    for (const path of astryxImports) {
      const specifiers = path.node.specifiers ?? [];
      if (
        !specifiers.some(
          (/** @type {any} */ s) =>
            s.type === 'ImportSpecifier' && s.imported?.name === CONTEXT,
        )
      ) {
        continue;
      }
      specifiers.push(
        j.importSpecifier(
          j.identifier(PROVIDER),
          j.identifier(providerLocalName),
        ),
      );
      break;
    }
  }

  // Drop the context import when the file no longer names it anywhere.
  for (const localName of contextNames) {
    const stillNamed =
      root
        .find(j.Identifier, {name: localName})
        .filter(
          (/** @type {any} */ p) => p.parent?.node.type !== 'ImportSpecifier',
        )
        .size() > 0 || root.find(j.JSXIdentifier, {name: localName}).size() > 0;
    if (stillNamed) continue;
    for (const path of astryxImports) {
      path.node.specifiers = (path.node.specifiers ?? []).filter(
        (/** @type {any} */ s) =>
          !(
            s.type === 'ImportSpecifier' &&
            s.imported?.name === CONTEXT &&
            (s.local?.name ?? CONTEXT) === localName
          ),
      );
    }
  }

  return root.toSource({quote: 'single'});
}
