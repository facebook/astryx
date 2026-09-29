// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file preparedDocument.ts
 * @input Markdown source, parser options, and optional plugins
 * @output Immutable prepared document shared by Markdown rendering and Outline
 * @position Server-safe one-parse composition boundary for Markdown documents
 */

import type {MarkdownAstRoot} from './ast';
import {
  projectMarkdownFootnotes,
  type MarkdownFootnoteProjection,
} from './footnoteProjection';
import {
  projectMarkdownHeadings,
  type MarkdownHeadingProjection,
} from './headingProjection';
import {parseMarkdownAstInternal} from './parser';
import {
  applyMarkdownTransforms,
  prepareMarkdownPlugins,
  reportMarkdownPluginFailure,
} from './plugins/protocol';
import type {
  MarkdownExtensionNode,
  MarkdownExtensionsOf,
  MarkdownPluginEntry,
  PreparedMarkdownPlugins,
} from './plugins/protocol';

const PREPARED_MARKDOWN_DOCUMENT_BRAND =
  '@astryxdesign/core/PreparedMarkdownDocument';
const preparedMarkdownDocumentDefinition = Symbol.for(
  PREPARED_MARKDOWN_DOCUMENT_BRAND,
);
declare const preparedMarkdownDocumentExtension: unique symbol;

export interface PreparedMarkdownOutlineItem {
  readonly id: string;
  readonly label: string;
  readonly level: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Immutable result of one canonical Markdown parse and transform pipeline. */
export interface PreparedMarkdownDocument<
  Extension extends MarkdownExtensionNode = never,
> {
  readonly source: string;
  readonly root: MarkdownAstRoot<Extension>;
  readonly outline: ReadonlyArray<PreparedMarkdownOutlineItem>;
  readonly [preparedMarkdownDocumentExtension]: Extension;
}

export interface PrepareMarkdownDocumentOptions<
  Plugins extends ReadonlyArray<MarkdownPluginEntry> = readonly [],
> {
  readonly sourceIds?: ReadonlySet<string>;
  readonly autolink?: 'gfm';
  readonly math?: boolean;
  readonly footnotes?: 'github';
  readonly plugins?: Plugins;
}

interface PreparedMarkdownDocumentDefinition {
  readonly kind: typeof PREPARED_MARKDOWN_DOCUMENT_BRAND;
  readonly apiVersion: 1;
  readonly source: string;
  readonly root: MarkdownAstRoot<MarkdownExtensionNode>;
  readonly headingProjection: MarkdownHeadingProjection;
  readonly footnoteProjection: MarkdownFootnoteProjection | undefined;
  readonly plugins: PreparedMarkdownPlugins | undefined;
}

interface InternalPreparedMarkdownDocument extends PreparedMarkdownDocument<MarkdownExtensionNode> {
  readonly [preparedMarkdownDocumentDefinition]: PreparedMarkdownDocumentDefinition;
}

/**
 * Parse, transform, and project a Markdown document once. Pass the returned
 * object to `<Markdown document={document} />` and `document.outline` to
 * `<Outline items={...} />` to avoid parsing the same source twice.
 */
export function prepareMarkdownDocument<
  const Plugins extends ReadonlyArray<MarkdownPluginEntry> = readonly [],
>(
  source: string,
  options: PrepareMarkdownDocumentOptions<Plugins> = {},
): PreparedMarkdownDocument<MarkdownExtensionsOf<Plugins>> {
  let preparedPlugins: PreparedMarkdownPlugins | undefined;
  if (options.plugins != null) {
    try {
      preparedPlugins = prepareMarkdownPlugins(options.plugins);
    } catch (error) {
      reportMarkdownPluginFailure('configuration', 'transform', error);
    }
  }

  const parsedRoot = parseMarkdownAstInternal(
    source,
    {
      sourceIds: options.sourceIds,
      autolink: options.autolink,
      math: options.math,
      footnotes: options.footnotes,
      plugins: preparedPlugins?.syntaxEntries,
    },
    true,
  );
  const root = applyMarkdownTransforms(
    parsedRoot,
    preparedPlugins,
    source,
    true,
    'block',
  );
  const headingProjection = projectMarkdownHeadings(
    root.children,
    preparedPlugins,
  );
  const footnoteProjection =
    options.footnotes === 'github'
      ? projectMarkdownFootnotes(root.children, headingProjection)
      : undefined;
  const outline = Object.freeze(
    headingProjection.headings.map(({id, label, level}) =>
      Object.freeze({id, label, level}),
    ),
  );
  const document = {
    source,
    root,
    outline,
  };
  Object.defineProperty(document, preparedMarkdownDocumentDefinition, {
    configurable: false,
    enumerable: false,
    writable: false,
    value: Object.freeze({
      kind: PREPARED_MARKDOWN_DOCUMENT_BRAND,
      apiVersion: 1,
      source,
      root,
      headingProjection,
      footnoteProjection,
      plugins: preparedPlugins,
    } satisfies PreparedMarkdownDocumentDefinition),
  });
  return Object.freeze(document) as unknown as PreparedMarkdownDocument<
    MarkdownExtensionsOf<Plugins>
  >;
}

/** @internal Read validated render data from a compatible prepared document. */
export function getPreparedMarkdownDocumentDefinition(
  document: PreparedMarkdownDocument<MarkdownExtensionNode>,
): PreparedMarkdownDocumentDefinition | null {
  if (
    document == null ||
    typeof document !== 'object' ||
    Object.getPrototypeOf(document) !== Object.prototype ||
    !Object.isFrozen(document)
  ) {
    return null;
  }
  const definition = (document as Partial<InternalPreparedMarkdownDocument>)[
    preparedMarkdownDocumentDefinition
  ];
  if (
    definition == null ||
    typeof definition !== 'object' ||
    !Object.isFrozen(definition) ||
    definition.kind !== PREPARED_MARKDOWN_DOCUMENT_BRAND ||
    definition.apiVersion !== 1 ||
    definition.source !== document.source ||
    definition.root !== document.root ||
    !Array.isArray(document.outline) ||
    !Object.isFrozen(document.outline)
  ) {
    return null;
  }
  return definition;
}
