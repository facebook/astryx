// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file plugins.ts
 * @input Markdown plugin definitions and source-range decorations
 * @output Public plugin protocol plus private validated dispatch preparation
 * @position Shared Markdown extension boundary; consumed by parser and renderer
 */

import type React from 'react';
import {warnOnce} from '../utils/devWarning';
import type {BlockNode, SourceRange} from './parser';

export type MarkdownPluginData =
  | null
  | boolean
  | number
  | string
  | ReadonlyArray<MarkdownPluginData>
  | {readonly [key: string]: MarkdownPluginData};

export interface MarkdownExtensionNode<
  PluginName extends string = string,
  NodeName extends string = string,
  Data extends MarkdownPluginData = MarkdownPluginData,
  Display extends 'inline' | 'block' = 'inline' | 'block',
> {
  readonly type: 'extension';
  readonly plugin: PluginName;
  readonly name: NodeName;
  readonly display: Display;
  readonly data: Data;
  readonly source: string;
  readonly range?: SourceRange;
}

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
  'source' | 'range'
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

export type MarkdownSyntaxCapability<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> =
  | {
      readonly inline: readonly [
        MarkdownSyntaxContribution<ExtensionForDisplay<Node, 'inline'>>,
        ...MarkdownSyntaxContribution<ExtensionForDisplay<Node, 'inline'>>[],
      ];
      readonly block?: ReadonlyArray<
        MarkdownSyntaxContribution<ExtensionForDisplay<Node, 'block'>>
      >;
      toText(node: ExtensionForDisplay<Node, 'inline'>): string;
    }
  | {
      readonly inline?: undefined;
      readonly block: readonly [
        MarkdownSyntaxContribution<ExtensionForDisplay<Node, 'block'>>,
        ...MarkdownSyntaxContribution<ExtensionForDisplay<Node, 'block'>>[],
      ];
      readonly toText?: never;
    };

export interface MarkdownTextTransformOptions {
  /** Global expression matched against eligible built-in prose only. */
  readonly pattern: RegExp;
  readonly getEndIndex?: (
    text: string,
    match: RegExpMatchArray,
  ) => number | false;
  readonly render: (match: RegExpMatchArray, key: string) => React.ReactNode;
}

export type MarkdownFenceMode = 'interactive' | 'passive' | 'inert';

export interface MarkdownFenceTransformInput {
  readonly source: string;
  readonly language: string;
  readonly meta: string | undefined;
  readonly range: SourceRange | undefined;
  readonly isFinal: boolean;
  readonly mode: MarkdownFenceMode;
  readonly fallback: React.ReactNode;
}

export type MarkdownFenceTransformResult =
  | {readonly status: 'enhance'; readonly content: React.ReactNode}
  | {readonly status: 'fallback'}
  | {readonly status: 'decline'};

export interface MarkdownFenceTransformOptions {
  readonly languages: readonly [string, ...string[]];
  readonly mode?: MarkdownFenceMode;
  render(input: MarkdownFenceTransformInput): MarkdownFenceTransformResult;
}

export type MarkdownDecorationAppearance = 'highlight' | 'underline';
export type MarkdownDecorationTone =
  'neutral' | 'accent' | 'info' | 'positive' | 'warning' | 'critical';

export interface MarkdownSourceDecoration {
  readonly id: string;
  readonly range: SourceRange;
  readonly appearance: MarkdownDecorationAppearance;
  readonly tone: MarkdownDecorationTone;
  readonly label: string;
}

export interface MarkdownDocument<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> {
  readonly type: 'root';
  readonly children: ReadonlyArray<BlockNode<Node>>;
}

export interface MarkdownTransformContext {
  readonly source: string;
  readonly isFinal: boolean;
}

export type MarkdownAstTransformer<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> = (
  document: MarkdownDocument<Node>,
  context: MarkdownTransformContext,
) => MarkdownDocument<Node>;

declare const markdownTransformNode: unique symbol;

/** Opaque transform created by one of the Markdown transform helpers. */
export interface MarkdownTransform<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> {
  readonly [markdownTransformNode]: Node;
}

const markdownTransformDefinition = Symbol('MarkdownTransformDefinition');

type InternalMarkdownTransformDefinition =
  | {readonly kind: 'text'; readonly value: MarkdownTextTransformOptions}
  | {readonly kind: 'fence'; readonly value: MarkdownFenceTransformOptions}
  | {readonly kind: 'decoration'; readonly value: MarkdownSourceDecoration}
  | {readonly kind: 'ast'; readonly value: MarkdownAstTransformer};

interface InternalMarkdownTransform<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
> extends MarkdownTransform<Node> {
  readonly [markdownTransformDefinition]: InternalMarkdownTransformDefinition;
}

function createTransform<Node extends MarkdownExtensionNode>(
  definition: InternalMarkdownTransformDefinition,
): MarkdownTransform<Node> {
  return Object.freeze({
    [markdownTransformDefinition]: definition,
  }) as unknown as MarkdownTransform<Node>;
}

export function createMarkdownTextTransform(
  options: MarkdownTextTransformOptions,
): MarkdownTransform<never> {
  return createTransform({kind: 'text', value: options});
}

export function createMarkdownFenceTransform(
  options: MarkdownFenceTransformOptions,
): MarkdownTransform<never> {
  return createTransform({kind: 'fence', value: options});
}

export function createMarkdownDecorationTransform(
  decoration: MarkdownSourceDecoration,
): MarkdownTransform<never> {
  return createTransform({kind: 'decoration', value: decoration});
}

export function createMarkdownAstTransform<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
>(transform: MarkdownAstTransformer<Node>): MarkdownTransform<Node> {
  return createTransform({
    kind: 'ast',
    value: transform as MarkdownAstTransformer,
  });
}

type MarkdownTextContribution = MarkdownTextTransformOptions;
type MarkdownFenceContribution = MarkdownFenceTransformOptions;
type MarkdownDecoration = MarkdownSourceDecoration;

export type MarkdownExtensionRenderers<Node extends MarkdownExtensionNode> =
  Readonly<{
    [NodeName in Node['name']]: React.ComponentType<{
      node: Extract<Node, {name: NodeName}>;
    }>;
  }>;

interface MarkdownPluginDefinitionBase<
  Name extends string,
  Node extends MarkdownExtensionNode<Name>,
> {
  readonly name: Name;
  readonly apiVersion: 1;
  readonly transform?: ReadonlyArray<MarkdownTransform<Node>>;
}

export interface MarkdownSyntaxPluginDefinition<
  Name extends string,
  Node extends MarkdownExtensionNode<Name>,
> extends MarkdownPluginDefinitionBase<Name, Node> {
  readonly parseKey: string;
  readonly syntax: MarkdownSyntaxCapability<Node>;
  readonly renderers: MarkdownExtensionRenderers<Node>;
}

export interface MarkdownPresentationPluginDefinition<
  Name extends string,
> extends MarkdownPluginDefinitionBase<Name, never> {
  readonly transform: readonly [
    MarkdownTransform<never>,
    ...MarkdownTransform<never>[],
  ];
  readonly parseKey?: never;
  readonly syntax?: never;
  readonly renderers?: never;
}

export type MarkdownPluginDefinition<
  Name extends string,
  Node extends MarkdownExtensionNode<Name> = never,
> =
  | MarkdownSyntaxPluginDefinition<Name, Node>
  | MarkdownPresentationPluginDefinition<Name>;

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

function fail(message: string): never {
  throw new Error(`Markdown plugin: ${message}`);
}

function validateName(name: string): void {
  if (name.trim() === '') {
    fail('name must be a non-empty string');
  }
}

function validatePattern(
  pluginName: string,
  text: MarkdownTextContribution,
): void {
  if (!text.pattern.global) {
    fail(`"${pluginName}" text patterns must use the global flag`);
  }
}

function normalizeLanguage(language: string): string {
  const normalized = language.trim().toLowerCase();
  if (normalized === '') {
    fail('fence languages must be non-empty strings');
  }
  return normalized;
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
      if (prefix === '') {
        fail(`"${pluginName}" syntax prefixes must be non-empty`);
      }
      if (prefix.length > contribution.maxSpan) {
        fail(`"${pluginName}" syntax maxSpan must cover every prefix`);
      }
    }
  }
}

export function createMarkdownPlugin<const Name extends string>(
  definition: MarkdownPresentationPluginDefinition<Name>,
): MarkdownPluginEntry<never>;
export function createMarkdownPlugin<
  const Name extends string,
  const Node extends MarkdownExtensionNode<Name>,
>(
  definition: MarkdownSyntaxPluginDefinition<Name, Node>,
): MarkdownPluginEntry<Node>;
export function createMarkdownPlugin<
  const Name extends string,
  const Node extends MarkdownExtensionNode<Name>,
>(definition: MarkdownPluginDefinition<Name, Node>): MarkdownPluginEntry<Node> {
  validateName(definition.name);
  if (definition.apiVersion !== 1) {
    fail(`"${definition.name}" uses unsupported apiVersion`);
  }
  for (const transform of definition.transform ?? []) {
    const internal = transform as Partial<InternalMarkdownTransform>;
    const transformDefinition = internal[markdownTransformDefinition];
    if (transformDefinition == null) {
      fail(`"${definition.name}" transforms must come from a transform helper`);
    }
    switch (transformDefinition.kind) {
      case 'text':
        validatePattern(definition.name, transformDefinition.value);
        break;
      case 'fence':
        if (transformDefinition.value.languages.length === 0) {
          fail(`"${definition.name}" fence languages must not be empty`);
        }
        for (const language of transformDefinition.value.languages) {
          normalizeLanguage(language);
        }
        break;
      case 'decoration': {
        const decoration = transformDefinition.value;
        if (
          decoration.id.trim() === '' ||
          decoration.label.trim() === '' ||
          decoration.range.start < 0 ||
          decoration.range.end <= decoration.range.start
        ) {
          fail(`"${definition.name}" has an invalid decoration`);
        }
        break;
      }
      case 'ast':
        break;
    }
  }
  if ('syntax' in definition && definition.syntax != null) {
    if (definition.parseKey.trim() === '') {
      fail(`"${definition.name}" parseKey must be non-empty`);
    }
    validateSyntax(definition.name, definition.syntax);
    if (Object.keys(definition.renderers).length === 0) {
      fail(`"${definition.name}" syntax must provide renderers`);
    }
  } else if ((definition.transform?.length ?? 0) === 0) {
    fail(`"${definition.name}" must declare syntax or transform`);
  }

  const entry = {
    name: definition.name,
    apiVersion: 1 as const,
    [markdownPluginDefinition]: definition,
  } as unknown as InternalMarkdownPluginEntry<Node>;
  return Object.freeze(entry);
}

export interface PreparedSyntaxContribution {
  readonly pluginName: string;
  readonly display: 'inline' | 'block';
  readonly contribution: MarkdownSyntaxContribution;
}

export interface PreparedTextContribution {
  readonly order: number;
  readonly pluginName: string;
  readonly contribution: MarkdownTextContribution;
}

export interface PreparedTextGuard {
  readonly pattern: RegExp;
  readonly contributions: ReadonlyArray<PreparedTextContribution>;
}

export interface PreparedTextDispatch {
  readonly contributions: ReadonlyArray<PreparedTextContribution>;
  readonly guards: ReadonlyArray<PreparedTextGuard>;
  readonly unguarded: ReadonlyArray<PreparedTextContribution>;
}

export interface PreparedFenceContribution {
  readonly pluginName: string;
  readonly contribution: MarkdownFenceContribution;
}

export interface PreparedAstTransform {
  readonly pluginName: string;
  readonly transform: MarkdownAstTransformer;
}

export interface PreparedMarkdownPlugins {
  readonly entries: ReadonlyArray<InternalMarkdownPluginEntry>;
  readonly syntaxEntries: ReadonlyArray<MarkdownPluginEntry>;
  readonly inlineByFirstCharacter: ReadonlyMap<
    string,
    ReadonlyArray<PreparedSyntaxContribution>
  >;
  readonly blockByFirstCharacter: ReadonlyMap<
    string,
    ReadonlyArray<PreparedSyntaxContribution>
  >;
  readonly text: PreparedTextDispatch;
  readonly fencesByLanguage: ReadonlyMap<
    string,
    ReadonlyArray<PreparedFenceContribution>
  >;
  readonly decorations: ReadonlyArray<MarkdownDecoration>;
  readonly astTransforms: ReadonlyArray<PreparedAstTransform>;
  readonly syntaxIdentity: string;
  readonly renderers: ReadonlyMap<
    string,
    Readonly<Record<string, React.ComponentType<{node: never}>>>
  >;
  readonly toText: ReadonlyMap<string, (node: MarkdownExtensionNode) => string>;
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

function canCombineTextPattern(pattern: RegExp): boolean {
  return (
    !pattern.sticky &&
    !/\\(?:[1-9]|k<)/.test(pattern.source) &&
    !pattern.source.includes('(?<')
  );
}

function prepareTextDispatch(
  contributions: ReadonlyArray<PreparedTextContribution>,
): PreparedTextDispatch {
  const grouped = new Map<string, PreparedTextContribution[]>();
  const unguarded: PreparedTextContribution[] = [];

  for (const prepared of contributions) {
    const pattern = prepared.contribution.pattern;
    if (!canCombineTextPattern(pattern)) {
      unguarded.push(prepared);
      continue;
    }
    const flags = pattern.flags.replace(/[dgy]/g, '');
    appendMapValue(grouped, flags, prepared);
  }

  const guards: PreparedTextGuard[] = [];
  for (const [flags, groupedContributions] of grouped) {
    try {
      guards.push({
        pattern: new RegExp(
          groupedContributions
            .map(prepared => `(?:${prepared.contribution.pattern.source})`)
            .join('|'),
          flags,
        ),
        contributions: groupedContributions,
      });
    } catch {
      // Keep unusual regular expressions on the fully compatible path rather
      // than weakening their semantics to make a shared prefilter.
      unguarded.push(...groupedContributions);
    }
  }

  return {contributions, guards, unguarded};
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
  const text: PreparedTextContribution[] = [];
  const fencesByLanguage = new Map<string, PreparedFenceContribution[]>();
  const decorations: MarkdownDecoration[] = [];
  const astTransforms: PreparedAstTransform[] = [];
  const renderers = new Map<
    string,
    Readonly<Record<string, React.ComponentType<{node: never}>>>
  >();
  const toText = new Map<string, (node: MarkdownExtensionNode) => string>();
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

    for (const publicTransform of definition.transform ?? []) {
      const transform = publicTransform as InternalMarkdownTransform;
      const transformDefinition = transform[markdownTransformDefinition];
      switch (transformDefinition.kind) {
        case 'text':
          text.push({
            order: text.length,
            pluginName: definition.name,
            contribution: transformDefinition.value,
          });
          break;
        case 'fence':
          for (const language of transformDefinition.value.languages) {
            appendMapValue(fencesByLanguage, normalizeLanguage(language), {
              pluginName: definition.name,
              contribution: transformDefinition.value,
            });
          }
          break;
        case 'decoration':
          decorations.push(transformDefinition.value);
          break;
        case 'ast':
          astTransforms.push({
            pluginName: definition.name,
            transform: transformDefinition.value,
          });
          break;
      }
    }

    if ('syntax' in definition && definition.syntax != null) {
      syntaxEntries.push(publicEntry);
      syntaxIdentity.push(
        `${definition.name}\u0000${definition.apiVersion}\u0000${definition.parseKey}`,
      );
      renderers.set(
        definition.name,
        definition.renderers as Readonly<
          Record<string, React.ComponentType<{node: never}>>
        >,
      );
      if (definition.syntax.toText != null) {
        toText.set(
          definition.name,
          definition.syntax.toText as (node: MarkdownExtensionNode) => string,
        );
      }
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
    text: prepareTextDispatch(text),
    fencesByLanguage,
    decorations,
    astTransforms,
    syntaxIdentity: syntaxIdentity.join('\u0001'),
    renderers,
    toText,
  };
  preparedPluginLists.set(plugins, prepared);
  return prepared;
}

const MARKDOWN_AST_NODE_TYPES = new Set([
  'root',
  'heading',
  'paragraph',
  'text',
  'bold',
  'italic',
  'strikethrough',
  'code',
  'codeblock',
  'blockquote',
  'list',
  'link',
  'image',
  'citation',
  'break',
  'table',
  'hr',
  'math',
  'extension',
]);

function isValidMarkdownAstValue(
  value: unknown,
  pluginNames: ReadonlySet<string>,
  seen: Set<object> = new Set(),
): boolean {
  if (
    value == null ||
    typeof value === 'undefined' ||
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
    const valid = value.every(item =>
      isValidMarkdownAstValue(item, pluginNames, seen),
    );
    seen.delete(value);
    return valid;
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    seen.delete(value);
    return false;
  }
  const node = value as {type?: unknown; plugin?: unknown};
  if (
    node.type != null &&
    (typeof node.type !== 'string' || !MARKDOWN_AST_NODE_TYPES.has(node.type))
  ) {
    seen.delete(value);
    return false;
  }
  if (
    node.type === 'extension' &&
    (typeof node.plugin !== 'string' || !pluginNames.has(node.plugin))
  ) {
    seen.delete(value);
    return false;
  }
  const valid = Object.values(value).every(item =>
    isValidMarkdownAstValue(item, pluginNames, seen),
  );
  seen.delete(value);
  return valid;
}

function freezeMarkdownAst<T>(value: T, seen: Set<object> = new Set()): T {
  if (value == null || typeof value !== 'object' || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const child of Object.values(value)) {
    freezeMarkdownAst(child, seen);
  }
  return Object.freeze(value);
}

/** @internal Apply ordered immutable document transforms to parsed blocks. */
export function applyMarkdownTransforms<
  Node extends MarkdownExtensionNode = MarkdownExtensionNode,
>(
  blocks: ReadonlyArray<BlockNode<Node>>,
  plugins: PreparedMarkdownPlugins | undefined,
  source: string,
  isFinal: boolean,
): BlockNode<Node>[] {
  if (plugins == null || plugins.astTransforms.length === 0) {
    return blocks as BlockNode<Node>[];
  }
  const pluginNames = new Set(plugins.entries.map(entry => entry.name));
  let document = freezeMarkdownAst({
    type: 'root' as const,
    children: [...blocks],
  }) as MarkdownDocument<Node>;
  for (const prepared of plugins.astTransforms) {
    try {
      const next = prepared.transform(document, {source, isFinal}) as unknown;
      if (
        next == null ||
        typeof next !== 'object' ||
        (next as {type?: unknown}).type !== 'root' ||
        !Array.isArray((next as {children?: unknown}).children) ||
        !isValidMarkdownAstValue(next, pluginNames)
      ) {
        throw new Error('transform returned an invalid Markdown document');
      }
      document = freezeMarkdownAst(next) as MarkdownDocument<Node>;
    } catch (error) {
      reportMarkdownPluginFailure(prepared.pluginName, 'transform', error);
    }
  }
  return [...document.children] as BlockNode<Node>[];
}

const stableSyntaxEntries = new Map<
  string,
  ReadonlyArray<MarkdownPluginEntry>
>();
const MAX_STABLE_SYNTAX_IDENTITIES = 100;

/** @internal Reuse parse-equivalent syntax entries across recreated plugin lists. */
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

const pluginListRenderStates = new WeakMap<
  object,
  {readonly key: string; readonly list: ReadonlyArray<MarkdownPluginEntry>}
>();

/** @internal Warn when equivalent inline lists repeatedly defeat preparation reuse. */
export function warnForUnstableMarkdownPluginList(
  owner: object,
  list: ReadonlyArray<MarkdownPluginEntry> | undefined,
  prepared: PreparedMarkdownPlugins | undefined,
): void {
  if (list == null || prepared == null) {
    return;
  }
  const key = `${prepared.entries
    .map(entry => `${entry.name}\u0000${entry.apiVersion}`)
    .join('\u0001')}\u0002${prepared.syntaxIdentity}`;
  const previous = pluginListRenderStates.get(owner);
  if (previous?.list !== list && previous?.key === key) {
    warnOnce(
      `markdown-plugin-list:${key}`,
      'Markdown',
      'plugins was recreated with the same logical entries; keep the list stable to reuse plugin preparation.',
    );
  }
  pluginListRenderStates.set(owner, {key, list});
}

const warnedFailures = new Set<string>();

/** @internal Development-only diagnostics without authored source content. */
export function reportMarkdownPluginFailure(
  pluginName: string,
  capability: string,
  error: unknown,
): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  const key = `${pluginName}:${capability}`;
  if (warnedFailures.has(key)) {
    return;
  }
  warnedFailures.add(key);
  warnOnce(
    `markdown-plugin:${key}`,
    'Markdown',
    `plugin "${pluginName}" failed in ${capability}; rendered source fallback.`,
    error,
  );
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
  const valid = Array.isArray(value)
    ? value.every(item => isMarkdownPluginData(item, seen))
    : Object.getPrototypeOf(value) === Object.prototype &&
      Object.values(value).every(item => isMarkdownPluginData(item, seen));
  seen.delete(value);
  return valid;
}

export function freezeMarkdownPluginData(
  value: MarkdownPluginData,
): MarkdownPluginData {
  if (Array.isArray(value)) {
    return Object.freeze(value.map(item => freezeMarkdownPluginData(item)));
  }
  if (value != null && typeof value === 'object') {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          freezeMarkdownPluginData(item),
        ]),
      ),
    );
  }
  return value;
}

export interface MarkdownFenceMetadata {
  readonly meta: string | undefined;
  readonly closed: boolean;
  readonly isFinal: boolean;
}

const fenceMetadata = new WeakMap<object, MarkdownFenceMetadata>();

/** @internal Attach parser-owned fence state without widening the public node. */
export function setMarkdownFenceMetadata(
  node: object,
  metadata: MarkdownFenceMetadata,
): void {
  fenceMetadata.set(node, metadata);
}

/** @internal Read parser-owned fence state during semantic fence resolution. */
export function getMarkdownFenceMetadata(
  node: object,
): MarkdownFenceMetadata | undefined {
  return fenceMetadata.get(node);
}
