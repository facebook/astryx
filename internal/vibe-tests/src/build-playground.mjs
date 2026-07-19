#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-playground.mjs
 *
 * Builds the data the interactive playground consumes:
 *   1. For each (prompt x framework) result .tsx, writes a thin wrapper entry
 *      module under app/.playground/<framework>/<promptId>.tsx that re-exports
 *      the solution's component as `default` (originals stay untouched — honesty).
 *   2. Emits app/.playground/manifest.json:
 *        { prompts: [{id, category, prompt}],
 *          frameworks: ['formentor','formisch','tanstack','rhf'],
 *          solutions: { '<promptId>': { '<framework>': {code, entry, compileClean, componentName} } } }
 *
 * Usage: node internal/vibe-tests/src/build-playground.mjs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIBE_DIR = path.resolve(__dirname, '..');
const APP_DIR = path.join(VIBE_DIR, 'app');
const OUT_DIR = path.join(APP_DIR, '.playground');

// Frozen iteration IDs from the CORE baseline run.
const ITERATIONS = {
  formentor: '4161d911',
  formisch: '2ace5eb3',
  tanstack: 'a8f0e5a5',
  rhf: 'f4518df8',
};
const FRAMEWORKS = Object.keys(ITERATIONS);

function loadForms() {
  const data = JSON.parse(
    fs.readFileSync(path.join(VIBE_DIR, 'test-sets', 'forms.json'), 'utf-8'),
  );
  return data.prompts.filter((p) => p.tier === 'core');
}

function loadBuildErrors(iterId) {
  const p = path.join(VIBE_DIR, 'results', iterId, 'build-errors.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

/** Detect the single exported React component name (default or named). */
function detectComponent(code) {
  const def = code.match(/export\s+default\s+function\s+([A-Z][A-Za-z0-9]*)/);
  if (def) return {name: def[1], isDefault: true};
  const defConst = code.match(/export\s+default\s+([A-Z][A-Za-z0-9]*)\s*;/);
  if (defConst) return {name: defConst[1], isDefault: true};
  const named = code.match(/export\s+(?:function|const)\s+([A-Z][A-Za-z0-9]*)/);
  if (named) return {name: named[1], isDefault: false};
  // bare `export default () => ...` or anonymous
  if (/export\s+default/.test(code)) return {name: null, isDefault: true};
  return null;
}

function ensureDir(d) {
  fs.mkdirSync(d, {recursive: true});
}

function main() {
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, {recursive: true, force: true});
  ensureDir(OUT_DIR);

  const prompts = loadForms();
  const solutions = {};
  let wrapped = 0;
  let missing = 0;

  for (const fw of FRAMEWORKS) {
    const iterId = ITERATIONS[fw];
    const buildErrors = loadBuildErrors(iterId);
    const fwDir = path.join(OUT_DIR, fw);
    ensureDir(fwDir);

    for (const prompt of prompts) {
      const srcPath = path.join(
        VIBE_DIR, 'results', iterId, 'results', `${prompt.id}.tsx`,
      );
      solutions[prompt.id] = solutions[prompt.id] ?? {};
      if (!fs.existsSync(srcPath)) {
        missing++;
        continue;
      }
      const code = fs.readFileSync(srcPath, 'utf-8');
      const comp = detectComponent(code);
      const compileClean = buildErrors[prompt.id]?.buildSuccess ?? null;

      // Relative import path from the wrapper to the original result file.
      const rel = path
        .relative(fwDir, srcPath)
        .split(path.sep)
        .join('/');

      // Wrapper re-exports the component as default without touching the original.
      let wrapperBody;
      if (comp?.isDefault) {
        wrapperBody = `export {default} from '${rel}';\n`;
      } else if (comp?.name) {
        wrapperBody = `export {${comp.name} as default} from '${rel}';\n`;
      } else {
        wrapperBody = `export {default} from '${rel}';\n`;
      }
      const wrapperName = `${prompt.id}.tsx`;
      fs.writeFileSync(
        path.join(fwDir, wrapperName),
        `// Auto-generated playground entry — re-exports the frozen solution.\n${wrapperBody}`,
      );
      wrapped++;

      solutions[prompt.id][fw] = {
        code,
        entry: `./.playground/${fw}/${prompt.id}.tsx`,
        componentName: comp?.name ?? null,
        compileClean,
      };
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    frameworks: FRAMEWORKS,
    prompts: prompts.map((p) => ({
      id: p.id,
      category: p.category,
      prompt: p.prompt,
    })),
    solutions,
  };
  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`Playground data built:`);
  console.log(`  ${prompts.length} prompts x ${FRAMEWORKS.length} frameworks`);
  console.log(`  ${wrapped} wrapper entries written, ${missing} missing`);
  console.log(`  manifest: ${path.join(OUT_DIR, 'manifest.json')}`);
}

main();
