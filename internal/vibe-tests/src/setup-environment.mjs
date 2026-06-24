#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup-environment.mjs
 *
 * Creates isolated project directories for vibe test agents.
 * Each agent gets its own clone of the project template with
 * real package contents symlinked in.
 *
 * Templates live in environments/ — named generically so agent
 * prompts don't leak what system is being tested.
 *
 * Usage (from setup-nightly.mjs):
 *   import {createAgentProject} from './setup-environment.mjs';
 *   const projectDir = createAgentProject('xds', iterDir, 'fwc-1');
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

/**
 * Create an isolated project directory for a single agent.
 * Returns the absolute path to the project directory.
 *
 * @param {'xds' | 'xds-tailwind' | 'baseline' | 'html'} target
 * @param {string} iterDir - The iteration results directory
 * @param {string} promptId - The prompt ID (used to name the clone)
 */
export function createAgentProject(target, iterDir, promptId) {
  const projectDir = path.join(iterDir, 'projects', promptId);
  ensureDir(projectDir);

  const templateMap = {
    xds: 'project-xds',
    'xds-tailwind': 'project-xds-tailwind',
    baseline: 'project-baseline',
    html: 'project-html',
  };
  const template = templateMap[target];
  if (!template) throw new Error(`Unknown target: ${target}`);

  // Copy template files (package.json, README, globals.css, etc.)
  const templateDir = path.join(ENV_TEMPLATES, template);
  for (const file of fs.readdirSync(templateDir)) {
    copyFile(path.join(templateDir, file), path.join(projectDir, file));
  }

  if (target === 'xds' || target === 'xds-tailwind') {
    // Symlink node_modules/@astryxdesign/core → packages/core
    const coreLink = path.join(projectDir, 'node_modules', '@astryxdesign', 'core');
    ensureDir(path.dirname(coreLink));
    fs.symlinkSync(path.join(REPO_ROOT, 'packages', 'core'), coreLink, 'dir');

    // Symlink node_modules/@astryxdesign/cli → packages/cli
    const cliLink = path.join(projectDir, 'node_modules', '@astryxdesign', 'cli');
    fs.symlinkSync(path.join(REPO_ROOT, 'packages', 'cli'), cliLink, 'dir');

    // Symlink node_modules/@astryxdesign/theme-default → packages/themes/default
    const themeDefaultLink = path.join(projectDir, 'node_modules', '@astryxdesign', 'theme-default');
    fs.symlinkSync(path.join(REPO_ROOT, 'packages', 'themes', 'default'), themeDefaultLink, 'dir');

    // Symlink node_modules/.bin/astryx → cli bin so npx astryx works
    const binDir = path.join(projectDir, 'node_modules', '.bin');
    ensureDir(binDir);
    fs.symlinkSync(path.join(REPO_ROOT, 'packages', 'cli', 'bin', 'astryx.mjs'), path.join(binDir, 'astryx'), 'file');
  }

  if (target === 'baseline') {
    // Symlink components/ui/ → .baseline/components/ui
    const uiLink = path.join(projectDir, 'components', 'ui');
    ensureDir(path.dirname(uiLink));
    fs.symlinkSync(path.join(VIBE_DIR, '.baseline', 'components', 'ui'), uiLink, 'dir');

    // Symlink lib/ → .baseline/lib
    const libLink = path.join(projectDir, 'lib');
    fs.symlinkSync(path.join(VIBE_DIR, '.baseline', 'lib'), libLink, 'dir');

    // Copy baseline README
    const readme = path.join(VIBE_DIR, '.baseline', 'README.md');
    if (fs.existsSync(readme)) {
      copyFile(readme, path.join(projectDir, 'README.md'));
    }
  }

  // HTML gets just package.json — no libraries, no docs

  return projectDir;
}
