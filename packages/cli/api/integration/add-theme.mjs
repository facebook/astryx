// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx integration add theme` — scaffold one valid source theme into
 * an integration package, update its theme catalog, and declare the root on
 * first use.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {
  assertWithin,
  PathSafetyError,
  sanitizeName,
} from '../../foundation/fs/path-safety.mjs';
import {
  discoverThemeCatalog,
  THEME_MANIFEST_BASENAME,
} from '../../foundation/discovery/theme-discovery.mjs';
import {
  findLocalIntegrationManifestOrNull,
  IntegrationRootConflictError,
  patchIntegrationRoot,
} from '../../foundation/integrations/manifest-writer.mjs';
import {loadManifestObject} from '../../foundation/integrations/integrations.mjs';
import {assertContributionVisible} from '../../foundation/integrations/contribution-inventory.mjs';
import {
  applyWrites,
  findPackageDir,
  packageJsonUpdate,
  projectPath,
} from './add-helpers.mjs';

const DEFAULT_THEMES_ROOT = './themes';

/** @param {string} slug */
function themeIdentity(slug) {
  try {
    sanitizeName(slug, {label: 'theme name'});
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
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(slug)) {
    throw new AstryxError(
      `Invalid theme name "${slug}": use lowercase kebab-case starting with a letter.`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const identifier = slug.replace(/-([a-z0-9])/gu, (_, character) =>
    character.toUpperCase(),
  );
  const displayName = slug
    .split('-')
    .map(part =>
      part === 'y2k' ? 'Y2K' : part[0].toUpperCase() + part.slice(1),
    )
    .join(' ');
  return {
    slug,
    displayName,
    exportName: `${identifier}Theme`,
    entry: `${identifier}Theme.ts`,
  };
}

/** @param {{slug: string, exportName: string}} identity */
function themeSource(identity) {
  return `import {defineTheme} from '@astryxdesign/core/theme';\n\nexport const ${identity.exportName} = defineTheme({\n  name: '${identity.slug}',\n});\n`;
}

/**
 * Read the bytes back through the same integration-theme discovery seam Project
 * uses. A write is not successful until the requested slug resolves.
 * @param {string} packageDir
 * @param {string} manifestFile
 * @param {string} owner
 * @param {string} slug
 */
async function verifyThemeContribution(packageDir, manifestFile, owner, slug) {
  const manifest = await loadManifestObject(
    manifestFile,
    `Integration manifest ${path.basename(manifestFile)}`,
    {fresh: true},
  );
  if (!manifest.themes) {
    throw new Error('The themes root was not visible after writing.');
  }
  const themesRoot = assertWithin(manifest.themes, packageDir, {
    label: 'themes root',
  });
  await assertContributionVisible(
    {
      name: owner,
      themes: themesRoot,
    },
    'theme',
    slug,
  );
}

/**
 * Add one source theme to the local integration package.
 * @param {string} name lowercase kebab-case theme slug
 * @param {import('./integration-authoring.type.mjs').IntegrationAddThemeOptions} [options]
 * @returns {Promise<import('./integration-authoring.type.mjs').IntegrationAddResponse>}
 */
export async function integrationAddTheme(name, options = {}) {
  const {cwd = process.cwd(), dryRun = false} = options;
  const packageDir = findPackageDir(cwd);
  const packageFile = path.join(packageDir, 'package.json');
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new AstryxError(
      `Cannot read package.json: ${message}`,
      undefined,
      ERROR_CODES.ERR_THEME_INVALID,
    );
  }
  const owner = typeof pkg.name === 'string' ? pkg.name : '(local integration)';
  const identity = themeIdentity(name);
  let manifestFile;
  let manifestExists;
  /** @type {import('../../authoring/integration/type').AstryxIntegration} */
  let manifest = {};
  try {
    const existingManifest = findLocalIntegrationManifestOrNull(packageDir);
    manifestExists = existingManifest != null;
    manifestFile =
      existingManifest ?? path.join(packageDir, 'astryx.integration.mjs');
    if (manifestExists) {
      manifest = await loadManifestObject(
        manifestFile,
        `Integration manifest ${path.basename(manifestFile)}`,
        {fresh: true},
      );
    }
  } catch (error) {
    throw new AstryxError(
      error instanceof Error ? error.message : String(error),
      undefined,
      ERROR_CODES.ERR_THEME_INVALID,
    );
  }

  const rootPath = manifest.themes ?? DEFAULT_THEMES_ROOT;
  let root;
  try {
    root = assertWithin(rootPath, packageDir, {label: 'themes root'});
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

  let rootReceipt;
  try {
    rootReceipt = await patchIntegrationRoot(packageDir, 'themes', rootPath, {
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
    throw new AstryxError(
      error instanceof Error ? error.message : String(error),
      undefined,
      ERROR_CODES.ERR_THEME_INVALID,
    );
  }

  const themeDir = assertWithin(identity.slug, root, {
    label: 'theme directory',
  });
  const sourceFile = assertWithin(identity.entry, themeDir, {
    label: 'theme source file',
  });
  if (fs.existsSync(sourceFile)) {
    throw new AstryxError(
      `Refusing to overwrite existing file ${projectPath(path.relative(packageDir, sourceFile))}.`,
      undefined,
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }

  const catalogFile = assertWithin(THEME_MANIFEST_BASENAME, root, {
    label: 'theme catalog manifest',
  });
  /** @type {{version: 1, themes: Array<Record<string, unknown>>, [key: string]: unknown}} */
  let catalog = {version: 1, themes: []};
  /** @type {Buffer|null} */
  let catalogOriginal = null;
  if (fs.existsSync(catalogFile)) {
    try {
      catalogOriginal = fs.readFileSync(catalogFile);
      catalog = JSON.parse(catalogOriginal.toString('utf-8'));
      // The discovery seam is the schema/source-of-truth validator. The write
      // plan carries catalogOriginal, so any concurrent change between this read
      // and publish is refused rather than overwritten with this snapshot.
      discoverThemeCatalog(root, owner);
    } catch (error) {
      throw new AstryxError(
        error instanceof Error ? error.message : String(error),
        undefined,
        ERROR_CODES.ERR_THEME_INVALID,
      );
    }
  }
  if (
    catalog.themes.some(
      theme =>
        typeof theme.slug === 'string' &&
        theme.slug.toLowerCase() === identity.slug.toLowerCase(),
    )
  ) {
    throw new AstryxError(
      `Theme "${identity.slug}" already exists in ${projectPath(path.relative(packageDir, catalogFile))}.`,
      undefined,
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }

  catalog.themes.push({
    slug: identity.slug,
    displayName: identity.displayName,
    description: `${identity.displayName} theme.`,
    maintained: true,
    entry: identity.entry,
    exportName: identity.exportName,
    files: [identity.entry],
  });

  /** @type {import('./add-helpers.mjs').WritePlan[]} */
  const plans = [];
  plans.push(
    {path: sourceFile, contents: themeSource(identity), createOnly: true},
    {
      path: catalogFile,
      contents: `${JSON.stringify(catalog, null, 2)}\n`,
      createOnly: catalogOriginal == null,
      expectedOriginal: catalogOriginal ?? undefined,
    },
  );
  const packageUpdate = packageJsonUpdate(
    packageFile,
    rootPath,
    path.basename(manifestFile),
  );
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
  const manifestPath = projectPath(path.relative(packageDir, manifestFile));

  if (!dryRun) {
    let rollback = () => {};
    try {
      rollback = applyWrites(plans);
      rootReceipt = await patchIntegrationRoot(packageDir, 'themes', rootPath, {
        createIfMissing: true,
        verify: () =>
          verifyThemeContribution(
            packageDir,
            manifestFile,
            owner,
            identity.slug,
          ),
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
        `Failed to write theme contribution: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        ERROR_CODES.ERR_WRITE_FAILED,
      );
    }
  }
  if (rootReceipt.created && !writtenFiles.includes(manifestPath)) {
    writtenFiles.push(manifestPath);
  }

  return {
    type: 'integration.add',
    data: {
      kind: 'theme',
      name: identity.slug,
      root: rootReceipt,
      manifest: manifestPath,
      files: writtenFiles,
      written: !dryRun,
      dryRun,
    },
  };
}
