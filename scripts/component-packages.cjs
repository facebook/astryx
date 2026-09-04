// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module, require */

/**
 * @file Shared registry of component-bearing Astryx packages and their layouts.
 * @input Repository package names, source roots, and public-component layout.
 * @output Package metadata and public flat-package component discovery helpers.
 * @position Single registry used by audit rosters, sandbox data, and knowledge paths.
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * Component-bearing packages covered by both the audit roster and component
 * knowledge records. This is the one package/layout registry for those systems.
 *
 * `nested`: packages/<name>/src/<Component>/<Component>.tsx and .spec.md.
 * `flat`: packages/<name>/src/<Component>.tsx and <Component>.spec.md; only
 * public PascalCase TSX modules exported from src/index.ts enter the roster.
 */
const COMPONENT_PACKAGES = Object.freeze([
  {
    name: 'core',
    src: 'packages/core/src',
    layout: 'nested',
    storyPrefix: 'core-',
  },
  {
    name: 'lab',
    src: 'packages/lab/src',
    layout: 'nested',
    storyPrefix: 'lab-',
  },
  {
    name: 'charts',
    src: 'packages/charts/src',
    layout: 'flat',
    storyPrefix: 'charts-',
  },
  {
    name: 'richtext',
    src: 'packages/richtext/src',
    layout: 'flat',
    storyPrefix: 'richtext-',
  },
  {
    name: 'vega',
    src: 'packages/vega/src',
    layout: 'flat',
    storyPrefix: 'vega-',
  },
]);

const COMPONENT_PACKAGE_NAMES = Object.freeze(
  COMPONENT_PACKAGES.map(pkg => pkg.name),
);

const STORY_PACKAGE_PREFIXES = Object.freeze(
  Object.fromEntries(COMPONENT_PACKAGES.map(pkg => [pkg.storyPrefix, pkg.name])),
);

function componentPackage(name) {
  return COMPONENT_PACKAGES.find(pkg => pkg.name === name) ?? null;
}

function exportedComponentNames(sourceDir) {
  let barrel;
  try {
    barrel = fs.readFileSync(path.join(sourceDir, 'index.ts'), 'utf8');
  } catch {
    return [];
  }

  const names = new Set();
  const namedExportPattern =
    /export\s*\{([^}]*)\}\s*from\s*['"]\.\/([A-Z][A-Za-z0-9]*)['"]/gms;
  for (const match of barrel.matchAll(namedExportPattern)) {
    const [, exportsList, moduleName] = match;
    const exportedNames = exportsList.split(',').map(value => {
      const parts = value
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/);
      return parts.at(-1);
    });
    if (
      exportedNames.includes(moduleName) &&
      fs.existsSync(path.join(sourceDir, `${moduleName}.tsx`))
    ) {
      names.add(moduleName);
    }
  }

  const starExportPattern =
    /export\s*\*\s*from\s*['"]\.\/([A-Z][A-Za-z0-9]*)['"]/gm;
  for (const match of barrel.matchAll(starExportPattern)) {
    const moduleName = match[1];
    if (fs.existsSync(path.join(sourceDir, `${moduleName}.tsx`))) {
      names.add(moduleName);
    }
  }
  return [...names].sort();
}

function flatPackageComponentNames(repoRoot, packageConfig) {
  return exportedComponentNames(path.join(repoRoot, packageConfig.src));
}

function nestedPackageComponentNames(repoRoot, packageConfig) {
  const srcDir = path.join(repoRoot, packageConfig.src);
  let entries;
  try {
    entries = fs.readdirSync(srcDir, {withFileTypes: true});
  } catch {
    return [];
  }

  const names = new Set();
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^[A-Z]/.test(entry.name)) continue;
    const componentDir = path.join(srcDir, entry.name);
    const files = fs.readdirSync(componentDir, {withFileTypes: true});
    if (!files.some(file => file.isFile() && /^[A-Z][A-Za-z0-9]*\.tsx$/.test(file.name))) {
      continue;
    }

    // Preserve the established aggregate audit unit for every component root.
    names.add(entry.name);

    // Add separately documented public members such as TourStep and
    // TransferListSelector. Requiring a matching TSX file prevents prop names and
    // prose examples in the doc source from becoming roster rows.
    for (const doc of files.filter(file => file.isFile() && file.name.endsWith('.doc.mjs'))) {
      const content = fs.readFileSync(path.join(componentDir, doc.name), 'utf8');
      for (const match of content.matchAll(/\bname:\s*['"]([A-Z][A-Za-z0-9]*)['"]/g)) {
        const publicName = match[1];
        if (fs.existsSync(path.join(componentDir, `${publicName}.tsx`))) {
          names.add(publicName);
        }
      }
    }
  }
  return [...names].sort();
}

function packageHasPublicComponent(repoRoot, packageName, componentName) {
  const packageConfig = componentPackage(packageName);
  if (!packageConfig) return false;
  if (packageConfig.layout === 'flat') {
    return flatPackageComponentNames(repoRoot, packageConfig).includes(
      componentName,
    );
  }
  return fs.existsSync(path.join(repoRoot, packageConfig.src, componentName));
}

module.exports = {
  COMPONENT_PACKAGES,
  COMPONENT_PACKAGE_NAMES,
  STORY_PACKAGE_PREFIXES,
  componentPackage,
  flatPackageComponentNames,
  nestedPackageComponentNames,
  packageHasPublicComponent,
};
