// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ast.ts
 * @input Parsed Markdown structure and optional Astryx extension nodes
 * @output Canonical immutable MDAST-aligned Markdown node types and text projection
 * @position Internal canonical Markdown tree shared by parsing, rendering, and Outline
 */

export interface MarkdownAstPoint {
  readonly line?: number;
  readonly column?: number;
  readonly offset?: number;
}

export interface MarkdownAstPosition {
  readonly start: MarkdownAstPoint;
  readonly end: MarkdownAstPoint;
}

export interface MarkdownAstNodeBase {
  readonly position?: MarkdownAstPosition;
}

export interface MarkdownAstExtensionNode<
  Plugin extends string = string,
  Name extends string = string,
  Data = Readonly<Record<string, unknown>>,
  Display extends 'inline' | 'block' = 'inline' | 'block',
> extends MarkdownAstNodeBase {
  readonly type: 'extension';
  readonly plugin: Plugin;
  readonly name: Name;
  readonly data: Data;
  readonly display: Display;
  readonly source?: string;
}

export interface MarkdownAstText extends MarkdownAstNodeBase {
  readonly type: 'text';
  readonly value: string;
}

export interface MarkdownAstParent<
  Type extends 'strong' | 'emphasis' | 'delete',
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: Type;
  readonly children: ReadonlyArray<MarkdownAstPhrasingContent<Extension>>;
}

export interface MarkdownAstInlineCode extends MarkdownAstNodeBase {
  readonly type: 'inlineCode';
  readonly value: string;
}

export interface MarkdownAstInlineMath extends MarkdownAstNodeBase {
  readonly type: 'inlineMath';
  readonly value: string;
}

export interface MarkdownAstLink<
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: 'link';
  readonly url: string;
  readonly children: ReadonlyArray<MarkdownAstPhrasingContent<Extension>>;
}

export interface MarkdownAstImage extends MarkdownAstNodeBase {
  readonly type: 'image';
  readonly url: string;
  readonly alt: string;
}

export interface MarkdownAstCitation extends MarkdownAstNodeBase {
  readonly type: 'citation';
  readonly sourceId: string;
}

export interface MarkdownAstBreak extends MarkdownAstNodeBase {
  readonly type: 'break';
}

export type MarkdownAstPhrasingContent<
  Extension extends MarkdownAstExtensionNode = never,
> =
  | MarkdownAstText
  | MarkdownAstParent<'strong', Extension>
  | MarkdownAstParent<'emphasis', Extension>
  | MarkdownAstParent<'delete', Extension>
  | MarkdownAstInlineCode
  | MarkdownAstInlineMath
  | MarkdownAstLink<Extension>
  | MarkdownAstImage
  | MarkdownAstCitation
  | MarkdownAstBreak
  | (Extension & {readonly display: 'inline'});

export interface MarkdownAstHeading<
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: 'heading';
  readonly depth: 1 | 2 | 3 | 4 | 5 | 6;
  readonly children: ReadonlyArray<MarkdownAstPhrasingContent<Extension>>;
}

export interface MarkdownAstParagraph<
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: 'paragraph';
  readonly children: ReadonlyArray<MarkdownAstPhrasingContent<Extension>>;
}

export interface MarkdownAstCode extends MarkdownAstNodeBase {
  readonly type: 'code';
  readonly lang: string | null;
  readonly value: string;
}

export interface MarkdownAstMath extends MarkdownAstNodeBase {
  readonly type: 'math';
  readonly value: string;
}

export interface MarkdownAstBlockquote<
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: 'blockquote';
  readonly children: ReadonlyArray<MarkdownAstBlockContent<Extension>>;
}

export interface MarkdownAstListItem<
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: 'listItem';
  readonly checked?: boolean;
  readonly children: ReadonlyArray<MarkdownAstBlockContent<Extension>>;
}

export interface MarkdownAstList<
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: 'list';
  readonly ordered: boolean;
  readonly start?: number;
  readonly spread?: boolean;
  /** Astryx-preserved ordered-list marker delimiter. */
  readonly delimiter?: '.' | ')';
  readonly children: ReadonlyArray<MarkdownAstListItem<Extension>>;
}

export type MarkdownAstTableAlignment = 'left' | 'center' | 'right' | null;

export interface MarkdownAstTableCell<
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: 'tableCell';
  readonly children: ReadonlyArray<MarkdownAstPhrasingContent<Extension>>;
}

export interface MarkdownAstTableRow<
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: 'tableRow';
  readonly children: ReadonlyArray<MarkdownAstTableCell<Extension>>;
}

export interface MarkdownAstTable<
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: 'table';
  readonly align: ReadonlyArray<MarkdownAstTableAlignment>;
  readonly children: ReadonlyArray<MarkdownAstTableRow<Extension>>;
}

export interface MarkdownAstThematicBreak extends MarkdownAstNodeBase {
  readonly type: 'thematicBreak';
}

export type MarkdownAstBlockContent<
  Extension extends MarkdownAstExtensionNode = never,
> =
  | MarkdownAstHeading<Extension>
  | MarkdownAstParagraph<Extension>
  | MarkdownAstCode
  | MarkdownAstMath
  | MarkdownAstBlockquote<Extension>
  | MarkdownAstList<Extension>
  | MarkdownAstTable<Extension>
  | MarkdownAstThematicBreak
  | MarkdownAstImage
  | (Extension & {readonly display: 'block'});

export interface MarkdownAstRoot<
  Extension extends MarkdownAstExtensionNode = never,
> extends MarkdownAstNodeBase {
  readonly type: 'root';
  readonly children: ReadonlyArray<MarkdownAstBlockContent<Extension>>;
}

export function markdownAstText(
  nodes: ReadonlyArray<MarkdownAstPhrasingContent>,
): string {
  let text = '';
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
      case 'inlineCode':
      case 'inlineMath':
        text += node.value;
        break;
      case 'strong':
      case 'emphasis':
      case 'delete':
      case 'link':
        text += markdownAstText(node.children);
        break;
      case 'image':
        text += node.alt;
        break;
      case 'citation':
      case 'break':
        break;
      default: {
        node satisfies never;
      }
    }
  }
  return text;
}
