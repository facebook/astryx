// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file preparedDocument.public.test.ts
 * @input Imports the documented prepared-document and Outline package subpaths
 * @output Runtime and type evidence for one-parse Markdown/Outline composition
 * @position Public package-contract test for @astryxdesign/core/Markdown/document
 */

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, expectTypeOf, it} from 'vitest';
import {prepareMarkdownDocument} from '@astryxdesign/core/Markdown/document';
import type {PreparedMarkdownDocument} from '@astryxdesign/core/Markdown/document';
import type {OutlineProps} from '@astryxdesign/core/Outline';

describe('@astryxdesign/core/Markdown/document', () => {
  it('is a server-safe public package subpath', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'packages/core/package.json'), 'utf8'),
    ) as {exports: Record<string, unknown>};
    const entrySources = [
      'packages/core/src/Markdown/document/index.ts',
      'packages/core/src/Markdown/preparedDocument.ts',
      'packages/core/src/Markdown/headingProjection.ts',
      'packages/core/src/Markdown/footnoteProjection.ts',
    ].map(path => readFileSync(join(process.cwd(), path), 'utf8'));

    expect(packageJson.exports['./Markdown/document']).toEqual({
      source: './src/Markdown/document/index.ts',
      types: './dist/Markdown/document/index.d.ts',
      default: './dist/Markdown/document/index.js',
    });
    for (const entrySource of entrySources) {
      expect(entrySource).not.toMatch(/^\s*['"]use client['"]/m);
    }
  });

  it('prepares canonical content and matching Outline items', () => {
    const document = prepareMarkdownDocument('# Café\n\nBody');

    expect(document.root).toMatchObject({
      type: 'root',
      children: [{type: 'heading', depth: 1}, {type: 'paragraph'}],
    });
    expect(document.outline).toEqual([{id: 'café', label: 'Café', level: 1}]);
    expectTypeOf(document).toEqualTypeOf<PreparedMarkdownDocument>();
    expectTypeOf(document.outline).toMatchTypeOf<OutlineProps['items']>();
  });

  it('captures explicit footnote syntax and matching heading identity once', () => {
    const document = prepareMarkdownDocument(
      '# Notes[^detail]\n\nBody[^detail].\n\n[^detail]: Definition.',
      {footnotes: 'github'},
    );

    expect(document.root.children.map(node => node.type)).toEqual([
      'heading',
      'paragraph',
      'footnoteDefinition',
    ]);
    expect(document.outline).toEqual([{id: 'notes', label: 'Notes', level: 1}]);
  });

  it('cannot be structurally forged', () => {
    function compileOnlyGuard() {
      // @ts-expect-error prepared documents carry an opaque Core-owned brand
      const forged: PreparedMarkdownDocument = {
        source: '',
        root: {type: 'root', children: []},
        outline: [],
      };
      return forged;
    }

    expectTypeOf(compileOnlyGuard).toBeFunction();
  });
});
