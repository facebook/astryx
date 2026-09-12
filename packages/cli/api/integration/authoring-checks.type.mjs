// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file Colocated types for integration authoring diagnostics. */

/**
 * @typedef {object} IntegrationAuthoringOptions
 * @property {string} [cwd]
 */

/**
 * @typedef {object} CoreTemplateMatch
 * @property {'page' | 'block'} type
 * @property {string} name
 */

/**
 * @typedef {object} IntegrationTemplateConflict
 * @property {string} id
 * @property {'warning'} severity
 * @property {string} integrationPackage
 * @property {'page' | 'block'} integrationType
 * @property {string} integrationName
 * @property {CoreTemplateMatch[]} coreMatches
 * @property {string} message
 * @property {string} command
 */

/**
 * @typedef {object} IntegrationComponentConflict
 * @property {string} name
 * @property {'warning'} severity
 * @property {'accidental'} [relationship]
 * @property {string} [target]
 * @property {string} integrationPackage
 * @property {string} message
 * @property {string} command
 */

/**
 * @typedef {object} IntegrationComponentReplacement
 * @property {string} name
 * @property {'replaces'} relationship
 * @property {string} target
 * @property {string} integrationPackage
 * @property {string} message
 * @property {string} command
 */

/**
 * @typedef {object} IntegrationDocFinding
 * @property {string} topic
 * @property {'info' | 'error'} severity
 * @property {'replaces' | 'extends' | 'accidental'} relationship
 * @property {string} coreTopic
 * @property {string} message
 */

/**
 * @typedef {object} IntegrationTemplateConflictResponse
 * @property {'integration.template-conflicts'} type
 * @property {{name: string | null, version: string | null, conflicts: IntegrationTemplateConflict[], issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[]}} data
 */

/**
 * @typedef {object} IntegrationComponentConflictResponse
 * @property {'integration.component-conflicts'} type
 * @property {{name: string | null, version: string | null, replacements?: IntegrationComponentReplacement[], conflicts: IntegrationComponentConflict[], issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[]}} data
 */

/**
 * @typedef {object} IntegrationDocConflictResponse
 * @property {'integration.doc-conflicts'} type
 * @property {{name: string | null, version: string | null, findings: IntegrationDocFinding[], issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[]}} data
 */

export {};
