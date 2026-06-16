// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSLink, XDSLinkProvider, useXDSLinkComponent, types
 * @output Exports all public Link components, hooks, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Link/Link.doc.mjs
 */

export {XDSLink} from './XDSLink';
export type {XDSLinkProps} from './XDSLink';

export {XDSLinkProvider} from './XDSLinkProvider';
export type {XDSLinkProviderProps} from './XDSLinkProvider';

export {useXDSLinkComponent} from './useXDSLinkComponent';

export type {XDSLinkComponentType} from './types';

export {useXDSLinkify} from './useXDSLinkify';
export type {LinkifyPattern, UseXDSLinkifyOptions} from './useXDSLinkify';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSLink as Link,
  XDSLinkProvider as LinkProvider,
  useXDSLinkComponent as useLinkComponent,
  useXDSLinkify as useLinkify,
} from '.';
export type {
  XDSLinkComponentType as LinkComponentType,
  XDSLinkProps as LinkProps,
  XDSLinkProviderProps as LinkProviderProps,
} from '.';
// <compat-aliases:end>
