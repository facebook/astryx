// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Project-producer assembly for delivery-mode VibeArtifactV2 bundles.
 * @input A scaffolded Git baseline, runner-authored project, prompt identity,
 *   local view recipe, and executor-neutral runner receipt.
 * @output An immutable project artifact with exported baseline/source trees.
 * @position AST-067 PR 2 producer boundary. This module does not build, serve,
 *   score, capture, judge, aggregate, or report on the project.
 */

import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  VibeArtifactNetworkV2,
  VibeArtifactStateV2,
  VibeArtifactV2,
  VibeArtifactVersionsV2,
  VibeArtifactViewV2,
} from '../src/vibe-artifact-v2';
import {
  assertBundlePathV2,
  parseVibeArtifactV2,
  sha256GitTreeBaselineV2,
  sha256TreeV2,
} from '../src/vibe-artifact-v2';

const fsp = fs.promises;
const SOURCE_EXCLUDED_SEGMENTS = new Set(['.git', 'node_modules']);

export const PROJECT_PRODUCER_VERSIONS_V2: VibeArtifactVersionsV2 = {
  producerContract: 'project-producer-v1',
  evaluator: 'artifact-only-v1',
  capturePolicy: 'not-captured-v1',
  metricSet: 'not-scored-v1',
  judgePrompt: 'not-judged-v1',
};

export interface ProjectRunnerReceiptV2 {
  name: string;
  harness: string;
  model: string;
  effort?: string;
  harnessVersion?: string;
  runnerVersion?: string;
  status: 'succeeded' | 'failed' | 'timed_out';
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  attempt?: number;
  exitCode: number | null;
  signal: string | null;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
  toolCalls: number;
  cliLookups: number;
  transcriptAudit: {
    passed: boolean;
    classification: string;
    strictFindings: Array<{label: string}>;
    adjustedFindings: Array<{label: string}>;
  };
}

export interface EmitProjectArtifactV2Options {
  bundleRoot: string;
  projectDir: string;
  baselineDir: string;
  baselineCommit: string;
  prompt: {id: string; text: string};
  deliveryMode: string;
  view: Exclude<VibeArtifactViewV2, {kind: 'url'}>;
  runner: ProjectRunnerReceiptV2;
  versions?: VibeArtifactVersionsV2;
  network?: VibeArtifactNetworkV2;
  entryHints?: string[];
  states?: VibeArtifactStateV2[];
}

export function sha256TextV2(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function git(
  projectDir: string,
  args: string[],
  encoding: BufferEncoding | 'buffer' = 'utf8',
): string | Buffer {
  return execFileSync('git', args, {
    cwd: projectDir,
    encoding: encoding === 'buffer' ? null : encoding,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/** Initialize one private scaffold as a Git-backed baseline. */
export function initializeProjectGitBaselineV2(projectDir: string): string {
  if (fs.existsSync(path.join(projectDir, '.git'))) {
    throw new Error('Project scaffold already contains Git metadata.');
  }
  git(projectDir, ['init', '--quiet']);
  git(projectDir, ['add', '--all']);
  git(projectDir, [
    '-c',
    'user.name=Astryx Vibe Producer',
    '-c',
    'user.email=vibe-producer@example.invalid',
    'commit',
    '--quiet',
    '--no-gpg-sign',
    '--message',
    'Capture project producer baseline',
  ]);
  return String(git(projectDir, ['rev-parse', 'HEAD'])).trim();
}

interface GitTreeEntry {
  mode: '100644' | '100755';
  objectId: string;
  relativePath: string;
}

function trackedGitTreeEntries(
  projectDir: string,
  baselineCommit: string,
): GitTreeEntry[] {
  const output = git(
    projectDir,
    ['ls-tree', '-r', '-z', '--full-tree', baselineCommit],
    'buffer',
  ) as Buffer;
  const entries: GitTreeEntry[] = [];
  for (const record of output.toString('utf8').split('\0')) {
    if (!record) {
      continue;
    }
    const tab = record.indexOf('\t');
    const header = tab === -1 ? '' : record.slice(0, tab);
    const relativePath = tab === -1 ? '' : record.slice(tab + 1);
    const [mode, type, objectId] = header.split(' ');
    assertBundlePathV2(relativePath, 'git-tree path');
    if (type !== 'blob' || (mode !== '100644' && mode !== '100755')) {
      throw new Error(
        `Unsupported Git baseline entry ${relativePath}: ${mode} ${type}. ` +
          'Project artifacts accept regular tracked files only; symlinks and submodules are not portable.',
      );
    }
    entries.push({mode, objectId, relativePath});
  }
  return entries;
}

/**
 * Export exactly one committed Git tree without Git metadata.
 *
 * Only regular tracked files are exported. Untracked files, file modes, empty
 * directories, submodules, symlinks, and `.git` metadata do not participate in
 * the portable digest defined by sha256GitTreeBaselineV2.
 */
export async function exportProjectGitBaselineV2(
  projectDir: string,
  baselineCommit: string,
  destination: string,
): Promise<void> {
  await fsp.rm(destination, {recursive: true, force: true});
  await fsp.mkdir(destination, {recursive: true});
  for (const entry of trackedGitTreeEntries(projectDir, baselineCommit)) {
    const absolute = path.join(destination, ...entry.relativePath.split('/'));
    await fsp.mkdir(path.dirname(absolute), {recursive: true});
    const bytes = git(
      projectDir,
      ['cat-file', 'blob', entry.objectId],
      'buffer',
    );
    await fsp.writeFile(absolute, bytes as Buffer, {
      mode: entry.mode === '100755' ? 0o755 : 0o644,
    });
  }
}

function sourcePathIsExcluded(relativePath: string): boolean {
  if (relativePath === 'TASK.md') {
    return true;
  }
  return relativePath
    .split('/')
    .some(segment => SOURCE_EXCLUDED_SEGMENTS.has(segment));
}

async function copyPortableTree(
  sourceRoot: string,
  destinationRoot: string,
  excludeSourceArtifacts = false,
): Promise<void> {
  await fsp.mkdir(destinationRoot, {recursive: true});

  async function visit(absoluteDirectory: string, relativeDirectory: string) {
    const entries = await fsp.readdir(absoluteDirectory, {withFileTypes: true});
    entries.sort((left, right) =>
      Buffer.compare(
        Buffer.from(left.name, 'utf8'),
        Buffer.from(right.name, 'utf8'),
      ),
    );
    for (const entry of entries) {
      const relative = relativeDirectory
        ? `${relativeDirectory}/${entry.name}`
        : entry.name;
      if (excludeSourceArtifacts && sourcePathIsExcluded(relative)) {
        continue;
      }
      assertBundlePathV2(relative, 'project source path');
      const source = path.join(absoluteDirectory, entry.name);
      const destination = path.join(destinationRoot, ...relative.split('/'));
      if (entry.isSymbolicLink()) {
        throw new Error(
          `Project source contains unsupported symlink: ${relative}`,
        );
      }
      if (entry.isDirectory()) {
        await fsp.mkdir(destination, {recursive: true});
        await visit(source, relative);
      } else if (entry.isFile()) {
        await fsp.mkdir(path.dirname(destination), {recursive: true});
        await fsp.copyFile(source, destination);
        const mode = (await fsp.stat(source)).mode & 0o777;
        await fsp.chmod(destination, mode);
      } else {
        throw new Error(
          `Project source contains unsupported non-regular entry: ${relative}`,
        );
      }
    }
  }

  await visit(sourceRoot, '');
}

function safeUsageReceipt(runner: ProjectRunnerReceiptV2) {
  return {
    schema: 'ProjectRunnerReceiptV2',
    schemaVersion: 2,
    runner: runner.name,
    status: runner.status,
    startedAt: runner.startedAt,
    finishedAt: runner.finishedAt,
    durationMs: runner.durationMs,
    attempt: runner.attempt ?? 1,
    exitCode: runner.exitCode,
    signal: runner.signal,
    usage: runner.usage,
    toolCalls: runner.toolCalls,
    cliLookups: runner.cliLookups,
    transcriptAudit: {
      passed: runner.transcriptAudit.passed,
      classification: runner.transcriptAudit.classification,
      strictFindingCount: runner.transcriptAudit.strictFindings.length,
      adjustedFindingCount: runner.transcriptAudit.adjustedFindings.length,
    },
  };
}

function executionUsage(runner: ProjectRunnerReceiptV2) {
  const complete =
    runner.usage.inputTokens != null && runner.usage.outputTokens != null;
  return {
    ...(runner.usage.inputTokens == null
      ? {}
      : {inputTokens: runner.usage.inputTokens}),
    ...(runner.usage.outputTokens == null
      ? {}
      : {outputTokens: runner.usage.outputTokens}),
    source: 'producer-runner-receipt',
    complete,
  };
}

function artifactIdentity(parts: string[]): string {
  return `project-${createHash('sha256')
    .update(parts.join('\0'), 'utf8')
    .digest('hex')
    .slice(0, 24)}`;
}

/**
 * Emit a local project artifact.
 *
 * For static, build, and serve recipes, `integrity.viewInput` is the digest of
 * the complete portable `source` tree. Materialization-owned outputs such as
 * `dist` are absent here and are created only later by the shared evaluator.
 */
export async function emitProjectArtifactV2(
  options: EmitProjectArtifactV2Options,
): Promise<VibeArtifactV2> {
  if (fs.existsSync(options.bundleRoot)) {
    throw new Error(`Artifact bundle already exists: ${options.bundleRoot}`);
  }
  const parent = path.dirname(options.bundleRoot);
  const temporary = path.join(
    parent,
    `.${path.basename(options.bundleRoot)}.tmp-${process.pid}-${Date.now()}`,
  );
  await fsp.mkdir(parent, {recursive: true});
  await fsp.rm(temporary, {recursive: true, force: true});
  await fsp.mkdir(path.join(temporary, 'provenance'), {recursive: true});

  try {
    await copyPortableTree(
      options.baselineDir,
      path.join(temporary, 'baseline'),
    );
    await copyPortableTree(
      options.projectDir,
      path.join(temporary, 'source'),
      true,
    );

    const baselineDigest = sha256GitTreeBaselineV2(temporary, 'baseline');
    const sourceDigest = sha256TreeV2(temporary, 'source');
    const promptDigest = sha256TextV2(options.prompt.text);
    const artifactId = artifactIdentity([
      options.prompt.id,
      promptDigest,
      options.deliveryMode,
      options.runner.name,
      options.baselineCommit,
      baselineDigest,
      sourceDigest,
    ]);
    const versions = options.versions ?? PROJECT_PRODUCER_VERSIONS_V2;
    const artifact: VibeArtifactV2 = {
      schema: 'VibeArtifactV2',
      schemaVersion: 2,
      artifactId,
      prompt: {
        id: options.prompt.id,
        digest: {algorithm: 'sha256', value: promptDigest},
      },
      producer: {
        kind: 'project',
        runner: options.runner.name,
        deliveryMode: options.deliveryMode,
      },
      versions,
      source: {
        root: 'source',
        baseline: {
          kind: 'git-tree',
          root: 'baseline',
          digest: {algorithm: 'sha256', value: baselineDigest},
        },
        ...(options.entryHints?.length ? {entryHints: options.entryHints} : {}),
      },
      view: options.view,
      integrity: {
        sourceTree: {algorithm: 'sha256', value: sourceDigest},
        viewInput: {algorithm: 'sha256', value: sourceDigest},
      },
      network: options.network ?? {mode: 'deny', allowedOrigins: []},
      ...(options.states?.length ? {states: options.states} : {}),
      provenance: {
        execution: {
          schemaVersion: 1,
          task: {id: options.prompt.id, sha256: promptDigest},
          fixture: {
            id: options.deliveryMode,
            sha256: baselineDigest,
            commit: options.baselineCommit,
          },
          condition: options.deliveryMode,
          executor: {
            harness: options.runner.harness,
            model: options.runner.model,
            ...(options.runner.effort ? {effort: options.runner.effort} : {}),
            ...(options.runner.harnessVersion
              ? {harnessVersion: options.runner.harnessVersion}
              : {}),
            ...(options.runner.runnerVersion
              ? {runnerVersion: options.runner.runnerVersion}
              : {}),
          },
          execution: {
            status: options.runner.status,
            startedAt: options.runner.startedAt,
            finishedAt: options.runner.finishedAt,
            durationMs: options.runner.durationMs,
            attempt: options.runner.attempt ?? 1,
          },
          usage: executionUsage(options.runner),
          environmentHash: baselineDigest,
        },
        usage: 'provenance/usage.json',
      },
    };

    const parsed = parseVibeArtifactV2(artifact);
    await fsp.writeFile(
      path.join(temporary, 'provenance', 'usage.json'),
      `${JSON.stringify(safeUsageReceipt(options.runner), null, 2)}\n`,
    );
    await fsp.writeFile(
      path.join(temporary, 'artifact.json'),
      `${JSON.stringify(parsed, null, 2)}\n`,
    );
    await fsp.rename(temporary, options.bundleRoot);
    return parsed;
  } catch (error) {
    await fsp.rm(temporary, {recursive: true, force: true});
    throw error;
  }
}
