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
 * @property {DocsListEntry[]} data every topic, each readable as a topic
 * @property {{namespaces?: DocsListNamespace[], notLoaded?: Array<{package: string, message: string}>}} [meta]
 *   `namespaces`: the docs tree's top-level namespaces, each opened by its
 *   `topic` as a docs.node; `notLoaded`: each package whose doc files did not
 *   load, and why (its docs are withdrawn)
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
 * A top-level namespace of the docs tree, as `astryx docs --json` lists it in
 * `meta.namespaces`.
 * @typedef {object} DocsListNamespace
 * @property {string} topic its route, the argument that opens it
 * @property {string} description
 * @property {string} package the package that owns it
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
 * @property {DocsReadDoc & {package: string, links: DocsLinks}} data
 *   the whole doc, and the moves from it
 */

/**
 * A topic section as a read returns it. A read inlines each token reference
 * and each `reference` block the author wrote, so its content holds only the
 * stable ReferenceContentBlock kinds.
 * @typedef {Omit<import('@astryxdesign/cli/authoring').ReferenceSection, 'content'>
 *   & {content: import('@astryxdesign/cli/authoring').ReferenceContentBlock[]}} DocsReadSection
 */

/**
 * A topic as a read returns it: every section a {@link DocsReadSection}.
 * @typedef {Omit<import('@astryxdesign/cli/authoring').ReferenceDoc, 'sections'>
 *   & {sections: DocsReadSection[]}} DocsReadDoc
 */

/**
 * The doc a link opens (spec:AST-047 FR9). A docs read resolves every link:
 * an inline `{@link <target>}` reads as `link.command`, a `reference` block in
 * a namespace doc carries `link` (null when the target names no doc), and each
 * `workflow` step carries `links`, one per reference. A topic read inlines a
 * section's `reference` block as the doc it includes, then a line naming where
 * that comes from and the command that opens it.
 * @typedef {import('../../foundation/doc-compiler/links.mjs').DocLink} DocLink
 */

/**
 * One move: a whole `astryx docs` command a reader can run as is.
 * @typedef {'astryx docs' | `astryx docs ${string}`} DocsCommand
 */

/**
 * The moves a docs read offers (spec:AST-047). Every read but the topic list
 * carries them.
 * @typedef {object} DocsLinks
 * @property {DocsCommand} up opens the level the read sits in: a section's
 *   topic index, a node's parent namespace, or the topic list
 * @property {DocsCommand} [previous] opens the item before it at its level: the
 *   previous section of its topic, or the previous node in its parent's slot
 * @property {DocsCommand} [next] opens the item after it at its level
 * @property {DocsCommand[]} [related] opens each doc a typed doc names: a
 *   function's command, a command's function, and the docs it lists as
 *   related
 */

/**
 * The section index of one topic: what the topic is, and the key each section
 * is read by.
 * @typedef {object} DocsIndex
 * @property {string} name the topic
 * @property {string} title
 * @property {string} description
 * @property {string} package the npm package that owns this topic
 * @property {DocsIndexSection[]} sections
 * @property {DocsLinks} links the moves from the index
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
 * @property {DocsReadSection & {package: string, links: DocsLinks}} data
 *   the section, and the moves from it: up to its topic's index, and across to
 *   the sections before and after it
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
 * @property {string | null} id the doc's DocId, built from its provider's
 *   ProviderId, kind, and name (see the provider-identity authoring doc);
 *   unchanged when the node moves. Always present; null on a generated level,
 *   such as `cli/api/functions`, which has no authored doc
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
 * @property {DocsLinks} links the moves from the node: up to its parent (the
 *   topic list, for a top-level namespace), and across to its neighbors in its
 *   parent's slot
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
