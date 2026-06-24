// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeSource.ts
 * @input Playground source code (TSX string) + theme edits (tokens/components)
 * @output A parsed theme model, code splices that keep the in-code `defineTheme`
 *   literal authoritative, and a stripped copy for the preview runner.
 * @position Playground — makes the code the single source of truth for the theme.
 *
 * The playground convention is that the code declares its theme inline:
 *
 *   const appTheme = defineTheme({ name: 'custom', tokens: {...}, components: {...} });
 *   export default function App() {
 *     return <Theme theme={appTheme}>...</Theme>;
 *   }
 *
 * The Theme editor (Base Styles / Advanced) edits `appTheme.tokens`; the
 * targeting popover (Theme mode) edits `appTheme.components`. Both go through
 * readThemeModel/writeThemeModel so the code literal is always the truth.
 *
 * The preview runtime intentionally neutralizes user-authored <Theme> (see
 * generate-scope.mjs: ControlledTheme + no defineTheme in scope). So before the
 * code runs in the iframe we strip the in-code <Theme> wrapper (stripThemeWrapper)
 * and the parent applies the parsed theme through the existing preview-theme
 * channel. The wrapper the user sees/exports/shares stays real and copy-pastable.
 */

import {parse} from '@babel/parser';
import {
  colorDefaults,
  spacingDefaults,
  radiusDefaults,
  typographyDefaults,
  textSizeDefaults,
  fontWeightDefaults,
  typeScaleDefaults,
  sizeDefaults,
  shadowDefaults,
  durationDefaults,
  easeDefaults,
} from '@astryxdesign/core/theme';

type Node = Record<string, unknown>;

/** Every token's shipped default — used to serialize only real overrides. */
export const ALL_TOKEN_DEFAULTS: Record<string, string> = {
  ...colorDefaults,
  ...spacingDefaults,
  ...radiusDefaults,
  ...typographyDefaults,
  ...textSizeDefaults,
  ...fontWeightDefaults,
  ...typeScaleDefaults,
  ...sizeDefaults,
  ...shadowDefaults,
  ...durationDefaults,
  ...easeDefaults,
};

export interface ThemeModel {
  name: string;
  /** Token overrides only (diffed from defaults), keyed by CSS var name. */
  tokens: Record<string, string>;
  /** Component override tree, matching defineTheme's `components` field. */
  components: Record<string, unknown>;
}

export interface ParsedTheme {
  model: ThemeModel;
  /** Char range [start, end] of the object literal passed to defineTheme. */
  argRange: [number, number];
}

// =============================================================================
// Parsing
// =============================================================================

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

/** Evaluate a JSON-ish AST node (string/number/bool/array/object) to a value. */
function evalNode(node: Node | null | undefined): unknown {
  if (!node) {
    return undefined;
  }
  switch (node.type) {
    case 'StringLiteral':
      return node.value as string;
    case 'NumericLiteral':
      return node.value as number;
    case 'BooleanLiteral':
      return node.value as boolean;
    case 'NullLiteral':
      return null;
    case 'UnaryExpression':
      if (
        node.operator === '-' &&
        (node.argument as Node)?.type === 'NumericLiteral'
      ) {
        return -((node.argument as Node).value as number);
      }
      return undefined;
    case 'ArrayExpression':
      return ((node.elements as Node[]) ?? []).map(el => evalNode(el));
    case 'ObjectExpression': {
      const out: Record<string, unknown> = {};
      for (const prop of (node.properties as Node[]) ?? []) {
        if (prop.type !== 'ObjectProperty') {
          continue;
        }
        const key = propKey(prop.key as Node);
        if (key == null) {
          continue;
        }
        out[key] = evalNode(prop.value as Node);
      }
      return out;
    }
    default:
      return undefined;
  }
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

/**
 * Coerce a theme's token map (values may be strings or [light, dark] tuples,
 * e.g. from a built DefinedTheme) into the string-valued map the serializer and
 * editor use. Tuples become `light-dark(light, dark)`.
 */
export function coerceTokenMap(
  tokens: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    const norm = normalizeTokenValue(value);
    if (norm != null) {
      out[key] = norm;
    }
  }
  return out;
}

/** Normalize a token value: tuples become `light-dark(light, dark)` strings. */
function normalizeTokenValue(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length === 2) {
    const [light, dark] = value;
    if (typeof light === 'string' && typeof dark === 'string') {
      return `light-dark(${light}, ${dark})`;
    }
  }
  return null;
}

function findDefineThemeCall(ast: Node): Node | null {
  let found: Node | null = null;
  const walk = (node: unknown): void => {
    if (found || !node || typeof node !== 'object') {
      return;
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        walk(child);
      }
      return;
    }
    const n = node as Node;
    if (
      n.type === 'CallExpression' &&
      (n.callee as Node)?.type === 'Identifier' &&
      (n.callee as Node).name === 'defineTheme'
    ) {
      found = n;
      return;
    }
    for (const key in n) {
      if (key === 'loc' || key === 'start' || key === 'end') {
        continue;
      }
      walk(n[key]);
    }
  };
  walk(ast);
  return found;
}

/**
 * Parse the `defineTheme({...})` literal out of the code. Returns null if the
 * code has no parseable defineTheme call (the caller then runs in fallback mode
 * or injects a scaffold).
 */
export function readThemeModel(code: string): ParsedTheme | null {
  const ast = tryParse(code);
  if (!ast) {
    return null;
  }
  const call = findDefineThemeCall(ast);
  if (!call) {
    return null;
  }
  const arg = ((call.arguments as Node[]) ?? [])[0];
  if (!arg || arg.type !== 'ObjectExpression') {
    return null;
  }
  const raw = evalNode(arg) as Record<string, unknown>;
  const tokensRaw = (raw.tokens as Record<string, unknown>) ?? {};
  const tokens: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokensRaw)) {
    const norm = normalizeTokenValue(value);
    if (norm != null) {
      tokens[key] = norm;
    }
  }
  const components =
    raw.components && typeof raw.components === 'object'
      ? (raw.components as Record<string, unknown>)
      : {};
  return {
    model: {
      name: typeof raw.name === 'string' ? raw.name : 'custom',
      tokens,
      components,
    },
    argRange: [arg.start as number, arg.end as number],
  };
}

// =============================================================================
// Serialization
// =============================================================================

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function serializeObject(
  obj: Record<string, unknown>,
  indentLevel: number,
): string[] {
  const pad = '  '.repeat(indentLevel);
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      lines.push(`${pad}${quote(key)}: {`);
      lines.push(
        ...serializeObject(value as Record<string, unknown>, indentLevel + 1),
      );
      lines.push(`${pad}},`);
    } else {
      lines.push(`${pad}${quote(key)}: ${quote(String(value))},`);
    }
  }
  return lines;
}

/** Serialize a theme model to the `defineTheme(<arg>)` object-literal source. */
export function serializeThemeArg(model: ThemeModel, baseIndent = 0): string {
  const pad = '  '.repeat(baseIndent);
  const inner = '  '.repeat(baseIndent + 1);
  const lines: string[] = ['{', `${inner}name: ${quote(model.name)},`];

  const changedTokens: Record<string, string> = {};
  for (const [key, value] of Object.entries(model.tokens)) {
    if (ALL_TOKEN_DEFAULTS[key] !== value) {
      changedTokens[key] = value;
    }
  }
  if (Object.keys(changedTokens).length > 0) {
    lines.push(`${inner}tokens: {`);
    lines.push(...serializeObject(changedTokens, baseIndent + 2));
    lines.push(`${inner}},`);
  }

  if (Object.keys(model.components).length > 0) {
    lines.push(`${inner}components: {`);
    lines.push(
      ...serializeObject(
        model.components as Record<string, unknown>,
        baseIndent + 2,
      ),
    );
    lines.push(`${inner}},`);
  }

  lines.push(`${pad}}`);
  return lines.join('\n');
}

/** Determine the indentation (column) the defineTheme arg starts at. */
function columnOf(code: string, offset: number): number {
  const lineStart = code.lastIndexOf('\n', offset - 1) + 1;
  let col = 0;
  for (let i = lineStart; i < offset; i++) {
    if (code[i] === ' ') {
      col++;
    } else if (code[i] === '\t') {
      col += 2;
    } else {
      break;
    }
  }
  return Math.round(col / 2);
}

interface ComponentNode {
  base?: Record<string, string>;
  [selector: string]: unknown;
}

/** Read a component type's `base` style overrides from the theme. */
export function readComponentBase(
  code: string,
  componentKey: string,
): Record<string, string> {
  const model = readThemeModel(code)?.model;
  const node = model?.components[componentKey] as ComponentNode | undefined;
  return node?.base ?? {};
}

/**
 * Set a component type's `base` style overrides in the theme literal, preserving
 * any other selectors on the node. Empty values are dropped; an emptied node is
 * removed. Scaffolds the theme if the code has none. Returns the new code.
 */
export function setComponentBase(
  code: string,
  componentKey: string,
  base: Record<string, string>,
): string {
  const baseCode = readThemeModel(code) ? code : ensureThemeScaffold(code);
  const parsed = readThemeModel(baseCode);
  if (!parsed) {
    return code;
  }
  const model = parsed.model;
  const node = (model.components[componentKey] as ComponentNode) ?? {};
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(base)) {
    if (v.trim() !== '') {
      clean[k] = v;
    }
  }
  const nextComponents = {...model.components};
  const otherKeys = Object.keys(node).filter(k => k !== 'base');
  if (Object.keys(clean).length === 0 && otherKeys.length === 0) {
    delete nextComponents[componentKey];
  } else {
    const nextNode: ComponentNode = {...node};
    if (Object.keys(clean).length === 0) {
      delete nextNode.base;
    } else {
      nextNode.base = clean;
    }
    nextComponents[componentKey] = nextNode;
  }
  return writeThemeModel(baseCode, {...model, components: nextComponents});
}

/**
 * Replace the `defineTheme({...})` argument in the code with the serialized
 * model. Returns the original code unchanged if there's no defineTheme call.
 */
export function writeThemeModel(code: string, model: ThemeModel): string {
  const parsed = readThemeModel(code);
  if (!parsed) {
    return code;
  }
  const [start, end] = parsed.argRange;
  const indent = columnOf(code, start);
  const serialized = serializeThemeArg(model, indent);
  return code.slice(0, start) + serialized + code.slice(end);
}

// =============================================================================
// Wrapper stripping (for the preview-run copy)
// =============================================================================

function findDefaultExportReturnJSX(ast: Node): Node | null {
  let result: Node | null = null;
  const walk = (node: unknown): void => {
    if (result || !node || typeof node !== 'object') {
      return;
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        walk(child);
      }
      return;
    }
    const n = node as Node;
    if (n.type === 'ReturnStatement') {
      const arg = n.argument as Node | null;
      if (arg?.type === 'JSXElement') {
        result = arg;
        return;
      }
      if (arg?.type === 'ParenthesizedExpression') {
        const inner = arg.expression as Node;
        if (inner?.type === 'JSXElement') {
          result = inner;
          return;
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
  return result;
}

function jsxElementName(el: Node): string | null {
  const opening = el.openingElement as Node;
  const name = opening?.name as Node;
  if (name?.type === 'JSXIdentifier') {
    return name.name as string;
  }
  return null;
}

/** Collect top-level `const x = defineTheme(...)` declaration ranges. */
function findDefineThemeDeclRanges(ast: Node): Array<[number, number]> {
  const body = (ast.program as Node)?.body as Node[] | undefined;
  if (!body) {
    return [];
  }
  const ranges: Array<[number, number]> = [];
  for (const stmt of body) {
    if (stmt.type !== 'VariableDeclaration') {
      continue;
    }
    const decls = (stmt.declarations as Node[]) ?? [];
    const isDefineTheme = decls.some(d => {
      const init = d.init as Node | null;
      return (
        init?.type === 'CallExpression' &&
        (init.callee as Node)?.type === 'Identifier' &&
        (init.callee as Node).name === 'defineTheme'
      );
    });
    if (isDefineTheme) {
      ranges.push([stmt.start as number, stmt.end as number]);
    }
  }
  return ranges;
}

/**
 * Produce a copy of the code the preview can execute: the root `<Theme>` wrapper
 * is replaced by its children and the `const appTheme = defineTheme(...)`
 * declaration is removed. The preview runtime neutralizes user theming and
 * `defineTheme` isn't in its scope (see generate-scope.mjs), so both must go;
 * the parent applies the parsed theme separately. Returns the code unchanged if
 * there's no root Theme wrapper.
 */
export function stripThemeWrapper(code: string): string {
  const ast = tryParse(code);
  if (!ast) {
    return code;
  }
  const root = findDefaultExportReturnJSX(ast);
  if (!root || jsxElementName(root) !== 'Theme') {
    return code;
  }
  const children = (root.children as Node[]) ?? [];
  const elementChildren = children.filter(c => c.type === 'JSXElement');
  if (elementChildren.length === 0) {
    return code;
  }
  const firstChild = elementChildren[0];
  const lastChild = elementChildren[elementChildren.length - 1];
  let inner = code.slice(firstChild.start as number, lastChild.end as number);
  // Multiple top-level children can't sit bare in a return — wrap in a fragment.
  if (elementChildren.length > 1) {
    inner = `<>${inner}</>`;
  }

  // Build edits (apply from the end so earlier offsets stay valid): unwrap the
  // Theme element, then delete each defineTheme declaration.
  const edits: Array<{start: number; end: number; text: string}> = [
    {start: root.start as number, end: root.end as number, text: inner},
  ];
  for (const [start, end] of findDefineThemeDeclRanges(ast)) {
    // Swallow a trailing newline so we don't leave a blank line behind.
    let e = end;
    if (code[e] === '\n') {
      e += 1;
    }
    edits.push({start, end: e, text: ''});
  }
  edits.sort((a, b) => b.start - a.start);

  let out = code;
  for (const edit of edits) {
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  }
  return out;
}

/** Whether the code already declares a defineTheme + root <Theme> wrapper. */
export function hasThemeScaffold(code: string): boolean {
  const ast = tryParse(code);
  if (!ast) {
    return false;
  }
  if (!findDefineThemeCall(ast)) {
    return false;
  }
  const root = findDefaultExportReturnJSX(ast);
  return root != null && jsxElementName(root) === 'Theme';
}

// =============================================================================
// Scaffold injection (for templates / code without an in-code theme)
// =============================================================================

const THEME_IMPORT_RE =
  /import\s*\{([^}]*)\}\s*from\s*['"]@xds\/core\/theme['"]/;

function ensureThemeImport(code: string): string {
  const match = code.match(THEME_IMPORT_RE);
  if (match) {
    const specifiers = match[1].split(',').map(s => s.trim());
    const set = new Set(specifiers.filter(Boolean));
    set.add('Theme');
    set.add('defineTheme');
    const merged = `import {${[...set].join(', ')}} from '@astryxdesign/core/theme'`;
    return code.replace(THEME_IMPORT_RE, merged);
  }
  return `import {Theme, defineTheme} from '@astryxdesign/core/theme';\n${code}`;
}

const DEFINE_THEME_DECL =
  "const appTheme = defineTheme({\n  name: 'custom',\n});\n\n";

/**
 * Wrap code that has no in-code theme in the playground's standard scaffold: a
 * `defineTheme` declaration + a root `<Theme theme={appTheme}>` wrapper around
 * the default export's returned JSX. Best-effort — returns the original code if
 * it can't be parsed or already has a scaffold.
 */
export function ensureThemeScaffold(code: string): string {
  if (hasThemeScaffold(code)) {
    return code;
  }
  const ast = tryParse(code);
  if (!ast) {
    return code;
  }
  const root = findDefaultExportReturnJSX(ast);
  if (!root) {
    return code;
  }
  const start = root.start as number;
  const end = root.end as number;
  const original = code.slice(start, end);
  // Re-indent the wrapped element by two spaces so it nests cleanly.
  const indented = original.replace(/\n/g, '\n  ');
  const wrapped = `<Theme theme={appTheme}>\n      ${indented}\n    </Theme>`;
  let next = code.slice(0, start) + wrapped + code.slice(end);

  // Insert the appTheme declaration just before the default export.
  const exportIdx = next.indexOf('export default');
  if (exportIdx >= 0) {
    next = next.slice(0, exportIdx) + DEFINE_THEME_DECL + next.slice(exportIdx);
  } else {
    next = DEFINE_THEME_DECL + next;
  }

  return ensureThemeImport(next);
}
