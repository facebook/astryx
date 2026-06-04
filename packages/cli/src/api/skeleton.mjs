// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AST-based layout skeleton extractor for templates.
 *
 * Parses a template's source with @babel/parser and walks the JSX returned
 * by its default export, producing a compact layout outline: nesting comes
 * from the JSX tree, structural components and spatial props (padding, gap,
 * columns, etc.) come from the same traversal — so the component list and
 * the rendered body are always derived from one pass and cannot disagree.
 *
 * This replaces a regex/line-scanning extractor that mangled object-literal
 * props (`columns={{minWidth: 240}}`), mistook `/>` inside slot props for a
 * self-closing parent (orphaning the whole tree), produced unbalanced tags,
 * and truncated mid-tree.
 *
 * @input  source — TSX/JSX source string for a template
 * @output { skeleton: string, components: string[] }
 * @position packages/cli/src/api — consumed by api/template.mjs `--skeleton`
 *
 * SYNC: When modified, update packages/cli/src/api/README.md if present.
 */

import {parse} from '@babel/parser';

/**
 * Props that are never layout-relevant and would only add noise to a layout
 * skeleton. Everything NOT in this set is shown, so spatial props that XDS
 * adds in the future (e.g. a new `inset` or `flow` prop) appear automatically
 * with no change here. A miss only ever adds/removes an annotation — it can
 * never produce malformed output.
 */
const NOISE_PROPS = new Set([
  'key', 'ref', 'id', 'className', 'class', 'style', 'xstyle', 'data-testid',
  'label', 'aria-label', 'aria-labelledby', 'aria-describedby', 'title',
  'href', 'src', 'alt', 'name', 'value', 'defaultValue', 'placeholder',
  'icon', 'startIcon', 'endIcon', 'children',
]);

const MAX_LINES = 80;
const MAX_INLINE_DEPTH = 8;

/** Resolve a JSXIdentifier / JSXMemberExpression to its rightmost name. */
function jsxName(node) {
  if (!node) return '';
  if (node.type === 'JSXIdentifier') return node.name;
  if (node.type === 'JSXMemberExpression') return jsxName(node.property);
  return '';
}

/** Stringify a literal-ish expression node, or return null if not renderable. */
function litToStr(node) {
  if (!node) return null;
  switch (node.type) {
    case 'StringLiteral': return JSON.stringify(node.value);
    case 'NumericLiteral': return String(node.value);
    case 'BooleanLiteral': return String(node.value);
    case 'Identifier': return node.name;
    case 'ObjectExpression': return objToStr(node);
    default: return null;
  }
}

/** Render an object literal like {minWidth: 240, repeat: 'fit'}. */
function objToStr(node) {
  if (node.type !== 'ObjectExpression') return null;
  const parts = [];
  for (const p of node.properties) {
    if (p.type !== 'ObjectProperty') continue;
    const k = p.key.name ?? p.key.value;
    const v = litToStr(p.value);
    if (v != null) parts.push(`${k}: ${v}`);
  }
  return '{' + parts.join(', ') + '}';
}

/**
 * Extract layout-relevant props (preserving object literals) from an opening
 * element. Uses a noise blocklist rather than an allowlist, so any new XDS
 * layout prop shows up automatically. Only props whose values read cleanly
 * (string / number / boolean / object literal) are emitted; complex
 * expressions (handlers, refs, computed values) are omitted as noise.
 */
function layoutProps(opening) {
  const out = [];
  for (const attr of opening.attributes) {
    if (attr.type !== 'JSXAttribute') continue;
    const name = attr.name.name;
    if (typeof name !== 'string') continue;
    // Skip noise: known non-layout props, event handlers (onClick…), and ARIA.
    if (NOISE_PROPS.has(name)) continue;
    if (/^on[A-Z]/.test(name)) continue;
    if (name.startsWith('aria-')) continue;
    const v = attr.value;
    // Boolean shorthand: `hasDivider`
    if (v == null) { out.push(name); continue; }
    if (v.type === 'StringLiteral') { out.push(`${name}="${v.value}"`); continue; }
    if (v.type === 'JSXExpressionContainer') {
      const e = v.expression;
      if (e.type === 'BooleanLiteral') { if (e.value) out.push(name); continue; }
      if (e.type === 'NumericLiteral') { out.push(`${name}={${e.value}}`); continue; }
      if (e.type === 'StringLiteral') { out.push(`${name}="${e.value}"`); continue; }
      if (e.type === 'ObjectExpression') { out.push(`${name}={${objToStr(e)}}`); continue; }
      // Complex expressions (refs, calls, computed values) are omitted.
    }
  }
  return out;
}

/** Read a `style={{padding: ..., gap: ...}}` annotation from a raw <div>. */
function divAnnotation(opening) {
  for (const attr of opening.attributes) {
    if (attr.type !== 'JSXAttribute' || attr.name.name !== 'style') continue;
    const v = attr.value;
    if (!(v && v.type === 'JSXExpressionContainer' &&
          v.expression.type === 'ObjectExpression')) continue;
    const parts = [];
    for (const p of v.expression.properties) {
      if (p.type !== 'ObjectProperty') continue;
      const k = p.key.name ?? p.key.value;
      if (!['padding', 'maxWidth', 'gap', 'margin', 'marginInline'].includes(k)) continue;
      const val = litToStr(p.value);
      if (val != null) parts.push(`${k}: ${val.replace(/^"|"$/g, '')}`);
    }
    if (parts.length) return parts.join(', ');
  }
  return null;
}

/** Find the JSX expression returned by a function/arrow body. */
function fnReturnJSX(fn) {
  const body = fn.body;
  if (!body) return null;
  if (body.type === 'JSXElement' || body.type === 'JSXFragment') return body;
  if (body.type === 'BlockStatement') {
    for (let i = body.body.length - 1; i >= 0; i--) {
      const st = body.body[i];
      if (st.type === 'ReturnStatement' && st.argument) return st.argument;
    }
  }
  return null;
}

/**
 * Does an expression node contain JSX anywhere within it? Used to recognize
 * slot props structurally (`sideNav={<X/>}`, `header={cond ? <A/> : <B/>}`)
 * without a hardcoded prop-name list. Bounded by a node budget so a pathological
 * expression can never run away.
 */
function containsJSX(node, budget = {n: 2000}) {
  if (!node || typeof node !== 'object' || budget.n-- <= 0) return false;
  if (node.type === 'JSXElement' || node.type === 'JSXFragment') return true;
  for (const key in node) {
    if (key === 'loc' || key === 'start' || key === 'end' ||
        key === 'range' || key === 'leadingComments' ||
        key === 'trailingComments') continue;
    const v = node[key];
    if (Array.isArray(v)) {
      for (const item of v) if (containsJSX(item, budget)) return true;
    } else if (v && typeof v === 'object' && typeof v.type === 'string') {
      if (containsJSX(v, budget)) return true;
    }
  }
  return false;
}

/** Collect locally-defined components (PascalCase fn/const) for inlining. */
function collectLocals(ast) {
  const locals = new Map();
  const isComp = n => /^[A-Z]/.test(n);
  for (const n of ast.program.body) {
    if (n.type === 'FunctionDeclaration' && n.id && isComp(n.id.name)) {
      locals.set(n.id.name, n);
    }
    if (n.type === 'VariableDeclaration') {
      for (const d of n.declarations) {
        if (d.id.type === 'Identifier' && isComp(d.id.name) && d.init &&
            (d.init.type === 'ArrowFunctionExpression' ||
             d.init.type === 'FunctionExpression')) {
          locals.set(d.id.name, d.init);
        }
      }
    }
  }
  return locals;
}

/**
 * Build an intermediate tree of plain nodes from a JSX AST node.
 * Node shapes:
 *   { comp, props[], children[] }     — an XDS element
 *   { comment }                        — a `/* ... *​/` annotation line
 *   { slot, children[] }               — a named slot marker + its subtree
 * Returns an array (a JSX node may expand to 0..n skeleton nodes).
 */
function buildTree(node, ctx) {
  if (!node) return [];
  switch (node.type) {
    case 'JSXFragment': {
      const out = [];
      for (const c of node.children) out.push(...buildTree(c, ctx));
      return out;
    }
    case 'JSXText':
      return [];
    case 'JSXExpressionContainer':
      return buildExpr(node.expression, ctx);
    case 'ParenthesizedExpression':
      return buildTree(node.expression, ctx);
    case 'JSXElement':
      break;
    default:
      return [];
  }

  const opening = node.openingElement;
  const raw = jsxName(opening.name);
  const isXDS = raw.startsWith('XDS');

  // JSX-valued props are treated as named slots (sideNav={<X/>}, header={<Y/>}).
  // We detect them structurally — any prop whose value is (or contains) JSX —
  // rather than from a hardcoded name list, so new XDS slots work automatically.
  // Slot *markers* are only meaningful on XDS layout components; on other
  // elements (e.g. a recharts `<Tooltip content={<X/>} />`) the same attribute
  // is not a layout slot, so we descend into its JSX without emitting a marker.
  const slotChildren = [];
  for (const attr of opening.attributes) {
    if (attr.type !== 'JSXAttribute') continue;
    if (!attr.value || attr.value.type !== 'JSXExpressionContainer') continue;
    const expr = attr.value.expression;
    if (!containsJSX(expr)) continue;
    const built = buildExpr(expr, ctx);
    if (built.length === 0) continue;
    if (isXDS && typeof attr.name.name === 'string') {
      slotChildren.push({slot: attr.name.name, children: built});
    } else {
      slotChildren.push(...built);
    }
  }

  if (isXDS) {
    const comp = raw.slice(3);
    const props = layoutProps(opening);
    const kids = [];
    for (const c of node.children) kids.push(...buildTree(c, ctx));
    return [{comp, props, children: [...slotChildren, ...kids]}];
  }

  // Local helper component — inline its returned JSX so structure is complete.
  if (/^[A-Z]/.test(raw) && ctx.locals.has(raw) &&
      !ctx.stack.has(raw) && ctx.stack.size < MAX_INLINE_DEPTH) {
    const ret = fnReturnJSX(ctx.locals.get(raw));
    ctx.stack.add(raw);
    const inlined = ret ? buildTree(ret, ctx) : [];
    ctx.stack.delete(raw);
    return [...slotChildren, ...inlined];
  }

  // Raw <div> with spatial style → annotation comment + its children.
  if (raw === 'div') {
    const ann = divAnnotation(opening);
    const inner = [];
    for (const c of node.children) inner.push(...buildTree(c, ctx));
    return ann ? [{comment: `div: ${ann}`}, ...slotChildren, ...inner] : [...slotChildren, ...inner];
  }

  // Other non-XDS element (unresolved helper, fragment-like wrapper): descend
  // into slots + children, but don't print the wrapper itself.
  const out = [];
  out.push(...slotChildren);
  for (const c of node.children) out.push(...buildTree(c, ctx));
  return out;
}

/** Descend into JSX-bearing expressions: {cond && <X/>}, {a ? <X/> : <Y/>}, {arr.map(...)}. */
function buildExpr(node, ctx) {
  if (!node) return [];
  switch (node.type) {
    case 'JSXElement':
    case 'JSXFragment':
      return buildTree(node, ctx);
    case 'LogicalExpression':
      return buildExpr(node.right, ctx);
    case 'ConditionalExpression':
      return [...buildExpr(node.consequent, ctx), ...buildExpr(node.alternate, ctx)];
    case 'ParenthesizedExpression':
      return buildExpr(node.expression, ctx);
    case 'CallExpression': {
      const out = [];
      for (const arg of node.arguments) {
        if (arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression') {
          const b = arg.body;
          if (b.type === 'BlockStatement') {
            for (const st of b.body) {
              if (st.type === 'ReturnStatement' && st.argument) {
                out.push(...buildExpr(st.argument, ctx));
              }
            }
          } else {
            out.push(...buildExpr(b, ctx));
          }
        }
      }
      return out;
    }
    default:
      return [];
  }
}

/**
 * Serialize the intermediate tree to indented skeleton text. Truncation is
 * depth-aware: once MAX_LINES is reached we stop opening new content and emit
 * a single `...`, but every already-opened tag is still closed so the output
 * is always tag-balanced.
 *
 * Component names are collected here — from the nodes actually emitted — so
 * the returned list can never list a component the body doesn't show (and
 * vice versa), even when the tree is truncated.
 *
 * @returns {{ text: string, components: Set<string> }}
 */
function serialize(tree) {
  const out = [];
  const components = new Set();
  let truncated = false;

  function emit(nodes, depth) {
    const pad = '  '.repeat(depth);
    for (const n of nodes) {
      if (n.comment) {
        if (out.length >= MAX_LINES) { markTruncated(pad); return; }
        out.push(pad + `/* ${n.comment} */`);
        continue;
      }
      if (n.slot) {
        if (out.length >= MAX_LINES) { markTruncated(pad); return; }
        out.push(pad + `/* ${n.slot}: */`);
        emit(n.children || [], depth);
        continue;
      }
      // XDS element
      const propStr = n.props && n.props.length ? ' ' + n.props.join(' ') : '';
      const kids = n.children || [];
      if (kids.length === 0) {
        if (out.length >= MAX_LINES) { markTruncated(pad); return; }
        out.push(pad + `<${n.comp}${propStr} />`);
        components.add(n.comp);
        continue;
      }
      if (out.length >= MAX_LINES) { markTruncated(pad); return; }
      out.push(pad + `<${n.comp}${propStr}>`);
      components.add(n.comp);
      emit(kids, depth + 1);
      // Always close — even past the cap — to keep tags balanced.
      out.push(pad + `</${n.comp}>`);
    }
  }

  function markTruncated(pad) {
    if (!truncated) {
      out.push(pad + '...');
      truncated = true;
    }
  }

  emit(tree, 0);
  return {text: out.join('\n'), components};
}

/** Find the JSX returned by the module's default-export component. */
function findRootJSX(ast) {
  let def = null;
  for (const n of ast.program.body) {
    if (n.type === 'ExportDefaultDeclaration') def = n.declaration;
  }
  if (!def) return null;
  if (def.type === 'FunctionDeclaration' ||
      def.type === 'FunctionExpression' ||
      def.type === 'ArrowFunctionExpression') {
    return fnReturnJSX(def);
  }
  if (def.type === 'Identifier') {
    // `export default Foo;` — resolve to a local component if present.
    const locals = collectLocals(ast);
    const fn = locals.get(def.name);
    return fn ? fnReturnJSX(fn) : null;
  }
  return null;
}

/**
 * Extract a layout skeleton and its structural component list from template
 * source. Both are produced from a single AST traversal.
 *
 * @param {string} source
 * @returns {{ skeleton: string, components: string[] }}
 */
export function extractSkeleton(source) {
  let ast;
  try {
    ast = parse(source, {sourceType: 'module', plugins: ['jsx', 'typescript']});
  } catch {
    return {skeleton: '', components: []};
  }
  const root = findRootJSX(ast);
  if (!root) return {skeleton: '', components: []};

  const ctx = {locals: collectLocals(ast), stack: new Set()};
  const tree = buildTree(root, ctx);
  const {text, components} = serialize(tree);
  return {
    skeleton: text,
    // Components are taken from what was actually emitted, so the header and
    // body are guaranteed consistent even under truncation.
    components: [...components].sort(),
  };
}
