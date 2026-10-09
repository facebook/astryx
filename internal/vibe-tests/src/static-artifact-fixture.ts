// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Fixture-only static materialization path for VibeArtifactV2.
 * @input A validated static artifact and its immutable bundle directory.
 * @output A producer-neutral materialization receipt with verified digests.
 * @position Minimal evaluator seam for AST-067 PR 1; it is intentionally not
 *   wired into the existing vibe-test command.
 */

import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  VibeArtifactV2,
  VibeMaterializationFailureCodeV2,
  VibeMaterializationReceiptV2,
} from './vibe-artifact-v2';

class StaticArtifactFixtureError extends Error {
  constructor(
    readonly code: VibeMaterializationFailureCodeV2,
    message: string,
  ) {
    super(message);
    this.name = 'StaticArtifactFixtureError';
  }
}

function failure(
  artifact: VibeArtifactV2,
  code: VibeMaterializationFailureCodeV2,
  message: string,
): VibeMaterializationReceiptV2 {
  return {
    schema: 'VibeMaterializationReceiptV2',
    schemaVersion: 2,
    artifactId: artifact.artifactId,
    versions: artifact.versions,
    status: 'materialization_failed',
    materializedView: null,
    primaryFailure: {code, message},
  };
}

function inside(root: string, candidate: string): boolean {
  return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

function lexicalBundlePath(bundleRoot: string, relativePath: string): string {
  const absolute = path.resolve(bundleRoot, ...relativePath.split('/'));
  const resolvedRoot = path.resolve(bundleRoot);
  if (!inside(resolvedRoot, absolute)) {
    throw new StaticArtifactFixtureError(
      'unsafe_path',
      `${relativePath} escapes the bundle root`,
    );
  }
  return absolute;
}

function existingBundlePath(bundleRoot: string, relativePath: string): string {
  const absolute = lexicalBundlePath(bundleRoot, relativePath);
  if (!fs.existsSync(absolute)) {
    throw new StaticArtifactFixtureError(
      'missing_entry',
      `${relativePath} does not exist in the bundle`,
    );
  }
  const realRoot = fs.realpathSync(bundleRoot);
  const realPath = fs.realpathSync(absolute);
  if (!inside(realRoot, realPath)) {
    throw new StaticArtifactFixtureError(
      'unsafe_path',
      `${relativePath} resolves outside the bundle root`,
    );
  }
  return absolute;
}

function collectTreeFiles(
  bundleRoot: string,
  absoluteDirectory: string,
  relativeDirectory: string,
  files: {absolute: string; relative: string}[],
): void {
  for (const entry of fs
    .readdirSync(absoluteDirectory, {withFileTypes: true})
    .sort((left, right) => left.name.localeCompare(right.name))) {
    const absolute = path.join(absoluteDirectory, entry.name);
    const relative = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;
    if (entry.isSymbolicLink()) {
      const realRoot = fs.realpathSync(bundleRoot);
      const realTarget = fs.realpathSync(absolute);
      const detail = inside(realRoot, realTarget)
        ? 'uses a symlink, which is not portable in a fixture bundle'
        : 'uses a symlink that escapes the bundle root';
      throw new StaticArtifactFixtureError(
        'unsafe_path',
        `${relative} ${detail}`,
      );
    }
    if (entry.isDirectory()) {
      collectTreeFiles(bundleRoot, absolute, relative, files);
    } else if (entry.isFile()) {
      files.push({absolute, relative});
    } else {
      throw new StaticArtifactFixtureError(
        'unsafe_path',
        `${relative} is not a regular file or directory`,
      );
    }
  }
}

export function sha256TreeV2(bundleRoot: string, relativeRoot: string): string {
  const absoluteRoot = existingBundlePath(bundleRoot, relativeRoot);
  const rootStats = fs.lstatSync(absoluteRoot);
  if (!rootStats.isDirectory()) {
    throw new StaticArtifactFixtureError(
      'missing_entry',
      `${relativeRoot} is not a directory`,
    );
  }

  const files: {absolute: string; relative: string}[] = [];
  collectTreeFiles(bundleRoot, absoluteRoot, '', files);
  const digest = createHash('sha256');
  for (const file of files.sort((left, right) =>
    left.relative.localeCompare(right.relative),
  )) {
    const fileDigest = createHash('sha256')
      .update(fs.readFileSync(file.absolute))
      .digest('hex');
    digest.update(file.relative);
    digest.update('\0');
    digest.update(fileDigest);
    digest.update('\n');
  }
  return digest.digest('hex');
}

export function materializeStaticArtifactFixtureV2(
  bundleRoot: string,
  artifact: VibeArtifactV2,
): VibeMaterializationReceiptV2 {
  if (artifact.view.kind !== 'static') {
    return failure(
      artifact,
      'unsupported_view',
      `fixture materializer supports static views, not ${artifact.view.kind}`,
    );
  }

  try {
    const sourceTreeDigest = sha256TreeV2(bundleRoot, artifact.source.root);
    if (sourceTreeDigest !== artifact.integrity.sourceTree.value) {
      return failure(
        artifact,
        'digest_mismatch',
        'source-tree digest does not match the immutable bundle',
      );
    }

    const viewInputDigest = sha256TreeV2(bundleRoot, artifact.view.root);
    if (viewInputDigest !== artifact.integrity.viewInput.value) {
      return failure(
        artifact,
        'digest_mismatch',
        'view-input digest does not match the immutable bundle',
      );
    }

    const entry = existingBundlePath(bundleRoot, artifact.view.entry);
    if (!fs.statSync(entry).isFile()) {
      return failure(
        artifact,
        'missing_entry',
        `${artifact.view.entry} is not a regular file`,
      );
    }

    return {
      schema: 'VibeMaterializationReceiptV2',
      schemaVersion: 2,
      artifactId: artifact.artifactId,
      versions: artifact.versions,
      status: 'materialized',
      materializedView: {
        kind: 'static',
        digest: {algorithm: 'sha256', value: viewInputDigest},
      },
      primaryFailure: null,
    };
  } catch (error) {
    if (error instanceof StaticArtifactFixtureError) {
      return failure(artifact, error.code, error.message);
    }
    const message = error instanceof Error ? error.message : String(error);
    return failure(artifact, 'missing_entry', message);
  }
}
