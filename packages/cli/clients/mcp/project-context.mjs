// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The consumer project's own facts, read once at startup.
 *
 * This is the only thing a local MCP server can do that the hosted one at
 * `/mcp` structurally cannot. That server reads registries frozen into its
 * bundle at deploy time and never touches the caller's filesystem, so it
 * answers for the version the docsite shipped with — not the version the
 * project installed.
 *
 * Theme and install state come from `runChecks` (the `doctor` engine, which is
 * documented read-only) rather than being re-derived here, so this cannot drift
 * away from what `astryx doctor` reports.
 *
 * @input a consumer project directory
 * @output the installed core version, wired theme, and configured integrations
 * @position packages/cli/clients/mcp — project awareness, consumed at handshake
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {runChecks} from '../../api/doctor/doctor.mjs';
import {Project} from '../../foundation/config/project.mjs';
import {findCoreDir} from '../../foundation/fs/paths.mjs';

/**
 * What the server knows about the project it was started in.
 * @typedef {object} ProjectContext
 * @property {string} cwd
 * @property {string|null} coreVersion installed core version, null when absent
 * @property {{status: string, message: string}|null} theme doctor's theme finding
 * @property {string[]} integrations configured integration package names
 * @property {string|null} configPath resolved astryx.config.*, when present
 */

/**
 * Read the installed core's version. Deliberately NOT `getXdsVersion`, which
 * falls back to the CLI's own version when core is missing — here "absent" must
 * stay distinguishable from "installed", or the server would report a version
 * the project does not have.
 * @param {string|null} coreDir
 * @returns {string|null}
 */
function readCoreVersion(coreDir) {
  if (!coreDir) return null;
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(coreDir, 'package.json'), 'utf-8'),
    );
    return typeof pkg.version === 'string' ? pkg.version : null;
  } catch {
    return null;
  }
}

/**
 * The version of `@astryxdesign/core` installed in this project, or null.
 * @param {string} cwd
 * @returns {string|null}
 */
export function readInstalledCoreVersion(cwd) {
  return readCoreVersion(findCoreDir(cwd));
}

/**
 * Gather the project's facts. Best-effort throughout: a server that refuses to
 * start because a project is misconfigured is worse than one that says so.
 * @param {string} cwd
 * @returns {Promise<ProjectContext>}
 */
export async function loadProjectContext(cwd) {
  const coreVersion = readInstalledCoreVersion(cwd);

  /** @type {string[]} */
  let integrations = [];
  /** @type {string|null} */
  let configPath = null;
  try {
    const project = await Project.load(cwd);
    integrations = project.integrations ?? [];
    configPath = project.configPath;
  } catch {
    // A broken or duplicated config is reported by `doctor`, not by refusing
    // to serve.
  }

  /** @type {{status: string, message: string}|null} */
  let theme = null;
  try {
    const report = await runChecks({cwd});
    const check = report.checks.find(c => c.id === 'themes');
    if (check) theme = {status: check.status, message: check.message};
  } catch {
    // Same policy: diagnostics are advisory here.
  }

  return {cwd, coreVersion, theme, integrations, configPath};
}

/**
 * Render the context as MCP `instructions` — the field a client shows the model
 * once per session. Putting it here rather than in a third tool keeps the tool
 * surface identical to the shipped hosted server (search + get) while still
 * telling the model which version it is answering for.
 * @param {ProjectContext} context
 * @returns {string}
 */
export function renderInstructions(context) {
  const lines = [
    'Astryx design system, answering for THIS project rather than the latest published docs.',
    '',
    `Project: ${context.cwd}`,
    // Be blunt when core is missing. api/search throws "Could not find
    // @astryxdesign/core package" before it reads any bundled doc, so BOTH
    // tools hard-fail; promising a fallback would send the model down a path
    // that always errors.
    context.coreVersion
      ? `@astryxdesign/core: ${context.coreVersion} (installed)`
      : '@astryxdesign/core: NOT installed here, so search and get cannot answer. ' +
        'Install it, or use the hosted server at https://astryx.atmeta.com/mcp instead.',
  ];

  if (context.theme) lines.push(`Theme: ${context.theme.message}`);
  if (context.configPath) lines.push(`Config: ${context.configPath}`);
  if (context.integrations.length > 0) {
    lines.push(`Integrations: ${context.integrations.join(', ')}`);
  }

  lines.push(
    '',
    'Use search(query) to find components, hooks, doc topics and templates, then',
    'get(name) for full detail. Prefer these over recalled API knowledge: they read',
    'the version installed here, which may differ from the latest release.',
  );

  return lines.join('\n');
}
