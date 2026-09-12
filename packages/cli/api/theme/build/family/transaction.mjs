// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file transaction.mjs
 * @input One complete content-identified file set and a family-owned manifest
 * @output Atomic current-pointer publication, recovery, cleanup, and check
 * @position Theme-agnostic filesystem boundary for AST-034 family artifacts
 */

import {createHash, randomUUID} from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * @typedef {object} FamilyManifest
 * @property {number} schemaVersion
 * @property {string} artifactKey
 * @property {string} generationId
 * @property {{manifest: string}} artifacts
 * @property {Array<{path: string, digest: string}>} owned
 */

/** @param {unknown} error */
function errorCode(error) {
  return /** @type {{code?: string}} */ (error)?.code;
}

/** @param {string | Buffer} value */
function sha256(value) {
  return `sha256-${createHash('sha256').update(value).digest('hex')}`;
}

/** @param {string | Buffer} value */
function bytes(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(value);
}

/** @param {string} relative */
function assertSafeRelativePath(relative) {
  if (
    relative.length === 0 ||
    path.isAbsolute(relative) ||
    relative.includes('\\') ||
    relative
      .split('/')
      .some(part => part === '' || part === '.' || part === '..')
  ) {
    throw new Error(`Unsafe family-owned path "${relative}".`);
  }
}

/** @param {string} directory */
function fsyncDirectory(directory) {
  const fd = fs.openSync(directory, 'r');
  try {
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

/** @param {string} file @param {string | Buffer} content */
function durableWrite(file, content) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const fd = fs.openSync(file, 'wx');
  try {
    fs.writeFileSync(fd, bytes(content));
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

/** @param {number} pid */
function processIsAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return errorCode(error) !== 'ESRCH';
  }
}

/** @param {string} lockPath */
function readLockOwner(lockPath) {
  try {
    return JSON.parse(
      Buffer.from(fs.readlinkSync(lockPath), 'base64url').toString('utf8'),
    );
  } catch {
    throw new Error(
      `Theme family output is locked by an unreadable lock at ${lockPath}.`,
    );
  }
}

/** @param {any} prior @param {{hostname: string, pid: number}} owner */
function isStaleLock(prior, owner) {
  return (
    prior?.hostname === owner.hostname &&
    Number.isInteger(prior?.pid) &&
    !processIsAlive(prior.pid)
  );
}

/** @param {string} root */
function acquireLock(root) {
  const lockPath = path.join(root, '.lock');
  const reclaimPath = path.join(root, '.lock-reclaim');
  const owner = {
    hostname: os.hostname(),
    pid: process.pid,
    nonce: randomUUID(),
  };
  const target = Buffer.from(JSON.stringify(owner)).toString('base64url');
  const release = () => {
    try {
      if (fs.readlinkSync(lockPath) !== target) {
        throw new Error(`Theme family lock ownership changed at ${lockPath}.`);
      }
      fs.unlinkSync(lockPath);
      fsyncDirectory(root);
    } catch (error) {
      if (errorCode(error) !== 'ENOENT') throw error;
    }
  };

  if (fs.lstatSync(reclaimPath, {throwIfNoEntry: false})) {
    throw new Error(`Theme family lock recovery is active at ${reclaimPath}.`);
  }
  try {
    fs.symlinkSync(target, lockPath);
    fsyncDirectory(root);
    return release;
  } catch (error) {
    if (errorCode(error) !== 'EEXIST') throw error;
  }

  const prior = readLockOwner(lockPath);
  if (!isStaleLock(prior, owner)) {
    throw new Error(`Theme family output is locked at ${lockPath}.`);
  }

  try {
    fs.symlinkSync(target, reclaimPath);
    fsyncDirectory(root);
  } catch (error) {
    if (errorCode(error) === 'EEXIST') {
      throw new Error(
        `Theme family lock recovery is active at ${reclaimPath}.`,
        {cause: error},
      );
    }
    throw error;
  }

  let acquired = false;
  /** @type {unknown} */
  let operationError;
  try {
    const confirmed = readLockOwner(lockPath);
    if (!isStaleLock(confirmed, owner)) {
      throw new Error(`Theme family output is locked at ${lockPath}.`);
    }
    fs.unlinkSync(lockPath);
    fsyncDirectory(root);
    try {
      fs.symlinkSync(target, lockPath);
      fsyncDirectory(root);
      acquired = true;
    } catch (error) {
      if (errorCode(error) === 'EEXIST') {
        throw new Error(`Theme family output is locked at ${lockPath}.`, {
          cause: error,
        });
      }
      throw error;
    }
  } catch (error) {
    operationError = error;
  }

  /** @type {unknown} */
  let cleanupError;
  try {
    fs.unlinkSync(reclaimPath);
    fsyncDirectory(root);
  } catch (error) {
    if (errorCode(error) !== 'ENOENT') cleanupError = error;
  }
  if (cleanupError) {
    if (acquired) release();
    throw cleanupError;
  }
  if (operationError) throw operationError;
  return release;
}

/**
 * Probe the actual destination filesystem for every primitive publication needs.
 * Node exposes fsync rather than macOS F_FULLFSYNC, so this establishes the
 * strongest ordering guarantee available through the supported runtime.
 *
 * @param {string} root
 */
export function probeAtomicPointer(root) {
  const probe = path.join(root, `.probe-${randomUUID()}`);
  try {
    fs.mkdirSync(path.join(probe, 'a'), {recursive: true});
    fs.mkdirSync(path.join(probe, 'b'), {recursive: true});
    fs.writeFileSync(path.join(probe, 'a', 'value'), 'probe');
    fs.symlinkSync('a', path.join(probe, 'pointer'), 'dir');
    if (!fs.lstatSync(path.join(probe, 'pointer')).isSymbolicLink()) {
      throw new Error('directory pointer was not created as a symbolic link');
    }
    fs.symlinkSync('b', path.join(probe, 'next'), 'dir');
    fs.renameSync(path.join(probe, 'next'), path.join(probe, 'pointer'));
    if (fs.readlinkSync(path.join(probe, 'pointer')) !== 'b') {
      throw new Error('atomic symbolic-link replacement did not take effect');
    }
    fsyncDirectory(probe);
    const fd = fs.openSync(path.join(probe, 'a', 'value'), 'r+');
    try {
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
  } catch (error) {
    throw new Error(
      `This filesystem cannot publish a theme family atomically at ${root}: ${error instanceof Error ? error.message : String(error)}`,
      {cause: error},
    );
  } finally {
    fs.rmSync(probe, {recursive: true, force: true});
  }
}

/** @param {string} root */
function readCurrent(root) {
  const currentPath = path.join(root, 'current');
  try {
    const stat = fs.lstatSync(currentPath);
    if (!stat.isSymbolicLink()) {
      throw new Error(
        `Theme family current pointer is not a symbolic link: ${currentPath}.`,
      );
    }
  } catch (error) {
    if (errorCode(error) === 'ENOENT') return null;
    throw error;
  }

  const target = fs.readlinkSync(currentPath).split(path.sep).join('/');
  assertSafeRelativePath(target);
  const targetParts = target.split('/');
  if (targetParts.length !== 2 || targetParts[0] !== 'generations') {
    throw new Error(
      `Theme family current pointer escapes generations: ${target}.`,
    );
  }
  return {target, generationId: target.slice('generations/'.length)};
}

/** @param {string} root @param {string | null} target */
function replaceCurrent(root, target) {
  const currentPath = path.join(root, 'current');
  if (target === null) {
    try {
      fs.unlinkSync(currentPath);
    } catch (error) {
      if (errorCode(error) !== 'ENOENT') throw error;
    }
    return;
  }

  assertSafeRelativePath(target);
  const temporary = path.join(root, `.current-${randomUUID()}.tmp`);
  fs.symlinkSync(target, temporary, 'dir');
  try {
    fs.renameSync(temporary, currentPath);
  } finally {
    fs.rmSync(temporary, {force: true});
  }
}

/**
 * Resolve an owned file without following a substituted directory or final
 * symlink outside the immutable generation.
 * @param {string} generationDir
 * @param {string} relative
 */
function assertRegularOwnedFile(generationDir, relative) {
  assertSafeRelativePath(relative);
  const parts = relative.split('/');
  let current = generationDir;
  for (const part of parts.slice(0, -1)) {
    current = path.join(current, part);
    const stat = fs.lstatSync(current);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error(
        `Family-owned path has a non-directory parent: ${relative}.`,
      );
    }
  }
  const finalPart = parts.at(-1);
  if (!finalPart) throw new Error(`Unsafe family-owned path "${relative}".`);
  const file = path.join(current, finalPart);
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`Family-owned path is not a regular file: ${relative}.`);
  }
  return file;
}

/**
 * @param {string} root
 * @param {string} generationTarget
 * @param {string} manifestPath
 * @param {string} artifactKey
 * @param {string} [expectedGenerationId]
 */
function readManifest(
  root,
  generationTarget,
  manifestPath,
  artifactKey,
  expectedGenerationId,
) {
  assertSafeRelativePath(generationTarget);
  assertSafeRelativePath(manifestPath);
  const targetParts = generationTarget.split('/');
  if (targetParts.length !== 2 || targetParts[0] !== 'generations') {
    throw new Error(`Invalid family generation target: ${generationTarget}.`);
  }
  const generationDir = path.join(root, ...targetParts);
  const generationStat = fs.lstatSync(generationDir);
  if (!generationStat.isDirectory() || generationStat.isSymbolicLink()) {
    throw new Error(
      `Family generation is not a real directory: ${generationTarget}.`,
    );
  }
  const manifestFile = assertRegularOwnedFile(generationDir, manifestPath);
  const content = fs.readFileSync(manifestFile);
  const manifest = /** @type {FamilyManifest} */ (
    JSON.parse(content.toString('utf8'))
  );
  if (
    manifest?.schemaVersion !== 1 ||
    manifest?.artifactKey !== artifactKey ||
    (expectedGenerationId !== undefined &&
      manifest?.generationId !== expectedGenerationId) ||
    manifest?.artifacts?.manifest !== manifestPath ||
    !Array.isArray(manifest?.owned)
  ) {
    throw new Error(`Invalid family manifest at ${manifestFile}.`);
  }
  for (const owned of manifest.owned) {
    assertSafeRelativePath(owned.path);
    if (typeof owned.digest !== 'string') {
      throw new Error(`Invalid family manifest digest at ${manifestFile}.`);
    }
  }
  return {
    manifest,
    content,
    digest: sha256(content),
    generationDir,
    manifestFile,
  };
}

/**
 * @param {string} root
 * @param {string} generationTarget
 * @param {string} manifestPath
 * @param {string} artifactKey
 */
function validateGeneration(root, generationTarget, manifestPath, artifactKey) {
  const info = readManifest(
    root,
    generationTarget,
    manifestPath,
    artifactKey,
    path.posix.basename(generationTarget),
  );
  for (const owned of info.manifest.owned) {
    const file = assertRegularOwnedFile(info.generationDir, owned.path);
    const actual = sha256(fs.readFileSync(file));
    if (actual !== owned.digest) {
      throw new Error(`Family generation digest mismatch for ${owned.path}.`);
    }
  }
  return info;
}

/** @param {string} start @param {string} stop */
function removeEmptyParents(start, stop) {
  let current = start;
  while (current.startsWith(stop) && current !== stop) {
    try {
      fs.rmdirSync(current);
    } catch {
      return;
    }
    current = path.dirname(current);
  }
}

/**
 * Delete only files whose own manifest proves family ownership. Unknown files
 * and directories survive; a broad filename pattern never grants ownership.
 *
 * @param {string} root
 * @param {string} generationTarget
 * @param {string} manifestPath
 * @param {string} artifactKey
 * @param {boolean} [allowEmptyWithoutManifest]
 */
function removeManifestOwnedGeneration(
  root,
  generationTarget,
  manifestPath,
  artifactKey,
  allowEmptyWithoutManifest = false,
) {
  assertSafeRelativePath(generationTarget);
  let info;
  try {
    info = readManifest(root, generationTarget, manifestPath, artifactKey);
  } catch {
    const generationDir = path.join(root, ...generationTarget.split('/'));
    const stat = fs.lstatSync(generationDir, {throwIfNoEntry: false});
    if (
      allowEmptyWithoutManifest &&
      stat?.isDirectory() &&
      fs.readdirSync(generationDir).length === 0
    ) {
      fs.rmdirSync(generationDir);
      return true;
    }
    return false;
  }

  const ownedPaths = info.manifest.owned
    .map(owned => owned.path)
    .filter(relative => relative !== manifestPath)
    .sort((a, b) => b.length - a.length);
  for (const relative of ownedPaths) {
    try {
      const file = assertRegularOwnedFile(info.generationDir, relative);
      fs.unlinkSync(file);
      removeEmptyParents(path.dirname(file), info.generationDir);
    } catch (error) {
      if (errorCode(error) !== 'ENOENT') throw error;
    }
  }
  const remaining = fs
    .readdirSync(info.generationDir)
    .filter(entry => entry !== path.basename(manifestPath));
  if (remaining.length === 0) {
    const manifestFile = assertRegularOwnedFile(
      info.generationDir,
      manifestPath,
    );
    fs.unlinkSync(manifestFile);
    removeEmptyParents(path.dirname(manifestFile), info.generationDir);
    try {
      fs.rmdirSync(info.generationDir);
    } catch {
      // A concurrent observer is unsupported, but a newly created unrelated
      // path still remains outside this manifest's deletion authority.
    }
  }
  // When unrelated data remains, retain the manifest as proof that the removed
  // paths belonged to this superseded generation. A later cleanup can finish
  // after the unrelated data is moved without guessing from the directory name.
  return true;
}

/**
 * @param {string} root
 * @param {string | null} activeTarget
 * @param {string | null} protectedTarget
 * @param {string} manifestPath
 * @param {string} artifactKey
 * @param {(() => void) | undefined} duringCleanup
 * @param {Set<string>} [requiredTargets]
 */
function cleanupGenerations(
  root,
  activeTarget,
  protectedTarget,
  manifestPath,
  artifactKey,
  duringCleanup,
  requiredTargets = new Set(),
) {
  const generationsDir = path.join(root, 'generations');
  if (!fs.existsSync(generationsDir)) return;
  for (const name of fs.readdirSync(generationsDir).sort()) {
    const target = `generations/${name}`;
    if (target === activeTarget || target === protectedTarget) continue;
    const full = path.join(generationsDir, name);
    const fullStat = fs.lstatSync(full);
    if (!fullStat.isDirectory() || fullStat.isSymbolicLink()) {
      if (requiredTargets.has(target)) {
        throw new Error(
          `Cannot complete family cleanup because ${target} is not a real directory.`,
        );
      }
      continue;
    }
    duringCleanup?.();
    const removedOwned = removeManifestOwnedGeneration(
      root,
      target,
      manifestPath,
      artifactKey,
      requiredTargets.has(target),
    );
    if (!removedOwned && requiredTargets.has(target)) {
      throw new Error(
        `Cannot complete family cleanup because ${target} has no valid ownership manifest.`,
      );
    }
  }
  fsyncDirectory(generationsDir);
}

/** @param {string} root @param {unknown} journal */
function writeJournal(root, journal) {
  const finalPath = path.join(root, '.journal.json');
  const temporary = path.join(root, `.journal-${randomUUID()}.tmp`);
  durableWrite(temporary, `${JSON.stringify(journal, null, 2)}\n`);
  fs.renameSync(temporary, finalPath);
  fsyncDirectory(root);
}

/** @param {string} root */
function removeJournal(root) {
  fs.unlinkSync(path.join(root, '.journal.json'));
  fsyncDirectory(root);
}

/**
 * Resolve a prior interrupted commit under the family lock.
 *
 * @param {string} root
 * @param {string} artifactKey
 * @param {string} manifestPath
 */
function recover(root, artifactKey, manifestPath) {
  const journalPath = path.join(root, '.journal.json');
  if (!fs.existsSync(journalPath)) return;

  let journal;
  try {
    journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
  } catch {
    throw new Error(`Theme family journal is unreadable at ${journalPath}.`);
  }
  if (
    journal?.artifactKey !== artifactKey ||
    typeof journal?.next?.target !== 'string' ||
    typeof journal?.next?.manifestDigest !== 'string' ||
    (journal.prev !== null &&
      (typeof journal?.prev?.target !== 'string' ||
        typeof journal?.prev?.manifestDigest !== 'string'))
  ) {
    throw new Error(`Theme family journal is invalid at ${journalPath}.`);
  }
  for (const entry of [journal.next, journal.prev].filter(Boolean)) {
    assertSafeRelativePath(entry.target);
    const parts = entry.target.split('/');
    if (parts.length !== 2 || parts[0] !== 'generations') {
      throw new Error(`Theme family journal is invalid at ${journalPath}.`);
    }
  }

  const current = readCurrent(root);
  if (current?.target === journal.next.target) {
    const next = validateGeneration(
      root,
      journal.next.target,
      manifestPath,
      artifactKey,
    );
    if (next.digest !== journal.next.manifestDigest) {
      throw new Error(
        'Committed family generation does not match its journal.',
      );
    }
    if (journal.prev) {
      /** @type {ReturnType<typeof readManifest> | undefined} */
      let previous;
      try {
        previous = readManifest(
          root,
          journal.prev.target,
          manifestPath,
          artifactKey,
        );
      } catch (error) {
        const previousDirectory = path.join(
          root,
          ...journal.prev.target.split('/'),
        );
        const previousStat = fs.lstatSync(previousDirectory, {
          throwIfNoEntry: false,
        });
        if (
          !previousStat?.isDirectory() ||
          previousStat.isSymbolicLink() ||
          fs.readdirSync(previousDirectory).length !== 0
        ) {
          throw new Error(
            `Prior family generation has no valid ownership manifest at ${journal.prev.target}.`,
            {cause: error},
          );
        }
      }
      if (previous && previous.digest !== journal.prev.manifestDigest) {
        throw new Error('Prior family generation does not match its journal.');
      }
    }
    cleanupGenerations(
      root,
      journal.next.target,
      null,
      manifestPath,
      artifactKey,
      undefined,
      new Set(journal.prev ? [journal.prev.target] : []),
    );
    removeJournal(root);
    return;
  }

  if (journal.prev) {
    const previous = validateGeneration(
      root,
      journal.prev.target,
      manifestPath,
      artifactKey,
    );
    if (previous.digest !== journal.prev.manifestDigest) {
      throw new Error('Prior family generation does not match its journal.');
    }
    if (current?.target !== journal.prev.target) {
      replaceCurrent(root, journal.prev.target);
      fsyncDirectory(root);
    }
  } else if (current) {
    replaceCurrent(root, null);
    fsyncDirectory(root);
  }

  const nextPath = path.join(root, ...journal.next.target.split('/'));
  const nextExists =
    fs.lstatSync(nextPath, {throwIfNoEntry: false}) !== undefined;
  const removedNext = removeManifestOwnedGeneration(
    root,
    journal.next.target,
    manifestPath,
    artifactKey,
    true,
  );
  if (nextExists && !removedNext) {
    throw new Error(
      `Cannot complete family rollback because ${journal.next.target} has no valid ownership manifest.`,
    );
  }
  removeJournal(root);
}

/**
 * @param {Map<string, string | Buffer>} files
 * @param {string} manifestPath
 * @param {string} artifactKey
 * @param {string} generationId
 */
function validateExpected(files, manifestPath, artifactKey, generationId) {
  if (!files.has(manifestPath)) {
    throw new Error(`Family generation is missing ${manifestPath}.`);
  }
  for (const relative of files.keys()) assertSafeRelativePath(relative);
  const manifestContent = files.get(manifestPath);
  if (manifestContent === undefined) {
    throw new Error(`Family generation is missing ${manifestPath}.`);
  }
  const manifest = /** @type {FamilyManifest} */ (
    JSON.parse(bytes(manifestContent).toString('utf8'))
  );
  if (
    manifest?.schemaVersion !== 1 ||
    manifest?.artifactKey !== artifactKey ||
    manifest?.generationId !== generationId ||
    manifest?.artifacts?.manifest !== manifestPath ||
    !Array.isArray(manifest?.owned)
  ) {
    throw new Error(
      'Expected family manifest does not describe this generation.',
    );
  }
  const expectedOwned = new Map(
    [...files]
      .filter(([relative]) => relative !== manifestPath)
      .map(([relative, content]) => [relative, sha256(bytes(content))]),
  );
  if (expectedOwned.size !== manifest.owned.length) {
    throw new Error('Expected family manifest ownership set is incomplete.');
  }
  for (const owned of manifest.owned) {
    if (expectedOwned.get(owned.path) !== owned.digest) {
      throw new Error(
        `Expected family manifest digest differs for ${owned.path}.`,
      );
    }
  }
}

/**
 * Resolve an interrupted family transaction before planning can fail for an
 * unrelated source or option error.
 *
 * @param {{root: string, artifactKey: string, manifestPath: string}} input
 */
export function recoverFamilyOutput(input) {
  const {root, artifactKey, manifestPath} = input;
  if (!fs.existsSync(root)) return;
  const release = acquireLock(root);
  try {
    recover(root, artifactKey, manifestPath);
  } finally {
    release();
  }
}

/**
 * Publish one complete immutable generation and atomically select it.
 *
 * @param {{root: string, artifactKey: string, generationId: string, files: Map<string, string | Buffer>, manifestPath: string, hooks?: {afterWrite?: (path: string) => void, afterStage?: () => void, afterValidate?: () => void, afterJournal?: () => void, afterPointer?: () => void, duringCleanup?: () => void}}} input
 */
export function publishFamilyGeneration(input) {
  const {
    root,
    artifactKey,
    generationId,
    files,
    manifestPath,
    hooks = {},
  } = input;
  validateExpected(files, manifestPath, artifactKey, generationId);
  const rootExisted = fs.lstatSync(root, {throwIfNoEntry: false}) !== undefined;
  fs.mkdirSync(root, {recursive: true});
  if (!rootExisted) fsyncDirectory(path.dirname(root));
  fs.mkdirSync(path.join(root, 'generations'), {recursive: true});
  fsyncDirectory(root);
  const release = acquireLock(root);
  try {
    recover(root, artifactKey, manifestPath);
    probeAtomicPointer(root);

    const generationTarget = `generations/${generationId}`;
    const generationDir = path.join(root, 'generations', generationId);
    if (!fs.existsSync(generationDir)) {
      const stagingName = `.${generationId}.staging-${randomUUID()}`;
      const stagingDir = path.join(root, 'generations', stagingName);
      fs.mkdirSync(stagingDir);
      const writeEntries = [...files].sort(([a], [b]) => {
        if (a === manifestPath) return -1;
        if (b === manifestPath) return 1;
        return a < b ? -1 : a > b ? 1 : 0;
      });
      for (const [relative, content] of writeEntries) {
        durableWrite(path.join(stagingDir, ...relative.split('/')), content);
        hooks.afterWrite?.(relative);
      }
      for (const directory of [
        ...new Set(
          [...files.keys()].map(relative =>
            path.dirname(path.join(stagingDir, ...relative.split('/'))),
          ),
        ),
      ].sort((a, b) => b.length - a.length)) {
        fsyncDirectory(directory);
      }
      fsyncDirectory(stagingDir);
      hooks.afterStage?.();
      fs.renameSync(stagingDir, generationDir);
      fsyncDirectory(path.join(root, 'generations'));
    }

    const next = validateGeneration(
      root,
      generationTarget,
      manifestPath,
      artifactKey,
    );
    for (const [relative, content] of files) {
      const actual = fs.readFileSync(
        path.join(generationDir, ...relative.split('/')),
      );
      if (!actual.equals(bytes(content))) {
        throw new Error(`Existing family generation differs for ${relative}.`);
      }
    }
    hooks.afterValidate?.();

    const current = readCurrent(root);
    let previous = null;
    if (current) {
      const priorManifest = validateGeneration(
        root,
        current.target,
        manifestPath,
        artifactKey,
      );
      previous = {
        target: current.target,
        manifestDigest: priorManifest.digest,
      };
    }

    writeJournal(root, {
      schemaVersion: 1,
      artifactKey,
      prev: previous,
      next: {target: generationTarget, manifestDigest: next.digest},
      paths: [...files.keys()].sort(),
    });
    hooks.afterJournal?.();

    if (current?.target !== generationTarget) {
      replaceCurrent(root, generationTarget);
    }
    hooks.afterPointer?.();
    fsyncDirectory(root);

    cleanupGenerations(
      root,
      generationTarget,
      null,
      manifestPath,
      artifactKey,
      hooks.duringCleanup,
      new Set(previous ? [previous.target] : []),
    );
    removeJournal(root);
  } finally {
    release();
  }
}

/**
 * Recover if necessary, then compare the expected complete owned set in memory.
 * This never creates a generation or moves `current` after recovery.
 *
 * @param {{root: string, artifactKey: string, expectedGeneration: {generationId: string, files: Map<string, string | Buffer>, manifestPath: string}}} input
 * @returns {{upToDate: boolean, stale: Array<{path: string, reason: 'missing'|'outdated'}>, checked: string[]}}
 */
export function checkFamilyGeneration(input) {
  const {root, artifactKey, expectedGeneration} = input;
  const {generationId, files, manifestPath} = expectedGeneration;
  validateExpected(files, manifestPath, artifactKey, generationId);

  if (!fs.existsSync(root)) {
    const checked = [...files.keys()].sort();
    return {
      upToDate: false,
      stale: checked.map(relative => ({path: relative, reason: 'missing'})),
      checked,
    };
  }

  const release = acquireLock(root);
  try {
    recover(root, artifactKey, manifestPath);
    const current = readCurrent(root);
    const checked = new Set(files.keys());
    /** @type {Array<{path: string, reason: 'missing'|'outdated'}>} */
    const stale = [];
    if (!current) {
      for (const relative of [...files.keys()].sort()) {
        stale.push({path: relative, reason: 'missing'});
      }
      return {upToDate: false, stale, checked: [...checked].sort()};
    }

    let prior;
    try {
      prior = readManifest(
        root,
        current.target,
        manifestPath,
        artifactKey,
        current.generationId,
      );
    } catch {
      for (const relative of [...files.keys()].sort()) {
        stale.push({path: relative, reason: 'missing'});
      }
      return {upToDate: false, stale, checked: [...checked].sort()};
    }

    const priorOwned = new Set([
      ...prior.manifest.owned.map(owned => owned.path),
      manifestPath,
    ]);
    for (const relative of priorOwned) checked.add(relative);

    for (const [relative, content] of files) {
      const file = path.join(
        root,
        ...current.target.split('/'),
        ...relative.split('/'),
      );
      if (!fs.existsSync(file)) {
        stale.push({path: relative, reason: 'missing'});
      } else if (!fs.readFileSync(file).equals(bytes(content))) {
        stale.push({path: relative, reason: 'outdated'});
      }
    }
    for (const relative of priorOwned) {
      if (!files.has(relative)) {
        stale.push({path: relative, reason: 'outdated'});
      }
    }
    stale.sort((a, b) =>
      a.path === b.path
        ? a.reason < b.reason
          ? -1
          : a.reason > b.reason
            ? 1
            : 0
        : a.path < b.path
          ? -1
          : 1,
    );
    return {
      upToDate: stale.length === 0,
      stale,
      checked: [...checked].sort(),
    };
  } finally {
    release();
  }
}
