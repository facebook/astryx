// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme descriptor discovery shared by Project, theme list/add, and
 * integration validation.
 *
 * A theme root contains one directory per lower-kebab slug. Each directory has
 * a theme source and mandatory same-stem `.doc.mjs`; the directory is the
 * complete copy and pack boundary. Descriptor metadata is parsed without
 * executing theme source.
 *
 * @input a bundled or integration-owned theme root
 * @output validated source-theme records with package ownership
 * @position packages/cli/foundation/discovery — shared theme discovery
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import jscodeshift from 'jscodeshift';
import {lowerDoc} from '../doc-compiler/compile.mjs';
import {packageSource} from '../doc-compiler/source.mjs';
import {CLI_ROOT} from '../fs/paths.mjs';
import {assertWithin, PathSafetyError} from '../fs/path-safety.mjs';

export const BUNDLED_THEME_PACKAGE = '@astryxdesign/cli';
export const THEMES_DIR = path.join(CLI_ROOT, 'assets', 'templates', 'themes');
export const THEME_DOC_SUFFIX = '.doc.mjs';

/**
 * @typedef {object} DiscoveredTheme
 * @property {string} slug
 * @property {string} displayName
 * @property {string} description
 * @property {boolean} maintained
 * @property {string} entry
 * @property {string} exportName
 * @property {string[]} files
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

const THEME_MODULE_EXTENSIONS = ['.mjs', '.js', '.mts', '.ts', '.tsx', '.jsx'];

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
  if (node?.type === 'StringLiteral' || typeof node?.value === 'string') {
    return node.value;
  }
  if (node?.type === 'BooleanLiteral' || typeof node?.value === 'boolean') {
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
 * The static value a theme descriptor default-exports, read from its source
 * without executing it. Throws when the file is not one static ThemeDoc
 * object.
 * @param {string} docPath
 * @param {string} label
 * @returns {Record<string, string | boolean>}
 */
export function readThemeDescriptorValue(docPath, label) {
  let statements;
  const source = fs.readFileSync(docPath, 'utf-8');
  if (
    !/@type\s*\{\s*import\(['"]@astryxdesign\/cli\/authoring['"]\)\.ThemeDoc\s*\}/u.test(
      source,
    )
  ) {
    throw new Error(
      `${label} must declare its public ThemeDoc type from @astryxdesign/cli/authoring.`,
    );
  }
  try {
    const j = jscodeshift.withParser('babel');
    statements = j(source).find(j.Program).nodes()[0]?.body;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} could not be parsed: ${message}`, {cause: error});
  }

  const defaults = (statements ?? []).filter(
    (/** @type {any} */ statement) =>
      statement.type === 'ExportDefaultDeclaration',
  );
  const unsupported = (statements ?? []).filter(
    (/** @type {any} */ statement) =>
      statement.type !== 'ExportDefaultDeclaration' &&
      statement.type !== 'EmptyStatement',
  );
  if (unsupported.length > 0) {
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

  /** @type {Record<string, string | boolean>} */
  const value = {};
  for (const property of defaults[0].declaration.properties ?? []) {
    if (property.type !== 'ObjectProperty' && property.type !== 'Property') {
      throw new Error(`${label} must contain only static object properties.`);
    }
    if (
      property.computed ||
      property.method ||
      property.kind === 'get' ||
      property.kind === 'set'
    ) {
      throw new Error(`${label} must contain only static object properties.`);
    }
    const key =
      property.key?.type === 'Identifier'
        ? property.key.name
        : typeof property.key?.value === 'string'
          ? property.key.value
          : null;
    if (!key) {
      throw new Error(`${label} has an invalid property name.`);
    }
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      throw new Error(`${label} declares "${key}" more than once.`);
    }
    value[key] = staticThemeValue(property.value, label);
  }
  return value;
}

/**
 * Recursively enumerate the files owned by one theme directory. The complete
 * directory, including its descriptor, is copied and checked as one unit.
 * @param {string} themeDir
 * @param {string} docPath
 * @param {string} slug
 * @returns {string[]} POSIX paths relative to themeDir
 */
function enumerateThemeFiles(themeDir, docPath, slug) {
  /** @type {string[]} */
  const files = [];
  /** @param {string} directory */
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const full = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(
          `Theme "${slug}" contains symlink "${path.relative(themeDir, full)}"; theme files must be regular files inside the theme directory.`,
        );
      }
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      const confined = assertWithin(full, themeDir, {
        allowAbsolute: true,
        label: `theme "${slug}" file`,
      });
      if (entry.name.endsWith(THEME_DOC_SUFFIX) && confined !== docPath) {
        throw new Error(
          `Theme "${slug}" contains more than one .doc.mjs descriptor.`,
        );
      }
      files.push(path.relative(themeDir, confined).split(path.sep).join('/'));
    }
  }
  walk(themeDir);
  return files.sort();
}

/**
 * Discover and validate one theme root.
 * @param {string} themeRoot absolute root containing one directory per slug
 * @param {string} owner package that owns the root
 * @param {{bundled?: boolean}} [options]
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
  const rootEntries = fs.readdirSync(themeRoot, {withFileTypes: true});
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
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(slug)) {
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
    const docs = fs
      .readdirSync(sourceDir, {withFileTypes: true})
      .filter(entry => entry.isFile() && entry.name.endsWith(THEME_DOC_SUFFIX))
      .map(entry => entry.name);
    if (docs.length !== 1) {
      throw new Error(
        `Theme "${slug}" for ${owner} must contain exactly one same-stem .doc.mjs descriptor; found ${docs.length}.`,
      );
    }

    const docPath = resolveThemePath(
      docs[0],
      sourceDir,
      `theme "${slug}" descriptor`,
    );
    const exportName = docs[0].slice(0, -THEME_DOC_SUFFIX.length);
    if (!/^[$A-Z_a-z][$\w]*$/u.test(exportName)) {
      throw new Error(
        `Theme "${slug}" descriptor stem "${exportName}" is not a valid runtime export name.`,
      );
    }
    const sourceCandidates = THEME_MODULE_EXTENSIONS.map(extension =>
      path.join(sourceDir, `${exportName}${extension}`),
    ).filter(
      candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
    );
    if (sourceCandidates.length !== 1) {
      throw new Error(
        `Theme "${slug}" for ${owner} must contain exactly one same-stem source for ${docs[0]}; found ${sourceCandidates.length}.`,
      );
    }

    const doc = readThemeDoc(docPath, owner);
    if (doc.name !== slug) {
      throw new Error(
        `Theme descriptor ${docs[0]} names "${doc.name}" but its directory is "${slug}".`,
      );
    }
    const entryPath = sourceCandidates[0];
    const entry = path.basename(entryPath);
    const files = enumerateThemeFiles(sourceDir, docPath, slug);
    const allowedFiles = new Set(
      files
        .map(file => resolveThemePath(file, sourceDir, `theme "${slug}" file`))
        .filter(file => file !== docPath),
    );

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

    themes.push({
      slug,
      displayName: doc.displayName,
      description: doc.description,
      maintained: doc.maintained,
      entry,
      exportName,
      files,
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
