// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XLE/XLO parser — two surfaces, one AST.
 *
 * Compact (XLE):  A[cp6 @topNav=TN] > L > LC > S[p6] > (C{card-callout}*4) + T
 * Outline (XLO):  indentation for nesting, `slot:` lines, `repeat N:` blocks.
 *
 * Both surfaces produce the same AST and share the attribute-token
 * grammar, so the validator and expander never know which dialect the
 * author wrote. Whitespace is insignificant in compact form; `^` climb
 * is rejected with a correction (groups are the documented way).
 *
 * @input  expression source string
 * @output parse(source) → {roots, overlays, form}
 * @position lib/xle — pure (no I/O, no registry); binding happens in validate.mjs
 */

export class XLEParseError extends Error {
  constructor(message, line, col) {
    super(message);
    this.name = 'XLEParseError';
    this.line = line;
    this.col = col;
  }
}

/** Keys that expand to full prop names before validation. */
export const KEY_ALIASES = {
  p: 'padding', pad: 'padding', g: 'gap', c: 'columns', cols: 'columns',
  w: 'width', h: 'height', cp: 'contentPadding', mw: 'maxWidth',
  mh: 'minHeight', rg: 'rowGap', cg: 'columnGap', t: 'type', sz: 'size',
  v: 'variant', dir: 'direction', dv: 'dividers',
  // Axis-neutral alignment — resolved per component in validate.mjs.
  j: '__mainAxis', a: '__crossAxis', justify: '__mainAxis', align: '__crossAxis',
};

/** Fused shorthand letters (`p6`, `g4`, `cp2`…) — letter must be a KEY_ALIAS. */
const FUSED = new Set(['p', 'g', 'c', 'w', 'h', 'cp', 'mw', 'mh', 'rg', 'cg']);

export function makeNode(name, line, col) {
  return {
    kind: 'node',
    name,
    id: null,
    enumMods: [],
    payload: null,
    payload2: null,
    attrs: [],
    slots: [],
    hint: null,
    repeat: null,
    selected: false,
    children: [],
    line,
    col,
  };
}

function makeGroup(line, col) {
  return {kind: 'group', repeat: null, children: [], line, col};
}

// ─── shared low-level helpers ──────────────────────────────────────────────

const isIdentStart = (ch) => /[A-Za-z]/.test(ch);
const isIdent = (ch) => /[A-Za-z0-9_-]/.test(ch);

/**
 * Split a string into tokens at depth-0 whitespace, where (), [], {} and
 * quotes raise depth. Used for attr blocks and outline lines.
 */
function tokenize(str, line, startCol) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    while (i < str.length && /\s/.test(str[i])) i++;
    if (i >= str.length) break;
    const start = i;
    let depth = 0;
    let quote = null;
    while (i < str.length) {
      const ch = str[i];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if ('([{'.includes(ch)) {
        depth++;
      } else if (')]}'.includes(ch)) {
        depth--;
      } else if (/\s/.test(ch) && depth === 0) {
        break;
      }
      i++;
    }
    if (quote) throw new XLEParseError(`Unterminated ${quote} string`, line, startCol + start + 1);
    if (depth > 0) throw new XLEParseError('Unbalanced brackets in attribute list', line, startCol + start + 1);
    tokens.push({text: str.slice(start, i), col: startCol + start + 1});
  }
  return tokens;
}

/** Parse a scalar/object/list attr value string into a JS value. */
export function parseValue(raw) {
  const s = raw.trim();
  if (/^(['"]).*\1$/.test(s)) return s.slice(1, -1);
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s.startsWith('#')) return {idref: s.slice(1)};
  if (s.startsWith('{') && s.endsWith('}')) {
    const obj = {};
    for (const part of splitTop(s.slice(1, -1), ',')) {
      const idx = part.indexOf(':');
      if (idx === -1) obj[part.trim()] = true;
      else obj[part.slice(0, idx).trim()] = parseValue(part.slice(idx + 1));
    }
    return obj;
  }
  if (s.startsWith('[') && s.endsWith(']')) {
    return splitTop(s.slice(1, -1), ',').map(parseValue);
  }
  if (s.includes(',')) return splitTop(s, ',').map(parseValue);
  return s; // bare ident — enum string
}

/** Split on a separator at bracket/quote depth 0. */
function splitTop(str, sep) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let cur = '';
  for (const ch of str) {
    if (quote) {
      if (ch === quote) quote = null;
      cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch; cur += ch;
    } else if ('([{'.includes(ch)) {
      depth++; cur += ch;
    } else if (')]}'.includes(ch)) {
      depth--; cur += ch;
    } else if (ch === sep && depth === 0) {
      parts.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim() !== '') parts.push(cur);
  return parts.map(p => p.trim()).filter(Boolean);
}

/** Parse `{name +flag +flag2 :arg}` hint body (without braces). */
function parseHintBody(body, line, col) {
  const m = body.trim().match(/^([a-z0-9][a-z0-9-]*)((?:\s*\+[a-z0-9-]+)*)(?:\s*:(.*))?$/);
  if (!m) {
    throw new XLEParseError(
      `'{${body}}' is not a block reference — braces take a kebab-case block name ` +
      `(e.g. {card-callout}); for text content use a quoted payload: Tx"${body}"`,
      line, col,
    );
  }
  return {
    name: m[1],
    flags: (m[2] || '').split('+').map(f => f.trim()).filter(Boolean),
    arg: m[3] != null ? m[3].trim() : null,
  };
}

/**
 * Interpret one attribute token. Returns an attr record or mutates node
 * for special tokens (slots are returned as {kind:'slot'} records too).
 */
function parseAttrToken(token, line) {
  const {text, col} = token;

  if (text.startsWith('@')) {
    const eq = text.indexOf('=');
    if (eq === -1) {
      return {kind: 'slot', key: text.slice(1), value: null, line, col};
    }
    const name = text.slice(1, eq);
    const rest = text.slice(eq + 1);
    let value;
    if (rest.startsWith('(') && rest.endsWith(')')) {
      value = {subexpr: parseCompactSiblings(new CompactStream(rest.slice(1, -1), line, col + eq + 2))};
    } else if (/^(['"]).*\1$/.test(rest)) {
      value = rest.slice(1, -1);
    } else if (rest.startsWith('{') && rest.endsWith('}')) {
      value = {hint: parseHintBody(rest.slice(1, -1), line, col)};
    } else if (rest.startsWith('#')) {
      value = {idref: rest.slice(1)};
    } else {
      value = {subexpr: parseCompactSiblings(new CompactStream(rest, line, col + eq + 2))};
    }
    return {kind: 'slot', key: name, value, line, col};
  }

  if (text.startsWith('!') && text.length > 1) {
    return {kind: 'neg', key: text.slice(1), line, col};
  }

  // key=value (split at first depth-0 '=')
  let depth = 0;
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) { if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") quote = ch;
    else if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    else if (ch === '=' && depth === 0) {
      const rawKey = text.slice(0, i);
      if (!/^[A-Za-z][A-Za-z0-9.]*$/.test(rawKey)) {
        throw new XLEParseError(`Invalid attribute key '${rawKey}'`, line, col);
      }
      return {kind: 'kv', key: rawKey, value: parseValue(text.slice(i + 1)), raw: text, line, col};
    }
  }

  // fused shorthand: letters + number (p6, g0.5, cp2)
  const fused = text.match(/^([a-z]{1,2})(\d+(?:\.\d+)?)$/);
  if (fused && FUSED.has(fused[1])) {
    return {kind: 'kv', key: fused[1], value: Number(fused[2]), raw: text, line, col};
  }
  // fused object: letters + {…} (c{min:340})
  const fusedObj = text.match(/^([a-z]{1,2})(\{.*\})$/);
  if (fusedObj && FUSED.has(fusedObj[1])) {
    return {kind: 'kv', key: fusedObj[1], value: parseValue(fusedObj[2]), raw: text, line, col};
  }

  if (/^[A-Za-z][A-Za-z0-9-]*$/.test(text)) {
    return {kind: 'flag', key: text, line, col};
  }

  throw new XLEParseError(`Cannot parse attribute '${text}'`, line, col);
}

// ─── compact (XLE) surface ─────────────────────────────────────────────────

class CompactStream {
  constructor(src, line = 1, col = 1) {
    this.src = src;
    this.i = 0;
    this.baseLine = line;
    this.baseCol = col;
  }
  pos() {
    const before = this.src.slice(0, this.i);
    const lines = before.split('\n');
    const line = this.baseLine + lines.length - 1;
    const col = (lines.length === 1 ? this.baseCol : 1) + lines[lines.length - 1].length;
    return {line, col};
  }
  peek(offset = 0) { return this.src[this.i + offset]; }
  next() { return this.src[this.i++]; }
  eof() { return this.i >= this.src.length; }
  skipWs() { while (!this.eof() && /\s/.test(this.peek())) this.i++; }
  error(message) {
    const {line, col} = this.pos();
    throw new XLEParseError(message, line, col);
  }
  /** Consume through the matching close bracket; returns inner text. */
  readBalanced(open, close) {
    const startPos = this.pos();
    if (this.peek() !== open) this.error(`Expected '${open}'`);
    this.next();
    const start = this.i;
    let depth = 1;
    let quote = null;
    while (!this.eof()) {
      const ch = this.next();
      if (quote) { if (ch === quote) quote = null; continue; }
      if (ch === '"' || ch === "'") quote = ch;
      else if (ch === open && open !== close) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) return this.src.slice(start, this.i - 1);
      }
    }
    throw new XLEParseError(`Unclosed '${open}'`, startPos.line, startPos.col);
  }
  readString() {
    const quote = this.next();
    const start = this.i;
    while (!this.eof() && this.peek() !== quote) this.next();
    if (this.eof()) this.error('Unterminated string');
    const text = this.src.slice(start, this.i);
    this.next();
    return text;
  }
}

function parseCompactNode(s) {
  const {line, col} = s.pos();
  let name = '';
  // A term may start with `{block}` — an anonymous block reference with no
  // wrapping element (e.g. a domain component placed directly in a Grid).
  if (s.peek() !== '{') {
    if (!isIdentStart(s.peek())) s.error(`Expected a component name, found '${s.peek() ?? 'end of input'}'`);
    while (!s.eof() && /[A-Za-z0-9]/.test(s.peek())) name += s.next();
  }
  const node = makeNode(name || null, line, col);

  // postfix pieces in any sensible order: #id .mod "payload" [attrs] {hint} *N !
  for (;;) {
    const ch = s.peek();
    if (ch === '#') {
      s.next();
      let id = '';
      while (!s.eof() && isIdent(s.peek())) id += s.next();
      if (!id) s.error('Expected an id after #');
      node.id = id;
    } else if (ch === '.') {
      s.next();
      let mod = '';
      while (!s.eof() && /[a-z0-9-]/.test(s.peek())) mod += s.next();
      if (!mod) s.error("Expected an enum value after '.'");
      node.enumMods.push(mod);
    } else if (ch === '"' || ch === "'") {
      const text = s.readString();
      if (node.payload == null) node.payload = text;
      else node.payload2 = text;
    } else if (ch === ':' && (s.peek(1) === '"' || s.peek(1) === "'")) {
      s.next();
      node.payload2 = s.readString();
    } else if (ch === '[') {
      const {line: aLine} = s.pos();
      const body = s.readBalanced('[', ']');
      for (const token of tokenize(body, aLine, 0)) {
        const attr = parseAttrToken(token, aLine);
        if (attr.kind === 'slot') node.slots.push(attr);
        else node.attrs.push(attr);
      }
    } else if (ch === '{') {
      const {line: hLine, col: hCol} = s.pos();
      const body = s.readBalanced('{', '}');
      node.hint = parseHintBody(body, hLine, hCol);
    } else if (ch === '*') {
      s.next();
      let n = '';
      while (!s.eof() && /\d/.test(s.peek())) n += s.next();
      if (!n) s.error("Expected a count after '*'");
      node.repeat = Number(n);
    } else if (ch === '!') {
      s.next();
      node.selected = true;
    } else {
      break;
    }
  }

  s.skipWs();
  if (s.peek() === '>') {
    s.next();
    node.children = parseCompactSiblings(s);
  }
  return node;
}

function parseCompactTerm(s) {
  s.skipWs();
  if (s.peek() === '(') {
    const {line, col} = s.pos();
    const body = s.readBalanced('(', ')');
    const group = makeGroup(line, col);
    group.children = parseCompactSiblings(new CompactStream(body, line, col + 1));
    s.skipWs();
    if (s.peek() === '*') {
      s.next();
      let n = '';
      while (!s.eof() && /\d/.test(s.peek())) n += s.next();
      if (!n) s.error("Expected a count after '*'");
      group.repeat = Number(n);
    }
    s.skipWs();
    if (s.peek() === '>') {
      s.next();
      const children = parseCompactSiblings(s);
      for (const child of group.children) {
        if (child.kind === 'node') child.children.push(...children.map(structuredCloneNode));
      }
    }
    return group;
  }
  return parseCompactNode(s);
}

function structuredCloneNode(node) {
  return JSON.parse(JSON.stringify(node));
}

function parseCompactSiblings(s) {
  const terms = [];
  for (;;) {
    s.skipWs();
    if (s.eof()) break;
    if (s.peek() === '^') {
      s.error("'^' climb-up is not supported — group siblings with (...) instead");
    }
    terms.push(parseCompactTerm(s));
    s.skipWs();
    if (s.peek() === '^') {
      s.error("'^' climb-up is not supported — group siblings with (...) instead");
    }
    if (s.peek() === '+') { s.next(); continue; }
    break;
  }
  return terms;
}

export function parseCompact(source) {
  const parts = source.split(/;;/);
  const main = new CompactStream(parts[0]);
  const roots = parseCompactSiblings(main);
  main.skipWs();
  if (!main.eof()) main.error(`Unexpected '${main.peek()}'`);
  const overlays = [];
  for (const part of parts.slice(1)) {
    const s = new CompactStream(part);
    overlays.push(...parseCompactSiblings(s));
    s.skipWs();
    if (!s.eof()) s.error(`Unexpected '${s.peek()}'`);
  }
  return {roots, overlays, form: 'compact'};
}

// ─── outline (XLO) surface ─────────────────────────────────────────────────

/** Parse one outline line's node chain: `Layout > LayoutContent pad=0 !scroll`. */
function parseOutlineChain(text, line) {
  const segments = splitTop(text, '>');
  let head = null;
  let tail = null;
  for (const segment of segments) {
    const node = parseOutlineNodeSegment(segment, line);
    if (!head) head = node;
    else tail.children.push(node);
    tail = node;
  }
  return {head, tail};
}

function parseOutlineNodeSegment(segment, line) {
  const tokens = tokenize(segment, line, 0);
  if (tokens.length === 0) throw new XLEParseError('Empty node', line, 1);
  const first = tokens[0];
  // Anonymous block reference: a line that starts with `{block}`.
  if (first.text.startsWith('{') && first.text.endsWith('}')) {
    const node = makeNode(null, line, first.col);
    node.hint = parseHintBody(first.text.slice(1, -1), line, first.col);
    for (const token of tokens.slice(1)) {
      if (/^[x*]\d+$/.test(token.text)) node.repeat = Number(token.text.slice(1));
    }
    return node;
  }
  const m = first.text.match(/^([A-Za-z][A-Za-z0-9]*)(#[A-Za-z0-9_-]+)?((?:\.[a-z0-9-]+)*)$/);
  if (!m) {
    throw new XLEParseError(
      `Expected a component name, found '${first.text}'`, line, first.col,
    );
  }
  const node = makeNode(m[1], line, first.col);
  if (m[2]) node.id = m[2].slice(1);
  if (m[3]) node.enumMods = m[3].split('.').filter(Boolean);

  for (const token of tokens.slice(1)) {
    const t = token.text;
    if (/^(['"]).*\1$/.test(t)) {
      if (node.payload == null) node.payload = t.slice(1, -1);
      else node.payload2 = t.slice(1, -1);
    } else if (/^:(['"]).*\1$/.test(t)) {
      node.payload2 = t.slice(2, -1);
    } else if (/^[x*]\d+$/.test(t)) {
      node.repeat = Number(t.slice(1));
    } else if (t === '!') {
      node.selected = true;
    } else if (t.startsWith('{') && t.endsWith('}')) {
      node.hint = parseHintBody(t.slice(1, -1), line, token.col);
    } else {
      const attr = parseAttrToken(token, line);
      if (attr.kind === 'slot') node.slots.push(attr);
      else node.attrs.push(attr);
    }
  }
  return node;
}

export function parseOutline(source) {
  const roots = [];
  const overlays = [];
  // Stack frames: {indent, container: array, node|null}
  const stack = [{indent: -1, container: roots, node: null}];
  let inOverlays = false;

  const lines = source.split('\n');
  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li];
    const lineNo = li + 1;
    if (raw.trim() === '' || raw.trim().startsWith('#') || raw.trim().startsWith('//')) continue;
    const indent = raw.match(/^[ \t]*/)[0].replace(/\t/g, '  ').length;
    const text = raw.trim();

    if (text === 'overlays:') {
      inOverlays = true;
      stack.length = 1;
      continue;
    }

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1];
    const container = parent === stack[0] && inOverlays ? overlays : parent.container;

    const repeatMatch = text.match(/^repeat\s+(\d+):$/);
    if (repeatMatch) {
      const group = makeGroup(lineNo, indent + 1);
      group.repeat = Number(repeatMatch[1]);
      container.push(group);
      stack.push({indent, container: group.children, node: null});
      continue;
    }

    // Single `.*` capture (no `\s+(.*)` overlap) keeps this linear — the
    // inline value, if any, is trimmed in code rather than by the regex.
    const slotMatch = text.match(/^@?([a-z][A-Za-z0-9]*):(.*)$/);
    if (slotMatch && !text.startsWith('http')) {
      if (!parent.node) {
        throw new XLEParseError(
          `Slot '${slotMatch[1]}:' has no parent component`, lineNo, indent + 1,
        );
      }
      const slot = {kind: 'slot', key: slotMatch[1], value: {subexpr: []}, line: lineNo, col: indent + 1};
      parent.node.slots.push(slot);
      const inline = slotMatch[2].trim();
      if (inline) {
        const {head, tail} = parseOutlineChain(inline, lineNo);
        slot.value.subexpr.push(head);
        stack.push({indent, container: tail.children, node: tail});
      } else {
        stack.push({indent, container: slot.value.subexpr, node: null});
      }
      continue;
    }

    const {head, tail} = parseOutlineChain(text, lineNo);
    container.push(head);
    stack.push({indent, container: tail.children, node: tail});
  }

  return {roots, overlays, form: 'outline'};
}

// ─── entry point ───────────────────────────────────────────────────────────

/**
 * Detect which surface the source uses. Multi-line input is outline
 * unless every line break sits inside an operator chain (trailing
 * `>`/`+`/`;;` or unclosed brackets), which is multi-line compact.
 */
export function detectForm(source) {
  const lines = source.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.startsWith('#') && !l.startsWith('//'));
  if (lines.length <= 1) return 'compact';
  if (lines.some(l => /^(overlays:|repeat\s+\d+:)/.test(l))) return 'outline';
  for (let i = 0; i < lines.length - 1; i++) {
    const endsOpen = /[>+(]$/.test(lines[i]) || /;;$/.test(lines[i]);
    const startsOp = /^[>+)]/.test(lines[i + 1]) || /^;;/.test(lines[i + 1]);
    if (!endsOpen && !startsOp) return 'outline';
  }
  return 'compact';
}

/**
 * Parse an XLE/XLO source string.
 * @param {string} source
 * @param {{form?: 'compact'|'outline'|'auto'}} [options]
 */
export function parse(source, {form = 'auto'} = {}) {
  const resolved = form === 'auto' ? detectForm(source) : form;
  return resolved === 'outline' ? parseOutline(source) : parseCompact(source);
}
