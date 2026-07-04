#!/usr/bin/env node
/**
 * Package boundary checker — enforces JEDI architecture rules.
 * Graph source of truth: docs/ARCHITECTURE.md
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const packagesDir = join(root, 'packages');

/** Allowed @jedi/* workspace dependencies per package (short names). */
const ALLOWED_DEPS = {
  tokens: [],
  themes: ['tokens'],
  stylex: ['tokens'],
  motion: ['tokens'],
  a11y: ['tokens'],
  foundation: ['stylex', 'tokens'],
  icons: [],
  react: ['foundation', 'icons', 'stylex', 'tokens'],
  patterns: ['foundation', 'react', 'stylex'],
  docs: ['foundation', 'react', 'stylex', 'tokens'],
};

/** Packages that may depend on @jedi/icons (icons consumed only via react). */
const ICON_CONSUMERS = new Set(['react']);

/** Allowed re-export sources per package (short names). */
const ALLOWED_REEXPORTS = {
  react: ['icons'],
};

const FORBIDDEN_ASTRYX = ['@astryxdesign/core', '@astryxdesign/themes', '@astryxdesign/'];
const TOKENS_FORBIDDEN = ['react', '@types/react'];

function getPackageJsons() {
  const results = [];
  for (const name of readdirSync(packagesDir)) {
    const pkgPath = join(packagesDir, name, 'package.json');
    try {
      if (statSync(pkgPath).isFile()) {
        results.push({ name, path: pkgPath, json: JSON.parse(readFileSync(pkgPath, 'utf8')) });
      }
    } catch {
      // skip
    }
  }
  return results;
}

function collectDeps(pkgJson) {
  return {
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
    ...pkgJson.peerDependencies,
  };
}

function jediWorkspaceDeps(deps) {
  return Object.keys(deps).filter((d) => d.startsWith('@jedi/'));
}

function toShortName(jediDep) {
  return jediDep.replace('@jedi/', '');
}

function detectCycles(graph) {
  const visiting = new Set();
  const visited = new Set();
  const cycles = [];

  function dfs(node, path) {
    if (visiting.has(node)) {
      cycles.push([...path, node]);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const dep of graph[node] ?? []) {
      dfs(dep, [...path, node]);
    }
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of Object.keys(graph)) {
    dfs(node, []);
  }
  return cycles;
}

let failed = false;
const packages = getPackageJsons();

for (const pkg of packages) {
  const allowed = ALLOWED_DEPS[pkg.name];
  if (!allowed) {
    console.error(`FAIL [graph]: unknown package @jedi/${pkg.name} — update ALLOWED_DEPS`);
    failed = true;
    continue;
  }

  const deps = collectDeps(pkg.json);
  const jediDeps = jediWorkspaceDeps(deps);

  for (const dep of jediDeps) {
    const short = toShortName(dep);
    if (!allowed.includes(short)) {
      console.error(
        `FAIL [graph]: @jedi/${pkg.name} depends on ${dep} — allowed: [${allowed.join(', ') || 'none'}]`,
      );
      failed = true;
    }
  }

  if (pkg.name === 'tokens') {
    for (const forbidden of TOKENS_FORBIDDEN) {
      if (deps[forbidden]) {
        console.error(`FAIL [tokens-no-react]: @jedi/tokens depends on ${forbidden}`);
        failed = true;
      }
    }
  }

  for (const forbidden of FORBIDDEN_ASTRYX) {
    for (const [dep, version] of Object.entries(deps)) {
      if (dep === forbidden || (forbidden.endsWith('/') && dep.startsWith(forbidden))) {
        console.error(`FAIL [no-astryx-runtime]: @jedi/${pkg.name} depends on ${dep}@${version}`);
        failed = true;
      }
    }
  }

  if (jediDeps.includes('@jedi/icons') && !ICON_CONSUMERS.has(pkg.name)) {
    console.error(`FAIL [icons-consumer]: @jedi/${pkg.name} must not depend on @jedi/icons directly`);
    failed = true;
  }
}

const cycleGraph = {};
for (const [pkg, allowed] of Object.entries(ALLOWED_DEPS)) {
  cycleGraph[pkg] = allowed;
}
const cycles = detectCycles(cycleGraph);
if (cycles.length > 0) {
  for (const cycle of cycles) {
    console.error(`FAIL [cycle]: dependency cycle detected: ${cycle.join(' → ')}`);
  }
  failed = true;
}

for (const pkg of packages) {
  const allowedReexports = ALLOWED_REEXPORTS[pkg.name] ?? [];
  for (const entry of ['src/index.ts', 'src/index.tsx']) {
    const entryPath = join(packagesDir, pkg.name, entry);
    try {
      if (!statSync(entryPath).isFile()) continue;
      const content = readFileSync(entryPath, 'utf8');
      const reexports = content.matchAll(/export\s*\{[^}]*\}\s*from\s*['"](@jedi\/[^'"]+)['"]/g);
      for (const match of reexports) {
        const target = match[1];
        const short = toShortName(target);
        if (!allowedReexports.includes(short)) {
          console.error(`FAIL [public-api]: @jedi/${pkg.name} re-exports from ${target}`);
          failed = true;
        }
      }
    } catch {
      // skip
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('PASS: package boundaries OK');
