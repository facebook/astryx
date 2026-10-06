// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownExtensionNode.ts
 * @input Uses lexical (DecoratorNode, node serialization, text formats).
 * @output Exports RichTextExtensionNode, the editor node for one Markdown
 *   plugin node, with $createRichTextExtensionNode and
 *   $isRichTextExtensionNode.
 * @position Registered with every RichText surface and serializer
 *   (editorNodes.ts), so stored state holding plugin nodes always loads. A
 *   node is atomic — the editor cannot type into it — and keeps the exact
 *   source it was read from, which is what it exports (spec:AST-064 FR7,
 *   FR10). Stored state keeps that source, the plugin's name and protocol
 *   version, the data the plugin derived for rendering (FR11), and the text
 *   formats the node sits inside, so a node inside emphasis, strong, or
 *   strikethrough stays inside it. Imports no React.
 */

import {
  DecoratorNode,
  TEXT_TYPE_TO_FORMAT,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
  type TextFormatType,
} from 'lexical';
import type {MarkdownPluginData} from '@astryxdesign/core/Markdown/plugins';

/** What one plugin node is: the parsed node's identity, data, and source. */
export interface RichTextExtensionNodeFacts {
  readonly plugin: string;
  readonly apiVersion: number;
  readonly name: string;
  readonly display: 'inline' | 'block';
  readonly data: MarkdownPluginData;
  readonly source: string;
}

export type SerializedRichTextExtensionNode = Spread<
  RichTextExtensionNodeFacts & {
    /** The text formats the node sits inside, as a text node's format bits. */
    readonly format: number;
  },
  SerializedLexicalNode
>;

/** Reads stored facts defensively: a missing field becomes an empty value. */
export function factsFrom(
  value: Record<string, unknown>,
): RichTextExtensionNodeFacts {
  const {plugin, apiVersion, name, display, data, source} = value;
  return {
    plugin: typeof plugin === 'string' ? plugin : '',
    apiVersion: typeof apiVersion === 'number' ? apiVersion : 0,
    name: typeof name === 'string' ? name : '',
    display: display === 'block' ? 'block' : 'inline',
    data: (data ?? null) as MarkdownPluginData,
    source: typeof source === 'string' ? source : '',
  };
}

export class RichTextExtensionNode extends DecoratorNode<unknown> {
  __facts: RichTextExtensionNodeFacts;
  /**
   * The text formats the node sits inside, as a text node's format bits. Only
   * inline nodes carry any.
   */
  __format: number;

  static getType(): string {
    return 'astryx-markdown-extension';
  }

  static clone(node: RichTextExtensionNode): RichTextExtensionNode {
    return new RichTextExtensionNode(node.__facts, node.__format, node.__key);
  }

  static importJSON(
    serialized: SerializedLexicalNode & Record<string, unknown>,
  ): RichTextExtensionNode {
    // Stored state is read defensively, so a damaged node still loads.
    const {format} = serialized;
    return $createRichTextExtensionNode(
      factsFrom(serialized),
      typeof format === 'number' ? format : 0,
    ).updateFromJSON(serialized);
  }

  constructor(facts: RichTextExtensionNodeFacts, format = 0, key?: NodeKey) {
    super(key);
    this.__facts = facts;
    this.__format = facts.display === 'inline' ? format : 0;
  }

  exportJSON(): SerializedRichTextExtensionNode {
    const latest = this.getLatest();
    return {
      ...super.exportJSON(),
      ...latest.__facts,
      format: latest.__format,
    };
  }

  /** The node's identity, data, and source. */
  getFacts(): RichTextExtensionNodeFacts {
    return this.getLatest().__facts;
  }

  /** The exact Markdown the node was read from. */
  getSource(): string {
    return this.getLatest().__facts.source;
  }

  /** The text formats the node sits inside, as a text node's format bits. */
  getFormat(): number {
    return this.getLatest().__format;
  }

  hasFormat(type: TextFormatType): boolean {
    return (this.getFormat() & TEXT_TYPE_TO_FORMAT[type]) !== 0;
  }

  /** Puts the node inside, or takes it out of, one text format. */
  setFormatFlag(type: TextFormatType, isOn: boolean): this {
    const writable = this.getWritable();
    const flag = TEXT_TYPE_TO_FORMAT[type];
    writable.__format = isOn
      ? writable.__format | flag
      : writable.__format & ~flag;
    return writable;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement(
      this.__facts.display === 'block' ? 'div' : 'span',
    );
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return this.__facts.display === 'inline';
  }

  /** The node's text is its source, so plain-text copies and search see it. */
  getTextContent(): string {
    return this.getLatest().__facts.source;
  }

  /** Until a surface draws plugin nodes, a node shows its source. */
  decorate(): unknown {
    return this.__facts.source;
  }
}

export function $createRichTextExtensionNode(
  facts: RichTextExtensionNodeFacts,
  format = 0,
): RichTextExtensionNode {
  return new RichTextExtensionNode(facts, format);
}

export function $isRichTextExtensionNode(
  node: LexicalNode | null | undefined,
): node is RichTextExtensionNode {
  return node instanceof RichTextExtensionNode;
}
