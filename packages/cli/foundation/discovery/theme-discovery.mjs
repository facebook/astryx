// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme catalog discovery shared by Project, theme list/add, and
 * integration validation.
 *
 * A theme root uses the same layout as the CLI's generated bundle:
 * `manifest.json` beside one directory per slug. Manifest `entry` and `files`
 * paths are relative to that slug directory and are confined there before any
 * caller reads or copies them.
 *
 * @input a bundled or integration-owned theme root
 * @output validated source-theme records with package ownership
 * @position packages/cli/foundation/discovery — shared theme discovery
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../fs/paths.mjs';
import {assertWithin, PathSafetyError} from '../fs/path-safety.mjs';

export const BUNDLED_THEME_PACKAGE = '@astryxdesign/cli';
export const THEMES_DIR = path.join(CLI_ROOT, 'assets', 'templates', 'themes');
export const THEME_MANIFEST_BASENAME = 'manifest.json';
export const MANIFEST_PATH = path.join(THEMES_DIR, THEME_MANIFEST_BASENAME);

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
 */

/** @param {unknown} value @param {string} field @param {string} owner */
function requiredString(value, field, owner) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(
      `Theme catalog for ${owner} has an invalid ${field}; expected a non-empty string.`,
    );
  }
  return value;
}

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
 * Resolve a local theme module only when the target is a listed file confined
 * to the theme directory.
 * @param {unknown} specifier
 * @param {string} fromFile
 * @param {string} themeDir
 * @param {Set<string>} allowedFiles
 */
function resolveLocalThemeModule(specifier, fromFile, themeDir, allowedFiles) {
  if (typeof specifier !== 'string' || !specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    ...THEME_MODULE_EXTENSIONS.map(extension => `${base}${extension}`),
    ...THEME_MODULE_EXTENSIONS.map(extension =>
      path.join(base, `index${extension}`),
    ),
  ];
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

/**
 * Validate that every local static dependency is copied with the theme.
 * @param {string} file
 * @param {any} jscodeshift
 * @param {string} themeDir
 * @param {Set<string>} allowedFiles
 * @param {string} owner
 * @param {string} entry
 * @param {Set<string>} [seen]
 */
function validateThemeModuleGraph(
  file,
  jscodeshift,
  themeDir,
  allowedFiles,
  owner,
  entry,
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
      throw new ThemeModuleReferenceError(
        `Theme catalog for ${owner} entry "${entry}" references local module "${specifier}" that must resolve to a listed file inside the theme directory.`,
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
 * Read and validate one theme catalog.
 * @param {string} themeRoot absolute catalog root
 * @param {string} owner package that owns the catalog
 * @param {{bundled?: boolean}} [options]
 * @returns {DiscoveredTheme[]}
 */
export function discoverThemeCatalog(themeRoot, owner, {bundled = false} = {}) {
  if (!fs.existsSync(themeRoot) || !fs.statSync(themeRoot).isDirectory()) {
    throw new Error(
      `Declared themes root does not exist on disk: ${themeRoot}`,
    );
  }

  const manifestPath = resolveThemePath(
    THEME_MANIFEST_BASENAME,
    themeRoot,
    'theme catalog manifest',
  );
  if (!fs.existsSync(manifestPath) || !fs.statSync(manifestPath).isFile()) {
    throw new Error(
      `Theme root for ${owner} must contain ${THEME_MANIFEST_BASENAME}.`,
    );
  }

  /** @type {unknown} */
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Theme catalog for ${owner} is unreadable: ${message}`, {
      cause: error,
    });
  }

  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Theme catalog for ${owner} must be a JSON object.`);
  }
  const catalog = /** @type {{version?: unknown, themes?: unknown}} */ (parsed);
  if (catalog.version !== 1) {
    throw new Error(`Theme catalog for ${owner} must use version 1.`);
  }
  if (!Array.isArray(catalog.themes)) {
    throw new Error(`Theme catalog for ${owner} must contain a themes array.`);
  }

  /** @type {DiscoveredTheme[]} */
  const themes = [];
  const slugs = new Set();
  for (const [index, raw] of catalog.themes.entries()) {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error(
        `Theme catalog for ${owner} has an invalid entry at index ${index}.`,
      );
    }
    const entry = /** @type {Record<string, unknown>} */ (raw);
    const slug = requiredString(entry.slug, `themes[${index}].slug`, owner);
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(slug)) {
      throw new Error(
        `Theme catalog for ${owner} has invalid slug "${slug}"; use lowercase kebab-case starting with a letter.`,
      );
    }
    const normalizedSlug = slug.toLowerCase();
    if (slugs.has(normalizedSlug)) {
      throw new Error(
        `Theme catalog for ${owner} declares duplicate slug "${slug}".`,
      );
    }
    slugs.add(normalizedSlug);

    const displayName = requiredString(
      entry.displayName,
      `theme "${slug}" displayName`,
      owner,
    );
    if (typeof entry.description !== 'string') {
      throw new Error(
        `Theme catalog for ${owner} has an invalid description for "${slug}".`,
      );
    }
    if (typeof entry.maintained !== 'boolean') {
      throw new Error(
        `Theme catalog for ${owner} has an invalid maintained flag for "${slug}".`,
      );
    }
    const entryFile = requiredString(
      entry.entry,
      `theme "${slug}" entry`,
      owner,
    );
    const exportName = requiredString(
      entry.exportName,
      `theme "${slug}" exportName`,
      owner,
    );
    if (!/^[$A-Z_a-z][$\w]*$/u.test(exportName)) {
      throw new Error(
        `Theme catalog for ${owner} has invalid exportName "${exportName}".`,
      );
    }
    if (!Array.isArray(entry.files) || entry.files.length === 0) {
      throw new Error(
        `Theme catalog for ${owner} theme "${slug}" must list at least one file.`,
      );
    }

    const files = entry.files.map((file, fileIndex) =>
      requiredString(file, `theme "${slug}" files[${fileIndex}]`, owner),
    );
    if (new Set(files).size !== files.length) {
      throw new Error(
        `Theme catalog for ${owner} theme "${slug}" lists a file more than once.`,
      );
    }
    if (!files.includes(entryFile)) {
      throw new Error(
        `Theme catalog for ${owner} theme "${slug}" must include entry "${entryFile}" in files.`,
      );
    }
    if (!/\.(?:ts|tsx|mjs|js)$/u.test(entryFile)) {
      throw new Error(
        `Theme catalog for ${owner} theme "${slug}" entry must be source code.`,
      );
    }

    const sourceDir = resolveThemePath(
      slug,
      themeRoot,
      `theme "${slug}" directory`,
    );
    if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
      throw new Error(
        `Theme catalog for ${owner} is missing directory "${slug}".`,
      );
    }
    for (const file of files) {
      const source = resolveThemePath(file, sourceDir, `theme "${slug}" file`);
      if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
        throw new Error(
          `Theme catalog for ${owner} theme "${slug}" is missing file "${file}".`,
        );
      }
    }

    themes.push({
      slug,
      displayName,
      description: entry.description,
      maintained: entry.maintained,
      entry: entryFile,
      exportName,
      files,
      package: owner,
      sourceDir,
      bundled,
    });
  }

  return themes;
}

/** @returns {DiscoveredTheme[]} */
export function discoverBundledThemes() {
  return discoverThemeCatalog(THEMES_DIR, BUNDLED_THEME_PACKAGE, {
    bundled: true,
  });
}

/**
 * @param {import('../integrations/integrations.mjs').LoadedIntegration} integration
 * @returns {Promise<DiscoveredTheme[]>}
 */
export async function discoverIntegrationThemes(integration) {
  if (!integration.themes) return [];
  const themes = discoverThemeCatalog(integration.themes, integration.name);
  const jscodeshift = (await import('jscodeshift')).default;
  for (const theme of themes) {
    const allowedFiles = new Set(
      theme.files.map(file =>
        resolveThemePath(file, theme.sourceDir, `theme "${theme.slug}" file`),
      ),
    );
    const entryPath = resolveThemePath(
      theme.entry,
      theme.sourceDir,
      `theme "${theme.slug}" entry`,
    );
    let exportsName;
    try {
      validateThemeModuleGraph(
        entryPath,
        jscodeshift,
        theme.sourceDir,
        allowedFiles,
        theme.package,
        theme.entry,
      );
      exportsName = moduleExportsName(
        entryPath,
        theme.exportName,
        jscodeshift,
        theme.sourceDir,
        allowedFiles,
      );
    } catch (error) {
      if (error instanceof ThemeModuleReferenceError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Theme catalog for ${theme.package} entry "${theme.entry}" could not be parsed: ${message}`,
        {cause: error},
      );
    }
    if (!exportsName) {
      throw new Error(
        `Theme catalog for ${theme.package} entry "${theme.entry}" does not export "${theme.exportName}".`,
      );
    }
  }
  return themes;
}
