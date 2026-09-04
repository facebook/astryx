// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Verified-N/A evidence discovery and hashing.
 * @input Component declarations, the discovered source roster, and Storybook's
 *   built story index.
 * @output A deterministic per-component manifest of reviewed source/story files.
 * @position Fail-closed evidence layer for the RTL applicability registry.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  discoverComponents,
  findComponentSource,
} from '../../../packages/cli/foundation/discovery/component-discovery.mjs';

const HASH_RE = /^sha256:[a-f0-9]{64}$/;

function normalizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeRelativePath(projectRoot, filePath) {
  const absolute = path.resolve(projectRoot, filePath);
  const relative = path.relative(projectRoot, absolute);
  if (
    relative === '' ||
    relative === '..' ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`RTL evidence path escapes the repository: ${filePath}`);
  }
  return relative.split(path.sep).join('/');
}

function resolveLocalImport(importer, specifier, ownerRoot) {
  if (!specifier.startsWith('.')) {
    return null;
  }
  const base = path.resolve(path.dirname(importer), specifier);
  const extensions = ['.ts', '.tsx', '.mjs', '.js', '.json', '.css', '.svg'];
  const extension = path.extname(base);
  const candidates = extensions.includes(extension)
    ? [base]
    : [
        base,
        ...extensions.map(candidateExtension => `${base}${candidateExtension}`),
        ...['.ts', '.tsx', '.mjs', '.js'].map(candidateExtension =>
          path.join(base, `index${candidateExtension}`),
        ),
      ];
  return (
    candidates.find(candidate => {
      const relative = path.relative(ownerRoot, candidate);
      return (
        relative !== '..' &&
        !relative.startsWith(`..${path.sep}`) &&
        fs.existsSync(candidate) &&
        fs.statSync(candidate).isFile()
      );
    }) ?? null
  );
}

function collectLocalSourceFiles(projectRoot, sourceAbsolute) {
  const sourceMarker = `${path.sep}src${path.sep}`;
  const sourceMarkerIndex = sourceAbsolute.indexOf(sourceMarker);
  if (sourceMarkerIndex === -1) {
    throw new Error(
      `Component source is outside a package src tree: ${sourceAbsolute}`,
    );
  }
  const packageSrc = sourceAbsolute.slice(
    0,
    sourceMarkerIndex + `${path.sep}src`.length,
  );
  const topLevel = path.relative(packageSrc, sourceAbsolute).split(path.sep)[0];
  const ownerRoot = path.join(packageSrc, topLevel);
  const files = new Set([sourceAbsolute]);
  const importPattern =
    /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g;
  const content = fs.readFileSync(sourceAbsolute, 'utf8');
  for (const match of content.matchAll(importPattern)) {
    const dependency = resolveLocalImport(
      sourceAbsolute,
      match[1] ?? match[2],
      ownerRoot,
    );
    if (dependency != null) {
      files.add(dependency);
    }
  }
  return [...files].map(file => normalizeRelativePath(projectRoot, file));
}

/** Map a built Storybook id to the applicability roster's package/name form. */
export function componentFromStoryId(id) {
  const packageName = id.startsWith('lab-')
    ? 'lab'
    : id.startsWith('core-')
      ? 'core'
      : null;
  if (packageName == null) {
    return null;
  }
  const segment = id.replace(/^(?:core|lab)-/, '').split('--')[0];
  return `${packageName}/${segment}`;
}

/** Discover the canonical Core/Lab source component names. */
export function discoverAuditedSourceComponents(projectRoot) {
  const sourceComponents = [];
  for (const packageName of ['core', 'lab']) {
    const grouped = discoverComponents(
      path.join(projectRoot, 'packages', packageName),
    );
    sourceComponents.push(
      ...Object.values(grouped)
        .flat()
        .map(component => `${packageName}/${component}`),
    );
  }
  return sourceComponents;
}

function storyEvidence({
  component,
  sourcePath,
  storyEntries,
  projectRoot,
  fallbackSymbol,
}) {
  const [packageName, declaredName] = component.split('/');
  const normalizedComponent = normalizeName(declaredName);
  const sourceTopLevel =
    sourcePath == null
      ? ''
      : normalizeName(
          path
            .relative(path.join('packages', packageName, 'src'), sourcePath)
            .split(path.sep)[0],
        );
  const files = new Set();

  for (const entry of storyEntries) {
    if (entry?.type !== 'story' || typeof entry.importPath !== 'string') {
      continue;
    }
    const storyComponent = componentFromStoryId(entry.id);
    if (
      storyComponent == null ||
      !storyComponent.startsWith(`${packageName}/`)
    ) {
      continue;
    }
    const titleLeaf = normalizeName(entry.title?.split('/').at(-1) ?? '');
    const exactSurface =
      storyComponent.toLowerCase() === component.toLowerCase();
    const ownedSurface =
      titleLeaf === normalizedComponent ||
      (sourceTopLevel !== '' && titleLeaf === sourceTopLevel) ||
      (sourceTopLevel !== '' &&
        titleLeaf.length > sourceTopLevel.length &&
        normalizedComponent.startsWith(titleLeaf));
    if (exactSurface || ownedSurface) {
      files.add(
        path.posix.join(
          'apps/storybook',
          entry.importPath.replace(/^\.\//, ''),
        ),
      );
    }
  }

  if (files.size === 0 && fallbackSymbol !== '') {
    const escapedSymbol = fallbackSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const symbolPattern = new RegExp(`\\b${escapedSymbol}\\b`);
    for (const entry of storyEntries) {
      if (entry?.type !== 'story' || typeof entry.importPath !== 'string') {
        continue;
      }
      const storyComponent = componentFromStoryId(entry.id);
      if (
        storyComponent == null ||
        !storyComponent.startsWith(`${packageName}/`)
      ) {
        continue;
      }
      const storyPath = path.posix.join(
        'apps/storybook',
        entry.importPath.replace(/^\.\//, ''),
      );
      const normalized = normalizeRelativePath(projectRoot, storyPath);
      if (
        symbolPattern.test(
          fs.readFileSync(path.join(projectRoot, normalized), 'utf8'),
        )
      ) {
        files.add(normalized);
      }
    }
  }

  return files;
}

/** Resolve the source and owned story files one declaration reviewed. */
export function evidenceFilesForDeclaration({
  declaration,
  projectRoot,
  sourceComponents,
  storyEntries,
}) {
  const [packageName, declaredName] = declaration.component.split('/');
  const canonicalComponent = sourceComponents.find(
    component =>
      component.toLowerCase() === declaration.component.toLowerCase(),
  );
  const canonicalName = canonicalComponent?.split('/').at(-1) ?? declaredName;
  const packageRoot = path.join(projectRoot, 'packages', packageName);
  const sourceAbsolute = fs.existsSync(path.join(packageRoot, 'src'))
    ? findComponentSource(packageRoot, canonicalName)
    : null;
  const sourcePath =
    sourceAbsolute == null
      ? null
      : normalizeRelativePath(projectRoot, sourceAbsolute);
  const files = storyEvidence({
    component: declaration.component,
    sourcePath,
    storyEntries,
    projectRoot,
    fallbackSymbol: sourceAbsolute == null ? '' : canonicalName,
  });
  if (sourceAbsolute != null) {
    for (const sourceFile of collectLocalSourceFiles(
      projectRoot,
      sourceAbsolute,
    )) {
      files.add(sourceFile);
    }
  }
  return [...files].sort();
}

function hashFile(projectRoot, relativePath) {
  const normalized = normalizeRelativePath(projectRoot, relativePath);
  const absolute = path.resolve(projectRoot, normalized);
  if (!fs.statSync(absolute).isFile()) {
    throw new Error(`RTL evidence is not a file: ${normalized}`);
  }
  return `sha256:${crypto
    .createHash('sha256')
    .update(fs.readFileSync(absolute))
    .digest('hex')}`;
}

/** Build the current path→digest evidence manifest for every declaration. */
export function buildCurrentVerifiedNaEvidence({
  declarations,
  projectRoot,
  sourceComponents,
  storyEntries,
}) {
  const evidenceByComponent = new Map();
  const errors = [];
  for (const declaration of declarations) {
    if (typeof declaration?.component !== 'string') {
      continue;
    }
    try {
      const files = evidenceFilesForDeclaration({
        declaration,
        projectRoot,
        sourceComponents,
        storyEntries,
      });
      if (files.length === 0) {
        throw new Error(
          `${declaration.component} has no discoverable source or story evidence`,
        );
      }
      evidenceByComponent.set(
        declaration.component.toLowerCase(),
        Object.fromEntries(
          files.map(file => [file, hashFile(projectRoot, file)]),
        ),
      );
    } catch (error) {
      errors.push(String(error));
    }
  }
  return {evidenceByComponent, errors};
}

/** Validate authored declaration shape before trusting any row. */
export function validateVerifiedNaRegistry(
  declarations,
  {requireEvidence = true} = {},
) {
  const errors = [];
  const seen = new Set();
  for (const [index, declaration] of declarations.entries()) {
    const label = declaration?.component ?? `row ${index + 1}`;
    if (
      typeof declaration?.component !== 'string' ||
      !/^(?:core|lab)\/[A-Za-z0-9-]+$/.test(declaration.component)
    ) {
      errors.push(`${label}: component must be a Core/Lab roster id`);
      continue;
    }
    const key = declaration.component.toLowerCase();
    if (seen.has(key)) {
      errors.push(`${declaration.component}: duplicate declaration`);
    }
    seen.add(key);
    if (
      typeof declaration.reason !== 'string' ||
      declaration.reason.trim() === ''
    ) {
      errors.push(`${declaration.component}: reason must be non-empty`);
    }
    if (!requireEvidence) {
      continue;
    }
    if (
      declaration.evidence == null ||
      typeof declaration.evidence !== 'object' ||
      Array.isArray(declaration.evidence) ||
      Object.keys(declaration.evidence).length === 0
    ) {
      errors.push(`${declaration.component}: evidence manifest is required`);
      continue;
    }
    for (const [file, hash] of Object.entries(declaration.evidence)) {
      if (
        file === '' ||
        path.isAbsolute(file) ||
        file === '..' ||
        file.startsWith('../') ||
        file.includes('/../')
      ) {
        errors.push(`${declaration.component}: invalid evidence path ${file}`);
      }
      if (typeof hash !== 'string' || !HASH_RE.test(hash)) {
        errors.push(
          `${declaration.component}: invalid evidence digest for ${file}`,
        );
      }
    }
  }
  return errors;
}
