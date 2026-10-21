// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The `icon` subject's adapter: its only access to the environment.
 * Loads the project and reads its icon sets through the `Project` seam.
 *
 * @position api/icon — adapter for api/icon/{search,detail,list,use,map,add};
 *   it also carries the icon ranking, the icon-set writer, and the config
 *   writer the leaves use
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {Project} from '../../foundation/config/project.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {IconSetAuthoringError} from '../../foundation/discovery/icon-set-writer.mjs';
import {isOutsideProject} from '../../foundation/env/project-scope.mjs';

export {
  iconRecord,
  importLine,
  leadingReading,
  matchIcon,
  rankIcons,
  scoreIcon,
} from '../../foundation/discovery/icon-ranking.mjs';
export {astryxIconDefinitions} from '../../foundation/discovery/icon-definition-discovery.mjs';
export {iconSetKey} from '../../foundation/discovery/icon-set-discovery.mjs';
export {setConfigString} from '../../foundation/config/config-writer.mjs';
export {
  assertIconExport,
  checkNewDefinition,
  definitionFile,
  findLocalIconSet,
  writeDefinitionFile,
  iconIdOf,
  closestNames,
  libraryIcons,
  mappableDefinitions,
  resolveIconSource,
  generatedModulePath,
  generatedNamesOf,
  iconExportName,
  iconNaming,
  modulePrefix,
  setModuleNote,
  variantExportName,
  writeGeneratedIcons,
  writeIconSetData,
  THEME_MAP_NAME,
} from '../../foundation/discovery/icon-set-writer.mjs';
export {exportValueKind} from '../../foundation/discovery/module-exports.mjs';

/**
 * Refuse a command that writes to a project or package when `cwd` is outside
 * any project and no package.json is at or above it (spec AST-081 FR3): it
 * writes nothing and says what it needs.
 * @param {string} cwd
 * @param {string} command the command, without `astryx`
 * @param {string} where what to run it in
 */
export function refuseOutsideProject(cwd, command, where) {
  // A folder with a package.json at or above it is a package being authored,
  // even before it declares Astryx; that package's own checks answer there.
  if (!isOutsideProject(cwd) || hasPackageJsonAbove(cwd)) return;
  throw new AstryxError(
    `astryx ${command} works only in a project. Run it in ${where}.`,
    [],
    ERROR_CODES.ERR_PROJECT_REQUIRED,
  );
}

/**
 * Is there a package.json in `dir` or a folder above it?
 * @param {string} dir
 */
function hasPackageJsonAbove(dir) {
  for (let at = path.resolve(dir); ; at = path.dirname(at)) {
    if (fs.existsSync(path.join(at, 'package.json'))) return true;
    if (path.dirname(at) === at) return false;
  }
}

/**
 * Run one authoring step, turning its errors into AstryxErrors.
 * @template T
 * @param {() => T | Promise<T>} step
 * @returns {Promise<T>}
 */
export async function authoring(step) {
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
 * The project's installed icon sets, in tie order, with the sets withdrawn
 * and the project's icon-set choice.
 * @param {string} cwd
 */
export async function loadIconSets(cwd) {
  const project = await Project.load(cwd);
  return project.iconSets({experimental: true});
}

/**
 * The project directory and its installed icon sets, for `experimental icon use`.
 * @param {string} cwd
 */
export async function loadIconProject(cwd) {
  const project = await Project.load(cwd);
  const {sets} = await project.iconSets({experimental: true});
  return {projectDir: findProjectDir(cwd), sets};
}

/**
 * The nearest directory at or above `cwd` with a package.json, else `cwd`.
 * @param {string} cwd
 */
function findProjectDir(cwd) {
  let dir = path.resolve(cwd);
  for (let depth = 0; depth < 50; depth++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(cwd);
}
