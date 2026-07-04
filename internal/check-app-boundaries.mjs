#!/usr/bin/env node
/**
 * App boundary checker — compliance apps consume only allowed public APIs.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appsDir = join(root, 'apps');

/** Allowed @jedi/* dependencies for compliance apps (short names). */
const COMPLIANCE_APPS = {
  examples: ['foundation', 'react', 'themes', 'motion'],
  'docs-app': ['foundation', 'react', 'themes', 'patterns', 'docs'],
};

const FORBIDDEN_LAYER = new Set(['tokens', 'stylex']);

function getAppPackageJsons() {
  const results = [];
  for (const name of readdirSync(appsDir)) {
    const pkgPath = join(appsDir, name, 'package.json');
    try {
      if (statSync(pkgPath).isFile()) {
        results.push({ name, json: JSON.parse(readFileSync(pkgPath, 'utf8')) });
      }
    } catch {
      // skip
    }
  }
  return results;
}

function collectDeps(pkgJson) {
  return { ...pkgJson.dependencies, ...pkgJson.devDependencies };
}

function toShortName(jediDep) {
  return jediDep.replace('@jedi/', '');
}

let failed = false;

for (const app of getAppPackageJsons()) {
  const allowed = COMPLIANCE_APPS[app.name];
  if (!allowed) {
    console.log(`SKIP [app]: ${app.name} — not a compliance target`);
    continue;
  }

  const deps = collectDeps(app.json);
  const jediDeps = Object.keys(deps).filter((d) => d.startsWith('@jedi/'));

  for (const dep of jediDeps) {
    const short = toShortName(dep);
    if (FORBIDDEN_LAYER.has(short)) {
      console.error(`FAIL [app-layer]: ${app.name} must not depend on @jedi/${short}`);
      failed = true;
    }
    if (!allowed.includes(short)) {
      console.error(
        `FAIL [app-graph]: ${app.name} depends on @jedi/${short} — allowed: [${allowed.join(', ')}]`,
      );
      failed = true;
    }
  }

  const srcDir = join(appsDir, app.name, 'src');
  try {
    for (const file of readdirSync(srcDir)) {
      if (!/\.(tsx?)$/.test(file)) continue;
      const content = readFileSync(join(srcDir, file), 'utf8');
      for (const forbidden of FORBIDDEN_LAYER) {
        if (content.includes(`'@jedi/${forbidden}'`) || content.includes(`"@jedi/${forbidden}"`)) {
          console.error(`FAIL [app-import]: ${app.name}/src/${file} imports @jedi/${forbidden}`);
          failed = true;
        }
      }
    }
  } catch {
    // no src
  }
}

if (failed) process.exit(1);
console.log('PASS: app boundaries OK');
