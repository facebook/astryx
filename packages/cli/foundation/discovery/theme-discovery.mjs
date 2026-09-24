// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme descriptor discovery shared by Project, theme list/add, and
 * integration validation.
 *
 * A theme root contains one directory per lower-kebab slug. Each directory has
 * a theme source and mandatory same-stem `.doc.mjs`; the directory is the
 * complete copy and pack boundary. Descriptor metadata is parsed without
 * executing theme source. A dot-folder, or a folder holding neither a
 * descriptor nor a `<name>Theme` source, is not a theme.
 *
 * @input a bundled or integration-owned theme root
 * @output validated source-theme records with package ownership
 * @position packages/cli/foundation/discovery — shared theme discovery
 */

import * as fs from 'node:fs';
import {createRequire} from 'node:module';
import * as path from 'node:path';
import {lowerDoc} from '../doc-compiler/compile.mjs';
import {packageSource} from '../doc-compiler/source.mjs';
import {CLI_ROOT} from '../fs/paths.mjs';
import {assertWithin, PathSafetyError} from '../fs/path-safety.mjs';

export const BUNDLED_THEME_PACKAGE = '@astryxdesign/cli';
export const THEMES_DIR = path.join(CLI_ROOT, 'assets', 'templates', 'themes');
export const THEME_DOC_SUFFIX = '.doc.mjs';

const require = createRequire(import.meta.url);

/** @type {typeof import('@babel/parser') | undefined} */
let babelParser;
/** @type {any} */
let jscodeshiftApi;

/**
 * The descriptor parser, loaded when the first descriptor is read.
 * @returns {typeof import('@babel/parser')}
 */
function descriptorParser() {
  babelParser ??= require('@babel/parser');
  return /** @type {typeof import('@babel/parser')} */ (babelParser);
}

/**
 * The theme source parser, loaded when the first integration theme source is
 * checked. Bundled themes never need it.
 * @returns {any}
 */
function sourceParser() {
  jscodeshiftApi ??= require('jscodeshift');
  return jscodeshiftApi;
}

/**
 * @typedef {object} DiscoveredTheme
 * @property {string} slug
 * @property {string} displayName
 * @property {string} description
 * @property {boolean} maintained
 * @property {string} entry
 * @property {string} exportName
 * @property {string[]} files what `theme add` copies, relative to sourceDir,
 *   entry first
 * @property {string} package
 * @property {string} sourceDir absolute directory holding this theme's files
 * @property {boolean} bundled
 * @property {string} docPath absolute descriptor path
 */

/**
 * Resolve one authored relative path without allowing POSIX or Windows escape
 * syntax, even when discovery runs on the other platform.
 * @param {string} value
 * @param {string} root
 * @param {string} label
 */
function resolveThemePath(value, root, label) {
  if (
    path.posix.isAbsolute(value) ||
    path.win32.isAbsolute(value) ||
    value.split(/[\\/]/u).some(segment => segment === '..' || segment === '.')
  ) {
    throw new Error(
      `Invalid ${label} "${value}": it must stay inside the theme directory.`,
    );
  }
  try {
    return assertWithin(value, root, {label});
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new Error(error.message, {cause: error});
    }
    throw error;
  }
}

export const THEME_MODULE_EXTENSIONS = [
  '.mjs',
  '.js',
  '.mts',
  '.ts',
  '.tsx',
  '.jsx',
];

/** A theme directory's name: lower-kebab, starting with a letter. */
export const THEME_SLUG_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

/**
 * @param {unknown} specifier
 * @param {string} fromFile
 * @returns {string[]}
 */
function localThemeModuleCandidates(specifier, fromFile) {
  if (typeof specifier !== 'string' || !specifier.startsWith('.')) return [];
  const base = path.resolve(path.dirname(fromFile), specifier);
  return [
    base,
    ...THEME_MODULE_EXTENSIONS.map(extension => `${base}${extension}`),
    ...THEME_MODULE_EXTENSIONS.map(extension =>
      path.join(base, `index${extension}`),
    ),
  ];
}

/**
 * Resolve a local theme module only when the target is a listed file confined
 * to the theme directory.
 * @param {unknown} specifier
 * @param {string} fromFile
 * @param {string} themeDir
 * @param {Set<string>} allowedFiles
 */
function resolveLocalThemeModule(specifier, fromFile, themeDir, allowedFiles) {
  const candidates = localThemeModuleCandidates(specifier, fromFile);
  for (const candidate of candidates) {
    try {
      if (!fs.statSync(candidate).isFile()) continue;
      const confined = assertWithin(candidate, themeDir, {
        allowAbsolute: true,
        label: 'theme module',
      });
      if (allowedFiles.has(confined)) return confined;
    } catch {
      // Missing, non-file, escaped, and unlisted candidates are not reachable.
    }
  }
  return null;
}

class ThemeModuleReferenceError extends Error {}
class ThemeRuntimeExportError extends Error {}

/**
 * Validate that every local static dependency is copied with the theme.
 * @param {string} file
 * @param {any} jscodeshift
 * @param {string} themeDir
 * @param {Set<string>} allowedFiles
 * @param {string} owner
 * @param {string} entry
 * @param {string} descriptorPath
 * @param {Set<string>} [seen]
 */
function validateThemeModuleGraph(
  file,
  jscodeshift,
  themeDir,
  allowedFiles,
  owner,
  entry,
  descriptorPath,
  seen = new Set(),
) {
  if (seen.has(file)) return;
  seen.add(file);

  const parser = /\.(?:ts|tsx|mts)$/u.test(file) ? 'tsx' : 'babel';
  const j = jscodeshift.withParser(parser);
  const root = j(fs.readFileSync(file, 'utf-8'));
  /** @type {string[]} */
  const specifiers = [];
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ importPath) => {
    if (typeof importPath.node.source?.value === 'string') {
      specifiers.push(importPath.node.source.value);
    }
  });
  root
    .find(j.ExportNamedDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      if (typeof exportPath.node.source?.value === 'string') {
        specifiers.push(exportPath.node.source.value);
      }
    });
  root.find(j.ExportAllDeclaration).forEach((/** @type {any} */ exportPath) => {
    if (typeof exportPath.node.source?.value === 'string') {
      specifiers.push(exportPath.node.source.value);
    }
  });
  root.find(j.CallExpression).forEach((/** @type {any} */ callPath) => {
    if (
      callPath.node.callee?.type === 'Import' &&
      typeof callPath.node.arguments?.[0]?.value === 'string'
    ) {
      specifiers.push(callPath.node.arguments[0].value);
    }
  });
  root.find(j.ImportExpression).forEach((/** @type {any} */ importPath) => {
    if (typeof importPath.node.source?.value === 'string') {
      specifiers.push(importPath.node.source.value);
    }
  });

  for (const specifier of specifiers) {
    if (!specifier.startsWith('.')) continue;
    const target = resolveLocalThemeModule(
      specifier,
      file,
      themeDir,
      allowedFiles,
    );
    if (!target) {
      const referencesDescriptor = localThemeModuleCandidates(
        specifier,
        file,
      ).some(
        candidate => path.resolve(candidate) === path.resolve(descriptorPath),
      );
      if (referencesDescriptor) {
        throw new ThemeModuleReferenceError(
          `Theme entry "${entry}" from ${owner} must not import its descriptor "${path.basename(descriptorPath)}". Theme descriptors are authoring metadata, not runtime modules.`,
        );
      }
      throw new ThemeModuleReferenceError(
        `Theme entry "${entry}" from ${owner} references local module "${specifier}" that must resolve to a file inside the theme directory.`,
      );
    }
    if (THEME_MODULE_EXTENSIONS.includes(path.extname(target))) {
      validateThemeModuleGraph(
        target,
        jscodeshift,
        themeDir,
        allowedFiles,
        owner,
        entry,
        descriptorPath,
        seen,
      );
    }
  }
}

/** @param {any} declaration @param {string} exportName */
function declarationExportsName(declaration, exportName) {
  if (!declaration || declaration.declare === true) return false;
  if (
    (declaration.type === 'FunctionDeclaration' ||
      declaration.type === 'ClassDeclaration') &&
    declaration.id?.name === exportName
  ) {
    return true;
  }
  return (
    declaration.type === 'VariableDeclaration' &&
    declaration.declarations.some(
      (/** @type {any} */ declarationItem) =>
        declarationItem.id?.type === 'Identifier' &&
        declarationItem.id.name === exportName,
    )
  );
}

/**
 * Resolve a source-less export specifier to a real top-level runtime binding.
 * @param {any[]} statements
 * @param {string} localName
 * @param {string} file
 * @param {any} jscodeshift
 * @param {string} themeDir
 * @param {Set<string>} allowedFiles
 * @param {Set<string>} seen
 */
function hasRuntimeBinding(
  statements,
  localName,
  file,
  jscodeshift,
  themeDir,
  allowedFiles,
  seen,
) {
  if (
    statements.some((/** @type {any} */ statement) =>
      declarationExportsName(statement, localName),
    )
  ) {
    return true;
  }

  for (const statement of statements) {
    if (
      statement.type !== 'ImportDeclaration' ||
      statement.importKind === 'type'
    ) {
      continue;
    }
    for (const specifier of statement.specifiers ?? []) {
      if (
        specifier.local?.name !== localName ||
        specifier.importKind === 'type'
      ) {
        continue;
      }
      const source = statement.source?.value;
      if (typeof source !== 'string') return false;
      if (!source.startsWith('.')) return true;
      const target = resolveLocalThemeModule(
        source,
        file,
        themeDir,
        allowedFiles,
      );
      if (!target) return false;
      if (specifier.type === 'ImportNamespaceSpecifier') return true;
      const importedName =
        specifier.type === 'ImportDefaultSpecifier'
          ? 'default'
          : (specifier.imported?.name ?? specifier.imported?.value);
      return (
        typeof importedName === 'string' &&
        moduleExportsName(
          target,
          importedName,
          jscodeshift,
          themeDir,
          allowedFiles,
          seen,
        )
      );
    }
  }
  return false;
}

/** @param {any} declaration */
function isRuntimeDefaultDeclaration(declaration) {
  return (
    declaration != null &&
    declaration.declare !== true &&
    ![
      'TSDeclareFunction',
      'TSInterfaceDeclaration',
      'TSTypeAliasDeclaration',
    ].includes(declaration.type)
  );
}

/**
 * Prove a named runtime export without executing the module. Local ESM
 * re-exports are followed recursively.
 * @param {string} file
 * @param {string} exportName
 * @param {any} jscodeshift
 * @param {string} themeDir
 * @param {Set<string>} allowedFiles
 * @param {Set<string>} [seen]
 */
function moduleExportsName(
  file,
  exportName,
  jscodeshift,
  themeDir,
  allowedFiles,
  seen = new Set(),
) {
  const identity = `${file}\0${exportName}`;
  if (seen.has(identity) || !allowedFiles.has(file) || !fs.existsSync(file)) {
    return false;
  }
  seen.add(identity);

  const parser = /\.(?:ts|tsx|mts)$/u.test(file) ? 'tsx' : 'babel';
  const j = jscodeshift.withParser(parser);
  const root = j(fs.readFileSync(file, 'utf-8'));
  const statements = root.find(j.Program).nodes()[0]?.body ?? [];
  let found = false;
  root
    .find(j.ExportNamedDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      if (found || exportPath.node.exportKind === 'type') return;
      if (declarationExportsName(exportPath.node.declaration, exportName)) {
        found = true;
        return;
      }
      for (const specifier of exportPath.node.specifiers ?? []) {
        if (
          specifier.type !== 'ExportSpecifier' ||
          specifier.exportKind === 'type' ||
          (specifier.exported?.name ?? specifier.exported?.value) !== exportName
        ) {
          continue;
        }
        if (!exportPath.node.source) {
          const localName = specifier.local?.name ?? specifier.local?.value;
          if (
            typeof localName === 'string' &&
            hasRuntimeBinding(
              statements,
              localName,
              file,
              jscodeshift,
              themeDir,
              allowedFiles,
              seen,
            )
          ) {
            found = true;
            return;
          }
          continue;
        }
        const target = resolveLocalThemeModule(
          exportPath.node.source.value,
          file,
          themeDir,
          allowedFiles,
        );
        const imported =
          specifier.local?.name ?? specifier.local?.value ?? exportName;
        if (
          target &&
          moduleExportsName(
            target,
            imported,
            jscodeshift,
            themeDir,
            allowedFiles,
            seen,
          )
        ) {
          found = true;
          return;
        }
      }
    });
  if (found) return true;
  if (
    exportName === 'default' &&
    statements.some(
      (/** @type {any} */ statement) =>
        statement.type === 'ExportDefaultDeclaration' &&
        isRuntimeDefaultDeclaration(statement.declaration),
    )
  ) {
    return true;
  }

  root.find(j.ExportAllDeclaration).forEach((/** @type {any} */ exportPath) => {
    if (found || exportPath.node.exportKind === 'type') return;
    const target = resolveLocalThemeModule(
      exportPath.node.source?.value,
      file,
      themeDir,
      allowedFiles,
    );
    if (
      target &&
      moduleExportsName(
        target,
        exportName,
        jscodeshift,
        themeDir,
        allowedFiles,
        seen,
      )
    ) {
      found = true;
    }
  });
  return found;
}

/**
 * Convert one static literal used by ThemeDoc. Theme descriptors intentionally
 * contain data only so synchronous bundled-theme APIs stay synchronous.
 * @param {any} node
 * @param {string} label
 * @returns {string | boolean}
 */
function staticThemeValue(node, label) {
  if (node?.type === 'StringLiteral' || node?.type === 'BooleanLiteral') {
    return node.value;
  }
  throw new Error(
    `${label} must use static string and boolean values in its default export.`,
  );
}

/**
 * How messages about a theme descriptor name it.
 * @param {string} docPath
 * @param {string} owner
 */
export function themeDescriptorLabel(docPath, owner) {
  return `Theme descriptor ${path.basename(docPath)} for ${owner}`;
}

/**
 * Read one strongly typed theme descriptor without executing it, and compile
 * it.
 * @param {string} docPath
 * @param {string} owner
 * @returns {import('../../authoring/doctypes/theme/type').ThemeDoc}
 */
function readThemeDoc(docPath, owner) {
  const label = themeDescriptorLabel(docPath, owner);
  const value = readThemeDescriptorValue(docPath, label);
  // Read statically, never executed, then compiled like every other doc.
  const {node, failure} = lowerDoc({
    id: `${owner}:themes:${path.basename(docPath)}`,
    root: 'themes',
    provider: owner,
    source: packageSource(docPath),
    lang: null,
    file: {file: path.basename(docPath), doc: value},
    label,
  });
  if (!node || failure !== undefined) throw failure;
  return node.doc;
}

/**
 * Descriptor reads in this process, by path and label, reused while the file
 * keeps its size and mtime.
 * @type {Map<string, {size: number, mtimeMs: number, read: {value: Record<string, string | boolean>} | {error: unknown}}>}
 */
const descriptorReads = new Map();

/**
 * The static value a theme descriptor default-exports, read from its source
 * without executing it. Throws when the file is not one static ThemeDoc
 * object.
 * @param {string} docPath
 * @param {string} label
 * @returns {Record<string, string | boolean>}
 */
export function readThemeDescriptorValue(docPath, label) {
  const {size, mtimeMs} = fs.statSync(docPath);
  const key = `${docPath}\0${label}`;
  let cached = descriptorReads.get(key);
  if (!cached || cached.size !== size || cached.mtimeMs !== mtimeMs) {
    /** @type {{value: Record<string, string | boolean>} | {error: unknown}} */
    let read;
    try {
      read = {
        value: readDescriptorSource(fs.readFileSync(docPath, 'utf-8'), label),
      };
    } catch (error) {
      read = {error};
    }
    cached = {size, mtimeMs, read};
    descriptorReads.set(key, cached);
  }
  if ('error' in cached.read) throw cached.read.error;
  return {...cached.read.value};
}

/**
 * @param {string} source
 * @param {string} label
 * @returns {Record<string, string | boolean>}
 */
function readDescriptorSource(source, label) {
  /** @type {any} */
  let ast;
  try {
    ast = descriptorParser().parse(source, {sourceType: 'module'});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} could not be parsed: ${message}`, {cause: error});
  }

  const statements = ast.program.body;
  const defaults = statements.filter(
    (/** @type {any} */ statement) =>
      statement.type === 'ExportDefaultDeclaration',
  );
  const unsupported = statements.filter(
    (/** @type {any} */ statement) =>
      statement.type !== 'ExportDefaultDeclaration' &&
      statement.type !== 'EmptyStatement',
  );
  if (unsupported.length > 0 || ast.program.directives.length > 0) {
    throw new Error(
      `${label} must contain only its static default-exported ThemeDoc object.`,
    );
  }
  if (
    defaults.length !== 1 ||
    defaults[0].declaration?.type !== 'ObjectExpression'
  ) {
    throw new Error(`${label} must default-export one static ThemeDoc object.`);
  }
  if (!declaresThemeDoc(ast.comments ?? [], defaults[0])) {
    throw new Error(
      `${label} must declare its public ThemeDoc type from @astryxdesign/cli/authoring.`,
    );
  }

  /** @type {Record<string, string | boolean>} */
  const value = {};
  for (const property of defaults[0].declaration.properties) {
    if (property.type !== 'ObjectProperty' || property.computed) {
      throw new Error(`${label} must contain only static object properties.`);
    }
    const key =
      property.key.type === 'Identifier'
        ? property.key.name
        : property.key.type === 'StringLiteral'
          ? property.key.value
          : null;
    if (key === null) {
      throw new Error(`${label} has an invalid property name.`);
    }
    if (Object.hasOwn(value, key)) {
      throw new Error(`${label} declares "${key}" more than once.`);
    }
    // Defined, not assigned, so `__proto__` stays a key the parser rejects.
    Object.defineProperty(value, key, {
      value: staticThemeValue(property.value, label),
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return value;
}

/** `import('@astryxdesign/cli/authoring').ThemeDoc`, without whitespace. */
const THEME_DOC_TYPE =
  /^import\((['"])@astryxdesign\/cli\/authoring\1\)\.ThemeDoc$/u;

/** @param {any} comment */
function isJsdoc(comment) {
  return comment.type === 'CommentBlock' && comment.value.startsWith('*');
}

/** @param {string} value a JSDoc comment body */
function jsdocText(value) {
  return value.replace(/^\s*\*+/gmu, ' ');
}

/**
 * The type names the file's JSDoc binds to ThemeDoc with `@typedef` or
 * `@import`. TypeScript reads these from any JSDoc comment in the module.
 * @param {any[]} comments
 */
function themeDocAliases(comments) {
  const aliases = new Set();
  for (const comment of comments.filter(isJsdoc)) {
    const text = jsdocText(comment.value);
    for (const [, type, name] of text.matchAll(
      /@typedef\s*\{([^{}]*)\}\s*([$A-Z_a-z][$\w]*)/gu,
    )) {
      if (THEME_DOC_TYPE.test(type.replace(/\s+/gu, ''))) aliases.add(name);
    }
    for (const [, names] of text.matchAll(
      /@import\s*\{([^{}]*)\}\s*from\s*(['"])@astryxdesign\/cli\/authoring\2/gu,
    )) {
      for (const specifier of names.split(',')) {
        const named = /^\s*ThemeDoc(?:\s+as\s+([$A-Z_a-z][$\w]*))?\s*$/u.exec(
          specifier,
        );
        if (named) aliases.add(named[1] ?? 'ThemeDoc');
      }
    }
    for (const [, namespace] of text.matchAll(
      /@import\s*\*\s*as\s+([$A-Z_a-z][$\w]*)\s+from\s*(['"])@astryxdesign\/cli\/authoring\2/gu,
    )) {
      aliases.add(`${namespace}.ThemeDoc`);
    }
  }
  return aliases;
}

/**
 * Whether the JSDoc TypeScript reads for the default export types it as the
 * public ThemeDoc: the last JSDoc comment before the statement, or the last
 * one before the opening parenthesis of a JSDoc cast of the object. Line
 * comments, strings, and JSDoc anywhere else never type it.
 * @param {any[]} comments every comment in the file
 * @param {any} exportDefault
 */
function declaresThemeDoc(comments, exportDefault) {
  const object = exportDefault.declaration;
  const parenStart = object.extra?.parenthesized ? object.extra.parenStart : -1;
  const attached = [
    (exportDefault.leadingComments ?? []).filter(isJsdoc).at(-1),
    (object.leadingComments ?? [])
      .filter(
        (/** @type {any} */ comment) =>
          isJsdoc(comment) && comment.end <= parenStart,
      )
      .at(-1),
  ];
  const aliases = themeDocAliases(comments);
  return attached.some(comment => {
    if (!comment) return false;
    const type = /@type\s*\{([^{}]*)\}/u
      .exec(jsdocText(comment.value))?.[1]
      ?.replace(/\s+/gu, '');
    return type != null && (THEME_DOC_TYPE.test(type) || aliases.has(type));
  });
}

/** A module named for the theme it exports, such as `oceanTheme.ts`. */
const THEME_SOURCE_RE = /^[$A-Z_a-z][$\w]*Theme\.(?:mjs|js|mts|ts|tsx|jsx)$/u;

/**
 * Every entry below one folder of a theme root, without following symlinks.
 * @param {string} folder
 * @returns {{files: string[], symlinks: string[]}} sorted POSIX paths
 *   relative to the folder
 */
function listThemeFolder(folder) {
  /** @type {string[]} */
  const files = [];
  /** @type {string[]} */
  const symlinks = [];
  /** @param {string} directory */
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const full = path.join(directory, entry.name);
      const relative = path.relative(folder, full).split(path.sep).join('/');
      if (entry.isSymbolicLink()) symlinks.push(relative);
      else if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(relative);
    }
  }
  walk(folder);
  return {files: files.sort(), symlinks: symlinks.sort()};
}

/**
 * The first entry that makes a folder a theme: a `.doc.mjs` descriptor or a
 * `<name>Theme` source, at any depth, linked or not.
 * @param {{files: string[], symlinks: string[]}} listing
 * @returns {string | undefined}
 */
function themeEvidence({files, symlinks}) {
  return [...files, ...symlinks].sort().find(file => {
    const name = path.posix.basename(file);
    return name.endsWith(THEME_DOC_SUFFIX) || THEME_SOURCE_RE.test(name);
  });
}

/**
 * Whether discovery reads a folder under a theme root as a theme. Dot-folders
 * and folders with neither a descriptor nor a `<name>Theme` source are not.
 * @param {string} folder absolute path
 */
export function isThemeFolder(folder) {
  return (
    !path.basename(folder).startsWith('.') &&
    themeEvidence(listThemeFolder(folder)) !== undefined
  );
}

/** @param {string[]} files */
function quoted(files) {
  return files.map(file => `"${file}"`).join(', ');
}

/**
 * The files `theme add` has always copied after a bundled theme's entry, in
 * copy order. SYNC: scripts/generate-cli-themes.mjs bundles these.
 * @param {string} id the theme's export name without `Theme`
 */
function bundledThemeArtifacts(id) {
  return [
    'icons.tsx',
    `${id}Palettes.ts`,
    `${id}Palettes.generated.ts`,
    `${id}PaletteRefs.generated.ts`,
    `${id}Palettes.generated.receipt.json`,
    'palette.config.json',
  ];
}

/**
 * The files `theme add` copies, entry first. A bundled theme's descriptor is
 * the CLI's own metadata and stays behind; an integration theme copies its
 * whole directory.
 * @param {string[]} files every regular file in the theme directory, sorted
 * @param {string} entry
 * @param {string} descriptor
 * @param {string} exportName
 * @param {boolean} bundled
 */
function copiedThemeFiles(files, entry, descriptor, exportName, bundled) {
  const rest = files.filter(
    file => file !== entry && !(bundled && file === descriptor),
  );
  if (!bundled) return [entry, ...rest];
  const order = bundledThemeArtifacts(exportName.replace(/Theme$/u, ''));
  return [
    entry,
    ...order.filter(file => rest.includes(file)),
    ...rest.filter(file => !order.includes(file)),
  ];
}

/**
 * Discover and validate one theme root.
 * @param {string} themeRoot absolute root containing one directory per slug
 * @param {string} owner package that owns the root
 * @param {{bundled?: boolean}} [options] a bundled root is the CLI's own; its
 *   sources are checked by the CLI's tests rather than on every read
 * @returns {DiscoveredTheme[]}
 */
export function discoverThemeDirectory(
  themeRoot,
  owner,
  {bundled = false} = {},
) {
  if (!fs.existsSync(themeRoot) || !fs.statSync(themeRoot).isDirectory()) {
    throw new Error(
      `Declared themes root does not exist on disk: ${themeRoot}`,
    );
  }
  if (fs.existsSync(path.join(themeRoot, 'manifest.json'))) {
    throw new Error(
      `Theme root for ${owner} contains unsupported manifest.json. Give every theme a strongly typed same-stem .doc.mjs descriptor instead.`,
    );
  }

  /** @type {DiscoveredTheme[]} */
  const themes = [];
  const slugs = new Set();
  const rootEntries = fs
    .readdirSync(themeRoot, {withFileTypes: true})
    .filter(entry => !entry.name.startsWith('.'));
  const rootDescriptor = rootEntries.find(
    entry => entry.isFile() && entry.name.endsWith(THEME_DOC_SUFFIX),
  );
  if (rootDescriptor) {
    throw new Error(
      `Theme descriptor "${rootDescriptor.name}" for ${owner} must be inside a lower-kebab theme directory.`,
    );
  }
  const rootSymlink = rootEntries.find(entry => entry.isSymbolicLink());
  if (rootSymlink) {
    throw new Error(
      `Theme root for ${owner} contains symlink "${rootSymlink.name}"; theme directories must stay inside the declared root.`,
    );
  }
  const directories = rootEntries
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const directory of directories) {
    const slug = directory.name;
    const listing = listThemeFolder(path.join(themeRoot, slug));
    const evidence = themeEvidence(listing);
    if (evidence === undefined) continue;
    if (!THEME_SLUG_RE.test(slug)) {
      throw new Error(
        `Theme root for ${owner} has invalid directory "${slug}"; use lowercase kebab-case starting with a letter.`,
      );
    }
    const normalizedSlug = slug.toLowerCase();
    if (slugs.has(normalizedSlug)) {
      throw new Error(
        `Theme root for ${owner} declares duplicate slug "${slug}".`,
      );
    }
    slugs.add(normalizedSlug);

    const sourceDir = resolveThemePath(
      slug,
      themeRoot,
      `theme "${slug}" directory`,
    );
    const theme = `Theme "${slug}" for ${owner}`;
    if (listing.symlinks.length > 0) {
      throw new Error(
        `${theme} contains symlink "${listing.symlinks[0]}"; theme files must be regular files inside the theme directory.`,
      );
    }
    const descriptors = listing.files.filter(file =>
      file.endsWith(THEME_DOC_SUFFIX),
    );
    const docs = descriptors.filter(file => !file.includes('/'));
    if (docs.length !== 1) {
      const detail =
        docs.length > 1
          ? `: ${quoted(docs)}`
          : evidence.includes('/')
            ? `; "${evidence}" is in a subfolder`
            : ` beside "${evidence}"`;
      throw new Error(
        `${theme} must contain exactly one same-stem .doc.mjs descriptor; found ${docs.length}${detail}.`,
      );
    }
    const nested = descriptors.find(file => file.includes('/'));
    if (nested) {
      throw new Error(
        `${theme} contains more than one .doc.mjs descriptor: "${docs[0]}" and "${nested}".`,
      );
    }

    const docPath = resolveThemePath(
      docs[0],
      sourceDir,
      `theme "${slug}" descriptor`,
    );
    const label = themeDescriptorLabel(docPath, owner);
    const exportName = docs[0].slice(0, -THEME_DOC_SUFFIX.length);
    if (!/^[$A-Z_a-z][$\w]*$/u.test(exportName)) {
      throw new Error(
        `${label} has stem "${exportName}", which is not a valid runtime export name.`,
      );
    }
    const sources = THEME_MODULE_EXTENSIONS.map(
      extension => `${exportName}${extension}`,
    ).filter(file => listing.files.includes(file));
    if (sources.length !== 1) {
      throw new Error(
        `${theme} must contain exactly one same-stem source for ${docs[0]}; found ${sources.length}${sources.length > 1 ? `: ${quoted(sources)}` : ''}.`,
      );
    }

    const doc = readThemeDoc(docPath, owner);
    if (doc.name !== slug) {
      throw new Error(
        `${label} names "${doc.name}" but its directory is "${slug}".`,
      );
    }
    const entry = sources[0];
    const entryPath = resolveThemePath(
      entry,
      sourceDir,
      `theme "${slug}" entry`,
    );

    if (!bundled) {
      const allowedFiles = new Set(
        listing.files
          .map(file =>
            resolveThemePath(file, sourceDir, `theme "${slug}" file`),
          )
          .filter(file => file !== docPath),
      );
      const jscodeshift = sourceParser();
      try {
        validateThemeModuleGraph(
          entryPath,
          jscodeshift,
          sourceDir,
          allowedFiles,
          owner,
          entry,
          docPath,
        );
        if (
          !moduleExportsName(
            entryPath,
            exportName,
            jscodeshift,
            sourceDir,
            allowedFiles,
          )
        ) {
          throw new ThemeRuntimeExportError(
            `Theme "${slug}" for ${owner} entry "${entry}" does not export "${exportName}".`,
          );
        }
      } catch (error) {
        if (
          error instanceof ThemeModuleReferenceError ||
          error instanceof ThemeRuntimeExportError
        ) {
          throw error;
        }
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Theme "${slug}" for ${owner} entry "${entry}" could not be parsed: ${message}`,
          {cause: error},
        );
      }
    }

    themes.push({
      slug,
      displayName: doc.displayName,
      description: doc.description,
      maintained: doc.maintained,
      entry,
      exportName,
      files: copiedThemeFiles(
        listing.files,
        entry,
        docs[0],
        exportName,
        bundled,
      ),
      package: owner,
      sourceDir,
      bundled,
      docPath,
    });
  }

  return themes;
}

/** @type {DiscoveredTheme[] | null} */
let bundledThemeCache = null;

/** @returns {DiscoveredTheme[]} */
export function discoverBundledThemes() {
  bundledThemeCache ??= discoverThemeDirectory(
    THEMES_DIR,
    BUNDLED_THEME_PACKAGE,
    {bundled: true},
  );
  return bundledThemeCache.map(theme => ({...theme, files: [...theme.files]}));
}

/**
 * @param {import('../integrations/integrations.mjs').LoadedIntegration} integration
 * @returns {Promise<DiscoveredTheme[]>}
 */
export async function discoverIntegrationThemes(integration) {
  if (!integration.themes) return [];
  return discoverThemeDirectory(integration.themes, integration.name);
}
