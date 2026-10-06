// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownCharacterReferences.ts
 * @input Uses @lexical/markdown (TextMatchTransformer) and core Markdown's
 *   decodeMarkdownCharacterReferences.
 * @output Exports CHARACTER_REFERENCE, the transformer that imports `&copy;`,
 *   `&#169;`, and `&#xA9;` in text as the characters they name.
 * @position Part of DEFAULT_TRANSFORMERS (markdownTable.ts). It decodes with
 *   the one decoder core Markdown renders with (spec:AST-061 FR7, DEC-5), so a
 *   reference reads the same on every surface. Lexical never runs text
 *   transformers inside code, so code keeps references literal. A reference
 *   after an unescaped backslash, or one that is not valid, stays literal: its
 *   `&` goes in a text node of its own, because Lexical's own import decodes
 *   any `&#digits;` left in a text node — escaped or not — and throws on a
 *   number past Unicode. On export, regenerated text escapes an `&` that would
 *   read as a reference (markdownSource.ts), so decoded text reads back the
 *   same.
 */

import type {TextMatchTransformer} from '@lexical/markdown';
import {decodeMarkdownCharacterReferences} from '@astryxdesign/core/Markdown/parser';

export const CHARACTER_REFERENCE: TextMatchTransformer = {
  dependencies: [],
  // Text exports as text; markdownSource.ts escapes it.
  export: () => null,
  // A reference, or what looks like one, with the backslash that escapes it:
  // only an `&` after an even number of backslashes can start a reference.
  importRegExp:
    /(?<=(?:^|[^\\])(?:\\\\)*)\\?&(?:#[xX][0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/,
  // Import only: typing a reference leaves it as typed.
  regExp: /(?!)/,
  replace: (textNode, match) => {
    const escaped = match[0].startsWith('\\');
    const reference = escaped ? match[0].slice(1) : match[0];
    const decoded = escaped
      ? reference
      : decodeMarkdownCharacterReferences(reference);
    textNode.setTextContent(decoded);
    if (decoded === reference) {
      // Literal: out of reach of Lexical's per-node numeric decoding.
      textNode.splitText(1);
    }
  },
  type: 'text-match',
};
