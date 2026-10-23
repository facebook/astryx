// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Icon-set authoring writes (spec:AST-084 FR13): start a set and add
 * one of its own icon definitions in the local integration package. Every
 * file it reads or writes goes through here; it is imported only by the
 * `icon` subject's adapter (architecture:cli-surface INV21).
 *
 * @position api/icon — helper of api/icon/_adapter.mjs, read by
 *   api/icon/new-set and api/icon/new-definition
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
  findLocalIntegrationManifestOrNull,
  IntegrationRootConflictError,
  patchIntegrationRoot,
} from '../../foundation/integrations/manifest-writer.mjs';
import {loadManifestObject} from '../../foundation/integrations/integrations.mjs';
import {assertContributionVisible} from '../../foundation/integrations/contribution-inventory.mjs';
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
  setModuleNote,
  writeDefinitionFile,
  writeGeneratedIcons,
  writeIconSetData,
} from '../../foundation/discovery/icon-set-writer.mjs';
import {astryxIconDefinitions} from '../../foundation/discovery/icon-definition-discovery.mjs';
import {
  KEBAB_NAME_RE,
  applyWrites,
  kebabToTitle,
  loadCurrentManifest,
  packageJsonUpdate,
  projectPath,
  receipt,
  resolvePackage,
} from '../integration/add-helpers.mjs';

/** Where a package's icon sets go when its manifest declares none. */
const DEFAULT_ICON_SETS_ROOT = './icon-sets';

/** Where an icon set's root is declared: an experimental manifest key. */
const ICON_SETS_ROOT_KEY = 'experimental.iconSets';

// ── Icon set ────────────────────────────────────────────────────────

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
 * @returns {Promise<{type: 'integration.add', data: import('./icon.type.mjs').IconNewData}>}
 */
export async function addIconSet(name, options) {
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
  const rootPath = manifest.experimental?.iconSets ?? DEFAULT_ICON_SETS_ROOT;
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

  /** @type {import('../integration/add-helpers.mjs').WritePlan[]} */
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
    // The line goes in the package's entry file, relative to it: the
    // generated path is relative to the package root, which the entry need
    // not be (exports → ./src/index.js).
    const moduleNote = setModuleNote(
      /** @type {import('../../foundation/discovery/icon-set-discovery.mjs').DiscoveredIconSet} */ (
        /** @type {unknown} */ ({data: {module: pkg.name}})
      ),
      {packageDir, pkg},
      generated,
      THEME_MAP_NAME,
    );
    result.data.notes = [
      ...(moduleNote ? [moduleNote] : []),
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
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
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

// ── Icon definition ─────────────────────────────────────────────────

/**
 * Add one of an icon set's own icon definitions (AST-084):
 * `<set>/definitions/<name>.doc.mjs`, a typed IconDefinitionDoc, and, with
 * `icon`, the set's `map` entry for it. A name Astryx already has is refused:
 * map to Astryx's definition instead.
 * @param {string} name camelCase definition name
 * @param {{cwd?: string, dryRun?: boolean, set?: string, description?: string, words?: string[] | string, icon?: string}} options
 * @returns {Promise<{type: 'integration.add', data: import('./icon.type.mjs').IconNewData}>}
 */
export async function addIconDefinition(name, options) {
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
      let undoMap = () => {};
      if (icon != null) {
        try {
          undoMap = writeIconSetData(
            set,
            {...set.data, map: {...(set.data.map ?? {}), [doc.name]: icon}},
            {extraDefinitions: [doc.name]},
          );
        } catch (error) {
          undo();
          throw error;
        }
      }
      // Discovery reads the set, its new definition included, or every
      // write is undone: the data file first, then the definition.
      try {
        await findLocalIconSet(cwd, set.name);
      } catch (error) {
        undoMap();
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
