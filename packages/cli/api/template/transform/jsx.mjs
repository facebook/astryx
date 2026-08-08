// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file jscodeshift AST helpers for the declarative template-transform steps
 * (wrap + ensure-import). Kept separate from the orchestrator (`apply.mjs`) so
 * each helper is independently unit-testable against a raw jscodeshift instance.
 *
 * All helpers MUTATE the passed jscodeshift `root` in place and return whether
 * they changed anything; the caller decides when to `root.toSource()`.
 *
 * @position api/template/transform — the JSX/import builders the declarative
 *   wrap/addImports steps compile down to.
 */

/**
 * Build JSX attributes from a plain props object. String values render as
 * string literals (`name="v"`); `true` renders as a bare attribute (`name`);
 * numbers and `false` render as expression containers (`name={3}`,
 * `name={false}`). Anything richer belongs in a programmatic transform.
 *
 * @param {import('../../../authoring/codemod/type').JscodeshiftFactory} j
 * @param {Record<string, import('../../../authoring/template-transform/type').TemplateWrapPropValue | undefined>} [props]
 * @returns {any[]} JSX attribute nodes
 */
export function buildJsxAttributes(j, props = {}) {
  /** @type {any[]} */
  const attrs = [];
  for (const [name, value] of Object.entries(props)) {
    if (value === undefined) continue;
    // Defensive: never emit a corrupt attribute name. A name with a space would
    // silently split into two attributes when re-parsed (`bad key` -> `bad`
    // `key`), which validation can't catch. The parser rejects these at author
    // time; this is the belt-and-suspenders for direct engine callers.
    if (!VALID_ATTR_NAME.test(name)) continue;

    const id = j.jsxIdentifier(name);
    if (value === true) {
      attrs.push(j.jsxAttribute(id, null));
    } else if (typeof value === 'string') {
      // JSX attribute strings cannot escape their own delimiter, so a value
      // containing a quote must go through a JS string literal in an expression
      // container (which can escape) — otherwise the emitted attribute is
      // unparseable. Quote-free strings stay the idiomatic `name="value"`.
      attrs.push(
        value.includes('"') || value.includes("'")
          ? j.jsxAttribute(id, j.jsxExpressionContainer(j.stringLiteral(value)))
          : j.jsxAttribute(id, j.stringLiteral(value)),
      );
    } else {
      // number / boolean-false / null / object / array -> expression container.
      attrs.push(
        j.jsxAttribute(id, j.jsxExpressionContainer(valueToExpression(j, value))),
      );
    }
  }
  return attrs;
}

/**
 * Build an expression AST from a JSON-shaped value: primitives -> literals,
 * arrays -> array expressions, plain objects -> object expressions (identifier
 * keys where valid, string-literal keys otherwise). Enables object/array props
 * like `config={{theme: 'dark'}}` while staying fully static.
 * @param {import('../../../authoring/codemod/type').JscodeshiftFactory} j
 * @param {any} value
 * @returns {any} an expression node
 */
function valueToExpression(j, value) {
  if (value === null) return j.literal(null);
  if (Array.isArray(value)) {
    return j.arrayExpression(
      value.map(v => valueToExpression(j, v === undefined ? null : v)),
    );
  }
  if (typeof value === 'object') {
    /** @type {any[]} */
    const properties = [];
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      const key = VALID_JS_IDENT.test(k) ? j.identifier(k) : j.literal(k);
      const valueNode = valueToExpression(j, v);
      properties.push(
        typeof j.objectProperty === 'function'
          ? j.objectProperty(key, valueNode)
          : j.property('init', key, valueNode),
      );
    }
    return j.objectExpression(properties);
  }
  return j.literal(value);
}

/**
 * A valid JSX attribute name: an identifier that may contain hyphens (for
 * `data-*` / `aria-*`). Deliberately excludes spaces and other separators that
 * would split into multiple attributes when re-parsed.
 */
const VALID_ATTR_NAME = /^[A-Za-z_$][A-Za-z0-9_$-]*$/;

/** A valid JS identifier — used for object-literal keys (no hyphens). */
const VALID_JS_IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * Whether a wrap spec can be safely emitted. Mirrors the authoring parser's
 * rules so the engine holds the line for direct callers too: the component must
 * be a plain identifier (a name carrying spaces or angle brackets would splice
 * arbitrary syntax into the opening tag) and the module specifier must be
 * present (without it the wrapper would be emitted with nothing importing it).
 *
 * @param {any} spec
 * @returns {boolean}
 */
export function isValidWrapSpec(spec) {
  return Boolean(
    spec &&
      typeof spec.component === 'string' &&
      VALID_COMPONENT_NAME.test(spec.component) &&
      typeof spec.from === 'string' &&
      spec.from.length > 0,
  );
}

/** A wrapper component name — the same shape the authoring parser enforces. */
const VALID_COMPONENT_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * Node types that introduce their own function scope (and thus their own
 * `return`s). Used both to recognize a default-export component and to skip
 * `return`s that belong to a NESTED callback (e.g. inside `items.map(() => …)`).
 * @param {any} n
 * @returns {boolean}
 */
function isFunctionNode(n) {
  return (
    n != null &&
    (n.type === 'FunctionDeclaration' ||
      n.type === 'FunctionExpression' ||
      n.type === 'ArrowFunctionExpression')
  );
}

/**
 * True when a declaration lives directly in the module body rather than inside
 * a function or block. Only a module-level binding can be what
 * `export default Name` refers to — a same-named `const Name` inside some other
 * function is an entirely different variable, and rewriting it would wrap the
 * wrong component while leaving the real default export untouched.
 * @param {any} path
 * @returns {boolean}
 */
function isModuleLevel(path) {
  let p = path.parent;
  // Skip the wrappers that sit between a declaration and the module body:
  // `const X = …` (VariableDeclaration) and `export …` forms.
  while (
    p &&
    (p.node.type === 'VariableDeclaration' ||
      p.node.type === 'ExportNamedDeclaration' ||
      p.node.type === 'ExportDefaultDeclaration')
  ) {
    p = p.parent;
  }
  return Boolean(p && p.node.type === 'Program');
}

/**
 * Locate the PATH of the function behind a module's `export default`. Handles a
 * directly-exported function/arrow and `export default Name` that resolves to a
 * MODULE-LEVEL `function Name` or `const Name = () => …`. Returns a jscodeshift
 * path (so callers can identify returns that belong to it) or null. Anything
 * else — `export default forwardRef(…)`, `memo(Fn)`, a class, an imported
 * binding, `export { X as default }` — resolves to null, and the caller safely
 * leaves the source untouched.
 *
 * @param {import('../../../authoring/codemod/type').JscodeshiftFactory} j
 * @param {any} root jscodeshift collection for the file
 * @returns {any | null}
 */
function findDefaultExportFunctionPath(j, root) {
  const exp = root.find(j.ExportDefaultDeclaration);
  if (exp.size() === 0) return null;
  const declPath = exp.paths()[0].get('declaration');
  const decl = declPath.node;
  if (!decl) return null;

  if (isFunctionNode(decl)) return declPath;

  if (decl.type === 'Identifier') {
    const name = decl.name;

    const fnDecl = root
      .find(j.FunctionDeclaration, {id: {name}})
      .filter((/** @type {any} */ p) => isModuleLevel(p));
    if (fnDecl.size() > 0) return fnDecl.paths()[0];

    /** @type {any | null} */
    let found = null;
    root
      .find(j.VariableDeclarator, {id: {name}})
      .filter((/** @type {any} */ p) => isModuleLevel(p))
      .forEach((/** @type {any} */ p) => {
        if (found) return;
        if (isFunctionNode(p.node.init)) found = p.get('init');
      });
    if (found) return found;
  }

  return null;
}

/**
 * The nearest enclosing function node of a path, or null. Walks parent PATHS, so
 * a `return` inside a nested callback resolves to that callback rather than the
 * outer component — the key to only wrapping the component's own returns.
 * @param {any} path
 * @returns {any | null}
 */
function nearestFunction(path) {
  let p = path.parent;
  while (p) {
    if (isFunctionNode(p.node)) return p.node;
    p = p.parent;
  }
  return null;
}

/**
 * True when `node` is a JSX element whose opening tag name is exactly `name`
 * (used as the idempotency guard so a template already wrapped in the wrapper
 * component is left untouched).
 * @param {any} node
 * @param {string} name
 * @returns {boolean}
 */
function isElementNamed(node, name) {
  return (
    node != null &&
    node.type === 'JSXElement' &&
    node.openingElement?.name?.type === 'JSXIdentifier' &&
    node.openingElement.name.name === name
  );
}

/**
 * Wrap an expression as the single child of `<Component …props>{expr}</Component>`.
 * JSX elements/fragments become direct children; any other expression is wrapped
 * in an expression container.
 * @param {import('../../../authoring/codemod/type').JscodeshiftFactory} j
 * @param {string} component
 * @param {any[]} attrs
 * @param {any} expr
 * @returns {any} a JSXElement node
 */
function wrapExpression(j, component, attrs, expr) {
  const inner = stripSourceParens(expr);
  const child =
    inner.type === 'JSXElement' || inner.type === 'JSXFragment'
      ? inner
      : j.jsxExpressionContainer(inner);
  // Surround the child with newline text nodes. The child keeps its original
  // formatting (recast reprints it verbatim), so without these the wrapper
  // would hug it — `<Shell><Layout` … `/></Shell>` — which is valid but ugly in
  // source a user is about to paste. Whitespace-only JSX text containing a
  // newline is stripped at compile time, so this is purely cosmetic.
  return j.jsxElement(
    j.jsxOpeningElement(j.jsxIdentifier(component), attrs, false),
    j.jsxClosingElement(j.jsxIdentifier(component)),
    [j.jsxText('\n'), child, j.jsxText('\n')],
  );
}

/**
 * Clear Babel's "this expression was parenthesized in source" marker. The
 * template's `return (<JSX/>)` marks the argument as parenthesized; without
 * clearing it, recast reprints those parens around the moved node — and in a
 * JSX child position they become literal `(`/`)` text.
 * @param {any} node
 * @returns {any} the same node, mutated
 */
function stripSourceParens(node) {
  if (node && node.extra) {
    node.extra.parenthesized = false;
    node.extra.parenStart = undefined;
  }
  return node;
}

/**
 * A single wrapper spec the wrap helper consumes (import fields like `from` /
 * `importKind` are handled separately by {@link ensureImport}).
 * @typedef {object} WrapSpec
 * @property {string} component
 * @property {Record<string, import('../../../authoring/template-transform/type').TemplateWrapPropValue | undefined>} [props]
 */

/**
 * Wrap the JSX returned by the module's default-export component in a component
 * or a STACK of components (outermost first) — `[Provider, Shell]` yields
 * `<Provider><Shell>…</Shell></Provider>`. Handles an arrow expression body and
 * EVERY `return` that belongs to the component function itself (including early
 * returns nested in top-level `if`/`switch`/`try`), while never touching
 * `return`s inside nested callbacks (e.g. `items.map(() => <li/>)`). Idempotent:
 * a return whose top element is already the OUTERMOST wrapper is left untouched,
 * so re-emitting never re-stacks. Does NOT add imports — see {@link ensureImport}.
 *
 * @param {import('../../../authoring/codemod/type').JscodeshiftFactory} j
 * @param {any} root jscodeshift collection for the file
 * @param {WrapSpec[]} wraps the wrapper stack (outermost first), one or more
 * @param {string[]} [skipIfRootIs] extra root element names that mean "already
 *   wrapped" — e.g. the app shell, so a template that renders its own shell is
 *   never nested inside another one
 * @returns {boolean} whether anything was wrapped
 */
export function wrapDefaultExportReturn(j, root, wraps, skipIfRootIs = []) {
  if (!Array.isArray(wraps) || wraps.length === 0) return false;

  const fnPath = findDefaultExportFunctionPath(j, root);
  if (!fnPath) return false;
  const fnNode = fnPath.node;
  const outermost = wraps[0].component;
  const alreadyWrapped = (/** @type {any} */ node) =>
    isElementNamed(node, outermost) ||
    skipIfRootIs.some(name => isElementNamed(node, name));

  // Build the full nesting around `arg`, innermost applied first so the array's
  // first entry ends up outermost.
  const buildStack = (/** @type {any} */ arg) => {
    let node = arg;
    for (let i = wraps.length - 1; i >= 0; i--) {
      node = wrapExpression(
        j,
        wraps[i].component,
        buildJsxAttributes(j, wraps[i].props),
        node,
      );
    }
    return node;
  };

  // Arrow with an expression body: `() => (<X/>)`.
  if (fnNode.body && fnNode.body.type !== 'BlockStatement') {
    if (alreadyWrapped(fnNode.body)) return false;
    fnNode.body = buildStack(fnNode.body);
    return true;
  }

  // Block body: wrap every return OWNED by this function (skip nested callbacks
  // and returns belonging to other module functions).
  let changed = false;
  root.find(j.ReturnStatement).forEach((/** @type {any} */ rp) => {
    const arg = rp.node.argument;
    if (!arg) return;
    if (nearestFunction(rp) !== fnNode) return;
    if (alreadyWrapped(arg)) return;
    rp.node.argument = buildStack(arg);
    changed = true;
  });
  return changed;
}

/**
 * Whether importing `name` from `from` would collide with a binding the module
 * already has. An import from the SAME module is not a collision —
 * {@link ensureImport} reuses that binding. Anything else is: emitting the
 * import would double-declare the name (invalid), while skipping it would
 * silently bind the wrapper to whatever the name already means. Callers abandon
 * the transform rather than guess between those two bad outcomes.
 *
 * @param {import('../../../authoring/codemod/type').JscodeshiftFactory} j
 * @param {any} root jscodeshift collection for the file
 * @param {{from: string, name: string}} spec
 * @returns {boolean}
 */
export function importBindingConflict(j, root, {from, name}) {
  let conflict = false;

  root.find(j.ImportDeclaration).forEach((/** @type {any} */ p) => {
    if (p.node.source?.value === from) return;
    for (const s of p.node.specifiers || []) {
      if (s.local?.name === name) conflict = true;
    }
  });

  /** @param {any} idNode @returns {boolean} */
  const bindsName = idNode => {
    if (!idNode) return false;
    if (idNode.type === 'Identifier') return idNode.name === name;
    // Destructuring pattern: over-approximate by treating any identifier in the
    // pattern as bound. Being conservative only costs a skipped transform.
    return j(idNode).find(j.Identifier, {name}).size() > 0;
  };

  root.find(j.VariableDeclarator).forEach((/** @type {any} */ p) => {
    if (isModuleLevel(p) && bindsName(p.node.id)) conflict = true;
  });
  for (const kind of [j.FunctionDeclaration, j.ClassDeclaration]) {
    root.find(kind).forEach((/** @type {any} */ p) => {
      if (isModuleLevel(p) && p.node.id?.name === name) conflict = true;
    });
  }

  return conflict;
}

/**
 * Ensure an import is present. Merges into an existing import from the same
 * module (deduping named specifiers, adding a default specifier if absent),
 * otherwise inserts a new import after the last import — or, when there are no
 * imports, after any leading directive prologue (e.g. `'use client'`).
 *
 * @param {import('../../../authoring/codemod/type').JscodeshiftFactory} j
 * @param {any} root jscodeshift collection for the file
 * @param {{from: string, named?: string[], default?: string, typeOnly?: boolean}} spec
 * @returns {boolean} whether the import set changed
 */
export function ensureImport(j, root, spec) {
  const {from, named = [], default: defaultName, typeOnly = false} = spec;
  if (!from) return false;
  if (named.length === 0 && !defaultName) return false;

  let changed = false;

  // Only merge into a declaration that can accept more specifiers. A namespace
  // import (`import * as X from 'm'`) cannot be combined with named/default
  // specifiers, so we skip it and add a separate import statement below.
  const mergeable = root
    .find(j.ImportDeclaration)
    .filter(
      (/** @type {any} */ p) =>
        p.node.source?.value === from &&
        !(p.node.specifiers || []).some(
          (/** @type {any} */ s) => s.type === 'ImportNamespaceSpecifier',
        ),
    );

  if (mergeable.size() > 0) {
    const decl = mergeable.paths()[0].node;
    const specifiers = decl.specifiers || [];

    const existingNamed = new Set(
      specifiers
        .filter((/** @type {any} */ s) => s.type === 'ImportSpecifier')
        .map((/** @type {any} */ s) => s.imported?.name),
    );
    const hasDefault = specifiers.some(
      (/** @type {any} */ s) => s.type === 'ImportDefaultSpecifier',
    );
    // Every already-bound local from this module. Adding a specifier whose local
    // name is already bound here would double-declare it (invalid), so skip it —
    // the existing binding is reused rather than duplicated.
    const localNames = new Set(
      specifiers
        .map((/** @type {any} */ s) => s.local?.name)
        .filter(Boolean),
    );

    if (defaultName && !hasDefault && !localNames.has(defaultName)) {
      specifiers.unshift(j.importDefaultSpecifier(j.identifier(defaultName)));
      changed = true;
    }
    for (const name of named) {
      if (!existingNamed.has(name) && !localNames.has(name)) {
        specifiers.push(j.importSpecifier(j.identifier(name)));
        changed = true;
      }
    }
    decl.specifiers = specifiers;
    return changed;
  }

  /** @type {any[]} */
  const specifiers = [];
  if (defaultName) specifiers.push(j.importDefaultSpecifier(j.identifier(defaultName)));
  for (const name of named) specifiers.push(j.importSpecifier(j.identifier(name)));

  const decl = j.importDeclaration(specifiers, j.stringLiteral(from));
  if (typeOnly) decl.importKind = 'type';

  const allImports = root.find(j.ImportDeclaration);
  if (allImports.size() > 0) {
    allImports.at(-1).insertAfter(decl);
  } else {
    insertAtModuleTop(j, root, decl);
  }
  return true;
}

/**
 * Insert a statement at the top of the module body when there are no imports to
 * anchor to. Uses a path-based `insertBefore` on the first body statement rather
 * than splicing `program.body` directly, because a raw splice makes recast drop
 * the module's directive prologue (Babel stores `'use client'` in
 * `program.directives`, which a wholesale body reprint omits). Some parsers
 * instead surface a directive as a leading string-literal ExpressionStatement in
 * `body`; we skip past that too so the import lands after it.
 * @param {import('../../../authoring/codemod/type').JscodeshiftFactory} j
 * @param {any} root jscodeshift collection for the file
 * @param {any} node
 */
function insertAtModuleTop(j, root, node) {
  const program = root.find(j.Program);
  const body = program.get().node.body;

  // Anchor index: after any leading string-literal directive statements.
  let idx = 0;
  while (idx < body.length) {
    const stmt = body[idx];
    const isDirective =
      stmt.type === 'ExpressionStatement' &&
      stmt.expression &&
      (stmt.expression.type === 'StringLiteral' ||
        stmt.expression.type === 'Literal') &&
      typeof stmt.expression.value === 'string';
    if (!isDirective) break;
    idx++;
  }

  if (idx < body.length) {
    // Path-based insert preserves the directive prologue + surrounding trivia.
    program.get('body', idx).insertBefore(node);
  } else {
    body.push(node);
  }
}
