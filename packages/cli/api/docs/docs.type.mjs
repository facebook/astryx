// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `docs` command — source of truth for the docs
 *   command JSON responses. `types/docs.d.ts` re-exports these.
 *
 *   Invocation                           -> type discriminator
 *   ------------------------------------------------------------
 *   astryx --json docs                   -> docs.list
 *   astryx --json docs <topic>           -> docs.detail
 *   astryx --json docs <topic> --index   -> docs.index
 *   astryx --json docs <topic> <section> -> docs.detail.section
 *   astryx --json docs <route>           -> docs.node (a namespace or a
 *                                           typed doc in the docs tree)
 *   (unknown topic/section)              -> CLIError
 */

/**
 * astryx --json docs
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
 * @property {'namespace'} [kind] set on a top-level docs-tree namespace, such as
 *   `cli`; `astryx docs <topic>` then lists its children. Absent on a topic.
 */

/**
 * astryx --json docs <topic> --index
 * @typedef {object} DocsIndexResponse
 * @property {'docs.index'} type
 * @property {DocsIndex} data
 */

/**
 * astryx --json docs <topic>
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
 * astryx --json docs <topic> <section>
 * @typedef {object} DocsDetailSectionResponse
 * @property {'docs.detail.section'} type
 * @property {import('@astryxdesign/cli/authoring').ReferenceSection} data
 */

/**
 * astryx --json docs <route>, for a namespace or a typed doc in the docs tree
 * @typedef {object} DocsNodeResponse
 * @property {'docs.node'} type
 * @property {DocsNode} data
 */

/**
 * One node of the docs tree.
 * @typedef {object} DocsNode
 * @property {string} id stable identity, `<package>/<kind>/<name>`; unchanged
 *   when the node moves
 * @property {string} route pass it to `astryx docs`
 * @property {string} kind `namespace`, or the typed doc's kind: `command`,
 *   `function`, `schema`, or `enum`
 * @property {string} package the package that owns the node
 * @property {string} title
 * @property {string} summary
 * @property {DocsNodeLink[]} breadcrumb the namespaces above it, top first
 * @property {DocsNodeSlot[]} slots a namespace's slots that hold children, in
 *   order; empty for a typed doc
 * @property {import('@astryxdesign/cli/authoring').ReferenceContentBlock[]} content
 *   a typed doc's content; empty for a namespace
 */

/**
 * @typedef {object} DocsNodeLink
 * @property {string} route
 * @property {string} title
 */

/**
 * @typedef {object} DocsNodeSlot
 * @property {string} name the slot's key in its namespace
 * @property {string} title
 * @property {DocsNodeChild[]} children in reading order
 */

/**
 * @typedef {object} DocsNodeChild
 * @property {string} route pass it to `astryx docs` to go one level down
 * @property {string} name the last segment of its route
 * @property {string} kind
 * @property {string} title
 * @property {string} summary
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
