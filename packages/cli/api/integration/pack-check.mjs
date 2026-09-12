// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx integration pack --check` — verify an integration package is
 * ready to publish by cross-referencing its declared contributions against the
 * real npm tarball.
 *
 * Three phases:
 *   1. Structure validation — reuses `validateLocalIntegration`.
 *   2. Pack-list cross-reference — computes the static file inventory and
 *      compares it against the lifecycle-produced `npm pack --json` artifact.
 *   3. Extracted-tarball validation — extracts the tarball into a scratch
 *      consumer under the author's node_modules and runs the same discovery
 *      functions a consumer uses, then compares identities (slugs, names,
 *      topic ids) exactly.
 *
 * Contract: every contribution visible in the author's package, and every
 * file required to make it visible, must survive the real npm tarball and
 * be equally visible from an extracted node_modules consumer view.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import jscodeshift from 'jscodeshift';
import {assertWithin} from '../../foundation/fs/path-safety.mjs';
import {resolvePackageDir} from '../../foundation/integrations/integrations.mjs';
import {
  discoverIntegrationComponents,
  resolveIntegrationImportPath,
} from '../../foundation/discovery/component-discovery.mjs';
import {loadComponentDoc} from '../../foundation/discovery/component-loader.mjs';
import {discoverIntegrationTemplatesForOne} from '../../foundation/discovery/template-adapter.mjs';
import {
  validateLocalIntegration,
  validateInstalledIntegration,
} from './validate-integration.mjs';
import {
  computeRequiredFiles,
  collectIdentities,
  compareIdentities,
} from '../../foundation/integrations/contribution-inventory.mjs';

/**
 * @typedef {import('../../foundation/integrations/issue').AstryxIntegrationIssue} Issue
 */

/** @param {string} code @param {string} message @returns {Issue} */
function error(code, message) {
  return {code, severity: 'error', message};
}

/** @param {string} code @param {string} message @returns {Issue} */
function warning(code, message) {
  return {code, severity: 'warning', message};
}

/**
 * Cleanup must never hide the check result or prevent the other temporary tree
 * from being removed.
 * @param {string|null} dir
 * @param {string} label
 * @param {Issue[]} issues
 */
function removeTreeBestEffort(dir, label, issues) {
  if (dir == null) return;
  try {
    fs.rmSync(dir, {recursive: true, force: true});
  } catch (err) {
    issues.push(
      warning(
        'cleanup_failed',
        `Could not remove ${label} ${dir}: ${err instanceof Error ? err.message : String(err)}`,
      ),
    );
  }
}

/**
 * Find the nearest package.json starting from `cwd` and walking up.
 * @param {string} cwd
 * @returns {{packageDir: string, pkg: Record<string, unknown>}|null}
 */
function findPackage(cwd) {
  let dir = path.resolve(cwd);
  for (let depth = 0; depth < 50; depth++) {
    const file = path.join(dir, 'package.json');
    if (fs.existsSync(file)) {
      try {
        return {
          packageDir: dir,
          pkg: JSON.parse(fs.readFileSync(file, 'utf-8')),
        };
      } catch (err) {
        throw new Error(
          `Could not parse ${file}: ${err instanceof Error ? err.message : String(err)}`,
          {cause: err},
        );
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Build the empty receipt returned when no integration manifest is found.
 * @param {string|null} name
 * @param {Issue[]} issues
 * @returns {import('./pack-check.type.mjs').IntegrationPackCheckResponse}
 */
function emptyReceipt(name, issues) {
  return {
    type: 'integration.pack-check',
    data: {
      name,
      version: null,
      packable: !issues.some(i => i.severity === 'error'),
      tarball: null,
      inventory: {manifest: null, roots: [], expectedFiles: 0, packedFiles: 0},
      contributions: {local: null, packed: null},
      issues,
    },
  };
}

/**
 * Parse npm's JSON pack result into the facts the checker needs.
 * @param {string} output
 * @returns {{filename: string, fileCount: number, size: number, unpackedSize: number, packedPaths: Set<string>}}
 */
export function parseNpmPackOutput(output) {
  /** @type {Array<{filename: string, entryCount: number, size: number, unpackedSize: number, files?: Array<{path: string}>}>} */
  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch {
    throw new Error('npm pack produced unparseable JSON output.');
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('npm pack returned an empty result.');
  }
  const info = parsed[0];
  if (!info || !Array.isArray(info.files)) {
    throw new Error('npm pack returned a result without a files array.');
  }
  return {
    filename: info.filename,
    fileCount: info.entryCount,
    size: info.size,
    unpackedSize: info.unpackedSize,
    packedPaths: new Set(info.files.map(file => file.path)),
  };
}

/**
 * Run `npm pack --json` with output directed to `destDir` so no preexisting
 * tgz is overwritten. This intentionally runs the package lifecycle, matching
 * the artifact `npm publish` would produce. Uses spawnSync with an args array —
 * no shell — so paths with metacharacters cannot inject.
 *
 * @param {string} packageDir
 * @param {string} destDir
 * @returns {{filename: string, fileCount: number, size: number, unpackedSize: number, packedPaths: Set<string>}}
 */
function runNpmPack(packageDir, destDir) {
  const result = spawnSync(
    'npm',
    ['pack', '--json', '--silent', `--pack-destination=${destDir}`],
    {cwd: packageDir, encoding: 'utf-8', timeout: 60_000},
  );
  if (result.error) {
    throw new Error(`Could not start npm pack: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    throw new Error(
      `npm pack failed (exit ${result.status})${stderr ? `: ${stderr}` : ''}.`,
    );
  }
  return parseNpmPackOutput(result.stdout);
}

/**
 * Extract a tarball into `extractDir`, stripping the leading `package/`
 * directory that npm tarballs wrap files in. Uses spawnSync with an args
 * array — no shell.
 *
 * @param {string} tgzPath
 * @param {string} extractDir
 */
function extractTarball(tgzPath, extractDir) {
  fs.mkdirSync(extractDir, {recursive: true});
  const result = spawnSync(
    'tar',
    ['xzf', tgzPath, '-C', extractDir, '--strip-components=1'],
    {encoding: 'utf-8', timeout: 30_000},
  );
  if (result.error) {
    throw new Error(`Could not start tar extraction: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    throw new Error(
      `tar extraction failed (exit ${result.status})${stderr ? `: ${stderr}` : ''}.`,
    );
  }
}

const MODULE_EXTENSIONS = ['.mjs', '.js', '.mts', '.ts', '.tsx', '.jsx'];
const moduleParser = jscodeshift.withParser('tsx');

/** @param {unknown} specifier @param {string} fromFile */
function resolveLocalModule(specifier, fromFile) {
  if (typeof specifier !== 'string' || !specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    ...MODULE_EXTENSIONS.map(extension => `${base}${extension}`),
    ...MODULE_EXTENSIONS.map(extension => path.join(base, `index${extension}`)),
  ];
  return candidates.find(candidate => fs.existsSync(candidate)) ?? null;
}

/** @param {any} declaration @param {string} exportName */
function declarationExports(declaration, exportName) {
  if (!declaration) return false;
  if (['FunctionDeclaration', 'ClassDeclaration'].includes(declaration.type)) {
    return declaration.id?.name === exportName;
  }
  if (declaration.type !== 'VariableDeclaration') return false;
  return declaration.declarations.some(
    (/** @type {any} */ item) =>
      item.id?.type === 'Identifier' && item.id.name === exportName,
  );
}

/**
 * Check one resolved module's static export surface without executing package
 * code. Local ESM re-exports are followed recursively.
 *
 * @param {string} file
 * @param {string} exportName
 * @param {Set<string>} [seen]
 */
function moduleExportsName(file, exportName, seen = new Set()) {
  const identity = `${file}\0${exportName}`;
  if (seen.has(identity) || !fs.existsSync(file)) return false;
  seen.add(identity);

  let root;
  try {
    root = moduleParser(fs.readFileSync(file, 'utf-8'));
  } catch {
    return false;
  }

  let found = false;
  root
    .find(moduleParser.ExportNamedDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      if (found) return;
      const node = exportPath.node;
      if (declarationExports(node.declaration, exportName)) {
        found = true;
        return;
      }
      for (const specifier of node.specifiers ?? []) {
        const exported = specifier.exported?.name ?? specifier.exported?.value;
        if (exported !== exportName) continue;
        if (!node.source) {
          found = true;
          return;
        }
        const target = resolveLocalModule(node.source.value, file);
        const imported =
          specifier.local?.name ?? specifier.local?.value ?? exportName;
        if (target && moduleExportsName(target, imported, seen)) {
          found = true;
          return;
        }
      }
    });
  if (found) return true;
  if (
    exportName === 'default' &&
    root.find(moduleParser.ExportDefaultDeclaration).size() > 0
  ) {
    return true;
  }

  root
    .find(moduleParser.ExportAllDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      if (found) return;
      const target = resolveLocalModule(exportPath.node.source?.value, file);
      if (target && moduleExportsName(target, exportName, seen)) found = true;
    });
  return found;
}

/**
 * Resolve package specifiers through Node's real ESM resolver from the scratch
 * consumer. Resolution does not execute the target module, so source `.tsx`
 * exports and built `.mjs` exports are both safe to inspect.
 *
 * @param {string[]} specifiers
 * @param {string} scratchBase
 * @returns {Map<string, {url?: string, error?: string}>}
 */
function resolveConsumerSpecifiers(specifiers, scratchBase) {
  const resolver = path.join(scratchBase, '.astryx-resolve-imports.mjs');
  const source = `const specs = JSON.parse(process.argv[2]);\nconst out = {};\nfor (const specifier of specs) {\n  try { out[specifier] = {url: import.meta.resolve(specifier)}; }\n  catch (error) { out[specifier] = {error: error instanceof Error ? error.message : String(error)}; }\n}\nconsole.log(JSON.stringify(out));\n`;
  fs.writeFileSync(resolver, source, {flag: 'wx'});
  try {
    const result = spawnSync(
      process.execPath,
      [resolver, JSON.stringify([...new Set(specifiers)])],
      {cwd: scratchBase, encoding: 'utf-8', timeout: 30_000},
    );
    if (result.error || result.status !== 0) {
      const message = result.error?.message ?? result.stderr.trim();
      return new Map(
        specifiers.map(specifier => [
          specifier,
          {error: message || `resolver exited ${result.status}`},
        ]),
      );
    }
    const parsed = JSON.parse(result.stdout);
    return new Map(
      /** @type {Array<[string, {url?: string, error?: string}]>} */ (
        Object.entries(parsed)
      ),
    );
  } finally {
    fs.rmSync(resolver, {force: true});
  }
}

/**
 * Verify that every packed component is reachable through the exact import
 * specifier the component API gives consumers, and that the resolved module
 * statically exports the component name.
 *
 * @param {import('../../foundation/integrations/integrations.mjs').LoadedIntegration} integration
 * @param {string} scratchBase
 * @returns {Promise<Issue[]>}
 */
async function validatePackedComponentExports(integration, scratchBase) {
  const records = discoverIntegrationComponents(integration);
  /** @type {Array<{name: string, specifier: string}>} */
  const components = [];
  for (const record of records) {
    let docs;
    try {
      docs = await loadComponentDoc(record.docPath);
    } catch {
      continue;
    }
    const specifier =
      /** @type {{import?: string}} */ (docs).import ??
      resolveIntegrationImportPath(
        {
          exportsMap: integration.__packageExports,
          packageDir: integration.__packageDir,
          docPath: record.docPath,
          packageName: integration.name,
        },
        record.name,
      );
    components.push({name: record.name, specifier});
  }

  const resolved = resolveConsumerSpecifiers(
    components.map(component => component.specifier),
    scratchBase,
  );
  const issues = validateSpecifierExtensions(
    components.map(({name, specifier}) => ({
      label: `Component "${name}"`,
      specifier,
    })),
  );
  for (const {name, specifier} of components) {
    const result = resolved.get(specifier);
    if (!result?.url || result.error) {
      issues.push(
        error(
          'component_import_unresolvable',
          `Component "${name}" advertises import "${specifier}", but a consumer cannot resolve it${result?.error ? `: ${result.error}` : '.'}`,
        ),
      );
      continue;
    }
    let target;
    try {
      target = fileURLToPath(result.url);
    } catch {
      target = null;
    }
    if (!target || !moduleExportsName(target, name)) {
      issues.push(
        error(
          'component_export_missing',
          `Component "${name}" advertises import "${specifier}", but that packed module does not export "${name}". Add or correct the package export before publishing.`,
        ),
      );
    }
  }
  return issues;
}

/**
 * Verify that every packed template source can be imported through its exact
 * package subpath and still has a default export.
 *
 * @param {import('../../foundation/integrations/integrations.mjs').LoadedIntegration} integration
 * @param {string} scratchBase
 * @returns {Promise<Issue[]>}
 */
async function validatePackedTemplateExports(integration, scratchBase) {
  const {templates} = await discoverIntegrationTemplatesForOne(integration);
  const entries = templates.map(template => {
    const relPath = path
      .relative(integration.__packageDir, template.filePath)
      .split(path.sep)
      .join('/');
    const extensionless = relPath.replace(/\.tsx?$/u, '');
    return {
      id: template.dirName,
      specifier: `${integration.name}/${extensionless}`,
    };
  });
  const resolved = resolveConsumerSpecifiers(
    entries.map(entry => entry.specifier),
    scratchBase,
  );
  const issues = validateSpecifierExtensions(
    entries.map(({id, specifier}) => ({
      label: `Template "${id}"`,
      specifier,
    })),
  );
  for (const {id, specifier} of entries) {
    const result = resolved.get(specifier);
    if (!result?.url || result.error) {
      issues.push(
        error(
          'template_import_unresolvable',
          `Template "${id}" source is packed but its public import "${specifier}" cannot be resolved${result?.error ? `: ${result.error}` : '.'}`,
        ),
      );
      continue;
    }
    let target;
    try {
      target = fileURLToPath(result.url);
    } catch {
      target = null;
    }
    if (!target || !moduleExportsName(target, 'default')) {
      issues.push(
        error(
          'template_export_missing',
          `Template "${id}" public import "${specifier}" does not have a default export.`,
        ),
      );
    }
  }
  return issues;
}

const TS_EXTENSION_RE = /\.tsx?$/u;

/**
 * Reject specifiers that end in a TypeScript extension — they fail under
 * default `moduleResolution` with TS5097/TS2307 unless the consumer enables
 * `allowImportingTsExtensions`.
 *
 * @param {Array<{label: string, specifier: string}>} entries
 * @returns {Issue[]}
 */
function validateSpecifierExtensions(entries) {
  /** @type {Issue[]} */
  const issues = [];
  for (const {label, specifier} of entries) {
    if (TS_EXTENSION_RE.test(specifier)) {
      issues.push(
        error(
          'typescript_extension_in_specifier',
          `${label} advertises import "${specifier}", which ends in a TypeScript extension. A consumer with default moduleResolution will reject it (TS5097). Use an extensionless specifier mapped through the package exports.`,
        ),
      );
    }
  }
  return issues;
}

/**
 * Verify an integration package is ready to publish.
 *
 * Validates the local structure, cross-references every declared contribution
 * file against the real `npm pack` file list, extracts the tarball into a
 * scratch consumer, and compares local vs packed discovery results exactly.
 *
 * @param {import('./pack-check.type.mjs').IntegrationPackCheckOptions} [options]
 * @returns {Promise<import('./pack-check.type.mjs').IntegrationPackCheckResponse>}
 */
export async function integrationPackCheck(options = {}) {
  const {cwd = process.cwd()} = options;

  // ── Locate the package ──
  let found;
  try {
    found = findPackage(cwd);
  } catch (err) {
    return emptyReceipt(null, [
      error(
        'invalid_package_json',
        err instanceof Error ? err.message : String(err),
      ),
    ]);
  }
  if (!found) {
    return emptyReceipt(null, [
      error(
        'no_package',
        'No package.json found. Run this command inside an integration package.',
      ),
    ]);
  }
  const {packageDir, pkg} = found;
  const pkgName = typeof pkg.name === 'string' ? pkg.name : '(unnamed package)';
  const pkgVersion = typeof pkg.version === 'string' ? pkg.version : null;

  // ── Phase 1: structure validation ──
  const localResult = await validateLocalIntegration(cwd);
  /** @type {Issue[]} */
  const issues = [...localResult.issues];

  if (!localResult.found || !localResult.integration) {
    return emptyReceipt(pkgName, [
      ...issues,
      ...(localResult.found
        ? []
        : [
            error(
              'missing_manifest',
              'No astryx.integration.{ts,mjs,js} found next to package.json.',
            ),
          ]),
    ]);
  }

  const loaded = localResult.integration;

  // ── Phase 2: file inventory + npm pack ──
  const fileInv = computeRequiredFiles(loaded);
  const {identities: localIdentities, errors: localDiscoveryErrors} =
    await collectIdentities(loaded);
  for (const discoveryError of localDiscoveryErrors) {
    issues.push(
      error(
        'local_discovery_failed',
        `${discoveryError.kind}: ${discoveryError.message}`,
      ),
    );
  }
  for (const root of fileInv.roots) {
    if (root.files.length === 0) {
      issues.push(
        error(
          'empty_contribution_root',
          `Declared ${root.kind} root "${root.path}" contains no discoverable contribution files.`,
        ),
      );
    }
  }

  // Temp resources — always cleaned up
  const tgzTmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'astryx-pack-check-'),
  );
  /** @type {string|null} */
  let scratchBase = null;

  try {
    // npm pack
    /** @type {ReturnType<typeof runNpmPack>} */
    let packResult;
    try {
      packResult = runNpmPack(packageDir, tgzTmpDir);
    } catch (err) {
      issues.push(error('pack_failed', /** @type {Error} */ (err).message));
      return buildReceipt(
        pkgName,
        pkgVersion,
        fileInv,
        null,
        localIdentities,
        null,
        issues,
      );
    }

    // Create the repo-local consumer AFTER packing, so it cannot enter the
    // tarball. Keeping it beside the package lets packed metadata resolve the
    // package's already-installed dependencies. The unique suffix makes
    // concurrent checks independent.
    scratchBase = fs.mkdtempSync(path.join(packageDir, '.astryx-pack-check-'));

    // Cross-reference file inventory vs pack list
    if (!packResult.packedPaths.has(fileInv.manifest)) {
      issues.push(
        error(
          'manifest_not_packed',
          `Integration manifest "${fileInv.manifest}" is not in the npm pack list. ` +
            'Add it to "files" in package.json.',
        ),
      );
    }

    for (const root of fileInv.roots) {
      const missing = root.files.filter(f => !packResult.packedPaths.has(f));
      if (missing.length === root.files.length && root.files.length > 0) {
        issues.push(
          error(
            'root_not_packed',
            `Declared ${root.kind} root "${root.path}" has 0 of ${root.files.length} expected ` +
              `files in the pack list. Add "${root.path.replace(/^\.\//, '')}" to "files" in package.json.`,
          ),
        );
      } else {
        for (const file of missing) {
          issues.push(
            error(
              'file_not_packed',
              `${root.kind} file "${file}" is not in the pack list.`,
            ),
          );
        }
      }
    }

    let tgzPath;
    try {
      tgzPath = assertWithin(packResult.filename, tgzTmpDir, {
        label: 'npm pack filename',
      });
    } catch (err) {
      issues.push(
        error(
          'invalid_pack_result',
          err instanceof Error ? err.message : String(err),
        ),
      );
      return buildReceipt(
        pkgName,
        pkgVersion,
        fileInv,
        packResult,
        localIdentities,
        null,
        issues,
      );
    }

    // ── Phase 3: extract + identity comparison ──
    let extractDir;
    try {
      extractDir = resolvePackageDir(pkgName, scratchBase);
    } catch (err) {
      issues.push(
        error(
          'invalid_package_name',
          err instanceof Error ? err.message : String(err),
        ),
      );
      return buildReceipt(
        pkgName,
        pkgVersion,
        fileInv,
        packResult,
        localIdentities,
        null,
        issues,
      );
    }
    try {
      extractTarball(tgzPath, extractDir);
    } catch (err) {
      issues.push(error('extract_failed', /** @type {Error} */ (err).message));
      return buildReceipt(
        pkgName,
        pkgVersion,
        fileInv,
        packResult,
        localIdentities,
        null,
        issues,
      );
    }

    // Validate the extracted tree as an installed integration
    const packedResult = await validateInstalledIntegration(
      pkgName,
      scratchBase,
    );

    for (const issue of packedResult.issues) {
      issues.push({
        code: `packed_${issue.code}`,
        severity: issue.severity,
        message: `Packed: ${issue.message}`,
      });
    }

    if (!packedResult.integration) {
      return buildReceipt(
        pkgName,
        pkgVersion,
        fileInv,
        packResult,
        localIdentities,
        null,
        issues,
      );
    }

    // Collect packed identities and compare
    const {identities: packedIdentities, errors: discoveryErrors} =
      await collectIdentities(packedResult.integration);

    for (const de of discoveryErrors) {
      issues.push(
        error('packed_discovery_failed', `${de.kind}: ${de.message}`),
      );
    }

    issues.push(...compareIdentities(localIdentities, packedIdentities));
    issues.push(
      ...(await validatePackedComponentExports(
        packedResult.integration,
        scratchBase,
      )),
      ...(await validatePackedTemplateExports(
        packedResult.integration,
        scratchBase,
      )),
    );

    return buildReceipt(
      pkgName,
      pkgVersion,
      fileInv,
      packResult,
      localIdentities,
      packedIdentities,
      issues,
    );
  } finally {
    removeTreeBestEffort(tgzTmpDir, 'temporary tarball directory', issues);
    removeTreeBestEffort(scratchBase, 'scratch consumer', issues);
  }
}

/**
 * Assemble the receipt.
 * @param {string} name
 * @param {string|null} version
 * @param {import('../../foundation/integrations/contribution-inventory.mjs').FileInventory} fileInv
 * @param {ReturnType<typeof runNpmPack>|null} packResult
 * @param {import('../../foundation/integrations/contribution-inventory.mjs').ContributionIdentities|null} localIdentities
 * @param {import('../../foundation/integrations/contribution-inventory.mjs').ContributionIdentities|null} packedIdentities
 * @param {Issue[]} issues
 * @returns {import('./pack-check.type.mjs').IntegrationPackCheckResponse}
 */
function buildReceipt(
  name,
  version,
  fileInv,
  packResult,
  localIdentities,
  packedIdentities,
  issues,
) {
  const packedPaths = packResult?.packedPaths ?? new Set();

  /** @type {import('./pack-check.type.mjs').PackCheckInventoryRoot[]} */
  const roots = fileInv.roots.map(root => {
    const missing = root.files.filter(f => !packedPaths.has(f));
    return {
      kind: root.kind,
      path: root.path,
      expectedFiles: root.files.length,
      missingFiles: missing,
      complete: missing.length === 0,
    };
  });

  const expectedFiles = fileInv.allFiles.length;
  const packedFiles = fileInv.allFiles.filter(f => packedPaths.has(f)).length;

  return {
    type: 'integration.pack-check',
    data: {
      name,
      version,
      packable: !issues.some(i => i.severity === 'error'),
      tarball: packResult
        ? {
            filename: packResult.filename,
            fileCount: packResult.fileCount,
            size: packResult.size,
            unpackedSize: packResult.unpackedSize,
          }
        : null,
      inventory: {
        manifest: fileInv.manifest,
        roots,
        expectedFiles,
        packedFiles,
      },
      contributions: {local: localIdentities, packed: packedIdentities},
      issues,
    },
  };
}
