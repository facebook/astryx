// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration authoring diagnostics against the built-in Core catalog.
 *
 * Components and templates may intentionally share a Core identity, but
 * unqualified lookup then fails closed and callers must select the package.
 * Docs have explicit `replaces` / `extends` relationships, so the check can
 * distinguish intentional ownership from an accidental same-name shadow.
 */

import {Project} from '../../foundation/config/project.mjs';
import {getCliInvocation} from '../../foundation/env/package-manager.mjs';
import {findCoreDir} from '../../foundation/fs/paths.mjs';
import {
  ComponentCatalog,
  discoverIntegrationComponentContributions,
} from '../../foundation/discovery/component-catalog.mjs';
import {
  discoverBuiltinTopics,
  discoverIntegrationDocs,
} from '../../foundation/discovery/docs-discovery.mjs';
import {
  discoverCoreTemplates,
  discoverIntegrationTemplatesForOne,
} from '../../foundation/discovery/template-adapter.mjs';
import {
  validateInstalledIntegration,
  validateLocalIntegration,
} from './validate-integration.mjs';

/** @param {string} value */
export function shellArg(value) {
  if (/^[A-Za-z0-9@/._-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/**
 * Resolve one local or installed integration for an authoring check.
 * @param {string | undefined} pkg
 * @param {string} cwd
 */
async function resolveIntegration(pkg, cwd) {
  return pkg
    ? validateInstalledIntegration(pkg, cwd)
    : validateLocalIntegration(cwd);
}

/**
 * Add discovery errors once to an issue list.
 * @param {Array<{code: string, severity: 'warning' | 'error', message: string}>} issues
 * @param {Array<{message: string} | Error>} errors
 * @param {string} code
 */
function addErrors(issues, errors, code) {
  for (const error of errors) {
    const message = error.message;
    if (issues.some(issue => issue.code === code && issue.message === message)) {
      continue;
    }
    issues.push({code, severity: 'error', message});
  }
}

/**
 * Find integration template ids that are also owned by Core.
 * @param {string} [pkg] Installed integration package; omit for the local package.
 * @param {import('./authoring-checks.type.mjs').IntegrationAuthoringOptions} [options]
 * @returns {Promise<import('./authoring-checks.type.mjs').IntegrationTemplateConflictResponse>}
 */
export async function integrationTemplateConflicts(pkg, options = {}) {
  const {cwd = process.cwd()} = options;
  const resolved = await resolveIntegration(pkg, cwd);
  const name = resolved.found ? (resolved.name ?? null) : null;
  const version = resolved.found ? (resolved.version ?? null) : null;
  const issues = [...resolved.issues];

  if (!resolved.integration?.templates || name == null) {
    return {
      type: 'integration.template-conflicts',
      data: {name, version, conflicts: [], issues},
    };
  }

  const [{templates, errors}, coreTemplates] = await Promise.all([
    discoverIntegrationTemplatesForOne(resolved.integration),
    discoverCoreTemplates(),
  ]);
  addErrors(issues, errors, 'invalid_template');

  /** @type {Map<string, Array<{type: 'page' | 'block', name: string}>>} */
  const coreById = new Map();
  for (const template of coreTemplates) {
    const matches = coreById.get(template.dirName) ?? [];
    matches.push({type: template.type, name: template.name});
    coreById.set(template.dirName, matches);
  }
  for (const matches of coreById.values()) {
    matches.sort((a, b) =>
      `${a.type}:${a.name}`.localeCompare(`${b.type}:${b.name}`),
    );
  }

  const run = getCliInvocation(cwd);
  const conflicts = templates
    .flatMap(template => {
      const coreMatches = coreById.get(template.dirName);
      if (!coreMatches) return [];
      const command = `${run} template ${shellArg(template.dirName)} --package ${shellArg(name)}`;
      const coreKinds = coreMatches
        .map(match => `${match.type} "${match.name}"`)
        .join(', ');
      return [
        {
          id: template.dirName,
          severity: /** @type {const} */ ('warning'),
          integrationPackage: name,
          integrationType: template.type,
          integrationName: template.name,
          coreMatches,
          message:
            `Template id "${template.dirName}" conflicts with Core (${coreKinds}). ` +
            'Consider renaming the integration template. If you keep it, always select it with --package.',
          command,
        },
      ];
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    type: 'integration.template-conflicts',
    data: {name, version, conflicts, issues},
  };
}

/**
 * Find integration component names that are also owned by Core.
 * @param {string} [pkg]
 * @param {import('./authoring-checks.type.mjs').IntegrationAuthoringOptions} [options]
 * @returns {Promise<import('./authoring-checks.type.mjs').IntegrationComponentConflictResponse>}
 */
export async function integrationComponentConflicts(pkg, options = {}) {
  const {cwd = process.cwd()} = options;
  const resolved = await resolveIntegration(pkg, cwd);
  const name = resolved.found ? (resolved.name ?? null) : null;
  const version = resolved.found ? (resolved.version ?? null) : null;
  const issues = [...resolved.issues];

  if (!resolved.integration?.components || name == null) {
    return {
      type: 'integration.component-conflicts',
      data: {name, version, replacements: [], conflicts: [], issues},
    };
  }

  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    issues.push({
      code: 'core_not_found',
      severity: 'error',
      message:
        'Could not resolve @astryxdesign/core, so component names could not be checked. Install Core and run this check again.',
    });
    return {
      type: 'integration.component-conflicts',
      data: {name, version, replacements: [], conflicts: [], issues},
    };
  }

  const {records, errors} =
    await discoverIntegrationComponentContributions(resolved.integration);
  addErrors(issues, errors, 'invalid_component');
  if (errors.length > 0) {
    return {
      type: 'integration.component-conflicts',
      data: {name, version, replacements: [], conflicts: [], issues},
    };
  }

  const catalog = ComponentCatalog.fromCore(coreDir);
  const catalogIssues = await catalog.addIntegration(records);
  for (const issue of catalogIssues) {
    if (!issues.some(existing => existing.code === issue.code && existing.message === issue.message)) {
      issues.push(issue);
    }
  }
  if (catalogIssues.some(issue => issue.severity === 'error')) {
    return {
      type: 'integration.component-conflicts',
      data: {name, version, replacements: [], conflicts: [], issues},
    };
  }

  /** @type {ComponentCatalog|null} */
  let projectCatalog = null;
  try {
    const project = await Project.load(cwd);
    if (
      project.loadedIntegrations.some(
        integration => integration.name === name || integration.__spec === name,
      )
    ) {
      projectCatalog = await project.componentCatalog();
    }
  } catch {
    // A local or unconfigured package is checked against Core in isolation.
  }

  /** @type {Map<string, number>} */
  const replacementCounts = new Map();
  for (const component of records) {
    if (component.replaces == null) continue;
    const key = component.replaces.toLowerCase();
    replacementCounts.set(key, (replacementCounts.get(key) ?? 0) + 1);
  }

  const run = getCliInvocation(cwd);
  /** @type {import('./authoring-checks.type.mjs').IntegrationComponentReplacement[]} */
  const replacements = [];
  /** @type {import('./authoring-checks.type.mjs').IntegrationComponentConflict[]} */
  const conflicts = [];
  for (const component of records) {
    const sameNameCore = catalog.core(component.name)?.name;
    const target =
      component.replaces == null
        ? undefined
        : catalog.core(component.replaces)?.name;
    const active =
      target == null ||
      projectCatalog == null ||
      (projectCatalog.resolve(target)?.package === name &&
        projectCatalog.resolve(target)?.name === component.name);
    if (
      target != null &&
      replacementCounts.get(target.toLowerCase()) === 1 &&
      active
    ) {
      replacements.push({
        name: component.name,
        relationship: 'replaces',
        target,
        integrationPackage: name,
        message: `Intentional replacement: "${component.name}" replaces the Core component "${target}" for unqualified discovery and selection.`,
        command: `${run} component ${shellArg(target)} --package @astryxdesign/core`,
      });
    }
    if (sameNameCore == null || target === sameNameCore) continue;
    const targetAlreadyReplaced =
      (replacementCounts.get(sameNameCore.toLowerCase()) ?? 0) > 0;
    conflicts.push({
      name: component.name,
      severity: 'warning',
      relationship: 'accidental',
      target: sameNameCore,
      integrationPackage: name,
      message: targetAlreadyReplaced
        ? `Component "${component.name}" conflicts with Core and its unqualified name is shadowed by another replacement in this package. Keep using the package-qualified name or rename this component; a second replacement declaration for "${sameNameCore}" is invalid.`
        : `Component "${component.name}" conflicts with Core. Consider renaming the integration component or declaring ` +
          `\`replaces: '${sameNameCore}'\` if it should become the project default. ` +
          'Without a replacement declaration, callers must select a package.',
      command: `${run} component ${shellArg(component.name)} --package ${shellArg(name)}`,
    });
  }
  replacements.sort((a, b) => a.name.localeCompare(b.name));
  conflicts.sort((a, b) => a.name.localeCompare(b.name));

  return {
    type: 'integration.component-conflicts',
    data: {name, version, replacements, conflicts, issues},
  };
}

/**
 * Classify integration docs that overlap with built-in Core topics.
 * @param {string} [pkg]
 * @param {import('./authoring-checks.type.mjs').IntegrationAuthoringOptions} [options]
 * @returns {Promise<import('./authoring-checks.type.mjs').IntegrationDocConflictResponse>}
 */
export async function integrationDocConflicts(pkg, options = {}) {
  const {cwd = process.cwd()} = options;
  const resolved = await resolveIntegration(pkg, cwd);
  const name = resolved.found ? (resolved.name ?? null) : null;
  const version = resolved.found ? (resolved.version ?? null) : null;
  const issues = [...resolved.issues];

  if (!resolved.integration?.docs || name == null) {
    return {
      type: 'integration.doc-conflicts',
      data: {name, version, findings: [], issues},
    };
  }

  const [{records, errors}, builtinTopics] = await Promise.all([
    discoverIntegrationDocs(resolved.integration),
    Promise.resolve(discoverBuiltinTopics()),
  ]);
  addErrors(issues, errors, 'invalid_doc');
  const coreTopicsByKey = new Map(
    Object.keys(builtinTopics).map(topic => [topic.toLowerCase(), topic]),
  );

  /** @type {import('./authoring-checks.type.mjs').IntegrationDocFinding[]} */
  const findings = [];
  for (const record of records) {
    const replacedCore =
      record.replaces == null
        ? undefined
        : coreTopicsByKey.get(record.replaces.toLowerCase());
    const extendedCore =
      record.extendsTopic == null
        ? undefined
        : coreTopicsByKey.get(record.extendsTopic.toLowerCase());
    const sameNameCore = coreTopicsByKey.get(record.name.toLowerCase());

    if (replacedCore != null) {
      findings.push({
        topic: record.name,
        severity: 'info',
        relationship: 'replaces',
        coreTopic: replacedCore,
        message: `Intentional override: "${record.name}" replaces the Core topic "${replacedCore}".`,
      });
    }
    if (extendedCore != null) {
      findings.push({
        topic: record.name,
        severity: 'info',
        relationship: 'extends',
        coreTopic: extendedCore,
        message: `Intentional extension: "${record.name}" extends the Core topic "${extendedCore}".`,
      });
    }

    // An extension never owns its own name. A replacement does, so it may only
    // reuse a Core name when that is the Core topic it explicitly replaces.
    if (
      sameNameCore != null &&
      record.extendsTopic == null &&
      replacedCore !== sameNameCore
    ) {
      findings.push({
        topic: record.name,
        severity: 'error',
        relationship: 'accidental',
        coreTopic: sameNameCore,
        message:
          `Accidental conflict: "${record.name}" is already a Core topic. ` +
          `Rename it, declare replaces: '${sameNameCore}' to take it over, or declare extends: '${sameNameCore}' to merge sections.`,
      });
    }
  }
  findings.sort((a, b) =>
    `${a.topic}:${a.relationship}`.localeCompare(
      `${b.topic}:${b.relationship}`,
    ),
  );

  return {
    type: 'integration.doc-conflicts',
    data: {name, version, findings, issues},
  };
}
