// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file semanticFence.ts
 * @input Declared fenced-code languages and typed extension-node factories
 * @output Immutable Markdown transform that annotates eligible canonical code nodes
 * @position Optional helper layer compiled onto the core transform protocol
 */

import type {MarkdownAstBlockContent, MarkdownAstCode} from './ast';
import {
  freezeMarkdownPluginData,
  getMarkdownTransformPluginName,
  isMarkdownPluginData,
  markMarkdownTransformClaim,
  type MarkdownExtensionNode,
  type MarkdownPluginData,
  type MarkdownTransform,
  type MarkdownTransformContext,
} from './plugins';

export interface MarkdownFenceContext<Language extends string> {
  readonly code: string;
  readonly language: Language;
  readonly meta?: string;
}

export type MarkdownFenceNode<Node extends MarkdownExtensionNode> = Node & {
  readonly type: 'extension';
  readonly display: 'block';
  readonly position?: never;
  readonly source?: never;
};

export interface MarkdownFenceTransformOptions<
  Languages extends readonly [string, ...string[]],
  Node extends MarkdownExtensionNode<
    string,
    string,
    MarkdownPluginData,
    'block'
  >,
> {
  /** Exact, case-sensitive fenced-code language identifiers this helper owns. */
  readonly languages: Languages;
  /**
   * Creates typed semantic data for an eligible fence. Return null or undefined
   * to retain Markdown's ordinary CodeBlock rendering.
   */
  readonly createNode: (
    context: MarkdownFenceContext<Languages[number]>,
  ) => MarkdownFenceNode<Node> | null | undefined;
}

interface MarkdownFenceProposal {
  readonly node: MarkdownExtensionNode<
    string,
    string,
    MarkdownPluginData,
    'block'
  >;
}

const markdownFenceProposal = Symbol('MarkdownFenceProposal');

type FenceCode = MarkdownAstCode & {
  readonly [markdownFenceProposal]?: MarkdownFenceProposal;
};

/** @internal Returns the first transform-owned proposal attached to a code node. */
export function getMarkdownFenceProposal(
  node: MarkdownAstCode,
): MarkdownFenceProposal | undefined {
  return (node as FenceCode)[markdownFenceProposal];
}

function clonePluginData<Data extends MarkdownPluginData>(value: Data): Data {
  if (value == null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    const clone: MarkdownPluginData[] = [];
    for (const item of value) {
      clone.push(clonePluginData(item));
    }
    return clone as unknown as Data;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      key,
      clonePluginData(nested),
    ]),
  ) as Data;
}

function sameItems<T>(
  left: ReadonlyArray<T>,
  right: ReadonlyArray<T>,
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function createProposal(
  node: MarkdownFenceNode<
    MarkdownExtensionNode<string, string, MarkdownPluginData, 'block'>
  >,
  pluginName: string,
): MarkdownFenceProposal {
  if (
    node == null ||
    typeof node !== 'object' ||
    node.type !== 'extension' ||
    node.plugin !== pluginName ||
    typeof node.name !== 'string' ||
    node.name.trim() === '' ||
    node.display !== 'block' ||
    !isMarkdownPluginData(node.data) ||
    'source' in node ||
    'position' in node
  ) {
    throw new TypeError(
      'Markdown fence createNode must return an owned block extension node with finite data',
    );
  }

  return Object.freeze({
    node: Object.freeze({
      type: 'extension' as const,
      plugin: node.plugin,
      name: node.name,
      display: 'block' as const,
      data: freezeMarkdownPluginData(clonePluginData(node.data)),
    }),
  });
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value != null &&
    typeof value === 'object' &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

function consumeInvalidAsyncNode(
  value: PromiseLike<unknown>,
  report: (message: string) => void,
): void {
  void Promise.resolve(value).then(
    () => report('Markdown fence createNode returned a Promise'),
    () => report('Markdown fence createNode Promise rejected'),
  );
}

function annotateCode(
  node: MarkdownAstCode,
  languages: ReadonlySet<string>,
  pluginName: string,
  createNode: (
    context: MarkdownFenceContext<string>,
  ) =>
    | MarkdownFenceNode<
        MarkdownExtensionNode<string, string, MarkdownPluginData, 'block'>
      >
    | null
    | undefined,
  report: (message: string) => void,
): MarkdownAstCode {
  if (
    node.lang == null ||
    !languages.has(node.lang) ||
    getMarkdownFenceProposal(node) != null
  ) {
    return node;
  }

  const proposalNode = createNode(
    Object.freeze({
      code: node.value,
      language: node.lang,
      ...(node.meta == null ? {} : {meta: node.meta}),
    }),
  );
  if (isPromiseLike(proposalNode)) {
    consumeInvalidAsyncNode(proposalNode, report);
    throw new TypeError('Markdown fence createNode must be synchronous');
  }
  if (proposalNode == null) {
    return node;
  }

  const annotated = {...node};
  Object.defineProperty(annotated, markdownFenceProposal, {
    configurable: false,
    enumerable: true,
    value: createProposal(proposalNode, pluginName),
    writable: false,
  });
  return annotated;
}

function transformBlocks(
  blocks: ReadonlyArray<MarkdownAstBlockContent<MarkdownExtensionNode>>,
  languages: ReadonlySet<string>,
  pluginName: string,
  createNode: (
    context: MarkdownFenceContext<string>,
  ) =>
    | MarkdownFenceNode<
        MarkdownExtensionNode<string, string, MarkdownPluginData, 'block'>
      >
    | null
    | undefined,
  report: (message: string) => void,
): ReadonlyArray<MarkdownAstBlockContent<MarkdownExtensionNode>> {
  const next = blocks.map(block => {
    switch (block.type) {
      case 'code':
        return annotateCode(block, languages, pluginName, createNode, report);
      case 'blockquote': {
        const children = transformBlocks(
          block.children,
          languages,
          pluginName,
          createNode,
          report,
        );
        return children === block.children ? block : {...block, children};
      }
      case 'list': {
        let changed = false;
        const children = block.children.map(item => {
          const itemChildren = transformBlocks(
            item.children,
            languages,
            pluginName,
            createNode,
            report,
          );
          if (itemChildren === item.children) {
            return item;
          }
          changed = true;
          return {...item, children: itemChildren};
        });
        return changed ? {...block, children} : block;
      }
      case 'heading':
      case 'paragraph':
      case 'math':
      case 'table':
      case 'thematicBreak':
      case 'image':
      case 'extension':
        return block;
    }
  });
  return sameItems(blocks, next) ? blocks : next;
}

export function createMarkdownFenceTransform<
  const Languages extends readonly [string, ...string[]],
  const Node extends MarkdownExtensionNode<
    string,
    string,
    MarkdownPluginData,
    'block'
  >,
>(
  options: MarkdownFenceTransformOptions<Languages, Node>,
): MarkdownTransform<Node> {
  if (
    !Array.isArray(options.languages) ||
    options.languages.length === 0 ||
    options.languages.some(
      language => typeof language !== 'string' || language.trim() === '',
    )
  ) {
    throw new TypeError('Markdown fence languages must be non-empty strings');
  }
  if (new Set(options.languages).size !== options.languages.length) {
    throw new TypeError('Markdown fence languages must be unique');
  }
  if (typeof options.createNode !== 'function') {
    throw new TypeError('Markdown fence createNode must be a function');
  }

  const declaredLanguages = Object.freeze([...options.languages]);
  const languages = new Set<string>(declaredLanguages);
  const createNode = options.createNode as (
    context: MarkdownFenceContext<string>,
  ) =>
    | MarkdownFenceNode<
        MarkdownExtensionNode<string, string, MarkdownPluginData, 'block'>
      >
    | null
    | undefined;
  const transform: MarkdownTransform<Node> = (
    root,
    context: MarkdownTransformContext,
  ) => {
    const pluginName = getMarkdownTransformPluginName(context);
    if (pluginName == null) {
      throw new TypeError(
        'Markdown fence transforms must run through createMarkdownPlugin',
      );
    }
    const children = transformBlocks(
      root.children,
      languages,
      pluginName,
      createNode,
      context.report,
    );
    return children === root.children ? root : {...root, children};
  };

  return markMarkdownTransformClaim(transform, source =>
    declaredLanguages.some(
      language =>
        source.includes(`\`\`\`${language}`) ||
        source.includes(`~~~${language}`),
    ),
  );
}
