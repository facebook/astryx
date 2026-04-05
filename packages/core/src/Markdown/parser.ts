/**
 * @file parser.ts
 * @input Markdown string
 * @output Array of MarkdownNode AST nodes
 * @position Core parser; consumed by XDSMarkdown.tsx
 */

// Types
export type InlineNode =
  | {type: 'text'; content: string}
  | {type: 'bold'; children: InlineNode[]}
  | {type: 'italic'; children: InlineNode[]}
  | {type: 'strikethrough'; children: InlineNode[]}
  | {type: 'code'; content: string}
  | {type: 'link'; href: string; children: InlineNode[]}
  | {type: 'image'; src: string; alt: string};

export type BlockNode =
  | {type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[]}
  | {type: 'paragraph'; children: InlineNode[]}
  | {type: 'codeblock'; language: string; content: string}
  | {type: 'blockquote'; children: BlockNode[]}
  | {type: 'list'; ordered: boolean; start?: number; items: ListItemNode[]}
  | {type: 'table'; headers: TableCellNode[]; alignments: TableAlignment[]; rows: TableCellNode[][]}
  | {type: 'hr'}
  | {type: 'image'; src: string; alt: string};

export type ListItemNode = {checked?: boolean; children: BlockNode[]};
export type TableCellNode = {children: InlineNode[]};
export type TableAlignment = 'left' | 'center' | 'right' | null;

// Inline parser
export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let i = 0;
  while (i < text.length) {
    // Escape
    if (text[i] === '\\' && i + 1 < text.length) {
      nodes.push({type: 'text', content: text[i + 1]});
      i += 2; continue;
    }
    // Inline code
    if (text[i] === '`') {
      const tc = text[i+1] === '`' ? (text[i+2] === '`' ? 3 : 2) : 1;
      const o = i + tc;
      const c = text.indexOf('`'.repeat(tc), o);
      if (c !== -1) {
        nodes.push({type: 'code', content: text.slice(o, c)});
        i = c + tc; continue;
      }
    }
    // Image
    if (text[i] === '!' && text[i+1] === '[') {
      const ac = text.indexOf(']', i+2);
      if (ac !== -1 && text[ac+1] === '(') {
        const sc = text.indexOf(')', ac+2);
        if (sc !== -1) {
          nodes.push({type: 'image', src: text.slice(ac+2, sc), alt: text.slice(i+2, ac)});
          i = sc + 1; continue;
        }
      }
    }
    // Link
    if (text[i] === '[') {
      const tc = text.indexOf(']', i+1);
      if (tc !== -1 && text[tc+1] === '(') {
        const uc = text.indexOf(')', tc+2);
        if (uc !== -1) {
          nodes.push({type: 'link', href: text.slice(tc+2, uc), children: parseInline(text.slice(i+1, tc))});
          i = uc + 1; continue;
        }
      }
    }
    // Bold
    if ((text[i]==='*'&&text[i+1]==='*')||(text[i]==='_'&&text[i+1]==='_')) {
      const m = text.slice(i, i+2);
      const c = text.indexOf(m, i+2);
      if (c !== -1) {
        nodes.push({type: 'bold', children: parseInline(text.slice(i+2, c))});
        i = c + 2; continue;
      }
    }
    // Strikethrough
    if (text[i]==='~'&&text[i+1]==='~') {
      const c = text.indexOf('~~', i+2);
      if (c !== -1) {
        nodes.push({type: 'strikethrough', children: parseInline(text.slice(i+2, c))});
        i = c + 2; continue;
      }
    }
    // Italic
    if (text[i]==='*'||text[i]==='_') {
      const m = text[i];
      const c = text.indexOf(m, i+1);
      if (c !== -1 && c > i+1) {
        nodes.push({type: 'italic', children: parseInline(text.slice(i+1, c))});
        i = c + 1; continue;
      }
    }
    // Plain text
    let end = i + 1;
    while (end < text.length && !'*_~`[!\\'.includes(text[end])) end++;
    const content = text.slice(i, end);
    const last = nodes[nodes.length - 1];
    if (last && last.type === 'text') last.content += content;
    else nodes.push({type: 'text', content});
    i = end;
  }
  return nodes;
}

// Block parser helpers
function isBlockStart(line: string): boolean {
  return /^#{1,6}\s/.test(line) || /^(`{3,}|~{3,})/.test(line) ||
    /^(---+|\*\*\*+|___+)\s*$/.test(line) || /^>\s/.test(line) ||
    /^\s*[-*+]\s/.test(line) || /^\s*\d+\.\s/.test(line) || /^\|.*\|/.test(line);
}

function splitTableRow(line: string): string[] {
  // Trim leading/trailing pipes and whitespace without backtracking-prone regex
  let start = 0;
  let end = line.length;
  // Skip leading pipe + whitespace
  if (line[0] === '|') {
    start = 1;
    while (start < end && line[start] === ' ') start++;
  }
  // Skip trailing whitespace + pipe
  while (end > start && line[end - 1] === ' ') end--;
  if (end > start && line[end - 1] === '|') end--;
  return line.slice(start, end).split('|').map(s => s.trim());
}

function parseTable(lines: string[], i: number): {node: BlockNode; nextIndex: number} {
  const headers: TableCellNode[] = splitTableRow(lines[i]).map(c => ({children: parseInline(c)}));
  const aligns: TableAlignment[] = splitTableRow(lines[i+1]).map(c => {
    const t = c.trim();
    const l = t.startsWith(':'), r = t.endsWith(':');
    return l && r ? 'center' : r ? 'right' : l ? 'left' : null;
  });
  const rows: TableCellNode[][] = [];
  let j = i + 2;
  while (j < lines.length && /^\|/.test(lines[j])) {
    rows.push(splitTableRow(lines[j]).map(c => ({children: parseInline(c)})));
    j++;
  }
  return {node: {type: 'table', headers, alignments: aligns, rows}, nextIndex: j};
}

function parseList(lines: string[], i: number, ordered: boolean): {node: BlockNode; nextIndex: number} {
  const items: ListItemNode[] = [];
  const pat = ordered ? /^\s*\d+\.\s/ : /^\s*[-*+]\s/;
  const startMatch = ordered ? lines[i].match(/^\s*(\d+)\./) : null;
  const start = startMatch ? parseInt(startMatch[1], 10) : undefined;
  while (i < lines.length && pat.test(lines[i])) {
    const content = ordered ? lines[i].replace(/^\s*\d+\.\s/, '') : lines[i].replace(/^\s*[-*+]\s/, '');
    const taskMatch = content.match(/^\[([ xX])\]\s(.*)/);
    let checked: boolean | undefined;
    let itemText: string;
    if (taskMatch) { checked = taskMatch[1].toLowerCase() === 'x'; itemText = taskMatch[2]; }
    else { itemText = content; }
    i++;
    while (i < lines.length && /^\s{2,}/.test(lines[i]) && lines[i].trim() !== '') {
      itemText += '\n' + lines[i].replace(/^\s{2,}/, ''); i++;
    }
    items.push({checked, children: parseMarkdown(itemText)});
  }
  return {node: {type: 'list', ordered, start, items}, nextIndex: i};
}

// Main block parser
export function parseMarkdown(input: string): BlockNode[] {
  const lines = input.split('\n');
  const blocks: BlockNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    // Fenced code block
    const fm = line.match(/^(`{3,}|~{3,})(\w*)/);
    if (fm) {
      const fence = fm[1], lang = fm[2] || 'plaintext';
      const cl: string[] = []; i++;
      while (i < lines.length && !lines[i].startsWith(fence)) { cl.push(lines[i]); i++; }
      i++;
      blocks.push({type: 'codeblock', language: lang, content: cl.join('\n')});
      continue;
    }
    // Heading
    const hm = line.match(/^(#{1,6})\s+(.+)/);
    if (hm) {
      blocks.push({type: 'heading', level: hm[1].length as 1|2|3|4|5|6, children: parseInline(hm[2])});
      i++; continue;
    }
    // HR
    if (/^(---+|\*\*\*+|___+)\s*$/.test(line)) { blocks.push({type: 'hr'}); i++; continue; }
    // Standalone image
    const im = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (im && line.trim() === im[0]) {
      blocks.push({type: 'image', alt: im[1], src: im[2]}); i++; continue;
    }
    // Table
    if (i+1 < lines.length && /^\|.*\|/.test(line) && /^\|[\s:|-]+\|/.test(lines[i+1])) {
      const r = parseTable(lines, i); blocks.push(r.node); i = r.nextIndex; continue;
    }
    // Blockquote
    if (line.startsWith('> ') || line === '>') {
      const ql: string[] = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        ql.push(lines[i].replace(/^>\s?/, '')); i++;
      }
      blocks.push({type: 'blockquote', children: parseMarkdown(ql.join('\n'))}); continue;
    }
    // Unordered list
    if (/^\s*[-*+]\s/.test(line)) {
      const r = parseList(lines, i, false); blocks.push(r.node); i = r.nextIndex; continue;
    }
    // Ordered list
    if (/^\s*\d+\.\s/.test(line)) {
      const r = parseList(lines, i, true); blocks.push(r.node); i = r.nextIndex; continue;
    }
    // Paragraph
    const pl: string[] = [line]; i++;
    while (i < lines.length && !isBlockStart(lines[i]) && lines[i].trim() !== '') {
      pl.push(lines[i]); i++;
    }
    blocks.push({type: 'paragraph', children: parseInline(pl.join('\n'))});
  }
  return blocks;
}

// Incremental parsing state
export interface IncrementalState {
  prevInput: string;
  settledBlocks: BlockNode[];
  settledUpTo: number;
}

export function createIncrementalState(): IncrementalState {
  return {prevInput: '', settledBlocks: [], settledUpTo: 0};
}

export function parseMarkdownIncremental(
  input: string,
  state: IncrementalState,
): BlockNode[] {
  if (input === '') {
    state.prevInput = '';
    state.settledBlocks = [];
    state.settledUpTo = 0;
    return [];
  }

  // Find the boundary of "settled" content — blocks followed by \n\n
  // that are NOT inside a fenced code block
  const fullBlocks = parseMarkdown(input);

  // Determine which blocks are settled (won't change with more input)
  const lines = input.split('\n');
  let inFence = false;
  let lastDoubleNewline = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
    }
    if (!inFence && line.trim() === '' && i > 0) {
      lastDoubleNewline = i;
    }
  }

  if (inFence) {
    // Inside a fence — nothing is settled
    state.prevInput = input;
    return fullBlocks;
  }

  // Simple heuristic: if we have a double newline boundary, blocks before it are settled
  if (lastDoubleNewline >= 0) {
    const settledInput = lines.slice(0, lastDoubleNewline).join('\n');
    const settledBlocks = parseMarkdown(settledInput);
    const unsettledInput = lines.slice(lastDoubleNewline).join('\n').trim();
    const unsettledBlocks = unsettledInput ? parseMarkdown(unsettledInput) : [];

    state.settledBlocks = settledBlocks;
    state.settledUpTo = lastDoubleNewline;
    state.prevInput = input;

    return [...settledBlocks, ...unsettledBlocks];
  }

  state.prevInput = input;
  return fullBlocks;
}
