// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared fixtures for the package-set runtime tests: package roots and
 * caller projects laid out the way a host and a consumer lay them out.
 *
 * Every fixture lives under the system temp dir, outside the checkout, so no
 * walk up from a fixture project (for a lockfile, a package manager, a
 * workspace, or a Core) reaches the repository's own files. Callers' projects
 * also sit five directories below the fixture base, so the CLI's bounded walk
 * for a Core stays inside the fixture: a Core the tests see came from the
 * package set or the project.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {CLI_ROOT} from '../../fs/paths.mjs';

/** The repository's own Core and CLI packages, linked into fixture roots. */
export const REPO_CORE = path.resolve(CLI_ROOT, '..', 'core');
export const REPO_CLI = CLI_ROOT;

/**
 * @param {string} file
 * @param {unknown} value
 */
export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

/**
 * A docs topic whose description names the package version that ships it, so
 * a test can tell which copy of a package served a run.
 * @param {string} name
 * @param {string} description
 */
export function topicSource(name, description) {
  const doc = {
    type: 'generic',
    name,
    title: name,
    description,
    category: 'guide',
    sections: [
      {title: 'Overview', content: [{type: 'prose', text: description}]},
    ],
  };
  return `export const docs = ${JSON.stringify(doc, null, 2)};\n`;
}

/**
 * @typedef {object} FixturePackage
 * @property {string} version
 * @property {string} [topic] docs topic name the integration contributes
 * @property {string} [manifestExtra] extra source appended to the manifest
 *   module (named exports such as `discover`)
 * @property {boolean} [integration] ships a manifest (default true)
 */

/**
 * Install a fixture package under `<hostDir>/node_modules/<name>`.
 * @param {string} hostDir
 * @param {string} name
 * @param {FixturePackage} pkg
 * @returns {string} the package directory
 */
export function installFixturePackage(hostDir, name, pkg) {
  const dir = path.join(hostDir, 'node_modules', ...name.split('/'));
  writeJson(path.join(dir, 'package.json'), {name, version: pkg.version});
  if (pkg.integration !== false) {
    const manifest = pkg.topic ? {docs: './docs'} : {};
    fs.writeFileSync(
      path.join(dir, 'astryx.integration.mjs'),
      `export default ${JSON.stringify(manifest)};\n${pkg.manifestExtra ?? ''}`,
    );
  }
  if (pkg.topic) {
    fs.mkdirSync(path.join(dir, 'docs'), {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'docs', `${pkg.topic}.doc.mjs`),
      topicSource(pkg.topic, `${name} ${pkg.version}`),
    );
  }
  return dir;
}

/**
 * Link a real package directory into `<hostDir>/node_modules/<name>`.
 * @param {string} hostDir
 * @param {string} name
 * @param {string} target
 */
export function linkPackage(hostDir, name, target) {
  const dir = path.join(hostDir, 'node_modules', ...name.split('/'));
  fs.mkdirSync(path.dirname(dir), {recursive: true});
  fs.symlinkSync(target, dir, 'dir');
  return dir;
}

/**
 * A package root: a directory whose node_modules holds this CLI, the
 * repository's Core (unless `core: false`), and the given fixture packages,
 * with a package.json declaring all of them.
 * @param {string} dir
 * @param {{packages?: Record<string, FixturePackage>, core?: boolean, cli?: boolean}} [options]
 * @returns {string} dir
 */
export function makeRoot(dir, {packages = {}, core = true, cli = true} = {}) {
  fs.mkdirSync(path.join(dir, 'node_modules'), {recursive: true});
  /** @type {Record<string, string>} */
  const dependencies = {};
  if (cli) {
    linkPackage(dir, '@astryxdesign/cli', REPO_CLI);
    dependencies['@astryxdesign/cli'] = readVersion(REPO_CLI);
  }
  if (core) {
    linkPackage(dir, '@astryxdesign/core', REPO_CORE);
    dependencies['@astryxdesign/core'] = readVersion(REPO_CORE);
  }
  for (const [name, pkg] of Object.entries(packages)) {
    installFixturePackage(dir, name, pkg);
    dependencies[name] = pkg.version;
  }
  writeJson(path.join(dir, 'package.json'), {
    name: 'hosted-package-set',
    private: true,
    dependencies,
  });
  return dir;
}

/** @param {string} dir */
export function readVersion(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'))
    .version;
}

/**
 * A fresh fixture area. `base` is a temp dir; `project(name)` returns a
 * caller project directory five levels below it; `bare()` returns an empty
 * directory with no package.json at or above it.
 * @param {string} label
 */
export function fixtureArea(label) {
  const base = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), `astryx-${label}-`)),
  );
  /** @type {string[]} */
  const extra = [];
  return {
    base,
    /** @param {string} name */
    project(name, fields = {}) {
      const dir = path.join(base, 'w', 'x', 'y', 'z', name);
      writeJson(path.join(dir, 'package.json'), {name, ...fields});
      return dir;
    },
    bare() {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), `astryx-${label}-`));
      extra.push(dir);
      return dir;
    },
    cleanup() {
      fs.rmSync(base, {recursive: true, force: true});
      for (const dir of extra) fs.rmSync(dir, {recursive: true, force: true});
    },
  };
}
