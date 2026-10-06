// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownSource.ts
 * @input Uses lexical (node state, root), @lexical/markdown
 *   ($convertFromMarkdownString / $convertToMarkdownString), and
 *   @lexical/headless for the throwaway export editor.
 * @output Exports importMarkdownKeepingSource and exportMarkdownKeepingSource,
 *   the source-preserving Markdown import and export behind
 *   markdownToEditorStateJSON, editorStateJSONToMarkdown, and getMarkdown().
 * @position Internal to @astryxdesign/richtext. Implements spec:AST-062: an
 *   untouched top-level block exports exactly as authored, and an edit
 *   regenerates only the blocks it changed.
 *
 * Import splits the source into chunks (runs of non-blank lines; a fenced code
 * block is one chunk even across blank lines) and imports each chunk on its
 * own. Once node transforms settle the tree, the top-level nodes from one or
 * more consecutive chunks form a group. The group's first node records the
 * exact bytes it came from (with the whitespace before and after them) and the
 * group's canonical Markdown at import. Export regenerates each group's
 * canonical Markdown; when it still matches the recorded one, the group is
 * unchanged and its recorded bytes are written instead.
 */

import {createHeadlessEditor} from '@lexical/headless';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  type Transformer,
} from '@lexical/markdown';
import {$isCodeNode} from '@lexical/code';
import {
  $createParagraphNode,
  $getRoot,
  $getState,
  $isLineBreakNode,
  $setState,
  createState,
  type ElementNode,
  type EditorState,
  type Klass,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';

/** The whitespace and content one chunk of Markdown source was split into. */
export interface MarkdownChunk {
  /** Blank lines before the chunk; only the first chunk has any. */
  readonly leading: string;
  /** The chunk's lines, without the line break that ends the last one. */
  readonly content: string;
  /** Everything after the content up to the next chunk, or to the end. */
  readonly trailing: string;
}

/** What a group of top-level nodes was imported from. */
interface SourceRecord {
  readonly group: string;
  /** The rest is recorded on the group's first node only. */
  readonly size?: number;
  readonly leading?: string;
  readonly content?: string;
  readonly trailing?: string;
  readonly canonical?: string;
  /** The chunk ended the document, so its trailing text ends the export. */
  readonly isLast?: boolean;
  /** The line ending the group's source uses, for a regenerated group. */
  readonly lineEnding?: string;
  /** The document's first line ending, for blocks added later. */
  readonly documentLineEnding?: string;
  /** The document starts with a byte order mark. */
  readonly byteOrderMark?: boolean;
}

function isSourceRecord(value: unknown): value is SourceRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as {group?: unknown}).group === 'string'
  );
}

const markdownSourceState = createState('astryxMarkdownSource', {
  parse: (value: unknown): SourceRecord | null =>
    isSourceRecord(value) ? value : null,
});

const BLANK_LINE = /^[ \t]*\r?$/;
const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;

/**
 * Splits Markdown into chunks: runs of non-blank lines, with a fenced code
 * block kept whole across blank lines. Joining every chunk's leading, content,
 * and trailing text gives back the input exactly.
 */
export function splitMarkdownChunks(markdown: string): Array<MarkdownChunk> {
  const lines = markdown.split('\n');
  const chunks: Array<MarkdownChunk> = [];
  let leading = '';
  let index = 0;
  // Blank lines before the first chunk.
  while (index < lines.length && BLANK_LINE.test(lines[index])) {
    if (index === lines.length - 1) {
      // Whitespace with no content at all.
      return [];
    }
    leading += `${lines[index]}\n`;
    index++;
  }
  while (index < lines.length) {
    const start = index;
    let fence: string | null = null;
    while (index < lines.length) {
      const line = lines[index];
      if (fence != null) {
        index++;
        const close = new RegExp(
          `^ {0,3}${fence[0]}{${fence.length},}[ \\t]*\\r?$`,
        );
        if (close.test(line) && index - 1 > start) {
          fence = null;
        }
        continue;
      }
      if (BLANK_LINE.test(line)) {
        break;
      }
      const open = FENCE_OPEN.exec(line);
      if (open != null) {
        fence = open[1];
      }
      index++;
    }
    let content = lines.slice(start, index).join('\n');
    let trailing = '';
    // A CRLF line ending belongs to the trailing text, not the content.
    if (content.endsWith('\r')) {
      content = content.slice(0, -1);
      trailing = '\r';
    }
    while (index < lines.length && BLANK_LINE.test(lines[index])) {
      trailing += `\n${lines[index]}`;
      index++;
    }
    if (index < lines.length) {
      // The line break before the next chunk's first line.
      trailing += '\n';
    }
    chunks.push({
      leading: chunks.length === 0 ? leading : '',
      content,
      trailing,
    });
  }
  return chunks;
}

/** Lines without the carriage return before each line feed. */
function withoutCarriageReturns(text: string): string {
  return text.replace(/\r(?=\n|$)/g, '');
}

/** The first line ending in `text`, or `fallback` when it has none. */
function lineEndingOf(text: string, fallback: string): string {
  const index = text.indexOf('\n');
  if (index === -1) {
    return fallback;
  }
  return index > 0 && text[index - 1] === '\r' ? '\r\n' : '\n';
}

/**
 * Imports Markdown into the editor's root and records each group's authored
 * bytes. Runs two discrete updates: the first imports every chunk and stamps
 * its nodes with the chunk's index; the second runs after node transforms have
 * settled the tree (adjacent lists merge, for example), so each group covers
 * exactly the chunks that ended up in its nodes.
 */
export function importMarkdownKeepingSource(
  editor: LexicalEditor,
  markdown: string,
  transformers: Array<Transformer>,
): void {
  // A byte order mark is document envelope: kept, but never part of a block.
  const byteOrderMark = markdown.startsWith('\uFEFF') ? '\uFEFF' : '';
  const chunks = splitMarkdownChunks(markdown.slice(byteOrderMark.length));
  if (byteOrderMark !== '' && chunks.length > 0) {
    chunks[0] = {...chunks[0], leading: byteOrderMark + chunks[0].leading};
  }
  editor.update(
    () => {
      const root = $getRoot();
      root.clear();
      chunks.forEach((chunk, index) => {
        const holder = $createParagraphNode();
        // Lexical imports LF lines; the record keeps the authored endings.
        $convertFromMarkdownString(
          withoutCarriageReturns(chunk.content),
          transformers,
          holder,
        );
        const nodes = holder.getChildren();
        for (const node of nodes) {
          $setState(node, markdownSourceState, {group: String(index)});
        }
        root.append(...nodes);
      });
    },
    {discrete: true},
  );
  editor.update(
    () => {
      $recordGroups(chunks, markdown, transformers);
    },
    {discrete: true},
  );
}

/**
 * Turns the first pass's chunk stamps into groups. Consecutive nodes stamped
 * with one chunk form a group, and the group also covers every later chunk up
 * to the next group's: those chunks merged into its nodes or imported to
 * nothing.
 */
function $recordGroups(
  chunks: ReadonlyArray<MarkdownChunk>,
  markdown: string,
  transformers: Array<Transformer>,
): void {
  const root = $getRoot();
  const children = root.getChildren();
  if (children.length === 0) {
    $importWhitespace(markdown, transformers);
    return;
  }
  const documentLineEnding = lineEndingOf(markdown, '\n');
  const chunkOf = (node: LexicalNode): number =>
    Number($getState(node, markdownSourceState)?.group ?? '0');
  let index = 0;
  while (index < children.length) {
    const firstChunk = chunkOf(children[index]);
    const group: Array<LexicalNode> = [];
    while (index < children.length && chunkOf(children[index]) === firstChunk) {
      group.push(children[index]);
      index++;
    }
    const isLast = index === children.length;
    const nextChunk = isLast ? chunks.length : chunkOf(children[index]);
    const covered = chunks.slice(firstChunk, nextChunk);
    // Content runs from the first chunk to the last one's content; the last
    // covered chunk's trailing text separates this group from the next.
    const content = covered
      .map((chunk, position) =>
        position === covered.length - 1
          ? chunk.content
          : chunk.content + chunk.trailing,
      )
      .join('');
    const leading =
      group[0] === children[0]
        ? chunks
            .slice(0, firstChunk + 1)
            .map((chunk, position) =>
              position === firstChunk
                ? chunk.leading
                : chunk.leading + chunk.content + chunk.trailing,
            )
            .join('')
        : '';
    const record: SourceRecord = {
      group: String(firstChunk),
      size: group.length,
      leading,
      content,
      trailing: covered[covered.length - 1]?.trailing ?? '',
      canonical: $canonicalMarkdown(group, transformers),
      isLast,
      lineEnding: lineEndingOf(
        content + (covered[covered.length - 1]?.trailing ?? ''),
        documentLineEnding,
      ),
      documentLineEnding,
      byteOrderMark: markdown.startsWith('\uFEFF'),
    };
    group.forEach((node, position) => {
      $setState(
        node,
        markdownSourceState,
        position === 0 ? record : {group: record.group},
      );
    });
  }
}

/**
 * The canonical Markdown of a run of top-level nodes. Moves them into a
 * detached holder to export them on their own, then puts them back.
 */
function $canonicalMarkdown(
  nodes: ReadonlyArray<LexicalNode>,
  transformers: Array<Transformer>,
): string {
  const anchor = nodes[nodes.length - 1].getNextSibling();
  const holder = $createParagraphNode();
  holder.append(...nodes);
  const markdown = $convertToMarkdownString(transformers, holder);
  if (anchor != null) {
    for (const node of nodes) {
      anchor.insertBefore(node);
    }
  } else {
    $getRoot().append(...nodes);
  }
  return markdown;
}

/**
 * Source with nothing to import keeps the editor's single empty paragraph,
 * which records the whole source so it exports unchanged.
 */
function $importWhitespace(
  markdown: string,
  transformers: Array<Transformer>,
): void {
  $convertFromMarkdownString('', transformers);
  const root = $getRoot();
  const paragraph = root.getFirstChild();
  if (paragraph != null) {
    $setState(paragraph, markdownSourceState, {
      group: 'whitespace',
      size: root.getChildrenSize(),
      leading: '',
      content: '',
      trailing: markdown,
      canonical: $convertToMarkdownString(transformers),
      isLast: true,
    });
  }
}

interface ExportPiece {
  readonly text: string;
  readonly trailing: string | null;
  readonly isLast: boolean;
}

const BLOCK_SEPARATOR = '\n\n';
const ENDS_WITH_BLANK_LINE = /\n[ \t]*\r?\n[ \t\r]*$/;

/**
 * Exports the root, writing each unchanged group's authored bytes and
 * regenerating the rest. Mutates the tree to measure groups, so it must run in
 * an update on a throwaway editor.
 */
function $exportKeepingSource(transformers: Array<Transformer>): string {
  const children = $getRoot().getChildren();
  const pieces: Array<ExportPiece> = [];
  let finalTrailing = '';
  const documentLineEnding =
    children
      .map(child => $getState(child, markdownSourceState)?.documentLineEnding)
      .find(lineEnding => lineEnding != null) ?? '\n';
  let index = 0;
  while (index < children.length) {
    const first = children[index];
    const record = $getState(first, markdownSourceState);
    const group: Array<LexicalNode> = [first];
    index++;
    if (record?.content != null) {
      while (
        index < children.length &&
        $getState(children[index], markdownSourceState)?.group ===
          record.group &&
        $getState(children[index], markdownSourceState)?.content == null
      ) {
        group.push(children[index]);
        index++;
      }
    }
    const holder = $createParagraphNode();
    holder.append(...group);
    const canonical = $convertToMarkdownString(transformers, holder);
    if (record?.content == null) {
      pieces.push({
        text: withLineEnding(
          $regeneratedMarkdown(holder, transformers),
          documentLineEnding,
        ),
        trailing: null,
        isLast: false,
      });
      continue;
    }
    if (record.isLast) {
      finalTrailing = record.trailing ?? '';
    }
    const unchanged =
      group.length === record.size && canonical === record.canonical;
    pieces.push({
      text:
        (record.leading ?? '') +
        (unchanged
          ? record.content
          : withLineEnding(
              $regeneratedMarkdown(holder, transformers),
              record.lineEnding ?? '\n',
            )),
      trailing: record.trailing ?? null,
      isLast: record.isLast === true,
    });
  }
  const separator = withLineEnding(BLOCK_SEPARATOR, documentLineEnding);
  const byteOrderMark = children.some(
    child => $getState(child, markdownSourceState)?.byteOrderMark === true,
  );
  let output = '';
  pieces.forEach((piece, position) => {
    output += piece.text;
    if (position === pieces.length - 1) {
      output += finalTrailing;
    } else if (
      piece.trailing != null &&
      !piece.isLast &&
      ENDS_WITH_BLANK_LINE.test(piece.trailing)
    ) {
      output += piece.trailing;
    } else {
      output += separator;
    }
  });
  // The byte order mark survives even when the block that carried it did not.
  return byteOrderMark && !output.startsWith('\uFEFF')
    ? `\uFEFF${output}`
    : output;
}

function withLineEnding(text: string, lineEnding: string): string {
  return lineEnding === '\n' ? text : text.replace(/\n/g, lineEnding);
}

/**
 * Stands in for a backslash while Lexical exports text, because Lexical
 * escapes every backslash already in the text. A noncharacter, so no document
 * text contains it.
 */
const ESCAPE_MARKER = '\uFDD0';

/** Line starts that would turn literal text into a block structure. */
const LINE_START_SYNTAX: ReadonlyArray<[RegExp, string]> = [
  // ATX heading, block quote, bullet list item.
  [/^(#{1,6})(?=[ \t]|$)/, `${ESCAPE_MARKER}$1`],
  [/^>/, `${ESCAPE_MARKER}>`],
  [/^([-+])(?=[ \t]|$)/, `${ESCAPE_MARKER}$1`],
  // Ordered list item.
  [/^(\d{1,9})([.)])(?=[ \t]|$)/, `$1${ESCAPE_MARKER}$2`],
  // Setext underline or thematic break made of `=` or `-`.
  [/^([=-])(?=[=\- \t]*$)/, `${ESCAPE_MARKER}$1`],
  // Table delimiter row.
  [/^([|:])(?=[|:\- \t]*-[|:\- \t]*$)/, `${ESCAPE_MARKER}$1`],
];

// Inline syntax Lexical's export leaves unescaped: link and image brackets and
// character references.
const INLINE_SYNTAX =
  /[[\]]|&(?=#[0-9]{1,7};|#[xX][0-9a-fA-F]{1,6};|[A-Za-z][A-Za-z0-9]*;)/g;

/**
 * The canonical Markdown of a changed group, with literal text escaped so the
 * Markdown imports again as the structure the editor showed (spec:AST-062
 * FR3). Mutates the group's text, so it must run on a throwaway editor.
 */
function $regeneratedMarkdown(
  holder: ElementNode,
  transformers: Array<Transformer>,
): string {
  for (const text of holder.getAllTextNodes()) {
    if (text.hasFormat('code') || $isCodeNode(text.getParent())) {
      continue;
    }
    let content = text
      .getTextContent()
      .replace(INLINE_SYNTAX, match => ESCAPE_MARKER + match);
    const previous = text.getPreviousSibling();
    if (previous == null || $isLineBreakNode(previous)) {
      for (const [pattern, replacement] of LINE_START_SYNTAX) {
        content = content.replace(pattern, replacement);
      }
    }
    text.setTextContent(content);
  }
  return $convertToMarkdownString(transformers, holder).replace(
    /\uFDD0/g,
    '\\',
  );
}

/**
 * Exports an editor state as Markdown per spec:AST-062: unchanged groups as
 * authored, changed and new blocks in canonical form. Runs on a throwaway
 * headless editor, so the caller's editor is never touched.
 */
export function exportMarkdownKeepingSource(
  state: EditorState | string,
  transformers: ReadonlyArray<Transformer>,
  nodes: ReadonlyArray<Klass<LexicalNode>>,
): string {
  const editor = createHeadlessEditor({
    namespace: 'astryx-editor-markdown-export',
    nodes: [...nodes],
    onError(error: Error) {
      throw error;
    },
  });
  editor.setEditorState(
    editor.parseEditorState(
      typeof state === 'string' ? state : JSON.stringify(state.toJSON()),
    ),
  );
  let markdown = '';
  editor.update(
    () => {
      markdown = $exportKeepingSource([...transformers]);
    },
    {discrete: true},
  );
  return markdown;
}
