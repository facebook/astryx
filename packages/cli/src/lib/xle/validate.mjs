// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XLE binder/validator — resolves the parsed AST against the
 * component registry and annotates every node with its bound component
 * and prop assignments.
 *
 * Philosophy (from the XLE research): lenient lexer, strict validator.
 * Spelling variants normalize silently (p6 ≡ pad=6 ≡ padding=6), but
 * semantic problems — unknown components, props, enum values, blocks —
 * are hard errors carrying ranked suggestions, never guesses.
 *
 * @input  parse() AST + registry (+ block list for {hint} resolution)
 * @output validate() → {errors, warnings}; nodes gain .bound
 * @position lib/xle — between parse.mjs and expand.mjs
 */

import {levenshteinDistance} from '../levenshtein.mjs';
import {KEY_ALIASES} from './parse.mjs';
import {resolveComponent} from './registry-core.mjs';

/** Boolean flag synonyms — agent-frequency spellings of isX/hasX props. */
const FLAG_SYNONYMS = {
  req: 'isRequired', opt: 'isOptional', dis: 'isDisabled',
  scroll: 'isScrollable', divider: 'hasDivider', dividers: 'hasDivider',
  striped: 'isStriped', hover: 'hasHover', clear: 'hasClear',
  compact: 'isCompact', external: 'isExternalLink', loading: 'isLoading',
};

/** Props the expander treats as the node's primary text payload, in order. */
export const PAYLOAD_PROPS = ['label', 'title', 'heading'];

function suggest(input, candidates, max = 4) {
  const lower = input.toLowerCase();
  return candidates
    .map(name => {
      const candidate = name.toLowerCase();
      const contains = candidate.includes(lower) || lower.includes(candidate);
      const distance = levenshteinDistance(lower, candidate);
      return {name, distance: contains ? Math.min(distance, 1) : distance};
    })
    .filter(s => s.distance <= Math.max(2, Math.floor(input.length / 2)))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, max)
    .map(s => s.name);
}

function normalizeBlockKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Resolve a word to a prop assignment via, in order: synonym table,
 * exact boolean prop, is/has-prefixed boolean prop, unique enum value.
 * Returns {prop, value} or null.
 */
function resolveWord(component, word) {
  const synonym = FLAG_SYNONYMS[word];
  if (synonym && component.props.has(synonym)) {
    return {prop: synonym, value: true};
  }
  const exact = component.props.get(word);
  if (exact && exact.isBoolean) return {prop: word, value: true};
  const cap = word[0].toUpperCase() + word.slice(1);
  for (const prefix of ['is', 'has']) {
    const pref = component.props.get(prefix + cap);
    if (pref && pref.isBoolean) return {prop: prefix + cap, value: true};
  }
  // Unique enum membership across all enum-typed props.
  const hits = [];
  for (const prop of component.props.values()) {
    if (prop.enumValues && prop.enumValues.includes(word)) hits.push(prop.name);
  }
  if (hits.length === 1) return {prop: hits[0], value: word};
  if (hits.length > 1) return {ambiguous: hits};
  return null;
}

/** Map axis-neutral j=/a= keys onto the component's real alignment props. */
function resolveAxisKey(component, key) {
  const main = key === '__mainAxis';
  if (component.name === 'VStack') return main ? 'vAlign' : 'hAlign';
  if (component.name === 'HStack') return main ? 'hAlign' : 'vAlign';
  const generic = main ? 'justify' : 'align';
  if (component.props.has(generic)) return generic;
  if (component.props.has(main ? 'hAlign' : 'vAlign')) return main ? 'hAlign' : 'vAlign';
  return generic;
}

/** Grid's `columns` object shorthand: {min,max,fit|fill} → real keys. */
function normalizeColumnsObject(value) {
  if (typeof value !== 'object' || value == null || Array.isArray(value)) return value;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === 'min') out.minWidth = v;
    else if (k === 'fit' || k === 'fill') out.repeat = k;
    else out[k] = v;
  }
  return out;
}

export class Validation {
  constructor(registry, blocks, {loose = false} = {}) {
    this.registry = registry;
    this.blocks = blocks || [];
    this.blockIndex = new Map(this.blocks.map(b => [normalizeBlockKey(b.dirName), b]));
    this.loose = loose;
    this.errors = [];
    this.warnings = [];
  }

  error(node, message, suggestions = []) {
    this.errors.push({message, line: node.line, col: node.col, suggestions});
  }

  warn(node, message) {
    this.warnings.push({message, line: node.line, col: node.col});
  }

  nameCandidates() {
    return [...this.registry.aliases.keys(), ...this.registry.componentNames];
  }

  bindNode(node, parent) {
    // Anonymous block reference ({block} with no host element).
    if (!node.name && node.hint) {
      node.bound = null;
      this.bindHint(node);
      for (const child of node.children) this.bindAny(child, node);
      return;
    }
    const component = resolveComponent(this.registry, node.name);
    if (!component) {
      this.error(
        node,
        `Unknown component or alias '${node.name}'`,
        suggest(node.name, this.nameCandidates()),
      );
      node.bound = null;
    } else {
      node.bound = {component, props: new Map(), slots: [], stray: []};
      this.bindAttrs(node, component);
      this.bindMods(node, component);
      this.bindSlots(node, component);
      this.checkPairings(node, component, parent);
    }
    if (node.hint) this.bindHint(node);
    for (const child of node.children) this.bindAny(child, node);
  }

  bindAny(item, parent) {
    if (item.kind === 'group') {
      for (const child of item.children) this.bindAny(child, parent);
    } else {
      this.bindNode(item, parent);
    }
  }

  bindAttrs(node, component) {
    if (component.undocumented) {
      // No prop metadata for this export — bind raw and tell the author
      // nothing was checked, rather than rejecting valid props.
      for (const attr of node.attrs) {
        if (attr.kind === 'kv') {
          const key = KEY_ALIASES[attr.key.split('.')[0]] ?? attr.key;
          node.bound.props.set(key.startsWith('__') ? attr.key : key, attr.value);
        } else if (attr.kind === 'flag') {
          node.bound.props.set(attr.key, true);
        } else if (attr.kind === 'neg') {
          node.bound.props.set(attr.key, false);
        }
      }
      if (node.attrs.length > 0) {
        this.warn(node, `${component.name} has no documented props — attrs passed through unvalidated`);
      }
      return;
    }
    for (const attr of node.attrs) {
      if (attr.kind === 'kv') {
        this.bindKv(node, component, attr);
      } else if (attr.kind === 'flag') {
        const hit = resolveWord(component, attr.key);
        if (!hit) {
          this.error(
            node,
            `'${attr.key}' is not a prop, flag, or enum value of ${component.name}`,
            suggest(attr.key, [...component.props.keys()]),
          );
        } else if (hit.ambiguous) {
          this.error(
            node,
            `'${attr.key}' is ambiguous on ${component.name} — it is a value of ${hit.ambiguous.join(' and ')}; use key=value`,
          );
        } else {
          node.bound.props.set(hit.prop, hit.value);
        }
      } else if (attr.kind === 'neg') {
        const hit = resolveWord(component, attr.key);
        if (!hit || hit.ambiguous || typeof hit.value !== 'boolean') {
          this.error(
            node,
            `'!${attr.key}' does not match a boolean prop of ${component.name}`,
            suggest(attr.key, [...component.props.keys()].filter(p => component.props.get(p).isBoolean)),
          );
        } else {
          node.bound.props.set(hit.prop, false);
        }
      }
    }
  }

  bindKv(node, component, attr) {
    let key = attr.key.split('.')[0];
    key = KEY_ALIASES[key] ?? key;

    if (key === '__mainAxis' || key === '__crossAxis') {
      key = resolveAxisKey(component, key);
    }
    if (key === 'opens') {
      // Overlay trigger binding — expander turns this into an onClick TODO.
      node.bound.props.set('__opens', attr.value);
      if (!component.props.has('onClick') && !component.props.has('clickAction')) {
        this.warn(node, `'opens=' on ${component.name}, which has no onClick — emitting a comment only`);
      }
      return;
    }

    const prop = component.props.get(key);
    if (!prop) {
      const fallbacks = suggest(key, [...component.props.keys()]);
      this.error(
        node,
        `${component.name} has no prop '${key}'` +
          (attr.raw && attr.raw !== key ? ` (from '${attr.raw}')` : ''),
        fallbacks,
      );
      return;
    }

    let value = attr.value;
    if (key === 'columns') value = normalizeColumnsObject(value);

    if (prop.enumValues && (typeof value === 'string' || typeof value === 'number')) {
      if (!prop.enumValues.includes(value)) {
        this.error(
          node,
          `${component.name}.${key} must be one of ${prop.enumValues.join(' | ')} — got '${value}'`,
          typeof value === 'string' ? suggest(String(value), prop.enumValues.map(String)) : [],
        );
        return;
      }
    }
    node.bound.props.set(key, value);
  }

  bindMods(node, component) {
    for (const mod of node.enumMods) {
      const hit = resolveWord(component, mod);
      if (!hit || hit.ambiguous) {
        const enumPool = [...component.props.values()]
          .flatMap(p => p.enumValues || [])
          .map(String);
        this.error(
          node,
          hit?.ambiguous
            ? `'.${mod}' is ambiguous on ${component.name} (${hit.ambiguous.join(', ')}) — use key=value`
            : `'.${mod}' does not match an enum value of any ${component.name} prop`,
          suggest(mod, enumPool),
        );
      } else {
        node.bound.props.set(hit.prop, hit.value);
      }
    }
  }

  bindSlots(node, component) {
    for (const slot of node.slots) {
      const prop = component.props.get(slot.key);
      if (!prop) {
        this.error(
          node,
          `${component.name} has no slot prop '${slot.key}'`,
          suggest(slot.key, [...component.props.keys()].filter(k => component.props.get(k).isNode)),
        );
        continue;
      }
      if (!prop.isNode && !prop.isFunction) {
        this.warn(node, `${component.name}.${slot.key} is typed '${prop.type}' — slot value may not fit`);
      }
      if (slot.value && slot.value.subexpr) {
        for (const sub of slot.value.subexpr) this.bindAny(sub, node);
      }
      if (slot.value && slot.value.hint) this.bindHintRef(node, slot.value.hint);
      node.bound.slots.push(slot);
    }
  }

  bindHint(node) {
    this.bindHintRef(node, node.hint);
  }

  bindHintRef(node, hint) {
    const block = this.blockIndex.get(normalizeBlockKey(hint.name));
    if (block) {
      hint.block = {name: block.dirName, description: block.description, category: block.category};
      return;
    }
    const nearest = suggest(
      normalizeBlockKey(hint.name),
      [...this.blockIndex.keys()],
    ).map(k => this.blockIndex.get(k).dirName);
    if (this.loose) {
      this.warn(node, `Unknown block '{${hint.name}}' — emitting a TODO placeholder (running with --loose)`);
    } else {
      this.error(
        node,
        `Unknown block '{${hint.name}}' — block hints must name an existing template block`,
        nearest.length > 0 ? nearest : ['run: astryx template --list --type block'],
      );
    }
  }

  checkPairings(node, component, parent) {
    const parentName = parent?.bound?.component?.name ?? parent?.name;
    if (component.name === 'AppShell' && parent) {
      this.error(node, 'AppShell must be the outermost node');
    }
    if (component.name === 'GridSpan' && parentName !== 'Grid') {
      this.error(node, 'GridSpan is only valid directly under Grid');
    }
    if (component.name === 'StackItem' && parentName !== 'VStack' && parentName !== 'HStack') {
      this.error(node, 'StackItem is only valid directly under VStack/HStack');
    }
  }
}

/**
 * Validate (and bind) a parsed document in place.
 *
 * @param {{roots: any[], overlays: any[]}} doc
 * @param {object} registry - from buildRegistry()
 * @param {Array<object>} blocks - from template discovery (dirName et al)
 * @param {{loose?: boolean}} [options]
 * @returns {{errors: Array, warnings: Array}}
 */
export function validate(doc, registry, blocks, options = {}) {
  const v = new Validation(registry, blocks, options);
  for (const item of doc.roots) v.bindAny(item, null);
  for (const item of doc.overlays) {
    v.bindAny(item, null);
    if (item.kind === 'node' && !item.id) {
      v.warn(item, `Overlay ${item.name} has no #id — triggers cannot reference it`);
    }
  }
  return {errors: v.errors, warnings: v.warnings};
}
