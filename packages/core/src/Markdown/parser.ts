// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file parser.ts
 * @input Markdown string, released parse options, and optional ordered plugins
 * @output Canonical MDAST-aligned nodes for public/server consumers plus unchanged
 *   released parser-node projections; shared heading slug helpers
 * @position Core parser and compatibility boundary; consumed by public parser entry,
 *   Markdown, and Outline
 */

import {
  getMarkdownAstLegacyCodeLanguage,
  markMarkdownAstLegacyCodeLanguage,
} from './ast';
import type {
  MarkdownAstBlockContent,
  MarkdownAstList,
  MarkdownAstListItem,
  MarkdownAstPhrasingContent,
  MarkdownAstPosition,
  MarkdownAstRoot,
  MarkdownAstTableCell,
  MarkdownAstTableRow,
} from './ast';
import {
  applyMarkdownTransforms,
  freezeMarkdownPluginData,
  getMarkdownExtensionContent,
  isMarkdownPluginData,
  MAX_MARKDOWN_CONTAINER_DEPTH,
  prepareMarkdownPlugins,
  reportMarkdownPluginFailure,
  validateMarkdownExtensionContent,
} from './plugins/protocol';
import type {
  MarkdownAnyExtensionNode,
  MarkdownExtensionsOf,
  MarkdownPluginData,
  MarkdownPluginEntry,
  PreparedMarkdownPlugins,
  PreparedSyntaxContribution,
} from './plugins/protocol';
import {isSafeMarkdownParserUrl} from './url';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Nodes returned by default and legacy parser calls. */
export type InlineNode<Extension extends MarkdownAnyExtensionNode = never> =
  | {type: 'text'; content: string}
  | {type: 'bold'; children: InlineNode<Extension>[]}
  | {type: 'italic'; children: InlineNode<Extension>[]}
  | {type: 'strikethrough'; children: InlineNode<Extension>[]}
  | {type: 'code'; content: string}
  | {type: 'link'; href: string; children: InlineNode<Extension>[]}
  | {type: 'image'; src: string; alt: string}
  | {type: 'citation'; sourceId: string}
  | {type: 'break'}
  | Extract<Extension, {display: 'inline'}>;

/** The additional inline node returned only when parsing with `math: true`. */
export type MathInlineNode = {type: 'math'; value: string};

/** Nodes returned by an explicitly math-enabled inline parse. */
export type InlineNodeWithMath<
  Extension extends MarkdownAnyExtensionNode = never,
> =
  | {type: 'text'; content: string}
  | {type: 'bold'; children: InlineNodeWithMath<Extension>[]}
  | {type: 'italic'; children: InlineNodeWithMath<Extension>[]}
  | {type: 'strikethrough'; children: InlineNodeWithMath<Extension>[]}
  | {type: 'code'; content: string}
  | MathInlineNode
  | {type: 'link'; href: string; children: InlineNodeWithMath<Extension>[]}
  | {type: 'image'; src: string; alt: string}
  | {type: 'citation'; sourceId: string}
  | {type: 'break'}
  | Extract<Extension, {display: 'inline'}>;

type BlockMetadata = {
  /**
   * Where this block came from in the source, when parsed with the
   * `sourceRanges` option. Top-level blocks only.
   */
  range?: SourceRange;
};

type LegacyBlockNodeKind<Extension extends MarkdownAnyExtensionNode = never> =
  | {
      type: 'heading';
      level: 1 | 2 | 3 | 4 | 5 | 6;
      children: InlineNode<Extension>[];
    }
  | {type: 'paragraph'; children: InlineNode<Extension>[]}
  | {type: 'codeblock'; language: string; content: string}
  | {type: 'blockquote'; children: BlockNode<Extension>[]}
  | {
      type: 'list';
      ordered: boolean;
      start?: number;
      /** Ordered-list marker delimiter ('.' or ')'). Undefined for bullets. */
      delimiter?: '.' | ')';
      loose?: boolean;
      items: ListItemNode<Extension>[];
    }
  | {
      type: 'table';
      headers: TableCellNode<Extension>[];
      alignments: TableAlignment[];
      rows: TableCellNode<Extension>[][];
    }
  | {type: 'hr'}
  | {type: 'image'; src: string; alt: string}
  | Extract<Extension, {display: 'block'}>;

/** Blocks returned by default and legacy parser calls. */
export type BlockNode<Extension extends MarkdownAnyExtensionNode = never> =
  LegacyBlockNodeKind<Extension> & BlockMetadata;

/** The additional block returned only when parsing with `math: true`. */
export type MathBlockNode = {type: 'math'; value: string} & BlockMetadata;

type MathEnabledBlockNodeKind<
  Extension extends MarkdownAnyExtensionNode = never,
> =
  | {
      type: 'heading';
      level: 1 | 2 | 3 | 4 | 5 | 6;
      children: InlineNodeWithMath<Extension>[];
    }
  | {type: 'paragraph'; children: InlineNodeWithMath<Extension>[]}
  | {type: 'codeblock'; language: string; content: string}
  | MathBlockNode
  | {type: 'blockquote'; children: BlockNodeWithMath<Extension>[]}
  | {
      type: 'list';
      ordered: boolean;
      start?: number;
      /** Ordered-list marker delimiter ('.' or ')'). Undefined for bullets. */
      delimiter?: '.' | ')';
      loose?: boolean;
      items: ListItemNodeWithMath<Extension>[];
    }
  | {
      type: 'table';
      headers: TableCellNodeWithMath<Extension>[];
      alignments: TableAlignment[];
      rows: TableCellNodeWithMath<Extension>[][];
    }
  | {type: 'hr'}
  | {type: 'image'; src: string; alt: string}
  | Extract<Extension, {display: 'block'}>;

/** Blocks returned by an explicitly math-enabled block parse. */
export type BlockNodeWithMath<
  Extension extends MarkdownAnyExtensionNode = never,
> = MathEnabledBlockNodeKind<Extension> & BlockMetadata;

/**
 * Where a block sits in the source string handed to `parseMarkdown`:
 * `source.slice(start, end)` is the block, and `end` excludes the block's
 * trailing blank lines.
 *
 * An object rather than a `[start, end]` tuple so a second way of addressing
 * the same block — line numbers, once a consumer needs them — can be added as
 * optional fields without breaking anyone.
 */
export type SourceRange = {readonly start: number; readonly end: number};

export type ListItemNode<Extension extends MarkdownAnyExtensionNode = never> = {
  checked?: boolean;
  children: BlockNode<Extension>[];
};
type ListItemNodeWithMath<Extension extends MarkdownAnyExtensionNode = never> =
  {
    checked?: boolean;
    children: BlockNodeWithMath<Extension>[];
  };
export type TableCellNode<Extension extends MarkdownAnyExtensionNode = never> =
  {
    children: InlineNode<Extension>[];
  };
type TableCellNodeWithMath<Extension extends MarkdownAnyExtensionNode = never> =
  {
    children: InlineNodeWithMath<Extension>[];
  };
export type TableAlignment = 'left' | 'center' | 'right' | null;

type RuntimeExtensionNode = MarkdownAnyExtensionNode;
type RuntimeInlineNode = InlineNodeWithMath<RuntimeExtensionNode>;
type RuntimeBlockNode = BlockNodeWithMath<RuntimeExtensionNode>;

type LegacyProjectionCache = WeakMap<object, object>;

function projectRange(
  position: MarkdownAstPosition | undefined,
): BlockMetadata {
  const start = position?.start.offset;
  const end = position?.end.offset;
  return start == null || end == null ? {} : {range: {start, end}};
}

/**
 * Canonical nodes always carry Core-authored positions; the released block
 * shape exposes them as `range` only when the caller passed `sourceRanges`,
 * so this projection stays byte-for-byte what it has always returned.
 *
 * An extension node is the one kind the projection passes through instead of
 * rebuilding field by field, so it is the one kind that could carry a
 * canonical `position` out into released output. Strip it unless the caller
 * asked for provenance, in which case the node keeps exactly the `position`
 * it has always exposed.
 */
function projectExtensionNode<Node extends RuntimeExtensionNode>(
  node: Node,
  withRanges: boolean,
): Node {
  if (withRanges || node.position === undefined) {
    return node;
  }
  const {position: _canonicalPosition, ...released} = node;
  return released as Node;
}

function projectInlineNode(
  node: MarkdownAstPhrasingContent<RuntimeExtensionNode>,
  cache: LegacyProjectionCache,
  withRanges: boolean,
): RuntimeInlineNode {
  const cached = cache.get(node);
  if (cached != null) {
    return cached as RuntimeInlineNode;
  }
  let projected: RuntimeInlineNode;
  switch (node.type) {
    case 'text':
      projected = {type: 'text', content: node.value};
      break;
    case 'strong':
      projected = {
        type: 'bold',
        children: node.children.map(child =>
          projectInlineNode(child, cache, withRanges),
        ),
      };
      break;
    case 'emphasis':
      projected = {
        type: 'italic',
        children: node.children.map(child =>
          projectInlineNode(child, cache, withRanges),
        ),
      };
      break;
    case 'delete':
      projected = {
        type: 'strikethrough',
        children: node.children.map(child =>
          projectInlineNode(child, cache, withRanges),
        ),
      };
      break;
    case 'inlineCode':
      projected = {type: 'code', content: node.value};
      break;
    case 'inlineMath':
      projected = {type: 'math', value: node.value};
      break;
    case 'link':
      projected = {
        type: 'link',
        href: node.url,
        children: node.children.map(child =>
          projectInlineNode(child, cache, withRanges),
        ),
      };
      break;
    case 'image':
      projected = {type: 'image', src: node.url, alt: node.alt};
      break;
    case 'citation':
      projected = {type: 'citation', sourceId: node.sourceId};
      break;
    case 'break':
      projected = {type: 'break'};
      break;
    case 'extension':
      projected = projectExtensionNode(node, withRanges);
      break;
  }
  cache.set(node, projected);
  return projected;
}

function projectTableCell(
  node: MarkdownAstTableCell<RuntimeExtensionNode>,
  cache: LegacyProjectionCache,
  withRanges: boolean,
): TableCellNodeWithMath<RuntimeExtensionNode> {
  const cached = cache.get(node);
  if (cached != null) {
    return cached as TableCellNodeWithMath<RuntimeExtensionNode>;
  }
  const projected = {
    children: node.children.map(child =>
      projectInlineNode(child, cache, withRanges),
    ),
  };
  cache.set(node, projected);
  return projected;
}

function projectListItem(
  node: MarkdownAstListItem<RuntimeExtensionNode>,
  cache: LegacyProjectionCache,
  withRanges: boolean,
): ListItemNodeWithMath<RuntimeExtensionNode> {
  const cached = cache.get(node);
  if (cached != null) {
    return cached as ListItemNodeWithMath<RuntimeExtensionNode>;
  }
  const projected = {
    checked: node.checked,
    children: node.children.map(child =>
      projectBlockNode(child, cache, withRanges),
    ),
  };
  cache.set(node, projected);
  return projected;
}

function projectBlockNode(
  node: MarkdownAstBlockContent<RuntimeExtensionNode>,
  cache: LegacyProjectionCache,
  withRanges: boolean,
): RuntimeBlockNode {
  const cached = cache.get(node);
  if (cached != null) {
    return cached as RuntimeBlockNode;
  }
  const metadata = withRanges ? projectRange(node.position) : {};
  let projected: RuntimeBlockNode;
  switch (node.type) {
    case 'heading':
      projected = {
        type: 'heading',
        level: node.depth,
        children: node.children.map(child =>
          projectInlineNode(child, cache, withRanges),
        ),
        ...metadata,
      };
      break;
    case 'paragraph':
      projected = {
        type: 'paragraph',
        children: node.children.map(child =>
          projectInlineNode(child, cache, withRanges),
        ),
        ...metadata,
      };
      break;
    case 'code':
      projected = {
        type: 'codeblock',
        language: getMarkdownAstLegacyCodeLanguage(node) ?? 'plaintext',
        content: node.value,
        ...metadata,
      };
      break;
    case 'math':
      projected = {type: 'math', value: node.value, ...metadata};
      break;
    case 'blockquote':
      projected = {
        type: 'blockquote',
        children: node.children.map(child =>
          projectBlockNode(child, cache, withRanges),
        ),
        ...metadata,
      };
      break;
    case 'list':
      projected = {
        type: 'list',
        ordered: node.ordered,
        start: node.start,
        delimiter: node.delimiter,
        loose: node.spread,
        items: node.children.map(item =>
          projectListItem(item, cache, withRanges),
        ),
        ...metadata,
      };
      break;
    case 'table': {
      const [header = {type: 'tableRow' as const, children: []}, ...rows] =
        node.children;
      projected = {
        type: 'table',
        headers: header.children.map(cell =>
          projectTableCell(cell, cache, withRanges),
        ),
        alignments: [...node.align],
        rows: rows.map(row =>
          row.children.map(cell => projectTableCell(cell, cache, withRanges)),
        ),
        ...metadata,
      };
      break;
    }
    case 'thematicBreak':
      projected = {type: 'hr', ...metadata};
      break;
    case 'image':
      projected = {type: 'image', alt: node.alt, src: node.url, ...metadata};
      break;
    case 'extension':
      projected = projectExtensionNode(node, withRanges);
      break;
  }
  cache.set(node, projected);
  return projected;
}

function projectInlineNodes(
  nodes: ReadonlyArray<MarkdownAstPhrasingContent<RuntimeExtensionNode>>,
  withRanges: boolean,
  cache: LegacyProjectionCache = new WeakMap(),
): RuntimeInlineNode[] {
  return nodes.map(node => projectInlineNode(node, cache, withRanges));
}

function projectMarkdownRoot(
  root: MarkdownAstRoot<RuntimeExtensionNode>,
  withRanges: boolean,
  cache: LegacyProjectionCache = new WeakMap(),
): RuntimeBlockNode[] {
  return root.children.map(node => projectBlockNode(node, cache, withRanges));
}

/** Whether a caller asked for the released `range` field on its blocks. */
function wantsLegacyRanges(
  arg: ReadonlySet<string> | RuntimeParseOptions | undefined,
): boolean {
  return (
    arg != null &&
    typeof (arg as {has?: unknown}).has !== 'function' &&
    (arg as RuntimeParseOptions).sourceRanges === true
  );
}

// ---------------------------------------------------------------------------
// Parse options
// ---------------------------------------------------------------------------

/**
 * Options for the markdown parser entry points.
 *
 * Backward-compatible: the public `parseMarkdown` / `parseInline` /
 * `parseMarkdownIncremental` functions also accept the legacy
 * `ReadonlySet<string>` shape as the second argument.
 */
type CommonParseOptions<
  Plugins extends ReadonlyArray<MarkdownPluginEntry> = readonly [],
> = {
  /** Set of citation source ids — `[id]` / `【id】` markers in this set
   *  become citation nodes instead of plain text / links. */
  sourceIds?: ReadonlySet<string>;
  /** Ordered opt-in Markdown extensions. */
  plugins?: Plugins;
  /**
   * Autolink mode. When set to `'gfm'`, the parser turns bare
   * `https?://…` / `www.…` URLs, `<URL>` / `<email>` angle-bracket
   * forms, and `user@host` emails into `link` inline nodes (per the
   * GitHub Flavored Markdown autolink-literal extension plus the
   * CommonMark §6.5 autolink form). Disabled by default.
   *
   * Two intentional deviations from the strict GFM spec for v1:
   * trailing `&entity;` is not peeled off the URL, and an invalid TLD
   * suffix is not rejected (Astryx accepts any plausible TLD shape).
   */
  autolink?: 'gfm';
  /**
   * When true, every top-level block carries a `range` — the offsets it
   * occupies in the string passed in. Lets a consumer that still holds the
   * source slice the original markdown for a block instead of reconstructing
   * it from the parsed node (or from the rendered DOM). Off by default: the
   * field is absent unless asked for, so nothing that compares nodes changes.
   *
   * Blocks nested inside a list item or a blockquote do not carry one.
   */
  sourceRanges?: boolean;
};

/** Options for default and legacy parser results. */
export type ParseOptions<
  Plugins extends ReadonlyArray<MarkdownPluginEntry> = readonly [],
> = CommonParseOptions<Plugins> & {math?: false | undefined};

/**
 * Options that explicitly parse `$…$` and `$$…$$` into math-enabled result
 * unions. Keeping this separate prevents a legacy `ParseOptions` annotation
 * from silently widening an exhaustive node switch.
 */
export type MathParseOptions<
  Plugins extends ReadonlyArray<MarkdownPluginEntry> = readonly [],
> = CommonParseOptions<Plugins> & {math: true};

export type IncrementalParseOptions<
  Plugins extends ReadonlyArray<MarkdownPluginEntry> = readonly [],
> = ParseOptions<Plugins> & {
  /** False while more source may arrive; true for the terminal snapshot. */
  readonly isFinal?: boolean;
};

export type IncrementalMathParseOptions<
  Plugins extends ReadonlyArray<MarkdownPluginEntry> = readonly [],
> = MathParseOptions<Plugins> & {
  /** False while more source may arrive; true for the terminal snapshot. */
  readonly isFinal?: boolean;
};

type RuntimeParseOptions = CommonParseOptions<
  ReadonlyArray<MarkdownPluginEntry>
> & {
  math?: boolean;
  isFinal?: boolean;
};

type ResolvedOptions = {
  readonly sourceIds: ReadonlySet<string> | undefined;
  readonly autolink: 'gfm' | undefined;
  readonly math?: boolean;
  /** Whether the caller asked for the released `range` projection. */
  readonly sourceRanges?: boolean;
  /**
   * Whether this parse authors canonical `position` offsets on its blocks.
   * Internal only, and independent of `sourceRanges`: the canonical tree
   * transforms observe always carries provenance, while `sourceRanges` alone
   * decides whether the released projection exposes it as `range`.
   */
  readonly astPositions?: boolean;
  readonly plugins?: PreparedMarkdownPlugins;
  readonly isFinal: boolean;
  readonly allowBlockSyntax?: boolean;
  readonly containerDepth?: number;
  /**
   * Offset of this parse's input within the document the ranges are reported
   * against. Internal only — the incremental parser parses slices and needs
   * their blocks' ranges to come out absolute.
   */
  readonly baseOffset?: number;
  /**
   * Link reference definitions (`[label]: url`) collected from the whole
   * document, keyed by normalized label. Internal only — populated by the
   * block parser, never by the public `ParseOptions`. Enables `parseInlineImpl`
   * to resolve full/collapsed/shortcut reference links and images.
   */
  readonly linkDefs?: ReadonlyMap<string, string>;
};

/**
 * Every resolved options object is built here, so all of them share one key
 * set in one order — and therefore one hidden class. The parser reads these
 * fields in its hottest loops; letting an omitted-options parse and an
 * options-bag parse produce differently-shaped objects makes those reads
 * polymorphic in any process that does both, which is exactly what a caller
 * comparing an empty pipeline against a configured one does.
 */
function makeResolvedOptions(
  fields: Partial<ResolvedOptions> & {readonly isFinal: boolean},
): ResolvedOptions {
  return {
    sourceIds: fields.sourceIds,
    autolink: fields.autolink,
    math: fields.math,
    sourceRanges: fields.sourceRanges,
    astPositions: fields.astPositions ?? true,
    plugins: fields.plugins,
    isFinal: fields.isFinal,
    allowBlockSyntax: fields.allowBlockSyntax ?? true,
    baseOffset: fields.baseOffset,
    linkDefs: fields.linkDefs,
  };
}

const EMPTY_OPTS: ResolvedOptions = makeResolvedOptions({isFinal: true});
const EMPTY_INCREMENTAL_OPTS: ResolvedOptions = makeResolvedOptions({
  isFinal: false,
});

function resolveOptions(
  arg: ReadonlySet<string> | RuntimeParseOptions | undefined,
  incremental = false,
): ResolvedOptions {
  if (arg == null) {
    return incremental ? EMPTY_INCREMENTAL_OPTS : EMPTY_OPTS;
  }
  // Duck-type the legacy `ReadonlySet<string>` form: any object whose
  // `.has` is callable is treated as the legacy sourceIds set. This is
  // safer than `instanceof Set`, which would misclassify cross-realm
  // or polyfilled `ReadonlySet` implementations as a `ParseOptions` bag
  // and silently lose citation resolution.
  if (typeof (arg as {has?: unknown}).has === 'function') {
    return makeResolvedOptions({
      sourceIds: arg as ReadonlySet<string>,
      isFinal: !incremental,
    });
  }
  const opts = arg as RuntimeParseOptions;
  return makeResolvedOptions({
    sourceIds: opts.sourceIds,
    autolink: opts.autolink,
    math: opts.math === true ? true : undefined,
    sourceRanges: opts.sourceRanges,
    plugins:
      opts.plugins != null && opts.plugins.length > 0
        ? prepareMarkdownPlugins(opts.plugins)
        : undefined,
    isFinal: incremental ? opts.isFinal === true : true,
  });
}

// ---------------------------------------------------------------------------
// Link reference definitions
// ---------------------------------------------------------------------------

// A CommonMark link reference definition line: up to 3 leading spaces, a
// bracketed label, `:`, a destination (bare or `<...>`), and an optional
// same-line title (captured as group 4 so a title-less definition can absorb a
// title on the following line). `^`-leading labels (`[^1]:`) are footnote
// definitions — a separate, unsupported feature — and are excluded so they
// pass through verbatim.
const LINK_DEFINITION_RE =
  /^ {0,3}\[([^\]^](?:\\.|[^\]\\])*)\]:[ \t]*(?:<([^<>\n]*)>|(\S+))([ \t]+(?:"[^"\n]*"|'[^'\n]*'|\([^()\n]*\)))?[ \t]*$/;

// A line that is nothing but a title — the continuation form allowed when a
// definition's destination is followed by its title on the next line.
const LINK_TITLE_ONLY_RE = /^ {0,3}(?:"[^"\n]*"|'[^'\n]*'|\([^()\n]*\))[ \t]*$/;

// CommonMark matches reference labels case-insensitively with leading/trailing
// whitespace stripped and internal whitespace runs collapsed to one space.
function normalizeLinkLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}

type DisplayMathContainer = {
  outerQuoteDepth: number;
  listBaseIndent: number | null;
  innerQuoteDepth: number;
};

type DisplayMathMatch = {
  value: string;
  nextIndex: number;
  endLine: number;
};

function stripBlockquoteMarkers(line: string): {
  content: string;
  quoteDepth: number;
} {
  let content = line.endsWith('\r') ? line.slice(0, -1) : line;
  let quoteDepth = 0;
  while (true) {
    const marker = /^ {0,3}> ?/.exec(content);
    if (marker == null) {
      return {content, quoteDepth};
    }
    content = content.slice(marker[0].length);
    quoteDepth++;
  }
}

function stripExactBlockquoteDepth(
  line: string,
  quoteDepth: number,
): string | null {
  let content = line;
  for (let depth = 0; depth < quoteDepth; depth++) {
    const marker = /^ {0,3}> ?/.exec(content);
    if (marker == null) {
      return null;
    }
    content = content.slice(marker[0].length);
  }
  return content;
}

/**
 * Recognize a standalone display-math marker at the current container boundary.
 * A list opener carries its base indent so an indented continuation marker can
 * close it; blockquotes must keep the same quote depth.
 */
function displayMathContainer(line: string): DisplayMathContainer | null {
  const outer = stripBlockquoteMarkers(line);
  const listMarker = /^( {0,9})(?:[-*+]|\d+[.)]) +(.*)$/.exec(outer.content);
  if (listMarker != null) {
    const taskMarker = /^\[[ xX]\] +(.*)$/.exec(listMarker[2]);
    const inner = stripBlockquoteMarkers(taskMarker?.[1] ?? listMarker[2]);
    return inner.content.trim() === '$$'
      ? {
          outerQuoteDepth: outer.quoteDepth,
          listBaseIndent: listMarker[1].length,
          innerQuoteDepth: inner.quoteDepth,
        }
      : null;
  }
  return outer.content.trim() === '$$'
    ? {
        outerQuoteDepth: outer.quoteDepth,
        listBaseIndent: null,
        innerQuoteDepth: 0,
      }
    : null;
}

type DisplayMathLineState = 'close' | 'inside' | 'outside';

function displayMathLineState(
  line: string,
  container: DisplayMathContainer,
): DisplayMathLineState {
  const outerContent = stripExactBlockquoteDepth(
    line,
    container.outerQuoteDepth,
  );
  if (outerContent == null) {
    return 'outside';
  }

  if (container.listBaseIndent == null) {
    // A deeper quote starts a different container. It cannot close or continue
    // the math expression owned by the shallower quote.
    if (/^ {0,3}> ?/.test(outerContent)) {
      return 'outside';
    }
    return outerContent.trim() === '$$' ? 'close' : 'inside';
  }

  const continuationIndent =
    outerContent.length - outerContent.trimStart().length;
  if (continuationIndent <= container.listBaseIndent) {
    return 'outside';
  }
  const innerContent = stripExactBlockquoteDepth(
    outerContent.trimStart(),
    container.innerQuoteDepth,
  );
  if (innerContent == null || /^ {0,3}> ?/.test(innerContent)) {
    return 'outside';
  }
  return innerContent.trim() === '$$' ? 'close' : 'inside';
}

/** Match a complete `$$…$$` display-math block without consuming partial input. */
function matchDisplayMathBlock(
  lines: string[],
  lineIndex: number,
): DisplayMathMatch | null {
  const trimmed = lines[lineIndex].trim();
  if (
    trimmed.length > 4 &&
    trimmed.startsWith('$$') &&
    trimmed.endsWith('$$')
  ) {
    const value = trimmed.slice(2, -2);
    return value.trim() === ''
      ? null
      : {value, nextIndex: lineIndex + 1, endLine: lineIndex};
  }
  if (trimmed !== '$$') {
    return null;
  }
  for (let index = lineIndex + 1; index < lines.length; index++) {
    if (lines[index].trim() === '$$') {
      const value = lines.slice(lineIndex + 1, index).join('\n');
      return value.trim() === ''
        ? null
        : {
            value,
            nextIndex: index + 1,
            endLine: index,
          };
    }
  }
  return null;
}

function matchLinkDefinition(
  line: string,
): {label: string; destination: string; hasTitle: boolean} | null {
  const match = LINK_DEFINITION_RE.exec(line);
  if (match == null) {
    return null;
  }
  const label = normalizeLinkLabel(match[1]);
  // `match[2]` is the `<...>` destination (present but possibly empty, e.g.
  // `<>` → empty href, valid per CommonMark); `match[3]` is the bare
  // destination (always non-empty). One of the two always matches.
  const destination = match[2] != null ? match[2] : match[3];
  if (label === '' || destination == null) {
    return null;
  }
  return {label, destination, hasTitle: match[4] != null};
}

/**
 * Collect link reference definitions from the whole document and return the
 * input with the definition lines removed. A definition is recognized at a
 * block boundary — document start, after a blank line, after another
 * definition, or after a self-contained block (heading / thematic break /
 * closed fenced code) — but never inside a fenced code block or as a lazy
 * continuation of a paragraph, honoring CommonMark's rule that a definition
 * cannot interrupt a paragraph. First definition wins, and definitions produce
 * no output so stripping unreferenced ones is correct.
 *
 * Scope limit: definitions are collected at the top level only, and a
 * definition directly following a list, blockquote, or table (with no blank
 * line between) is not recognized. A definition nested inside a blockquote or
 * list item resolves within that container (via the recursive parse) but is
 * not exposed to references elsewhere in the document, unlike full CommonMark
 * where every definition is global. Separating a footer definition block with
 * a blank line — the usual form — always works.
 */
function extractLinkDefinitions(
  input: string,
  math = false,
): {
  defs: ReadonlyMap<string, string>;
  cleaned: string;
  /**
   * For each line of `cleaned`, the line of `input` it came from. Undefined
   * when nothing was stripped and the two are the same text.
   */
  lineMap?: number[];
} {
  const lines = input.split('\n');
  const defs = new Map<string, string>();
  const keep = new Array<boolean>(lines.length).fill(true);
  let atBoundary = true;
  let inFence = false;
  let fenceMarker = '';

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (inFence) {
      if (line.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = '';
        // The line after a closed fence begins a new block.
        atBoundary = true;
      } else {
        atBoundary = false;
      }
      continue;
    }
    if (math) {
      const displayMath = matchDisplayMathBlock(lines, index);
      if (displayMath != null) {
        // Math is opaque Markdown content: definition-shaped TeX must not leak
        // into the document-wide link-definition map.
        index = displayMath.endLine;
        atBoundary = true;
        continue;
      }
    }
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      inFence = true;
      fenceMarker = fenceMatch[1];
      atBoundary = false;
      continue;
    }
    if (line.trim() === '') {
      atBoundary = true;
      continue;
    }
    if (atBoundary) {
      const def = matchLinkDefinition(line);
      if (def != null) {
        if (!defs.has(def.label)) {
          defs.set(def.label, def.destination);
        }
        keep[index] = false;
        // A title-less definition absorbs a title on the following line
        // (CommonMark), which then also produces no output.
        if (
          !def.hasTitle &&
          index + 1 < lines.length &&
          LINK_TITLE_ONLY_RE.test(lines[index + 1])
        ) {
          keep[index + 1] = false;
          index++;
        }
        // Consecutive definitions stay at a block boundary.
        continue;
      }
    }
    // A heading or thematic break is a self-contained single-line block, so
    // the next line begins a new block where a definition may appear.
    atBoundary = /^ {0,3}#{1,6}(?: |\t|$)/.test(line) || isHorizontalRule(line);
  }

  if (defs.size === 0) {
    return {defs, cleaned: input};
  }
  const lineMap: number[] = [];
  for (let index = 0; index < lines.length; index++) {
    if (keep[index]) {
      lineMap.push(index);
    }
  }
  const cleaned = lineMap.map(index => lines[index]).join('\n');
  return {defs, cleaned, lineMap};
}

/** Order-independent signature of a citation-source set, for cache checks. */
function sourceIdsSignature(
  sourceIds: ReadonlySet<string> | undefined,
): string {
  return sourceIds == null || sourceIds.size === 0
    ? ''
    : [...sourceIds].sort().join('\u0000');
}

/** Order-independent signature of a link-definition set, for cache checks. */
function linkDefsSignature(defs: ReadonlyMap<string, string>): string {
  if (defs.size === 0) {
    return '';
  }
  return [...defs]
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([label, dest]) => `${label}\u0000${dest}`)
    .join('\u0001');
}

/**
 * Resolve a full (`[text][label]`), collapsed (`[text][]`), or shortcut
 * (`[text]`) reference at `start` (which points at `[`) against `linkDefs`.
 * Returns the node plus the index just past the reference, or null when it is
 * not a resolvable reference (caller falls through to literal handling).
 */
function protectedInlineOptions(opts: ResolvedOptions): ResolvedOptions {
  return opts.plugins == null ? opts : {...opts, plugins: undefined};
}

function matchReferenceLink(
  text: string,
  start: number,
  linkDefs: ReadonlyMap<string, string>,
  opts: ResolvedOptions,
): {
  node: MarkdownAstPhrasingContent<RuntimeExtensionNode>;
  end: number;
} | null {
  const textClose = text.indexOf(']', start + 1);
  if (textClose === -1) {
    return null;
  }
  const linkText = text.slice(start + 1, textClose);
  // Full `[text][label]` / collapsed `[text][]` — a matching definition wins.
  if (text[textClose + 1] === '[') {
    const labelClose = text.indexOf(']', textClose + 2);
    if (labelClose !== -1) {
      const rawLabel = text.slice(textClose + 2, labelClose);
      // Only truly-empty brackets are the collapsed form; a whitespace-only
      // label (`[ ]`) is a full reference whose normalized label is empty and
      // matches nothing.
      const label = rawLabel === '' ? linkText : rawLabel;
      const href = linkDefs.get(normalizeLinkLabel(label));
      if (href != null && isSafeMarkdownParserUrl(href)) {
        return {
          node: {
            type: 'link',
            url: href,
            children: parseInlineImpl(linkText, protectedInlineOptions(opts)),
          },
          end: labelClose + 1,
        };
      }
      // No match — fall back to a shortcut `[text]` (CommonMark back-off),
      // leaving the trailing `[label]` to be parsed separately.
    }
  }
  // Shortcut: `[text]`.
  if (linkText.trim() === '') {
    return null;
  }
  const href = linkDefs.get(normalizeLinkLabel(linkText));
  if (href == null || !isSafeMarkdownParserUrl(href)) {
    return null;
  }
  return {
    node: {
      type: 'link',
      url: href,
      children: parseInlineImpl(linkText, protectedInlineOptions(opts)),
    },
    end: textClose + 1,
  };
}

/** Reference-image equivalent of {@link matchReferenceLink} (`![alt][label]`). */
function matchReferenceImage(
  text: string,
  start: number,
  linkDefs: ReadonlyMap<string, string>,
): {
  node: MarkdownAstPhrasingContent<RuntimeExtensionNode>;
  end: number;
} | null {
  const altClose = text.indexOf(']', start + 2);
  if (altClose === -1) {
    return null;
  }
  const alt = text.slice(start + 2, altClose);
  if (text[altClose + 1] === '[') {
    const labelClose = text.indexOf(']', altClose + 2);
    if (labelClose !== -1) {
      const rawLabel = text.slice(altClose + 2, labelClose);
      const label = rawLabel === '' ? alt : rawLabel;
      const src = linkDefs.get(normalizeLinkLabel(label));
      if (src != null && isSafeMarkdownParserUrl(src)) {
        return {node: {type: 'image', url: src, alt}, end: labelClose + 1};
      }
      // No match — fall back to a shortcut `![alt]`.
    }
  }
  if (alt.trim() === '') {
    return null;
  }
  const src = linkDefs.get(normalizeLinkLabel(alt));
  if (src == null || !isSafeMarkdownParserUrl(src)) {
    return null;
  }
  return {node: {type: 'image', url: src, alt}, end: altClose + 1};
}

// ---------------------------------------------------------------------------
// Inline parser helpers
// ---------------------------------------------------------------------------

/** Find closing ')' that balances nested parentheses. */
function findClosingParen(text: string, start: number): number {
  let depth = 1;
  for (let index = start; index < text.length; index++) {
    if (text[index] === '(') {
      depth++;
    } else if (text[index] === ')') {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function isWordChar(ch: string | undefined): boolean {
  if (ch == null) {
    return false;
  }
  return /\w/.test(ch);
}

/** True when the character at `index` is preceded by an odd backslash run. */
function isEscaped(text: string, index: number): boolean {
  let backslashes = 0;
  for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) {
    backslashes++;
  }
  return backslashes % 2 === 1;
}

/**
 * Find the closing delimiter for `$…$` math on the same line.
 *
 * The whitespace and numeric-edge rules mirror common dollar-math parsers:
 * whitespace cannot hug the delimiters, a digit cannot sit immediately before
 * the opener or after the closer, and `$$` is reserved for display math. The
 * numeric guard prevents ordinary prose such as "$20 and $30" from becoming a
 * formula even in a math-enabled document.
 */
function isInlineMathStart(text: string, index: number): boolean {
  return (
    text[index] === '$' &&
    text[index - 1] !== '$' &&
    text[index + 1] !== '$' &&
    text[index + 1] != null &&
    !/\s/.test(text[index + 1]) &&
    !/\d/.test(text[index - 1] ?? '') &&
    !isEscaped(text, index)
  );
}

function findInlineMathEnd(text: string, start: number): number {
  if (!isInlineMathStart(text, start)) {
    return -1;
  }

  for (let index = start + 1; index < text.length; index++) {
    if (text[index] === '\n') {
      return -1;
    }
    if (text[index] !== '$' || isEscaped(text, index)) {
      continue;
    }
    // An unescaped dollar ends this candidate: it either forms a valid closer
    // or makes the whole span literal. Never skip over one and pair with a
    // later dollar, which would swallow currency or another expression.
    if (
      text[index - 1] === '$' ||
      text[index + 1] === '$' ||
      /\s/.test(text[index - 1]) ||
      /\d/.test(text[index + 1] ?? '')
    ) {
      return -1;
    }
    return index;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Inline parser
// ---------------------------------------------------------------------------

/**
 * Match a fullwidth bracket citation 【id】 at position `i`.
 * Returns the sourceId and end index, or null if no match.
 */
function matchFullwidthCitation(
  text: string,
  i: number,
  opts: ResolvedOptions,
): {sourceId: string; end: number} | null {
  if (!opts.sourceIds || text[i] !== '\u3010') {
    return null;
  }
  const closeIndex = text.indexOf('\u3011', i + 1);
  if (closeIndex === -1) {
    return null;
  }
  const id = text.slice(i + 1, closeIndex);
  if (id.length === 0 || !opts.sourceIds.has(id)) {
    return null;
  }
  return {sourceId: id, end: closeIndex + 1};
}

/**
 * Match a bracket citation [id] at position `i`.
 * Only matches if the id exists in sourceIds and is NOT followed by `(` (link).
 */
function matchBracketCitation(
  text: string,
  i: number,
  opts: ResolvedOptions,
): {sourceId: string; end: number} | null {
  if (!opts.sourceIds || text[i] !== '[') {
    return null;
  }
  const closeIndex = text.indexOf(']', i + 1);
  if (closeIndex === -1) {
    return null;
  }
  if (text[closeIndex + 1] === '(') {
    return null;
  }
  const id = text.slice(i + 1, closeIndex);
  if (id.length === 0 || !opts.sourceIds.has(id)) {
    return null;
  }
  return {sourceId: id, end: closeIndex + 1};
}

type ExtensionMatch =
  | {readonly status: 'none'}
  | {readonly status: 'defer'}
  | {
      readonly status: 'match';
      readonly node: RuntimeExtensionNode;
      readonly end: number;
    };

function currentLineStart(source: string, offset: number): number {
  return source.lastIndexOf('\n', offset - 1) + 1;
}

function matchExtensionSyntax(
  source: string,
  offset: number,
  context: 'inline' | 'block',
  opts: ResolvedOptions,
): ExtensionMatch {
  const byFirstCharacter =
    context === 'inline'
      ? opts.plugins?.inlineByFirstCharacter
      : opts.allowBlockSyntax === false
        ? undefined
        : opts.plugins?.blockByFirstCharacter;
  const candidates = byFirstCharacter?.get(source[offset]);
  if (candidates == null) {
    return {status: 'none'};
  }

  const seen = new Set<PreparedSyntaxContribution>();
  for (const candidate of candidates) {
    if (seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    let fullPrefix = false;
    for (const prefix of candidate.contribution.startsWith) {
      if (source.startsWith(prefix, offset)) {
        fullPrefix = true;
        break;
      }
      if (!opts.isFinal) {
        const remaining = source.slice(offset);
        if (remaining.length < prefix.length && prefix.startsWith(remaining)) {
          return {status: 'defer'};
        }
      }
    }
    if (!fullPrefix) {
      continue;
    }

    const end = Math.min(
      source.length,
      offset + candidate.contribution.maxSpan,
    );
    let result: ReturnType<typeof candidate.contribution.tokenize>;
    try {
      result = candidate.contribution.tokenize({
        source: end === source.length ? source : source.slice(0, end),
        offset,
        end,
        isFinal: opts.isFinal,
        context,
        lineStart: currentLineStart(source, offset),
        column: offset - currentLineStart(source, offset),
      });
    } catch (error) {
      reportMarkdownPluginFailure(candidate.pluginName, 'syntax', error);
      continue;
    }
    if (
      result == null ||
      typeof result !== 'object' ||
      typeof (result as {then?: unknown}).then === 'function'
    ) {
      reportMarkdownPluginFailure(
        candidate.pluginName,
        'syntax',
        new TypeError('Tokenizer returned an invalid result'),
      );
      continue;
    }
    if (result.status === 'no-match') {
      continue;
    }
    if (result.status === 'defer') {
      return !opts.isFinal &&
        end === source.length &&
        source.length - offset < candidate.contribution.maxSpan
        ? {status: 'defer'}
        : {status: 'none'};
    }
    const rawNode = (result as {readonly node?: unknown}).node;
    if (rawNode == null || typeof rawNode !== 'object') {
      reportMarkdownPluginFailure(
        candidate.pluginName,
        'syntax',
        new TypeError('Tokenizer returned an invalid extension node'),
      );
      continue;
    }
    const nodeRecord = rawNode as Record<string, unknown>;
    const content = getMarkdownExtensionContent(
      opts.plugins,
      nodeRecord as unknown as RuntimeExtensionNode,
    );
    const childrenRange = (result as {readonly children?: unknown}).children as
      {readonly start?: unknown; readonly end?: unknown} | undefined;
    const hasContainerContent = content != null && content !== 'none';
    if (
      result.status !== 'match' ||
      !Number.isInteger(result.end) ||
      result.end <= offset ||
      result.end > end ||
      nodeRecord.type !== 'extension' ||
      nodeRecord.plugin !== candidate.pluginName ||
      (nodeRecord.display !== 'inline' && nodeRecord.display !== 'block') ||
      nodeRecord.display !== context ||
      typeof nodeRecord.name !== 'string' ||
      nodeRecord.name.trim() === '' ||
      !isMarkdownPluginData(nodeRecord.data) ||
      'children' in nodeRecord ||
      content == null ||
      (content === 'phrasing' && nodeRecord.display !== 'inline') ||
      (content === 'flow' && nodeRecord.display !== 'block') ||
      (hasContainerContent &&
        (childrenRange == null ||
          !Number.isInteger(childrenRange.start) ||
          !Number.isInteger(childrenRange.end) ||
          (childrenRange.start as number) <= offset ||
          (childrenRange.end as number) < (childrenRange.start as number) ||
          (childrenRange.end as number) > result.end)) ||
      (!hasContainerContent && childrenRange != null)
    ) {
      reportMarkdownPluginFailure(
        candidate.pluginName,
        'syntax',
        new TypeError('Tokenizer returned an invalid extension node'),
      );
      continue;
    }

    let children: ReadonlyArray<unknown> | undefined;
    if (hasContainerContent && childrenRange != null) {
      const containerDepth = (opts.containerDepth ?? 0) + 1;
      if (containerDepth > MAX_MARKDOWN_CONTAINER_DEPTH) {
        reportMarkdownPluginFailure(
          candidate.pluginName,
          'syntax',
          new TypeError('Markdown extension container depth exceeded'),
        );
        continue;
      }
      const childStart = childrenRange.start as number;
      const childEnd = childrenRange.end as number;
      const childOptions: ResolvedOptions = {
        ...opts,
        allowBlockSyntax: true,
        baseOffset: (opts.baseOffset ?? 0) + childStart,
        containerDepth,
        isFinal: true,
      };
      const childSource = source.slice(childStart, childEnd);
      children =
        nodeRecord.display === 'inline'
          ? parseInlineEntry(childSource, childOptions)
          : parseMarkdownImpl(childSource, childOptions);
    }

    const {
      source: _ignoredSource,
      position: _ignoredPosition,
      children: _ignoredChildren,
      ...safeNode
    } = nodeRecord;
    const absoluteStart = (opts.baseOffset ?? 0) + offset;
    const absoluteEnd = (opts.baseOffset ?? 0) + result.end;
    const extensionNode = Object.freeze({
      ...safeNode,
      data: freezeMarkdownPluginData(nodeRecord.data),
      ...(children == null ? null : {children: Object.freeze(children)}),
      source: source.slice(offset, result.end),
      ...(opts.sourceRanges && context === 'block'
        ? {
            position: Object.freeze({
              start: Object.freeze({offset: absoluteStart}),
              end: Object.freeze({offset: absoluteEnd}),
            }),
          }
        : null),
    }) as RuntimeExtensionNode;
    if (!validateMarkdownExtensionContent(opts.plugins, extensionNode)) {
      reportMarkdownPluginFailure(
        candidate.pluginName,
        'syntax',
        new TypeError('Tokenizer returned children outside declared content'),
      );
      continue;
    }
    return {
      status: 'match',
      end: result.end,
      node: extensionNode,
    };
  }
  return {status: 'none'};
}

type ParseOptionsWithoutPlugins = Omit<ParseOptions, 'plugins'>;
type MathParseOptionsWithoutPlugins = Omit<MathParseOptions, 'plugins'>;
type IncrementalParseOptionsWithoutPlugins = Omit<
  IncrementalParseOptions,
  'plugins'
>;
type IncrementalMathParseOptionsWithoutPlugins = Omit<
  IncrementalMathParseOptions,
  'plugins'
>;

export function parseInline(
  text: string,
  sourceIds?: ReadonlySet<string>,
): InlineNode[];
export function parseInline(
  text: string,
  options: MathParseOptionsWithoutPlugins,
): InlineNodeWithMath[];
export function parseInline(
  text: string,
  options: ParseOptionsWithoutPlugins,
): InlineNode[];
export function parseInline<
  const Plugins extends ReadonlyArray<MarkdownPluginEntry>,
>(
  text: string,
  options: ParseOptionsWithoutPlugins & {plugins: Plugins},
): InlineNode<MarkdownExtensionsOf<Plugins>>[];
export function parseInline<
  const Plugins extends ReadonlyArray<MarkdownPluginEntry>,
>(
  text: string,
  options: MathParseOptionsWithoutPlugins & {plugins: Plugins},
): InlineNodeWithMath<MarkdownExtensionsOf<Plugins>>[];
export function parseInline(
  text: string,
  arg?: ReadonlySet<string> | RuntimeParseOptions,
): RuntimeInlineNode[] {
  return projectInlineNodes(
    parseInlineAstRuntime(text, arg),
    wantsLegacyRanges(arg),
  );
}

/**
 * Parse inline Markdown into the canonical immutable Astryx AST.
 *
 * Unlike `parseInline`, this returns MDAST-aligned node names and fields. Math
 * nodes are present only when `math: true`, and plugin extension nodes are
 * inferred from the ordered `plugins` tuple.
 */
export function parseInlineAst(
  text: string,
  sourceIds?: ReadonlySet<string>,
): MarkdownAstPhrasingContent[];
export function parseInlineAst(
  text: string,
  options: ParseOptionsWithoutPlugins | MathParseOptionsWithoutPlugins,
): MarkdownAstPhrasingContent[];
export function parseInlineAst<
  const Plugins extends ReadonlyArray<MarkdownPluginEntry>,
>(
  text: string,
  options: (ParseOptionsWithoutPlugins | MathParseOptionsWithoutPlugins) & {
    plugins: Plugins;
  },
): MarkdownAstPhrasingContent<MarkdownExtensionsOf<Plugins>>[];
export function parseInlineAst(
  text: string,
  arg?: ReadonlySet<string> | RuntimeParseOptions,
): MarkdownAstPhrasingContent<RuntimeExtensionNode>[] {
  return parseInlineAstRuntime(text, arg);
}

function parseInlineAstRuntime(
  text: string,
  arg?: ReadonlySet<string> | RuntimeParseOptions,
): MarkdownAstPhrasingContent<RuntimeExtensionNode>[] {
  const opts = resolveOptions(arg);
  const nodes = parseInlineEntry(text, opts);
  if ((opts.plugins?.transforms.length ?? 0) === 0) {
    return nodes;
  }
  const transformed = applyMarkdownTransforms(
    {type: 'root', children: [{type: 'paragraph', children: nodes}]},
    opts.plugins,
    text,
    opts.isFinal,
    'inline',
  );
  const paragraph = transformed.children[0];
  return paragraph?.type === 'paragraph' ? [...paragraph.children] : nodes;
}

/**
 * Internal block-level inline entry point: parses, then applies the GFM
 * autolink transform when enabled. Recursive calls inside `parseInlineImpl`
 * (link labels, bold/italic/strikethrough bodies) intentionally bypass this
 * wrapper and call `parseInlineImpl` directly so the transform runs only on
 * the outermost block's inline tree — letting `transformAutolinks` decide
 * which subtrees to descend into (text, bold, italic, strikethrough) and
 * which to skip (link, code, math, image, citation, break).
 */
function parseInlineEntry(
  text: string,
  opts: ResolvedOptions,
): MarkdownAstPhrasingContent<RuntimeExtensionNode>[] {
  const nodes = parseInlineImpl(text, opts);
  return opts.autolink === 'gfm' ? transformAutolinks(nodes) : nodes;
}

function parseInlineImpl(
  text: string,
  opts: ResolvedOptions,
): MarkdownAstPhrasingContent<RuntimeExtensionNode>[] {
  const nodes: MarkdownAstPhrasingContent<RuntimeExtensionNode>[] = [];
  // Only a plugin that actually contributes INLINE syntax may cost anything
  // per source position. A transform-only list contributes none, so it takes
  // the same path as an omitted or empty one: no candidate probe per
  // position, and no map lookup per character in the plain-text scan below.
  const inlineExtensionStarts =
    opts.plugins != null && opts.plugins.inlineByFirstCharacter.size > 0
      ? opts.plugins.inlineByFirstCharacter
      : undefined;
  let i = 0;

  while (i < text.length) {
    // --- Escape ---
    if (text[i] === '\\' && i + 1 < text.length) {
      nodes.push({type: 'text', value: text[i + 1]});
      i += 2;
      continue;
    }

    // --- Inline code ---
    if (text[i] === '`') {
      const tickCount = text[i + 1] === '`' ? (text[i + 2] === '`' ? 3 : 2) : 1;
      const openIndex = i + tickCount;
      const closeIndex = text.indexOf('`'.repeat(tickCount), openIndex);
      if (closeIndex !== -1) {
        nodes.push({
          type: 'inlineCode',
          value: text.slice(openIndex, closeIndex),
        });
        i = closeIndex + tickCount;
        continue;
      }
    }

    // --- Inline math (opt-in; code takes precedence) ---
    if (opts.math && text[i] === '$') {
      const closeIndex = findInlineMathEnd(text, i);
      if (closeIndex !== -1) {
        nodes.push({
          type: 'inlineMath',
          value: text.slice(i + 1, closeIndex),
        });
        i = closeIndex + 1;
        continue;
      }
    }

    // --- Citation: fullwidth 【id】 ---
    {
      const citation = matchFullwidthCitation(text, i, opts);
      if (citation) {
        nodes.push({type: 'citation', sourceId: citation.sourceId});
        i = citation.end;
        continue;
      }
    }

    // --- Image ![alt](src) ---
    if (text[i] === '!' && text[i + 1] === '[') {
      const altClose = text.indexOf(']', i + 2);
      if (altClose !== -1 && text[altClose + 1] === '(') {
        const srcClose = findClosingParen(text, altClose + 2);
        if (srcClose !== -1) {
          const src = text.slice(altClose + 2, srcClose);
          if (!isSafeMarkdownParserUrl(src)) {
            // Dangerous scheme — emit as plain text.
            nodes.push({type: 'text', value: text.slice(i, srcClose + 1)});
          } else {
            nodes.push({
              type: 'image',
              url: src,
              alt: text.slice(i + 2, altClose),
            });
          }
          i = srcClose + 1;
          continue;
        }
      }
    }

    // --- Reference image ![alt][label] / ![alt][] / ![alt] ---
    if (opts.linkDefs != null && text[i] === '!' && text[i + 1] === '[') {
      const ref = matchReferenceImage(text, i, opts.linkDefs);
      if (ref) {
        nodes.push(ref.node);
        i = ref.end;
        continue;
      }
    }

    // --- Citation: bracket [id] (before link — link requires `(` after `]`) ---
    {
      const citation = matchBracketCitation(text, i, opts);
      if (citation) {
        nodes.push({type: 'citation', sourceId: citation.sourceId});
        i = citation.end;
        continue;
      }
    }

    // --- Link [text](url) ---
    if (text[i] === '[') {
      const textClose = text.indexOf(']', i + 1);
      if (textClose !== -1 && text[textClose + 1] === '(') {
        const urlClose = findClosingParen(text, textClose + 2);
        if (urlClose !== -1) {
          const href = text.slice(textClose + 2, urlClose);
          if (!isSafeMarkdownParserUrl(href)) {
            // Dangerous scheme — emit as plain text instead of a link.
            nodes.push({type: 'text', value: text.slice(i, urlClose + 1)});
          } else {
            nodes.push({
              type: 'link',
              url: href,
              children: parseInlineImpl(
                text.slice(i + 1, textClose),
                protectedInlineOptions(opts),
              ),
            });
          }
          i = urlClose + 1;
          continue;
        }
      }
    }

    // --- Reference link [text][label] / [text][] / [text] ---
    if (opts.linkDefs != null && text[i] === '[') {
      const ref = matchReferenceLink(text, i, opts.linkDefs, opts);
      if (ref) {
        nodes.push(ref.node);
        i = ref.end;
        continue;
      }
    }

    // --- Bold-italic: *** or ___ ---
    if (
      (text[i] === '*' && text[i + 1] === '*' && text[i + 2] === '*') ||
      (text[i] === '_' && text[i + 1] === '_' && text[i + 2] === '_')
    ) {
      const marker = text.slice(i, i + 3);
      const isUnderscore = text[i] === '_';
      if (isUnderscore && isWordChar(text[i - 1])) {
        // mid-word underscore — fall through
      } else {
        const closeIndex = text.indexOf(marker, i + 3);
        if (
          closeIndex !== -1 &&
          (!isUnderscore || !isWordChar(text[closeIndex + 3]))
        ) {
          nodes.push({
            type: 'strong',
            children: [
              {
                type: 'emphasis',
                children: parseInlineImpl(text.slice(i + 3, closeIndex), opts),
              },
            ],
          });
          i = closeIndex + 3;
          continue;
        }
      }
    }

    // --- Bold: ** or __ ---
    if (
      (text[i] === '*' && text[i + 1] === '*') ||
      (text[i] === '_' && text[i + 1] === '_')
    ) {
      const marker = text.slice(i, i + 2);
      const isUnderscore = text[i] === '_';
      if (isUnderscore && isWordChar(text[i - 1])) {
        // mid-word underscore — fall through
      } else {
        const closeIndex = text.indexOf(marker, i + 2);
        if (
          closeIndex !== -1 &&
          (!isUnderscore || !isWordChar(text[closeIndex + 2]))
        ) {
          nodes.push({
            type: 'strong',
            children: parseInlineImpl(text.slice(i + 2, closeIndex), opts),
          });
          i = closeIndex + 2;
          continue;
        }
      }
    }

    // --- Strikethrough: ~~ ---
    if (text[i] === '~' && text[i + 1] === '~') {
      const closeIndex = text.indexOf('~~', i + 2);
      if (closeIndex !== -1) {
        nodes.push({
          type: 'delete',
          children: parseInlineImpl(text.slice(i + 2, closeIndex), opts),
        });
        i = closeIndex + 2;
        continue;
      }
    }

    // --- Italic: * or _ ---
    if (text[i] === '*' || text[i] === '_') {
      const isUnderscore = text[i] === '_';
      if (isUnderscore && isWordChar(text[i - 1])) {
        // mid-word underscore — fall through
      } else {
        const closeIndex = text.indexOf(text[i], i + 1);
        if (
          closeIndex !== -1 &&
          closeIndex > i + 1 &&
          (!isUnderscore || !isWordChar(text[closeIndex + 1]))
        ) {
          nodes.push({
            type: 'emphasis',
            children: parseInlineImpl(text.slice(i + 1, closeIndex), opts),
          });
          i = closeIndex + 1;
          continue;
        }
      }
    }

    // --- Extension syntax (built-ins and protected contexts win) ---
    if (inlineExtensionStarts !== undefined) {
      const extension = matchExtensionSyntax(text, i, 'inline', opts);
      if (extension.status === 'match') {
        nodes.push(
          extension.node as Extract<RuntimeExtensionNode, {display: 'inline'}>,
        );
        i = extension.end;
        continue;
      }
      if (extension.status === 'defer') {
        break;
      }
    }

    // --- Plain text (with line-break detection) ---
    let end = i + 1;
    while (
      end < text.length &&
      !'*_~`[!\\\n\u3010'.includes(text[end]) &&
      !(opts.math && text[end] === '$') &&
      (inlineExtensionStarts === undefined ||
        !inlineExtensionStarts.has(text[end]))
    ) {
      end++;
    }

    const content = text.slice(i, end);

    // Detect trailing-space line break: 2+ spaces immediately before \n
    if (end < text.length && text[end] === '\n') {
      const trimmed = content.replace(/ +$/, '');
      if (content.length - trimmed.length >= 2) {
        if (trimmed.length > 0) {
          const last = nodes[nodes.length - 1];
          if (last?.type === 'text') {
            nodes[nodes.length - 1] = {
              ...last,
              value: last.value + trimmed,
            };
          } else {
            nodes.push({type: 'text', value: trimmed});
          }
        }
        nodes.push({type: 'break'});
        i = end + 1;
        continue;
      }
    }

    const last = nodes[nodes.length - 1];
    if (last?.type === 'text') {
      nodes[nodes.length - 1] = {...last, value: last.value + content};
    } else {
      nodes.push({type: 'text', value: content});
    }
    i = end;
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// GFM autolink post-pass (opt-in via ParseOptions.autolink === 'gfm')
// ---------------------------------------------------------------------------

// Character classes used in autolink patterns.
const ANY_NON_WHITESPACE_OR_ANGLE = '[^\\s<]+';
const SCHEME = 'https?:\\/\\/';
const EMAIL_LOCAL_PART = '[A-Za-z0-9._%+-]+';
const DOMAIN_LABEL = '[A-Za-z0-9-]+';
const DOMAIN_WITH_DOT = `${DOMAIN_LABEL}(?:\\.${DOMAIN_LABEL})+`;
const ANGLE_SCHEME = '[a-zA-Z][a-zA-Z0-9+.-]*';
const ANGLE_URL_BODY = '[^<>\\s]*';

/** Bare http(s) URL up to whitespace or `<`. Trailing punctuation is peeled afterwards. */
const URL_LITERAL_RE = new RegExp(
  `${SCHEME}${ANY_NON_WHITESPACE_OR_ANGLE}`,
  'g',
);

/** Bare www. URL. Resulting href gets `http://` prepended. */
const WWW_LITERAL_RE = new RegExp(`www\\.${ANY_NON_WHITESPACE_OR_ANGLE}`, 'g');

/** Bare email: local-part@domain (at least one dot in domain). */
const EMAIL_LITERAL_RE = new RegExp(
  `${EMAIL_LOCAL_PART}@${DOMAIN_WITH_DOT}`,
  'g',
);

/** Angle-bracket autolink: `<scheme:url>` (CommonMark §6.5). */
const ANGLE_URL_RE = new RegExp(`<(${ANGLE_SCHEME}:${ANGLE_URL_BODY})>`, 'g');

/** Angle-bracket email: `<user@host.tld>`. */
const ANGLE_EMAIL_RE = new RegExp(
  `<(${EMAIL_LOCAL_PART}@${DOMAIN_WITH_DOT})>`,
  'g',
);

/** Characters treated as trailing sentence punctuation per GFM §6.9. */
const TRAILING_PUNCT_CHARS = new Set('?!.,:*_~');

/** Characters valid in an email local part (used for boundary detection). */
const EMAIL_LOCAL_CHARS = new Set(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._%+-@',
);

interface AutolinkMatch {
  start: number;
  end: number;
  href: string;
  display: string;
}

/**
 * Peel trailing sentence-end punctuation and unbalanced trailing `)` off a
 * bare URL. Mirrors GFM §6.9: `?!.,:*_~` immediately after the URL aren't
 * part of it; a trailing `)` is excluded if there are more `)` than `(` in
 * the candidate (so `(https://example.com)` ends at the second `)` but
 * `https://example.com/Foo_(bar)` keeps the inner pair).
 */
function peelTrailingPunctAndParens(url: string): string {
  let s = url;
  while (s.length > 0) {
    // Peel trailing punctuation characters in one pass.
    if (TRAILING_PUNCT_CHARS.has(s[s.length - 1])) {
      let end = s.length - 1;
      while (end > 0 && TRAILING_PUNCT_CHARS.has(s[end - 1])) {
        end--;
      }
      s = s.slice(0, end);
      continue;
    }
    if (s.endsWith(')')) {
      let open = 0;
      let close = 0;
      for (let idx = 0; idx < s.length; idx++) {
        if (s[idx] === '(') {
          open++;
        } else if (s[idx] === ')') {
          close++;
        }
      }
      if (close > open) {
        s = s.slice(0, -1);
        continue;
      }
    }
    break;
  }
  return s;
}

/** Characters that, when preceding a URL, indicate it's part of a larger token. */
const URL_CONTINUATION_CHARS = new Set(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/=',
);

/**
 * The character immediately before a bare-URL or bare-www match must not
 * make the URL look like the tail of a larger token (`xhttps`, `=https://`,
 * `/https://`). null means start-of-text — always allowed.
 */
function isUrlBoundaryChar(ch: string | undefined): boolean {
  if (ch == null) {
    return true;
  }
  return !URL_CONTINUATION_CHARS.has(ch);
}

function scanAutolinksInText(text: string): AutolinkMatch[] {
  const matches: AutolinkMatch[] = [];

  // <scheme:url> angle-bracket form
  {
    const re = new RegExp(ANGLE_URL_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const url = m[1];
      // Skip dangerous URL schemes (javascript:, vbscript:, data:text/html)
      if (!isSafeMarkdownParserUrl(url)) {
        continue;
      }
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        href: url,
        display: url,
      });
    }
  }

  // <email> angle-bracket form
  {
    const re = new RegExp(ANGLE_EMAIL_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const email = m[1];
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        href: `mailto:${email}`,
        display: email,
      });
    }
  }

  // bare https?:// URL
  {
    const re = new RegExp(URL_LITERAL_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const prev = text[m.index - 1];
      if (!isUrlBoundaryChar(prev)) {
        continue;
      }
      if (text.slice(m.index - 2, m.index) === '](') {
        continue;
      }
      const cleaned = peelTrailingPunctAndParens(m[0]);
      if (cleaned.length === 0) {
        continue;
      }
      matches.push({
        start: m.index,
        end: m.index + cleaned.length,
        href: cleaned,
        display: cleaned,
      });
    }
  }

  // bare www. URL
  {
    const re = new RegExp(WWW_LITERAL_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const prev = text[m.index - 1];
      if (!isUrlBoundaryChar(prev)) {
        continue;
      }
      // Don't match inside an https://www… capture from the previous pattern
      if (text.slice(m.index - 3, m.index) === '://') {
        continue;
      }
      const cleaned = peelTrailingPunctAndParens(m[0]);
      if (cleaned.length === 0) {
        continue;
      }
      matches.push({
        start: m.index,
        end: m.index + cleaned.length,
        href: `http://${cleaned}`,
        display: cleaned,
      });
    }
  }

  // bare email
  {
    const re = new RegExp(EMAIL_LITERAL_RE.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const prev = text[m.index - 1];
      // Reject if previous char could be part of the local part or sits in
      // a position that would make this match continuation of something
      // bigger (`name@x.y@host`, `foo+bar@x`, `mailto:user@host`).
      if (prev != null && EMAIL_LOCAL_CHARS.has(prev)) {
        continue;
      }
      if (text.slice(Math.max(0, m.index - 7), m.index) === 'mailto:') {
        continue;
      }
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        href: `mailto:${m[0]}`,
        display: m[0],
      });
    }
  }

  // Sort by start; first-match-wins on overlaps so e.g. an angle-bracket
  // <https://x> outranks the bare https://x inside it.
  matches.sort((a, b) => a.start - b.start);
  const resolved: AutolinkMatch[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      resolved.push(m);
      lastEnd = m.end;
    }
  }
  return resolved;
}

/**
 * Split a text-node `content` string into a sequence of text + link nodes
 * based on autolink matches.
 */
function splitTextOnAutolinks(
  content: string,
): MarkdownAstPhrasingContent<RuntimeExtensionNode>[] {
  const matches = scanAutolinksInText(content);
  if (matches.length === 0) {
    return [{type: 'text', value: content}];
  }
  const out: MarkdownAstPhrasingContent<RuntimeExtensionNode>[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) {
      out.push({type: 'text', value: content.slice(cursor, m.start)});
    }
    out.push({
      type: 'link',
      url: m.href,
      children: [{type: 'text', value: m.display}],
    });
    cursor = m.end;
  }
  if (cursor < content.length) {
    out.push({type: 'text', value: content.slice(cursor)});
  }
  return out;
}

/**
 * Walk an inline-node tree and replace bare URLs / emails inside `text`
 * nodes with `link` nodes. Recurses into emphasis containers
 * (`bold`/`italic`/`strikethrough`) so wrapped URLs link too, but never
 * descends into existing `link` children (no nested links), `code` content,
 * `image` alt text, `citation`, or `break`. Runs only on the outermost
 * block's inline tree (see `parseInlineEntry`).
 */
function transformAutolinks(
  nodes: ReadonlyArray<MarkdownAstPhrasingContent<RuntimeExtensionNode>>,
): MarkdownAstPhrasingContent<RuntimeExtensionNode>[] {
  const out: MarkdownAstPhrasingContent<RuntimeExtensionNode>[] = [];
  for (const node of nodes) {
    if (node.type === 'text') {
      const split = splitTextOnAutolinks(node.value);
      for (const seg of split) {
        const last = out[out.length - 1];
        if (seg.type === 'text' && last?.type === 'text') {
          out[out.length - 1] = {...last, value: last.value + seg.value};
        } else {
          out.push(seg);
        }
      }
    } else if (
      node.type === 'strong' ||
      node.type === 'emphasis' ||
      node.type === 'delete'
    ) {
      out.push({...node, children: transformAutolinks(node.children)});
    } else {
      out.push(node);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Block parser helpers
// ---------------------------------------------------------------------------

function getIndent(line: string): number {
  let count = 0;
  while (count < line.length && line[count] === ' ') {
    count++;
  }
  return count;
}

/** HR: 3+ identical markers (-, *, _) optionally separated by spaces. */
function isHorizontalRule(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3) {
    return false;
  }
  const stripped = trimmed.replace(/ /g, '');
  if (stripped.length < 3) {
    return false;
  }
  const ch = stripped[0];
  if (ch !== '-' && ch !== '*' && ch !== '_') {
    return false;
  }
  for (let idx = 1; idx < stripped.length; idx++) {
    if (stripped[idx] !== ch) {
      return false;
    }
  }
  return true;
}

/**
 * Whether a line holds a pipe that could delimit table cells.
 *
 * A backslash-escaped `\|` is literal text inside one cell — `splitTableRow`
 * keeps it verbatim — so a line whose only pipes are escaped shows no partial
 * table syntax while it streams. Used by `trimUnsettledStructural` to decide
 * whether an unfinished trailing line is a table header worth holding back.
 */
function hasUnescapedPipe(line: string): boolean {
  for (let index = 0; index < line.length; index++) {
    if (line[index] === '\\') {
      // Skip the escaped character, whatever it is.
      index++;
      continue;
    }
    if (line[index] === '|') {
      return true;
    }
  }
  return false;
}

/** GFM separator row: cells contain only dashes/colons. */
function isTableSeparator(line: string): boolean {
  if (!line.includes('|')) {
    return false;
  }
  const cells = line.split('|').map(cell => cell.trim());
  const nonEmpty = cells.filter(cell => cell.length > 0);
  return nonEmpty.length > 0 && nonEmpty.every(cell => /^:?-+:?$/.test(cell));
}

/**
 * The same options for content parsed out of an enclosing block. Ranges are a
 * top-level contract: a list item's or a blockquote's children are parsed from
 * text the caller reassembled (markers and `>` prefixes stripped), so an
 * offset into it would not address the document.
 */
function nested(opts: ResolvedOptions): ResolvedOptions {
  const nestedOptions =
    opts.allowBlockSyntax === false ? opts : {...opts, allowBlockSyntax: false};
  return nestedOptions.sourceRanges || nestedOptions.astPositions
    ? {...nestedOptions, sourceRanges: false, astPositions: false}
    : nestedOptions;
}

function blockExtensionColumn(line: string): number | null {
  const indentation = line.length - line.trimStart().length;
  return indentation <= 3 ? indentation : null;
}

/**
 * Returns true when a line could start a new block — used to stop paragraph
 * continuation.  Every regex here uses bounded or single-class quantifiers
 * to avoid ReDoS.
 */
function isBlockStart(line: string): boolean {
  if (/^#{1,6} /.test(line)) {
    return true;
  }
  if (/^(`{3,}|~{3,})/.test(line)) {
    return true;
  }
  if (isHorizontalRule(line)) {
    return true;
  }
  if (line.startsWith('> ') || line === '>') {
    return true;
  }
  if (/^ {0,9}[-*+] /.test(line)) {
    return true;
  }
  if (/^ {0,9}0*1[.)] /.test(line)) {
    return true;
  }
  if (line.includes('|')) {
    return true;
  }
  return false;
}

function splitTableRow(line: string): string[] {
  let start = 0;
  let end = line.length;
  if (line.startsWith('|')) {
    start = 1;
    while (start < end && line[start] === ' ') {
      start++;
    }
  }
  while (end > start && line[end - 1] === ' ') {
    end--;
  }
  if (end > start && line[end - 1] === '|') {
    end--;
  }
  // Split on unescaped pipes (not preceded by backslash)
  const content = line.slice(start, end);
  const cells: string[] = [];
  let current = '';
  for (let i = 0; i < content.length; i++) {
    if (
      content[i] === '\\' &&
      i + 1 < content.length &&
      content[i + 1] === '|'
    ) {
      // Escaped pipe — keep the backslash-pipe literal for parseInline to handle
      current += '\\|';
      i++;
    } else if (content[i] === '|') {
      cells.push(current.trim());
      current = '';
    } else {
      current += content[i];
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseTable(
  lines: string[],
  lineIndex: number,
  opts: ResolvedOptions,
): {node: MarkdownAstBlockContent<RuntimeExtensionNode>; nextIndex: number} {
  const headers: MarkdownAstTableCell<RuntimeExtensionNode>[] = splitTableRow(
    lines[lineIndex],
  ).map(cell => ({type: 'tableCell', children: parseInlineEntry(cell, opts)}));
  const alignments: TableAlignment[] = splitTableRow(lines[lineIndex + 1]).map(
    cell => {
      const trimmed = cell.trim();
      const leftAligned = trimmed.startsWith(':');
      const rightAligned = trimmed.endsWith(':');
      return leftAligned && rightAligned
        ? 'center'
        : rightAligned
          ? 'right'
          : leftAligned
            ? 'left'
            : null;
    },
  );
  const rows: MarkdownAstTableRow<RuntimeExtensionNode>[] = [];
  let rowIndex = lineIndex + 2;
  while (
    rowIndex < lines.length &&
    lines[rowIndex].includes('|') &&
    lines[rowIndex].trim() !== ''
  ) {
    rows.push({
      type: 'tableRow',
      children: splitTableRow(lines[rowIndex]).map(cell => ({
        type: 'tableCell',
        children: parseInlineEntry(cell, opts),
      })),
    });
    rowIndex++;
  }
  const header: MarkdownAstTableRow<RuntimeExtensionNode> = {
    type: 'tableRow',
    children: headers,
  };
  return {
    node: {
      type: 'table',
      align: alignments,
      children: [header, ...rows],
    },
    nextIndex: rowIndex,
  };
}

function parseList(
  lines: string[],
  startIndex: number,
  ordered: boolean,
  opts: ResolvedOptions,
): {node: MarkdownAstBlockContent<RuntimeExtensionNode>; nextIndex: number} {
  const items: MarkdownAstListItem<RuntimeExtensionNode>[] = [];
  const baseIndent = getIndent(lines[startIndex]);
  // Ordered lists may use either '.' or ')' as the marker delimiter
  // (CommonMark 5.2). Capture which one this list starts with so its items
  // must all share it — a change of delimiter starts a new list.
  const orderedStart = ordered
    ? lines[startIndex].match(/^ *(\d+)([.)]) /)
    : null;
  const delim = orderedStart ? orderedStart[2] : '.';
  const escDelim = `\\${delim}`;
  const itemPattern = ordered
    ? new RegExp(`^ {${baseIndent}}\\d+${escDelim} `)
    : new RegExp(`^ {${baseIndent}}[-*+] `);

  const start = orderedStart ? parseInt(orderedStart[1], 10) : undefined;

  let loose = false;
  let index = startIndex;
  while (index < lines.length && itemPattern.test(lines[index])) {
    const content = ordered
      ? lines[index].replace(new RegExp(`^ *\\d+${escDelim} `), '')
      : lines[index].replace(/^ *[-*+] /, '');

    const taskMatch = content.match(/^\[([ xX])\] (.*)/);
    let checked: boolean | undefined;
    let itemText: string;
    if (taskMatch) {
      checked = taskMatch[1].toLowerCase() === 'x';
      itemText = taskMatch[2];
    } else {
      itemText = content;
    }

    index++;

    // Collect sub-content (nested items or continuation lines)
    const subLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() !== '' &&
      getIndent(lines[index]) > baseIndent
    ) {
      subLines.push(lines[index]);
      index++;
    }

    if (subLines.length > 0) {
      const minSubIndent = Math.min(
        ...subLines.map(subLine => getIndent(subLine)),
      );
      const deindented = subLines.map(subLine => subLine.slice(minSubIndent));
      itemText += '\n' + deindented.join('\n');
    }

    items.push({
      type: 'listItem',
      checked,
      children: parseMarkdownImpl(itemText, nested(opts)),
    });

    // CommonMark loose list: blank line(s) between items of the same style
    // and indent still form one list. Skip the blanks and continue if the
    // next non-blank line matches the same item pattern.
    let lookahead = index;
    while (lookahead < lines.length && lines[lookahead].trim() === '') {
      lookahead++;
    }
    if (
      lookahead > index &&
      lookahead < lines.length &&
      itemPattern.test(lines[lookahead])
    ) {
      loose = true;
      index = lookahead;
    }
  }
  const node: MarkdownAstList<RuntimeExtensionNode> = {
    type: 'list',
    ordered,
    start,
    delimiter: ordered ? (delim as '.' | ')') : undefined,
    spread: loose || undefined,
    children: items,
  };
  return {node, nextIndex: index};
}

// ---------------------------------------------------------------------------
// Main block parser
// ---------------------------------------------------------------------------

export function parseMarkdown(
  input: string,
  sourceIds?: ReadonlySet<string>,
): BlockNode[];
export function parseMarkdown(
  input: string,
  options: MathParseOptionsWithoutPlugins,
): BlockNodeWithMath[];
export function parseMarkdown(
  input: string,
  options: ParseOptionsWithoutPlugins,
): BlockNode[];
export function parseMarkdown<
  const Plugins extends ReadonlyArray<MarkdownPluginEntry>,
>(
  input: string,
  options: ParseOptionsWithoutPlugins & {plugins: Plugins},
): BlockNode<MarkdownExtensionsOf<Plugins>>[];
export function parseMarkdown<
  const Plugins extends ReadonlyArray<MarkdownPluginEntry>,
>(
  input: string,
  options: MathParseOptionsWithoutPlugins & {plugins: Plugins},
): BlockNodeWithMath<MarkdownExtensionsOf<Plugins>>[];
export function parseMarkdown(
  input: string,
  arg?: ReadonlySet<string> | RuntimeParseOptions,
): RuntimeBlockNode[] {
  return projectMarkdownRoot(
    parseMarkdownAstInternal(input, arg, true),
    wantsLegacyRanges(arg),
  );
}

/**
 * Parse block Markdown into the canonical immutable Astryx AST.
 *
 * Unlike `parseMarkdown`, this returns the MDAST-aligned root used by Markdown,
 * transforms, and Outline. Math nodes are present only when `math: true`, and
 * plugin extension nodes are inferred from the ordered `plugins` tuple.
 */
export function parseMarkdownAst(
  input: string,
  sourceIds?: ReadonlySet<string>,
): MarkdownAstRoot;
export function parseMarkdownAst(
  input: string,
  options: ParseOptionsWithoutPlugins | MathParseOptionsWithoutPlugins,
): MarkdownAstRoot;
export function parseMarkdownAst<
  const Plugins extends ReadonlyArray<MarkdownPluginEntry>,
>(
  input: string,
  options: (ParseOptionsWithoutPlugins | MathParseOptionsWithoutPlugins) & {
    plugins: Plugins;
  },
): MarkdownAstRoot<MarkdownExtensionsOf<Plugins>>;
export function parseMarkdownAst(
  input: string,
  arg?: ReadonlySet<string> | RuntimeParseOptions,
): MarkdownAstRoot<RuntimeExtensionNode> {
  return parseMarkdownAstInternal(input, arg, true);
}

/** @internal Full-parse entry point with streaming finality for Outline. */
export function parseMarkdownAstInternal(
  input: string,
  arg: ReadonlySet<string> | RuntimeParseOptions | undefined,
  isFinal: boolean,
): MarkdownAstRoot<RuntimeExtensionNode> {
  const resolved = resolveOptions(arg);
  const opts = isFinal ? resolved : {...resolved, isFinal: false};
  const root: MarkdownAstRoot<RuntimeExtensionNode> = {
    type: 'root',
    children: parseMarkdownImpl(input, opts),
  };
  return applyMarkdownTransforms(
    root,
    opts.plugins,
    input,
    opts.isFinal,
    'block',
  );
}

function parseMarkdownImpl(
  input: string,
  baseOpts: ResolvedOptions,
): MarkdownAstBlockContent<RuntimeExtensionNode>[] {
  // Collect this input's link reference definitions and strip their lines,
  // then merge them with any definitions inherited from an enclosing parse
  // (the incremental parser passes the whole document's definitions in; a
  // recursive blockquote/list parse inherits the outer definitions). Inherited
  // definitions win on conflict, matching CommonMark's first-definition-wins
  // in document order; locally-nested definitions still resolve within this
  // parse.
  const {defs, cleaned, lineMap} = extractLinkDefinitions(input, baseOpts.math);
  const inherited = baseOpts.linkDefs;
  let linkDefs: ReadonlyMap<string, string> | undefined;
  if (defs.size === 0) {
    linkDefs = inherited;
  } else if (inherited == null) {
    linkDefs = defs;
  } else {
    linkDefs = new Map<string, string>([...defs, ...inherited]);
  }
  const opts: ResolvedOptions =
    linkDefs != null ? {...baseOpts, linkDefs} : baseOpts;
  const lines = cleaned.split('\n');
  const hasBlockExtensionSyntax =
    opts.allowBlockSyntax !== false &&
    (opts.plugins?.blockByFirstCharacter.size ?? 0) > 0;
  // Derived from the already-split lines rather than a second character
  // scan: every line contributes its own length plus the newline it ended on.
  const lineOffsets = [0];
  if (opts.astPositions === true || hasBlockExtensionSyntax) {
    let offset = 0;
    for (let index = 0; index < lines.length; index++) {
      offset += lines[index].length + 1;
      lineOffsets.push(offset);
    }
  }
  const blockExtensionMatches = new Map<number, ExtensionMatch>();
  const blocks: MarkdownAstBlockContent<RuntimeExtensionNode>[] = [];
  // The line each block started on, parallel to `blocks`. Only collected when
  // ranges were asked for; a block's end is resolved after the loop, since the
  // branch that produced it has already moved `index` past whatever it read.
  const blockStartLines: number[] | null =
    opts.astPositions === true ? [] : null;
  // Set only by a block that consumes blank lines as content, where the
  // positional end derivation would trim them away.
  const blockEndLines: (number | undefined)[] | null =
    opts.astPositions === true ? [] : null;
  let blockStartLine = 0;
  const pushBlock = (
    node: MarkdownAstBlockContent<RuntimeExtensionNode>,
    endLine?: number,
  ) => {
    blocks.push(node);
    blockStartLines?.push(blockStartLine);
    blockEndLines?.push(endLine);
  };
  let index = 0;

  while (index < lines.length) {
    blockStartLine = index;
    const line = lines[index];
    if (line.trim() === '') {
      index++;
      continue;
    }

    // --- Fenced code block ---
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const info = line.slice(fence.length);
      const language = info.match(/^(\S+)/)?.[1] ?? null;
      const legacyLanguage = info.match(/^(\w*)/)?.[1] || null;
      const meta =
        language == null
          ? undefined
          : info.slice(language.length).trim() || undefined;
      const codeLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index].startsWith(fence)) {
        codeLines.push(lines[index]);
        index++;
      }
      index++; // skip closing fence
      // A fence owns its blank lines, and an unterminated one (mid-stream)
      // can end on them, so it states its own end rather than letting the
      // positional derivation trim them off.
      pushBlock(
        markMarkdownAstLegacyCodeLanguage(
          {
            type: 'code',
            lang: language,
            ...(meta == null ? {} : {meta}),
            value: codeLines.join('\n'),
          },
          legacyLanguage,
        ),
        Math.min(index, lines.length) - 1,
      );
      continue;
    }

    // --- Display math (opt-in; fenced code takes precedence) ---
    if (opts.math) {
      const displayMath = matchDisplayMathBlock(lines, index);
      if (displayMath != null) {
        pushBlock(
          {type: 'math', value: displayMath.value},
          displayMath.endLine,
        );
        index = displayMath.nextIndex;
        continue;
      }
    }

    // --- Heading ---
    const headingMatch = line.match(/^(#{1,6}) +(.*)/);
    if (headingMatch) {
      pushBlock({
        type: 'heading',
        depth: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        children: parseInlineEntry(headingMatch[2], opts),
      });
      index++;
      continue;
    }

    // --- HR (must precede list check to handle `- - -`, `* * *`, `_ _ _`) ---
    if (isHorizontalRule(line)) {
      pushBlock({type: 'thematicBreak'});
      index++;
      continue;
    }

    // --- Standalone image ---
    // An unsafe src falls through to the paragraph path and renders as
    // literal text, the same rule the inline image path applies.
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (
      imageMatch &&
      line.trim() === imageMatch[0] &&
      isSafeMarkdownParserUrl(imageMatch[2])
    ) {
      pushBlock({type: 'image', alt: imageMatch[1], url: imageMatch[2]});
      index++;
      continue;
    }

    // --- Table (with or without leading pipe) ---
    if (
      index + 1 < lines.length &&
      line.includes('|') &&
      isTableSeparator(lines[index + 1])
    ) {
      const tableResult = parseTable(lines, index, opts);
      pushBlock(tableResult.node);
      index = tableResult.nextIndex;
      continue;
    }

    // --- Blockquote ---
    if (line.startsWith('> ') || line === '>') {
      const quoteLines: string[] = [];
      while (
        index < lines.length &&
        (lines[index].startsWith('> ') || lines[index] === '>')
      ) {
        quoteLines.push(lines[index].replace(/^> ?/, ''));
        index++;
      }
      pushBlock({
        type: 'blockquote',
        children: parseMarkdownImpl(quoteLines.join('\n'), nested(opts)),
      });
      continue;
    }

    // --- Unordered list ---
    if (/^ {0,9}[-*+] /.test(line)) {
      const listResult = parseList(lines, index, false, opts);
      pushBlock(listResult.node);
      index = listResult.nextIndex;
      continue;
    }

    // --- Ordered list ---
    if (/^ {0,9}\d+[.)] /.test(line)) {
      const listResult = parseList(lines, index, true, opts);
      pushBlock(listResult.node);
      index = listResult.nextIndex;
      continue;
    }

    // --- Extension block syntax (built-in blocks take precedence) ---
    if (hasBlockExtensionSyntax) {
      const extensionColumn = blockExtensionColumn(line);
      const extensionOffset =
        extensionColumn == null
          ? lineOffsets[index]
          : lineOffsets[index] + extensionColumn;
      const extension =
        blockExtensionMatches.get(extensionOffset) ??
        (extensionColumn == null
          ? {status: 'none' as const}
          : matchExtensionSyntax(cleaned, extensionOffset, 'block', opts));
      blockExtensionMatches.delete(extensionOffset);
      if (extension.status === 'match') {
        const consumedEnd = extension.end;
        const consumed = cleaned.slice(lineOffsets[index], consumedEnd);
        if (
          consumedEnd < cleaned.length &&
          cleaned[consumedEnd] !== '\n' &&
          cleaned[consumedEnd - 1] !== '\n'
        ) {
          reportMarkdownPluginFailure(
            extension.node.plugin,
            'syntax',
            new TypeError('Block syntax must consume complete lines'),
          );
        } else {
          const newlineCount = consumed.split('\n').length - 1;
          const consumedLines = Math.max(
            1,
            newlineCount + (consumed.endsWith('\n') ? 0 : 1),
          );
          pushBlock(
            extension.node as Extract<RuntimeExtensionNode, {display: 'block'}>,
            index + consumedLines - 1,
          );
          index += consumedLines;
          continue;
        }
      }
      if (extension.status === 'defer') {
        break;
      }
    }

    // --- Paragraph ---
    const paraLines: string[] = [line];
    index++;
    while (index < lines.length) {
      const nextLine = lines[index];
      if (
        isBlockStart(nextLine) ||
        (opts.math && matchDisplayMathBlock(lines, index) != null) ||
        nextLine.trim() === ''
      ) {
        break;
      }
      if (hasBlockExtensionSyntax) {
        const extensionColumn = blockExtensionColumn(nextLine);
        if (extensionColumn != null) {
          const extensionOffset = lineOffsets[index] + extensionColumn;
          const extension = matchExtensionSyntax(
            cleaned,
            extensionOffset,
            'block',
            opts,
          );
          if (extension.status !== 'none') {
            blockExtensionMatches.set(extensionOffset, extension);
            break;
          }
        }
      }
      paraLines.push(nextLine);
      index++;
    }
    pushBlock({
      type: 'paragraph',
      children: parseInlineEntry(paraLines.join('\n'), opts),
    });
  }
  if (blockStartLines != null) {
    stampSourceRanges(
      blocks,
      blockStartLines,
      blockEndLines ?? [],
      lines,
      lineMap,
      input,
      opts,
    );
  }
  return blocks;
}

/**
 * Give each block the offsets it occupies in the original input.
 *
 * Blocks are contiguous and in source order, so a block runs from its own
 * first line to the line before the next block starts, minus the blank lines
 * between them. Offsets are computed against the *input*, not the text the
 * block loop saw: link reference definitions are stripped before parsing, and
 * `lineMap` says which input line each surviving line came from.
 */
function stampSourceRanges(
  blocks: MarkdownAstBlockContent<RuntimeExtensionNode>[],
  blockStartLines: number[],
  blockEndLines: (number | undefined)[],
  lines: string[],
  lineMap: number[] | undefined,
  input: string,
  opts: ResolvedOptions,
): void {
  const base = opts.baseOffset ?? 0;
  // Offset of the first character of every line of the input.
  const inputLineStarts = [0];
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '\n') {
      inputLineStarts.push(i + 1);
    }
  }
  // Stripping removes whole lines and never edits one, so a parsed line's
  // length is its input line's length.
  const lineStart = (line: number): number =>
    base + inputLineStarts[lineMap != null ? lineMap[line] : line];

  for (let i = 0; i < blocks.length; i++) {
    const startLine = blockStartLines[i];
    let endLine = blockEndLines[i];
    if (endLine == null) {
      const nextStart =
        i + 1 < blocks.length ? blockStartLines[i + 1] : lines.length;
      endLine = nextStart - 1;
      while (endLine > startLine && lines[endLine].trim() === '') {
        endLine--;
      }
    }
    // Exactly the block's own lines, verbatim — a CRLF document's trailing
    // `\r` included, since the parser reads it as part of the line too and a
    // range that dropped it would slice to something that re-parses
    // differently.
    const end = lineStart(endLine) + lines[endLine].length;
    blocks[i] = {
      ...blocks[i],
      position: {
        start: {offset: lineStart(startLine)},
        end: {offset: end},
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Incremental parsing
// ---------------------------------------------------------------------------

type IncrementalBlockNode<MathEnabled extends boolean> =
  MathEnabled extends true ? BlockNodeWithMath : BlockNode;

declare const incrementalStateMode: unique symbol;

export interface IncrementalState<MathEnabled extends boolean = false> {
  /** @internal Nominally couples a factory-created cache to its node union. */
  readonly [incrementalStateMode]: MathEnabled;
  prevInput: string;
  settledText: string;
  settledBlocks: IncrementalBlockNode<MathEnabled>[];
  settledUpTo: number;
  /**
   * The `autolink` option the cached `settledBlocks` were parsed with.
   * `parseMarkdownIncremental` invalidates the cache when the caller flips
   * this option, so already-settled URLs flip between link/text along
   * with newly-arriving content.
   */
  autolink?: 'gfm';
  /** Whether the cached settled blocks were parsed with math enabled. */
  math?: MathEnabled;
  /**
   * The `sourceRanges` option the cached `settledBlocks` were parsed with.
   * Flipping it invalidates them the same way `autolink` does: they either
   * lack the ranges the caller now asks for, or carry ones it did not.
   */
  sourceRanges?: boolean;
  /** Identity of citation sources used by settled nodes. */
  sourceIdsKey?: string;
  /** Ordered syntax-only identity used by settled nodes. */
  pluginSyntaxIdentity?: string;
  /**
   * Signature of the link reference definitions the cached `settledBlocks`
   * were parsed with. Definitions are document-global and typically arrive
   * (in a footer) after the references that use them, so when the set changes
   * the settled cache is invalidated to let earlier references resolve.
   */
  linkDefsKey?: string;
}

type IncrementalWork = {
  /** Characters copied into the tail line array. */
  readonly splitCharacters: number;
  /** Tail lines visited by fence and blank-boundary detection. */
  readonly boundaryLines: number;
  /** Characters visited while collecting document-global definitions. */
  readonly definitionCharacters: number;
  /** Block nodes parsed anew this call (settled delta + unsettled tail). */
  readonly renderedBlocks: number;
};

type IncrementalCache = {
  /** Character offset immediately after the immutable settled prefix. */
  settledEnd: number;
  /** Definitions whose complete block is in the settled prefix. */
  settledLinkDefs: Map<string, string>;
  /** Definitions still in the mutable tail on the preceding call. */
  tailLinkDefs: ReadonlyMap<string, string>;
  /** The effective document-global definitions used by slice parses. */
  linkDefs: ReadonlyMap<string, string>;
  linkDefsKey: string;
  /** Canonical settled blocks shared by rendering and compatibility projection. */
  settledAstBlocks: MarkdownAstBlockContent<RuntimeExtensionNode>[];
  settledRevision: number;
  projectedRevision: number;
  projectedSettledBlocks: RuntimeBlockNode[];
  /** Preserves released settled-node identity across projected snapshots. */
  projectionCache: LegacyProjectionCache;
  work: IncrementalWork;
};

const incrementalCaches = new WeakMap<
  IncrementalState<boolean>,
  IncrementalCache
>();

function makeIncrementalCache(
  state: IncrementalState<boolean>,
): IncrementalCache {
  const {defs} = extractLinkDefinitions(state.settledText, state.math);
  const cache: IncrementalCache = {
    settledEnd: state.settledText.length,
    settledLinkDefs: new Map(defs),
    tailLinkDefs: new Map(),
    linkDefs: defs,
    linkDefsKey: linkDefsSignature(defs),
    settledAstBlocks: [],
    settledRevision: 0,
    projectedRevision: -1,
    projectedSettledBlocks: [],
    projectionCache: new WeakMap(),
    work: {
      splitCharacters: 0,
      boundaryLines: 0,
      definitionCharacters: 0,
      renderedBlocks: 0,
    },
  };
  incrementalCaches.set(state, cache);
  return cache;
}

/**
 * Create an incremental parser cache. Use the `<true>` type argument with
 * `MathParseOptions` so the cache and returned nodes share the math contract.
 */
export function createIncrementalState<
  MathEnabled extends boolean = false,
>(): IncrementalState<MathEnabled> {
  const state = {
    prevInput: '',
    settledText: '',
    settledBlocks: [],
    settledUpTo: 0,
  } as unknown as IncrementalState<MathEnabled>;
  makeIncrementalCache(state);
  return state;
}

/**
 * Deterministic work counters for the most recent incremental parse.
 * @internal Exported from this module for performance regression tests only.
 */
export function getIncrementalParseWork(
  state: IncrementalState<boolean>,
): IncrementalWork {
  return (
    incrementalCaches.get(state)?.work ?? {
      splitCharacters: 0,
      boundaryLines: 0,
      definitionCharacters: 0,
      renderedBlocks: 0,
    }
  );
}

/**
 * Find the line-index of the last blank line that is NOT inside a fenced code
 * block, and report whether a fence is still open at the end of the input.
 * Returns -1 when nothing is settled.
 *
 * This index must never move backwards as more of the document arrives. The
 * caller's cache is keyed on the settled text staying a prefix of what it was,
 * so a boundary that retracts by one line costs a re-parse of every block in
 * the document. Two things used to retract it: a blank last line, which is
 * just the newline the stream has written so far and stops being blank as soon
 * as the next chunk appends to it; and an open fence, which used to collapse
 * the boundary to -1 even though the content before the fence opened cannot be
 * changed by anything typed inside it.
 */
function findSettledBoundary(
  lines: string[],
  math = false,
): {
  boundary: number;
  openFence: boolean;
  openMath: boolean;
} {
  let inFence = false;
  let fenceMarker = '';
  let mathContainer: DisplayMathContainer | null = null;
  let suppressMathUntilBoundary = false;
  let lastBoundary = -1;
  let boundaryBeforeFence = -1;
  let boundaryBeforeMath = -1;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    if (inFence) {
      const fenceMatch = line.match(/^(`{3,}|~{3,})/);
      if (
        fenceMatch &&
        fenceMatch[1].startsWith(fenceMarker[0]) &&
        fenceMatch[1].length >= fenceMarker.length
      ) {
        inFence = false;
        fenceMarker = '';
      }
      continue;
    }

    if (mathContainer != null) {
      const state = displayMathLineState(line, mathContainer);
      if (state === 'close') {
        mathContainer = null;
        continue;
      }
      if (state === 'inside') {
        continue;
      }
      // The list item or blockquote ended before a closer arrived. The parser
      // treats that unmatched opener literally, so resume ordinary boundary
      // detection on this first line outside the container.
      mathContainer = null;
      suppressMathUntilBoundary = true;
    }

    // A complete same-line `$$…$$` expression never changes boundary state.
    // A standalone marker may belong to the top level, a blockquote, or one
    // list item; remember that container so its continuation marker closes the
    // same expression instead of opening a new one.
    if (math && !suppressMathUntilBoundary) {
      const container = displayMathContainer(line);
      if (container != null) {
        mathContainer = container;
        boundaryBeforeMath = lastBoundary;
        continue;
      }
    }

    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      inFence = true;
      fenceMarker = fenceMatch[1];
      boundaryBeforeFence = lastBoundary;
      continue;
    }

    if (line.trim() === '') {
      suppressMathUntilBoundary = false;
      if (lineIndex > 0 && lineIndex < lines.length - 1) {
        lastBoundary = lineIndex;
      }
    }
  }

  return {
    boundary: inFence
      ? boundaryBeforeFence
      : mathContainer != null
        ? boundaryBeforeMath
        : lastBoundary,
    openFence: inFence,
    openMath: mathContainer != null,
  };
}

/**
 * Strip trailing incomplete inline syntax that appears during streaming.
 * Only affects the tail of the last line — safe to apply to the full string.
 */
export function trimStreamingArtifacts(
  input: string,
  options?: {math?: boolean},
): string {
  // First remove an incomplete display expression as one structural unit. This
  // full-input scan distinguishes a terminal nested closer from a new opener;
  // looking only at the final `$$` line cannot.
  const displayTrimmed = options?.math ? trimOpenDisplayMath(input) : input;
  const lastNL = displayTrimmed.lastIndexOf('\n');
  const prefix = lastNL === -1 ? '' : displayTrimmed.slice(0, lastNL + 1);
  let tail = lastNL === -1 ? displayTrimmed : displayTrimmed.slice(lastNL + 1);

  if (options?.math) {
    // Hold an unmatched inline opener so raw TeX syntax does not flash while
    // streaming. If another unescaped dollar is already present but fails the
    // closing-boundary rule, keep both literal (the currency case).
    for (let index = 0; index < tail.length; index++) {
      if (
        tail[index] === '$' &&
        tail[index + 1] == null &&
        tail[index - 1] !== '$' &&
        !/\d/.test(tail[index - 1] ?? '') &&
        !isEscaped(tail, index)
      ) {
        tail = tail.slice(0, index);
        break;
      }
      if (!isInlineMathStart(tail, index)) {
        continue;
      }
      const close = findInlineMathEnd(tail, index);
      if (close !== -1) {
        index = close;
        continue;
      }
      let laterDollar = -1;
      for (let next = index + 1; next < tail.length; next++) {
        if (tail[next] === '$' && !isEscaped(tail, next)) {
          laterDollar = next;
          break;
        }
      }
      if (laterDollar === -1) {
        tail = tail.slice(0, index);
        break;
      }
      index = laterDollar;
    }
  }

  // Scan backwards for unclosed syntax markers — no regex to avoid ReDoS
  // Find the last unclosed [ or ![ (link/image start)
  const lastBracket = tail.lastIndexOf('[');
  if (lastBracket !== -1) {
    const afterBracket = tail.slice(lastBracket);
    // A closed link/image has ](...)  somewhere after the [
    const hasClose = afterBracket.includes('](') && afterBracket.includes(')');
    if (!hasClose) {
      // Also trim a preceding `!` for images
      const trimTo =
        lastBracket > 0 && tail[lastBracket - 1] === '!'
          ? lastBracket - 1
          : lastBracket;
      tail = tail.slice(0, trimTo);
    }
  }

  // Find trailing unclosed backticks
  let end = tail.length;
  while (end > 0 && tail[end - 1] === '`') {
    end--;
  }
  if (end < tail.length && end > 0) {
    // There are trailing backticks — check if they opened inline code
    const ticks = tail.length - end;
    const opener = tail.lastIndexOf('`'.repeat(ticks), end - 1);
    if (opener === -1) {
      // Unclosed — trim from the backticks
      tail = tail.slice(0, end);
    }
  }

  // Find trailing unclosed bold/italic markers (*)
  // First check trailing stars (no content after them yet):
  end = tail.length;
  while (end > 0 && tail[end - 1] === '*') {
    end--;
  }
  if (end < tail.length && end > 0) {
    const stars = tail.length - end;
    if (stars <= 3) {
      const opener = tail.lastIndexOf('*'.repeat(stars), end - 1);
      if (opener === -1) {
        tail = tail.slice(0, end);
      }
    }
  }

  // Check for unclosed bold/italic mid-line: e.g. "Hello **bold" or "Hello *ital"
  // Instead of trimming (hiding content), auto-close the markers so the text
  // renders with formatting immediately as it streams in.
  {
    let searchFrom = 0;
    const markers: {pos: number; len: number}[] = [];
    while (searchFrom < tail.length) {
      const idx = tail.indexOf('*', searchFrom);
      if (idx === -1) {
        break;
      }
      // Determine marker length (* or ** or ***)
      let markerLen = 1;
      while (idx + markerLen < tail.length && tail[idx + markerLen] === '*') {
        markerLen++;
      }
      if (markerLen > 3) {
        // 4+ stars — not standard markdown emphasis, skip
        searchFrom = idx + markerLen;
        continue;
      }
      markers.push({pos: idx, len: markerLen});
      searchFrom = idx + markerLen;
    }
    // Pair markers greedily. Unpaired openers get auto-closed.
    const paired = new Set<number>();
    for (let i = 0; i < markers.length; i++) {
      if (paired.has(i)) {
        continue;
      }
      for (let j = i + 1; j < markers.length; j++) {
        if (paired.has(j)) {
          continue;
        }
        if (markers[j].len === markers[i].len) {
          paired.add(i);
          paired.add(j);
          break;
        }
      }
    }
    // Append closing markers for each unpaired opener (in reverse order)
    for (let i = markers.length - 1; i >= 0; i--) {
      if (!paired.has(i)) {
        const marker = markers[i];
        // Only close if there's actual content after the opener
        if (marker.pos + marker.len < tail.length) {
          tail = tail + '*'.repeat(marker.len);
        } else {
          // Trailing marker with no content — trim it
          tail = tail.slice(0, marker.pos);
        }
      }
    }
  }

  // Find trailing unclosed strikethrough (~~)
  if (tail.length >= 2 && tail.endsWith('~~')) {
    // Check if there's an opener before these closing ~~
    const opener = tail.lastIndexOf('~~', tail.length - 3);
    if (opener === -1) {
      tail = tail.slice(0, -2);
    }
  } else if (tail.endsWith('~')) {
    // Single trailing ~ after content — might be start of ~~
    const secondLast = tail.length - 2;
    if (secondLast >= 0 && tail[secondLast] !== '~') {
      tail = tail.slice(0, -1);
    }
  }

  // Check for unclosed ~~ mid-line: e.g. "Hello ~~struck"
  // Count ~~ occurrences — if odd, the last one is unclosed.
  {
    let count = 0;
    let searchFrom = 0;
    const positions: number[] = [];
    while (true) {
      const idx = tail.indexOf('~~', searchFrom);
      if (idx === -1) {
        break;
      }
      positions.push(idx);
      count++;
      searchFrom = idx + 2;
    }
    if (count % 2 === 1) {
      // Odd number of ~~ — the last one is unclosed, trim from it
      tail = tail.slice(0, positions[positions.length - 1]);
    }
  }

  return prefix + tail;
}

/**
 * Trim trailing lines from the unsettled zone that look like the start of
 * a structural block but aren't complete yet. This prevents flashes of
 * partial syntax like bare `-` bullets or incomplete table headers.
 *
 * Only trims the minimal set of clearly-incomplete patterns:
 * 1. Bare list markers (`- `, `1. `) with no content after them
 * 2. A lone table header line without its separator row
 * 3. Empty trailing lines
 *
 * Once a table is established (header + separator exist), new data rows
 * render immediately — no suppression.
 */
function trimOpenDisplayMath(text: string): string {
  const lines = text.split('\n');
  let inFence = false;
  let fenceMarker = '';
  let mathContainer: DisplayMathContainer | null = null;
  let suppressMathUntilBoundary = false;
  let mathStartLine = -1;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (inFence) {
      const fence = line.match(/^(`{3,}|~{3,})/);
      if (
        fence != null &&
        fence[1].startsWith(fenceMarker[0]) &&
        fence[1].length >= fenceMarker.length
      ) {
        inFence = false;
        fenceMarker = '';
      }
      continue;
    }
    if (mathContainer != null) {
      const state = displayMathLineState(line, mathContainer);
      if (state === 'close') {
        mathContainer = null;
        mathStartLine = -1;
        continue;
      }
      if (state === 'inside') {
        continue;
      }
      mathContainer = null;
      mathStartLine = -1;
      suppressMathUntilBoundary = true;
    }

    if (line.trim() === '') {
      suppressMathUntilBoundary = false;
    }

    const fence = line.match(/^(`{3,}|~{3,})/);
    if (fence != null) {
      inFence = true;
      fenceMarker = fence[1];
      continue;
    }
    const container = suppressMathUntilBoundary
      ? null
      : displayMathContainer(line);
    if (container != null) {
      mathContainer = container;
      mathStartLine = index;
    }
  }

  return mathContainer != null && mathStartLine >= 0
    ? lines.slice(0, mathStartLine).join('\n').trimEnd()
    : text;
}

function trimUnsettledStructural(text: string): string {
  const lines = text.split('\n');

  // Walk backwards, but only trim clearly-incomplete trailing lines
  while (lines.length > 0) {
    const last = lines[lines.length - 1];
    const trimmed = last.trim();

    // Empty trailing lines — safe to drop
    if (trimmed === '') {
      lines.pop();
      continue;
    }

    // Bare list marker with no content: "- " or "1. " (just whitespace after marker)
    if (/^ {0,9}[-*+] $/.test(last) || /^ {0,9}\d+[.)] $/.test(last)) {
      lines.pop();
      continue;
    }

    // Table: only suppress if this is a lone header without a separator.
    // If the line has an unescaped `|` and the line before it is NOT a
    // separator, and THIS line is not a separator, and there's no established
    // table above (header + separator pair), hold it back. An escaped `\|` is
    // ordinary prose, not a cell delimiter, so a line carrying only those is
    // never held back — holding it back blanks the text while it streams.
    if (hasUnescapedPipe(trimmed) && !isTableSeparator(last)) {
      // Is there a separator anywhere above that would make this part of
      // an established table? Walk up to find header+separator pair. The
      // header test mirrors the block parser's own `includes('|')`, which
      // accepts an escaped-only header line once its separator arrives.
      let tableEstablished = false;
      for (let i = lines.length - 2; i >= 1; i--) {
        if (isTableSeparator(lines[i]) && lines[i - 1].includes('|')) {
          tableEstablished = true;
          break;
        }
      }
      if (!tableEstablished) {
        // Lone pipe line — could be a table header waiting for separator
        lines.pop();
        continue;
      }
    }

    // Separator line without a header above it
    if (isTableSeparator(last)) {
      if (lines.length < 2 || !lines[lines.length - 2].includes('|')) {
        lines.pop();
        continue;
      }
    }

    // This line looks complete — stop trimming
    break;
  }

  return lines.join('\n');
}

/**
 * The same options, for parsing a slice that starts at `offset` of the
 * document — so the slice's blocks report ranges into the whole document
 * rather than into the slice.
 */
function atOffset(opts: ResolvedOptions, offset: number): ResolvedOptions {
  return opts.astPositions === true ? {...opts, baseOffset: offset} : opts;
}

/**
 * Concatenate freshly-parsed delta blocks with previously-settled blocks,
 * merging adjacent same-style lists into a single loose list. The boundary
 * detector settles each pre-blank segment independently, so without this
 * merge an incrementally-streamed `1.\n\n1.\n\n1.` would land as N separate
 * lists even though the full-text parser joins them per CommonMark §5.3.
 */
function mergeSettledBlocks(
  prev: MarkdownAstBlockContent<RuntimeExtensionNode>[],
  delta: MarkdownAstBlockContent<RuntimeExtensionNode>[],
): MarkdownAstBlockContent<RuntimeExtensionNode>[] {
  if (prev.length === 0 || delta.length === 0) {
    return [...prev, ...delta];
  }
  const prevLast = prev[prev.length - 1];
  const deltaFirst = delta[0];
  if (
    prevLast.type === 'list' &&
    deltaFirst.type === 'list' &&
    prevLast.ordered === deltaFirst.ordered &&
    prevLast.delimiter === deltaFirst.delimiter
  ) {
    const merged: MarkdownAstBlockContent<RuntimeExtensionNode> = {
      type: 'list',
      ordered: prevLast.ordered,
      start: prevLast.start,
      delimiter: prevLast.delimiter,
      spread: true,
      children: [...prevLast.children, ...deltaFirst.children],
      // One list now, so one position spans both halves.
      ...(prevLast.position != null && deltaFirst.position != null
        ? {
            position: {
              start: prevLast.position.start,
              end: deltaFirst.position.end,
            },
          }
        : null),
    };
    return [...prev.slice(0, -1), merged, ...delta.slice(1)];
  }
  return [...prev, ...delta];
}

/** Append a newly-settled slice without copying the already-settled prefix. */
function appendSettledBlocks(
  prev: MarkdownAstBlockContent<RuntimeExtensionNode>[],
  delta: MarkdownAstBlockContent<RuntimeExtensionNode>[],
): boolean {
  if (delta.length === 0) {
    return false;
  }
  if (prev.length === 0) {
    prev.push(...delta);
    return false;
  }
  const prevLast = prev[prev.length - 1];
  const deltaFirst = delta[0];
  if (
    prevLast.type === 'list' &&
    deltaFirst.type === 'list' &&
    prevLast.ordered === deltaFirst.ordered &&
    prevLast.delimiter === deltaFirst.delimiter
  ) {
    prev[prev.length - 1] = {
      type: 'list',
      ordered: prevLast.ordered,
      start: prevLast.start,
      delimiter: prevLast.delimiter,
      spread: true,
      children: [...prevLast.children, ...deltaFirst.children],
      ...(prevLast.position != null && deltaFirst.position != null
        ? {
            position: {
              start: prevLast.position.start,
              end: deltaFirst.position.end,
            },
          }
        : null),
    };
    prev.push(...delta.slice(1));
    return true;
  }
  prev.push(...delta);
  return false;
}

function sameUnsettledDefinitions(
  previous: ReadonlyMap<string, string>,
  next: ReadonlyMap<string, string>,
  settled: ReadonlyMap<string, string>,
): boolean {
  for (const [label, destination] of previous) {
    if (!settled.has(label) && next.get(label) !== destination) {
      return false;
    }
  }
  for (const [label, destination] of next) {
    if (!settled.has(label) && previous.get(label) !== destination) {
      return false;
    }
  }
  return true;
}

function resetIncrementalCache(
  state: IncrementalState<boolean>,
  cache: IncrementalCache,
): void {
  state.prevInput = '';
  state.settledText = '';
  state.settledBlocks = [];
  state.settledUpTo = 0;
  state.linkDefsKey = undefined;
  state.sourceIdsKey = undefined;
  state.pluginSyntaxIdentity = undefined;
  state.math = undefined;
  cache.settledEnd = 0;
  cache.settledLinkDefs.clear();
  cache.tailLinkDefs = new Map();
  cache.linkDefs = new Map();
  cache.linkDefsKey = '';
  cache.settledAstBlocks = [];
  cache.settledRevision++;
  cache.projectedRevision = -1;
  cache.projectedSettledBlocks = [];
  cache.projectionCache = new WeakMap();
  cache.work = {
    splitCharacters: 0,
    boundaryLines: 0,
    definitionCharacters: 0,
    renderedBlocks: 0,
  };
}

/**
 * Parse one cumulative snapshot of a streaming Markdown document.
 *
 * Every call returns a fresh array, and later calls never mutate a
 * previously returned array or the block nodes inside it, so results are
 * stable snapshots. Settled block objects are shared across calls by
 * reference, which is safe because they are replaced — never edited in
 * place — when adjacent content changes them. When the input no longer
 * starts with the settled prefix (a replacement rather than an append),
 * the cache is discarded and the whole document is re-parsed.
 */
export function parseMarkdownIncremental(
  input: string,
  state: IncrementalState<false>,
  sourceIds?: ReadonlySet<string>,
): BlockNode[];
export function parseMarkdownIncremental(
  input: string,
  state: IncrementalState<true>,
  options: IncrementalMathParseOptionsWithoutPlugins,
): BlockNodeWithMath[];
export function parseMarkdownIncremental(
  input: string,
  state: IncrementalState<false>,
  options: IncrementalParseOptionsWithoutPlugins,
): BlockNode[];
export function parseMarkdownIncremental<
  const Plugins extends ReadonlyArray<MarkdownPluginEntry>,
>(
  input: string,
  state: IncrementalState<false>,
  options: IncrementalParseOptionsWithoutPlugins & {plugins: Plugins},
): BlockNode<MarkdownExtensionsOf<Plugins>>[];
export function parseMarkdownIncremental<
  const Plugins extends ReadonlyArray<MarkdownPluginEntry>,
>(
  input: string,
  state: IncrementalState<true>,
  options: IncrementalMathParseOptionsWithoutPlugins & {plugins: Plugins},
): BlockNodeWithMath<MarkdownExtensionsOf<Plugins>>[];
export function parseMarkdownIncremental(
  input: string,
  state: IncrementalState<boolean>,
  arg?: ReadonlySet<string> | RuntimeParseOptions,
): RuntimeBlockNode[] {
  const withRanges = wantsLegacyRanges(arg);
  const root = parseMarkdownAstIncremental(input, state, arg);
  const cache = incrementalCaches.get(state) ?? makeIncrementalCache(state);
  const projected = projectMarkdownRoot(
    root,
    withRanges,
    cache.projectionCache,
  );
  if (cache.projectedRevision !== cache.settledRevision) {
    cache.projectedSettledBlocks = cache.settledAstBlocks.map(block =>
      projectBlockNode(block, cache.projectionCache, withRanges),
    );
    cache.projectedRevision = cache.settledRevision;
  }
  state.settledBlocks =
    cache.projectedSettledBlocks as typeof state.settledBlocks;
  return projected;
}

/** @internal Canonical incremental parse used by Markdown rendering. */
export function parseMarkdownAstIncremental(
  input: string,
  state: IncrementalState<boolean>,
  arg?: ReadonlySet<string> | RuntimeParseOptions,
): MarkdownAstRoot<RuntimeExtensionNode> {
  const opts = resolveOptions(arg, true);
  const root: MarkdownAstRoot<RuntimeExtensionNode> = {
    type: 'root',
    children: parseMarkdownIncrementalAstBlocks(input, state, opts),
  };
  return applyMarkdownTransforms(
    root,
    opts.plugins,
    input,
    opts.isFinal,
    'block',
  );
}

function protectBlockExtensionBoundary(
  source: string,
  opts: ResolvedOptions,
  initialBoundary: number,
): number {
  if (initialBoundary <= 0 || opts.plugins?.blockByFirstCharacter.size === 0) {
    return initialBoundary;
  }
  let offset = 0;
  let lineIndex = 0;
  while (offset < source.length && lineIndex < initialBoundary) {
    const newline = source.indexOf('\n', offset);
    const end = newline < 0 ? source.length : newline;
    const line = source.slice(offset, end).replace(/\r$/, '');
    const column = blockExtensionColumn(line);
    if (column != null) {
      const match = matchExtensionSyntax(
        source,
        offset + column,
        'block',
        opts,
      );
      if (match.status === 'defer') {
        return lineIndex;
      }
      if (match.status === 'match') {
        const consumed = source.slice(offset, match.end);
        const consumedLines =
          consumed.split('\n').length - (consumed.endsWith('\n') ? 1 : 0);
        const endLine = lineIndex + Math.max(1, consumedLines);
        if (initialBoundary < endLine) {
          return lineIndex;
        }
        lineIndex = endLine;
        offset = match.end;
        continue;
      }
    }
    if (newline < 0) {
      break;
    }
    offset = newline + 1;
    lineIndex++;
  }
  return initialBoundary;
}

function parseMarkdownIncrementalAstBlocks(
  input: string,
  state: IncrementalState<boolean>,
  opts: ResolvedOptions,
): MarkdownAstBlockContent<RuntimeExtensionNode>[] {
  const cache = incrementalCaches.get(state) ?? makeIncrementalCache(state);
  let reparseSettled = false;

  const nextSourceIdsKey = sourceIdsSignature(opts.sourceIds);
  const nextPluginSyntaxIdentity = opts.plugins?.syntaxIdentity ?? '';
  // Invalidate cache when an option that changes parsed nodes flips — cached
  // settled blocks were parsed with the previous setting and would otherwise
  // be reused unchanged.
  if (
    state.autolink !== opts.autolink ||
    state.math !== opts.math ||
    Boolean(state.sourceRanges) !== Boolean(opts.sourceRanges) ||
    state.sourceIdsKey !== nextSourceIdsKey ||
    state.pluginSyntaxIdentity !== nextPluginSyntaxIdentity
  ) {
    reparseSettled = true;
    state.autolink = opts.autolink;
    state.math = opts.math;
    state.sourceRanges = opts.sourceRanges;
    state.sourceIdsKey = nextSourceIdsKey;
    state.pluginSyntaxIdentity = nextPluginSyntaxIdentity;
  }
  if (input === '') {
    resetIncrementalCache(state, cache);
    return [];
  }
  // The settled prefix is only reusable while the input still contains it
  // verbatim. Lengths alone cannot tell: a same-length or longer replacement
  // (new args after reusing a state) disagrees with the prefix without ever
  // being shorter, so compare content. `startsWith` is a memcmp-speed scan
  // with no allocation and is the one whole-prefix operation retained per
  // call — the contract that a replaced document renders the new content
  // cannot be honored without looking at the prefix. A shorter input can
  // never contain the prefix and fails the same check.
  if (
    state.settledText.length !== cache.settledEnd ||
    !input.startsWith(state.settledText)
  ) {
    resetIncrementalCache(state, cache);
    state.autolink = opts.autolink;
    state.math = opts.math;
    state.sourceRanges = opts.sourceRanges;
    state.sourceIdsKey = nextSourceIdsKey;
    state.pluginSyntaxIdentity = nextPluginSyntaxIdentity;
  }

  // The recurring parse costs are confined to the mutable suffix: splitting,
  // fence/boundary detection, definition collection, and block construction.
  // An open fence simply keeps the suffix growing until its closing marker.
  const oldSettledEnd = cache.settledEnd;
  const tailRaw = input.slice(oldSettledEnd);
  const tailLines = tailRaw.split('\n');
  const settled = findSettledBoundary(tailLines, opts.math);
  const boundary = protectBlockExtensionBoundary(
    tailRaw,
    opts,
    settled.boundary,
  );
  const {openFence, openMath} = settled;
  const settledDelta =
    boundary >= 0 ? tailLines.slice(0, boundary).join('\n') : '';
  const nextSettledEnd = oldSettledEnd + settledDelta.length;
  const unsettledInput = input.slice(nextSettledEnd);

  // Promote definitions only when their entire block becomes immutable.
  // Tail definitions are re-collected because the tail is allowed to change.
  // Changes that affect the effective set intentionally reparse settled
  // blocks: document-global references may precede their footer definition.
  let definitionsChanged = false;
  if (settledDelta !== '') {
    const {defs: deltaDefs} = extractLinkDefinitions(settledDelta, opts.math);
    for (const [label, destination] of deltaDefs) {
      if (!cache.settledLinkDefs.has(label)) {
        cache.settledLinkDefs.set(label, destination);
        if (cache.linkDefs.get(label) !== destination) {
          definitionsChanged = true;
        }
      }
    }
  }
  const {defs: tailLinkDefs} = extractLinkDefinitions(
    unsettledInput,
    opts.math,
  );
  if (
    !sameUnsettledDefinitions(
      cache.tailLinkDefs,
      tailLinkDefs,
      cache.settledLinkDefs,
    )
  ) {
    definitionsChanged = true;
  }
  cache.tailLinkDefs = tailLinkDefs;

  if (definitionsChanged) {
    // Later entries are overwritten, so settled (earlier) definitions win.
    cache.linkDefs = new Map([...tailLinkDefs, ...cache.settledLinkDefs]);
    cache.linkDefsKey = linkDefsSignature(cache.linkDefs);
    reparseSettled = true;
  }
  state.linkDefsKey = cache.linkDefsKey;
  const parseOpts: ResolvedOptions =
    cache.linkDefs.size > 0 ? {...opts, linkDefs: cache.linkDefs} : opts;

  if (settledDelta !== '') {
    state.settledText += settledDelta;
    state.settledUpTo += settledDelta.split('\n').length - 1;
    if (oldSettledEnd === 0) {
      state.settledUpTo++;
    }
    cache.settledEnd = nextSettledEnd;
  }

  const trimmedUnsettledInput = unsettledInput.trim();
  // String#trim removes the CR that belongs to the final content line of a
  // CRLF snapshot along with trailing blank lines. Keep that one byte so
  // source ranges and delimiter content remain identical to a full parse.
  const unsettledRaw =
    trimmedUnsettledInput !== '' && /\r(?:\n[\s]*)?$/.test(unsettledInput)
      ? `${trimmedUnsettledInput}\r`
      : trimmedUnsettledInput;
  // Structural trimming holds back lines that look like an incomplete list or
  // table, which inside a fence is ordinary code: a TypeScript union or a `- `
  // would disappear from the code block as it streams.
  const unsettledText = openFence
    ? unsettledRaw
    : openMath
      ? trimOpenDisplayMath(unsettledRaw)
      : trimUnsettledStructural(unsettledRaw);

  const legacyRanges = opts.sourceRanges === true;
  let parsedSettledBlocks = 0;
  if (reparseSettled) {
    cache.settledAstBlocks = state.settledText
      ? parseMarkdownImpl(state.settledText, parseOpts)
      : [];
    parsedSettledBlocks = cache.settledAstBlocks.length;
    cache.settledRevision++;
    cache.projectedSettledBlocks = cache.settledAstBlocks.map(block =>
      projectBlockNode(block, cache.projectionCache, legacyRanges),
    );
    cache.projectedRevision = cache.settledRevision;
  } else if (settledDelta !== '') {
    const deltaBlocks = parseMarkdownImpl(
      settledDelta,
      atOffset(parseOpts, oldSettledEnd),
    );
    const mergeIndex = cache.settledAstBlocks.length - 1;
    const mergedList = appendSettledBlocks(cache.settledAstBlocks, deltaBlocks);
    parsedSettledBlocks = deltaBlocks.length;
    cache.settledRevision++;
    const projectedDelta = deltaBlocks.map(block =>
      projectBlockNode(block, cache.projectionCache, legacyRanges),
    );
    if (mergedList) {
      const canonicalMerged = cache.settledAstBlocks[mergeIndex];
      const projectedMerged = projectBlockNode(
        canonicalMerged,
        cache.projectionCache,
        legacyRanges,
      );
      cache.projectedSettledBlocks[mergeIndex] = projectedMerged;
      cache.projectedSettledBlocks.push(...projectedDelta.slice(1));
    } else {
      cache.projectedSettledBlocks.push(...projectedDelta);
    }
    cache.projectedRevision = cache.settledRevision;
  }

  // The unsettled tail is trimmed before parsing, so its offset in the
  // document is where that trimmed text actually starts — not the boundary,
  // which is a line index. If it somehow cannot be located, parse it without
  // positions rather than report wrong ones. The search starts at the
  // settled end, so it scans the tail and never the prefix.
  const unsettledStart =
    unsettledText && opts.astPositions === true
      ? input.indexOf(unsettledText, cache.settledEnd)
      : -1;
  const unsettledBlocks = unsettledText
    ? parseMarkdownImpl(
        unsettledText,
        unsettledStart >= 0
          ? atOffset(parseOpts, unsettledStart)
          : nested(parseOpts),
      )
    : [];

  state.prevInput = input;

  // Snapshot semantics: hand back a fresh array so later calls never mutate
  // an earlier return. The settled block objects inside it are reused by
  // reference — they are immutable, so sharing them is what keeps this cheap:
  // assembling the result copies one pointer per settled block and never
  // re-visits the settled characters.
  cache.work = {
    splitCharacters: tailRaw.length,
    boundaryLines: tailLines.length,
    definitionCharacters: settledDelta.length + unsettledInput.length,
    renderedBlocks: parsedSettledBlocks + unsettledBlocks.length,
  };
  return mergeSettledBlocks(cache.settledAstBlocks, unsettledBlocks);
}

// ---------------------------------------------------------------------------
// Heading slugs
// ---------------------------------------------------------------------------
// Single source of truth for the heading id contract: Markdown renders these
// slugs as `id` attributes on h1–h6, and Outline's parseOutlineFromMarkdown
// derives its item ids from the same functions, so outline hash links always
// resolve to a rendered heading by construction.

/** Turn heading text into a URL-safe slug (lowercase, hyphen-separated). */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Disambiguate repeated slugs with a numeric suffix (`setup`, `setup-1`, …).
 * Empty slugs fall back to `section`. The caller owns the counts map so one
 * document shares a single numbering sequence.
 */
export function uniqueSlug(
  baseSlug: string,
  counts: Map<string, number>,
): string {
  const fallbackSlug = baseSlug || 'section';
  const count = counts.get(fallbackSlug) ?? 0;
  counts.set(fallbackSlug, count + 1);
  return count === 0 ? fallbackSlug : `${fallbackSlug}-${count}`;
}
