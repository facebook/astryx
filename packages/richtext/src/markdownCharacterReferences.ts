// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownCharacterReferences.ts
 * @input Uses lexical, @lexical/link, @lexical/code, and core Markdown's
 *   decodeMarkdownCharacterReferences.
 * @output Exports protectCharacterReferences, which swaps every character
 *   reference in Markdown source for a private-use stand-in before Lexical
 *   imports it, and $restoreCharacterReferences, which puts the decoded text
 *   in place of the stand-ins afterwards.
 * @position Used by importMarkdownKeepingSource (markdownSource.ts), so every
 *   block — paragraphs, headings, lists, quotes, table cells, link text and
 *   destinations — decodes references with the one decoder core Markdown
 *   renders with (spec:AST-061 FR7, DEC-5), in one pass over the source and
 *   one over the imported text. The stand-ins mean nothing to Lexical's
 *   Markdown import, so a decoded `*` never starts emphasis, and no `&#digits;`
 *   reaches Lexical's own decoding, which ignores escapes and throws on a
 *   number past Unicode. Code keeps references as written.
 */

import {$isCodeNode} from '@lexical/code';
import {$isLinkNode} from '@lexical/link';
import {
  $isElementNode,
  $isTextNode,
  type ElementNode,
  type LexicalNode,
} from 'lexical';
import {decodeMarkdownCharacterReferences} from '@astryxdesign/core/Markdown/parser';

/** What a stand-in replaced: a reference as written, or an escaped `&`. */
type StandIn =
  | {readonly kind: 'reference'; readonly source: string}
  | {readonly kind: 'ampersand'};

export interface ProtectedMarkdown {
  /** The source with stand-ins in place of references. */
  readonly markdown: string;
  /** What each stand-in replaced. */
  readonly standIns: ReadonlyMap<string, StandIn>;
}

// Something that looks like a reference; the decoder decides if it is one.
const REFERENCE_LIKE = /&(?:#[xX][0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/y;
const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;

const PRIVATE_USE_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0xe000, 0xf8ff],
  [0xf0000, 0xffffd],
  [0x100000, 0x10fffd],
];

/** Private-use characters that do not occur in `text`, in order. */
function* absentCharacters(text: string): Generator<string> {
  const present = new Set(text);
  for (const [first, last] of PRIVATE_USE_RANGES) {
    for (let codePoint = first; codePoint <= last; codePoint++) {
      const character = String.fromCodePoint(codePoint);
      if (!present.has(character)) {
        yield character;
      }
    }
  }
}

/**
 * The ranges of `text` that are code: fenced code blocks, and code spans,
 * where a backtick run opens a span only if a run of the same length closes it
 * (CommonMark 0.31). Runs are indexed by length, so the scan is linear.
 */
function codeRanges(text: string): Array<readonly [number, number]> {
  const ranges: Array<readonly [number, number]> = [];
  // Fenced code blocks, line by line.
  let lineStart = 0;
  let fence: {readonly marker: string; readonly start: number} | null = null;
  while (lineStart <= text.length) {
    const lineEnd = text.indexOf('\n', lineStart);
    const end = lineEnd === -1 ? text.length : lineEnd;
    const line = text.slice(lineStart, end);
    if (fence == null) {
      const open = FENCE_OPEN.exec(line);
      if (open != null) {
        fence = {marker: open[1], start: lineStart};
      }
    } else if (
      new RegExp(
        `^ {0,3}\\${fence.marker[0]}{${fence.marker.length},}[ \\t]*$`,
      ).test(line)
    ) {
      ranges.push([fence.start, end]);
      fence = null;
    }
    if (lineEnd === -1) {
      break;
    }
    lineStart = lineEnd + 1;
  }
  if (fence != null) {
    ranges.push([fence.start, text.length]);
  }
  // Code spans, outside fenced code.
  const runs: Array<{readonly start: number; readonly length: number}> = [];
  let index = 0;
  let fenceIndex = 0;
  const fences = [...ranges];
  while (index < text.length) {
    const current = fences[fenceIndex];
    if (current != null && index >= current[0]) {
      index = current[1];
      fenceIndex++;
      continue;
    }
    const character = text[index];
    if (character === '\\') {
      index += 2;
      continue;
    }
    if (character === '`') {
      let end = index;
      while (text[end] === '`') {
        end++;
      }
      runs.push({start: index, length: end - index});
      index = end;
      continue;
    }
    index++;
  }
  // For each run length, the positions of later runs of that length.
  const byLength = new Map<number, Array<number>>();
  runs.forEach((run, position) => {
    const positions = byLength.get(run.length) ?? [];
    positions.push(position);
    byLength.set(run.length, positions);
  });
  const nextOfLength = new Map<number, number>();
  let position = 0;
  while (position < runs.length) {
    const run = runs[position];
    const positions = byLength.get(run.length) ?? [];
    let cursor = nextOfLength.get(run.length) ?? 0;
    while (cursor < positions.length && positions[cursor] <= position) {
      cursor++;
    }
    nextOfLength.set(run.length, cursor);
    const closer = positions[cursor];
    if (closer == null) {
      position++;
      continue;
    }
    ranges.push([run.start, runs[closer].start + run.length]);
    position = closer + 1;
  }
  return ranges.sort((a, b) => a[0] - b[0]);
}

/**
 * Returns `markdown` with every character reference outside code replaced by
 * a private-use stand-in that occurs nowhere else in it, and the escaped `&`
 * of an escaped reference replaced by one too. One pass over the source.
 */
export function protectCharacterReferences(
  markdown: string,
): ProtectedMarkdown {
  const standIns = new Map<string, StandIn>();
  if (!markdown.includes('&')) {
    return {markdown, standIns};
  }
  const available = absentCharacters(markdown);
  const byReference = new Map<string, string>();
  let ampersand: string | null = null;
  const standInFor = (reference: string | null): string | null => {
    const existing = reference == null ? ampersand : byReference.get(reference);
    if (existing != null) {
      return existing;
    }
    const next = available.next();
    if (next.done === true) {
      // Every private-use character is in the text or already used: leave
      // the rest as written.
      return null;
    }
    if (reference == null) {
      ampersand = next.value;
      standIns.set(next.value, {kind: 'ampersand'});
    } else {
      byReference.set(reference, next.value);
      standIns.set(next.value, {kind: 'reference', source: reference});
    }
    return next.value;
  };
  const code = codeRanges(markdown);
  let output = '';
  let copied = 0;
  let codeIndex = 0;
  let index = markdown.indexOf('&');
  while (index !== -1) {
    while (code[codeIndex] != null && code[codeIndex][1] <= index) {
      codeIndex++;
    }
    const range = code[codeIndex];
    if (range != null && range[0] <= index) {
      index = markdown.indexOf('&', range[1]);
      continue;
    }
    REFERENCE_LIKE.lastIndex = index;
    const match = REFERENCE_LIKE.exec(markdown);
    if (match == null) {
      index = markdown.indexOf('&', index + 1);
      continue;
    }
    let backslashes = 0;
    while (markdown[index - 1 - backslashes] === '\\') {
      backslashes++;
    }
    const reference = match[0];
    const end = index + reference.length;
    if (backslashes % 2 === 1) {
      // An escaped `&`: the reference stays literal, without its backslash.
      const standIn = standInFor(null);
      if (standIn != null) {
        output += markdown.slice(copied, index - 1) + standIn;
        copied = index + 1;
      }
    } else if (decodeMarkdownCharacterReferences(reference) !== reference) {
      const standIn = standInFor(reference);
      if (standIn != null) {
        output += markdown.slice(copied, index) + standIn;
        copied = end;
      }
    } else if (reference.startsWith('&#')) {
      // Not a reference (too many digits): literal, but kept from Lexical's
      // own numeric decoding.
      const standIn = standInFor(null);
      if (standIn != null) {
        output += markdown.slice(copied, index) + standIn;
        copied = index + 1;
      }
    }
    index = markdown.indexOf('&', end);
  }
  return {markdown: output + markdown.slice(copied), standIns};
}

/** `text` with each stand-in replaced as `replace` says. */
function restored(
  text: string,
  standIns: ReadonlyMap<string, StandIn>,
  replace: (standIn: StandIn) => string,
): string {
  let output = '';
  let changed = false;
  for (const character of text) {
    const standIn = standIns.get(character);
    if (standIn == null) {
      output += character;
    } else {
      output += replace(standIn);
      changed = true;
    }
  }
  return changed ? output : text;
}

const decoded = (standIn: StandIn): string =>
  standIn.kind === 'ampersand'
    ? '&'
    : decodeMarkdownCharacterReferences(standIn.source);
const asWritten = (standIn: StandIn): string =>
  standIn.kind === 'ampersand' ? '&' : standIn.source;

/**
 * Replaces the stand-ins under `node` with the characters their references
 * name — or, in code Lexical read as code, with the references as written —
 * in text, link destinations, and link titles. One pass over the text.
 */
export function $restoreCharacterReferences(
  node: ElementNode,
  standIns: ReadonlyMap<string, StandIn>,
): void {
  if (standIns.size === 0) {
    return;
  }
  const visit = (current: LexicalNode, inCode: boolean) => {
    if ($isTextNode(current)) {
      const text = current.getTextContent();
      const next = restored(
        text,
        standIns,
        inCode || current.hasFormat('code') ? asWritten : decoded,
      );
      if (next !== text) {
        current.setTextContent(next);
      }
      return;
    }
    if ($isLinkNode(current)) {
      const url = restored(current.getURL(), standIns, decoded);
      if (url !== current.getURL()) {
        current.setURL(url);
      }
      const title = current.getTitle();
      if (title != null) {
        const nextTitle = restored(title, standIns, decoded);
        if (nextTitle !== title) {
          current.setTitle(nextTitle);
        }
      }
    }
    if ($isElementNode(current)) {
      const isCode = inCode || $isCodeNode(current);
      for (const child of current.getChildren()) {
        visit(child, isCode);
      }
    }
  };
  visit(node, false);
}
