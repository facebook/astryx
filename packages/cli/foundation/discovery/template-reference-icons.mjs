// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The bundled templates' reference icon set (AST-084 FR19–FR21).
 *
 * Bundled templates import every icon they can by meaning from one official
 * icon set, `@astryxdesign/icons-heroicons`, and declare the icon definition
 * each one draws. This module writes those imports for a project:
 *
 *   - `lowerReferenceIcons` turns each reference-set import back into the
 *     upstream import the set re-exports, so a project without the set gets
 *     the file it got before templates used the set (FR20);
 *   - `coreTemplateIcons` swaps each declared icon for Core's built-in icon
 *     of that meaning, or a neutral placeholder, when the project opts in
 *     with `experimental.templateIcons` and has no icon set (FR21).
 *
 * The reference data (`assets/icons/reference-set.json`) is a copy of what
 * the set's generated module says for each export a bundled template imports;
 * a test keeps it equal to the package. The CLI encodes no other library.
 *
 * @input Template source, the template's declared icons, the reference data
 * @output Rewritten source and, for the Core swap, the `icons` report fields
 * @position packages/cli/foundation/discovery — read by template-icons.mjs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {parse} from '@babel/parser';
import {CLI_ROOT} from '../fs/paths.mjs';
import {astryxDefinitionsByName} from './icon-definition-discovery.mjs';

/** Where the reference data lives in the CLI package. */
export const REFERENCE_SET_FILE = path.join(
  CLI_ROOT,
  'assets',
  'icons',
  'reference-set.json',
);

/**
 * The reference icon set: its package, its name, and, for each export a
 * bundled template imports, the upstream module and export it re-exports.
 * @typedef {object} ReferenceIconSet
 * @property {string} package
 * @property {string} set
 * @property {Map<string, {module: string, export: string}>} exports
 */

/** @type {ReferenceIconSet | null} */
let cached = null;

/**
 * Read the reference data once.
 * @returns {ReferenceIconSet}
 */
export function referenceIconSet() {
  if (cached) return cached;
  /** @type {{package: string, set: string, exports: Record<string, {module: string, export: string}>}} */
  const raw = JSON.parse(fs.readFileSync(REFERENCE_SET_FILE, 'utf-8'));
  cached = {
    package: raw.package,
    set: raw.set,
    exports: new Map(Object.entries(raw.exports)),
  };
  return cached;
}

/** The note a project without an icon set reads (FR21). */
export const NO_ICON_SET_NOTE =
  'No icon set installed — run `astryx experimental icon use <set>` or install @astryxdesign/icons-heroicons';

/** @param {string} source */
function parseSource(source) {
  return parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: false,
  });
}

/** @param {any} specifier */
const importedName = specifier =>
  specifier.imported.name ?? specifier.imported.value;

/**
 * Apply edits, last first.
 * @param {string} source
 * @param {Array<{start: number, end: number, text: string}>} edits
 */
function applyEdits(source, edits) {
  let out = source;
  for (const edit of [...edits].sort(
    (a, b) => b.start - a.start || b.end - a.end,
  )) {
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  }
  return out;
}

/** The formatter's line width. */
const PRINT_WIDTH = 80;

/**
 * One named import, printed as the repository's formatter prints it: on one
 * line when it fits or names one export, else one name per line with a
 * trailing comma.
 * @param {string[]} names each `name` or `name as local`
 * @param {string} module
 * @param {string} [quote]
 */
export function printImport(names, module, quote = "'") {
  const from = `${quote}${module}${quote}`;
  const line = `import {${names.join(', ')}} from ${from};`;
  // The formatter keeps a lone name on one line, however long.
  if (line.length <= PRINT_WIDTH || names.length === 1) return line;
  return `import {\n${names.map(name => `  ${name},`).join('\n')}\n} from ${from};`;
}

/**
 * Rewrite every reference-set import to the upstream import it re-exports
 * (FR20), so a template written as `import {TrashSolidIcon as TrashIcon}
 * from '@astryxdesign/icons-heroicons'` prints as `import {TrashIcon} from
 * '@heroicons/react/24/solid'`. Each statement is printed as the formatter
 * prints an import, one per upstream module in first-use order; a statement
 * with a comment inside keeps its layout, with only the module and the names
 * changed. A statement with an export the reference data does not name, or a
 * type-only or namespace import, is left as written.
 * @param {string} source
 * @param {ReferenceIconSet} [reference]
 * @returns {string}
 */
export function lowerReferenceIcons(source, reference = referenceIconSet()) {
  if (!source.includes(reference.package)) return source;
  /** @type {any} */
  let ast;
  try {
    ast = parseSource(source);
  } catch {
    return source;
  }
  /** @type {Array<{start: number, end: number, text: string}>} */
  const edits = [];
  for (const node of ast.program.body) {
    if (
      node.type !== 'ImportDeclaration' ||
      node.importKind === 'type' ||
      node.source.value !== reference.package ||
      node.specifiers.length === 0
    ) {
      continue;
    }
    const lowered = node.specifiers.map((/** @type {any} */ specifier) => {
      if (
        specifier.type !== 'ImportSpecifier' ||
        specifier.importKind === 'type'
      ) {
        return null;
      }
      const upstream = reference.exports.get(importedName(specifier));
      if (!upstream) return null;
      const local = specifier.local.name;
      return {
        specifier,
        module: upstream.module,
        text:
          upstream.export === local ? local : `${upstream.export} as ${local}`,
      };
    });
    if (lowered.some((/** @type {unknown} */ each) => each == null)) continue;
    const entries =
      /** @type {Array<{specifier: any, module: string, text: string}>} */ (
        lowered
      );
    const modules = [...new Set(entries.map(each => each.module))];
    const written = source.slice(node.start, node.end);
    if (!/\/[/*]/u.test(written)) {
      // No comment to keep: print each statement the way the repository's
      // formatter prints an import, so a lowered template reads exactly as
      // one written against the library.
      edits.push({
        start: node.start,
        end: node.end,
        text: modules
          .map(module =>
            printImport(
              entries.filter(each => each.module === module).map(e => e.text),
              module,
              source[node.source.start],
            ),
          )
          .join('\n'),
      });
      continue;
    }
    if (modules.length === 1) {
      const quote = source[node.source.start];
      edits.push({
        start: node.source.start,
        end: node.source.end,
        text: `${quote}${modules[0]}${quote}`,
      });
      for (const each of entries) {
        edits.push({
          start: each.specifier.start,
          end: each.specifier.end,
          text: each.text,
        });
      }
      continue;
    }
    edits.push({
      start: node.start,
      end: node.end,
      text: modules
        .map(
          module =>
            `import {${entries
              .filter(each => each.module === module)
              .map(each => each.text)
              .join(', ')}} from '${module}';`,
        )
        .join('\n'),
    });
  }
  return edits.length === 0 ? source : applyEdits(source, edits);
}

/**
 * One icon the Core swap replaced (FR21).
 * @typedef {object} CoreIcon
 * @property {{module: string, export: string}} source the import it replaced
 * @property {string | null} definition the icon definition the template
 *   declares for it, if any
 * @property {string | null} icon Core's built-in icon name that draws it, or
 *   null for the neutral placeholder
 */

/**
 * Swap each icon a template declares, and each reference-set icon it
 * imports, for Core's built-in icon of the same definition, or a neutral
 * placeholder when Core has none (FR21). The import goes, and a local
 * component of the same name takes its place, so every reference keeps
 * working; any other import is left as written.
 * @param {string} source
 * @param {Record<string, string>} declared the template's `icons`
 * @param {ReferenceIconSet} [reference]
 * @returns {{source: string, core: CoreIcon[]}}
 */
export function coreTemplateIcons(
  source,
  declared,
  reference = referenceIconSet(),
) {
  /** @type {any} */
  let ast;
  try {
    ast = parseSource(source);
  } catch {
    return {source: lowerReferenceIcons(source, reference), core: []};
  }
  const builtIns = new Set(
    [...astryxDefinitionsByName().values()]
      .filter(doc => doc.builtIn === true)
      .map(doc => doc.name),
  );

  /** @type {Set<string>} every name the file binds or reads */
  const written = new Set();
  const collect = (/** @type {any} */ node) => {
    if (Array.isArray(node)) {
      for (const child of node) collect(child);
      return;
    }
    if (node == null || typeof node !== 'object') return;
    if (node.type === 'Identifier' || node.type === 'JSXIdentifier') {
      written.add(node.name);
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'extra' || key.endsWith('Comments')) {
        continue;
      }
      const child = node[key];
      if (child != null && typeof child === 'object') collect(child);
    }
  };
  collect(ast.program);

  /** @type {CoreIcon[]} */
  const core = [];
  /** @type {Array<{local: string, icon: string | null}>} */
  const locals = [];
  /** @type {Array<{start: number, end: number, text: string}>} */
  const edits = [];
  let insertAt = -1;
  let lastImportEnd = 0;
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    lastImportEnd = node.end;
    if (node.importKind === 'type') continue;
    const module = node.source.value;
    /** @type {any[]} */
    const keep = [];
    for (const specifier of node.specifiers) {
      if (
        specifier.type !== 'ImportSpecifier' ||
        specifier.importKind === 'type'
      ) {
        keep.push(specifier);
        continue;
      }
      const imported = importedName(specifier);
      const definition = Object.hasOwn(declared, imported)
        ? declared[imported]
        : null;
      if (definition == null && module !== reference.package) {
        keep.push(specifier);
        continue;
      }
      const icon =
        definition != null && builtIns.has(definition) ? definition : null;
      const upstream =
        module === reference.package
          ? reference.exports.get(imported)
          : undefined;
      core.push({
        source: upstream ?? {module, export: imported},
        definition,
        icon,
      });
      locals.push({local: specifier.local.name, icon});
    }
    if (keep.length === node.specifiers.length) continue;
    if (insertAt === -1) insertAt = node.start;
    if (keep.length === 0) {
      let end = node.end;
      if (source[end] === '\n') end += 1;
      edits.push({start: node.start, end, text: ''});
      continue;
    }
    const defaults = keep.filter(each => each.type !== 'ImportSpecifier');
    const named = keep.filter(each => each.type === 'ImportSpecifier');
    const parts = [
      ...defaults.map(each => source.slice(each.start, each.end)),
      ...(named.length > 0
        ? [
            `{${named.map(each => source.slice(each.start, each.end)).join(', ')}}`,
          ]
        : []),
    ];
    edits.push({
      start: node.start,
      end: node.end,
      text: `import ${parts.join(', ')} from ${source.slice(node.source.start, node.source.end)};`,
    });
  }
  if (locals.length === 0) {
    return {source: lowerReferenceIcons(source, reference), core};
  }

  /** A name no binding in the file uses. */
  const fresh = (/** @type {string} */ name) => {
    let candidate = name;
    for (let n = 2; written.has(candidate); n++) candidate = `${name}${n}`;
    written.add(candidate);
    return candidate;
  };
  const hasBuiltIn = locals.some(each => each.icon != null);
  const hasPlaceholder = locals.some(each => each.icon == null);
  const props = fresh('CoreIconProps');
  const coreIcon = hasBuiltIn ? fresh('coreIcon') : '';
  const placeholder = hasPlaceholder ? fresh('PlaceholderIcon') : '';
  const alias = (/** @type {string} */ name, /** @type {string} */ local) =>
    name === local ? name : `${name} as ${local}`;
  const useIcon = hasBuiltIn ? fresh('useIcon') : '';
  const iconName = hasBuiltIn ? fresh('IconName') : '';
  const iconProps = fresh('IconProps');
  const cloneElement = hasBuiltIn ? fresh('cloneElement') : '';
  const isValidElement = hasBuiltIn ? fresh('isValidElement') : '';

  const imports = [
    ...(hasBuiltIn
      ? [
          `import {${alias('cloneElement', cloneElement)}, ${alias('isValidElement', isValidElement)}} from 'react';`,
        ]
      : []),
    `import {${[
      ...(hasBuiltIn
        ? [alias('useIcon', useIcon), `type ${alias('IconName', iconName)}`]
        : []),
      `type ${alias('IconProps', iconProps)}`,
    ].join(', ')}} from '@astryxdesign/core/Icon';`,
  ].join('\n');

  const helpers = [
    '',
    `// ${NO_ICON_SET_NOTE}.`,
    "// Until then each icon below is Core's built-in icon for its meaning, or a",
    '// neutral placeholder.',
    `type ${props} = Pick<${iconProps}, 'className' | 'style'>;`,
    ...(hasBuiltIn
      ? [
          `function ${coreIcon}(name: ${iconName}) {`,
          `  return function CoreIcon({className, style}: ${props}) {`,
          `    const icon = ${useIcon}(name);`,
          `    return ${isValidElement}<${props}>(icon)`,
          `      ? ${cloneElement}(icon, {className, style})`,
          '      : null;',
          '  };',
          '}',
        ]
      : []),
    ...(hasPlaceholder
      ? [
          `function ${placeholder}({className, style}: ${props}) {`,
          '  return (',
          '    <svg',
          '      viewBox="0 0 24 24"',
          '      width="1em"',
          '      height="1em"',
          '      fill="none"',
          '      stroke="currentColor"',
          '      strokeWidth={1.5}',
          '      strokeDasharray="3 3"',
          '      aria-hidden',
          '      className={className}',
          '      style={style}>',
          '      <circle cx="12" cy="12" r="8" />',
          '    </svg>',
          '  );',
          '}',
        ]
      : []),
    ...locals.map(
      each =>
        `const ${each.local} = ${each.icon != null ? `${coreIcon}('${each.icon}')` : placeholder};`,
    ),
  ].join('\n');

  // The helpers follow the last import. When that import is itself rewritten
  // or removed, they ride its edit so the two never overlap.
  const covering = edits.find(
    edit => edit.start < lastImportEnd && lastImportEnd <= edit.end,
  );
  if (!covering) {
    edits.push({
      start: lastImportEnd,
      end: lastImportEnd,
      text: `\n${helpers}`,
    });
  } else if (covering.text === '') {
    covering.text = `${helpers}\n`;
  } else {
    covering.text += `\n${helpers}`;
  }
  edits.push({start: insertAt, end: insertAt, text: `${imports}\n`});
  return {
    source: lowerReferenceIcons(applyEdits(source, edits), reference),
    core,
  };
}
