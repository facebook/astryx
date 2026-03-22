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
