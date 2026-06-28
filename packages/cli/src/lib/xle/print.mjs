// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XLE canonical printers — AST → compact (XLE) or outline (XLO) text.
 *
 * Used by `astryx layout check --form …` so either party (agent or human)
 * can request the other surface, and by round-trip conformance tests.
 * Printing is best-effort canonical: spelling variants the lexer
 * normalized are emitted in canonical form.
 *
 * @input  parse() AST (binding not required)
 * @output toCompact(doc) / toOutline(doc)
 * @position lib/xle — inverse of parse.mjs
 */

function valueText(value) {
  if (typeof value === 'string') return /[\s,'"]/.test(value) ? `'${value}'` : value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value && value.idref) return `#${value.idref}`;
  if (Array.isArray(value)) return `[${value.map(valueText).join(',')}]`;
  if (typeof value === 'object' && value !== null) {
    return `{${Object.entries(value)
      .map(([k, v]) => (v === true ? k : `${k}:${valueText(v)}`))
      .join(',')}}`;
  }
  return String(value);
}

function hintText(hint) {
  let out = hint.name;
  for (const flag of hint.flags || []) out += ` +${flag}`;
  if (hint.arg) out += `:${hint.arg}`;
  return `{${out}}`;
}

function attrTokens(node) {
  const tokens = [];
  for (const attr of node.attrs) {
    if (attr.kind === 'kv') tokens.push(`${attr.key}=${valueText(attr.value)}`);
    else if (attr.kind === 'flag') tokens.push(attr.key);
    else if (attr.kind === 'neg') tokens.push(`!${attr.key}`);
  }
  return tokens;
}

function slotTokensCompact(node) {
  return node.slots.map(slot => {
    if (slot.value == null) return `@${slot.key}`;
    if (typeof slot.value === 'string') return `@${slot.key}='${slot.value}'`;
    if (slot.value.hint) return `@${slot.key}=${hintText(slot.value.hint)}`;
    if (slot.value.idref) return `@${slot.key}=#${slot.value.idref}`;
    if (slot.value.subexpr) return `@${slot.key}=(${siblingsCompact(slot.value.subexpr)})`;
    return `@${slot.key}`;
  });
}

function nodeCompact(node) {
  let out = node.name || '';
  if (node.id) out += `#${node.id}`;
  for (const mod of node.enumMods) out += `.${mod}`;
  if (node.payload != null) out += `"${node.payload}"`;
  if (node.payload2 != null) out += `:"${node.payload2}"`;
  const attrs = [...attrTokens(node), ...slotTokensCompact(node)];
  if (attrs.length > 0) out += `[${attrs.join(' ')}]`;
  if (node.hint) out += hintText(node.hint);
  if (node.selected) out += '!';
  if (node.repeat) out += `*${node.repeat}`;
  if (node.children.length > 0) {
    const inner = siblingsCompact(node.children);
    out += node.children.length === 1 ? ` > ${inner}` : ` > ${inner}`;
  }
  return out;
}

function termCompact(item) {
  if (item.kind === 'group') {
    let out = `(${siblingsCompact(item.children)})`;
    if (item.repeat) out += `*${item.repeat}`;
    return out;
  }
  // Multi-sibling children need grouping when this node is itself a sibling.
  return nodeCompact(item);
}

function siblingsCompact(items) {
  return items
    .map((item, i) => {
      const text = termCompact(item);
      // `a > b + c` binds b and c to a; if a itself has a following
      // sibling, the next `+` would rebind into a's children — wrap any
      // non-last sibling that opens a `>` chain in a group.
      const needsGroup =
        i < items.length - 1 && item.kind === 'node' && item.children.length > 0;
      return needsGroup ? `(${text})` : text;
    })
    .join(' + ');
}

export function toCompact(doc) {
  let out = siblingsCompact(doc.roots);
  for (const overlay of doc.overlays) {
    out += ` ;; ${termCompact(overlay)}`;
  }
  return out;
}

// ── outline ────────────────────────────────────────────────────────────────

function nodeOutlineLines(node, depth) {
  const pad = '  '.repeat(depth);
  let line = node.name || '';
  if (node.id) line += `#${node.id}`;
  for (const mod of node.enumMods) line += `.${mod}`;
  if (node.payload != null) line += ` "${node.payload}"`;
  if (node.payload2 != null) line += ` :"${node.payload2}"`;
  const attrs = attrTokens(node);
  if (attrs.length > 0) line += ' ' + attrs.join(' ');
  if (node.hint) line += ' ' + hintText(node.hint);
  if (node.selected) line += ' !';
  if (node.repeat) line += ` x${node.repeat}`;

  const lines = [pad + line.trimStart()];
  for (const slot of node.slots) {
    if (slot.value && slot.value.subexpr) {
      if (slot.value.subexpr.length === 1 && isSimpleNode(slot.value.subexpr[0])) {
        const sub = nodeOutlineLines(slot.value.subexpr[0], 0)[0];
        lines.push(`${pad}  ${slot.key}: ${sub}`);
        // simple = no children, so the single line is complete
      } else {
        lines.push(`${pad}  ${slot.key}:`);
        for (const sub of slot.value.subexpr) lines.push(...itemOutlineLines(sub, depth + 2));
      }
    } else if (typeof slot.value === 'string') {
      lines.push(`${pad}  ${slot.key}: "${slot.value}"`);
    } else if (slot.value && slot.value.hint) {
      lines.push(`${pad}  ${slot.key}: ${hintText(slot.value.hint)}`);
    } else if (slot.value && slot.value.idref) {
      lines.push(`${pad}  ${slot.key}: #${slot.value.idref}`);
    } else {
      lines.push(`${pad}  ${slot.key}:`);
    }
  }
  for (const child of node.children) lines.push(...itemOutlineLines(child, depth + 1));
  return lines;
}

function isSimpleNode(item) {
  return item.kind === 'node' && item.children.length === 0 && item.slots.length === 0;
}

function itemOutlineLines(item, depth) {
  if (item.kind === 'group') {
    // A repeat-less group exists only to disambiguate compact-form
    // sibling chains — indentation already does that, so inline it.
    if (!item.repeat || item.repeat === 1) {
      return item.children.flatMap(child => itemOutlineLines(child, depth));
    }
    const pad = '  '.repeat(depth);
    const lines = [`${pad}repeat ${item.repeat}:`];
    for (const child of item.children) lines.push(...itemOutlineLines(child, depth + 1));
    return lines;
  }
  return nodeOutlineLines(item, depth);
}

export function toOutline(doc) {
  const lines = [];
  for (const item of doc.roots) lines.push(...itemOutlineLines(item, 0));
  if (doc.overlays.length > 0) {
    lines.push('', 'overlays:');
    for (const item of doc.overlays) lines.push(...itemOutlineLines(item, 1));
  }
  return lines.join('\n');
}
