// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XLE payload emitter — bound AST → native-shaped component payload.
 *
 * This emitter is intentionally not React/TSX. It preserves the component
 * vocabulary and semantic props chosen by the layout grammar, then delegates
 * per-component payload shaping to target component renderers when present
 * (for example @xds/glasses/src/Button/renderers/payload.mjs).
 *
 * @input  validated doc (nodes carry .bound) + registry
 * @output emitPayload() → {payload, componentsUsed, todos}
 * @position lib/xle — peer to the TSX expander for non-web targets
 */

import {PAYLOAD_PROPS} from './validate.mjs';

function subCounterText(text, index) {
  if (index == null) return String(text).replace(/\\\$/g, '$');
  return String(text).replace(/\\\$|\$/g, m => (m === '\\$' ? '$' : String(index)));
}

function mapProps(node, component, index) {
  const props = {};
  for (const [key, value] of node.bound.props) {
    if (key.startsWith('__')) continue;
    props[key] = typeof value === 'string' ? subCounterText(value, index) : value;
  }

  let textChild = null;
  if (node.payload != null) {
    const payload = subCounterText(node.payload, index);
    const required = PAYLOAD_PROPS.find(p => component.props.get(p)?.required);
    const childrenRequired = component.props.get('children')?.required;
    const target = required
      || (childrenRequired ? null : PAYLOAD_PROPS.find(p => component.props.has(p)));
    if (target && props[target] == null) props[target] = payload;
    else textChild = payload;
  }

  if (node.payload2 != null && component.props.has('value') && props.value == null) {
    props.value = subCounterText(node.payload2, index);
  }

  return {props, textChild};
}

class PayloadEmitter {
  constructor(registry) {
    this.registry = registry;
    this.componentsUsed = new Set();
    this.todos = [];
  }

  emitItems(items, index = null) {
    const out = [];
    for (const item of items) {
      if (item.kind === 'group') {
        const count = item.repeat || 1;
        for (let i = 1; i <= count; i++) {
          out.push(...this.emitItems(item.children, count > 1 ? i : index));
        }
        continue;
      }
      const count = item.repeat || 1;
      for (let i = 1; i <= count; i++) {
        const node = this.emitNode(item, count > 1 ? i : index);
        if (node) out.push(node);
      }
    }
    return out;
  }

  emitNode(node, index = null) {
    if (!node.bound) {
      if (node.hint) {
        this.todos.push(`payload hint {${node.hint.name}} needs renderer support`);
        return {type: 'Reference', props: {name: node.hint.name}, children: []};
      }
      return null;
    }

    const component = node.bound.component;
    this.componentsUsed.add(component.name);
    const {props, textChild} = mapProps(node, component, index);
    const children = [];
    if (textChild != null) children.push(textChild);
    children.push(...this.emitItems(node.children, index));

    const renderPayload = component.renderers?.payload;
    const rendered = renderPayload
      ? renderPayload({props, children, component, spec: component.spec})
      : {
          type: component.spec?.payloadType || component.name,
          role: component.spec?.nativeRole || 'component',
          renderer: component.spec?.renderer,
          theme: component.spec?.theme,
          props,
          children,
        };

    return {
      sourceComponent: component.name,
      ...rendered,
    };
  }
}

/**
 * Emit a native-shaped payload from a validated XLE document.
 * @param {{roots: any[], overlays: any[]}} doc
 * @param {object} registry
 * @returns {{payload: object, componentsUsed: string[], todos: string[]}}
 */
export function emitPayload(doc, registry) {
  const emitter = new PayloadEmitter(registry);
  const roots = emitter.emitItems(doc.roots);
  const overlays = emitter.emitItems(doc.overlays);
  return {
    payload: {
      schemaVersion: 1,
      target: registry.target || 'core',
      packageName: registry.packageName,
      roots,
      overlays,
    },
    componentsUsed: [...emitter.componentsUsed].sort(),
    todos: emitter.todos,
  };
}
