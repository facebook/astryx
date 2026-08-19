// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `docs` command — source of truth for the docs
 *   command JSON responses. `types/docs.d.ts` re-exports these.
 *
 *   Invocation                          -> type discriminator
 *   ------------------------------------------------------------
 *   xds --json docs                     -> docs.list
 *   xds --json docs <topic>             -> docs.detail
 *   xds --json docs <topic> <section>   -> docs.detail.section
 *   (unknown topic/section)             -> CLIError
 */

/**
 * xds --json docs
 * @typedef {object} DocsListResponse
 * @property {'docs.list'} type
 * @property {DocsListEntry[]} data
 */

/**
 * @typedef {object} DocsListEntry
 * @property {string} topic
 * @property {string} description
 */

/**
 * xds --json docs <topic>
 * @typedef {object} DocsDetailResponse
 * @property {'docs.detail'} type
 * @property {import('@astryxdesign/cli/authoring').ReferenceDoc} data
 */

/**
 * xds --json docs <topic> <section>
 * @typedef {object} DocsDetailSectionResponse
 * @property {'docs.detail.section'} type
 * @property {import('@astryxdesign/cli/authoring').ReferenceSection} data
 */

/**
 * Options for `docs()`.
 * @typedef {object} DocsOptions
 * @property {string} [lang]
 * @property {boolean} [zh]
 * @property {boolean} [dense]
 */

export {};
