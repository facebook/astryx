// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file parser.public.test.ts
 * @input Imports the documented Markdown parser-only package subpath
 * @output Runtime and type evidence for its canonical server-safe contract
 * @position Public package-contract test for @astryxdesign/core/Markdown/parser
 */

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, expectTypeOf, it} from 'vitest';
import {
  createMarkdownFrontmatter,
  createMarkdownPlugin,
} from '@astryxdesign/core/Markdown/plugins';
import {
  createIncrementalState,
  parseInline,
  parseInlineAst,
  parseMarkdown,
  parseMarkdownAst,
  parseMarkdownIncremental,
} from '@astryxdesign/core/Markdown/parser';
import type {
  BlockNode,
  InlineNode,
  MarkdownAstPhrasingContent,
  MarkdownAstRoot,
} from '@astryxdesign/core/Markdown/parser';

describe('@astryxdesign/core/Markdown/parser', () => {
  it('is a generated public package subpath', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'packages/core/package.json'), 'utf8'),
    ) as {
      exports: Record<string, unknown>;
    };
    const entrySources = [
      'packages/core/src/Markdown/parser/index.ts',
      'packages/core/src/Markdown/parser.ts',
      'packages/core/src/Markdown/plugins/index.ts',
      'packages/core/src/Markdown/plugins/protocol.ts',
      'packages/core/src/Markdown/plugins/frontmatter.ts',
    ].map(path => readFileSync(join(process.cwd(), path), 'utf8'));

    expect(packageJson.exports['./Markdown/parser']).toEqual({
      source: './src/Markdown/parser/index.ts',
      types: './dist/Markdown/parser/index.d.ts',
      default: './dist/Markdown/parser/index.js',
    });
    for (const entrySource of entrySources) {
      expect(entrySource).not.toMatch(/^\s*['"]use client['"]/m);
    }
  });

  it('exposes legacy and canonical parser results from a server-only entry point', () => {
    const source = '# Heading\n\nParagraph';
    const blockAst = parseMarkdownAst(source);
    const inlineAst = parseInlineAst('**bold**');

    expect(blockAst).toMatchObject({
      type: 'root',
      children: [{type: 'heading', depth: 1}, {type: 'paragraph'}],
    });
    expect(inlineAst).toMatchObject([{type: 'strong'}]);
    expect(parseMarkdown(source)[0]).toMatchObject({type: 'heading', level: 1});
    expect(parseInline('**bold**')[0]).toMatchObject({type: 'bold'});
    expect(parseMarkdownIncremental(source, createIncrementalState())).toEqual(
      parseMarkdown(source),
    );

    const canonicalBlockAst: MarkdownAstRoot = blockAst;
    const canonicalInlineAst: ReadonlyArray<MarkdownAstPhrasingContent> =
      inlineAst;
    expect(canonicalBlockAst).toBe(blockAst);
    expect(canonicalInlineAst).toBe(inlineAst);
    expectTypeOf(parseMarkdown(source)).toEqualTypeOf<BlockNode[]>();
    expectTypeOf(parseInline('text')).toEqualTypeOf<InlineNode[]>();
  });

  it('runs typed plugins through the server-safe parser boundary', () => {
    const frontmatter = createMarkdownFrontmatter({
      name: 'server-document-metadata',
      parse: fields => ({title: fields.title ?? 'Untitled'}),
    });
    let title: string | undefined;
    const observer = createMarkdownPlugin({
      name: 'server-metadata-observer',
      apiVersion: 1,
      transform(root) {
        title = frontmatter.getMetadata(root)?.title;
        return root;
      },
    });
    const root = parseMarkdownAst('---\ntitle: Server proof\n---\n# Body', {
      plugins: [frontmatter.plugin, observer],
    });

    expect(title).toBe('Server proof');
    expect(root.children).toMatchObject([{type: 'heading', depth: 1}]);
  });
});
