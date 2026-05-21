// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file parser.ts
 * @input Markdown string
 * @output Array of MarkdownNode AST nodes
 * @position Core parser; consumed by XDSMarkdown.tsx
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InlineNode =
  | {type: 'text'; content: string}
  | {type: 'bold'; children: InlineNode[]}
  | {type: 'italic'; children: InlineNode[]}
  | {type: 'strikethrough'; children: InlineNode[]}
  | {type: 'code'; content: string}
  | {type: 'link'; href: string; children: InlineNode[]}
  | {type: 'image'; src: string; alt: string}
  | {type: 'citation'; sourceId: string}
  | {type: 'break'};

export type BlockNode =
  | {type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[]}
  | {type: 'paragraph'; children: InlineNode[]}
  | {type: 'codeblock'; language: string; content: string}
  | {type: 'blockquote'; children: BlockNode[]}
  | {type: 'list'; ordered: boolean; start?: number; items: ListItemNode[]}
  | {
      type: 'table';
      headers: TableCellNode[];
      alignments: TableAlignment[];
      rows: TableCellNode[][];
    }
  | {type: 'hr'}
  | {type: 'image'; src: string; alt: string};

export type ListItemNode = {checked?: boolean; children: BlockNode[]};
export type TableCellNode = {children: InlineNode[]};
export type TableAlignment = 'left' | 'center' | 'right' | null;

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
  sourceIds: ReadonlySet<string> | undefined,
): {sourceId: string; end: number} | null {
  if (!sourceIds || text[i] !== '\u3010') {
    return null;
  }
  const closeIndex = text.indexOf('\u3011', i + 1);
  if (closeIndex === -1) {
    return null;
  }
  const id = text.slice(i + 1, closeIndex);
  if (id.length === 0 || !sourceIds.has(id)) {
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
  sourceIds: ReadonlySet<string> | undefined,
): {sourceId: string; end: number} | null {
  if (!sourceIds || text[i] !== '[') {
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
  if (id.length === 0 || !sourceIds.has(id)) {
    return null;
  }
  return {sourceId: id, end: closeIndex + 1};
}

export function parseInline(
  text: string,
  sourceIds?: ReadonlySet<string>,
): InlineNode[] {
  const nodes: InlineNode[] = [];
  let i = 0;

  while (i < text.length) {
    // --- Escape ---
    if (text[i] === '\\' && i + 1 < text.length) {
      nodes.push({type: 'text', content: text[i + 1]});
      i += 2;
      continue;
    }

    // --- Inline code ---
    if (text[i] === '`') {
      const tickCount = text[i + 1] === '`' ? (text[i + 2] === '`' ? 3 : 2) : 1;
      const openIndex = i + tickCount;
      const closeIndex = text.indexOf('`'.repeat(tickCount), openIndex);
      if (closeIndex !== -1) {
        nodes.push({type: 'code', content: text.slice(openIndex, closeIndex)});
        i = closeIndex + tickCount;
        continue;
      }
    }

    // --- Citation: fullwidth 【id】 ---
    {
      const citation = matchFullwidthCitation(text, i, sourceIds);
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
          nodes.push({
            type: 'image',
            src: text.slice(altClose + 2, srcClose),
            alt: text.slice(i + 2, altClose),
          });
          i = srcClose + 1;
          continue;
        }
      }
    }

    // --- Citation: bracket [id] (before link — link requires `(` after `]`) ---
    {
      const citation = matchBracketCitation(text, i, sourceIds);
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
          nodes.push({
            type: 'link',
            href: text.slice(textClose + 2, urlClose),
            children: parseInline(text.slice(i + 1, textClose), sourceIds),
          });
          i = urlClose + 1;
          continue;
        }
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
            type: 'bold',
            children: [
              {
                type: 'italic',
                children: parseInline(text.slice(i + 3, closeIndex), sourceIds),
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
            type: 'bold',
            children: parseInline(text.slice(i + 2, closeIndex), sourceIds),
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
          type: 'strikethrough',
          children: parseInline(text.slice(i + 2, closeIndex), sourceIds),
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
            type: 'italic',
            children: parseInline(text.slice(i + 1, closeIndex), sourceIds),
          });
          i = closeIndex + 1;
          continue;
        }
      }
    }

    // --- Plain text (with line-break detection) ---
    let end = i + 1;
    while (end < text.length && !'*_~`[!\\\n\u3010'.includes(text[end])) {
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
            last.content += trimmed;
          } else {
            nodes.push({type: 'text', content: trimmed});
          }
        }
        nodes.push({type: 'break'});
        i = end + 1;
        continue;
      }
    }

    const last = nodes[nodes.length - 1];
    if (last?.type === 'text') {
      last.content += content;
    } else {
      nodes.push({type: 'text', content});
    }
    i = end;
  }
  return nodes;
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
  if (/^ {0,9}\d+\. /.test(line)) {
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
  if (line[0] === '|') {
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
  sourceIds?: ReadonlySet<string>,
): {node: BlockNode; nextIndex: number} {
  const headers: TableCellNode[] = splitTableRow(lines[lineIndex]).map(
    cell => ({children: parseInline(cell, sourceIds)}),
  );
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
  const rows: TableCellNode[][] = [];
  let rowIndex = lineIndex + 2;
  while (
    rowIndex < lines.length &&
    lines[rowIndex].includes('|') &&
    lines[rowIndex].trim() !== ''
  ) {
    rows.push(
      splitTableRow(lines[rowIndex]).map(cell => ({
        children: parseInline(cell, sourceIds),
      })),
    );
    rowIndex++;
  }
  return {
    node: {type: 'table', headers, alignments, rows},
    nextIndex: rowIndex,
  };
}

function parseList(
  lines: string[],
  startIndex: number,
  ordered: boolean,
  sourceIds?: ReadonlySet<string>,
): {node: BlockNode; nextIndex: number} {
  const items: ListItemNode[] = [];
  const baseIndent = getIndent(lines[startIndex]);
  const itemPattern = ordered
    ? new RegExp(`^ {${baseIndent}}\\d+\\. `)
    : new RegExp(`^ {${baseIndent}}[-*+] `);

  const startMatch = ordered ? lines[startIndex].match(/^ *(\d+)\./) : null;
  const start = startMatch ? parseInt(startMatch[1], 10) : undefined;

  let index = startIndex;
  while (index < lines.length && itemPattern.test(lines[index])) {
    const content = ordered
      ? lines[index].replace(/^ *\d+\. /, '')
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

    items.push({checked, children: parseMarkdown(itemText, sourceIds)});
  }
  return {node: {type: 'list', ordered, start, items}, nextIndex: index};
}

// ---------------------------------------------------------------------------
// Main block parser
// ---------------------------------------------------------------------------

export function parseMarkdown(
  input: string,
  sourceIds?: ReadonlySet<string>,
): BlockNode[] {
  const lines = input.split('\n');
  const blocks: BlockNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() === '') {
      index++;
      continue;
    }

    // --- Fenced code block ---
    const fenceMatch = line.match(/^(`{3,}|~{3,})(\w*)/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const language = fenceMatch[2] || 'plaintext';
      const codeLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index].startsWith(fence)) {
        codeLines.push(lines[index]);
        index++;
      }
      index++; // skip closing fence
      blocks.push({type: 'codeblock', language, content: codeLines.join('\n')});
      continue;
    }

    // --- Heading ---
    const headingMatch = line.match(/^(#{1,6}) +(.*)/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        children: parseInline(headingMatch[2], sourceIds),
      });
      index++;
      continue;
    }

    // --- HR (must precede list check to handle `- - -`, `* * *`, `_ _ _`) ---
    if (isHorizontalRule(line)) {
      blocks.push({type: 'hr'});
      index++;
      continue;
    }

    // --- Standalone image ---
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch && line.trim() === imageMatch[0]) {
      blocks.push({type: 'image', alt: imageMatch[1], src: imageMatch[2]});
      index++;
      continue;
    }

    // --- Table (with or without leading pipe) ---
    if (
      index + 1 < lines.length &&
      line.includes('|') &&
      isTableSeparator(lines[index + 1])
    ) {
      const tableResult = parseTable(lines, index, sourceIds);
      blocks.push(tableResult.node);
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
      blocks.push({
        type: 'blockquote',
        children: parseMarkdown(quoteLines.join('\n'), sourceIds),
      });
      continue;
    }

    // --- Unordered list ---
    if (/^ {0,9}[-*+] /.test(line)) {
      const listResult = parseList(lines, index, false, sourceIds);
      blocks.push(listResult.node);
      index = listResult.nextIndex;
      continue;
    }

    // --- Ordered list ---
    if (/^ {0,9}\d+\. /.test(line)) {
      const listResult = parseList(lines, index, true, sourceIds);
      blocks.push(listResult.node);
      index = listResult.nextIndex;
      continue;
    }

    // --- Paragraph ---
    const paraLines: string[] = [line];
    index++;
    while (
      index < lines.length &&
      !isBlockStart(lines[index]) &&
      lines[index].trim() !== ''
    ) {
      paraLines.push(lines[index]);
      index++;
    }
    blocks.push({
      type: 'paragraph',
      children: parseInline(paraLines.join('\n'), sourceIds),
    });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Incremental parsing
// ---------------------------------------------------------------------------

export interface IncrementalState {
  prevInput: string;
  settledText: string;
  settledBlocks: BlockNode[];
  settledUpTo: number;
}

export function createIncrementalState(): IncrementalState {
  return {prevInput: '', settledText: '', settledBlocks: [], settledUpTo: 0};
}

/**
 * Find the line-index of the last blank line that is NOT inside a fenced code
 * block.  Returns -1 when nothing is settled (unclosed fence or no blank line).
 */
function findSettledBoundary(lines: string[]): number {
  let inFence = false;
  let fenceMarker = '';
  let lastBoundary = -1;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    // Fence open / close — match the specific marker character and length
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fenceMatch[1];
      } else if (
        fenceMatch[1][0] === fenceMarker[0] &&
        fenceMatch[1].length >= fenceMarker.length
      ) {
        inFence = false;
        fenceMarker = '';
      }
    }

    if (!inFence && line.trim() === '' && lineIndex > 0) {
      lastBoundary = lineIndex;
    }
  }

  return inFence ? -1 : lastBoundary;
}

/**
 * Strip trailing incomplete inline syntax that appears during streaming.
 * Only affects the tail of the last line — safe to apply to the full string.
 */
export function trimStreamingArtifacts(input: string): string {
  const lastNL = input.lastIndexOf('\n');
  const prefix = lastNL === -1 ? '' : input.slice(0, lastNL + 1);
  let tail = lastNL === -1 ? input : input.slice(lastNL + 1);

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
    if (/^ {0,9}[-*+] $/.test(last) || /^ {0,9}\d+\. $/.test(last)) {
      lines.pop();
      continue;
    }

    // Table: only suppress if this is a lone header without a separator.
    // If the line has `|` and the line before it is NOT a separator,
    // and THIS line is not a separator, and there's no established table
    // above (header + separator pair), hold it back.
    if (trimmed.includes('|') && !isTableSeparator(last)) {
      // Is there a separator anywhere above that would make this part of
      // an established table? Walk up to find header+separator pair.
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

export function parseMarkdownIncremental(
  input: string,
  state: IncrementalState,
  sourceIds?: ReadonlySet<string>,
): BlockNode[] {
  if (input === '') {
    state.prevInput = '';
    state.settledText = '';
    state.settledBlocks = [];
    state.settledUpTo = 0;
    return [];
  }

  const lines = input.split('\n');
  const boundary = findSettledBoundary(lines);

  if (boundary < 0) {
    // Inside an unclosed fence or no blank-line boundary — full re-parse
    state.prevInput = input;
    return parseMarkdown(input, sourceIds);
  }

  const settledText = lines.slice(0, boundary).join('\n');
  const unsettledRaw = lines.slice(boundary).join('\n').trim();
  const unsettledText = trimUnsettledStructural(unsettledRaw);

  let settledBlocks: BlockNode[];

  if (settledText === state.settledText) {
    // Settled portion unchanged — reuse cached blocks
    settledBlocks = state.settledBlocks;
  } else if (
    state.settledText.length > 0 &&
    settledText.startsWith(state.settledText)
  ) {
    // Settled portion grew — parse only the new delta
    const delta = settledText.slice(state.settledText.length);
    const deltaBlocks = parseMarkdown(delta, sourceIds);
    settledBlocks = [...state.settledBlocks, ...deltaBlocks];
  } else {
    // Content before the boundary changed — full re-parse of settled portion
    settledBlocks = parseMarkdown(settledText, sourceIds);
  }

  const unsettledBlocks = unsettledText
    ? parseMarkdown(unsettledText, sourceIds)
    : [];

  state.settledText = settledText;
  state.settledBlocks = settledBlocks;
  state.settledUpTo = boundary;
  state.prevInput = input;

  return [...settledBlocks, ...unsettledBlocks];
}
