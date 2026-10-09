// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Fixture-only static materialization path for VibeArtifactV2.
 * @input A validated static artifact and its immutable bundle directory.
 * @output A producer-neutral materialization receipt with verified digests.
 * @position Minimal evaluator seam for AST-067 PR 1; it is intentionally not
 *   wired into the existing vibe-test command.
 */

import fs, {type Stats} from 'node:fs';
import path from 'node:path';
import type {
  VibeArtifactV2,
  VibeMaterializationFailureCodeV2,
  VibeMaterializationReceiptV2,
} from './vibe-artifact-v2';
import {sha256TreeV2, VibeArtifactTreeDigestError} from './vibe-artifact-v2';

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
  let stats: Stats;
  try {
    stats = fs.lstatSync(absolute);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new StaticArtifactFixtureError(
        'missing_entry',
        `${relativePath} does not exist in the bundle`,
      );
    }
    throw error;
  }

  if (stats.isSymbolicLink()) {
    let detail = 'uses a dangling symlink';
    try {
      const realRoot = fs.realpathSync(bundleRoot);
      const realTarget = fs.realpathSync(absolute);
      detail = inside(realRoot, realTarget)
        ? 'uses a symlink, which is not portable in a bundle'
        : 'uses a symlink that escapes the bundle root';
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
    throw new StaticArtifactFixtureError(
      'unsafe_path',
      `${relativePath} ${detail}`,
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
    if (
      error instanceof StaticArtifactFixtureError ||
      error instanceof VibeArtifactTreeDigestError
    ) {
      return failure(artifact, error.code, error.message);
    }
    const message = error instanceof Error ? error.message : String(error);
    return failure(artifact, 'unexpected_error', message);
  }
}
