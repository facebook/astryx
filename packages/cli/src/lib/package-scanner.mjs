/**
 * @file Package scanner for config-based discovery
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

export function scanDirectory(scanDir) {
  if (!fs.existsSync(scanDir)) return [];
  const entries = fs.readdirSync(scanDir, {withFileTypes: true});
  const packages = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(scanDir, entry.name, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    let pkg;
    try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')); } catch { continue; }
    if (!pkg.xds || !pkg.xds.docs) continue;
    const pkgDir = path.join(scanDir, entry.name);
    const docsDir = path.resolve(pkgDir, pkg.xds.docs);
    packages.push({
      name: pkg.name || entry.name,
      dir: pkgDir,
      xds: pkg.xds,
      category: pkg.xds.category || pkg.name || entry.name,
      docsDir,
      components: discoverDocComponents(docsDir),
    });
  }
  return packages;
}

export function scanAllPackages(packageDirs) {
  const all = [];
  for (const dir of packageDirs) all.push(...scanDirectory(dir));
  return all;
}

function discoverDocComponents(docsDir) {
  if (!fs.existsSync(docsDir)) return [];
  const components = [];
  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, {withFileTypes: true}); } catch { return; }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.doc.mjs')) components.push(entry.name.replace('.doc.mjs', ''));
    }
  }
  walk(docsDir);
  return components.sort();
}

export function findComponentInPackages(packages, name) {
  const lower = name.toLowerCase();
  for (const pkg of packages) {
    const match = pkg.components.find(c => c.toLowerCase() === lower);
    if (!match) continue;
    const docPath = findDocFile(pkg.docsDir, match);
    if (docPath) return {pkg, docPath, componentName: match};
  }
  return null;
}

function findDocFile(docsDir, name) {
  const target = name + '.doc.mjs';
  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, {withFileTypes: true}); } catch { return null; }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { const f = walk(full); if (f) return f; }
      else if (entry.name === target) return full;
    }
    return null;
  }
  return walk(docsDir);
}
