// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx integration add theme` — scaffold one strongly typed,
 * same-stem source/descriptor pair into an integration package and declare the
 * themes root on first use.
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
import {discoverThemeDirectory} from '../../foundation/discovery/theme-discovery.mjs';
import {
  findLocalIntegrationManifestOrNull,
  IntegrationRootConflictError,
  patchIntegrationRoot,
} from '../../foundation/integrations/manifest-writer.mjs';
import {loadManifestObject} from '../../foundation/integrations/integrations.mjs';
import {themeDescriptorSource} from '../../foundation/integrations/theme-descriptor.mjs';
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
    descriptor: `${identifier}Theme.doc.mjs`,
  };
}

/** @param {{slug: string, exportName: string}} identity */
function themeSource(identity) {
  return `import {defineTheme} from '@astryxdesign/core/theme';\n\nexport const ${identity.exportName} = defineTheme({\n  name: '${identity.slug}',\n});\n`;
}

/** @param {{slug: string, displayName: string}} identity */
function themeDescriptor(identity) {
  return themeDescriptorSource({
    type: 'theme',
    name: identity.slug,
    displayName: identity.displayName,
    description: `${identity.displayName} theme.`,
    maintained: true,
  });
}

/**
 * Read bytes back through the same discovery seam Project uses. A write is not
 * successful until the requested slug resolves.
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
    if (fs.existsSync(root)) {
      discoverThemeDirectory(root, owner);
    }
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
  const descriptorFile = assertWithin(identity.descriptor, themeDir, {
    label: 'theme descriptor file',
  });
  // An existing folder is filled; only a file this would write is refused.
  for (const file of [sourceFile, descriptorFile]) {
    if (fs.existsSync(file)) {
      throw new AstryxError(
        `Refusing to overwrite existing file ${projectPath(path.relative(packageDir, file))}.`,
        undefined,
        ERROR_CODES.ERR_FILE_EXISTS,
      );
    }
  }

  /** @type {import('./add-helpers.mjs').WritePlan[]} */
  const plans = [
    {path: sourceFile, contents: themeSource(identity), createOnly: true},
    {
      path: descriptorFile,
      contents: themeDescriptor(identity),
      createOnly: true,
    },
  ];
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
