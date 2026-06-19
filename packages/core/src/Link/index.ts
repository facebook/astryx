// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Link, LinkProvider, useLinkComponent, types
 * @output Exports all public Link components, hooks, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Link/Link.doc.mjs
 */

export {Link} from './Link';
export type {LinkProps} from './Link';

export {LinkProvider} from './LinkProvider';
export type {LinkProviderProps} from './LinkProvider';

export {useLinkComponent} from './useLinkComponent';

export type {LinkComponentType} from './types';

export {useLinkify} from './useLinkify';
export type {LinkifyPattern, UseLinkifyOptions} from './useLinkify';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Link as XDSLink,
  LinkProvider as XDSLinkProvider,
  useLinkComponent as useXDSLinkComponent,
  useLinkify as useXDSLinkify,
} from '.';
export type {
  LinkComponentType as XDSLinkComponentType,
  LinkProps as XDSLinkProps,
  LinkProviderProps as XDSLinkProviderProps,
  LinkifyPattern as XDSLinkifyPattern,
  UseLinkifyOptions as XDSUseLinkifyOptions,
} from '.';
// <compat-aliases:end>
