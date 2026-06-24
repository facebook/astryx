// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file shared.js
 * @description Shared utilities for XDS ESLint rules that target component
 * props interfaces (require-base-props, require-ref-prop).
 */

import {readFileSync} from 'fs';
import {dirname, join} from 'path';

/**
 * Component props interfaces exempt from structural rules.
 * These either don't render a DOM element or have a fundamentally
 * different type shape (SVG, provider, overlay).
 */
export const COMPONENT_RULE_ALLOWED = new Set([
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

/**
 * Check if a type name is re-exported from the component's barrel index.ts.
 */
export function isPubliclyExported(name, filePath) {
  const exports = getBarrelExports(filePath);
  if (exports === null) return true;
  return exports.has(name);
}
