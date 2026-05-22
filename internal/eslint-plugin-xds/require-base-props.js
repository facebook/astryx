// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file require-base-props.js
 * @description ESLint rule enforcing that publicly exported XDS component props
 * interfaces extend XDSBaseProps (directly or via Omit/Pick).
 *
 * XDSBaseProps provides the standard surface area every XDS component should
 * support: xstyle overrides, data-* attributes, aria-* attributes, event
 * handlers, and a curated subset of HTML attributes with footguns removed.
 *
 * Only checks interfaces that are re-exported through the component's barrel
 * index.ts, so internal sub-component props are not flagged.
 */

import {readFileSync} from 'fs';
import {dirname, join} from 'path';

const ALLOWED = new Set([
  // XDSBaseProps is the base type itself
  'XDSBaseProps',
  // SVG components extend SVGProps, not HTMLAttributes
  'XDSIconProps',
  'XDSSVGIconProps',
  // Overlay/layer components — no meaningful root DOM element
  'XDSTooltipProps',
  'XDSPopoverProps',
  'XDSHoverCardProps',
  'XDSOverlayProps',
  // System-managed, not directly rendered by consumers
  'XDSToastProps',
  'XDSToastViewportProps',
  // Provider components — render no DOM element
  'XDSLayerProviderProps',
  'XDSLinkProviderProps',
  'XDSMediaThemeProps',
]);

const barrelCache = new Map();

function getBarrelExports(filePath) {
  const dir = dirname(filePath);
  const barrelPath = join(dir, 'index.ts');

  if (barrelCache.has(barrelPath)) {
    return barrelCache.get(barrelPath);
  }

  let exported = new Set();
  try {
    const content = readFileSync(barrelPath, 'utf-8');
    const typeExportRe = /export\s+(?:type\s+)?{([^}]+)}/g;
    let match;
    while ((match = typeExportRe.exec(content)) !== null) {
      for (const name of match[1].split(',')) {
        const trimmed = name.replace(/\s+as\s+\w+/, '').trim();
        if (trimmed) exported.add(trimmed);
      }
    }
    const reExportRe = /export\s+\*\s+from/g;
    if (reExportRe.test(content)) {
      exported = null;
    }
  } catch {
    exported = new Set();
  }

  barrelCache.set(barrelPath, exported);
  return exported;
}

function isPubliclyExported(name, filePath) {
  const exports = getBarrelExports(filePath);
  // null means wildcard re-export — assume everything is public
  if (exports === null) return true;
  return exports.has(name);
}

function hasXDSBasePropsInHeritage(node) {
  if (!node.extends || node.extends.length === 0) {
    return false;
  }

  for (const heritage of node.extends) {
    const expr = heritage.expression;

    if (expr.type === 'Identifier' && expr.name === 'XDSBaseProps') {
      return true;
    }

    if (
      expr.type === 'Identifier' &&
      (expr.name === 'Omit' || expr.name === 'Pick')
    ) {
      const typeParams = heritage.typeArguments?.params;
      if (typeParams && typeParams.length > 0) {
        const firstParam = typeParams[0];
        if (firstParam.type === 'TSTypeReference') {
          const innerName = firstParam.typeName?.name;
          if (
            innerName === 'XDSBaseProps' ||
            (innerName?.startsWith('XDS') && innerName?.endsWith('Props'))
          ) {
            return true;
          }
        }
      }
    }

    if (
      expr.type === 'Identifier' &&
      expr.name.startsWith('XDS') &&
      expr.name.endsWith('Props')
    ) {
      return true;
    }
  }

  return false;
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require publicly exported XDS*Props interfaces to extend XDSBaseProps',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingBaseProps:
        '"{{name}}" should extend XDSBaseProps to inherit xstyle, data-*, aria-*, and standard HTML attribute support.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowNames: {
            type: 'array',
            items: {type: 'string'},
            description:
              'Interface names that are exempt from this rule.',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const allowNames = new Set([
      ...ALLOWED,
      ...(options.allowNames || []),
    ]);

    return {
      TSInterfaceDeclaration(node) {
        const name = node.id?.name;
        if (!name) return;

        if (!name.startsWith('XDS') || !name.endsWith('Props')) return;

        const parent = node.parent;
        const isExported =
          parent?.type === 'ExportNamedDeclaration' ||
          parent?.type === 'ExportDefaultDeclaration';
        if (!isExported) return;

        if (allowNames.has(name)) return;

        if (!isPubliclyExported(name, context.filename)) return;

        if (hasXDSBasePropsInHeritage(node)) return;

        context.report({
          node: node.id,
          messageId: 'missingBaseProps',
          data: {name},
        });
      },
    };
  },
};

export default rule;
