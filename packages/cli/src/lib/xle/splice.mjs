// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Block splicing — turn a template block's TSX source into something
 * the expander can inline.
 *
 * A `{hint}` can resolve two ways:
 *   - splice: a template block (not an importable package) is co-defined as a
 *     local component in the generated module and referenced — the block's
 *     imports are hoisted and merged. This is what `astryx template <name>` would
 *     scaffold, inlined.
 *   - import: an app-registered local component (KpiCard, charts, …) is simply
 *     imported from its configured path and referenced. This is the bridge that
 *     lets XLE reach the domain components it's otherwise blind to.
 *
 * Pure (no fs): the Node caller reads files; this only transforms strings, so
 * it stays in the browser barrel.
 *
 * @input  block TSX source (splice) or a name+importPath (import)
 * @output prepareSpliceModule / parseImportStatements + import-merge helpers
 * @position lib/xle — used by expand.mjs; sources gathered in api/layout.mjs
 */

const IMPORT_RE =
  /^import\s+(?:(type)\s+)?(?:([A-Za-z_$][\w$]*)\s*,\s*)?(?:\{([^}]*)\}|\*\s+as\s+([A-Za-z_$][\w$]*)|([A-Za-z_$][\w$]*))?\s*(?:from\s*)?['"]([^'"]+)['"]\s*;?/;

/**
 * Parse the import statements at the top of a module. Handles named, type,
 * default, namespace, and side-effect imports (incl. simple multiline named
 * lists). Returns {imports, rest} where rest is the source with those import
 * lines removed.
 */
export function parseImportStatements(source) {
  const lines = source.split('\n');
  const imports = [];
  const kept = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*import\b/.test(line)) {
      // Gather a possibly-multiline import up to its terminating quote+;
      let stmt = line;
      while (!/['"]\s*;?\s*$/.test(stmt) && i + 1 < lines.length) {
        i++;
        stmt += '\n' + lines[i];
      }
      const m = stmt.replace(/\s+/g, ' ').match(IMPORT_RE);
      if (m) {
        const [, typeKw, defaultWithNamed, named, namespace, bareDefault, src] = m;
        imports.push({
          source: src,
          isType: Boolean(typeKw),
          default: defaultWithNamed || bareDefault || null,
          namespace: namespace || null,
          named: named
            ? named.split(',').map(s => s.trim()).filter(Boolean)
            : [],
          sideEffect: !named && !namespace && !bareDefault && !defaultWithNamed,
        });
        continue;
      }
    }
    kept.push(line);
  }
  return {imports, rest: kept.join('\n')};
}

/**
 * Prepare a template block for inline co-definition.
 *
 * Strips the copyright header and `'use client'`, hoists imports, and rewrites
 * the block's exports into plain module-level declarations so it can live
 * inside the generated file. Returns null if the block has no default-exported
 * component to reference (caller falls back to a TODO marker).
 *
 * @param {string} source - raw block TSX
 * @param {string} fallbackName - PascalCase name to use if no export name found
 * @returns {{componentName: string, imports: object[], body: string} | null}
 */
export function prepareSpliceModule(source, fallbackName) {
  const {imports, rest} = parseImportStatements(source);

  // Determine the component name from the default export.
  let componentName = fallbackName;
  const defFn = rest.match(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)/);
  const defConst = rest.match(/export\s+default\s+([A-Za-z_$][\w$]*)\s*;/);
  if (defFn) componentName = defFn[1];
  else if (defConst) componentName = defConst[1];
  else if (!/export\s+default/.test(rest)) return null;

  let body = rest
    // drop directive prologues and the copyright comment
    .replace(/^\s*['"]use client['"];?\s*$/m, '')
    .replace(/^\/\/.*$/gm, '')
    // anonymous default → a named function/const we can reference
    .replace(/export\s+default\s+function\s*\(/, `function ${componentName}(`)
    .replace(/export\s+default\s+function\s+/, 'function ')
    // `export default X;` (X already defined above) → nothing
    .replace(/export\s+default\s+[A-Za-z_$][\w$]*\s*;/, '')
    // demote remaining named exports to plain declarations
    .replace(/export\s+(const|function|class|interface|type|enum)\s/g, '$1 ')
    .trim();

  return {componentName, imports, body};
}

/**
 * Merge a parsed import list into an emitter import map.
 * The map is Map<source, {named:Set, types:Set, default?:string, namespace?:string, sideEffect?:bool}>.
 */
export function mergeImports(map, imports) {
  for (const imp of imports) {
    if (!map.has(imp.source)) {
      map.set(imp.source, {named: new Set(), types: new Set(), default: null, namespace: null, sideEffect: false});
    }
    const entry = map.get(imp.source);
    if (imp.sideEffect) entry.sideEffect = true;
    if (imp.default) entry.default = imp.default;
    if (imp.namespace) entry.namespace = imp.namespace;
    for (const n of imp.named) (imp.isType ? entry.types : entry.named).add(n);
  }
}

/** Render one merged import entry to a statement string. */
export function renderImport(source, entry) {
  if (entry.sideEffect && !entry.default && !entry.namespace && entry.named.size === 0 && entry.types.size === 0) {
    return `import '${source}';`;
  }
  const clauses = [];
  if (entry.default) clauses.push(entry.default);
  if (entry.namespace) clauses.push(`* as ${entry.namespace}`);
  const named = [...entry.named].sort();
  const types = [...entry.types].sort();
  // Keep value and type names in one braces group (TS allows inline `type`).
  const braced = [...named, ...types.map(t => `type ${t}`)];
  if (braced.length > 0) clauses.push(`{${braced.join(', ')}}`);
  return `import ${clauses.join(', ')} from '${source}';`;
}
