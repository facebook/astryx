// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Every shipped topic compiles to a plain-JSON node: a node read back
 * from JSON validates and answers every docs read exactly as the live one does.
 */

import {describe, expect, it} from 'vitest';
import {parseCompiledReferenceNode} from '../../foundation/doc-compiler/ir.mjs';
import {detailView, indexView} from '../../foundation/doc-compiler/lenses.mjs';
import {compileTopic, loadDocsCatalog, overlayLanguages} from './_adapter.mjs';

const SLOW = 60_000;

describe('every shipped topic compiles to plain JSON', () => {
  it(
    'survives a JSON round trip with identical responses in every language',
    async () => {
      const catalog = await loadDocsCatalog();
      let compiled = 0;
      for (const entry of catalog.entries()) {
        for (const lang of [null, ...overlayLanguages(entry)]) {
          const node = await compileTopic(catalog, entry, lang);
          const copy = parseCompiledReferenceNode(
            JSON.parse(JSON.stringify(node)),
          );
          expect(JSON.stringify(detailView(copy))).toBe(
            JSON.stringify(detailView(node)),
          );
          expect(JSON.stringify(indexView(copy))).toBe(
            JSON.stringify(indexView(node)),
          );
          compiled += 1;
        }
      }
      expect(compiled).toBeGreaterThan(catalog.entries().length);
    },
    SLOW,
  );
});
