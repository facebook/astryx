// Copyright (c) Meta Platforms, Inc. and affiliates.

// One source of truth for "is StyleX actually going to compile here?".
//
// Two callers ask this question and MUST NOT disagree:
//   - api/doctor/theme-drift.mjs — diagnoses swizzled StyleX source
//   - foundation/agent-docs — decides whether to tell an agent to write xstyle
//
// They used to carry separate hardcoded plugin lists. With
// `@stylexjs/webpack-plugin` configured, doctor reported the swizzle as wired
// while the generated docs selected plain CSS — the diagnosis and the guidance
// pointing opposite ways about the same project. A shared module is the only
// arrangement that cannot drift.
//
// @input  A package directory.
// @output Whether a StyleX compiler is declared, and whether it is wired.
// @position foundation/discovery leaf. Node builtins only, so foundation and
//   api can both import it without crossing a package boundary.

import * as fs from 'node:fs';
import * as path from 'node:path';
import jscodeshift from 'jscodeshift';

/** One parser instance, reused. */
const tsx = jscodeshift.withParser('tsx');

/**
 * StyleX compiler plugins. Swizzled StyleX source is inert without one.
 *
 * <!-- SYNC: packages/cli/assets/docs/styling.doc.mjs (bundler -> plugin table) -->
 */
export const STYLEX_COMPILERS = [
  // The first-party plugins `astryx docs styling` tells people to install.
  '@stylexjs/webpack-plugin',
  '@stylexjs/rollup-plugin',
  '@stylexjs/babel-plugin',
  '@stylexjs/postcss-plugin',
  // Community and SWC-based transforms.
  'vite-plugin-stylex',
  'unplugin-stylex',
  '@stylexswc/unplugin',
  '@stylexswc/nextjs-plugin',
  'stylex-webpack',
];

/** Build configs that could plausibly wire a StyleX plugin. */
const BUILD_CONFIG_FILES = [
  'vite.config.ts', 'vite.config.js', 'vite.config.mjs', 'vite.config.cjs',
  'next.config.ts', 'next.config.js', 'next.config.mjs', 'next.config.cjs',
  'webpack.config.ts', 'webpack.config.js', 'webpack.config.mjs', 'webpack.config.cjs',
  'rollup.config.ts', 'rollup.config.js', 'rollup.config.mjs', 'rollup.config.cjs',
  'babel.config.json', 'babel.config.js', 'babel.config.mjs', 'babel.config.cjs',
  '.babelrc', '.babelrc.json', '.babelrc.js',
  'postcss.config.js', 'postcss.config.mjs', 'postcss.config.cjs', 'postcss.config.json',
];

/**
 * Which of these plugins does this package DECLARE, walking up to `root`?
 *
 * A workspace dependency hoists and legitimately serves the app below it, so
 * the answer is not confined to the package's own package.json.
 *
 * @param {string} pkgDir
 * @param {string} [root]
 * @returns {{declared: string[], sawPackageJson: boolean}}
 */
export function declaredStyleXCompilers(pkgDir, root = pkgDir) {
  let dir = pkgDir;
  let sawPackageJson = false;
  for (let i = 0; i < 12; i++) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
      sawPackageJson = true;
      const deps = {...pkg.dependencies, ...pkg.devDependencies};
      const declared = STYLEX_COMPILERS.filter(c => c in deps);
      if (declared.length > 0) return {declared, sawPackageJson};
    } catch {
      /* no readable package.json here: keep walking */
    }
    if (dir === root) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return {declared: [], sawPackageJson};
}

/**
 * Is one of `plugins` wired into the EXPORTED config from `pkgDir` up to
 * `root`?
 *
 * PARSED, not pattern-matched, for the same reason the input walk is: text
 * cannot tell active configuration from something that merely looks like it.
 * Every heuristic here produced a false green in turn — a commented-out
 * plugin, a plugin named in prose, an import never used, a call whose result
 * was discarded, and finally `plugins: [stylex()]` on an object the config
 * never exports. That last one is decisive: only the exported object reaches
 * the bundler, so only the exported object can answer the question.
 *
 * Fails closed. A config that cannot be parsed, or whose export cannot be
 * followed, returns false — the caller then reports the compiler unverified
 * rather than assuming it runs.
 *
 * @param {string} pkgDir
 * @param {string|string[]} plugins
 * @param {string} [root]
 * @returns {boolean}
 */
export function isStyleXConfigured(pkgDir, plugins, root = pkgDir) {
  const names = Array.isArray(plugins) ? plugins : [plugins];
  if (names.length === 0) return false;

  let dir = pkgDir;
  for (let i = 0; i < 12; i++) {
    for (const name of BUILD_CONFIG_FILES) {
      const fp = path.join(dir, name);
      if (!fs.existsSync(fp)) continue;
      let src;
      try {
        src = fs.readFileSync(fp, 'utf-8');
      } catch {
        continue;
      }
      if (name.endsWith('.json') || name === '.babelrc') {
        // JSON config: the whole document IS the exported config.
        try {
          if (jsonMentionsPlugin(JSON.parse(src), names)) return true;
        } catch {
          /* unparseable JSON proves nothing */
        }
        continue;
      }
      if (exportedConfigWiresPlugin(src, names)) return true;
    }
    // package.json can carry babel/postcss config inline.
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
      if (jsonMentionsPlugin({babel: pkg.babel, postcss: pkg.postcss}, names)) return true;
    } catch {
      /* fine */
    }
    if (dir === root) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return false;
}

/**
 * Does a JSON config name one of these plugins anywhere in it?
 *
 * JSON has no comments, no imports and no dead code — every value in it is
 * live configuration, so a plain search over the parsed structure is exact.
 *
 * @param {unknown} value
 * @param {string[]} names
 * @returns {boolean}
 */
function jsonMentionsPlugin(value, names) {
  if (typeof value === 'string') return names.includes(value);
  if (Array.isArray(value)) return value.some(v => jsonMentionsPlugin(v, names));
  if (value && typeof value === 'object') {
    return Object.values(value).some(v => jsonMentionsPlugin(v, names));
  }
  return false;
}

/**
 * Parse a JS/TS config and ask whether its EXPORTED value wires a plugin.
 *
 * @param {string} src
 * @param {string[]} names
 * @returns {boolean}
 */
function exportedConfigWiresPlugin(src, names) {
  let root;
  try {
    root = tsx(src);
  } catch {
    return false; // unparseable: prove nothing
  }

  // Which local bindings came from one of the plugin packages?
  /** @type {Set<string>} */
  const bindings = new Set();
  root.find(jscodeshift.ImportDeclaration).forEach((/** @type {any} */ path) => {
    if (!names.includes(path.value.source.value)) return;
    for (const spec of path.value.specifiers ?? []) {
      if (spec.local?.name) bindings.add(spec.local.name);
    }
  });
  root.find(jscodeshift.VariableDeclarator).forEach((/** @type {any} */ path) => {
    const init = path.value.init;
    if (!init || init.type !== 'CallExpression') return;
    const callee = init.callee;
    if (!(callee.type === 'Identifier' && callee.name === 'require')) return;
    const arg = init.arguments[0];
    if (!arg || !names.includes(arg.value)) return;
    if (path.value.id?.type === 'Identifier') bindings.add(path.value.id.name);
  });

  // Follow every export to the object it actually yields, then look only at
  // the plugins/presets arrays inside THAT object.
  for (const exported of exportedValues(root)) {
    if (nodeWiresPlugin(exported, names, bindings, root)) return true;
  }
  return false;
}

/**
 * The value nodes a config module exports: `export default X`,
 * `module.exports = X`, and `export const config = X`.
 *
 * @param {any} root
 * @returns {any[]}
 */
function exportedValues(root) {
  /** @type {any[]} */
  const out = [];
  root.find(jscodeshift.ExportDefaultDeclaration).forEach((/** @type {any} */ p) => out.push(p.value.declaration));
  root.find(jscodeshift.AssignmentExpression).forEach((/** @type {any} */ p) => {
    const left = p.value.left;
    const isModuleExports =
      left.type === 'MemberExpression' &&
      left.object?.type === 'Identifier' &&
      left.object.name === 'module' &&
      left.property?.name === 'exports';
    const isExportsDot =
      left.type === 'MemberExpression' &&
      left.object?.type === 'Identifier' &&
      left.object.name === 'exports';
    if (isModuleExports || isExportsDot) out.push(p.value.right);
  });
  root.find(jscodeshift.ExportNamedDeclaration).forEach((/** @type {any} */ p) => {
    const decl = p.value.declaration;
    if (decl?.type !== 'VariableDeclaration') return;
    for (const d of decl.declarations) if (d.init) out.push(d.init);
  });
  return out;
}

/**
 * Does this exported value wire one of the plugins?
 *
 * Resolves an identifier export (`export default config`) back to its
 * declaration, and a factory call (`defineConfig({...})`) to its argument, so
 * the common config shapes are followed rather than guessed at.
 *
 * @param {any} node
 * @param {string[]} names
 * @param {Set<string>} bindings
 * @param {any} root
 * @param {number} [depth]
 * @returns {boolean}
 */
function nodeWiresPlugin(node, names, bindings, root, depth = 0) {
  if (!node || depth > 6) return false;

  if (node.type === 'Identifier') {
    let found = false;
    root
      .find(jscodeshift.VariableDeclarator, {id: {type: 'Identifier', name: node.name}})
      .forEach((/** @type {any} */ p) => {
        if (p.value.init && nodeWiresPlugin(p.value.init, names, bindings, root, depth + 1)) {
          found = true;
        }
      });
    return found;
  }

  // A config may be a FUNCTION that returns one — `export default ({mode}) =>
  // ({plugins: [...]})` and its async form are both standard Vite/Next shapes.
  // Not following them reported a correctly-configured project as unverified,
  // and a diagnostic that cries wolf on a healthy setup is the thing that
  // teaches people to ignore it.
  if (
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression' ||
    node.type === 'FunctionDeclaration'
  ) {
    const body = node.body;
    if (!body) return false;
    // Concise arrow body: `() => ({...})`.
    if (body.type !== 'BlockStatement') {
      return nodeWiresPlugin(body, names, bindings, root, depth + 1);
    }
    // Block body: look at what it returns.
    let found = false;
    jscodeshift(body)
      .find(jscodeshift.ReturnStatement)
      .forEach((/** @type {any} */ p) => {
        if (p.value.argument && nodeWiresPlugin(p.value.argument, names, bindings, root, depth + 1)) {
          found = true;
        }
      });
    return found;
  }

  // `defineConfig({...})`, `defineConfig(() => ({...}))`, `withX({...})`.
  if (node.type === 'CallExpression') {
    return (node.arguments ?? []).some((/** @type {any} */ a) => nodeWiresPlugin(a, names, bindings, root, depth + 1));
  }

  if (node.type === 'ObjectExpression') {
    for (const prop of node.properties ?? []) {
      const key = prop.key?.name ?? prop.key?.value;
      if (
        (key === 'plugins' || key === 'presets') &&
        arrayWiresPlugin(prop.value, names, bindings, root)
      ) {
        return true;
      }
      // Recurse ONLY through sections that really are part of a bundler
      // pipeline. Descending into every object counted
      // `{someOtherTool: {plugins: [stylex()]}}` as wiring — an unrelated
      // tool's config that compiles nothing for this app.
      if (BUNDLER_SECTIONS.has(String(key)) && prop.value) {
        if (nodeWiresPlugin(prop.value, names, bindings, root, depth + 1)) return true;
      }
    }
  }
  return false;
}

/**
 * Config keys whose contents really are handed to a bundler.
 *
 * `build.rollupOptions.plugins` is genuine Vite wiring; `someOtherTool.plugins`
 * is a different tool's configuration living in the same file. Only the first
 * kind can answer "will my StyleX compile?", so the recursion is confined to
 * these.
 */
const BUNDLER_SECTIONS = new Set([
  'build',
  'rollupOptions',
  'optimizeDeps',
  'esbuild',
  'worker',
  'css',
  'postcss',
  'module',
  'webpack',
  'experimental',
  'env',
]);

/**
 * Is a plugin named, called, or passed inside this plugins array?
 *
 * @param {any} node
 * @param {string[]} names
 * @param {Set<string>} bindings
 * @param {any} [root] - Present to follow a spread back to its declaration.
 * @returns {boolean}
 */
function arrayWiresPlugin(node, names, bindings, root) {
  if (!node) return false;
  // `plugins: p` where `p` is a local array — follow it, the same way an
  // exported identifier is followed.
  if (node.type === 'Identifier') {
    if (!root) return false;
    let found = false;
    root
      .find(jscodeshift.VariableDeclarator, {id: {type: 'Identifier', name: node.name}})
      .forEach((/** @type {any} */ p) => {
        if (arrayWiresPlugin(p.value.init, names, bindings, root)) found = true;
      });
    return found;
  }
  if (node.type !== 'ArrayExpression') return false;
  return (node.elements ?? []).some(
    /**
     * @param {any} el
     * @returns {boolean}
     */
    function check(el) {
    if (!el) return false;
    if (el.type === 'StringLiteral' || el.type === 'Literal') return names.includes(el.value);
    if (el.type === 'Identifier') return bindings.has(el.name);
    if (el.type === 'CallExpression') {
      const c = el.callee;
      if (c?.type === 'Identifier' && bindings.has(c.name)) return true;
      // `s.default()` from a namespace import.
      if (c?.type === 'MemberExpression' && c.object?.type === 'Identifier' && bindings.has(c.object.name)) {
        return true;
      }
      return (el.arguments ?? []).some(check);
    }
    if (el.type === 'NewExpression') {
      return el.callee?.type === 'Identifier' && bindings.has(el.callee.name);
    }
    // `isProd && stylex()`, `cond ? stylex() : null`, `[stylex(), {}]`
    if (el.type === 'LogicalExpression') return check(el.left) || check(el.right);
    if (el.type === 'ConditionalExpression') return check(el.consequent) || check(el.alternate);
    if (el.type === 'ArrayExpression') return (el.elements ?? []).some(check);
    if (el.type === 'SpreadElement') {
      // `plugins: [...basePlugins]` — follow the spread to its declaration.
      const arg = el.argument;
      if (!arg) return false;
      if (arg.type !== 'Identifier') return check(arg);
      if (!root) return false;
      let found = false;
      root
        .find(jscodeshift.VariableDeclarator, {id: {type: 'Identifier', name: arg.name}})
        .forEach((/** @type {any} */ p) => {
          if (arrayWiresPlugin(p.value.init, names, bindings, root)) found = true;
        });
      return found;
    }
    return false;
  });
}

/**
 * The single verdict both callers use.
 *
 * @param {string} pkgDir
 * @param {string} [root]
 * @returns {boolean|null} true = declared AND wired into a build config;
 *   false = not declared at all; null = declared but nothing references it,
 *   so it may never run — unverifiable, and never reported as working.
 */
export function styleXCompilerFor(pkgDir, root = pkgDir) {
  const {declared, sawPackageJson} = declaredStyleXCompilers(pkgDir, root);
  if (declared.length === 0) return sawPackageJson ? false : null;
  return isStyleXConfigured(pkgDir, declared, root) ? true : null;
}
