// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-core-internal-import.js
 * @description Keeps Core's internal subpaths (`@astryxdesign/core/internal/*`)
 * inside Astryx's own packages.
 *
 * Core exports a few undocumented modules under `./internal/<name>` so Lab can
 * build on machinery that has no public API of its own (such as the reorder
 * engine behind `createReorderable`). They are reserved for Astryx's own
 * packages and sit outside the compatibility promise (spec:AST-017 FR21):
 * only Core and Lab may import them. The config applies this rule everywhere
 * else (apps, other packages, templates), so an import there is an error.
 *
 *   Banned (outside packages/core and packages/lab):
 *     import {x} from '@astryxdesign/core/internal/reorder';
 *     export {x} from '@astryxdesign/core/internal/reorder';
 *     await import('@astryxdesign/core/internal/reorder');
 *     require('@astryxdesign/core/internal/reorder');
 *     type T = typeof import('@astryxdesign/core/internal/reorder');
 *
 * A custom rule rather than a `no-restricted-imports` block, because flat
 * config overrides a same-named rule per file: a repo-wide block would undo
 * the layer blocks that already use `no-restricted-imports`.
 */

const INTERNAL = /^@astryxdesign\/core\/internal(?:\/|$)/;

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow importing Core's internal subpaths (@astryxdesign/core/internal/*) outside Core and Lab",
    },
    schema: [],
    messages: {
      internal:
        "'{{source}}' is one of Core's internal subpaths, reserved for Astryx's own packages (Core and Lab) and outside the compatibility promise. Use Core's public API instead.",
    },
  },
  create(context) {
    function check(node, source) {
      if (typeof source === 'string' && INTERNAL.test(source)) {
        context.report({node, messageId: 'internal', data: {source}});
      }
    }
    function checkLiteral(node) {
      if (node != null && node.type === 'Literal') {
        check(node, node.value);
      }
    }
    return {
      ImportDeclaration(node) {
        check(node.source, node.source.value);
      },
      ExportNamedDeclaration(node) {
        if (node.source != null) {
          check(node.source, node.source.value);
        }
      },
      ExportAllDeclaration(node) {
        check(node.source, node.source.value);
      },
      ImportExpression(node) {
        checkLiteral(node.source);
      },
      // `require('…')` in CommonJS files.
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments.length > 0
        ) {
          checkLiteral(node.arguments[0]);
        }
      },
      // `typeof import('…')` in TypeScript types. typescript-eslint wraps
      // the specifier in a TSLiteralType.
      TSImportType(node) {
        const argument = node.argument;
        checkLiteral(
          argument != null && argument.type === 'TSLiteralType'
            ? argument.literal
            : argument,
        );
      },
    };
  },
};

export default rule;
