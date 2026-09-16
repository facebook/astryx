// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file textTransform.ts
 * @input Regex selectors and replacement callbacks for eligible Markdown prose
 * @output Immutable Markdown transforms with protected-context traversal
 * @position Optional helper layer compiled onto the core transform protocol
 */

import type {MarkdownAstBlockContent, MarkdownAstPhrasingContent} from '../ast';
import {
  markMarkdownTransformClaim,
  type MarkdownExtensionNode,
  type MarkdownTransform,
} from './protocol';

export interface MarkdownTextTransformContext {
  readonly parentType:
    'heading' | 'paragraph' | 'strong' | 'emphasis' | 'delete' | 'tableCell';
}

export interface MarkdownTextTransformOptions<
  Node extends MarkdownExtensionNode = never,
> {
  /** Global expression matched against eligible built-in prose only. */
  readonly pattern: RegExp;
  /**
   * Literal substrings such that source containing an eligible match contains
   * at least one. Core uses them to skip the transform without walking the AST
   * when none are present. Omit this optimization when no conservative literal
   * exists; the helper will inspect eligible prose on every run. This fast path
   * is also disabled for case-insensitive patterns so JavaScript case folding
   * remains exact.
   */
  readonly requiredSubstrings?: readonly [string, ...string[]];
  /** Optionally decline or extend a regex claim. */
  readonly getEndIndex?: (
    text: string,
    match: RegExpExecArray,
  ) => number | false;
  replace(
    match: RegExpExecArray,
    context: MarkdownTextTransformContext,
  ):
    | MarkdownAstPhrasingContent<Node>
    | ReadonlyArray<MarkdownAstPhrasingContent<Node>>;
}

type AnyExtension = MarkdownExtensionNode;
type Phrasing = MarkdownAstPhrasingContent<AnyExtension>;
type Block = MarkdownAstBlockContent<AnyExtension>;

function sameItems<T>(
  left: ReadonlyArray<T>,
  right: ReadonlyArray<T>,
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function cloneReplacement<T>(value: T, seen = new Map<object, unknown>()): T {
  if (value == null || typeof value !== 'object') {
    return value;
  }
  const cached = seen.get(value);
  if (cached != null) {
    return cached as T;
  }
  if (Array.isArray(value)) {
    const clone: unknown[] = [];
    seen.set(value, clone);
    for (const item of value) {
      clone.push(cloneReplacement(item, seen));
    }
    return clone as T;
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    return value;
  }
  const clone: Record<string, unknown> = {};
  seen.set(value, clone);
  for (const [key, nested] of Object.entries(value)) {
    clone[key] = cloneReplacement(nested, seen);
  }
  return clone as T;
}

function advanceStringIndex(
  value: string,
  index: number,
  unicode: boolean,
): number {
  if (!unicode || index >= value.length) {
    return index + 1;
  }
  const first = value.charCodeAt(index);
  if (first < 0xd800 || first > 0xdbff || index + 1 >= value.length) {
    return index + 1;
  }
  const second = value.charCodeAt(index + 1);
  return second >= 0xdc00 && second <= 0xdfff ? index + 2 : index + 1;
}

function replaceTextNode<Node extends MarkdownExtensionNode>(
  value: string,
  options: MarkdownTextTransformOptions<Node>,
  parentType: MarkdownTextTransformContext['parentType'],
): ReadonlyArray<Phrasing> | null {
  const pattern = new RegExp(options.pattern.source, options.pattern.flags);
  const output: Phrasing[] = [];
  let cursor = 0;
  let changed = false;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) != null) {
    const start = match.index;
    const defaultEnd = start + match[0].length;
    const resolvedEnd = options.getEndIndex?.(value, match) ?? defaultEnd;
    if (resolvedEnd === false) {
      if (match[0].length === 0) {
        pattern.lastIndex = advanceStringIndex(
          value,
          pattern.lastIndex,
          pattern.unicode || pattern.flags.includes('v'),
        );
      }
      continue;
    }
    if (
      !Number.isInteger(resolvedEnd) ||
      resolvedEnd < defaultEnd ||
      resolvedEnd < start ||
      resolvedEnd > value.length
    ) {
      throw new TypeError(
        'Markdown text transform returned an invalid end index',
      );
    }
    if (start < cursor) {
      continue;
    }
    if (start > cursor) {
      output.push({type: 'text', value: value.slice(cursor, start)});
    }
    const replacement = options.replace(match, {parentType});
    const replacements = Array.isArray(replacement)
      ? replacement
      : [replacement];
    for (const replacementNode of replacements) {
      output.push(cloneReplacement(replacementNode));
    }
    cursor = resolvedEnd;
    pattern.lastIndex =
      resolvedEnd === start
        ? advanceStringIndex(
            value,
            pattern.lastIndex,
            pattern.unicode || pattern.flags.includes('v'),
          )
        : Math.max(pattern.lastIndex, resolvedEnd);
    changed = true;
  }

  if (!changed) {
    return null;
  }
  if (cursor < value.length) {
    output.push({type: 'text', value: value.slice(cursor)});
  }
  return output;
}

function transformPhrasing<Node extends MarkdownExtensionNode>(
  children: ReadonlyArray<Phrasing>,
  options: MarkdownTextTransformOptions<Node>,
  parentType: MarkdownTextTransformContext['parentType'],
): ReadonlyArray<Phrasing> {
  const next: Phrasing[] = [];
  for (const node of children) {
    if (node.type === 'text') {
      next.push(
        ...(replaceTextNode(node.value, options, parentType) ?? [node]),
      );
      continue;
    }
    if (
      node.type === 'strong' ||
      node.type === 'emphasis' ||
      node.type === 'delete'
    ) {
      const nested = transformPhrasing(node.children, options, node.type);
      next.push(
        sameItems(node.children, nested) ? node : {...node, children: nested},
      );
      continue;
    }
    // Links, images, code, math, citations, breaks, and accepted extension
    // syntax are protected contexts owned by their existing semantics.
    next.push(node);
  }
  return sameItems(children, next) ? children : next;
}

function transformBlocks<Node extends MarkdownExtensionNode>(
  blocks: ReadonlyArray<Block>,
  options: MarkdownTextTransformOptions<Node>,
): ReadonlyArray<Block> {
  const next = blocks.map(block => {
    switch (block.type) {
      case 'heading':
      case 'paragraph': {
        const children = transformPhrasing(block.children, options, block.type);
        return children === block.children ? block : {...block, children};
      }
      case 'blockquote': {
        const children = transformBlocks(block.children, options);
        return children === block.children ? block : {...block, children};
      }
      case 'list': {
        let changed = false;
        const children = block.children.map(item => {
          const itemChildren = transformBlocks(item.children, options);
          if (itemChildren === item.children) {
            return item;
          }
          changed = true;
          return {...item, children: itemChildren};
        });
        return changed ? {...block, children} : block;
      }
      case 'table': {
        let changed = false;
        const children = block.children.map(row => {
          let rowChanged = false;
          const cells = row.children.map(cell => {
            const cellChildren = transformPhrasing(
              cell.children,
              options,
              'tableCell',
            );
            if (cellChildren === cell.children) {
              return cell;
            }
            rowChanged = true;
            return {...cell, children: cellChildren};
          });
          if (!rowChanged) {
            return row;
          }
          changed = true;
          return {...row, children: cells};
        });
        return changed ? {...block, children} : block;
      }
      case 'code':
      case 'math':
      case 'image':
      case 'thematicBreak':
      case 'extension':
        return block;
    }
  });
  return sameItems(blocks, next) ? blocks : next;
}

export function createMarkdownTextTransform(
  options: MarkdownTextTransformOptions<never>,
): MarkdownTransform<never>;
export function createMarkdownTextTransform<Node extends MarkdownExtensionNode>(
  options: MarkdownTextTransformOptions<Node>,
): MarkdownTransform<Node>;
export function createMarkdownTextTransform(
  options: MarkdownTextTransformOptions<MarkdownExtensionNode>,
): MarkdownTransform<MarkdownExtensionNode> {
  if (!options.pattern.global) {
    throw new TypeError(
      'Markdown text transform patterns must use the global flag',
    );
  }
  if (
    options.requiredSubstrings != null &&
    (!Array.isArray(options.requiredSubstrings) ||
      options.requiredSubstrings.length === 0 ||
      options.requiredSubstrings.some(
        value => typeof value !== 'string' || value === '',
      ))
  ) {
    throw new TypeError(
      'Markdown text transform requiredSubstrings must be non-empty strings',
    );
  }
  const requiredSubstrings =
    options.requiredSubstrings == null
      ? undefined
      : (Object.freeze([...options.requiredSubstrings]) as readonly [
          string,
          ...string[],
        ]);
  const normalizedOptions: MarkdownTextTransformOptions<MarkdownExtensionNode> =
    Object.freeze({
      pattern: new RegExp(options.pattern.source, options.pattern.flags),
      requiredSubstrings,
      getEndIndex: options.getEndIndex,
      replace: options.replace,
    });
  const transform: MarkdownTransform<MarkdownExtensionNode> = root => {
    const children = transformBlocks(root.children, normalizedOptions);
    return children === root.children ? root : {...root, children};
  };
  if (requiredSubstrings == null || options.pattern.ignoreCase) {
    return transform;
  }
  return markMarkdownTransformClaim(transform, source =>
    requiredSubstrings.some(required => source.includes(required)),
  );
}
