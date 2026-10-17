// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Loose comparison of TypeScript type text, for checking a documented
 * prop type against the type its source declares.
 *
 * Two type texts are the same type here when they are equal after
 * {@link normalizeTypeText}: comments, whitespace, `React.` qualifiers,
 * `readonly` and `Readonly<…>`, and the names of function parameters are
 * ignored; single and double quotes, `Array<T>` and `T[]`, and `;` and `,`
 * between members are equivalent; the members of a union or an object type
 * may come in any order; `true | false` is `boolean`, and a string or number
 * literal beside `string` or `number` is absorbed by it; `never` is dropped
 * from a union, and so is `undefined` on an optional prop. Separately,
 * {@link typeTextMatches} lets a name the documented type writes without type
 * arguments match the same name with any arguments.
 *
 * @input Type text as written in a doc or a source file, or printed by the
 *   TypeScript compiler.
 * @output A canonical string per type, and a match verdict.
 * @position Used by the prop-drift comparison (prop-drift.mjs).
 */

/**
 * Remove comments and whitespace outside string literals, and single-quote
 * string literals.
 * @param {string} text
 * @returns {string}
 */
function compact(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end === -1 ? text.length : end + 1;
      continue;
    }
    if (c === '/' && text[i + 1] === '/') {
      const end = text.indexOf('\n', i + 2);
      i = end === -1 ? text.length : end;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      let body = '';
      let j = i + 1;
      while (j < text.length && text[j] !== c) {
        if (text[j] === '\\' && j + 1 < text.length) {
          body += text[j] + text[j + 1];
          j += 2;
          continue;
        }
        body += text[j];
        j++;
      }
      if (c === '`') out += '`' + body + '`';
      else {
        const plain =
          c === '"' ? body.replace(/\\"/g, '"') : body.replace(/\\'/g, "'");
        out += `'${plain.replace(/'/g, "\\'")}'`;
      }
      i = j;
      continue;
    }
    if (/\s/.test(c)) {
      // Keep one space only where it separates two words (`keyof T`).
      const prev = out[out.length - 1];
      let k = i + 1;
      while (k < text.length && /\s/.test(text[k])) k++;
      const next = text[k];
      if (prev && next && /[\w$]/.test(prev) && /[\w$]/.test(next)) out += ' ';
      i = k - 1;
      continue;
    }
    out += c;
  }
  return out;
}

/**
 * Index of the bracket that closes the one at `open`, or -1.
 * @param {string} text
 * @param {number} open
 */
function closingIndex(text, open) {
  let depth = 0;
  /** @type {string | null} */
  let quote = null;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '`') quote = c;
    else if (c === '=' && text[i + 1] === '>') i++;
    else if ('([{<'.includes(c)) depth++;
    else if (')]}>'.includes(c)) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Split on a separator at bracket depth 0. With `arrowEndsSplit`, a top-level
 * `=>` takes the rest of the text as its return type.
 * @param {string} text
 * @param {string} separator one character
 * @param {boolean} [arrowEndsSplit]
 * @returns {string[]}
 */
function splitTop(text, separator, arrowEndsSplit = false) {
  /** @type {string[]} */
  const parts = [];
  let depth = 0;
  let start = 0;
  /** @type {string | null} */
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '`') quote = c;
    else if (c === '=' && text[i + 1] === '>') {
      if (arrowEndsSplit && depth === 0) break;
      i++;
    } else if ('([{<'.includes(c)) depth++;
    else if (')]}>'.includes(c)) depth--;
    else if (c === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** @param {string} text */
function stripParens(text) {
  let out = text;
  while (
    out.startsWith('(') &&
    out.endsWith(')') &&
    closingIndex(out, 0) === out.length - 1
  ) {
    out = out.slice(1, -1);
  }
  return out;
}

/**
 * Normalize the members of a union.
 * @param {string} text compacted
 * @param {boolean} optional drop `undefined`
 * @returns {string[]}
 */
function unionMembers(text, optional) {
  /** @type {Set<string>} */
  const members = new Set();
  const visit = (/** @type {string} */ part) => {
    const inner = stripParens(part.trim().replace(/^\|/, ''));
    if (inner === '') return;
    const nested = splitTop(inner, '|', true);
    if (nested.length > 1) {
      for (const member of nested) visit(member);
      return;
    }
    members.add(normalizeMember(inner));
  };
  for (const part of splitTop(text.replace(/^\|/, ''), '|', true)) visit(part);
  members.delete('never');
  if (optional) members.delete('undefined');
  if (members.has('true') && members.has('false')) {
    members.delete('true');
    members.delete('false');
    members.add('boolean');
  }
  if (members.has('boolean')) {
    members.delete('true');
    members.delete('false');
  }
  for (const member of [...members]) {
    if (members.has('string') && /^'.*'$/.test(member)) members.delete(member);
    if (members.has('number') && /^-?\d+(\.\d+)?$/.test(member)) {
      members.delete(member);
    }
  }
  return [...members].sort();
}

/**
 * Normalize one non-union type expression.
 * @param {string} text compacted
 * @returns {string}
 */
function normalizeMember(text) {
  let rest = text.replace(/^readonly /, '');
  let out = '';
  let i = 0;
  while (i < rest.length) {
    const c = rest[i];
    if (c === "'" || c === '`') {
      let j = i + 1;
      while (j < rest.length && rest[j] !== c) j += rest[j] === '\\' ? 2 : 1;
      out += rest.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if ('([{<'.includes(c)) {
      const close = closingIndex(rest, i);
      if (close === -1) {
        out += rest.slice(i);
        break;
      }
      const inner = rest.slice(i + 1, close);
      const after = rest.slice(close + 1);
      if (c === '{') out += `{${objectMembers(inner)}}`;
      else if (c === '[') out += `[${listMembers(inner)}]`;
      else if (c === '<') {
        const name = /[\w$.]+$/.exec(out)?.[0];
        const args = listMembers(inner);
        if (name === 'Array' || name === 'ReadonlyArray') {
          out = out.slice(0, -name.length) + arrayOf(args);
        } else if (name === 'Readonly' && !args.includes(',')) {
          out = out.slice(0, -name.length) + args;
        } else out += `<${args}>`;
      } else if (after.startsWith('=>')) {
        out += `(${paramMembers(inner)})=>${normalizeTypeText(after.slice(2)).join('|')}`;
        break;
      } else {
        const members = unionMembers(inner, false);
        out +=
          members.length > 1 ? `(${members.join('|')})` : (members[0] ?? '()');
      }
      i = close + 1;
      continue;
    }
    if (c === '=' && rest[i + 1] === '>') {
      // A generic function's `<T>(…) =>` arrives here after its parameters.
      out += `=>${normalizeTypeText(rest.slice(i + 2)).join('|')}`;
      break;
    }
    out += c;
    i++;
  }
  return out.replace(/(^|[^\w$.])React\./g, '$1').replace(/readonly /g, '');
}

/** @param {string} args already normalized */
function arrayOf(args) {
  const top = splitTop(args, '|');
  return top.length > 1 || args.includes('=>') ? `(${args})[]` : `${args}[]`;
}

/**
 * @param {string} inner
 */
function listMembers(inner) {
  return splitTop(inner.replace(/;/g, ','), ',')
    .filter(part => part !== '')
    .map(part => normalizeTypeText(part).join('|'))
    .join(',');
}

/**
 * Function parameters, names dropped, order kept.
 * @param {string} inner
 */
function paramMembers(inner) {
  return splitTop(inner, ',')
    .filter(part => part !== '')
    .map(part => {
      const match = /^(\.\.\.)?[\w$]+(\?)?:(.*)$/.exec(part);
      if (!match) return part;
      const [, rest = '', optional = '', type = ''] = match;
      return `${rest}${optional}${normalizeTypeText(type).join('|')}`;
    })
    .join(',');
}

/**
 * Object type members, sorted, each member's type normalized.
 * @param {string} inner
 */
function objectMembers(inner) {
  return splitTop(inner.replace(/;/g, ','), ',')
    .filter(part => part !== '')
    .map(part => {
      const colon = splitTop(part, ':');
      if (colon.length < 2) return part;
      const key = colon[0].replace(/^readonly /, '');
      return `${key}:${normalizeTypeText(colon.slice(1).join(':')).join('|')}`;
    })
    .sort()
    .join(',');
}

/**
 * The canonical members of a type's union, per the rules in the file header.
 * @param {string} text
 * @param {{optional?: boolean}} [options]
 * @returns {string[]}
 */
export function normalizeTypeText(text, options = {}) {
  return unionMembers(compact(String(text)), options.optional === true);
}

/**
 * Do the documented type and one of the code's renderings name the same
 * type, loosely? A name the doc writes without type arguments also matches
 * that name with arguments in the code.
 * @param {string} docType
 * @param {string[][]} codeRenderings each a list of type texts to union
 * @param {boolean} optional
 * @returns {boolean}
 */
export function typeTextMatches(docType, codeRenderings, optional) {
  const doc = normalizeTypeText(docType, {optional}).join('|');
  const bare = new Set(
    [...doc.matchAll(/([A-Za-z_$][\w$.]*)(?![\w$.<])/g)].map(m => m[1]),
  );
  for (const texts of codeRenderings) {
    if (texts.length === 0) continue;
    const code = [
      ...new Set(texts.flatMap(text => normalizeTypeText(text, {optional}))),
    ]
      .sort()
      .join('|');
    if (code === doc) return true;
    if (eraseArguments(code, bare) === doc) return true;
  }
  return false;
}

/**
 * Remove the type arguments after each name in `names`, then re-normalize.
 * @param {string} text normalized
 * @param {Set<string>} names
 */
function eraseArguments(text, names) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '<') {
      const name = /[A-Za-z_$][\w$.]*$/.exec(out)?.[0];
      if (name && names.has(name)) {
        const close = closingIndex(text, i);
        if (close !== -1) {
          i = close;
          continue;
        }
      }
    }
    out += c;
  }
  return out === text ? text : normalizeTypeText(out).join('|');
}
