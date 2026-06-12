// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XLE expander — bound AST → TSX.
 *
 * Expansion is codegen, not templating: required value/onChange pairs
 * become typed useState scaffolds, Layout children auto-route into its
 * slot props, Table rows partition into header/body, `fill`-flagged
 * stack children wrap in StackItem, and {hint} blocks become structured
 * TODO(xle) markers pointing at the real block template.
 *
 * Output is deterministic: same bound AST → byte-identical TSX.
 *
 * @input  validated doc (nodes carry .bound) + registry
 * @output expand() → {code, componentsUsed, states, todos}
 * @position lib/xle — last stage; api/layout.mjs orchestrates
 */

import {PAYLOAD_PROPS} from './validate.mjs';

const INDENT = '  ';

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function camelCase(text) {
  const parts = slugify(text).split('-').filter(Boolean);
  if (parts.length === 0) return 'item';
  return parts[0] + parts.slice(1).map(p => p[0].toUpperCase() + p.slice(1)).join('');
}

function escapeAttr(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function cloneItem(item) {
  // .bound holds a registry reference (Map props) — rebuild it after the
  // JSON round-trip of the plain AST fields.
  const {bound, ...rest} = item;
  const copy = JSON.parse(JSON.stringify(rest, (key, value) => {
    if (key === 'bound') return undefined;
    return value;
  }));
  if (item.kind === 'node') {
    copy.bound = bound
      ? {component: bound.component, props: new Map(bound.props), slots: bound.slots, stray: []}
      : null;
    copy.children = item.children.map(cloneItem);
    copy.slots = item.slots; // slot subexprs are emitted from the original binding
  } else {
    copy.children = item.children.map(cloneItem);
  }
  return copy;
}

/**
 * Substitute Emmet-style `$` counters in payloads and string props.
 * `\$` escapes a literal dollar sign (prices etc.).
 */
function subCounterText(text, index) {
  return text.replace(/\\\$|\$/g, m => (m === '\\$' ? '$' : String(index)));
}

/** Strip `\$` escapes when a node is NOT repeated (single emission). */
function unescapeCounterText(text) {
  return text.replace(/\\\$/g, '$');
}

function substituteCounter(node, index) {
  if (node.kind === 'group') {
    for (const child of node.children) substituteCounter(child, index);
    return;
  }
  if (node.payload) node.payload = subCounterText(node.payload, index);
  if (node.payload2) node.payload2 = subCounterText(node.payload2, index);
  if (node.bound) {
    for (const [key, value] of node.bound.props) {
      if (typeof value === 'string' && value.includes('$')) {
        node.bound.props.set(key, subCounterText(value, index));
      }
    }
  }
  for (const child of node.children) substituteCounter(child, index);
}

class Emitter {
  constructor(registry, options = {}) {
    this.registry = registry;
    this.imports = new Map(); // importPath → Set<exportName>
    this.states = [];
    this.usedStateNames = new Set();
    this.todos = [];
    this.componentsUsed = new Set();
    this.componentName = options.componentName || 'GeneratedLayout';
  }

  addImport(component) {
    if (!this.imports.has(component.importPath)) this.imports.set(component.importPath, new Set());
    this.imports.get(component.importPath).add(component.exportName);
    this.componentsUsed.add(component.name);
  }

  requireComponent(name) {
    const component = this.registry.components.get(name);
    if (component) this.addImport(component);
    return component;
  }

  stateName(base) {
    let name = camelCase(base);
    if (!/^[a-z]/.test(name)) name = 'v' + name;
    let candidate = name;
    let n = 2;
    while (this.usedStateNames.has(candidate)) candidate = name + n++;
    this.usedStateNames.add(candidate);
    return candidate;
  }

  addState(base, initial) {
    const name = this.stateName(base);
    const setter = 'set' + name[0].toUpperCase() + name.slice(1);
    this.states.push({name, setter, initial});
    return {name, setter};
  }

  // ── value → JSX prop text ────────────────────────────────────────────

  jsxValue(value) {
    if (value === true) return null; // bare flag
    if (value === false) return '{false}';
    if (typeof value === 'number') return `{${value}}`;
    if (typeof value === 'string') return `"${escapeAttr(value)}"`;
    if (value && value.__expr) return `{${value.__expr}}`;
    if (Array.isArray(value)) {
      return `{[${value.map(v => (typeof v === 'string' ? `'${v}'` : String(v))).join(', ')}]}`;
    }
    if (typeof value === 'object' && value !== null) {
      const inner = Object.entries(value)
        .map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v}'` : String(v)}`)
        .join(', ');
      return `{{${inner}}}`;
    }
    return `{${String(value)}}`;
  }

  propText(key, value) {
    const v = this.jsxValue(value);
    return v === null ? key : `${key}=${v}`;
  }

  // ── scaffolding ──────────────────────────────────────────────────────

  initialFor(prop, node) {
    const type = (prop.type || '').trim();
    if (node.bound.component.name === 'TabList') {
      const tabs = node.children.filter(c => c.kind === 'node');
      const chosen = tabs.find(t => t.selected) || tabs[0];
      return chosen ? `'${slugify(chosen.payload || chosen.name)}'` : `''`;
    }
    if (type === 'string') return `''`;
    if (type.startsWith('boolean')) return 'false';
    if (type === 'number') return '1';
    if (prop.enumValues && prop.enumValues.length > 0) {
      const first = prop.enumValues[0];
      return typeof first === 'string' ? `'${first}'` : String(first);
    }
    return 'undefined';
  }

  scaffoldState(node, component, props) {
    for (const valueKey of ['value', 'page']) {
      const valueProp = component.props.get(valueKey);
      const onChange = component.props.get('onChange');
      if (!valueProp || !valueProp.required || !onChange) continue;
      if (props.has(valueKey)) continue;
      const base = node.payload || node.id || component.name;
      const {name, setter} = this.addState(base, this.initialFor(valueProp, node));
      props.set(valueKey, {__expr: name});
      if (!props.has('onChange')) props.set('onChange', {__expr: setter});
      return;
    }
  }

  fillRequired(node, component, props, slotKeys) {
    for (const prop of component.props.values()) {
      if (!prop.required || props.has(prop.name) || slotKeys.has(prop.name)) continue;
      if (prop.name === 'children') continue; // handled by child emission
      if (prop.name === 'value' || prop.name === 'onChange' || prop.name === 'page') continue;
      if (prop.isFunction) { props.set(prop.name, {__expr: '() => {}'}); continue; }
      if (prop.enumValues && prop.enumValues.length > 0) {
        props.set(prop.name, prop.enumValues[0]);
        continue;
      }
      if (prop.type === 'string') {
        props.set(prop.name, node.payload || component.name);
        continue;
      }
      // Unfillable required prop (data arrays etc.) — structured TODO.
      this.todos.push(`${component.name}.${prop.name} (required ${prop.type}) needs real data`);
      props.set(prop.name, {__expr: `undefined /* TODO(xle): required ${prop.type} */`});
    }
  }

  // ── node emission ────────────────────────────────────────────────────

  emitItems(items, depth, context = {}) {
    const lines = [];
    for (const item of items) {
      if (item.kind === 'group') {
        const count = item.repeat || 1;
        for (let i = 1; i <= count; i++) {
          for (const child of item.children) {
            const clone = count > 1 ? cloneItem(child) : child;
            if (count > 1) substituteCounter(clone, i);
            lines.push(...this.emitItems([clone], depth, context));
          }
        }
        continue;
      }
      const count = item.repeat || 1;
      for (let i = 1; i <= count; i++) {
        const clone = count > 1 ? cloneItem(item) : item;
        if (count > 1) {
          clone.repeat = null;
          substituteCounter(clone, i);
        }
        lines.push(...this.emitNode(clone, depth, context));
      }
    }
    return lines;
  }

  emitNode(node, depth, context = {}) {
    if (!node.bound) {
      return [`${INDENT.repeat(depth)}{/* unresolved: ${node.name} */}`];
    }
    const component = node.bound.component;
    this.addImport(component);
    const pad = INDENT.repeat(depth);

    const props = new Map(node.bound.props);
    let textChild = null;

    // Payload → primary text prop, else text child. Required props win
    // (Button.label) over optional ones; a required children slot wins
    // over an optional label (Link).
    if (node.payload != null) {
      node.payload = unescapeCounterText(node.payload);
      const required = PAYLOAD_PROPS.find(p => component.props.get(p)?.required);
      const childrenRequired = component.props.get('children')?.required;
      const target = required
        || (childrenRequired ? null : PAYLOAD_PROPS.find(p => component.props.has(p)));
      if (target && !props.has(target)) props.set(target, node.payload);
      else textChild = node.payload;
    }
    if (node.payload2 != null && component.props.has('value') && !component.props.get('value').required) {
      props.set('value', node.payload2);
    }

    // `fill` in a stack context → wrap in StackItem.
    const needsFillWrap = context.inStack && props.get('__fill') === true;

    // Tab value synthesis inside TabList.
    if (component.name === 'Tab' && !props.has('value')) {
      props.set('value', slugify(node.payload || node.name));
    }

    this.scaffoldState(node, component, props);

    // Trigger binding: opens=#id → onClick TODO.
    const opens = props.get('__opens');
    props.delete('__opens');
    props.delete('__fill');
    if (opens) {
      const target = opens.idref || opens;
      const handler = component.props.has('onClick') ? 'onClick' : 'clickAction';
      props.set(handler, {__expr: `() => {/* TODO(xle): open #${target.idref ?? target} */}`});
    }

    // Slots → element-valued props (keys collected first so required-prop
    // fill knows they're already satisfied).
    const slotKeys = new Set(node.bound.slots.map(s => s.key));
    this.fillRequired(node, component, props, slotKeys);

    const slotEntries = [];
    for (const slot of node.bound.slots) {
      slotEntries.push([slot.key, this.emitSlotValue(slot, depth + 1)]);
    }

    // Structural routing.
    let children = node.children;
    if (component.name === 'Layout') {
      const routed = this.routeLayoutChildren(node, props, slotEntries, depth);
      children = routed;
    } else if (component.name === 'Table') {
      children = this.partitionTableChildren(node);
    }

    const childContext = {
      inStack: component.name === 'VStack' || component.name === 'HStack',
    };

    // Mark fill-flagged children before emitting them.
    for (const child of children) {
      if (child.kind === 'node' && child.bound) {
        const fillIdx = child.attrs.findIndex(a => a.kind === 'flag' && a.key === 'fill');
        if (fillIdx !== -1 && childContext.inStack) {
          child.bound.props.set('__fill', true);
          child.bound.props.delete('fill');
        }
      }
    }

    const bodyLines = [];
    if (node.hint) bodyLines.push(...this.emitHint(node.hint, depth + 1));
    if (textChild != null) bodyLines.push(`${INDENT.repeat(depth + 1)}${textChild}`);
    bodyLines.push(...this.emitItems(children, depth + 1, childContext));

    // Required children with nothing to render → placeholder text.
    const childrenProp = component.props.get('children');
    if (bodyLines.length === 0 && childrenProp?.required) {
      bodyLines.push(`${INDENT.repeat(depth + 1)}${node.payload || component.name}`);
    }

    const lines = this.renderTag(component, props, slotEntries, bodyLines, depth);
    if (needsFillWrap) {
      const stackItem = this.requireComponent('StackItem');
      if (stackItem) {
        return [
          `${pad}<${stackItem.exportName} size="fill">`,
          ...lines.map(l => INDENT + l),
          `${pad}</${stackItem.exportName}>`,
        ];
      }
    }
    return lines;
  }

  renderTag(component, props, slotEntries, bodyLines, depth) {
    const pad = INDENT.repeat(depth);
    const propTexts = [...props.entries()].map(([k, v]) => this.propText(k, v));
    const slotTexts = slotEntries.map(([key, valueLines]) => ({key, valueLines}));
    const tag = component.exportName;

    const open = [];
    const simple = slotTexts.length === 0 && propTexts.join(' ').length <= 60;
    if (simple) {
      const attrs = propTexts.length > 0 ? ' ' + propTexts.join(' ') : '';
      if (bodyLines.length === 0) return [`${pad}<${tag}${attrs} />`];
      open.push(`${pad}<${tag}${attrs}>`);
    } else {
      open.push(`${pad}<${tag}`);
      for (const text of propTexts) open.push(`${pad}${INDENT}${text}`);
      for (const {key, valueLines} of slotTexts) {
        open.push(`${pad}${INDENT}${key}={`);
        open.push(...valueLines.map(l => `${pad}${INDENT}${INDENT}${l.trimStart() === l ? l : l}`));
        open.push(`${pad}${INDENT}}`);
      }
      if (bodyLines.length === 0) {
        open.push(`${pad}/>`);
        return open;
      }
      open.push(`${pad}>`);
    }
    return [...open, ...bodyLines, `${pad}</${tag}>`];
  }

  emitSlotValue(slot, depth) {
    const value = slot.value;
    if (value == null) {
      return [`${INDENT.repeat(0)}null /* TODO(xle): @${slot.key} */`];
    }
    if (typeof value === 'string') {
      const text = this.requireComponent('Text');
      return [text ? `<${text.exportName}>${value}</${text.exportName}>` : `<>${value}</>`];
    }
    if (value.hint) {
      return [
        '<>',
        ...this.emitHint(value.hint, 1).map(l => l.trimStart()).map(l => INDENT + l),
        '</>',
      ];
    }
    if (value.idref) {
      return [`null /* TODO(xle): reference #${value.idref} */`];
    }
    if (value.subexpr) {
      const lines = this.emitItems(value.subexpr, 0, {});
      if (value.subexpr.length > 1) return ['<>', ...lines.map(l => INDENT + l), '</>'];
      return lines;
    }
    return ['null'];
  }

  emitHint(hint, depth) {
    const pad = INDENT.repeat(depth);
    if (hint.block) {
      this.todos.push(`splice block ${hint.block.name}`);
      const flags = hint.flags.length > 0 ? ` (+${hint.flags.join(' +')})` : '';
      const arg = hint.arg ? `:${hint.arg}` : '';
      return [
        `${pad}{/* TODO(xle): content block '${hint.block.name}'${flags}${arg} — scaffold it with: xds template ${hint.block.name} */}`,
      ];
    }
    this.todos.push(`unresolved hint {${hint.name}}`);
    return [`${pad}{/* TODO(xle): content '{${hint.name}}' (no matching block) */}`];
  }

  routeLayoutChildren(node, props, slotEntries, depth) {
    const family = {
      LayoutHeader: 'header',
      LayoutContent: 'content',
      LayoutFooter: 'footer',
    };
    const assigned = new Set(slotEntries.map(([k]) => k));
    const loose = [];
    let panelCount = 0;
    for (const child of node.children) {
      const childName = child.bound?.component?.name;
      let slotName = family[childName];
      if (childName === 'LayoutPanel') {
        slotName = panelCount === 0 ? 'start' : 'end';
        panelCount++;
      }
      if (slotName && !assigned.has(slotName)) {
        assigned.add(slotName);
        slotEntries.push([slotName, this.emitItems([child], 0, {})]);
      } else {
        loose.push(child);
      }
    }
    // Loose children auto-wrap into an implicit LayoutContent slot.
    if (loose.length > 0 && !assigned.has('content')) {
      const lc = this.requireComponent('LayoutContent');
      const inner = this.emitItems(loose, 1, {});
      slotEntries.push(['content', [`<${lc.exportName}>`, ...inner, `</${lc.exportName}>`]]);
    } else if (loose.length > 0) {
      this.todos.push('Layout had extra children but content was already assigned');
    }
    void props; void depth;
    return [];
  }

  /** Expand groups/repeats into a flat node list (clones carry repeat=null). */
  flattenItems(items) {
    const out = [];
    for (const item of items) {
      const count = item.repeat || 1;
      for (let i = 1; i <= count; i++) {
        const clone = count > 1 ? cloneItem(item) : item;
        if (count > 1) {
          clone.repeat = null;
          substituteCounter(clone, i);
        }
        if (clone.kind === 'group') out.push(...this.flattenItems(clone.children));
        else out.push(clone);
      }
    }
    return out;
  }

  partitionTableChildren(node) {
    const flat = this.flattenItems(node.children);
    const rows = flat.filter(c => c.kind === 'node' && c.bound?.component?.name === 'TableRow');
    if (rows.length === 0 || rows.length !== flat.length) return node.children;
    const isHeaderRow = (row) => {
      const cells = this.flattenItems(row.children);
      return cells.length > 0 && cells.every(c => c.bound?.component?.name === 'TableHeaderCell');
    };
    const headerRows = rows.filter(isHeaderRow);
    const bodyRows = rows.filter(r => !isHeaderRow(r));
    const wrap = (name, rowNodes) => {
      const comp = this.requireComponent(name);
      const wrapper = {
        kind: 'node', name, id: null, enumMods: [], payload: null, payload2: null,
        attrs: [], slots: [], hint: null, repeat: null, selected: false,
        children: rowNodes, line: node.line, col: node.col,
        bound: {component: comp, props: new Map(), slots: [], stray: []},
      };
      return wrapper;
    };
    const out = [];
    if (headerRows.length > 0) out.push(wrap('TableHeader', headerRows));
    if (bodyRows.length > 0) out.push(wrap('TableBody', bodyRows));
    return out;
  }
}

/**
 * Expand a validated document into a complete TSX module.
 *
 * @param {{roots: any[], overlays: any[]}} doc
 * @param {object} registry
 * @param {{componentName?: string}} [options]
 * @returns {{code: string, componentsUsed: string[], states: number, todos: string[]}}
 */
export function expand(doc, registry, options = {}) {
  const emitter = new Emitter(registry, options);

  const rootLines = emitter.emitItems(doc.roots, 2, {});
  const overlayLines = doc.overlays.length > 0
    ? [
        `${INDENT.repeat(2)}{/* overlays — wire open state to the matching opens=#id trigger */}`,
        ...emitter.emitItems(doc.overlays, 2, {}),
      ]
    : [];

  const needsFragment = doc.roots.length + (doc.overlays.length > 0 ? 1 : 0) > 1
    || doc.roots.length > 1
    || (doc.overlays.length > 0);

  const body = [];
  if (needsFragment) {
    body.push(`${INDENT.repeat(1)}return (`, `${INDENT.repeat(2)}<>`);
    body.push(...[...rootLines, ...overlayLines].map(l => INDENT + l));
    body.push(`${INDENT.repeat(2)}</>`, `${INDENT.repeat(1)});`);
  } else {
    body.push(`${INDENT.repeat(1)}return (`);
    body.push(...rootLines);
    body.push(`${INDENT.repeat(1)});`);
  }

  const importLines = [];
  if (emitter.states.length > 0) importLines.push(`import {useState} from 'react';`);
  const sortedImports = [...emitter.imports.entries()].sort(([a], [b]) => a.localeCompare(b));
  for (const [importPath, names] of sortedImports) {
    importLines.push(`import {${[...names].sort().join(', ')}} from '${importPath}';`);
  }

  const stateLines = emitter.states.map(
    s => `${INDENT}const [${s.name}, ${s.setter}] = useState(${s.initial});`,
  );

  const code = [
    `// Generated by \`xds layout expand\` — this file is the artifact; edit freely.`,
    ...importLines,
    '',
    `export default function ${emitter.componentName}() {`,
    ...stateLines,
    ...body,
    '}',
    '',
  ].join('\n');

  return {
    code,
    componentsUsed: [...emitter.componentsUsed].sort(),
    states: emitter.states.length,
    todos: emitter.todos,
  };
}
