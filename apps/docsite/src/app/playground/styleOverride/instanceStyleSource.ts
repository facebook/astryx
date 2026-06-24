// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file instanceStyleSource.ts
 * @input Playground source code + a targeted instance (component + index) +
 *   one-off style props
 * @output Code edits that apply a one-off `xstyle` to that single element via a
 *   managed `const pgStyles = stylex.create({ ... })` block.
 * @position Playground — backs the "This one" scope of the unified targeting
 *   popover (the idiomatic XDS one-off: xstyle, not the theme).
 *
 * Convention: a single top-level `const pgStyles = stylex.create({ <key>: {...}
 * })` declaration holds every one-off style, keyed per instance (e.g.
 * `Button#0` -> `button_0`). The targeted element gets `xstyle={pgStyles.<key>}`.
 * The code stays the single source of truth: read parses the block, write
 * splices it (plus injects the stylex import + block on first use).
 *
 * The preview runtime resolves `@stylexjs/stylex` to a mock and merges `xstyle`
 * (see scripts/generate-scope.mjs), so the emitted code renders as-is.
 */

import {parse} from '@babel/parser';
import {
  analyzeCode,
  setAttribute,
  removeAttribute,
  type InstanceInfo,
} from '../propertyEditor/componentInstances';

type Node = Record<string, unknown>;

const PG_STYLES_VAR = 'pgStyles';

function tryParse(code: string): Node | null {
  try {
    return parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    }) as unknown as Node;
  } catch {
    return null;
  }
}

/** Stable, valid-identifier style key for an instance, e.g. `Button#0` -> `button_0`. */
export function instanceStyleKey(component: string, index: number): string {
  const safe = component.replace(/[^A-Za-z0-9_$]/g, '_');
  const head = safe.charAt(0).toLowerCase() + safe.slice(1);
  return `${head}_${index}`;
}

function findInstance(
  code: string,
  component: string,
  index: number,
): InstanceInfo | null {
  const instances = analyzeCode(code);
  if (!instances) {
    return null;
  }
  const ofType = instances.filter(i => i.component === component);
  return ofType[index] ?? null;
}

/** The `pgStyles.<key>` ref a managed xstyle points at, or null. */
function readXstyleRef(code: string, instance: InstanceInfo): string | null {
  const attr = instance.attrs.find(a => a.name === 'xstyle');
  if (!attr) {
    return null;
  }
  const text = code.slice(attr.start, attr.end);
  const m = text.match(
    new RegExp(`xstyle=\\{\\s*${PG_STYLES_VAR}\\.([A-Za-z0-9_$]+)\\s*\\}`),
  );
  return m ? m[1] : null;
}

/** Whether the element has an xstyle we did NOT author (so we won't clobber it). */
export function hasForeignXstyle(
  code: string,
  component: string,
  index: number,
): boolean {
  const instance = findInstance(code, component, index);
  if (!instance) {
    return false;
  }
  const attr = instance.attrs.find(a => a.name === 'xstyle');
  if (!attr) {
    return false;
  }
  return readXstyleRef(code, instance) == null;
}

// =============================================================================
// pgStyles block parsing
// =============================================================================

interface PgStylesInfo {
  /** Char range of the ObjectExpression passed to stylex.create(...). */
  objRange: [number, number];
  /** key -> (cssProperty -> value). */
  styles: Record<string, Record<string, string>>;
}

function propKey(keyNode: Node): string | null {
  if (keyNode.type === 'Identifier') {
    return keyNode.name as string;
  }
  if (keyNode.type === 'StringLiteral') {
    return keyNode.value as string;
  }
  return null;
}

function readStyleObject(objNode: Node): Record<string, string> {
  const out: Record<string, string> = {};
  for (const prop of (objNode.properties as Node[]) ?? []) {
    if (prop.type !== 'ObjectProperty') {
      continue;
    }
    const key = propKey(prop.key as Node);
    const value = prop.value as Node;
    if (key != null && value?.type === 'StringLiteral') {
      out[key] = value.value as string;
    }
  }
  return out;
}

function findPgStylesCreateObject(ast: Node): Node | null {
  const body = (ast.program as Node)?.body as Node[] | undefined;
  if (!body) {
    return null;
  }
  for (const stmt of body) {
    if (stmt.type !== 'VariableDeclaration') {
      continue;
    }
    for (const decl of (stmt.declarations as Node[]) ?? []) {
      const id = decl.id as Node;
      const init = decl.init as Node | null;
      if (
        id?.type === 'Identifier' &&
        id.name === PG_STYLES_VAR &&
        init?.type === 'CallExpression'
      ) {
        const callee = init.callee as Node;
        const isStylexCreate =
          callee?.type === 'MemberExpression' &&
          (callee.property as Node)?.type === 'Identifier' &&
          (callee.property as Node).name === 'create';
        const arg = ((init.arguments as Node[]) ?? [])[0];
        if (isStylexCreate && arg?.type === 'ObjectExpression') {
          return arg;
        }
      }
    }
  }
  return null;
}

function parsePgStyles(code: string): PgStylesInfo | null {
  const ast = tryParse(code);
  if (!ast) {
    return null;
  }
  const obj = findPgStylesCreateObject(ast);
  if (!obj) {
    return null;
  }
  const styles: Record<string, Record<string, string>> = {};
  for (const prop of (obj.properties as Node[]) ?? []) {
    if (prop.type !== 'ObjectProperty') {
      continue;
    }
    const key = propKey(prop.key as Node);
    const value = prop.value as Node;
    if (key != null && value?.type === 'ObjectExpression') {
      styles[key] = readStyleObject(value);
    }
  }
  return {objRange: [obj.start as number, obj.end as number], styles};
}

// =============================================================================
// Serialization
// =============================================================================

function isIdentifier(name: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** Serialize the styles map to the object literal passed to stylex.create(). */
function serializeStyles(
  styles: Record<string, Record<string, string>>,
): string {
  const keys = Object.keys(styles);
  if (keys.length === 0) {
    return '{}';
  }
  const lines: string[] = ['{'];
  for (const key of keys) {
    const k = isIdentifier(key) ? key : quote(key);
    lines.push(`  ${k}: {`);
    for (const [prop, value] of Object.entries(styles[key])) {
      const p = isIdentifier(prop) ? prop : quote(prop);
      lines.push(`    ${p}: ${quote(value)},`);
    }
    lines.push('  },');
  }
  lines.push('}');
  return lines.join('\n');
}

// =============================================================================
// Code transforms (each re-parses, so they compose safely)
// =============================================================================

function ensureStylexImport(code: string): string {
  if (/from\s+['"]@stylexjs\/stylex['"]/.test(code)) {
    return code;
  }
  const ast = tryParse(code);
  const body = (ast?.program as Node)?.body as Node[] | undefined;
  let insertAt = 0;
  if (body) {
    for (const stmt of body) {
      if (stmt.type === 'ImportDeclaration') {
        insertAt = stmt.end as number;
      }
    }
  }
  const stmt = "import * as stylex from '@stylexjs/stylex';";
  if (insertAt === 0) {
    return `${stmt}\n${code}`;
  }
  return `${code.slice(0, insertAt)}\n${stmt}${code.slice(insertAt)}`;
}

function ensurePgStylesBlock(code: string): string {
  if (parsePgStyles(code)) {
    return code;
  }
  const ast = tryParse(code);
  const body = (ast?.program as Node)?.body as Node[] | undefined;
  let insertAt = 0;
  if (body) {
    for (const stmt of body) {
      if (stmt.type === 'ImportDeclaration') {
        insertAt = stmt.end as number;
      }
    }
  }
  const block = `\n\n// One-off element styles (xstyle). Edited via the playground's "This one" scope.\nconst ${PG_STYLES_VAR} = stylex.create({});`;
  if (insertAt === 0) {
    return `${block.trimStart()}\n${code}`;
  }
  return `${code.slice(0, insertAt)}${block}${code.slice(insertAt)}`;
}

function writePgStylesKey(
  code: string,
  key: string,
  props: Record<string, string>,
): string {
  const info = parsePgStyles(code);
  if (!info) {
    return code;
  }
  const nextStyles = {...info.styles};
  if (Object.keys(props).length === 0) {
    delete nextStyles[key];
  } else {
    nextStyles[key] = props;
  }
  const [start, end] = info.objRange;
  return code.slice(0, start) + serializeStyles(nextStyles) + code.slice(end);
}

function setXstyleAttr(
  code: string,
  component: string,
  index: number,
  key: string | null,
): string {
  const instance = findInstance(code, component, index);
  if (!instance) {
    return code;
  }
  if (key) {
    return setAttribute(
      code,
      instance,
      'xstyle',
      `xstyle={${PG_STYLES_VAR}.${key}}`,
    );
  }
  // Only remove the attribute if it's our managed ref.
  if (readXstyleRef(code, instance) != null) {
    return removeAttribute(code, instance, 'xstyle');
  }
  return code;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * The one-off style props currently applied to an instance via our managed
 * xstyle, plus whether it's editable here (false if a foreign xstyle is set).
 */
export function readInstanceStyle(
  code: string,
  component: string,
  index: number,
): {editable: boolean; props: Record<string, string>} {
  const instance = findInstance(code, component, index);
  if (!instance) {
    return {editable: true, props: {}};
  }
  const ref = readXstyleRef(code, instance);
  if (ref == null) {
    // No xstyle at all -> editable empty; a foreign xstyle -> not editable.
    const hasAttr = instance.attrs.some(a => a.name === 'xstyle');
    return {editable: !hasAttr, props: {}};
  }
  const info = parsePgStyles(code);
  return {editable: true, props: info?.styles[ref] ?? {}};
}

/**
 * Apply the given one-off style props to an instance. Injects the stylex import
 * + pgStyles block on first use, upserts the per-instance key, and wires the
 * element's `xstyle`. Empty props clears the key and removes the managed xstyle.
 */
export function writeInstanceStyle(
  code: string,
  component: string,
  index: number,
  props: Record<string, string>,
): string {
  const key = instanceStyleKey(component, index);
  const hasProps = Object.keys(props).length > 0;

  let next = code;
  if (hasProps) {
    next = ensureStylexImport(next);
    next = ensurePgStylesBlock(next);
  }
  next = writePgStylesKey(next, key, props);
  next = setXstyleAttr(next, component, index, hasProps ? key : null);
  return next;
}
