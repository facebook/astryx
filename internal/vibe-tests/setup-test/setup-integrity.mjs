#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Read-only integrity analysis for a setup-test sandbox.
 *
 * The wholesale-replacement guard rejects a modified host source or stylesheet
 * when at least 20 baseline lines and 80% of that file's baseline lines were
 * deleted. Both conditions are required so a small, legitimate rewrite does not
 * look the same as replacing an established host file.
 *
 * Deletion is counted on *substantive* lines, not raw diff lines. Wrapping a
 * component tree in a provider re-indents every line inside it, which a raw
 * `git diff` reports as deleting and re-adding the whole body even though not
 * one line of content is gone. Each line is therefore normalized — leading and
 * trailing whitespace trimmed, interior whitespace runs collapsed to a single
 * space — and a baseline line counts as deleted only when no line of the
 * current file still carries its content.
 *
 * Normalization is deliberately per line and never collapses line boundaries or
 * removes whitespace between tokens, so it cannot be used to hide a rewrite:
 * minifying a file onto one line, or stripping the spaces inside its lines,
 * leaves nothing that matches the baseline and still trips the guard.
 */

import * as crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

export const WHOLESALE_REPLACEMENT_THRESHOLD = Object.freeze({
  minimumDeletedLines: 20,
  deletedFraction: 0.8,
});

const HOST_SOURCE_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.less',
  '.mjs',
  '.pcss',
  '.sass',
  '.scss',
  '.svelte',
  '.ts',
  '.tsx',
  '.vue',
]);

const ESCAPE_HATCHES = [
  {
    kind: 'hardcoded-important',
    pattern: /!\s*important\b/i,
    message: 'added a hardcoded !important declaration',
  },
  {
    kind: 'blanket-reset',
    pattern: /\ball\s*:\s*(?:unset|initial|revert)\b/i,
    message: 'added a blanket all-property reset',
  },
  {
    kind: 'dark-mode-disabled',
    pattern:
      /\bcolor-scheme\s*:\s*(?:only\s+light|light\s+only|light(?=\s*[;}]))\b|\bforcedTheme\s*=\s*["']light["']|\bdarkMode\s*[:=]\s*(?:false|["'](?:disabled|off|light)["'])|<meta\b[^>]*\bname\s*=\s*["']color-scheme["'][^>]*\bcontent\s*=\s*["']light(?:\s+only)?["']/i,
    message: 'explicitly disabled dark-mode behavior',
  },
];

const compareText = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

function git(appDir, args, options = {}) {
  return execFileSync('git', ['-C', appDir, ...args], {
    encoding: options.encoding ?? 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function assertRepositoryRoot(appDir) {
  const root = path.resolve(
    git(appDir, ['rev-parse', '--show-toplevel']).trim(),
  );
  const requested = fs.realpathSync(appDir);
  const actual = fs.realpathSync(root);
  if (requested !== actual) {
    throw new Error(`--app must name the sandbox repository root: ${appDir}`);
  }
  git(appDir, ['rev-parse', '--verify', 'HEAD']);
}

function trackedPatch(appDir) {
  return git(
    appDir,
    [
      '-c',
      'core.quotePath=false',
      'diff',
      '--binary',
      '--full-index',
      '--no-color',
      '--no-ext-diff',
      '--no-textconv',
      '--no-renames',
      'HEAD',
      '--',
    ],
    {encoding: 'buffer'},
  );
}

function untrackedPaths(appDir) {
  const output = git(appDir, [
    '-c',
    'core.quotePath=false',
    'ls-files',
    '--others',
    '--exclude-standard',
    '-z',
  ]);
  return output.split('\0').filter(Boolean).sort(compareText);
}

function untrackedEntry(appDir, relativePath) {
  const absolutePath = path.join(appDir, relativePath);
  const stat = fs.lstatSync(absolutePath);
  if (stat.isSymbolicLink()) {
    return {
      bytes: Buffer.from(fs.readlinkSync(absolutePath)),
      mode: '120000',
      binary: false,
    };
  }
  const bytes = fs.readFileSync(absolutePath);
  return {
    bytes,
    mode: stat.mode & 0o111 ? '100755' : '100644',
    binary: bytes.includes(0),
  };
}

function updateFramed(hash, label, bytes) {
  const content = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  hash.update(`${label}\0${content.length}\0`);
  hash.update(content);
  hash.update('\0');
}

function digestDiff(patch, untracked) {
  const hash = crypto.createHash('sha256');
  updateFramed(hash, 'format', 'setup-integrity-v1');
  updateFramed(hash, 'tracked-diff', patch);
  for (const file of untracked) {
    updateFramed(hash, 'untracked-path', file.path);
    updateFramed(hash, 'untracked-mode', file.mode);
    updateFramed(hash, 'untracked-content', file.bytes);
  }
  return hash.digest('hex');
}

function lineCount(bytes) {
  if (bytes.length === 0) return 0;
  let count = 0;
  for (const byte of bytes) {
    if (byte === 10) count += 1;
  }
  return count + (bytes.at(-1) === 10 ? 0 : 1);
}

function trackedNumstat(appDir) {
  const output = git(appDir, [
    'diff',
    '--numstat',
    '-z',
    '--no-renames',
    'HEAD',
    '--',
  ]);
  return output
    .split('\0')
    .filter(Boolean)
    .map(record => {
      const firstTab = record.indexOf('\t');
      const secondTab = record.indexOf('\t', firstTab + 1);
      const addedText = record.slice(0, firstTab);
      const deletedText = record.slice(firstTab + 1, secondTab);
      return {
        path: record.slice(secondTab + 1),
        added: addedText === '-' ? 0 : Number(addedText),
        deleted: deletedText === '-' ? 0 : Number(deletedText),
        binary: addedText === '-' || deletedText === '-',
      };
    });
}

function baselineBytes(appDir, relativePath) {
  return git(appDir, ['show', `HEAD:${relativePath}`], {encoding: 'buffer'});
}

/**
 * Collapse a line to the content a reader would compare by eye: no leading or
 * trailing whitespace, and every interior run of whitespace as a single space.
 *
 * Runs collapse to one space rather than to nothing, so `label="Deploy"` and
 * `label = "Deploy"` are the same line while `a b` and `ab` are not.
 */
function normalizeLine(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Count how many of a file's baseline lines no longer appear anywhere in its
 * current content, comparing lines after whitespace normalization and ignoring
 * blank lines. Re-indenting a file therefore deletes nothing, while replacing
 * its content deletes all of it.
 */
export function substantiveLineDelta(baselineText, currentText) {
  const remaining = new Map();
  for (const line of currentText.split('\n')) {
    const normalized = normalizeLine(line);
    if (normalized === '') continue;
    remaining.set(normalized, (remaining.get(normalized) ?? 0) + 1);
  }

  let baselineLines = 0;
  let deletedLines = 0;
  for (const line of baselineText.split('\n')) {
    const normalized = normalizeLine(line);
    if (normalized === '') continue;
    baselineLines += 1;
    const available = remaining.get(normalized) ?? 0;
    if (available > 0) remaining.set(normalized, available - 1);
    else deletedLines += 1;
  }

  return {
    baselineLines,
    deletedLines,
    deletedFraction: baselineLines === 0 ? 0 : deletedLines / baselineLines,
  };
}

function isHostSource(relativePath) {
  return HOST_SOURCE_EXTENSIONS.has(path.extname(relativePath).toLowerCase());
}

function addedLinesFromPatch(patch) {
  const lines = [];
  let newLine = 0;
  for (const line of patch.split('\n')) {
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (line.startsWith('+++')) continue;
    if (line.startsWith('+')) {
      lines.push({line: newLine, text: line.slice(1)});
      newLine += 1;
    } else if (!line.startsWith('-') && !line.startsWith('\\ No newline')) {
      newLine += 1;
    }
  }
  return lines;
}

function trackedAddedLines(appDir, relativePath) {
  const patch = git(appDir, [
    '-c',
    'core.quotePath=false',
    'diff',
    '--unified=0',
    '--no-color',
    '--no-ext-diff',
    '--no-textconv',
    '--no-renames',
    'HEAD',
    '--',
    relativePath,
  ]);
  return addedLinesFromPatch(patch);
}

function removedLinesFromPatch(patch) {
  const lines = [];
  let oldLine = 0;
  for (const line of patch.split('\n')) {
    const hunk = line.match(/^@@ -(\d+)(?:,\d+)? \+\d+(?:,\d+)? @@/);
    if (hunk) {
      oldLine = Number(hunk[1]);
      continue;
    }
    if (line.startsWith('---')) continue;
    if (line.startsWith('-')) {
      lines.push({line: oldLine, text: line.slice(1)});
      oldLine += 1;
    } else if (!line.startsWith('+') && !line.startsWith('\\ No newline')) {
      oldLine += 1;
    }
  }
  return lines;
}

function trackedRemovedLines(appDir, relativePath) {
  const patch = git(appDir, [
    '-c',
    'core.quotePath=false',
    'diff',
    '--unified=0',
    '--no-color',
    '--no-ext-diff',
    '--no-textconv',
    '--no-renames',
    'HEAD',
    '--',
    relativePath,
  ]);
  return removedLinesFromPatch(patch);
}

function untrackedAddedLines(file) {
  if (file.binary) return [];
  return file.bytes
    .toString('utf8')
    .split('\n')
    .map((text, index) => ({line: index + 1, text}));
}

function evidenceFor(relativePath, lines) {
  const evidence = [];
  for (const added of lines) {
    if (/@astryxdesign\//.test(added.text)) {
      evidence.push({
        path: relativePath,
        line: added.line,
        kind: /(?:^|\s)(?:import|require\s*\()/.test(added.text)
          ? 'code-import'
          : /(?:\.css|theme\.css)/.test(added.text)
            ? 'stylesheet-import'
            : 'package-reference',
        text: added.text.trim(),
      });
    }
  }
  return evidence;
}

function findingsFor(relativePath, lines) {
  const findings = [];
  for (const added of lines) {
    for (const escapeHatch of ESCAPE_HATCHES) {
      if (escapeHatch.pattern.test(added.text)) {
        findings.push({
          kind: escapeHatch.kind,
          path: relativePath,
          line: added.line,
          message: escapeHatch.message,
        });
      }
    }
  }
  return findings;
}

/**
 * Analyze the working tree relative to its committed pre-agent HEAD.
 * This function only invokes read-only Git commands and reads file bytes.
 */
export function analyzeSetupIntegrity(appDir, attestedDiffSha256) {
  const resolvedAppDir = path.resolve(appDir);
  assertRepositoryRoot(resolvedAppDir);

  const patch = trackedPatch(resolvedAppDir);
  const untracked = untrackedPaths(resolvedAppDir).map(relativePath => ({
    path: relativePath,
    ...untrackedEntry(resolvedAppDir, relativePath),
  }));
  const untrackedByPath = new Map(untracked.map(file => [file.path, file]));
  const tracked = trackedNumstat(resolvedAppDir);
  const changedFiles = [];
  const escapeHatches = [];
  const astryxEvidence = [];

  for (const file of tracked) {
    const absolutePath = path.join(resolvedAppDir, file.path);
    const existedAtBaseline = (() => {
      try {
        baselineBytes(resolvedAppDir, file.path);
        return true;
      } catch {
        return false;
      }
    })();
    const existsNow = fs.existsSync(absolutePath);
    const status = !existedAtBaseline
      ? 'added'
      : !existsNow
        ? 'deleted'
        : 'modified';
    changedFiles.push({
      path: file.path,
      status,
      tracked: true,
      added: file.added,
      deleted: file.deleted,
      binary: file.binary,
    });

    if (status === 'deleted' && isHostSource(file.path)) {
      escapeHatches.push({
        kind: 'deleted-host-source',
        path: file.path,
        line: null,
        message: 'deleted a host source or stylesheet file',
      });
      continue;
    }

    if (status === 'modified' && isHostSource(file.path) && !file.binary) {
      const currentSource = fs.readFileSync(absolutePath, 'utf8');
      const {baselineLines, deletedLines, deletedFraction} =
        substantiveLineDelta(
          baselineBytes(resolvedAppDir, file.path).toString('utf8'),
          currentSource,
        );
      if (
        deletedLines >= WHOLESALE_REPLACEMENT_THRESHOLD.minimumDeletedLines &&
        deletedFraction >= WHOLESALE_REPLACEMENT_THRESHOLD.deletedFraction
      ) {
        escapeHatches.push({
          kind: 'wholesale-replacement',
          path: file.path,
          line: null,
          message: 'replaced most of an established host source or stylesheet',
          baselineLines,
          deletedLines,
          deletedFraction,
          rawDeletedLines: file.deleted,
        });
      } else if (
        path.extname(file.path).toLowerCase() === '.css' &&
        deletedFraction >= WHOLESALE_REPLACEMENT_THRESHOLD.deletedFraction
      ) {
        escapeHatches.push({
          kind: 'neutralized-host-css',
          path: file.path,
          line: null,
          message: 'removed most of an established host stylesheet',
          baselineLines,
          deletedLines,
          deletedFraction,
          rawDeletedLines: file.deleted,
        });
      }

      const removedModeLines = trackedRemovedLines(
        resolvedAppDir,
        file.path,
      ).filter(removed =>
        /\b(?:dark|color-scheme|data-theme)\b/i.test(removed.text),
      );
      if (
        removedModeLines.length > 0 &&
        !/\b(?:dark|color-scheme|data-theme)\b/i.test(currentSource)
      ) {
        escapeHatches.push({
          kind: 'dark-mode-removed',
          path: file.path,
          line: removedModeLines[0].line,
          message: 'removed the host dark-mode behavior',
        });
      }
    }

    if (file.path === '.gitignore' && status !== 'added') {
      escapeHatches.push({
        kind: 'gitignore-modified',
        path: file.path,
        line: null,
        message: 'modified ignore rules after the execution baseline',
      });
    }
    if (status !== 'deleted' && !file.binary) {
      const addedLines = trackedAddedLines(resolvedAppDir, file.path);
      if (isHostSource(file.path)) {
        escapeHatches.push(...findingsFor(file.path, addedLines));
      }
      astryxEvidence.push(...evidenceFor(file.path, addedLines));
    }
  }

  for (const file of untracked) {
    const added = file.binary ? 0 : lineCount(file.bytes);
    changedFiles.push({
      path: file.path,
      status: 'untracked',
      tracked: false,
      added,
      deleted: 0,
      binary: file.binary,
    });
    const addedLines = untrackedAddedLines(untrackedByPath.get(file.path));
    if (isHostSource(file.path)) {
      escapeHatches.push(...findingsFor(file.path, addedLines));
    }
    astryxEvidence.push(...evidenceFor(file.path, addedLines));
  }

  changedFiles.sort((left, right) => compareText(left.path, right.path));
  escapeHatches.sort(
    (left, right) =>
      compareText(left.path, right.path) ||
      (left.line ?? -1) - (right.line ?? -1) ||
      compareText(left.kind, right.kind),
  );
  astryxEvidence.sort(
    (left, right) =>
      compareText(left.path, right.path) ||
      left.line - right.line ||
      compareText(left.kind, right.kind),
  );

  const diffSha256 = digestDiff(patch, untracked);
  const attestationProvided = typeof attestedDiffSha256 === 'string';
  const attestationMatches =
    attestationProvided && attestedDiffSha256 === diffSha256;
  const rejectionReasons = escapeHatches.map(finding => finding.kind);
  if (astryxEvidence.length === 0)
    rejectionReasons.push('missing-astryx-usage');
  if (!attestationProvided) rejectionReasons.push('missing-attestation');
  else if (!attestationMatches) rejectionReasons.push('attestation-mismatch');

  return {
    schemaVersion: 1,
    diffSha256,
    changedFiles,
    counts: {
      files: changedFiles.length,
      added: changedFiles.reduce((sum, file) => sum + file.added, 0),
      deleted: changedFiles.reduce((sum, file) => sum + file.deleted, 0),
    },
    astryxUsage: {
      found: astryxEvidence.length > 0,
      evidence: astryxEvidence,
    },
    escapeHatches,
    wholesaleReplacementThreshold: WHOLESALE_REPLACEMENT_THRESHOLD,
    attestation: {
      provided: attestationProvided,
      expectedSha256: attestedDiffSha256 ?? null,
      matches: attestationMatches,
    },
    accepted: rejectionReasons.length === 0,
    rejectionReasons: [...new Set(rejectionReasons)].sort(compareText),
  };
}

function parseCli(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument !== '--app' && argument !== '--attested-diff-sha256') {
      throw new Error(
        'usage: setup-integrity.mjs --app <sandbox> [--attested-diff-sha256 <sha256>]',
      );
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`missing value for ${argument}`);
    }
    parsed[argument.slice(2)] = value;
    index += 1;
  }
  if (!parsed.app) {
    throw new Error(
      'usage: setup-integrity.mjs --app <sandbox> [--attested-diff-sha256 <sha256>]',
    );
  }
  return parsed;
}

const isMain =
  process.argv[1] != null &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const args = parseCli(process.argv.slice(2));
  const result = analyzeSetupIntegrity(
    path.resolve(args.app),
    args['attested-diff-sha256'],
  );
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
