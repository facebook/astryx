// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `integrationAdd(kind, name, options)` — generate one valid
 * contribution into an integration package.
 *
 * Dispatches component, doc, template, codemod, and agent-doc. Theme
 * delegates to the dedicated same-stem descriptor writer. Every root-based kind shares: first add creates the manifest; one shared
 * writer; never creates `files`/`exports`; atomic staged writes; no clobber;
 * dry-run receipt predicts real run; post-write verify through the real
 * discovery/parser seam.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import jscodeshift from 'jscodeshift';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {
  assertWithin,
  PathSafetyError,
  sanitizeName,
} from '../../foundation/fs/path-safety.mjs';
import {
  findManifestObject,
  unwrapManifestExpression,
  patchIntegrationRoot,
  findLocalIntegrationManifestOrNull,
  IntegrationRootConflictError,
} from '../../foundation/integrations/manifest-writer.mjs';
import {
  loadManifestObject,
  loadManifest,
} from '../../foundation/integrations/integrations.mjs';
import {isValidSemver} from '../../foundation/env/semver.mjs';
import {assertContributionVisible} from '../../foundation/integrations/contribution-inventory.mjs';
import {
  docsTreeCliProblem,
  withDocsTreeCli,
} from '../../foundation/integrations/cli-requirement.mjs';
import {discoverIntegrationDocs} from '../../foundation/discovery/docs-discovery.mjs';
import {findIntegrationComponentDoc} from '../../foundation/discovery/component-discovery.mjs';
import {parseAgentDocsField} from '../../authoring/integration/schema.mjs';
import {integrationAddTheme} from './add-theme.mjs';
import {refuseOutsideProject} from '../icon/_adapter.mjs';
import {
  IconSetAuthoringError,
  checkNewDefinition,
  definitionFile,
  findLocalIconSet,
  generatedModulePath,
  generatedModuleText,
  generatedTypesPath,
  THEME_MAP_NAME,
  iconSetDataText,
  libraryIcons,
  resolveIconSource,
  writeDefinitionFile,
  writeGeneratedIcons,
  writeIconSetData,
} from '../../foundation/discovery/icon-set-writer.mjs';
import {astryxIconDefinitions} from '../../foundation/discovery/icon-definition-discovery.mjs';
import {
  findPackageDir,
  projectPath,
  packageJsonUpdate,
  packageJsonFilesUpdate,
  applyWrites,
} from './add-helpers.mjs';

// ── Name grammars ───────────────────────────────────────────────────

const COMPONENT_NAME_RE = /^[A-Z][A-Za-z0-9]*$/;
const KEBAB_NAME_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const TOPIC_NAME_RE = /^[\w-]+$/;

// ── Default roots (used when the manifest declares nothing) ─────────

const DEFAULT_ROOTS = {
  components: './components',
  templates: './templates',
  docs: './docs',
  codemods: './codemods',
  iconSets: './icon-sets',
};

/** Where an icon set's root is declared: an experimental manifest key. */
const ICON_SETS_ROOT_KEY = 'experimental.iconSets';

// ── Shared manifest / package plumbing ──────────────────────────────

/**
 * Read package identity + resolve the manifest path.
 * @param {string} cwd
 */
function resolvePackage(cwd) {
  const packageDir = findPackageDir(cwd);
  const packageFile = path.join(packageDir, 'package.json');
  /** @type {any} */
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new AstryxError(
      `Cannot read package.json: ${message}`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const owner = typeof pkg.name === 'string' ? pkg.name : '(local integration)';
  const existingManifest = findLocalIntegrationManifestOrNull(packageDir);
  // The nearest package.json above the cwd may belong to another package (an
  // app that contains the folder). Only a package that is already an
  // integration is found from a subfolder; the first add runs in the package.
  const here = path.resolve(cwd ?? process.cwd());
  if (existingManifest == null && path.resolve(packageDir) !== here) {
    throw new AstryxError(
      `${here} has no package.json. The nearest is ${packageFile} (${owner}), which is not an Astryx integration yet. Run this in your integration package's own directory, next to its package.json.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const manifestFile =
    existingManifest ?? path.join(packageDir, 'astryx.integration.mjs');
  return {
    packageDir,
    packageFile,
    pkg,
    owner,
    manifestFile,
    manifestExists: existingManifest != null,
  };
}

/**
 * Load the current manifest's parsed object (or an empty object when no
 * manifest exists yet).
 * @param {string} manifestFile
 * @param {boolean} manifestExists
 * @returns {Promise<import('../../authoring/integration/type').AstryxIntegration>}
 */
async function loadCurrentManifest(manifestFile, manifestExists) {
  if (!manifestExists) return {};
  return loadManifestObject(
    manifestFile,
    `Integration manifest ${path.basename(manifestFile)}`,
    {fresh: true},
  );
}

/**
 * Build and return the common receipt shape.
 * @template {import('./integration-authoring.type.mjs').IntegrationAddData['kind'] | import('../icon/icon.type.mjs').IconNewData['kind']} K
 * @param {K} kind
 * @param {string} name
 * @param {{path: string, created: boolean}|null} root
 * @param {string} manifestPath
 * @param {string[]} files
 * @param {boolean} dryRun
 * @returns {{type: 'integration.add', data: Omit<import('./integration-authoring.type.mjs').IntegrationAddData, 'kind'> & {kind: K, icons?: number, notes?: string[]}}}
 */
function receipt(kind, name, root, manifestPath, files, dryRun) {
  return {
    type: 'integration.add',
    data: {
      kind,
      name,
      root,
      manifest: manifestPath,
      files,
      written: !dryRun,
      dryRun,
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────

/** @param {string} slug */
function kebabToPascal(slug) {
  return slug.replace(/(^|-)([a-z0-9])/gu, (_, _sep, ch) => ch.toUpperCase());
}

/** @param {string} slug */
function kebabToTitle(slug) {
  const words = slug.split(/[-_]+/u).filter(Boolean);
  if (words.length === 0) return slug;
  return words.map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}

// ── AST helper (for agent-doc manifest patching) ────────────────────

/** @param {any} prop @param {string} name */
function propNamed(prop, name) {
  const key = prop?.key;
  if (!key) return false;
  return (
    (key.type === 'Identifier' && key.name === name) ||
    (key.type === 'StringLiteral' && key.value === name)
  );
}

// ── Contribution: COMPONENT ─────────────────────────────────────────

/**
 * @param {string} name PascalCase component name
 * @param {{cwd?: string, dryRun?: boolean}} options
 * @returns {Promise<import('./integration-authoring.type.mjs').IntegrationAddResponse>}
 */
async function addComponent(name, options) {
  const {cwd = process.cwd(), dryRun = false} = options;
  if (!COMPONENT_NAME_RE.test(name)) {
    throw new AstryxError(
      `Invalid component name "${name}": use PascalCase starting with an uppercase letter (e.g. MyWidget).`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  try {
    sanitizeName(name, {label: 'component name'});
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_INVALID_ARGUMENT,
      );
    }
    throw error;
  }

  const {packageDir, packageFile, owner, manifestFile, manifestExists} =
    resolvePackage(cwd);
  const manifest = await loadCurrentManifest(manifestFile, manifestExists);
  const rootPath = manifest.components ?? DEFAULT_ROOTS.components;
  /** @type {string} */
  let root;
  try {
    root = assertWithin(rootPath, packageDir, {label: 'components root'});
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw error;
  }

  // Pre-flight root patch
  try {
    await patchIntegrationRoot(packageDir, 'components', rootPath, {
      dryRun: true,
      createIfMissing: true,
    });
  } catch (error) {
    if (error instanceof IntegrationRootConflictError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_INTEGRATION_ROOT_CONFLICT,
      );
    }
    throw error;
  }

  // Target files
  const docFile = assertWithin(`${name}.doc.mjs`, root, {
    label: 'component doc',
  });
  const sourceFile = assertWithin(`${name}.tsx`, root, {
    label: 'component source',
  });
  if (fs.existsSync(docFile)) {
    throw new AstryxError(
      `Refusing to overwrite existing file ${projectPath(path.relative(packageDir, docFile))}.`,
      undefined,
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }
  if (fs.existsSync(sourceFile)) {
    throw new AstryxError(
      `Refusing to overwrite existing file ${projectPath(path.relative(packageDir, sourceFile))}.`,
      undefined,
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }
  // A second doc under a name discovery already records, by a doc's file name
  // anywhere under the root or by a name a doc documents, would shadow one of
  // the two.
  const existingDoc = findIntegrationComponentDoc(
    {name: owner, components: root, __packageDir: packageDir},
    name,
  );
  if (existingDoc != null) {
    throw new AstryxError(
      `Refusing to add component "${name}": ${projectPath(path.relative(packageDir, existingDoc))} already defines it.`,
      undefined,
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }

  const sourcePath = projectPath(path.relative(packageDir, sourceFile));
  const extensionlessPath = sourcePath.replace(/\.tsx?$/u, '');
  const importSpecifier = `${owner}/${extensionlessPath}`;
  const docContents = `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */\nexport default {\n  type: 'component',\n  name: '${name}',\n  displayName: '${name}',\n  import: ${JSON.stringify(importSpecifier)},\n  usage: {description: '${name} component.'},\n  props: [],\n};\n`;
  const sourceContents = `export function ${name}() {\n  return <div>${name}</div>;\n}\n`;

  /** @type {import('./add-helpers.mjs').WritePlan[]} */
  const plans = [
    {path: docFile, contents: docContents, createOnly: true},
    {path: sourceFile, contents: sourceContents, createOnly: true},
  ];
  const pkgUpdate = packageJsonUpdate(
    packageFile,
    rootPath,
    path.basename(manifestFile),
    [{subpath: extensionlessPath, target: sourcePath}],
  );
  if (pkgUpdate != null) {
    plans.push({
      path: packageFile,
      contents: pkgUpdate.contents,
      createOnly: false,
      expectedOriginal: pkgUpdate.expectedOriginal,
    });
  }

  const writtenFiles = plans.map(p =>
    projectPath(path.relative(packageDir, p.path)),
  );
  const manifestPath = projectPath(path.relative(packageDir, manifestFile));

  /** @type {{path: string, created: boolean}} */
  let rootReceipt = {path: rootPath, created: !manifest.components};
  if (!dryRun) {
    let rollback = () => {};
    try {
      rollback = applyWrites(plans);
      rootReceipt = await patchIntegrationRoot(
        packageDir,
        'components',
        rootPath,
        {
          createIfMissing: true,
          verify: async () => {
            const m = await loadManifestObject(manifestFile, 'verify', {
              fresh: true,
            });
            if (!m.components)
              throw new Error('components root not visible after writing.');
            const compsRoot = assertWithin(m.components, packageDir, {
              label: 'components root',
            });
            await assertContributionVisible(
              {name: owner, components: compsRoot},
              'component',
              name,
            );
          },
        },
      );
    } catch (error) {
      rollback();
      if (error instanceof IntegrationRootConflictError) {
        throw new AstryxError(
          error.message,
          undefined,
          ERROR_CODES.ERR_INTEGRATION_ROOT_CONFLICT,
        );
      }
      if (error instanceof AstryxError) throw error;
      throw new AstryxError(
        `Failed to write component contribution: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        ERROR_CODES.ERR_WRITE_FAILED,
      );
    }
  }
  if (rootReceipt.created && !writtenFiles.includes(manifestPath)) {
    writtenFiles.push(manifestPath);
  }
  return receipt(
    'component',
    name,
    rootReceipt,
    manifestPath,
    writtenFiles,
    dryRun,
  );
}

// ── Contribution: DOC TOPIC ─────────────────────────────────────────

/**
 * @param {string} name  topic name (must match [\w-]+)
 * @param {{cwd?: string, dryRun?: boolean, replaces?: string, extends?: string, parent?: string}} options
 * @returns {Promise<import('./integration-authoring.type.mjs').IntegrationAddResponse>}
 */
async function addDoc(name, options) {
  const {cwd = process.cwd(), dryRun = false} = options;
  if (!TOPIC_NAME_RE.test(name)) {
    throw new AstryxError(
      `Invalid topic name "${name}": use letters, digits, _ and - only.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  if (options.replaces != null && options.extends != null) {
    throw new AstryxError(
      'A topic either replaces another or extends it, not both.',
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  if (
    options.parent != null &&
    (options.replaces != null || options.extends != null)
  ) {
    throw new AstryxError(
      'A guide placed in a namespace has its own route: it cannot also replace or extend a topic.',
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  if (
    options.parent != null &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(options.parent)
  ) {
    throw new AstryxError(
      '--parent must name a namespace in lowercase letters and digits joined by single hyphens, such as "acme".',
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  for (const [option, value] of [
    ['--replaces', options.replaces],
    ['--extends', options.extends],
  ]) {
    if (value != null && !TOPIC_NAME_RE.test(value)) {
      throw new AstryxError(
        `${option} must name a topic using letters, digits, _ and - only.`,
        undefined,
        ERROR_CODES.ERR_INVALID_ARGUMENT,
      );
    }
  }

  const {packageDir, packageFile, owner, manifestFile, manifestExists} =
    resolvePackage(cwd);
  const manifest = await loadCurrentManifest(manifestFile, manifestExists);
  const rootPath = manifest.docs ?? DEFAULT_ROOTS.docs;
  /** @type {string} */
  let root;
  try {
    root = assertWithin(rootPath, packageDir, {label: 'docs root'});
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw error;
  }

  try {
    await patchIntegrationRoot(packageDir, 'docs', rootPath, {
      dryRun: true,
      createIfMissing: true,
    });
  } catch (error) {
    if (error instanceof IntegrationRootConflictError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_INTEGRATION_ROOT_CONFLICT,
      );
    }
    throw error;
  }

  const docFile = assertWithin(`${name}.doc.mjs`, root, {
    label: 'doc topic file',
  });
  if (fs.existsSync(docFile)) {
    throw new AstryxError(
      `Refusing to overwrite existing file ${projectPath(path.relative(packageDir, docFile))}.`,
      undefined,
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }

  const title = kebabToTitle(name);
  // --parent names a namespace of this package by its name, wherever its file
  // is. An existing one is used as it is: its `guides` slot, or else its only
  // slot that takes a guide. Otherwise the namespace doc is written, unless a
  // file of that name is already something else (spec:AST-046 FR11).
  const namespaceFile =
    options.parent == null
      ? null
      : assertWithin(`${options.parent}.doc.mjs`, root, {
          label: 'namespace doc file',
        });
  let parentSlot = 'guides';
  let writeNamespace = false;
  if (options.parent != null && namespaceFile != null) {
    const {namespaces} = await discoverIntegrationDocs({
      name: owner,
      docs: root,
    });
    const existing = namespaces.find(ns => ns.doc.name === options.parent);
    if (existing != null) {
      const takesGuides = Object.entries(existing.doc.slots ?? {})
        .filter(([, slot]) => slot?.accepts?.kinds?.includes('generic'))
        .map(([slotName]) => slotName);
      const slot = takesGuides.includes('guides')
        ? 'guides'
        : takesGuides.length === 1
          ? takesGuides[0]
          : null;
      if (slot == null) {
        throw new AstryxError(
          takesGuides.length === 0
            ? `Namespace "${options.parent}" (${existing.source}) has no slot that takes a guide. Add one, such as guides: {title: 'Guides', accepts: {kinds: ['generic']}}.`
            : `Namespace "${options.parent}" (${existing.source}) has more than one slot that takes a guide (${takesGuides.join(', ')}). Write the guide yourself, and name its slot in its placement.`,
          undefined,
          ERROR_CODES.ERR_INVALID_ARGUMENT,
        );
      }
      parentSlot = slot;
    } else if (fs.existsSync(namespaceFile)) {
      throw new AstryxError(
        `${projectPath(path.relative(packageDir, namespaceFile))} exists but does not load as the namespace "${options.parent}". Fix or rename that file, or pass another --parent.`,
        undefined,
        ERROR_CODES.ERR_FILE_EXISTS,
      );
    } else {
      writeNamespace = true;
    }
  }
  const relationship = options.replaces
    ? `\n  replaces: '${options.replaces}',`
    : options.extends
      ? `\n  extends: '${options.extends}',`
      : options.parent
        ? `\n  placement: {parent: 'namespace:${options.parent}', slot: '${parentSlot}'},`
        : '';
  const namespaceTitle =
    options.parent == null ? '' : kebabToTitle(options.parent);
  const namespaceContents = `/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */\nexport default {\n  type: 'namespace',\n  name: '${options.parent}',\n  title: '${namespaceTitle}',\n  summary: 'Guides for ${namespaceTitle}.',\n  slots: {\n    guides: {title: 'Guides', accepts: {kinds: ['generic']}},\n  },\n};\n`;
  const docContents = `/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */\nexport default {\n  type: 'generic',\n  name: '${name}',\n  title: '${title}',\n  description: '${title} documentation.',${relationship}\n  sections: [\n    {\n      title: 'Overview',\n      content: [\n        { type: 'prose', text: '${title} documentation.' },\n      ],\n    },\n  ],\n};\n`;

  /** @type {import('./add-helpers.mjs').WritePlan[]} */
  const plans = [{path: docFile, contents: docContents, createOnly: true}];
  if (namespaceFile != null && writeNamespace) {
    plans.push({
      path: namespaceFile,
      contents: namespaceContents,
      createOnly: true,
    });
  }
  let pkgUpdate = packageJsonUpdate(
    packageFile,
    rootPath,
    path.basename(manifestFile),
  );
  // A namespace doc needs a CLI that reads it: an older one hides every doc
  // topic the package ships. Declare that CLI as a peer, so an older one fails
  // at install instead (spec:AST-046 FR11).
  if (options.parent != null) {
    const expectedOriginal =
      pkgUpdate?.expectedOriginal ?? fs.readFileSync(packageFile);
    const text = pkgUpdate?.contents ?? expectedOriginal.toString('utf-8');
    const current = JSON.parse(text);
    if (docsTreeCliProblem(current) != null) {
      pkgUpdate = {
        contents:
          JSON.stringify(withDocsTreeCli(current), null, 2) +
          (text.endsWith('\n') ? '\n' : ''),
        expectedOriginal,
      };
    }
  }
  if (pkgUpdate != null) {
    plans.push({
      path: packageFile,
      contents: pkgUpdate.contents,
      createOnly: false,
      expectedOriginal: pkgUpdate.expectedOriginal,
    });
  }

  const writtenFiles = plans.map(p =>
    projectPath(path.relative(packageDir, p.path)),
  );
  const manifestPath = projectPath(path.relative(packageDir, manifestFile));

  let rootReceipt = {path: rootPath, created: !manifest.docs};
  if (!dryRun) {
    let rollback = () => {};
    try {
      rollback = applyWrites(plans);
      rootReceipt = await patchIntegrationRoot(packageDir, 'docs', rootPath, {
        createIfMissing: true,
        verify: async () => {
          const m = await loadManifestObject(manifestFile, 'verify', {
            fresh: true,
          });
          if (!m.docs) throw new Error('docs root not visible after writing.');
          const docsRoot = assertWithin(m.docs, packageDir, {
            label: 'docs root',
          });
          await assertContributionVisible(
            {name: owner, docs: docsRoot},
            'doc',
            name,
          );
        },
      });
    } catch (error) {
      rollback();
      if (error instanceof IntegrationRootConflictError) {
        throw new AstryxError(
          error.message,
          undefined,
          ERROR_CODES.ERR_INTEGRATION_ROOT_CONFLICT,
        );
      }
      if (error instanceof AstryxError) throw error;
      throw new AstryxError(
        `Failed to write doc contribution: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        ERROR_CODES.ERR_WRITE_FAILED,
      );
    }
  }
  if (rootReceipt.created && !writtenFiles.includes(manifestPath)) {
    writtenFiles.push(manifestPath);
  }
  return receipt('doc', name, rootReceipt, manifestPath, writtenFiles, dryRun);
}

// ── Contribution: TEMPLATE ──────────────────────────────────────────

/**
 * @param {string} name  template id (kebab-case)
 * @param {{cwd?: string, dryRun?: boolean, templateType?: 'page'|'block'}} options
 * @returns {Promise<import('./integration-authoring.type.mjs').IntegrationAddResponse>}
 */
async function addTemplate(name, options) {
  const {cwd = process.cwd(), dryRun = false, templateType = 'page'} = options;
  if (!KEBAB_NAME_RE.test(name)) {
    throw new AstryxError(
      `Invalid template name "${name}": use lowercase kebab-case starting with a letter.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  if (templateType !== 'page' && templateType !== 'block') {
    throw new AstryxError(
      `Invalid template type "${templateType}": must be "page" or "block".`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  const {packageDir, packageFile, owner, manifestFile, manifestExists} =
    resolvePackage(cwd);
  const manifest = await loadCurrentManifest(manifestFile, manifestExists);
  const rootPath = manifest.templates ?? DEFAULT_ROOTS.templates;
  /** @type {string} */
  let root;
  try {
    root = assertWithin(rootPath, packageDir, {label: 'templates root'});
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw error;
  }

  try {
    await patchIntegrationRoot(packageDir, 'templates', rootPath, {
      dryRun: true,
      createIfMissing: true,
    });
  } catch (error) {
    if (error instanceof IntegrationRootConflictError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_INTEGRATION_ROOT_CONFLICT,
      );
    }
    throw error;
  }

  const specFile = assertWithin(`${name}.doc.mjs`, root, {
    label: 'template descriptor',
  });
  const sourceFile = assertWithin(`${name}.tsx`, root, {
    label: 'template source',
  });
  if (fs.existsSync(specFile)) {
    throw new AstryxError(
      `Refusing to overwrite existing file ${projectPath(path.relative(packageDir, specFile))}.`,
      undefined,
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }
  if (fs.existsSync(sourceFile)) {
    throw new AstryxError(
      `Refusing to overwrite existing file ${projectPath(path.relative(packageDir, sourceFile))}.`,
      undefined,
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }

  const pascalName = kebabToPascal(name);
  const sourcePath = projectPath(path.relative(packageDir, sourceFile));
  const extensionlessPath = sourcePath.replace(/\.tsx?$/u, '');
  const blockFields = templateType === 'block' ? '\n  aspectRatio: 1,' : '';
  const specContents = `/** @type {import('@astryxdesign/cli/authoring').IntegrationTemplateDoc} */\nexport default {\n  type: '${templateType}',\n  name: '${name}',\n  displayName: '${kebabToTitle(name)}',\n  description: '${kebabToTitle(name)} template.',${blockFields}\n};\n`;
  const sourceContents = `export default function ${pascalName}() {\n  return <div>${kebabToTitle(name)}</div>;\n}\n`;

  /** @type {import('./add-helpers.mjs').WritePlan[]} */
  const plans = [
    {path: specFile, contents: specContents, createOnly: true},
    {path: sourceFile, contents: sourceContents, createOnly: true},
  ];
  const pkgUpdate = packageJsonUpdate(
    packageFile,
    rootPath,
    path.basename(manifestFile),
    [{subpath: extensionlessPath, target: sourcePath}],
  );
  if (pkgUpdate != null) {
    plans.push({
      path: packageFile,
      contents: pkgUpdate.contents,
      createOnly: false,
      expectedOriginal: pkgUpdate.expectedOriginal,
    });
  }

  const writtenFiles = plans.map(p =>
    projectPath(path.relative(packageDir, p.path)),
  );
  const manifestPath = projectPath(path.relative(packageDir, manifestFile));

  let rootReceipt = {path: rootPath, created: !manifest.templates};
  if (!dryRun) {
    let rollback = () => {};
    try {
      rollback = applyWrites(plans);
      rootReceipt = await patchIntegrationRoot(
        packageDir,
        'templates',
        rootPath,
        {
          createIfMissing: true,
          verify: async () => {
            const m = await loadManifestObject(manifestFile, 'verify', {
              fresh: true,
            });
            if (!m.templates)
              throw new Error('templates root not visible after writing.');
            const tplRoot = assertWithin(m.templates, packageDir, {
              label: 'templates root',
            });
            await assertContributionVisible(
              {name: owner, templates: tplRoot},
              'template',
              name,
            );
          },
        },
      );
    } catch (error) {
      rollback();
      if (error instanceof IntegrationRootConflictError) {
        throw new AstryxError(
          error.message,
          undefined,
          ERROR_CODES.ERR_INTEGRATION_ROOT_CONFLICT,
        );
      }
      if (error instanceof AstryxError) throw error;
      throw new AstryxError(
        `Failed to write template contribution: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        ERROR_CODES.ERR_WRITE_FAILED,
      );
    }
  }
  if (rootReceipt.created && !writtenFiles.includes(manifestPath)) {
    writtenFiles.push(manifestPath);
  }
  return receipt(
    'template',
    name,
    rootReceipt,
    manifestPath,
    writtenFiles,
    dryRun,
  );
}

// ── Contribution: CODEMOD ───────────────────────────────────────────

/**
 * @param {string} name  codemod id (kebab-case)
 * @param {{cwd?: string, dryRun?: boolean, to?: string}} options
 * @returns {Promise<import('./integration-authoring.type.mjs').IntegrationAddResponse>}
 */
async function addCodemod(name, options) {
  const {cwd = process.cwd(), dryRun = false, to} = options;
  if (!to || !isValidSemver(to)) {
    throw new AstryxError(
      `--to is required and must be an exact semver version (e.g. 1.0.0). Received: "${to ?? ''}"`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  if (!KEBAB_NAME_RE.test(name)) {
    throw new AstryxError(
      `Invalid codemod id "${name}": use lowercase kebab-case starting with a letter.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  const {packageDir, packageFile, owner, manifestFile, manifestExists} =
    resolvePackage(cwd);
  const manifest = await loadCurrentManifest(manifestFile, manifestExists);
  const rootPath = manifest.codemods ?? DEFAULT_ROOTS.codemods;
  /** @type {string} */
  let root;
  try {
    root = assertWithin(rootPath, packageDir, {label: 'codemods root'});
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw error;
  }

  try {
    await patchIntegrationRoot(packageDir, 'codemods', rootPath, {
      dryRun: true,
      createIfMissing: true,
    });
  } catch (error) {
    if (error instanceof IntegrationRootConflictError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_INTEGRATION_ROOT_CONFLICT,
      );
    }
    throw error;
  }

  const versionDir = assertWithin(to, root, {label: 'codemod version dir'});
  const codemodFile = assertWithin(`${name}.mjs`, versionDir, {
    label: 'codemod file',
  });
  if (fs.existsSync(codemodFile)) {
    throw new AstryxError(
      `Refusing to overwrite existing file ${projectPath(path.relative(packageDir, codemodFile))}.`,
      undefined,
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }

  const title = kebabToTitle(name);
  const codemodContents = `export default {\n  type: 'code',\n  title: '${title}',\n  transform(file, api) {\n    // Replace this with your transform logic.\n    return file.source;\n  },\n};\n`;

  /** @type {import('./add-helpers.mjs').WritePlan[]} */
  const plans = [
    {path: codemodFile, contents: codemodContents, createOnly: true},
  ];
  const pkgUpdate = packageJsonUpdate(
    packageFile,
    rootPath,
    path.basename(manifestFile),
  );
  if (pkgUpdate != null) {
    plans.push({
      path: packageFile,
      contents: pkgUpdate.contents,
      createOnly: false,
      expectedOriginal: pkgUpdate.expectedOriginal,
    });
  }

  const writtenFiles = plans.map(p =>
    projectPath(path.relative(packageDir, p.path)),
  );
  const manifestPath = projectPath(path.relative(packageDir, manifestFile));

  let rootReceipt = {path: rootPath, created: !manifest.codemods};
  if (!dryRun) {
    let rollback = () => {};
    try {
      rollback = applyWrites(plans);
      rootReceipt = await patchIntegrationRoot(
        packageDir,
        'codemods',
        rootPath,
        {
          createIfMissing: true,
          verify: async () => {
            const m = await loadManifestObject(manifestFile, 'verify', {
              fresh: true,
            });
            if (!m.codemods)
              throw new Error('codemods root not visible after writing.');
            const codemodsRoot = assertWithin(m.codemods, packageDir, {
              label: 'codemods root',
            });
            await assertContributionVisible(
              {name: owner, codemods: codemodsRoot},
              'codemod',
              name,
              {version: to},
            );
          },
        },
      );
    } catch (error) {
      rollback();
      if (error instanceof IntegrationRootConflictError) {
        throw new AstryxError(
          error.message,
          undefined,
          ERROR_CODES.ERR_INTEGRATION_ROOT_CONFLICT,
        );
      }
      if (error instanceof AstryxError) throw error;
      throw new AstryxError(
        `Failed to write codemod contribution: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        ERROR_CODES.ERR_WRITE_FAILED,
      );
    }
  }
  if (rootReceipt.created && !writtenFiles.includes(manifestPath)) {
    writtenFiles.push(manifestPath);
  }
  return receipt(
    'codemod',
    name,
    rootReceipt,
    manifestPath,
    writtenFiles,
    dryRun,
  );
}

// ── Contribution: AGENT-DOC ─────────────────────────────────────────

/**
 * @param {string} line  the literal agent-doc line
 * @param {{cwd?: string, dryRun?: boolean}} options
 * @returns {Promise<import('./integration-authoring.type.mjs').IntegrationAddResponse>}
 */
async function addAgentDoc(line, options) {
  const {cwd = process.cwd(), dryRun = false} = options;

  // Validate against the real schema
  try {
    parseAgentDocsField({append: [line]}, 'agentDocs');
  } catch (error) {
    throw new AstryxError(
      error instanceof Error ? error.message : String(error),
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  const {packageDir, packageFile, manifestFile, manifestExists, owner} =
    resolvePackage(cwd);
  const manifestPath = projectPath(path.relative(packageDir, manifestFile));

  // Load current agentDocs.append. A bad existing value is author-owned data;
  // refuse it rather than "repairing" it by silently replacing the lines.
  /** @type {string[]} */
  let currentAppend = [];
  if (manifestExists) {
    try {
      const loaded = await loadManifest(
        manifestFile,
        `Integration manifest ${path.basename(manifestFile)}`,
        {fresh: true},
      );
      if (loaded.agentDocsError) throw new Error(loaded.agentDocsError);
      if (loaded.manifest.agentDocs?.append) {
        currentAppend = [...loaded.manifest.agentDocs.append];
      }
    } catch (error) {
      throw new AstryxError(
        `Cannot update agentDocs: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        ERROR_CODES.ERR_INVALID_ARGUMENT,
      );
    }
  }

  // Converge: if line is already present, return idempotent receipt
  if (currentAppend.includes(line)) {
    return {
      type: 'integration.add',
      data: {
        kind: 'agent-doc',
        name: line,
        root: null,
        manifest: manifestPath,
        files: [],
        written: false,
        dryRun,
      },
    };
  }

  // Compute and validate the new array
  const newAppend = [...currentAppend, line];
  try {
    parseAgentDocsField({append: newAppend}, 'agentDocs');
  } catch (error) {
    throw new AstryxError(
      `Cannot add agent-doc line: ${error instanceof Error ? error.message : String(error)}`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  // AST-patch the manifest
  const source = manifestExists
    ? fs.readFileSync(manifestFile, 'utf-8')
    : 'export default {};\n';
  const j = jscodeshift.withParser('tsx');
  /** @type {ReturnType<ReturnType<typeof jscodeshift.withParser>>} */
  let ast;
  try {
    ast = j(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new AstryxError(
      `Could not parse ${path.basename(manifestFile)}: ${message}`,
      undefined,
      ERROR_CODES.ERR_WRITE_FAILED,
    );
  }
  const object = findManifestObject(j, ast);
  if (!object) {
    throw new AstryxError(
      `Could not update ${path.basename(manifestFile)} safely: its default export is not a static object literal.`,
      undefined,
      ERROR_CODES.ERR_WRITE_FAILED,
    );
  }

  const agentDocsProperties = object.properties.filter(
    (/** @type {any} */ property) => propNamed(property, 'agentDocs'),
  );
  if (agentDocsProperties.length > 1) {
    throw new AstryxError(
      'Cannot update agentDocs safely: the manifest declares it more than once.',
      undefined,
      ERROR_CODES.ERR_WRITE_FAILED,
    );
  }

  if (agentDocsProperties.length === 1) {
    const agentDocsProperty = /** @type {any} */ (agentDocsProperties[0]);
    const agentDocsObject = unwrapManifestExpression(agentDocsProperty.value);
    if (!j.ObjectExpression.check(agentDocsObject)) {
      throw new AstryxError(
        'Cannot update agentDocs safely: it is not a static object literal.',
        undefined,
        ERROR_CODES.ERR_WRITE_FAILED,
      );
    }
    const appendProperties = agentDocsObject.properties.filter(
      (/** @type {any} */ property) => propNamed(property, 'append'),
    );
    if (appendProperties.length > 1) {
      throw new AstryxError(
        'Cannot update agentDocs safely: append is declared more than once.',
        undefined,
        ERROR_CODES.ERR_WRITE_FAILED,
      );
    }
    if (appendProperties.length === 1) {
      const appendProperty = /** @type {any} */ (appendProperties[0]);
      const appendArray = unwrapManifestExpression(appendProperty.value);
      if (!j.ArrayExpression.check(appendArray)) {
        throw new AstryxError(
          'Cannot update agentDocs safely: append is not a static array literal.',
          undefined,
          ERROR_CODES.ERR_WRITE_FAILED,
        );
      }
      appendArray.elements.push(j.stringLiteral(line));
    } else {
      agentDocsObject.properties.push(
        j.objectProperty(
          j.identifier('append'),
          j.arrayExpression([j.stringLiteral(line)]),
        ),
      );
    }
  } else {
    if (currentAppend.length > 0) {
      throw new AstryxError(
        'Cannot update agentDocs safely: it comes from a spread or computed property.',
        undefined,
        ERROR_CODES.ERR_WRITE_FAILED,
      );
    }
    object.properties.push(
      j.objectProperty(
        j.identifier('agentDocs'),
        j.objectExpression([
          j.objectProperty(
            j.identifier('append'),
            j.arrayExpression([j.stringLiteral(line)]),
          ),
        ]),
      ),
    );
  }

  let next = ast.toSource({quote: 'single', reuseWhitespace: true});
  if (source.endsWith('\n') && !next.endsWith('\n')) next += '\n';

  /** @type {import('./add-helpers.mjs').WritePlan[]} */
  const plans = [
    {
      path: manifestFile,
      contents: next,
      createOnly: !manifestExists,
      expectedOriginal: manifestExists ? Buffer.from(source) : undefined,
    },
  ];
  const packageUpdate = packageJsonFilesUpdate(packageFile, [manifestPath]);
  if (packageUpdate != null) {
    plans.push({
      path: packageFile,
      contents: packageUpdate.contents,
      createOnly: false,
      expectedOriginal: packageUpdate.expectedOriginal,
    });
  }
  const writtenFiles = plans.map(plan =>
    projectPath(path.relative(packageDir, plan.path)),
  );
  if (dryRun) {
    return receipt('agent-doc', line, null, manifestPath, writtenFiles, true);
  }

  const rollback = applyWrites(plans);

  // Verify through the real parser
  try {
    const verified = await loadManifest(manifestFile, 'verify', {fresh: true});
    await assertContributionVisible(
      {name: owner, agentDocs: verified.manifest.agentDocs},
      'agent-doc',
      line,
    );
    if (verified.agentDocsError) {
      throw new Error(verified.agentDocsError);
    }
  } catch (error) {
    rollback();
    throw new AstryxError(
      `Post-write verification failed: ${error instanceof Error ? error.message : String(error)}`,
      undefined,
      ERROR_CODES.ERR_WRITE_FAILED,
    );
  }

  return receipt('agent-doc', line, null, manifestPath, writtenFiles, false);
}

// ── Contribution: ICON SET ──────────────────────────────────────────

/**
 * A single-quoted JavaScript string literal for any text.
 * @param {string} value
 */
function quoteJs(value) {
  return `'${value
    .replace(/\\/gu, '\\\\')
    .replace(/'/gu, "\\'")
    .replace(/\n/gu, '\\n')
    .replace(/\r/gu, '\\r')}'`;
}

/**
 * Write one icon set (spec:AST-084 FR1–FR3): `<root>/<name>/<name>.doc.mjs`,
 * a typed IconSetDoc, and a starter `<name>.icons.json` whose `module` is the
 * package itself, with no icons and an empty `map`. The set is valid and
 * discoverable; `integration check` then names every built-in icon
 * definition it still has to map.
 * @param {string} name  icon set name (kebab-case)
 * @param {{cwd?: string, dryRun?: boolean, from?: string, exclude?: string[] | string}} options
 * @returns {Promise<{type: 'integration.add', data: import('../icon/icon.type.mjs').IconNewData}>}
 */
async function addIconSet(name, options) {
  const {cwd = process.cwd(), dryRun = false, from} = options;
  const exclude =
    typeof options.exclude === 'string'
      ? options.exclude
          .split(',')
          .map(each => each.trim())
          .filter(Boolean)
      : (options.exclude ?? []);
  if (exclude.length > 0 && from == null) {
    throw new AstryxError(
      '--exclude names library exports to leave out, so it needs --from.',
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  if (!KEBAB_NAME_RE.test(name)) {
    throw new AstryxError(
      `Invalid icon set name "${name}": use lowercase kebab-case starting with a letter.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  try {
    sanitizeName(name, {label: 'icon set name'});
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_INVALID_ARGUMENT,
      );
    }
    throw error;
  }

  const {packageDir, packageFile, pkg, owner, manifestFile, manifestExists} =
    resolvePackage(cwd);
  if (typeof pkg.name !== 'string' || pkg.name.trim() === '') {
    throw new AstryxError(
      'package.json has no name. An icon set imports its icons from its own package, so the package needs a name first.',
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const manifest = await loadCurrentManifest(manifestFile, manifestExists);
  const rootPath = manifest.experimental?.iconSets ?? DEFAULT_ROOTS.iconSets;
  /** @type {string} */
  let root;
  try {
    root = assertWithin(rootPath, packageDir, {
      label: 'experimental.iconSets root',
    });
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw error;
  }

  try {
    await patchIntegrationRoot(packageDir, ICON_SETS_ROOT_KEY, rootPath, {
      dryRun: true,
      createIfMissing: true,
    });
  } catch (error) {
    if (error instanceof IntegrationRootConflictError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_INTEGRATION_ROOT_CONFLICT,
      );
    }
    throw error;
  }

  const setDir = assertWithin(name, root, {label: 'icon set directory'});
  const docFile = assertWithin(`${name}.doc.mjs`, setDir, {
    label: 'icon set descriptor',
  });
  const dataFile = assertWithin(`${name}.icons.json`, setDir, {
    label: 'icon set data file',
  });
  // Wrapping a library again refreshes the set's icons in place.
  if (from != null && fs.existsSync(docFile) && fs.existsSync(dataFile)) {
    return refreshIconSet(name, {
      cwd,
      dryRun,
      from,
      exclude,
      packageDir,
      rootPath,
      manifestPath: projectPath(path.relative(packageDir, manifestFile)),
    });
  }
  for (const file of [docFile, dataFile]) {
    if (fs.existsSync(file)) {
      throw new AstryxError(
        `Refusing to overwrite existing file ${projectPath(path.relative(packageDir, file))}.`,
        undefined,
        ERROR_CODES.ERR_FILE_EXISTS,
      );
    }
  }

  // The set's generated icons module, with its theme map, starts empty; with
  // --from, every component the library exports becomes an icon in it.
  const generated = `./${projectPath(path.relative(packageDir, path.join(setDir, `${name}.generated.js`)))}`;
  /** @type {Array<{id: string, export: string, words: string[]}>} */
  let icons = [];
  /** @type {Record<string, string>} */
  let map = {};
  /** @type {import('../../foundation/discovery/icon-set-writer.mjs').GeneratedIcon[]} */
  let exportsToWrite = [];
  if (from != null) {
    const source = await iconAuthoring(() =>
      resolveIconSource(from, {packageDir, pkg}),
    );
    const found = libraryIcons(source.file, {exclude});
    if (found.length === 0) {
      throw new AstryxError(
        `"${from}" exports no icon components this command can read. If its icons are data (objects or SVG strings), run \`astryx experimental icon new-set ${name}\`, declare an "adapter" in ${name}.icons.json, and run this command again; or add icons one at a time with \`astryx experimental icon add <Export> --from ${from}\`.`,
        undefined,
        ERROR_CODES.ERR_NOT_FOUND,
      );
    }
    icons = found.map(icon => ({
      id: icon.id,
      export: icon.name,
      words: icon.id.split('-'),
    }));
    map = exactDefinitionMap(icons, {});
    exportsToWrite = found.map(icon => ({
      name: icon.name,
      from: source.module,
      source: icon.export,
      adapt: icon.adapt,
    }));
  }
  const data = {
    schemaVersion: /** @type {const} */ (1),
    module: pkg.name,
    generated,
    themeMap: THEME_MAP_NAME,
    map,
    icons,
  };
  const generatedText = await iconAuthoring(() =>
    generatedModuleText(packageDir, generated, null, data, exportsToWrite),
  );

  const displayName = kebabToTitle(name);
  // The artwork license defaults to the package's own license; the author
  // edits it when the artwork comes from elsewhere.
  const license =
    typeof pkg.license === 'string' && pkg.license.trim() !== ''
      ? pkg.license
      : 'UNLICENSED';
  const docContents = [
    "/** @type {import('@astryxdesign/cli/authoring').IconSetDoc} */",
    'export default {',
    "  type: 'icon-set',",
    `  name: ${quoteJs(name)},`,
    `  displayName: ${quoteJs(displayName)},`,
    `  description: ${quoteJs(`${displayName} icons.`)},`,
    '  maintained: true,',
    `  license: ${quoteJs(license)},`,
    '};',
    '',
  ].join('\n');
  const dataContents = iconSetDataText(data);

  /** @type {import('./add-helpers.mjs').WritePlan[]} */
  const plans = [
    {path: docFile, contents: docContents, createOnly: true},
    {path: dataFile, contents: dataContents, createOnly: true},
  ];
  plans.push({
    path: assertWithin(generated, packageDir, {
      label: 'generated icons module',
    }),
    contents: generatedText.js,
    createOnly: true,
  });
  const typesPath = generatedTypesPath(generated);
  if (typesPath && generatedText.dts != null) {
    plans.push({
      path: assertWithin(typesPath, packageDir, {
        label: 'generated icon types',
      }),
      contents: generatedText.dts,
      createOnly: true,
    });
  }
  const pkgUpdate = packageJsonUpdate(
    packageFile,
    rootPath,
    path.basename(manifestFile),
  );
  if (pkgUpdate != null) {
    plans.push({
      path: packageFile,
      contents: pkgUpdate.contents,
      createOnly: false,
      expectedOriginal: pkgUpdate.expectedOriginal,
    });
  }

  const writtenFiles = plans.map(p =>
    projectPath(path.relative(packageDir, p.path)),
  );
  const manifestPath = projectPath(path.relative(packageDir, manifestFile));

  let rootReceipt = {
    path: rootPath,
    created: !manifest.experimental?.iconSets,
  };
  if (!dryRun) {
    let rollback = () => {};
    try {
      rollback = applyWrites(plans);
      rootReceipt = await patchIntegrationRoot(
        packageDir,
        ICON_SETS_ROOT_KEY,
        rootPath,
        {
          createIfMissing: true,
          verify: async () => {
            const m = await loadManifestObject(manifestFile, 'verify', {
              fresh: true,
            });
            const declared = m.experimental?.iconSets;
            if (!declared)
              throw new Error(
                'experimental.iconSets root not visible after writing.',
              );
            const setsRoot = assertWithin(declared, packageDir, {
              label: 'experimental.iconSets root',
            });
            await assertContributionVisible(
              {name: owner, iconSets: setsRoot},
              'icon-set',
              name,
            );
          },
        },
      );
    } catch (error) {
      rollback();
      if (error instanceof IntegrationRootConflictError) {
        throw new AstryxError(
          error.message,
          undefined,
          ERROR_CODES.ERR_INTEGRATION_ROOT_CONFLICT,
        );
      }
      if (error instanceof AstryxError) throw error;
      throw new AstryxError(
        `Failed to write icon-set contribution: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        ERROR_CODES.ERR_WRITE_FAILED,
      );
    }
  }
  if (rootReceipt.created && !writtenFiles.includes(manifestPath)) {
    writtenFiles.push(manifestPath);
  }
  const result = receipt(
    'icon-set',
    name,
    rootReceipt,
    manifestPath,
    writtenFiles,
    dryRun,
  );
  {
    result.data.icons = icons.length;
    result.data.notes = [
      `Add \`export * from '${generated}';\` to the module "${pkg.name}" resolves to (and to its types), so the icons and \`${THEME_MAP_NAME}\` import from it.`,
      'Run `astryx integration check` to see the icon definitions still to map.',
    ];
  }
  return result;
}

/**
 * The `map` entries an exact hit gives: each Astryx definition whose name, or
 * one of whose words, is an icon's id. Entries the map already has are kept.
 * @param {Array<{id: string}>} icons
 * @param {Record<string, string>} map
 */
function exactDefinitionMap(icons, map) {
  const ids = new Set(icons.map(icon => icon.id));
  /** @type {Record<string, string>} */
  const next = {...map};
  for (const {doc} of astryxIconDefinitions().definitions) {
    if (next[doc.name]) continue;
    const kebab = doc.name
      .replace(/([a-z0-9])([A-Z])/gu, '$1-$2')
      .toLowerCase();
    const hit = [
      kebab,
      ...doc.words.map(word => word.replace(/\s+/gu, '-')),
    ].find(candidate => ids.has(candidate));
    if (hit) next[doc.name] = hit;
  }
  return next;
}

/**
 * Run an icon-set authoring step, turning its errors into AstryxErrors.
 * @template T
 * @param {() => T | Promise<T>} step
 * @returns {Promise<T>}
 */
async function iconAuthoring(step) {
  try {
    return await step();
  } catch (error) {
    if (error instanceof IconSetAuthoringError) {
      throw new AstryxError(
        error.message,
        error.suggestions,
        /** @type {any} */ (ERROR_CODES)[error.code] ??
          ERROR_CODES.ERR_INVALID_ARGUMENT,
      );
    }
    throw error;
  }
}

/**
 * Wrap a library into an existing set again: its icons are replaced by what
 * the library exports now (an icon whose words the author extended keeps
 * them), the generated module gains the new exports, `map` keeps every entry
 * whose icon still exists, and the receipt names the entries that lost theirs.
 * @param {string} name
 * @param {{cwd: string, dryRun: boolean, from: string, exclude: string[], packageDir: string, rootPath: string, manifestPath: string}} options
 */
async function refreshIconSet(
  name,
  {cwd, dryRun, from, exclude, packageDir, rootPath, manifestPath},
) {
  return iconAuthoring(async () => {
    const where = await findLocalIconSet(cwd, name);
    const {set} = where;
    const source = resolveIconSource(from, where);
    const found = libraryIcons(source.file, {
      adapter: Boolean(set.data.adapter),
      exclude,
    });
    const previous = new Map(set.data.icons.map(icon => [icon.id, icon]));
    const icons = found.map(icon => {
      const prior = previous.get(icon.id);
      return {
        ...(prior ?? {}),
        id: icon.id,
        export: icon.name,
        words: [...new Set([...icon.id.split('-'), ...(prior?.words ?? [])])],
      };
    });
    const ids = new Set(icons.map(icon => icon.id));
    /** @type {Record<string, string>} */
    const kept = {};
    /** @type {string[]} */
    const lost = [];
    for (const [definition, id] of Object.entries(set.data.map ?? {})) {
      if (ids.has(id)) kept[definition] = id;
      else lost.push(`${definition} -> "${id}"`);
    }
    const generated = generatedModulePath(set, packageDir);
    const next = {
      ...set.data,
      generated,
      ...(set.data.themeMap ? {} : {themeMap: THEME_MAP_NAME}),
      map: exactDefinitionMap(icons, kept),
      icons,
    };
    /** @type {string[]} */
    const files = [];
    if (!dryRun) {
      const written = writeGeneratedIcons(
        packageDir,
        generated,
        next,
        found.map(icon => ({
          name: icon.name,
          from: source.module,
          source: icon.export,
          adapt: icon.adapt,
        })),
        // The icons the library no longer has leave the module too.
        set.data.icons
          .filter(icon => !ids.has(icon.id))
          .map(icon => icon.export),
      );
      files.push(...written.files);
      try {
        writeIconSetData(set, next);
      } catch (error) {
        written.undo();
        throw error;
      }
    }
    files.push(projectPath(path.relative(packageDir, set.dataPath)));
    const result = receipt(
      'icon-set',
      name,
      {path: rootPath, created: false},
      manifestPath,
      files,
      dryRun,
    );
    result.data.icons = icons.length;
    result.data.notes = [
      ...(lost.length > 0
        ? [
            `These map entries named icons the library no longer exports and were removed: ${lost.join(', ')}.`,
          ]
        : []),
      'Run `astryx integration check` to see the icon definitions still to map.',
    ];
    return result;
  });
}

// ── Contribution: ICON DEFINITION ───────────────────────────────────

/**
 * Add one of an icon set's own icon definitions (AST-084):
 * `<set>/definitions/<name>.doc.mjs`, a typed IconDefinitionDoc, and, with
 * `icon`, the set's `map` entry for it. A name Astryx already has is refused:
 * map to Astryx's definition instead.
 * @param {string} name camelCase definition name
 * @param {{cwd?: string, dryRun?: boolean, set?: string, description?: string, words?: string[] | string, icon?: string}} options
 * @returns {Promise<{type: 'integration.add', data: import('../icon/icon.type.mjs').IconNewData}>}
 */
async function addIconDefinition(name, options) {
  const {
    cwd = process.cwd(),
    dryRun = false,
    set: selector,
    description,
    icon,
  } = options;
  const words =
    typeof options.words === 'string'
      ? options.words.split(',')
      : options.words;
  return iconAuthoring(async () => {
    const where = await findLocalIconSet(cwd, selector);
    const {packageDir, set} = where;
    const doc = checkNewDefinition(set, {name, description, words});
    const file = definitionFile(set, doc.name);
    if (fs.existsSync(file)) {
      throw new AstryxError(
        `Refusing to overwrite existing file ${projectPath(path.relative(packageDir, file))}.`,
        undefined,
        ERROR_CODES.ERR_FILE_EXISTS,
      );
    }
    if (icon != null && !set.data.icons.some(each => each.id === icon)) {
      throw new AstryxError(
        `Icon set "${set.name}" has no icon "${icon}".`,
        set.data.icons
          .map(each => each.id)
          .filter(id => id.includes(icon) || icon.includes(id))
          .slice(0, 5)
          .map(id => ({name: id, reason: 'an icon in this set'})),
        ERROR_CODES.ERR_NOT_FOUND,
      );
    }
    const files = [projectPath(path.relative(packageDir, file))];
    if (icon != null)
      files.push(projectPath(path.relative(packageDir, set.dataPath)));
    if (!dryRun) {
      const undo = writeDefinitionFile(set, doc);
      if (icon != null) {
        try {
          writeIconSetData(
            set,
            {...set.data, map: {...(set.data.map ?? {}), [doc.name]: icon}},
            {extraDefinitions: [doc.name]},
          );
        } catch (error) {
          undo();
          throw error;
        }
      }
      // Discovery reads the set, its new definition included, or the write
      // is undone.
      try {
        await findLocalIconSet(cwd, set.name);
      } catch (error) {
        undo();
        throw error;
      }
    }
    return receipt(
      'icon-definition',
      doc.name,
      {
        path: `./${projectPath(path.relative(packageDir, where.root))}`,
        created: false,
      },
      projectPath(
        path.relative(
          packageDir,
          findLocalIntegrationManifestOrNull(packageDir) ??
            path.join(packageDir, 'astryx.integration.mjs'),
        ),
      ),
      files,
      dryRun,
    );
  });
}

// ── Public per-kind APIs ────────────────────────────────────────────

/**
 * @param {string} name
 * @param {import('./integration-authoring.type.mjs').IntegrationAddComponentOptions} [options]
 */
export function integrationAddComponent(name, options = {}) {
  return addComponent(name, options);
}

/**
 * @param {string} name
 * @param {import('./integration-authoring.type.mjs').IntegrationAddDocOptions} [options]
 */
export function integrationAddDoc(name, options = {}) {
  return addDoc(name, options);
}

/**
 * @param {string} name
 * @param {import('./integration-authoring.type.mjs').IntegrationAddTemplateOptions} [options]
 */
export function integrationAddTemplate(name, options = {}) {
  const {type, ...shared} = options;
  return addTemplate(name, {...shared, templateType: type});
}

/**
 * @param {string} name
 * @param {import('./integration-authoring.type.mjs').IntegrationAddCodemodOptions} options
 */
export function integrationAddCodemod(name, options) {
  return addCodemod(name, options);
}

/**
 * @param {string} line
 * @param {import('./integration-authoring.type.mjs').IntegrationAddAgentDocOptions} [options]
 */
export function integrationAddAgentDoc(line, options = {}) {
  return addAgentDoc(line, options);
}

/**
 * Start an icon set in the local integration package: `astryx experimental
 * icon new-set` (AST-084). Experimental (spec:AST-017 FR27).
 * @experimental
 * @param {string} name
 * @param {import('../icon/icon.type.mjs').IconNewSetOptions} [options]
 * @returns {Promise<import('../icon/icon.type.mjs').IconNewSetResponse>}
 */
export async function iconNewSet(name, options = {}) {
  validateKindOptions('icon-set', options);
  refuseOutsideProject(
    options.cwd ?? process.cwd(),
    'experimental icon new-set',
    'the integration package',
  );
  const {data} = await addIconSet(name, options);
  return {type: 'icon.newSet', data};
}

/**
 * Add an icon set's own icon definition: `astryx experimental icon
 * new-definition` (AST-084). Experimental (spec:AST-017 FR27).
 * @experimental
 * @param {string} name
 * @param {import('../icon/icon.type.mjs').IconNewDefinitionOptions} [options]
 * @returns {Promise<import('../icon/icon.type.mjs').IconNewDefinitionResponse>}
 */
export async function iconNewDefinition(name, options = {}) {
  validateKindOptions('icon-definition', options);
  refuseOutsideProject(
    options.cwd ?? process.cwd(),
    'experimental icon new-definition',
    'the icon-set package',
  );
  const {data} = await addIconDefinition(name, options);
  return {type: 'icon.newDefinition', data};
}

// ── Public dispatcher ───────────────────────────────────────────────

const KIND_OPTIONS = {
  component: new Set(['cwd', 'dryRun']),
  doc: new Set(['cwd', 'dryRun', 'replaces', 'extends', 'parent']),
  template: new Set(['cwd', 'dryRun', 'templateType']),
  codemod: new Set(['cwd', 'dryRun', 'to']),
  'agent-doc': new Set(['cwd', 'dryRun']),
  theme: new Set(['cwd', 'dryRun', 'from']),
};

/** The experimental icon authoring calls' options, refused the same way. */
const ICON_KIND_OPTIONS = {
  'icon-set': new Set(['cwd', 'dryRun', 'from', 'exclude']),
  'icon-definition': new Set([
    'cwd',
    'dryRun',
    'set',
    'description',
    'words',
    'icon',
  ]),
};

/**
 * Refuse options that belong to another contribution kind. Ignoring one is a
 * silent success: the command exits zero while not doing what the caller asked.
 * @param {keyof typeof KIND_OPTIONS | keyof typeof ICON_KIND_OPTIONS} kind
 * @param {Record<string, unknown>} options
 */
function validateKindOptions(kind, options) {
  const allowed =
    kind === 'icon-set' || kind === 'icon-definition'
      ? ICON_KIND_OPTIONS[kind]
      : KIND_OPTIONS[kind];
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && !allowed.has(key)) {
      throw new AstryxError(
        `Option "${key}" does not apply to integration kind "${kind}".`,
        undefined,
        ERROR_CODES.ERR_INVALID_ARGUMENT,
      );
    }
  }
}

/**
 * Add one contribution to the local integration package.
 *
 * @param {import('./integration-authoring.type.mjs').IntegrationAddKind} kind
 * @param {string} name
 * @param {import('./integration-authoring.type.mjs').IntegrationAddOptions} [options]
 * @returns {Promise<import('./integration-authoring.type.mjs').IntegrationAddResponse>}
 */
export async function integrationAdd(kind, name, options = {}) {
  if (!Object.prototype.hasOwnProperty.call(KIND_OPTIONS, kind)) {
    throw new AstryxError(
      `Unknown contribution kind "${kind}". Choose component, doc, template, codemod, agent-doc, or theme.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  validateKindOptions(kind, options);
  switch (kind) {
    case 'component':
      return integrationAddComponent(name, options);
    case 'doc':
      return integrationAddDoc(name, options);
    case 'template':
      return integrationAddTemplate(name, {
        cwd: options.cwd,
        dryRun: options.dryRun,
        type: options.templateType,
      });
    case 'codemod':
      return integrationAddCodemod(name, {
        cwd: options.cwd,
        dryRun: options.dryRun,
        to: /** @type {string} */ (options.to),
      });
    case 'agent-doc':
      return integrationAddAgentDoc(name, options);
    case 'theme':
      return integrationAddTheme(name, {
        cwd: options.cwd,
        dryRun: options.dryRun,
        from: options.from,
      });
  }
}
