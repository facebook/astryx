// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Resolve explicit changed-component scope for fast PR accessibility.
 * @input Exact PR analysis and the canonical component package registry
 * @output Qualified component filters; an empty set never means a full audit
 * @position PR-only projection; exhaustive accessibility belongs to release-check
 */

import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import componentPackages from '../../scripts/component-packages.cjs';
import {buildStoryComponentRoutes} from '../../apps/storybook/rtl-audit/rtl-audit-coverage.mjs';
import storyIdentity from './lib/a11y-story-identity.js';

const {
  componentPackage,
  componentExportsFromBarrel,
  documentedComponentNames,
  COMPONENT_PACKAGES,
  flatPackageComponentNames,
  nestedPackageComponentNames,
} = componentPackages;

export function readPrA11yRoutes(repoRoot) {
  const index = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'apps/storybook/dist/index.json'),
      'utf8',
    ),
  );
  const entries = index.entries ?? index.stories;
  if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
    throw new Error('PR accessibility requires a valid Storybook index');
  }
  const stories = Object.entries(entries)
    .filter(([, story]) => story.type === 'story')
    .map(([id, story]) => ({id, title: story.title}));
  if (stories.length === 0)
    throw new Error('PR accessibility requires runnable stories');
  const publicComponentsByPackage = Object.fromEntries(
    COMPONENT_PACKAGES.map(pkg => [
      pkg.name,
      pkg.layout === 'flat'
        ? flatPackageComponentNames(repoRoot, pkg)
        : nestedPackageComponentNames(repoRoot, pkg),
    ]),
  );
  const targets = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'apps/storybook/rtl-audit/targets.json'),
      'utf8',
    ),
  );
  return buildStoryComponentRoutes({
    stories,
    targets,
    publicComponentsByPackage,
  }).map(route => ({
    ...route,
    component: storyIdentity.ownerForA11yStory(route.id) ?? route.component,
  }));
}

export function resolvePrA11yComponents(
  analysis,
  repoRoot = process.cwd(),
  routes = null,
) {
  if (analysis?.diffMode !== 'three-dot') {
    throw new Error(
      'PR accessibility requires exact three-dot component analysis',
    );
  }
  for (const key of [
    'newComponentOwners',
    'modifiedComponentOwners',
    'unresolvedComponentSources',
  ]) {
    if (
      !Array.isArray(analysis[key]) ||
      analysis[key].some(value => typeof value !== 'string')
    ) {
      throw new Error(`PR accessibility requires explicit ${key}`);
    }
  }
  const owners = new Set([
    ...analysis.newComponentOwners,
    ...analysis.modifiedComponentOwners,
  ]);
  for (const owner of owners) {
    const [packageName, name, extra] = owner.split('/');
    if (
      extra !== undefined ||
      !componentPackage(packageName) ||
      !/^[A-Z][A-Za-z0-9]*$/.test(name ?? '')
    ) {
      throw new Error(`Invalid package-qualified component owner: ${owner}`);
    }
  }
  // Analysis deliberately leaves multi-component folders (such as Chat)
  // unresolved. Expand only that changed folder, not the whole package roster.
  for (const source of analysis.unresolvedComponentSources) {
    const [packageName, directory, extra] = source.split('/');
    const pkg = componentPackage(packageName);
    if (
      !pkg ||
      extra !== undefined ||
      !/^[A-Za-z0-9_.-]+$/.test(directory ?? '') ||
      ['.', '..'].includes(directory)
    ) {
      throw new Error(`Invalid unresolved component source: ${source}`);
    }
    const sourceRoot = path.join(repoRoot, pkg.src);
    const changedDirectory = path.join(sourceRoot, directory);
    const names = documentedComponentNames(changedDirectory);
    if (names.length === 0) continue;
    const exports = componentExportsFromBarrel(
      path.join(sourceRoot, 'index.ts'),
      sourceRoot,
    );
    for (const name of names) {
      const implementation = exports.get(name);
      // A doc can mention a dependency such as Avatar; it does not make that
      // component part of the changed folder's scope.
      if (implementation?.startsWith(`${changedDirectory}${path.sep}`)) {
        routes ??= readPrA11yRoutes(repoRoot);
        const owner = `${packageName}/${name}`;
        const umbrella = `${packageName}/${directory}`;
        if (routes.some(route => route.component === owner)) {
          owners.add(owner);
        } else if (routes.some(route => route.component === umbrella)) {
          // Some grouped exports are exercised only by their family's stories.
          owners.add(umbrella);
        } else {
          throw new Error(
            `No scoped Storybook route for ${owner} or ${umbrella}`,
          );
        }
      }
    }
  }
  return [...owners].sort();
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const analysis = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  console.log(resolvePrA11yComponents(analysis).join(','));
}
