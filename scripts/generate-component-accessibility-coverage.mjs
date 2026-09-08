#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(
  ROOT,
  'packages/core/src/accessibility/generatedThemeCoverage.mjs',
);
const GENERATE_COMMAND = 'pnpm generate:component-accessibility-coverage';
const EXPORT_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const RESERVED_EXPORT_NAMES = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);

export function renderGeneratedSource(coverage) {
  if (
    coverage == null ||
    typeof coverage !== 'object' ||
    Array.isArray(coverage)
  ) {
    throw new TypeError('Generated accessibility coverage must be an object');
  }
  const exports = Object.entries(coverage)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([exportName, componentCoverage]) => {
      if (
        !EXPORT_NAME.test(exportName) ||
        RESERVED_EXPORT_NAMES.has(exportName)
      ) {
        throw new Error(
          `Invalid generated accessibility coverage export: ${exportName}`,
        );
      }
      if (!Array.isArray(componentCoverage)) {
        throw new TypeError(
          `Accessibility coverage export ${exportName} must be an array`,
        );
      }
      const serialized = JSON.stringify(componentCoverage, null, 2);
      if (serialized === undefined) {
        throw new TypeError(
          `Accessibility coverage export ${exportName} is not serializable`,
        );
      }
      return `/** @type {import('@astryxdesign/cli/authoring').ComponentAccessibilityThemeCoverage[]} */\nexport const ${exportName} = ${serialized};`;
    })
    .join('\n\n');
  return `// Copyright (c) Meta Platforms, Inc. and affiliates.\n\n// AUTO-GENERATED — do not edit manually.\n// Source: scripts/accessibility/component-audit-registry.mjs\n// Run: ${GENERATE_COMMAND}\n\n${exports}\n`;
}

function readOutput(output) {
  try {
    return fs.readFileSync(output, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

export function writeGeneratedCoverage(output, next) {
  if (readOutput(output) === next) return false;

  fs.mkdirSync(path.dirname(output), {recursive: true});
  const temporaryDirectory = fs.mkdtempSync(
    path.join(path.dirname(output), `.${path.basename(output)}.`),
  );
  const temporaryOutput = path.join(temporaryDirectory, path.basename(output));
  try {
    fs.writeFileSync(temporaryOutput, next, 'utf8');
    fs.renameSync(temporaryOutput, output);
  } finally {
    fs.rmSync(temporaryDirectory, {recursive: true, force: true});
  }
  return true;
}

export async function runGenerator(
  argv,
  {
    coverage,
    output = OUTPUT,
    stdout = process.stdout,
    stderr = process.stderr,
  } = {},
) {
  const check = argv.length === 1 && argv[0] === '--check';
  if (argv.length !== 0 && !check) {
    stderr.write(`Usage: ${GENERATE_COMMAND} [--check]\n`);
    return 2;
  }

  const generatedCoverage =
    coverage ??
    (
      await import('./accessibility/component-audit-registry.mjs')
    ).buildRegisteredAccessibilityCoverage();
  const next = renderGeneratedSource(generatedCoverage);
  const relativeOutput = path.relative(ROOT, output);
  if (check) {
    const current = readOutput(output);
    if (current !== next) {
      stderr.write(
        `Component accessibility coverage is ${current == null ? 'missing' : 'stale'}:\n` +
          `  target: ${relativeOutput}\n` +
          `  regenerate: ${GENERATE_COMMAND}\n`,
      );
      return 1;
    }
    stdout.write(
      `Component accessibility coverage is current: ${relativeOutput}\n`,
    );
    return 0;
  }

  const changed = writeGeneratedCoverage(output, next);
  stdout.write(`${changed ? 'Generated' : 'Unchanged'} ${relativeOutput}\n`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = await runGenerator(process.argv.slice(2));
}
