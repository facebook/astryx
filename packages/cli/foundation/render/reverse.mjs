// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx experimental render --reverse` without an embedded source:
 * rebuild a page module from Astryx markup. Each element whose class list
 * names an Astryx component (`astryx-<name>`) becomes that component, with
 * the props its `data-*` attributes record and its text. This keeps text and
 * layout; styling, state and behavior are not in the markup, so the result is
 * a starting point, not the original.
 *
 * @position foundation/render — used by the render subject
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';

/** @typedef {{tag: string, attrs: Record<string, string>, children: Node[]}} ElementNode */
/** @typedef {ElementNode | {text: string}} Node */

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'source', 'track', 'wbr',
]);

/** @param {string} s */
const decode = s =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&amp;/g, '&');

/**
 * A small, forgiving HTML parser: enough for rendered markup.
 * @param {string} html
 * @returns {ElementNode}
 */
export function parseHtml(html) {
  /** @type {ElementNode} */
  const root = {tag: '#root', attrs: {}, children: []};
  /** @type {ElementNode[]} */
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>|([^<]+|<)/gi;
  /** @type {RegExpExecArray | null} */
  let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[1]) {
      const tag = m[1].toLowerCase();
      const at = stack.map(n => n.tag).lastIndexOf(tag);
      if (at > 0) stack.length = at;
    } else if (m[2]) {
      const tag = m[2].toLowerCase();
      /** @type {Record<string, string>} */
      const attrs = {};
      for (const a of (m[3] ?? '').matchAll(/([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
        attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? '');
      }
      /** @type {ElementNode} */
      const node = {tag, attrs, children: []};
      top.children.push(node);
      if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'title') {
        const end = html.toLowerCase().indexOf(`</${tag}`, re.lastIndex);
        const stop = end < 0 ? html.length : end;
        node.children.push({text: html.slice(re.lastIndex, stop)});
        re.lastIndex = stop;
        stack.push(node);
      } else if (!VOID.has(tag) && !m[4]) {
        stack.push(node);
      }
    } else if (m[5]) {
      top.children.push({text: decode(m[5])});
    }
  }
  return root;
}

/** @param {Node} n @returns {n is ElementNode} */
const isEl = n => 'tag' in n;

/** Elements whose children React refuses or treats as a value. */
const FORM_TAGS = new Set(['input', 'textarea', 'select']);

/**
 * Whether an element draws one of `tags` itself, not inside another Astryx
 * component it contains.
 * @param {ElementNode} n @param {Set<string>} tags @returns {boolean}
 */
const hasTag = (n, tags) =>
  tags.has(n.tag) ||
  n.children.some(c => isEl(c) && !astryxClass(c) && hasTag(c, tags));

/** @param {ElementNode} n @param {string} tag @returns {ElementNode | undefined} */
function find(n, tag) {
  for (const c of n.children) {
    if (!isEl(c)) continue;
    if (c.tag === tag) return c;
    const f = find(c, tag);
    if (f) return f;
  }
  return undefined;
}

/** @param {Node} n @returns {string} */
const textOf = n =>
  isEl(n)
    ? n.tag === 'script' || n.tag === 'style'
      ? ''
      : n.children.map(textOf).join('')
    : n.text;

/** @param {ElementNode} n */
const astryxClass = n =>
  (n.attrs.class ?? '')
    .split(/\s+/)
    .find(c => /^astryx-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c))
    ?.slice('astryx-'.length);

/**
 * Whether markup was rendered from Astryx components.
 * @param {string} html
 */
export const isAstryxMarkup = html => /\sclass="(?:[^"]*\s)?astryx-[a-z0-9]/.test(html);

/** @param {string} s */
const pascal = s => s.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());

/** @param {string} s */
const camel = s => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/**
 * @typedef {object} ComponentEntry
 * @property {string} name - Export name.
 * @property {string} module - Import specifier.
 * @property {Set<string>} props - Prop names its declaration lists.
 * @property {Set<string>} numeric - Props whose type includes `number`.
 * @property {Map<string, string>} required - Props its declaration requires, with their declared types.
 * @property {boolean} children - Whether it takes children.
 * @property {boolean} label - Whether it takes `label`.
 */

/**
 * Map each theme target (the `astryx-<name>` class) to the components that
 * render it, by reading an installed package's built modules.
 * @param {string} pkg e.g. `@astryxdesign/core`
 * @param {string} fromDir where to resolve it from
 * @returns {Map<string, ComponentEntry[]>}
 */
export function componentMap(pkg, fromDir) {
  /** @type {Map<string, ComponentEntry[]>} */
  const map = new Map();
  /** @type {string} */
  let dist;
  try {
    const req = createRequire(path.join(fromDir, 'noop.js'));
    let d = path.dirname(req.resolve(pkg));
    while (!fs.existsSync(path.join(d, 'package.json')) && path.dirname(d) !== d) d = path.dirname(d);
    dist = path.join(d, 'dist');
  } catch {
    return map;
  }
  if (!fs.existsSync(dist)) return map;
  // Where each name can be imported from: the package's public subpaths.
  /** @type {Map<string, string[]>} */
  const exported = new Map();
  try {
    const pj = JSON.parse(fs.readFileSync(path.join(dist, '..', 'package.json'), 'utf8'));
    for (const [key, value] of Object.entries(pj.exports ?? {})) {
      const target = typeof value === 'string' ? value : /** @type {any} */ (value)?.default ?? /** @type {any} */ (value)?.import;
      if (key === '.' || typeof target !== 'string' || !target.endsWith('.js')) continue;
      const file = path.join(dist, '..', target);
      if (!fs.existsSync(file)) continue;
      const js = fs.readFileSync(file, 'utf8');
      /** @type {string[]} */
      const names = [];
      for (const m of js.matchAll(/export\s*\{([^}]*)\}/g)) {
        for (const part of m[1].split(',')) {
          const name = part.trim().split(/\s+as\s+/).pop()?.trim();
          if (name) names.push(name);
        }
      }
      for (const m of js.matchAll(/export\s+(?:function|const|class)\s+([A-Za-z0-9_]+)/g)) names.push(m[1]);
      for (const name of names) {
        const list = exported.get(name) ?? [];
        list.push(`${pkg}/${key.slice(2)}`);
        exported.set(name, list);
      }
    }
  } catch {
    // No readable exports map: fall back to folder names.
  }
  /** @param {string} name @param {string} folder */
  const moduleFor = (name, folder) => {
    const list = exported.get(name);
    if (!list) return null;
    return list.find(m => m.endsWith(`/${name}`)) ?? list.find(m => m.endsWith(`/${folder}`)) ?? list[0];
  };
  for (const dirent of fs.readdirSync(dist, {withFileTypes: true})) {
    if (!dirent.isDirectory()) continue;
    const folder = path.join(dist, dirent.name);
    for (const file of fs.readdirSync(folder)) {
      if (!file.endsWith('.js')) continue;
      const js = fs.readFileSync(path.join(folder, file), 'utf8');
      const targets = [...js.matchAll(/themeProps\(\s*['"]([a-z0-9-]+)['"]/g)].map(t => t[1]);
      if (targets.length === 0) continue;
      const names = [...js.matchAll(/^([A-Z][A-Za-z0-9]*)\.displayName = ['"]([A-Za-z0-9.]+)['"]/gm)].map(n => n[1]);
      if (names.length === 0) continue;
      const dts = path.join(folder, file.replace(/\.js$/, '.d.ts'));
      const decl = fs.existsSync(dts) ? fs.readFileSync(dts, 'utf8') : '';
      for (const target of new Set(targets)) {
        for (const name of names) {
          /** @type {Set<string>} */
          const props = new Set();
          /** @type {Set<string>} */
          const numeric = new Set();
          /** @type {Map<string, string>} */
          const required = new Map();
          const body = new RegExp(`interface ${name}Props[^{]*\\{([\\s\\S]*?)\\n\\}`).exec(decl)?.[1] ?? '';
          for (const p of body.matchAll(/^\s{4}(?:readonly\s+)?([a-zA-Z][\w]*)\??:\s*([^;]*)/gm)) {
            props.add(p[1]);
            if (!/^\s{4}(?:readonly\s+)?[a-zA-Z]\w*\?/.test(p[0])) required.set(p[1], p[2].trim());
            if (/\bnumber\b|\b\d+\b/.test(p[2])) numeric.add(p[1]);
          }
          const module = moduleFor(name, dirent.name);
          if (!module) continue;
          const entry = {
            name,
            module,
            props,
            numeric,
            required,
            children: props.has('children') || /extends[^{]*(PropsWithChildren|HTMLAttributes|ComponentProps)/.test(decl),
            label: props.has('label'),
          };
          const list = map.get(target) ?? [];
          if (!list.some(e => e.name === name)) list.push(entry);
          // A stack with a fixed direction reads best as VStack / HStack.
          if (target === 'stack' && name === 'Stack') {
            for (const alias of ['VStack', 'HStack']) {
              const aliasModule = moduleFor(alias, dirent.name);
              if (!aliasModule || list.some(e => e.name === alias)) continue;
              const aliasProps = new Set(props);
              aliasProps.delete('direction');
              list.push({...entry, name: alias, module: aliasModule, props: aliasProps});
            }
          }
          map.set(target, list);
        }
      }
    }
  }
  return map;
}

/**
 * Pick the component for one element.
 * @param {ComponentEntry[]} list
 * @param {string} target
 * @param {ElementNode} el
 */
function pick(list, target, el) {
  const exact = list.find(e => e.name === pascal(target));
  const dir = el.attrs['data-direction'];
  if (dir) {
    const prefix = dir === 'horizontal' ? 'H' : dir === 'vertical' ? 'V' : '';
    const hit = prefix ? list.find(e => e.name === `${prefix}${pascal(target)}`) : undefined;
    if (hit) return hit;
  }
  return exact ?? list.find(e => e.name.endsWith(pascal(target))) ?? list[0];
}

/** Theme targets whose content the markup cannot give back (an icon's
 *  drawing is markup, not the component it came from). */
const OMIT = new Set(['icon']);

/** Attributes a component writes about itself that are not props. */
const NOT_PROPS = new Set(['astryx-pressable', 'state']);

/**
 * A stand-in value for a required prop the markup does not record, or null
 * when its type allows none (a list, an object, a named type).
 * @param {string} prop
 * @param {string} type
 * @param {ElementNode} el
 * @param {string} text
 * @returns {string | null}
 */
function standIn(prop, type, el, text) {
  const ty = type.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (/=>/.test(ty)) return `${prop}={() => {}}`;
  if (/\[\]|Array<|Record<|\{/.test(ty)) return null;
  if (/^number\b/.test(ty)) {
    const v = Number(el.attrs['aria-valuenow'] ?? el.attrs[`data-${prop}`] ?? 0);
    return `${prop}={${Number.isFinite(v) ? v : 0}}`;
  }
  if (/^boolean\b/.test(ty)) return `${prop}={false}`;
  if (/^(React\.)?(ReactNode|ReactElement)/.test(ty)) return `${prop}={null}`;
  if (/^string\b/.test(ty)) {
    const v = el.attrs['aria-label'] ?? el.attrs.title ?? (/(label|title|name|text)$/i.test(prop) ? text : '');
    return `${prop}=${jsxAttr(v)}`;
  }
  const literal = /^['"]([^'"]*)['"]/.exec(ty);
  if (literal) return `${prop}=${jsxAttr(literal[1])}`;
  return null;
}

/** @param {string} s */
const jsxText = s => s.replace(/[{}<>]/g, c => `{'${c}'}`);

/** @param {string} s */
const jsxAttr = s => JSON.stringify(s);

/**
 * Rebuild a page module from Astryx markup.
 * @param {string} html
 * @param {string} fromDir where to find the installed packages
 * @returns {{source: string, components: string[], elements: number, unknown: string[], omitted: string[]}}
 */
export function rebuildPage(html, fromDir) {
  const doc = parseHtml(html);
  const body = find(doc, 'body') ?? doc;
  const maps = ['@astryxdesign/core', '@astryxdesign/lab', '@astryxdesign/charts'].map(p => componentMap(p, fromDir));
  /** @param {string} target */
  const lookup = target => {
    for (const m of maps) {
      const list = m.get(target);
      if (list?.length) return list;
    }
    return undefined;
  };
  /** @type {Map<string, Set<string>>} */
  const imports = new Map();
  /** @type {Set<string>} */
  const unknown = new Set();
  /** @type {Set<string>} */
  const omitted = new Set();
  /** @type {Set<string>} */
  const degraded = new Set();
  let elements = 0;

  /** @param {Node} n @returns {boolean} */
  const hasAstryx = n =>
    isEl(n) && (Boolean(astryxClass(n)) || n.children.some(hasAstryx));

  /**
   * An element's content as plain text elements, components left out.
   * @param {Node} n
   * @param {string} indent
   * @returns {string[]}
   */
  const plain = (n, indent) => {
    if (!isEl(n)) {
      const t = n.text.replace(/\s+/g, ' ').trim();
      return t ? [`${indent}<span>${jsxText(t)}</span>`] : [];
    }
    if (n.tag === 'script' || n.tag === 'style' || n.tag === 'template') return [];
    const block = n.children.some(c => isEl(c) && !/^(span|strong|em|code|a|small|b|i)$/.test(c.tag));
    if (!block) {
      const t = textOf(n).replace(/\s+/g, ' ').trim();
      return t ? [`${indent}<span>${jsxText(t)}</span>`] : [];
    }
    return n.children.flatMap(c => plain(c, indent));
  };

  /**
   * @param {Node} n
   * @param {string} indent
   * @returns {string[]}
   */
  const emit = (n, indent) => {
    if (!isEl(n)) {
      const t = n.text.replace(/\s+/g, ' ').trim();
      return t ? [`${indent}${jsxText(t)}`] : [];
    }
    if (n.tag === 'script' || n.tag === 'style' || n.tag === 'template') return [];
    const target = astryxClass(n);
    if (target && OMIT.has(target)) {
      omitted.add(target);
      return [];
    }
    const list = target ? lookup(target) : undefined;
    if (target && !list) unknown.add(target);
    if (!list || !target) {
      if (n.children.some(hasAstryx)) return n.children.flatMap(c => emit(c, indent));
      const t = textOf(n).replace(/\s+/g, ' ').trim();
      if (!t) {
        if (n.tag === 'img' && n.attrs.src) {
          return [`${indent}<img src=${jsxAttr(n.attrs.src)} alt=${jsxAttr(n.attrs.alt ?? '')} />`];
        }
        return [];
      }
      const tag = /^(h[1-6]|p|span|strong|em|code|pre|li|a|label|small)$/.test(n.tag) ? n.tag : 'span';
      const href = tag === 'a' && n.attrs.href ? ` href=${jsxAttr(n.attrs.href)}` : '';
      return [`${indent}<${tag}${href}>${jsxText(t)}</${tag}>`];
    }
    const entry = pick(list, target, n);
    // The props the markup records, as JSX.
    /** @type {Map<string, string>} */
    const given = new Map();
    for (const [k, v] of Object.entries(n.attrs)) {
      if (!k.startsWith('data-')) continue;
      const prop = camel(k.slice(5));
      if (NOT_PROPS.has(k.slice(5)) || !entry.props.has(prop)) continue;
      if (v === '' || v === 'true') given.set(prop, prop);
      else if (v === 'false') given.set(prop, `${prop}={false}`);
      else if (/^-?\d+(\.\d+)?$/.test(v)) given.set(prop, `${prop}={${v}}`);
      else given.set(prop, `${prop}=${jsxAttr(v)}`);
    }
    for (const a of ['href', 'role']) {
      if (n.attrs[a] && entry.props.has(a)) given.set(a, `${a}=${jsxAttr(n.attrs[a])}`);
    }
    const t = textOf(n).replace(/\s+/g, ' ').trim();
    // A component that draws a form control takes its text as a label, never
    // as children (they would land on the control itself).
    const formControl = hasTag(n, FORM_TAGS);
    // Astryx parts inside a form control are its own drawing, not content:
    // it is rebuilt as a leaf.
    const nested = n.children.some(hasAstryx) && !formControl;
    const textProp =
      !nested && t && entry.label && (formControl || !entry.props.has('children')) ? 'label' : null;
    // Required props the markup does not record get a stand-in when their
    // type allows one; a component needing data it cannot hold (items,
    // options) is not rebuilt, and its content is kept as plain text.
    let lacking = false;
    for (const [r, type] of entry.required) {
      if (r === 'children' || r === textProp || given.has(r)) continue;
      const fill = standIn(r, type, n, t);
      if (fill == null) {
        lacking = true;
        break;
      }
      given.set(r, fill);
    }
    if (lacking) {
      degraded.add(entry.name);
      return plain(n, indent);
    }
    elements++;
    const mod = imports.get(entry.module) ?? new Set();
    mod.add(entry.name);
    imports.set(entry.module, mod);
    const props = [...given.values()];
    const open = `${indent}<${entry.name}${props.length ? ` ${props.join(' ')}` : ''}`;
    if (nested) {
      const inner = n.children.flatMap(c => emit(c, `${indent}  `));
      return inner.length ? [`${open}>`, ...inner, `${indent}</${entry.name}>`] : [`${open} />`];
    }
    if (!t || VOID.has(n.tag) || (formControl && !textProp)) return [`${open} />`];
    if (textProp) {
      return [`${open.replace(`<${entry.name}`, `<${entry.name} label=${jsxAttr(t)}`)} />`];
    }
    return [`${open}>${jsxText(t)}</${entry.name}>`];
  };

  const lines = body.children.flatMap(c => emit(c, '    '));
  const importLines = [...imports.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mod, names]) => `import {${[...names].sort().join(', ')}} from '${mod}';`);
  const title = decode(textOf(find(doc, 'title') ?? {text: ''})).trim();
  const source = [
    `// Rebuilt by astryx experimental render --reverse from rendered markup${title ? `: ${title.replace(/\n/g, ' ')}` : ''}.`,
    '// Text and layout come from the markup; styling, state and behavior do not,',
    '// so review it before use.',
    '',
    ...importLines,
    '',
    'export default function Page() {',
    '  return (',
    '    <>',
    ...lines.map(l => `  ${l}`),
    '    </>',
    '  );',
    '}',
    '',
  ].join('\n');
  return {
    source,
    components: [...imports.values()].flatMap(s => [...s]).sort(),
    elements,
    unknown: [...unknown].sort(),
    omitted: [...omitted, ...degraded].sort(),
  };
}
