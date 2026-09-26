// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it, vi} from 'vitest';
import {parseMarkdownAst} from './parser';
import {createMarkdownPlugin} from './plugins/protocol';

const source = 'Body[^note].\n\n[^note]: Definition.';

function visibleJson(value: unknown): string {
  return JSON.stringify(value);
}

describe('Markdown footnote transform ownership', () => {
  it('allows transforms to move or remove Core footnotes and edit definition descendants', () => {
    const transform = createMarkdownPlugin({
      name: 'valid-footnote-transform',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: [...root.children].reverse().map(block =>
            block.type === 'footnoteDefinition'
              ? {
                  ...block,
                  children: block.children.map(definitionBlock =>
                    definitionBlock.type === 'paragraph'
                      ? {
                          ...definitionBlock,
                          children: definitionBlock.children.map(node =>
                            node.type === 'text'
                              ? {...node, value: node.value.toUpperCase()}
                              : node,
                          ),
                        }
                      : definitionBlock,
                  ),
                }
              : block,
          ),
        };
      },
    });

    const result = parseMarkdownAst(source, {
      footnotes: 'github',
      plugins: [transform],
    });
    expect(result.children.map(node => node.type)).toEqual([
      'footnoteDefinition',
      'paragraph',
    ]);
    expect(visibleJson(result)).toContain('DEFINITION.');

    const removeDefinition = createMarkdownPlugin({
      name: 'remove-footnote-definition',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: root.children.filter(
            block => block.type !== 'footnoteDefinition',
          ),
        };
      },
    });
    expect(
      parseMarkdownAst(source, {
        footnotes: 'github',
        plugins: [removeDefinition],
      }).children.map(node => node.type),
    ).toEqual(['paragraph']);
  });

  it('rejects minted, duplicated, retyped, or relabelled Core footnotes', () => {
    const baseline = visibleJson(
      parseMarkdownAst(source, {footnotes: 'github'}),
    );
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const invalidTransforms = [
      createMarkdownPlugin({
        name: 'mint-footnote',
        apiVersion: 1,
        transform(root) {
          return {
            ...root,
            children: root.children.map(block =>
              block.type === 'paragraph'
                ? {
                    ...block,
                    children: [
                      ...block.children,
                      {
                        type: 'footnoteReference' as const,
                        identifier: 'note',
                        label: 'note',
                      },
                    ],
                  }
                : block,
            ),
          };
        },
      }),
      createMarkdownPlugin({
        name: 'duplicate-footnote',
        apiVersion: 1,
        transform(root) {
          return {
            ...root,
            children: root.children.map(block =>
              block.type === 'paragraph'
                ? {...block, children: [...block.children, ...block.children]}
                : block,
            ),
          };
        },
      }),
      createMarkdownPlugin({
        name: 'retype-footnote',
        apiVersion: 1,
        transform(root) {
          return {
            ...root,
            children: root.children.map(block =>
              block.type === 'paragraph'
                ? {
                    ...block,
                    children: block.children.map(node =>
                      node.type === 'footnoteReference'
                        ? {...node, type: 'text', value: '[^note]'}
                        : node,
                    ),
                  }
                : block,
            ),
          } as never;
        },
      }),
      createMarkdownPlugin({
        name: 'relabel-footnote',
        apiVersion: 1,
        transform(root) {
          return {
            ...root,
            children: root.children.map(block =>
              block.type === 'footnoteDefinition'
                ? {...block, identifier: 'other', label: 'other'}
                : block,
            ),
          };
        },
      }),
    ];

    try {
      for (const plugin of invalidTransforms) {
        expect(
          visibleJson(
            parseMarkdownAst(source, {
              footnotes: 'github',
              plugins: [plugin],
            }),
          ),
        ).toBe(baseline);
      }
    } finally {
      warning.mockRestore();
    }
  });

  it('rejects definitions outside the root and references inside links or definitions', () => {
    const baseline = visibleJson(
      parseMarkdownAst(source, {footnotes: 'github'}),
    );
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const nestDefinition = createMarkdownPlugin({
      name: 'nest-footnote-definition',
      apiVersion: 1,
      transform(root) {
        const definition = root.children.find(
          block => block.type === 'footnoteDefinition',
        );
        return definition == null
          ? root
          : {
              ...root,
              children: [
                ...root.children.filter(block => block !== definition),
                {
                  type: 'blockquote' as const,
                  children: [definition],
                },
              ],
            };
      },
    });
    const nestReference = createMarkdownPlugin({
      name: 'nest-footnote-reference',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: root.children.map(block => {
            if (block.type !== 'paragraph') {
              return block;
            }
            return {
              ...block,
              children: [
                {
                  type: 'link' as const,
                  url: '/target',
                  children: block.children,
                },
              ],
            };
          }),
        };
      },
    });

    try {
      for (const plugin of [nestDefinition, nestReference]) {
        expect(
          visibleJson(
            parseMarkdownAst(source, {
              footnotes: 'github',
              plugins: [plugin],
            }),
          ),
        ).toBe(baseline);
      }
    } finally {
      warning.mockRestore();
    }
  });
});
