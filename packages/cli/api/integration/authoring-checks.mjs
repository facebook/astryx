// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration authoring diagnostics against the built-in Core catalog.
 *
 * Templates may intentionally replace Core identities; undeclared same-id
 * overlaps stay fail-closed and require package selection. Docs have explicit
 * `replaces` / `extends` relationships with parallel validation semantics.
 */

import {getCliInvocation} from '../../foundation/env/package-manager.mjs';
import {findCoreDir} from '../../foundation/fs/paths.mjs';
import {
  discoverIntegrationComponents,
  discoverOwnedComponents,
} from '../../foundation/discovery/component-discovery.mjs';
import {
  discoverBuiltinTopics,
  discoverIntegrationDocs,
} from '../../foundation/discovery/docs-discovery.mjs';
import {
  applyTemplateReplacements,
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
 * @param {Array<{message: string, code?: string, severity?: 'warning' | 'error'} | Error>} errors
 * @param {string} code
 */
function addErrors(issues, errors, code) {
  for (const error of errors) {
    const message = error.message;
    const issueCode =
      'code' in error && typeof error.code === 'string' ? error.code : code;
    const severity =
      'severity' in error &&
      (error.severity === 'warning' || error.severity === 'error')
        ? error.severity
        : 'error';
    if (
      issues.some(
        issue => issue.code === issueCode && issue.message === message,
      )
    ) {
      continue;
    }
    issues.push({code: issueCode, severity, message});
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

  if (!resolved.integration || name == null) {
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

  const replacementResolution = applyTemplateReplacements(
    [...coreTemplates, ...templates],
    errors.filter(error => error.replacementTarget != null),
  );
  for (const error of replacementResolution.errors) {
    if (
      !issues.some(
        issue => issue.code === error.code && issue.message === error.message,
      )
    ) {
      issues.push({
        code: error.code,
        severity: error.severity,
        message: error.message,
      });
    }
  }
  const activeReplacementIds = new Set(
    replacementResolution.templates
      .filter(
        template => template.package === name && template.replaces != null,
      )
      .map(template => template.dirName),
  );

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
  /** @type {import('./authoring-checks.type.mjs').IntegrationTemplateConflict[]} */
  const conflicts = [];
  for (const template of templates) {
    const sameIdCore = coreById.get(template.dirName);
    const replacementIsActive = activeReplacementIds.has(template.dirName);

    if (replacementIsActive && template.replaces != null) {
      conflicts.push({
        id: template.dirName,
        severity: 'info',
        relationship: 'replaces',
        replaces: template.replaces,
        integrationPackage: name,
        integrationType: template.type,
        integrationName: template.name,
        coreMatches: coreById.get(template.replaces) ?? [],
        message:
          `Intentional replacement: "${template.dirName}" replaces the Core template ` +
          `"${template.replaces}" for unqualified lookup.`,
        command: `${run} template ${shellArg(template.replaces)} --package ${shellArg('@astryxdesign/core')}`,
      });
    }

    if (
      sameIdCore &&
      !(replacementIsActive && template.replaces === template.dirName)
    ) {
      const coreKinds = sameIdCore
        .map(match => `${match.type} "${match.name}"`)
        .join(', ');
      const compatibleKind = sameIdCore.some(
        match => match.type === template.type,
      );
      conflicts.push({
        id: template.dirName,
        severity: 'warning',
        relationship: 'accidental',
        integrationPackage: name,
        integrationType: template.type,
        integrationName: template.name,
        coreMatches: sameIdCore,
        message: compatibleKind
          ? `Template id "${template.dirName}" conflicts with Core (${coreKinds}). Consider renaming it or declare templateReplacements: {${JSON.stringify(template.dirName)}: ${JSON.stringify(template.dirName)}} to replace it.`
          : `Template id "${template.dirName}" conflicts with Core (${coreKinds}), but a ${template.type} template cannot replace a different template kind. Rename the integration template.`,
        command: `${run} template ${shellArg(template.dirName)} --package ${shellArg(name)}`,
      });
    }
  }
  conflicts.sort((a, b) =>
    `${a.id}:${a.relationship}`.localeCompare(`${b.id}:${b.relationship}`),
  );

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
      data: {name, version, conflicts: [], issues},
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
      data: {name, version, conflicts: [], issues},
    };
  }

  const coreNames = new Set(
    discoverOwnedComponents(coreDir, [])
      .filter(record => record.package === '@astryxdesign/core')
      .map(record => record.name),
  );
  const run = getCliInvocation(cwd);
  const conflicts = discoverIntegrationComponents(resolved.integration)
    .filter(component => coreNames.has(component.name))
    .map(component => ({
      name: component.name,
      severity: /** @type {const} */ ('warning'),
      integrationPackage: name,
      message:
        `Component "${component.name}" conflicts with Core. Consider renaming the integration component. ` +
        'If you keep it, always select it with --package.',
      command: `${run} component ${shellArg(component.name)} --package ${shellArg(name)}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    type: 'integration.component-conflicts',
    data: {name, version, conflicts, issues},
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
