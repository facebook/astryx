#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file generate-cli-discovery-hints.mjs
 * @input Core component docs and generated TypeScript declarations
 * @output Deterministic CLI guidance at the top of each agent-readable file
 * @position Build and repository check that keeps the Astryx CLI discoverable
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const CORE_SRC_DIR = path.join(REPO_ROOT, 'packages', 'core', 'src');
const CORE_DIST_DIR = path.join(REPO_ROOT, 'packages', 'core', 'dist');
const EXCLUDED_SEGMENTS = new Set([
  '__generated__',
  'MeerkatStep',
  'single_source',
]);
const GUIDANCE_BLOCK_RE =
  /\/\*\*\r?\n \* Generated CLI guidance for AI agents\. Run:\r?\n[\s\S]*?\r?\n \*\/\r?\n*/g;
const DOC_NAME_RE = /export const docs\s*=\s*\{\s*name:\s*(['"])([^'"]+)\1/;

function walkFiles(dir, accept) {
  const files = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (EXCLUDED_SEGMENTS.has(entry.name)) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, accept));
    } else if (entry.isFile() && accept(entry.name)) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

export function extractComponentName(source, file = 'component doc') {
  const match = source.match(DOC_NAME_RE);
  if (!match) {
    throw new Error(`${file} must export docs with a literal name first`);
  }
  const name = match[2];
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(`${file} has a CLI-unsafe component name: ${name}`);
  }
  return name;
}

function insertGuidance(source, block) {
  const clean = source.replace(GUIDANCE_BLOCK_RE, '');
  const eol = clean.includes('\r\n') ? '\r\n' : '\n';
  const copyright = clean.match(/^\/\/ Copyright[^\r\n]*(?:\r?\n)?/);
  const renderedBlock = block.replaceAll('\n', eol);

  if (!copyright) {
    return `${renderedBlock}${eol}${eol}${clean.replace(/^(?:\r?\n)+/, '')}`;
  }

  const body = clean.slice(copyright[0].length).replace(/^(?:\r?\n)+/, '');
  return `${copyright[0].replace(/\r?\n$/, '')}${eol}${eol}${renderedBlock}${eol}${eol}${body}`;
}

function componentGuidance(name) {
  return [
    '/**',
    ' * Generated CLI guidance for AI agents. Run:',
    ` * \`npx @astryxdesign/cli search ${JSON.stringify(name)}\``,
    ' * for current props, examples, and usage guidance.',
    ' */',
  ].join('\n');
}

function declarationGuidance(searchTerm) {
  return [
    '/**',
    ' * Generated CLI guidance for AI agents. Run:',
    ` * \`npx @astryxdesign/cli search ${JSON.stringify(searchTerm)}\``,
    ' * for current Astryx guidance.',
    ' */',
  ].join('\n');
}

export function renderDocWithGuidance(source, file = 'component doc') {
  return insertGuidance(
    source,
    componentGuidance(extractComponentName(source, file)),
  );
}

export function declarationSearchTerm(relativePath, knownDocNames = new Set()) {
  const parts = relativePath.split(/[\\/]/).filter(Boolean);
  const basename = path.basename(parts.at(-1) ?? '', '.d.ts');
  if (knownDocNames.has(basename)) {
    return basename;
  }
  if (parts.length > 1) {
    return parts[0];
  }
  return 'Astryx';
}

export function renderDeclarationWithGuidance(
  source,
  relativePath,
  knownDocNames,
) {
  return insertGuidance(
    source,
    declarationGuidance(declarationSearchTerm(relativePath, knownDocNames)),
  );
}

function getTargets(distMode) {
  const root = distMode ? CORE_DIST_DIR : CORE_SRC_DIR;
  if (!fs.existsSync(root)) {
    throw new Error(
      distMode
        ? `Missing ${path.relative(REPO_ROOT, root)}. Build core before stamping declarations.`
        : `Missing ${path.relative(REPO_ROOT, root)}.`,
    );
  }

  const docFiles = walkFiles(CORE_SRC_DIR, name => name.endsWith('.doc.mjs'));
  const knownDocNames = new Set(
    docFiles.map(file =>
      extractComponentName(fs.readFileSync(file, 'utf8'), file),
    ),
  );
  const files = distMode
    ? walkFiles(root, name => name.endsWith('.d.ts'))
    : docFiles;

  return files.map(file => ({
    file,
    render: source =>
      distMode
        ? renderDeclarationWithGuidance(
            source,
            path.relative(CORE_DIST_DIR, file),
            knownDocNames,
          )
        : renderDocWithGuidance(source, path.relative(REPO_ROOT, file)),
  }));
}

export function updateGuidance({check = false, dist = false} = {}) {
  const stale = [];
  const targets = getTargets(dist);

  for (const {file, render} of targets) {
    const actual = fs.readFileSync(file, 'utf8');
    const expected = render(actual);
    if (actual === expected) {
      continue;
    }
    stale.push(file);
    if (!check) {
      fs.writeFileSync(file, expected);
    }
  }

  return {stale, total: targets.length};
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const knownArgs = new Set(['--check', '--dist']);
  const unknownArgs = [...args].filter(arg => !knownArgs.has(arg));
  if (unknownArgs.length > 0) {
    throw new Error(`Unknown option: ${unknownArgs.join(', ')}`);
  }

  const check = args.has('--check');
  const dist = args.has('--dist');
  const {stale, total} = updateGuidance({check, dist});
  const target = dist ? 'declaration files' : 'component docs';

  if (check && stale.length > 0) {
    console.error(
      `✗ CLI discovery guidance is stale in ${stale.length} file(s):`,
    );
    for (const file of stale.slice(0, 20)) {
      console.error(`  ${path.relative(REPO_ROOT, file)}`);
    }
    if (stale.length > 20) {
      console.error(`  …and ${stale.length - 20} more file(s).`);
    }
    console.error(
      '\nRun `pnpm generate:cli-discovery-hints` and commit the result.',
    );
    process.exitCode = 1;
    return;
  }

  if (check) {
    console.log(`✓ CLI discovery guidance is current in ${total} ${target}`);
  } else {
    console.log(
      `Updated CLI discovery guidance in ${stale.length} of ${total} ${target}`,
    );
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
