// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated public types for integration authoring diagnostics.
 * @input Stable response fields exposed by integration-authoring APIs.
 * @output JSDoc typedefs consumed by declarations, commands, and callers.
 * @position Public type boundary for integration diagnostics.
 */

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
 * A passage two topics repeat word for word: two of the package's own topics,
 * or one of them and a Core topic (never the Core topic it replaces). Only
 * prose counts, and only a run of 10 or more identical words, so each entry
 * is a real copy. Each is also a `copied_passage` warning, so
 * `integration check --strict` fails on it (architecture:cli-surface DEC-8).
 *
 * @typedef {object} CopiedPassage
 * @property {string} topic the package topic to change: it repeats the passage
 * @property {string | null} section the title of the section the passage starts in
 * @property {number | null} line the file line where the passage starts in `topic`, or null
 * @property {string} otherTopic the topic that also has it
 * @property {string} owner the topic that should keep the text: a Core topic, or of two package topics the one it fits
 * @property {'package' | 'core'} otherOwner whether that topic is the package's own or Core's
 * @property {number} words the length of the longest shared run, in words
 * @property {number} passages how many separate runs the two topics share
 * @property {string} message what is repeated, and the exact fix: the passage in `topic` replaced by a link to `owner`
 */

/**
 * Each of the three authoring checks reports `validated`: false means no
 * integration manifest was found, so nothing was inspected and the empty
 * conflicts/findings list carries no information about the package.
 *
 * @typedef {object} IntegrationTemplateConflictResponse
 * @property {'integration.template-conflicts'} type
 * @property {{validated: boolean, name: string | null, version: string | null, conflicts: IntegrationTemplateConflict[], issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[]}} data
 */

/**
 * Documented props compared with the component's TypeScript props. Present
 * when the manifest loads and declares a components root. `status: 'skipped'`
 * means nothing was compared (no TypeScript in the project) and `reason` says
 * why. Every finding is a warning.
 *
 * @typedef {import('../../foundation/discovery/prop-drift.mjs').PropDriftReport} PropDriftReport
 */

/**
 * @typedef {import('../../foundation/discovery/prop-drift.mjs').PropDriftFinding} PropDriftFinding
 */

/**
 * @typedef {object} IntegrationComponentConflictResponse
 * @property {'integration.component-conflicts'} type
 * @property {{validated: boolean, name: string | null, version: string | null, conflicts: IntegrationComponentConflict[], issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[], propDrift?: PropDriftReport}} data
 */

/**
 * @typedef {object} IntegrationDocConflictResponse
 * @property {'integration.doc-conflicts'} type
 * @property {{validated: boolean, name: string | null, version: string | null, findings: IntegrationDocFinding[], copiedPassages: CopiedPassage[], issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[]}} data
 */

export {};
