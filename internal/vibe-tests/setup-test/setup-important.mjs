// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Syntactic detection of a hardcoded `!important`.
 *
 * The `hardcoded-important` escape hatch used to be a lexical scan: any added
 * line matching `/!\s*important/i` failed the run. That reads prose as code. An
 * executor told — correctly, by the guidance itself — not to paper over a
 * containment problem with `!important` writes that sentence into a JSDoc block
 * above the workaround it chose instead, and the check fails the run for saying
 * the right thing. Three cells of one operator run failed exactly that way, all
 * three on a comment.
 *
 * A declaration is now found the way the browser finds one, by parsing:
 *
 * - CSS and CSS-like files go through **postcss**. `Declaration.important` is
 *   the parser's own answer to "does this declaration carry the flag", so a
 *   comment is a `Comment` node and never a declaration, and `content:
 *   "!important"` is a value string rather than a flag.
 * - Scripts go through the **TypeScript** parser, which handles `.js`, `.jsx`,
 *   `.ts`, and `.tsx` with one API. Comments are trivia and are not nodes, so
 *   they cannot be found; only string and template literals are examined, and
 *   only where the literal is applied as CSS.
 * - HTML, Vue, and Svelte are split into their `<style>` blocks, their
 *   `style="…"` attributes, and their `<script>` blocks, and each part is handed
 *   to the analyzer above that owns it. Comments and text content are neither.
 *
 * Ignoring comments and prose must not open a way to smuggle a real override
 * past the check, so a literal counts as CSS whenever it is applied as CSS:
 *
 * 1. it *contains* a declaration carrying the flag (`color: red !important`),
 *    which covers CSS-in-JS templates, `cssText`, `insertRule`, and inline
 *    style strings, including one assembled across a template's interpolations;
 * 2. it *is* the value of a CSS property — a style-object entry, a `style.*`
 *    assignment, a JSX `style={{…}}` entry — where the property name is a real
 *    CSS property, taken from `CSSStyleDeclaration` in the TypeScript DOM
 *    library rather than from a hand-written list that could miss one;
 * 3. it is the priority argument of `setProperty(property, value, 'important')`,
 *    which sets the same flag without ever spelling `!important`, and which the
 *    old lexical scan could not see at all.
 *
 * Anything the parsers cannot read fails closed: an unparsable stylesheet falls
 * back to a scanner that skips only comments and quoted strings, and a file
 * whose CSS property vocabulary cannot be loaded treats every style-shaped
 * property as a CSS property. A file that cannot be understood is never given
 * the benefit of the doubt.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import postcss from 'postcss';
import ts from 'typescript';

/** The flag itself: `!important`, `! important`, `!IMPORTANT`. */
const IMPORTANT_FLAG = /!\s*important\b/gi;

/**
 * A declaration carrying the flag, inside arbitrary CSS text. The property may
 * be a custom property or an ordinary one, and the value may be anything that
 * does not close the declaration.
 */
const DECLARATION_WITH_FLAG =
  /(?:^|[;{}])\s*(?:--[\w-]+|[A-Za-z][\w-]*)\s*:\s*[^;{}]*?!\s*important\b/gi;

export const CSS_EXTENSIONS = new Set([
  '.css',
  '.less',
  '.pcss',
  '.sass',
  '.scss',
]);
export const SCRIPT_KINDS = new Map([
  ['.cjs', ts.ScriptKind.JS],
  ['.js', ts.ScriptKind.JS],
  ['.jsx', ts.ScriptKind.JSX],
  ['.mjs', ts.ScriptKind.JS],
  ['.ts', ts.ScriptKind.TS],
  ['.tsx', ts.ScriptKind.TSX],
]);
export const MARKUP_EXTENSIONS = new Set(['.html', '.svelte', '.vue']);

/* ---------------------------------------------------------------------------
 * CSS property vocabulary
 *
 * `CSSStyleDeclaration` in TypeScript's DOM library is the browser's own list
 * of CSS properties in camelCase. Reading it keeps the check honest about
 * properties nobody thought to enumerate (`inset`, `scrollbarGutter`,
 * `anchorName`) instead of trusting a list that ages.
 * ------------------------------------------------------------------------- */

const kebab = name =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/^-(?=[a-z])/, '-')
    .toLowerCase();

let cssPropertyNames;

/**
 * Every CSS property name accepted in a style object, in camelCase and kebab
 * form, or `null` when the DOM library cannot be read.
 *
 * The interface that carries the properties has moved between TypeScript
 * versions — it is `CSSStyleProperties` today and was `CSSStyleDeclaration`
 * before — so both are read and unioned rather than assuming either.
 */
export function cssPropertyVocabulary() {
  if (cssPropertyNames !== undefined) {
    return cssPropertyNames;
  }
  cssPropertyNames = null;
  try {
    const require = createRequire(import.meta.url);
    const source = fs.readFileSync(
      require.resolve('typescript/lib/lib.dom.d.ts'),
      'utf8',
    );
    const names = new Set();
    for (const interfaceName of ['CSSStyleProperties', 'CSSStyleDeclaration']) {
      const start = source.indexOf(`\ninterface ${interfaceName}`);
      if (start === -1) {
        continue;
      }
      const bodyStart = source.indexOf('{', start);
      const end = source.indexOf('\n}', bodyStart);
      const body = source.slice(bodyStart, end === -1 ? undefined : end);
      for (const match of body.matchAll(
        /^\s{4}(?:readonly\s+)?(?:"([^"]+)"|([A-Za-z][\w]*))\s*:/gm,
      )) {
        const name = match[1] ?? match[2];
        names.add(name);
        names.add(kebab(name));
      }
    }
    // A scrape that came back thin means the shape changed again; a thin list
    // would quietly stop recognizing style objects, so it is treated as no list
    // at all and the fail-closed branch takes over.
    cssPropertyNames = names.size >= 100 ? names : null;
  } catch {
    cssPropertyNames = null;
  }
  return cssPropertyNames;
}

/**
 * Whether `name` names a CSS property in a style-object position.
 *
 * A custom property always qualifies. Otherwise the DOM vocabulary decides, and
 * when that cannot be loaded every hyphenated or camelCase identifier is
 * treated as a property, so a missing vocabulary over-reports rather than
 * letting an override through.
 */
export function isCssPropertyName(name) {
  if (typeof name !== 'string' || name === '') {
    return false;
  }
  if (name.startsWith('--')) {
    return true;
  }
  const vocabulary = cssPropertyVocabulary();
  if (vocabulary === null) {
    return /^[A-Za-z][\w-]*$/.test(name);
  }
  return vocabulary.has(name) || vocabulary.has(kebab(name));
}

/* ---------------------------------------------------------------------------
 * Offsets and lines
 * ------------------------------------------------------------------------- */

function lineStarts(text) {
  const starts = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\n') {
      starts.push(index + 1);
    }
  }
  return starts;
}

function lineAt(starts, offset) {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (starts[middle] <= offset) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  return low + 1;
}

/** Every offset of the flag inside `text`, relative to `text`. */
function flagOffsets(text, base = 0) {
  const offsets = [];
  for (const match of text.matchAll(IMPORTANT_FLAG)) {
    offsets.push(base + match.index);
  }
  return offsets;
}

/** Offsets of the flag in every declaration that carries one, in CSS text. */
function declarationFlagOffsets(text, base = 0) {
  const offsets = [];
  for (const match of text.matchAll(DECLARATION_WITH_FLAG)) {
    const inner = /!\s*important\b/i.exec(match[0]);
    if (inner) {
      offsets.push(base + match.index + inner.index);
    }
  }
  return offsets;
}

/* ---------------------------------------------------------------------------
 * CSS
 * ------------------------------------------------------------------------- */

/**
 * Flag offsets in a stylesheet, via postcss.
 *
 * Returns `null` when the stylesheet cannot be parsed — SCSS `//` comments and
 * the indented Sass syntax both defeat the default parser — so the caller can
 * fall back rather than silently reporting nothing.
 */
function postcssFlagOffsets(text) {
  let root;
  try {
    root = postcss.parse(text, {from: undefined});
  } catch {
    return null;
  }
  const starts = lineStarts(text);
  const offsetOf = position => {
    if (position == null) {
      return null;
    }
    if (typeof position.offset === 'number') {
      return position.offset;
    }
    const start = starts[position.line - 1];
    return start === undefined ? null : start + position.column - 1;
  };
  const offsets = [];
  root.walkDecls(declaration => {
    if (!declaration.important) {
      return;
    }
    const start = offsetOf(declaration.source?.start);
    const end = offsetOf(declaration.source?.end);
    if (start === null) {
      return;
    }
    const slice = text.slice(start, end === null ? undefined : end + 1);
    const found = flagOffsets(slice, start);
    // `important` is set, so the flag is in this declaration's own text; if the
    // spelling defeats the search, report the declaration's start rather than
    // dropping the finding.
    offsets.push(found.length > 0 ? found.at(-1) : start);
  });
  return offsets;
}

/**
 * Flag offsets in text a parser could not read: everything outside comments and
 * quoted strings. Deliberately blunt — it is the fail-closed path.
 */
function scannedCssFlagOffsets(text) {
  let masked = '';
  let index = 0;
  while (index < text.length) {
    const character = text[index];
    if (character === '/' && text[index + 1] === '*') {
      const close = text.indexOf('*/', index + 2);
      const end = close === -1 ? text.length : close + 2;
      masked += ' '.repeat(end - index);
      index = end;
      continue;
    }
    if (character === '/' && text[index + 1] === '/') {
      const close = text.indexOf('\n', index);
      const end = close === -1 ? text.length : close;
      masked += ' '.repeat(end - index);
      index = end;
      continue;
    }
    if (character === '"' || character === "'") {
      const start = index;
      index += 1;
      while (index < text.length && text[index] !== '\n') {
        if (text[index] === '\\') {
          index += 2;
          continue;
        }
        if (text[index] === character) {
          index += 1;
          break;
        }
        index += 1;
      }
      masked += ' '.repeat(index - start);
      continue;
    }
    masked += character;
    index += 1;
  }
  return flagOffsets(masked);
}

function cssFlagOffsets(text) {
  return postcssFlagOffsets(text) ?? scannedCssFlagOffsets(text);
}

/** Flag offsets in the body of a `style="…"` attribute. */
function styleAttributeFlagOffsets(value) {
  const prefix = 'a{';
  const wrapped = `${prefix}${value}}`;
  const offsets = postcssFlagOffsets(wrapped);
  const found = offsets ?? scannedCssFlagOffsets(wrapped);
  return found
    .map(offset => offset - prefix.length)
    .filter(offset => offset >= 0 && offset < value.length);
}

/* ---------------------------------------------------------------------------
 * Scripts
 * ------------------------------------------------------------------------- */

/** `foo.style.color = '…'` / `foo.style.cssText = '…'` — the assigned property. */
function styleAssignmentProperty(node) {
  const parent = node.parent;
  if (
    !parent ||
    !ts.isBinaryExpression(parent) ||
    parent.operatorToken.kind !== ts.SyntaxKind.EqualsToken ||
    parent.right !== node ||
    !ts.isPropertyAccessExpression(parent.left)
  ) {
    return null;
  }
  const owner = parent.left.expression;
  const ownerName = ts.isPropertyAccessExpression(owner)
    ? owner.name.text
    : ts.isIdentifier(owner)
      ? owner.text
      : null;
  if (ownerName !== 'style') {
    return null;
  }
  return parent.left.name.text;
}

/** The property name a literal sits under in an object literal, if any. */
function objectPropertyName(node) {
  const parent = node.parent;
  if (
    !parent ||
    !ts.isPropertyAssignment(parent) ||
    parent.initializer !== node
  ) {
    return null;
  }
  const name = parent.name;
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) {
    return name.text;
  }
  if (ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
}

/**
 * Whether the object literal a property belongs to is a style object regardless
 * of its keys: a JSX `style={{…}}` value, or a `style`/`sx`/`css` property.
 */
function inDeclaredStyleObject(node) {
  let current = node.parent;
  while (current) {
    if (ts.isObjectLiteralExpression(current)) {
      const owner = current.parent;
      if (owner && ts.isJsxExpression(owner)) {
        const attribute = owner.parent;
        if (
          attribute &&
          ts.isJsxAttribute(attribute) &&
          ts.isIdentifier(attribute.name) &&
          /^(?:style|sx|css)$/i.test(attribute.name.text)
        ) {
          return true;
        }
      }
      if (
        owner &&
        ts.isPropertyAssignment(owner) &&
        (ts.isIdentifier(owner.name) || ts.isStringLiteralLike(owner.name)) &&
        /^(?:style|sx|css)$/i.test(owner.name.text)
      ) {
        return true;
      }
      if (
        owner &&
        ts.isBinaryExpression(owner) &&
        owner.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(owner.left) &&
        /^(?:style|sx|css)$/i.test(owner.left.name.text)
      ) {
        return true;
      }
      return false;
    }
    if (ts.isBlock(current) || ts.isSourceFile(current)) {
      return false;
    }
    current = current.parent;
  }
  return false;
}

/** `element.style.setProperty('color', 'red', 'important')`. */
function isSetPropertyPriority(node) {
  const parent = node.parent;
  if (!parent || !ts.isCallExpression(parent)) {
    return false;
  }
  const callee = parent.expression;
  const name = ts.isPropertyAccessExpression(callee)
    ? callee.name.text
    : ts.isIdentifier(callee)
      ? callee.text
      : null;
  if (name !== 'setProperty') {
    return false;
  }
  const index = parent.arguments.indexOf(node);
  return index === 2 && /^\s*important\s*$/i.test(node.text);
}

/**
 * The cooked text of a template, with each interpolation replaced by a single
 * placeholder character, plus a map back to source offsets. A declaration split
 * across an interpolation — `` `color: ${value} !important` `` — is still a
 * declaration.
 */
function templateText(node) {
  const segments = [];
  let text = '';
  const push = (literal, contentStart) => {
    segments.push({
      start: text.length,
      end: text.length + literal.length,
      contentStart,
    });
    text += literal;
  };
  if (ts.isNoSubstitutionTemplateLiteral(node)) {
    push(node.text, node.getStart() + 1);
    return {text, segments};
  }
  push(node.head.text, node.head.getStart() + 1);
  for (const span of node.templateSpans) {
    text += '\u0001';
    push(span.literal.text, span.literal.getStart() + 1);
  }
  return {text, segments};
}

function mapTemplateOffset(segments, offset) {
  for (const segment of segments) {
    if (offset >= segment.start && offset < segment.end) {
      return segment.contentStart + (offset - segment.start);
    }
  }
  return null;
}

/**
 * Flag offsets in a script: only inside string and template literals, and only
 * where the literal is applied as CSS.
 */
function scriptFlagOffsets(text, fileName, scriptKind) {
  const source = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
  const offsets = [];

  const considerPlainLiteral = node => {
    const content = node.text;
    if (!IMPORTANT_FLAG.test(content)) {
      IMPORTANT_FLAG.lastIndex = 0;
      return;
    }
    IMPORTANT_FLAG.lastIndex = 0;
    const contentStart = node.getStart() + 1;
    const declarationOffsets = declarationFlagOffsets(content, contentStart);
    if (declarationOffsets.length > 0) {
      offsets.push(...declarationOffsets);
      return;
    }
    const property = objectPropertyName(node) ?? styleAssignmentProperty(node);
    if (
      property !== null &&
      (property === 'cssText' ||
        isCssPropertyName(property) ||
        inDeclaredStyleObject(node))
    ) {
      offsets.push(...flagOffsets(content, contentStart));
    }
  };

  const considerTemplate = node => {
    const {text: cooked, segments} = templateText(node);
    for (const offset of declarationFlagOffsets(cooked)) {
      const mapped = mapTemplateOffset(segments, offset);
      if (mapped !== null) {
        offsets.push(mapped);
      }
    }
    const property = objectPropertyName(node) ?? styleAssignmentProperty(node);
    if (
      property !== null &&
      (property === 'cssText' ||
        isCssPropertyName(property) ||
        inDeclaredStyleObject(node))
    ) {
      for (const offset of flagOffsets(cooked)) {
        const mapped = mapTemplateOffset(segments, offset);
        if (mapped !== null) {
          offsets.push(mapped);
        }
      }
    }
  };

  const visit = node => {
    if (ts.isStringLiteral(node)) {
      if (isSetPropertyPriority(node)) {
        offsets.push(node.getStart());
      } else {
        considerPlainLiteral(node);
      }
    } else if (
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateExpression(node)
    ) {
      considerTemplate(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return offsets;
}

/* ---------------------------------------------------------------------------
 * Markup
 * ------------------------------------------------------------------------- */

/** The document with every `<!-- … -->` comment blanked, offsets preserved. */
function maskMarkupComments(text) {
  let masked = text;
  for (const match of text.matchAll(/<!--[\s\S]*?(?:-->|$)/g)) {
    masked =
      masked.slice(0, match.index) +
      ' '.repeat(match[0].length) +
      masked.slice(match.index + match[0].length);
  }
  return masked;
}

function* taggedBlocks(text, tag) {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
  for (const match of text.matchAll(pattern)) {
    yield {body: match[1], start: match.index + match[0].indexOf(match[1])};
  }
}

function markupFlagOffsets(text, fileName) {
  const masked = maskMarkupComments(text);
  const offsets = [];
  for (const block of taggedBlocks(masked, 'style')) {
    offsets.push(
      ...cssFlagOffsets(block.body).map(offset => offset + block.start),
    );
  }
  for (const block of taggedBlocks(masked, 'script')) {
    offsets.push(
      ...scriptFlagOffsets(block.body, `${fileName}.ts`, ts.ScriptKind.TS).map(
        offset => offset + block.start,
      ),
    );
  }
  for (const match of masked.matchAll(
    /\bstyle\s*=\s*("([^"]*)"|'([^']*)')/gi,
  )) {
    const value = match[2] ?? match[3] ?? '';
    const valueStart = match.index + match[0].indexOf(value, 'style'.length);
    offsets.push(
      ...styleAttributeFlagOffsets(value).map(offset => offset + valueStart),
    );
  }
  return offsets;
}

/* ---------------------------------------------------------------------------
 * Entry point
 * ------------------------------------------------------------------------- */

/**
 * The 1-based line numbers of `text` that carry a hardcoded `!important`.
 *
 * A line is reported only when a parser places the flag in an applied CSS
 * declaration, so a comment, a JSDoc block, a prose string, and documentation
 * text are all silent while a real override on the same line is not.
 */
export function importantDeclarationLines(relativePath, text) {
  if (typeof text !== 'string' || text === '') {
    return new Set();
  }
  if (!/important/i.test(text)) {
    return new Set();
  }
  const extension = path.extname(relativePath).toLowerCase();
  let offsets;
  if (CSS_EXTENSIONS.has(extension)) {
    offsets = cssFlagOffsets(text);
  } else if (SCRIPT_KINDS.has(extension)) {
    offsets = scriptFlagOffsets(
      text,
      path.basename(relativePath),
      SCRIPT_KINDS.get(extension),
    );
  } else if (MARKUP_EXTENSIONS.has(extension)) {
    offsets = markupFlagOffsets(text, path.basename(relativePath));
  } else {
    // An extension with no analyzer is judged the fail-closed way rather than
    // waved through.
    offsets = scannedCssFlagOffsets(text);
  }
  const starts = lineStarts(text);
  return new Set(offsets.map(offset => lineAt(starts, offset)));
}
