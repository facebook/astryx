// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared writer for adding one contribution root to an existing Astryx
 * integration manifest without replacing any author-owned field.
 *
 * The function is intentionally independent of every contribution kind. Theme,
 * component, template, doc, and codemod writers all need the same operation and
 * must not grow separate source-rewrite implementations.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {randomUUID} from 'node:crypto';
import {publishNewFile} from '../fs/publish-file.mjs';
import jscodeshift from 'jscodeshift';
import {assertWithin} from '../fs/path-safety.mjs';
import {findManifestPaths, loadManifestObject} from './integrations.mjs';

export class IntegrationRootConflictError extends Error {
  /** @param {string} kind @param {string} current @param {string} requested */
  constructor(kind, current, requested) {
    super(
      `Integration manifest already declares ${kind}: "${current}"; refusing to replace it with "${requested}".`,
    );
    this.name = 'IntegrationRootConflictError';
    this.code = 'INTEGRATION_ROOT_CONFLICT';
    this.kind = kind;
    this.current = current;
    this.requested = requested;
  }
}

/**
 * Find the one local integration manifest, or null when none exists.
 * @param {string} packageDir
 * @returns {string|null}
 */
export function findLocalIntegrationManifestOrNull(packageDir) {
  const manifests = findManifestPaths(packageDir);
  if (manifests.length === 0) return null;
  if (manifests.length > 1) {
    throw new Error(
      `Multiple integration manifests found (${manifests
        .map(file => path.basename(file))
        .join(', ')}). Keep exactly one.`,
    );
  }
  return manifests[0];
}

/**
 * Find the one local integration manifest.
 * @param {string} packageDir
 * @returns {string}
 */
export function findLocalIntegrationManifest(packageDir) {
  const manifest = findLocalIntegrationManifestOrNull(packageDir);
  if (manifest == null) {
    throw new Error('No astryx.integration.{ts,mjs,js} file found.');
  }
  return manifest;
}

/** @param {any} node */
export function unwrapManifestExpression(node) {
  let current = node;
  while (
    current &&
    [
      'TSAsExpression',
      'TSSatisfiesExpression',
      'TypeCastExpression',
      'ParenthesizedExpression',
    ].includes(current.type)
  ) {
    current = current.expression;
  }
  return current;
}

/** @param {any} property @param {string} name */
function propertyNamed(property, name) {
  if (
    !property ||
    !['ObjectProperty', 'Property'].includes(property.type) ||
    property.computed
  ) {
    return false;
  }
  return (
    (property.key?.type === 'Identifier' && property.key.name === name) ||
    (['Literal', 'StringLiteral'].includes(property.key?.type) &&
      property.key.value === name)
  );
}

/**
 * Find the object literal an integration manifest exports.
 * @param {ReturnType<typeof jscodeshift.withParser>} j
 * @param {ReturnType<ReturnType<typeof jscodeshift.withParser>>} ast
 * @returns {any|null}
 */
export function findManifestObject(j, ast) {
  const exports = ast.find(j.ExportDefaultDeclaration);
  if (exports.size() !== 1) return null;
  let declaration = unwrapManifestExpression(exports.nodes()[0].declaration);

  if (j.Identifier.check(declaration)) {
    const bindings = ast.find(j.VariableDeclarator, {
      id: {type: 'Identifier', name: declaration.name},
    });
    if (bindings.size() !== 1) return null;
    declaration = unwrapManifestExpression(bindings.nodes()[0].init);
  }

  if (j.CallExpression.check(declaration) && declaration.arguments.length > 0) {
    declaration = unwrapManifestExpression(declaration.arguments[0]);
  }

  return j.ObjectExpression.check(declaration) ? declaration : null;
}

/** @param {string} file */
function removeTemporary(file) {
  try {
    fs.rmSync(file, {force: true});
  } catch {
    // Best effort. The transaction error remains the actionable failure.
  }
}

/**
 * Atomically replace one text file while preserving its mode.
 * @param {string} file
 * @param {string} contents
 * @param {string} [expectedContents] bytes read during preflight
 */
function replaceFile(file, contents, expectedContents) {
  const expected =
    expectedContents === undefined ? null : Buffer.from(expectedContents);
  const assertUnchanged = () => {
    if (expected != null && !fs.readFileSync(file).equals(expected)) {
      throw new Error(`File changed while writing: ${file}`);
    }
  };
  const temporary = path.join(
    path.dirname(file),
    `.${path.basename(file)}.tmp-${randomUUID()}`,
  );
  let descriptor;
  try {
    assertUnchanged();
    const mode = fs.statSync(file).mode;
    descriptor = fs.openSync(temporary, 'wx', mode);
    fs.writeFileSync(descriptor, contents, 'utf-8');
    fs.closeSync(descriptor);
    descriptor = undefined;
    assertUnchanged();
    fs.renameSync(temporary, file);
  } catch (error) {
    if (descriptor != null) fs.closeSync(descriptor);
    removeTemporary(temporary);
    throw error;
  }
}

/**
 * Atomically create one text file without replacing a racing writer.
 * @param {string} file
 * @param {string} contents
 */
function createFile(file, contents) {
  const temporary = path.join(
    path.dirname(file),
    `.${path.basename(file)}.tmp-${randomUUID()}`,
  );
  let descriptor;
  let linked = false;
  try {
    descriptor = fs.openSync(temporary, 'wx', 0o666);
    fs.writeFileSync(descriptor, contents, 'utf-8');
    fs.closeSync(descriptor);
    descriptor = undefined;
    publishNewFile(temporary, file);
    linked = true;
    removeTemporary(temporary);
  } catch (error) {
    if (descriptor != null) fs.closeSync(descriptor);
    if (linked) {
      try {
        removeFileIfUnchanged(file, contents);
      } catch {
        // Preserve a concurrent edit rather than forcing cleanup.
      }
    }
    removeTemporary(temporary);
    throw error;
  }
}

/** @param {string} file @param {string} expectedContents */
function removeFileIfUnchanged(file, expectedContents) {
  if (fs.lstatSync(file).isSymbolicLink()) {
    throw new Error(`File changed before rollback: ${file}`);
  }
  if (!fs.readFileSync(file).equals(Buffer.from(expectedContents))) {
    throw new Error(`File changed before rollback: ${file}`);
  }
  fs.rmSync(file);
}

/**
 * Add a contribution root to an integration manifest, creating the manifest
 * when requested and none exists.
 *
 * If the key already has `rootPath`, this is an idempotent no-op. A different
 * author-owned value is a typed refusal. `dryRun` performs every read and
 * source-shape check but writes nothing. `createIfMissing` creates a minimal
 * `.mjs` manifest as part of the same verified operation.
 *
 * @param {string} packageDir
 * @param {string} kind
 * @param {string} rootPath
 * @param {{dryRun?: boolean, verify?: () => void | Promise<void>, createIfMissing?: boolean}} [options]
 * @returns {Promise<{path: string, created: boolean}>}
 */
export async function patchIntegrationRoot(
  packageDir,
  kind,
  rootPath,
  {dryRun = false, verify, createIfMissing = false} = {},
) {
  if (!/^[A-Za-z_$][\w$]*$/u.test(kind)) {
    throw new Error(`Invalid integration root key "${kind}".`);
  }
  assertWithin(rootPath, packageDir, {label: `${kind} root`});

  const existingManifest = findLocalIntegrationManifestOrNull(packageDir);
  const manifestExists = existingManifest != null;
  if (!manifestExists && !createIfMissing) {
    throw new Error('No astryx.integration.{ts,mjs,js} file found.');
  }
  const manifestFile =
    existingManifest ?? path.join(packageDir, 'astryx.integration.mjs');
  let writableManifestFile = manifestFile;
  if (manifestExists && fs.lstatSync(manifestFile).isSymbolicLink()) {
    writableManifestFile = assertWithin(
      fs.realpathSync(manifestFile),
      packageDir,
      {
        allowAbsolute: true,
        label: 'integration manifest symlink target',
      },
    );
  }

  /** @type {Record<string, unknown>} */
  let manifest = {};
  if (manifestExists) {
    manifest = /** @type {Record<string, unknown>} */ (
      await loadManifestObject(
        manifestFile,
        `Integration manifest ${path.basename(manifestFile)}`,
        {fresh: true},
      )
    );
  }
  const current = manifest[kind];
  if (current !== undefined) {
    if (current !== rootPath) {
      throw new IntegrationRootConflictError(kind, String(current), rootPath);
    }
    if (!dryRun && verify) await verify();
    return {path: rootPath, created: false};
  }

  const source = manifestExists
    ? fs.readFileSync(manifestFile, 'utf-8')
    : 'export default {};\n';
  const j = jscodeshift.withParser('tsx');
  let ast;
  try {
    ast = j(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not parse ${path.basename(manifestFile)}: ${message}`,
      {cause: error},
    );
  }
  const object = findManifestObject(j, ast);
  if (!object) {
    throw new Error(
      `Could not update ${path.basename(manifestFile)} safely: its default export is not a static object literal.`,
    );
  }

  if (
    object.properties.some((/** @type {any} */ property) =>
      propertyNamed(property, kind),
    )
  ) {
    throw new Error(
      `${path.basename(manifestFile)} changed while preparing ${kind}. Run the command again.`,
    );
  }

  object.properties.push(
    j.objectProperty(j.identifier(kind), j.stringLiteral(rootPath)),
  );
  let next = ast.toSource({quote: 'single', reuseWhitespace: true});
  if (source.endsWith('\n') && !next.endsWith('\n')) next += '\n';
  if (!dryRun) {
    if (manifestExists) replaceFile(writableManifestFile, next, source);
    else createFile(manifestFile, next);
    try {
      if (verify) await verify();
    } catch (error) {
      if (manifestExists) replaceFile(writableManifestFile, source, next);
      else removeFileIfUnchanged(manifestFile, next);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Post-write verification failed: ${message}`, {
        cause: error,
      });
    }
  }
  return {path: rootPath, created: true};
}
