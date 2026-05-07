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
    if (!pkg.xds || (!pkg.xds.docs && !pkg.xds.themes)) continue;
    const pkgDir = path.join(scanDir, entry.name);
    const docsDir = pkg.xds.docs ? path.resolve(pkgDir, pkg.xds.docs) : null;
    const components = docsDir ? discoverDocComponents(docsDir) : [];

    let themes = [];
    let themesReadme = null;
    if (pkg.xds.themes) {
      const themesDir = path.resolve(pkgDir, pkg.xds.themes);
      themes = discoverThemes(themesDir);
      themesReadme = readThemesReadme(themesDir);
    }

    if (components.length === 0 && themes.length === 0) continue;
    packages.push({
      name: pkg.name || entry.name,
      version: pkg.version,
      description: pkg.description,
      displayName: pkg.displayName,
      dir: pkgDir,
      xds: pkg.xds,
      category: pkg.xds.category || pkg.name || entry.name,
      docsDir,
      components,
      themes,
      themesReadme,
    });
  }
  return packages;
}

export function scanAllPackages(packageDirs) {
  const all = [];
  const seen = new Set();
  for (const dir of packageDirs) {
    for (const pkg of scanDirectory(dir)) {
      if (seen.has(pkg.name)) continue;
      seen.add(pkg.name);
      all.push(pkg);
    }
  }
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

const THEME_FILE_RE = /^(.+)Theme\.(ts|js|mjs)$/;

export function isThemeDir(dir) {
  try {
    const entries = fs.readdirSync(dir);
    return entries.some(e => THEME_FILE_RE.test(e));
  } catch { return false; }
}

export function findThemeSource(dir) {
  try {
    const entries = fs.readdirSync(dir);
    const match = entries.find(e => THEME_FILE_RE.test(e));
    return match ? path.join(dir, match) : null;
  } catch { return null; }
}

export function extractThemeName(dir) {
  try {
    const entries = fs.readdirSync(dir);
    const match = entries.find(e => THEME_FILE_RE.test(e));
    if (!match) return null;
    const m = match.match(THEME_FILE_RE);
    return m ? m[1] : null;
  } catch { return null; }
}

export function findBuiltTheme(dir) {
  let builtPath = null;
  let cssPath = null;
  try {
    const entries = fs.readdirSync(dir);
    const jsFile = entries.find(e => /Theme\.js$/.test(e) || /Theme\.mjs$/.test(e));
    const cssFile = entries.find(e => /Theme\.css$/.test(e) || e.endsWith('.css'));
    if (jsFile) builtPath = path.join(dir, jsFile);
    if (cssFile) cssPath = path.join(dir, cssFile);
  } catch { /* ignore */ }
  return {builtPath, cssPath};
}

export function discoverThemes(themesDir) {
  if (!fs.existsSync(themesDir)) return [];

  // If the directory itself contains a theme file, treat as single theme
  if (isThemeDir(themesDir)) {
    const name = extractThemeName(themesDir);
    const source = findThemeSource(themesDir);
    const {builtPath, cssPath} = findBuiltTheme(themesDir);
    if (name) {
      return [{name, dir: themesDir, source, builtPath, cssPath}];
    }
  }

  // Otherwise scan subdirectories
  const themes = [];
  let entries;
  try { entries = fs.readdirSync(themesDir, {withFileTypes: true}); } catch { return []; }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const subDir = path.join(themesDir, entry.name);
    if (!isThemeDir(subDir)) continue;
    const name = extractThemeName(subDir);
    const source = findThemeSource(subDir);
    const {builtPath, cssPath} = findBuiltTheme(subDir);
    if (name) {
      themes.push({name, dir: subDir, source, builtPath, cssPath});
    }
  }
  return themes.sort((a, b) => a.name.localeCompare(b.name));
}

export function readThemesReadme(themesDir) {
  const readmePath = path.join(themesDir, 'README.md');
  try {
    return fs.readFileSync(readmePath, 'utf-8');
  } catch { return null; }
}
