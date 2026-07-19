// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup-forms-environment.mjs
 *
 * Creates isolated project directories for the form-framework vibe test.
 * The DESIGN SYSTEM is constant (Astryx components); only the form framework
 * varies across the four targets: formentor, formisch, tanstack, rhf.
 *
 * Each agent gets its own clone of a project template with the real package
 * contents symlinked into node_modules — so a blank-slate agent discovers the
 * API the same way a real consumer would (package README + types), never from
 * the source repo.
 *
 * Usage:
 *   import {createFormAgentProject} from './setup-forms-environment.mjs';
 *   const dir = createFormAgentProject('formentor', iterDir, 'login-1');
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIBE_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(VIBE_DIR, '../..');
const ENV_TEMPLATES = path.join(VIBE_DIR, 'environments');

function ensureDir(dir) {
  fs.mkdirSync(dir, {recursive: true});
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

/** Symlink a workspace package into the project's node_modules under @astryxdesign. */
function linkScoped(projectDir, scopedName, sourceRel) {
  const link = path.join(projectDir, 'node_modules', '@astryxdesign', scopedName);
  ensureDir(path.dirname(link));
  fs.symlinkSync(path.join(REPO_ROOT, sourceRel), link, 'dir');
}

/** Symlink a hoisted (root node_modules) dependency into the project. */
function linkExternal(projectDir, moduleName) {
  const source = path.join(REPO_ROOT, 'node_modules', moduleName);
  if (!fs.existsSync(source)) return; // resolved via root during tsc/build
  const link = path.join(projectDir, 'node_modules', moduleName);
  ensureDir(path.dirname(link));
  if (!fs.existsSync(link)) fs.symlinkSync(source, link, 'dir');
}

const TEMPLATE_MAP = {
  formentor: 'project-formentor',
  formisch: 'project-formisch',
  tanstack: 'project-tanstack',
  rhf: 'project-rhf',
};

/**
 * Create an isolated project for a single (target, prompt) pair.
 * @param {'formentor'|'formisch'|'tanstack'|'rhf'} target
 * @param {string} iterDir
 * @param {string} promptId
 * @returns {string} absolute project directory
 */
export function createFormAgentProject(target, iterDir, promptId) {
  const template = TEMPLATE_MAP[target];
  if (!template) throw new Error(`Unknown form target: ${target}`);

  const projectDir = path.join(iterDir, 'projects', promptId);
  ensureDir(projectDir);

  // Copy template files (package.json, README).
  const templateDir = path.join(ENV_TEMPLATES, template);
  for (const file of fs.readdirSync(templateDir)) {
    copyFile(path.join(templateDir, file), path.join(projectDir, file));
  }

  // Design system (constant across all targets).
  linkScoped(projectDir, 'core', 'packages/core');
  linkScoped(projectDir, 'cli', 'packages/cli');
  linkScoped(projectDir, 'theme-neutral', 'packages/themes/neutral');

  // astryx CLI bin so `npx astryx` works.
  const binDir = path.join(projectDir, 'node_modules', '.bin');
  ensureDir(binDir);
  fs.symlinkSync(
    path.join(REPO_ROOT, 'packages', 'cli', 'bin', 'astryx.mjs'),
    path.join(binDir, 'astryx'),
    'file',
  );

  // Form framework + its Astryx adapter (the variable under test).
  switch (target) {
    case 'formentor':
      linkScoped(projectDir, 'formentor', 'packages/formentor');
      break;
    case 'formisch':
      linkScoped(projectDir, 'astryx-formisch', 'packages/astryx-formisch');
      linkExternal(projectDir, '@formisch/react');
      linkExternal(projectDir, 'valibot');
      break;
    case 'tanstack':
      linkScoped(projectDir, 'astryx-tanstack', 'packages/astryx-tanstack');
      linkExternal(projectDir, '@tanstack/react-form');
      linkExternal(projectDir, 'zod');
      break;
    case 'rhf':
      linkScoped(projectDir, 'astryx-rhf', 'packages/astryx-rhf');
      linkExternal(projectDir, 'react-hook-form');
      linkExternal(projectDir, '@hookform/resolvers');
      linkExternal(projectDir, 'zod');
      break;
    default:
      break;
  }

  return projectDir;
}
