// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file babelParser.ts
 * @input Playground source code (TSX string)
 * @output Detected XDS component instances + targeted source-range editors
 * @position Playground Property tab — binds interactive knobs to real code.
 *
 * Uses @babel/parser (bundled, browser-safe — NOT a CDN) to parse the code and
 * walk the AST for `<XDS*>` JSX opening elements. Each attribute's character
 * offsets are captured so a prop edit splices a single span of the original
 * source — preserving the rest of the file's formatting and comments.
 *
 * Note: we deliberately use the parser only (no transform) and avoid loading
 * anything from a CDN, since corpnet blocks external CDNs. Monaco's AMD loader
 * would also clobber a global `window.ts`, so the parser stays fully bundled.
 */

import {parse} from '@babel/parser';

/** Literal value kinds we can round-trip through a knob. */
export type AttrValueKind =
  | 'boolean' // boolean shorthand or {true}/{false}
  | 'string' // "..." or {'...'}
  | 'number' // {123}
  | 'expression' // {someExpr} — not a literal, render read-only
  | 'none'; // attribute present but no value we understand

export interface AttrInfo {
  name: string;
  /** Offset of the JSXAttribute node start in the source. */
  start: number;
  /** Offset of the JSXAttribute node end in the source. */
  end: number;
  valueKind: AttrValueKind;
  value?: string | number | boolean;
}

export interface InstanceInfo {
  /** Component module name as written, e.g. `XDSButton`. */
  component: string;
  /** Start offset of the opening element (`<`). */
  openingStart: number;
  /**
   * Offset of the safe insertion point for new attributes — immediately after
   * the element name, or after an explicit JSX type argument when present.
   *
   * For a generic call like `<XDSTable<Item> ...>` the name node ends right
   * after `XDSTable`, but inserting there would split the `<Item>` type
   * argument (`<XDSTable data-pg-id="…"<Item>`), producing invalid JSX. We
   * advance past the type argument so attributes land after `<Item>`.
   */
  nameEnd: number;
  attrs: AttrInfo[];
}

type Node = Record<string, unknown>;

function readAttrValue(attr: Node): {
  valueKind: AttrValueKind;
  value?: string | number | boolean;
} {
  const value = attr.value as Node | null | undefined;
  // Boolean shorthand: `<XDSButton isDisabled />`
  if (value == null) {
    return {valueKind: 'boolean', value: true};
  }
  if (value.type === 'StringLiteral') {
    return {valueKind: 'string', value: value.value as string};
  }
  if (value.type === 'JSXExpressionContainer') {
    const expr = value.expression as Node;
    if (!expr) {
      return {valueKind: 'expression'};
    }
    if (expr.type === 'BooleanLiteral') {
      return {valueKind: 'boolean', value: expr.value as boolean};
    }
    if (expr.type === 'NumericLiteral') {
      return {valueKind: 'number', value: expr.value as number};
    }
    if (expr.type === 'StringLiteral') {
      return {valueKind: 'string', value: expr.value as string};
    }
    if (
      expr.type === 'UnaryExpression' &&
      expr.operator === '-' &&
      (expr.argument as Node)?.type === 'NumericLiteral'
    ) {
      return {
        valueKind: 'number',
        value: -((expr.argument as Node).value as number),
      };
    }
    return {valueKind: 'expression'};
  }
  return {valueKind: 'none'};
}

/**
 * Find the offset just past the element name where new attributes can be
 * safely spliced in. Normally this is the end of the name node, but a generic
 * JSX call carries an explicit type argument (`<XDSTable<Item> ...>`) that sits
 * between the name and the attribute list. Babel attaches it as
 * `typeArguments` (older builds: `typeParameters`); we advance past it so an
 * inserted attribute does not bisect `<Item>` and corrupt the JSX.
 */
function instanceNameEnd(opening: Node, nameNode: Node): number {
  const typeArgs = (opening.typeArguments ?? opening.typeParameters) as
    | Node
    | undefined;
  if (typeArgs && typeof typeArgs.end === 'number') {
    return typeArgs.end;
  }
  return nameNode.end as number;
}

/**
 * Parse code and return every `<XDS*>` instance with attribute offsets.
 * Returns null on a syntax error so callers keep the previous good analysis
 * while the user is mid-edit.
 */
export function analyzeCode(code: string): InstanceInfo[] | null {
  let ast: Node;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    }) as unknown as Node;
  } catch {
    return null;
  }

  const instances: InstanceInfo[] = [];

  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') {
      return;
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        walk(child);
      }
      return;
    }
    const n = node as Node;
    if (n.type === 'JSXOpeningElement') {
      const nameNode = n.name as Node;
      if (nameNode?.type === 'JSXIdentifier') {
        const component = nameNode.name as string;
        if (component.startsWith('XDS')) {
          const attrs: AttrInfo[] = [];
          const rawAttrs = (n.attributes as Node[]) ?? [];
          for (const attr of rawAttrs) {
            if (attr.type !== 'JSXAttribute') {
              continue; // skip {...spread}
            }
            const nameField = attr.name as Node;
            const name = nameField?.name;
            if (typeof name !== 'string') {
              continue;
            }
            attrs.push({
              name,
              start: attr.start as number,
              end: attr.end as number,
              ...readAttrValue(attr),
            });
          }
          instances.push({
            component,
            openingStart: n.start as number,
            nameEnd: instanceNameEnd(n, nameNode),
            attrs,
          });
        }
      }
    }
    for (const key in n) {
      if (key === 'loc' || key === 'start' || key === 'end') {
        continue;
      }
      walk(n[key]);
    }
  };

  walk(ast);
  return instances;
}

function escapeStringAttr(value: string): string {
  // Plain double-quoted attribute when safe, else an expression container.
  if (/["\\\n]/.test(value)) {
    return JSON.stringify(value); // becomes {"..."} via caller
  }
  return value;
}

/**
 * Build the attribute snippet (no leading space), e.g. `label="Save"`,
 * `isDisabled`, `size="lg"`, or `count={3}`.
 */
export function formatAttr(
  name: string,
  kind: AttrValueKind,
  value: string | number | boolean,
): string {
  if (kind === 'boolean') {
    return value ? name : `${name}={false}`;
  }
  if (kind === 'number') {
    return `${name}={${value}}`;
  }
  // string / enum-as-string
  const str = String(value);
  const safe = escapeStringAttr(str);
  return safe.startsWith('"') ? `${name}={${safe}}` : `${name}="${safe}"`;
}

/** Replace an existing attribute or insert a new one after the element name. */
export function setAttribute(
  code: string,
  instance: InstanceInfo,
  name: string,
  attrText: string,
): string {
  const existing = instance.attrs.find(a => a.name === name);
  if (existing) {
    return code.slice(0, existing.start) + attrText + code.slice(existing.end);
  }
  const at = instance.nameEnd;
  return `${code.slice(0, at)} ${attrText}${code.slice(at)}`;
}

/**
 * Insert a `data-pg-id="Component#index"` marker on every `<XDS*>` element so
 * the preview can map a selected component/instance back to its DOM node. The
 * index is per-component-type in source order, matching the Property tab's
 * instance picker. Returns the original code unchanged on a parse error.
 *
 * Markers are only applied to the copy SENT to the preview — never to the code
 * the user sees, edits, or shares.
 */
export function annotateInstanceIds(code: string): string {
  const instances = analyzeCode(code);
  if (!instances || instances.length === 0) {
    return code;
  }
  const counts = new Map<string, number>();
  const inserts = instances.map(inst => {
    const index = counts.get(inst.component) ?? 0;
    counts.set(inst.component, index + 1);
    return {at: inst.nameEnd, text: ` data-pg-id="${inst.component}#${index}"`};
  });
  // Insert from the end so earlier offsets stay valid.
  inserts.sort((a, b) => b.at - a.at);
  let out = code;
  for (const ins of inserts) {
    out = out.slice(0, ins.at) + ins.text + out.slice(ins.at);
  }
  return out;
}

/** Remove an attribute (and one leading whitespace char, if present). */
export function removeAttribute(
  code: string,
  instance: InstanceInfo,
  name: string,
): string {
  const existing = instance.attrs.find(a => a.name === name);
  if (!existing) {
    return code;
  }
  let start = existing.start;
  if (start > 0 && /\s/.test(code[start - 1])) {
    start -= 1;
  }
  return code.slice(0, start) + code.slice(existing.end);
}
