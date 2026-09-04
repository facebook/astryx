// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Where a file's prose is, so an escape hatch never reads it as code.
 *
 * `hardcoded-important` was fixed this way in #5856: the flag is found by
 * parsing, so an executor that writes "do not reach for `!important`" in a
 * JSDoc block above the workaround it chose instead no longer fails the run for
 * saying the right thing. The two hatches still matched by pattern —
 * `blanket-reset` and `dark-mode-disabled` — had the same fault, in the same
 * shape: a guidance sentence naming `all: unset`, or a comment explaining that
 * the host's `color-scheme: light` arm was left alone, is prose, and prose is
 * not a change to the host.
 *
 * Rather than teach each pattern to recognize a comment, the comment is located
 * once, by the parser that owns the file, and blanked out of the line before
 * any pattern sees it:
 *
 * - CSS and CSS-like files go through **postcss**, whose `Comment` node is the
 *   parser's own answer to "is this prose"; a `/* … *\/` inside a quoted value
 *   is part of that value and is never a Comment.
 * - Scripts go through the **TypeScript** parser, which handles `.js`, `.jsx`,
 *   `.ts`, and `.tsx` with one API and reports comments as trivia, so `//` in a
 *   URL string and `/*` in a regular expression are not comments.
 * - HTML, Vue, and Svelte are WALKED rather than scanned, because `<!--` opens
 *   a comment only in markup text: inside `<script>` and `<style>`, and inside
 *   a tag's attribute values, those four characters are ordinary content. Each
 *   raw-text element's body is handed to the analyzer for its own language.
 *
 * Blanking preserves offsets and line boundaries, so a hatch written on the
 * same line as a comment is still found, and only the comment's own characters
 * stop being code.
 *
 * Anything that cannot be parsed reports NO comments. That is the fail-closed
 * direction here: a file this module cannot read keeps every character subject
 * to the scan, so an unreadable file can never be used to hide a real hatch —
 * it only risks the false positive that was already there.
 */

import postcss from 'postcss';
import ts from 'typescript';
import * as path from 'node:path';

import {
  CSS_EXTENSIONS,
  MARKUP_EXTENSIONS,
  SCRIPT_KINDS,
} from './setup-important.mjs';

function lineStarts(text) {
  const starts = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\n') starts.push(index + 1);
  }
  return starts;
}

/** Comment spans in a stylesheet, via postcss; none when it cannot be read. */
function cssCommentSpans(text) {
  let root;
  try {
    root = postcss.parse(text, {from: undefined});
  } catch {
    return [];
  }
  const starts = lineStarts(text);
  const offsetOf = position => {
    if (position == null) return null;
    if (typeof position.offset === 'number') return position.offset;
    const start = starts[position.line - 1];
    return start === undefined ? null : start + position.column - 1;
  };
  const spans = [];
  root.walkComments(comment => {
    const start = offsetOf(comment.source?.start);
    const end = offsetOf(comment.source?.end);
    if (start === null) return;
    // postcss's `end` names the comment's last character; a span is exclusive.
    spans.push({start, end: end === null ? text.length : end + 1});
  });
  return spans;
}

/** Comment spans in a script, via the TypeScript parser's own trivia. */
function scriptCommentSpans(text, fileName, scriptKind) {
  let source;
  try {
    source = ts.createSourceFile(
      fileName,
      text,
      ts.ScriptTarget.Latest,
      true,
      scriptKind,
    );
  } catch {
    return [];
  }
  const spans = [];
  const seen = new Set();
  const collect = ranges => {
    for (const range of ranges ?? []) {
      if (seen.has(range.pos)) continue;
      seen.add(range.pos);
      spans.push({start: range.pos, end: range.end});
    }
  };
  const visit = node => {
    // JSX text is content, not trivia: `//` in a sentence or a URL there is
    // part of the document, and scanning it for comments would blank real
    // markup.
    if (node.kind !== ts.SyntaxKind.JsxText) {
      // Leading ranges stop at the first line break, so a comment that begins
      // on the same line as the code before it is only ever a TRAILING range —
      // which is where `// note` after a statement, and the body of a JSX
      // `{/* … */}`, both live.
      collect(ts.getLeadingCommentRanges(text, node.getFullStart()));
      collect(ts.getTrailingCommentRanges(text, node.getEnd()));
    }
    // `getChildren` walks tokens as well as nodes, which is what a JSX comment
    // needs: `{/* … */}` holds no expression, so its comment hangs off the
    // braces and `forEachChild` never reaches them.
    for (const child of node.getChildren(source)) {
      visit(child);
    }
  };
  try {
    visit(source);
  } catch {
    return [];
  }
  return spans;
}

/**
 * Skip a start or end tag, from its `<` to just past its `>`.
 *
 * Quoted attribute values are skipped whole, so a `>` inside one does not end
 * the tag early — and, with it, a `<!--` written inside an attribute value is
 * never seen as a comment opener, because a comment cannot begin inside a tag.
 */
function skipTag(text, index) {
  let cursor = index + 1;
  while (cursor < text.length) {
    const character = text[cursor];
    if (character === '"' || character === "'") {
      cursor += 1;
      while (cursor < text.length && text[cursor] !== character) cursor += 1;
      cursor += 1;
      continue;
    }
    if (character === '>') return cursor + 1;
    cursor += 1;
  }
  return text.length;
}

/**
 * Comment spans in markup, found by walking the document rather than by
 * scanning it for `<!--`.
 *
 * WHERE a comment can begin is the whole point. `<!--` opens a comment only in
 * markup TEXT. Inside `<script>` and `<style>` — raw-text elements, whose
 * content is JavaScript and CSS, not markup — and inside a tag's own attribute
 * values, the same four characters are ordinary content. A flat scan blanked
 * them anyway, which let a script hide a hatch from the check and then apply
 * it: `const c = '<!-- all: unset -->'` was read as a comment, so
 * `style.cssText = c.slice(4, -3)` set a blanket reset the scan had already
 * agreed not to look at.
 *
 * So the walk reads each region as what it is: a comment is a comment, a raw
 * text element's body is handed to the analyzer for ITS language (where only a
 * real `/* … *\/` or `//` counts), and a tag is skipped whole. Everything else
 * is content and stays fully visible to the scan.
 */
function markupCommentSpans(text, fileName) {
  const spans = [];
  let index = 0;

  while (index < text.length) {
    const next = text.indexOf('<', index);
    if (next === -1) break;

    if (text.startsWith('<!--', next)) {
      const close = text.indexOf('-->', next + 4);
      const end = close === -1 ? text.length : close + 3;
      spans.push({start: next, end});
      index = end;
      continue;
    }

    const rawText = /^<(script|style)\b/i.exec(text.slice(next, next + 8));
    if (rawText) {
      const tag = rawText[1].toLowerCase();
      const bodyStart = skipTag(text, next);
      const closing = new RegExp(`</${tag}\\s*>`, 'i').exec(
        text.slice(bodyStart),
      );
      const bodyEnd = closing ? bodyStart + closing.index : text.length;
      const body = text.slice(bodyStart, bodyEnd);
      const inner =
        tag === 'style'
          ? cssCommentSpans(body)
          : scriptCommentSpans(body, `${fileName}.ts`, ts.ScriptKind.TS);
      for (const span of inner) {
        spans.push({
          start: span.start + bodyStart,
          end: span.end + bodyStart,
        });
      }
      index = closing ? bodyEnd + closing[0].length : text.length;
      continue;
    }

    index = skipTag(text, next);
  }

  return spans;
}

/**
 * The character spans of every comment in `text`, as `{start, end}` offsets.
 *
 * A file whose extension has no analyzer, and a file its analyzer cannot read,
 * both report no comments: nothing is exempted from the scan on a guess.
 */
export function commentSpans(relativePath, text) {
  if (typeof text !== 'string' || text === '') return [];
  const extension = path.extname(relativePath).toLowerCase();
  if (CSS_EXTENSIONS.has(extension)) {
    return cssCommentSpans(text);
  }
  if (SCRIPT_KINDS.has(extension)) {
    return scriptCommentSpans(
      text,
      path.basename(relativePath),
      SCRIPT_KINDS.get(extension),
    );
  }
  if (MARKUP_EXTENSIONS.has(extension)) {
    return markupCommentSpans(text, path.basename(relativePath));
  }
  return [];
}
