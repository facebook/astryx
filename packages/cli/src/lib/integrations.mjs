// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration manifest loading for Astryx config.
 *
 * Integrations are package names or direct manifest paths listed in
 * astryx.config.mjs. A manifest can contribute docs/discovery metadata,
 * gap-report/template hooks, upgrade codemods, and post-codemod hooks.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateIntegration} from './config-schema.mjs';

export function isPathSpec(spec) {
  return (
    spec.startsWith('.') ||
    spec.startsWith('/') ||
    spec.endsWith('.mjs') ||
    spec.endsWith('.js')
  );
}

export function resolvePackageDir(packageName, cwd = process.cwd()) {
  return path.resolve(cwd, 'node_modules', ...packageName.split('/'));
}

export function resolveIntegrationFile(spec, cwd = process.cwd()) {
  if (isPathSpec(spec)) {
    return path.resolve(cwd, spec);
  }

  const packageDir = resolvePackageDir(spec, cwd);
  const pkgPath = path.join(packageDir, 'package.json');
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    throw new Error(
      `Could not find installed integration package "${spec}" at ${pkgPath}. Install it first or pass a direct integration file path.`,
    );
  }

  const manifestPath = pkg.astryx?.integration ?? pkg.xds?.integration;
  if (!manifestPath) {
    throw new Error(
      `Package "${spec}" does not declare astryx.integration (or legacy xds.integration) in package.json.`,
    );
  }
  return path.resolve(packageDir, manifestPath);
}

function normalizePackageContribution(integration) {
  const docs = integration.docs;
  if (!docs) return null;
  const packageDir = integration.__packageDir ?? integration.__dir;
  const docsDir = path.resolve(packageDir, docs);
  return {
    name: integration.name ?? integration.__spec,
    version: integration.version,
    description: integration.description,
    displayName: integration.displayName,
    dir: packageDir,
    astryx: {
      docs,
      category: integration.category,
      blocks: integration.blocks,
    },
    category: integration.category ?? integration.name ?? integration.__spec,
    docsDir,
  };
}

function resolveHookFunction(hook, integration) {
  if (typeof hook === 'function') return hook;
  if (typeof hook !== 'string') return hook;
  const [moduleSpec, exportName = 'default'] = hook.split('#');
  return async (...args) => {
    const mod = isPathSpec(moduleSpec)
      ? await import(
          pathToFileURL(path.resolve(integration.__dir, moduleSpec)).href
        )
      : await import(moduleSpec);
    const fn = exportName === 'default' ? mod.default : mod[exportName];
    if (typeof fn !== 'function') {
      throw new Error(
        `Integration hook ${hook} did not resolve to a function.`,
      );
    }
    return fn(...args);
  };
}

export async function loadIntegrations(specs = [], {cwd = process.cwd()} = {}) {
  const integrations = [];
  const seen = new Set();

  for (const spec of specs) {
    if (!spec || seen.has(spec)) continue;
    seen.add(spec);

    const file = resolveIntegrationFile(spec, cwd);
    const mod = await import(pathToFileURL(file).href);
    const exported = mod.default ?? mod.integration ?? mod;
    if (!exported || typeof exported !== 'object') {
      throw new Error(`Integration ${spec} did not export an object.`);
    }
    const integration = validateIntegration(exported, `Integration ${spec}`);

    const integrationDir = path.dirname(file);
    const packageDir = isPathSpec(spec)
      ? integrationDir
      : resolvePackageDir(spec, cwd);
    const normalized = {
      ...integration,
      __file: file,
      __dir: integrationDir,
      __packageDir: packageDir,
      __spec: spec,
    };

    if (Array.isArray(normalized.codemods)) {
      for (const codemod of normalized.codemods) {
        if (typeof codemod.transform === 'string') {
          const transformPath = path.resolve(integrationDir, codemod.transform);
          const transformMod = await import(pathToFileURL(transformPath).href);
          codemod.transform =
            transformMod.default ?? transformMod.transform ?? transformMod;
        }
      }
    }

    normalized.package = normalizePackageContribution(normalized);
    if (
      normalized.gapReport?.command &&
      isPathSpec(normalized.gapReport.command)
    ) {
      normalized.gapReport = {
        ...normalized.gapReport,
        command: path.resolve(packageDir, normalized.gapReport.command),
      };
    }
    if (normalized.template?.get) {
      normalized.template = {
        ...normalized.template,
        get: resolveHookFunction(normalized.template.get, normalized),
      };
    }

    integrations.push(normalized);
  }

  return integrations;
}
