// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Generate the Core component-doc snapshot shipped with the CLI.
 *
 * The snapshot lets documentation-only component reads work when a consuming
 * project loads Core from a CDN instead of installing @astryxdesign/core. Core
 * remains authoritative whenever it is installed locally.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  CORE_PACKAGE,
  discoverComponents,
  findComponentReadme,
  resolveImportPath,
} from '../foundation/discovery/component-discovery.mjs';
import {loadComponentDoc} from '../foundation/discovery/component-loader.mjs';

/**
 * Scope a parent component doc to one of its documented sub-components.
 * @param {any} docs
 * @param {string} name
 * @returns {any|null}
 */
function scopeSubComponentDoc(docs, name) {
  const requestedXDS = `XDS${name}`;
  const isParentDoc =
    docs.name && docs.name.toLowerCase() !== name.toLowerCase();
  const matchingComponent =
    isParentDoc && docs.components
      ? docs.components.find(
          (/** @type {any} */ component) =>
            component.name === requestedXDS || component.name === name,
        )
      : null;
  if (!matchingComponent) return null;
  /** @type {any} */
  const scoped = {
    name,
    description: matchingComponent.description,
    props: matchingComponent.props,
    components: [matchingComponent],
    parentDoc: docs.name,
    import: resolveImportPath(CORE_ROOT, name),
  };
  if (docs.usage) scoped.usage = docs.usage;
  if (docs.theming) scoped.theming = docs.theming;
  return scoped;
}

const CLI_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const REPO_ROOT = path.resolve(CLI_ROOT, '../..');
const CORE_ROOT = path.join(REPO_ROOT, 'packages/core');
const OUTPUT = path.join(CLI_ROOT, 'assets/generated/core-component-docs.json');
const CHECK = process.argv.includes('--check');

/** @param {string} file */
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const cliVersion = readJson(path.join(CLI_ROOT, 'package.json')).version;
const coreVersion = readJson(path.join(CORE_ROOT, 'package.json')).version;
if (cliVersion !== coreVersion) {
  throw new Error(
    `Cannot bundle Core docs: CLI ${cliVersion} and Core ${coreVersion} are not version-matched.`,
  );
}

const groups = discoverComponents(CORE_ROOT);
const names = [...new Set(Object.values(groups).flat())].sort();
const moduleCache = new Map();

/**
 * @param {string} docPath
 * @param {'en'|'zh'|'dense'} lang
 */
async function load(docPath, lang) {
  const key = `${docPath}\0${lang}`;
  if (!moduleCache.has(key)) {
    moduleCache.set(
      key,
      loadComponentDoc(docPath, lang === 'en' ? {} : {lang}),
    );
  }
  return moduleCache.get(key);
}

/**
 * @param {string} name
 * @param {'en'|'zh'|'dense'} lang
 */
async function detail(name, lang) {
  const docPath = findComponentReadme(CORE_ROOT, name);
  if (!docPath) throw new Error(`No component doc found for ${name}`);
  const loaded = await load(docPath, lang);
  const scoped = scopeSubComponentDoc(loaded, name) ?? loaded;
  return {
    ...scoped,
    package: CORE_PACKAGE,
    import: scoped.import ?? resolveImportPath(CORE_ROOT, name),
    // The snapshot intentionally ships docs, not swizzleable component source.
    sourceAvailable: false,
  };
}

/** @type {Record<string, any>} */
const components = {};
for (const name of names) {
  components[name] = {
    en: await detail(name, 'en'),
    zh: await detail(name, 'zh'),
    dense: await detail(name, 'dense'),
  };
}

const generated = `${JSON.stringify({version: coreVersion, groups, components})}\n`;

if (CHECK) {
  const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : '';
  if (current !== generated) {
    console.error(
      'Bundled Core component docs are stale. Run `pnpm -F @astryxdesign/cli bundle:core-docs`.',
    );
    process.exitCode = 1;
  }
} else {
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  fs.writeFileSync(OUTPUT, generated);
  console.log(
    `Generated ${names.length} bundled Core component docs for ${coreVersion}.`,
  );
}
