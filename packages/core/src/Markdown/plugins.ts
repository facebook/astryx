// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file plugins.ts
 * @input Markdown plugin definitions, syntax tokenizers, immutable transforms, and renderers
 * @output Public plugin protocol plus validated internal preparation and execution
 * @position Shared Markdown extension boundary consumed by the parser and renderer
 */

import type React from 'react';
import {warnOnce} from '../utils/devWarning';
import type {
  MarkdownAstDataValue,
  MarkdownAstExtensionNode,
  MarkdownAstNodeBase,
  MarkdownAstPosition,
  MarkdownAstRoot,
} from './ast';

export type MarkdownPluginData = MarkdownAstDataValue;

export type MarkdownExtensionNode<
  PluginName extends string = string,
  NodeName extends string = string,
  Data extends MarkdownPluginData = MarkdownPluginData,
  Display extends 'inline' | 'block' = 'inline' | 'block',
> = MarkdownAstExtensionNode<PluginName, NodeName, Data, Display>;

export interface MarkdownTokenizerInput {
  readonly source: string;
  /** UTF-16 offset into `source`. */
  readonly offset: number;
  /** Exclusive UTF-16 bound visible to this tokenizer. */
  readonly end: number;
  readonly isFinal: boolean;
  readonly context: 'inline' | 'block';
  readonly lineStart: number;
  readonly column: number;
}

type ExtensionNodeWithoutProvenance<Node extends MarkdownExtensionNode> = Omit<
  Node,
  'source' | 'position'
>;

export type MarkdownTokenizeResult<Node extends MarkdownExtensionNode> =
  | {readonly status: 'no-match'}
  | {readonly status: 'defer'}
  | {
      readonly status: 'match';
      readonly end: number;
      readonly node: ExtensionNodeWithoutProvenance<Node>;
    };

export interface MarkdownSyntaxContribution<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> {
  readonly startsWith: readonly [string, ...string[]];
  /** Maximum UTF-16 span Core exposes from a candidate offset. */
  readonly maxSpan: number;
  tokenize(input: MarkdownTokenizerInput): MarkdownTokenizeResult<Node>;
}

type ExtensionForDisplay<
  Node extends MarkdownExtensionNode,
  Display extends 'inline' | 'block',
> = Display extends Node['display']
  ? Node & {readonly display: Display}
  : never;

export interface MarkdownSyntaxCapability<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> {
  readonly inline?: readonly [
    MarkdownSyntaxContribution<ExtensionForDisplay<Node, 'inline'>>,
    ...MarkdownSyntaxContribution<ExtensionForDisplay<Node, 'inline'>>[],
  ];
  readonly block?: readonly [
    MarkdownSyntaxContribution<ExtensionForDisplay<Node, 'block'>>,
    ...MarkdownSyntaxContribution<ExtensionForDisplay<Node, 'block'>>[],
  ];
}

export interface MarkdownTransformContext {
  readonly source: string;
  readonly isFinal: boolean;
  readonly display: 'inline' | 'block';
  report(message: string): void;
}

export type MarkdownTransform<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> = (
  document: MarkdownAstRoot<Node>,
  context: MarkdownTransformContext,
) => MarkdownAstRoot<Node>;

export interface MarkdownExtensionRenderer<Node extends MarkdownExtensionNode> {
  readonly render: React.ComponentType<{node: Node}>;
  readonly toText: (node: Node) => string;
}

export type MarkdownExtensionRenderers<Node extends MarkdownExtensionNode> =
  Readonly<{
    [NodeName in Node['name']]: MarkdownExtensionRenderer<
      Extract<Node, {name: NodeName}>
    >;
  }>;

interface MarkdownPluginDefinitionBase<
  Name extends string,
  Node extends MarkdownExtensionNode<Name>,
> {
  readonly name: Name;
  readonly apiVersion: 1;
  readonly transform?: MarkdownTransform<Node>;
  readonly renderers?: MarkdownExtensionRenderers<Node>;
}

export interface MarkdownSyntaxPluginDefinition<
  Name extends string,
  Node extends MarkdownExtensionNode<Name>,
> extends MarkdownPluginDefinitionBase<Name, Node> {
  readonly parseKey: string;
  readonly syntax: MarkdownSyntaxCapability<Node>;
  readonly renderers: MarkdownExtensionRenderers<Node>;
}

export interface MarkdownTransformPluginDefinition<
  Name extends string,
  Node extends MarkdownExtensionNode<Name> = never,
> extends MarkdownPluginDefinitionBase<Name, Node> {
  readonly transform: MarkdownTransform<Node>;
  readonly parseKey?: never;
  readonly syntax?: never;
}

export type MarkdownPluginDefinition<
  Name extends string,
  Node extends MarkdownExtensionNode<Name> = never,
> =
  | MarkdownSyntaxPluginDefinition<Name, Node>
  | MarkdownTransformPluginDefinition<Name, Node>;

declare const markdownPluginNode: unique symbol;

/** Opaque, covariant entry safe to store in heterogeneous plugin lists. */
export interface MarkdownPluginEntry<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> {
  readonly name: string;
  readonly apiVersion: 1;
  readonly [markdownPluginNode]: Node;
}

export type MarkdownNodeOf<Entry> =
  Entry extends MarkdownPluginEntry<infer Node> ? Node : never;

export type MarkdownExtensionsOf<
  Plugins extends ReadonlyArray<MarkdownPluginEntry>,
> = MarkdownNodeOf<Plugins[number]>;

const markdownPluginDefinition = Symbol('MarkdownPluginDefinition');

interface InternalMarkdownPluginEntry<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> extends MarkdownPluginEntry<Node> {
  readonly [markdownPluginDefinition]: MarkdownPluginDefinition<string, Node>;
}

function deepFreezeConfig<T>(value: T, seen: Set<object> = new Set()): T {
  if (value != null && typeof value === 'object' && !seen.has(value)) {
    seen.add(value);
    for (const nested of Object.values(value)) {
      deepFreezeConfig(nested, seen);
    }
    Object.freeze(value);
  }
  return value;
}

function fail(message: string): never {
  throw new Error(`Markdown plugin: ${message}`);
}

function validateSyntax(
  pluginName: string,
  syntax: MarkdownSyntaxCapability,
): void {
  const contributions = [...(syntax.inline ?? []), ...(syntax.block ?? [])];
  if (contributions.length === 0) {
    fail(`"${pluginName}" syntax must declare an inline or block contribution`);
  }
  for (const contribution of contributions) {
    if (!Number.isFinite(contribution.maxSpan) || contribution.maxSpan <= 0) {
      fail(`"${pluginName}" syntax maxSpan must be positive and finite`);
    }
    for (const prefix of contribution.startsWith) {
      if (prefix === '' || prefix.length > contribution.maxSpan) {
        fail(`"${pluginName}" syntax prefixes must be non-empty and bounded`);
      }
    }
  }
}

export function createMarkdownPlugin<
  const Name extends string,
  const Node extends MarkdownExtensionNode<Name>,
>(
  definition: MarkdownSyntaxPluginDefinition<Name, Node>,
): MarkdownPluginEntry<Node>;
export function createMarkdownPlugin<const Name extends string>(
  definition: MarkdownTransformPluginDefinition<Name, never>,
): MarkdownPluginEntry<never>;
export function createMarkdownPlugin<
  const Name extends string,
  const Node extends MarkdownExtensionNode<Name>,
>(
  definition: MarkdownTransformPluginDefinition<Name, Node>,
): MarkdownPluginEntry<Node>;
export function createMarkdownPlugin(
  definition:
    | MarkdownPluginDefinition<string, MarkdownExtensionNode>
    | MarkdownTransformPluginDefinition<string, never>,
): MarkdownPluginEntry {
  if (definition.name.trim() === '') {
    fail('name must be a non-empty string');
  }
  if (definition.apiVersion !== 1) {
    fail(`"${definition.name}" uses unsupported apiVersion`);
  }
  if (
    typeof definition.transform !== 'undefined' &&
    typeof definition.transform !== 'function'
  ) {
    fail(`"${definition.name}" transform must be a function`);
  }
  if ('syntax' in definition && definition.syntax != null) {
    if (definition.parseKey.trim() === '') {
      fail(`"${definition.name}" parseKey must be non-empty`);
    }
    validateSyntax(definition.name, definition.syntax);
    if (Object.keys(definition.renderers).length === 0) {
      fail(`"${definition.name}" syntax must provide renderers`);
    }
  } else if (definition.transform == null) {
    fail(`"${definition.name}" must declare syntax or transform`);
  }

  const frozenDefinition = deepFreezeConfig(definition);
  return Object.freeze({
    name: frozenDefinition.name,
    apiVersion: 1 as const,
    [markdownPluginDefinition]: frozenDefinition,
  }) as unknown as MarkdownPluginEntry;
}

export interface PreparedSyntaxContribution {
  readonly pluginName: string;
  readonly display: 'inline' | 'block';
  readonly contribution: MarkdownSyntaxContribution;
}

interface PreparedTransform {
  readonly pluginName: string;
  readonly transform: MarkdownTransform;
}

interface PreparedRenderer {
  readonly pluginName: string;
  readonly renderer: MarkdownExtensionRenderer<MarkdownExtensionNode>;
}

export interface PreparedMarkdownPlugins {
  readonly entries: ReadonlyArray<MarkdownPluginEntry>;
  readonly syntaxEntries: ReadonlyArray<MarkdownPluginEntry>;
  readonly inlineByFirstCharacter: ReadonlyMap<
    string,
    ReadonlyArray<PreparedSyntaxContribution>
  >;
  readonly blockByFirstCharacter: ReadonlyMap<
    string,
    ReadonlyArray<PreparedSyntaxContribution>
  >;
  readonly transforms: ReadonlyArray<PreparedTransform>;
  readonly syntaxIdentity: string;
  readonly renderers: ReadonlyMap<string, PreparedRenderer>;
}

const preparedPluginLists = new WeakMap<
  ReadonlyArray<MarkdownPluginEntry>,
  PreparedMarkdownPlugins
>();

function appendMapValue<T>(map: Map<string, T[]>, key: string, value: T): void {
  const current = map.get(key);
  if (current == null) {
    map.set(key, [value]);
  } else {
    current.push(value);
  }
}

function syntaxOnlyEntry(
  publicEntry: MarkdownPluginEntry,
): MarkdownPluginEntry {
  const entry = publicEntry as InternalMarkdownPluginEntry;
  const definition = entry[markdownPluginDefinition];
  if (definition.transform == null) {
    return publicEntry;
  }
  return Object.freeze({
    name: entry.name,
    apiVersion: entry.apiVersion,
    [markdownPluginDefinition]: {...definition, transform: undefined},
  }) as unknown as MarkdownPluginEntry;
}

export function prepareMarkdownPlugins(
  plugins: ReadonlyArray<MarkdownPluginEntry>,
): PreparedMarkdownPlugins | undefined {
  if (plugins.length === 0) {
    return undefined;
  }
  const cached = preparedPluginLists.get(plugins);
  if (cached != null) {
    return cached;
  }

  const names = new Set<string>();
  const inlineByFirstCharacter = new Map<
    string,
    PreparedSyntaxContribution[]
  >();
  const blockByFirstCharacter = new Map<string, PreparedSyntaxContribution[]>();
  const transforms: PreparedTransform[] = [];
  const renderers = new Map<string, PreparedRenderer>();
  const syntaxIdentity: string[] = [];
  const entries: InternalMarkdownPluginEntry[] = [];
  const syntaxEntries: MarkdownPluginEntry[] = [];

  for (const publicEntry of plugins) {
    const entry = publicEntry as Partial<InternalMarkdownPluginEntry>;
    const definition = entry[markdownPluginDefinition];
    if (definition == null || entry.apiVersion !== 1) {
      fail('entries must come from createMarkdownPlugin()');
    }
    if (names.has(definition.name)) {
      fail(`duplicate name "${definition.name}"`);
    }
    names.add(definition.name);
    entries.push(entry as InternalMarkdownPluginEntry);

    if (definition.transform != null) {
      transforms.push({
        pluginName: definition.name,
        transform: definition.transform,
      });
    }
    if (definition.renderers != null) {
      for (const [nodeName, renderer] of Object.entries(definition.renderers)) {
        renderers.set(`${definition.name}\0${nodeName}`, {
          pluginName: definition.name,
          renderer: renderer,
        });
      }
    }
    if ('syntax' in definition && definition.syntax != null) {
      syntaxEntries.push(syntaxOnlyEntry(publicEntry));
      syntaxIdentity.push(
        `${definition.name}\0${definition.apiVersion}\0${definition.parseKey}`,
      );
      for (const contribution of definition.syntax.inline ?? []) {
        const prepared: PreparedSyntaxContribution = {
          pluginName: definition.name,
          display: 'inline',
          contribution,
        };
        for (const firstCharacter of new Set(
          contribution.startsWith.map(prefix => prefix[0]),
        )) {
          appendMapValue(inlineByFirstCharacter, firstCharacter, prepared);
        }
      }
      for (const contribution of definition.syntax.block ?? []) {
        const prepared: PreparedSyntaxContribution = {
          pluginName: definition.name,
          display: 'block',
          contribution,
        };
        for (const firstCharacter of new Set(
          contribution.startsWith.map(prefix => prefix[0]),
        )) {
          appendMapValue(blockByFirstCharacter, firstCharacter, prepared);
        }
      }
    }
  }

  const prepared: PreparedMarkdownPlugins = {
    entries,
    syntaxEntries,
    inlineByFirstCharacter,
    blockByFirstCharacter,
    transforms,
    syntaxIdentity: syntaxIdentity.join('\u0001'),
    renderers,
  };
  preparedPluginLists.set(plugins, prepared);
  return prepared;
}

const stableSyntaxEntries = new Map<
  string,
  ReadonlyArray<MarkdownPluginEntry>
>();
const MAX_STABLE_SYNTAX_IDENTITIES = 100;

/** @internal Reuse parse-equivalent syntax entries across live transforms. */
export function getStableMarkdownSyntaxEntries(
  plugins: PreparedMarkdownPlugins | undefined,
): ReadonlyArray<MarkdownPluginEntry> | undefined {
  if (plugins == null || plugins.syntaxIdentity === '') {
    return undefined;
  }
  const cached = stableSyntaxEntries.get(plugins.syntaxIdentity);
  if (cached != null) {
    return cached;
  }
  if (stableSyntaxEntries.size >= MAX_STABLE_SYNTAX_IDENTITIES) {
    const oldest = stableSyntaxEntries.keys().next().value;
    if (oldest != null) {
      stableSyntaxEntries.delete(oldest);
    }
  }
  stableSyntaxEntries.set(plugins.syntaxIdentity, plugins.syntaxEntries);
  return plugins.syntaxEntries;
}

export function isMarkdownPluginData(
  value: unknown,
  seen: Set<object> = new Set(),
): value is MarkdownPluginData {
  if (
    value == null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return true;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (typeof value !== 'object' || seen.has(value)) {
    return false;
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return value.every(item => isMarkdownPluginData(item, seen));
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    return false;
  }
  return Object.values(value).every(item => isMarkdownPluginData(item, seen));
}

export function freezeMarkdownPluginData<T extends MarkdownPluginData>(
  value: T,
): T {
  if (value != null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) {
      freezeMarkdownPluginData(nested);
    }
    Object.freeze(value);
  }
  return value;
}

function positionKey(position: MarkdownAstPosition | undefined): string | null {
  const start = position?.start.offset;
  const end = position?.end.offset;
  return start == null || end == null ? null : `${start}:${end}`;
}

interface SourceInvariant {
  readonly type: string;
  readonly depth?: unknown;
  readonly ordered?: unknown;
  readonly start?: unknown;
  readonly delimiter?: unknown;
  readonly plugin?: unknown;
  readonly name?: unknown;
  readonly display?: unknown;
}

function collectSourceInvariants(
  root: MarkdownAstRoot<MarkdownExtensionNode>,
): Map<string, SourceInvariant> {
  const positions = new Map<string, SourceInvariant>();
  const visit = (node: MarkdownAstNodeBase & {readonly type: string}): void => {
    const key = positionKey(node.position);
    if (key != null) {
      const record = node as unknown as Record<string, unknown>;
      positions.set(key, {
        type: node.type,
        depth: record.depth,
        ordered: record.ordered,
        start: record.start,
        delimiter: record.delimiter,
        plugin: record.plugin,
        name: record.name,
        display: record.display,
      });
    }
    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (child != null && typeof child === 'object') {
          visit(child as MarkdownAstNodeBase & {readonly type: string});
        }
      }
    }
  };
  visit(root);
  return positions;
}

function extensionSignature(node: Record<string, unknown>): string {
  return JSON.stringify([
    node.plugin,
    node.name,
    node.display,
    node.data,
    node.source,
    positionKey(node.position as MarkdownAstPosition | undefined),
  ]);
}

function collectExtensionSignatures(
  root: MarkdownAstRoot<MarkdownExtensionNode>,
): Map<string, number> {
  const signatures = new Map<string, number>();
  const visit = (node: MarkdownAstNodeBase & {readonly type: string}): void => {
    if (node.type === 'extension') {
      const signature = extensionSignature(
        node as unknown as Record<string, unknown>,
      );
      signatures.set(signature, (signatures.get(signature) ?? 0) + 1);
    }
    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (child != null && typeof child === 'object') {
          visit(child as MarkdownAstNodeBase & {readonly type: string});
        }
      }
    }
  };
  visit(root);
  return signatures;
}

function collectHeadingDepths(
  root: MarkdownAstRoot<MarkdownExtensionNode>,
): number[] {
  const depths: number[] = [];
  const visit = (node: MarkdownAstNodeBase & {readonly type: string}): void => {
    if (node.type === 'heading') {
      depths.push((node as unknown as {readonly depth: number}).depth);
    }
    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (child != null && typeof child === 'object') {
          visit(child as MarkdownAstNodeBase & {readonly type: string});
        }
      }
    }
  };
  visit(root);
  return depths;
}

const PHRASING_TYPES = new Set([
  'text',
  'strong',
  'emphasis',
  'delete',
  'inlineCode',
  'inlineMath',
  'break',
  'link',
  'image',
  'citation',
]);
const BLOCK_TYPES = new Set([
  'heading',
  'paragraph',
  'code',
  'math',
  'blockquote',
  'list',
  'table',
  'thematicBreak',
  'image',
]);
const PHRASING_PARENTS = new Set([
  'heading',
  'paragraph',
  'strong',
  'emphasis',
  'delete',
  'link',
  'tableCell',
]);
const BLOCK_PARENTS = new Set(['root', 'blockquote', 'listItem']);
const CHILD_PARENT_TYPES = new Set([
  ...PHRASING_PARENTS,
  ...BLOCK_PARENTS,
  'list',
  'table',
  'tableRow',
]);

function validateAst(
  root: unknown,
  pluginNames: ReadonlySet<string>,
  rendererKeys: ReadonlySet<string>,
  sourcePositions: ReadonlyMap<string, SourceInvariant>,
  expectedHeadingDepths: ReadonlyArray<number>,
  activePluginName: string,
  existingExtensions: Map<string, number>,
  display: 'inline' | 'block',
): root is MarkdownAstRoot<MarkdownExtensionNode> {
  if (root == null || typeof root !== 'object') {
    return false;
  }
  const seen = new Set<object>();
  const headingDepths: number[] = [];
  let count = 0;
  const visit = (value: unknown, parent: string | null): boolean => {
    if (value == null || typeof value !== 'object' || seen.has(value)) {
      return false;
    }
    if (++count > 100_000) {
      return false;
    }
    seen.add(value);
    const node = value as Record<string, unknown>;
    const type = node.type;
    if (typeof type !== 'string') {
      return false;
    }
    if (node.data !== undefined && !isMarkdownPluginData(node.data)) {
      return false;
    }

    if (parent != null) {
      const extensionDisplay = type === 'extension' ? node.display : undefined;
      const phrasing =
        PHRASING_TYPES.has(type) || extensionDisplay === 'inline';
      const block = BLOCK_TYPES.has(type) || extensionDisplay === 'block';
      if (
        (PHRASING_PARENTS.has(parent) && !phrasing) ||
        (BLOCK_PARENTS.has(parent) && !block) ||
        (parent === 'list' && type !== 'listItem') ||
        (parent === 'table' && type !== 'tableRow') ||
        (parent === 'tableRow' && type !== 'tableCell')
      ) {
        return false;
      }
    }

    const position = node.position as MarkdownAstPosition | undefined;
    const key = positionKey(position);
    if (position != null) {
      const start = position.start?.offset;
      const end = position.end?.offset;
      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        (start as number) < 0 ||
        (end as number) < (start as number)
      ) {
        return false;
      }
    }
    if (key != null) {
      const invariant = sourcePositions.get(key);
      if (
        invariant == null ||
        invariant.type !== type ||
        invariant.depth !== node.depth ||
        invariant.ordered !== node.ordered ||
        invariant.start !== node.start ||
        invariant.delimiter !== node.delimiter ||
        invariant.plugin !== node.plugin ||
        invariant.name !== node.name ||
        invariant.display !== node.display
      ) {
        return false;
      }
    }

    switch (type) {
      case 'root':
        if (parent != null) {
          return false;
        }
        break;
      case 'heading':
        if (![1, 2, 3, 4, 5, 6].includes(node.depth as number)) {
          return false;
        }
        headingDepths.push(node.depth as number);
        break;
      case 'text':
      case 'inlineCode':
      case 'inlineMath':
      case 'math':
        if (typeof node.value !== 'string') {
          return false;
        }
        break;
      case 'code':
        if (
          typeof node.value !== 'string' ||
          (node.lang !== null && typeof node.lang !== 'string')
        ) {
          return false;
        }
        break;
      case 'link':
        if (typeof node.url !== 'string') {
          return false;
        }
        break;
      case 'image':
        if (typeof node.url !== 'string' || typeof node.alt !== 'string') {
          return false;
        }
        break;
      case 'citation':
        if (typeof node.sourceId !== 'string') {
          return false;
        }
        break;
      case 'list':
        if (
          typeof node.ordered !== 'boolean' ||
          (node.start != null && !Number.isFinite(node.start)) ||
          (node.delimiter != null &&
            node.delimiter !== '.' &&
            node.delimiter !== ')')
        ) {
          return false;
        }
        break;
      case 'table':
        if (
          !Array.isArray(node.align) ||
          !node.align.every(
            value =>
              value === null ||
              value === 'left' ||
              value === 'center' ||
              value === 'right',
          )
        ) {
          return false;
        }
        break;
      case 'extension': {
        if (
          typeof node.plugin !== 'string' ||
          !pluginNames.has(node.plugin) ||
          typeof node.name !== 'string' ||
          (node.display !== 'inline' && node.display !== 'block') ||
          !isMarkdownPluginData(node.data) ||
          !rendererKeys.has(`${node.plugin}\0${node.name}`)
        ) {
          return false;
        }
        if (node.plugin !== activePluginName) {
          const signature = extensionSignature(node);
          const remaining = existingExtensions.get(signature) ?? 0;
          if (remaining === 0) {
            return false;
          }
          existingExtensions.set(signature, remaining - 1);
        }
        break;
      }
      case 'strong':
      case 'emphasis':
      case 'delete':
      case 'break':
      case 'paragraph':
      case 'blockquote':
      case 'listItem':
      case 'tableRow':
      case 'tableCell':
      case 'thematicBreak':
        break;
      default:
        return false;
    }

    if (CHILD_PARENT_TYPES.has(type)) {
      if (!Array.isArray(node.children)) {
        return false;
      }
      for (const child of node.children) {
        if (!visit(child, type)) {
          return false;
        }
      }
    } else if ('children' in node) {
      return false;
    }
    return true;
  };
  const candidate = root as MarkdownAstRoot<MarkdownExtensionNode>;
  return (
    visit(candidate, null) &&
    candidate.type === 'root' &&
    headingDepths.length === expectedHeadingDepths.length &&
    headingDepths.every(
      (depth, index) => depth === expectedHeadingDepths[index],
    ) &&
    (display === 'block' ||
      (candidate.children.length === 1 &&
        candidate.children[0]?.type === 'paragraph'))
  );
}

function freezeAst<T>(value: T, seen: Set<object> = new Set()): T {
  if (value != null && typeof value === 'object' && !seen.has(value)) {
    seen.add(value);
    for (const nested of Object.values(value)) {
      freezeAst(nested, seen);
    }
    Object.freeze(value);
  }
  return value;
}

export function reportMarkdownPluginFailure(
  pluginName: string,
  phase: 'syntax' | 'transform' | 'render',
  error: unknown,
): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  warnOnce(
    `markdown-plugin:${pluginName}:${phase}`,
    'Markdown',
    `plugin "${pluginName}" failed in ${phase}; rendered readable fallback.`,
    error,
  );
}

export function applyMarkdownTransforms<Node extends MarkdownExtensionNode>(
  root: MarkdownAstRoot<Node>,
  plugins: PreparedMarkdownPlugins | undefined,
  source: string,
  isFinal: boolean,
  display: 'inline' | 'block',
): MarkdownAstRoot<Node> {
  if (plugins == null || plugins.transforms.length === 0) {
    return root;
  }
  const pluginNames = new Set(plugins.entries.map(entry => entry.name));
  const rendererKeys = new Set(plugins.renderers.keys());
  const positions = collectSourceInvariants(root);
  const headingDepths = collectHeadingDepths(root);
  let document = freezeAst(root);
  for (const prepared of plugins.transforms) {
    const existingExtensions = collectExtensionSignatures(document);
    try {
      const next = prepared.transform(document, {
        source,
        isFinal,
        display,
        report(message) {
          reportMarkdownPluginFailure(
            prepared.pluginName,
            'transform',
            message,
          );
        },
      }) as unknown;
      if (
        next != null &&
        typeof next === 'object' &&
        typeof (next as {then?: unknown}).then === 'function'
      ) {
        throw new TypeError('Async Markdown transforms are not supported');
      }
      if (
        !validateAst(
          next,
          pluginNames,
          rendererKeys,
          positions,
          headingDepths,
          prepared.pluginName,
          existingExtensions,
          display,
        )
      ) {
        throw new TypeError('Transform returned an invalid Markdown document');
      }
      document = freezeAst(next) as MarkdownAstRoot<Node>;
    } catch (error) {
      reportMarkdownPluginFailure(prepared.pluginName, 'transform', error);
    }
  }
  return document;
}

export function getMarkdownExtensionRenderer(
  plugins: PreparedMarkdownPlugins | undefined,
  node: MarkdownExtensionNode,
): MarkdownExtensionRenderer<MarkdownExtensionNode> | undefined {
  return plugins?.renderers.get(`${node.plugin}\0${node.name}`)?.renderer;
}

export function markdownExtensionText(
  plugins: PreparedMarkdownPlugins | undefined,
  node: MarkdownExtensionNode,
): string {
  const renderer = getMarkdownExtensionRenderer(plugins, node);
  if (renderer == null) {
    return node.source ?? '';
  }
  try {
    return renderer.toText(node);
  } catch (error) {
    reportMarkdownPluginFailure(node.plugin, 'render', error);
    return node.source ?? '';
  }
}
