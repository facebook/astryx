// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `docs` command — source of truth for the docs
 *   command JSON responses. `types/docs.d.ts` re-exports these.
 *
 *   Invocation                          -> type discriminator
 *   ------------------------------------------------------------
 *   xds --json docs                     -> docs.list
 *   xds --json docs <topic>             -> docs.detail
 *   xds --json docs <topic> --index     -> docs.index
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
 * @property {string} package the package that owns this topic —
 *   '@astryxdesign/cli' for a built-in one, else the contributing integration
 * @property {string} [replaces] the topic this one took the place of, when it
 *   was contributed as a replacement
 */

/**
 * xds --json docs <topic> --index
 * @typedef {object} DocsIndexResponse
 * @property {'docs.index'} type
 * @property {DocsIndex} data
 */

/**
 * xds --json docs <topic>
 * @typedef {object} DocsDetailResponse
 * @property {'docs.detail'} type
 * @property {import('@astryxdesign/cli/authoring').ReferenceDoc} data
 */

/**
 * The section index of one topic: what the topic is, and the key each section
 * is read by.
 * @typedef {object} DocsIndex
 * @property {string} name the topic
 * @property {string} title
 * @property {string} description
 * @property {DocsIndexSection[]} sections
 */

/**
 * @typedef {object} DocsIndexSection
 * @property {string} id stable key; pass it as the section argument
 * @property {string} title
 * @property {string} summary the section's first line of text, at most 240
 *   characters
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
 * @property {boolean} [index] return a topic's section index instead of its
 *   whole doc
 * @property {string} [cwd] project directory whose configured integrations
 *   contribute topics; defaults to process.cwd()
 */

export {};
