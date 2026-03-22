'use client';

/**
 * @file useXDSLinkComponent.ts
 * @input React useContext, XDSLinkContext, XDSLinkComponentType
 * @output Exports useXDSLinkComponent hook
 * @position Hook for resolving the link component in XDS components
 *
 * Resolution order: per-component `as` prop > XDSLinkProvider context > native `<a>`.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/index.ts
 * - /packages/core/src/Link/Link.doc.mjs
 */


import {useContext} from 'react';
import {XDSLinkContext} from './XDSLinkContext';
import type {XDSLinkComponentType} from './types';

/**
 * Resolves the link component to use.
 *
 * Priority: `as` prop > `XDSLinkProvider` context > native `<a>`.
 *
 * @param as - Per-component override. If provided, takes highest priority.
 * @returns The resolved link component.
 *
 * @example
 * ```
 * function MyComponent({ as }: { as?: XDSLinkComponentType }) {
 *   const LinkComponent = useXDSLinkComponent(as);
 *   return <LinkComponent href="/foo">Click me</LinkComponent>;
 * }
 * ```
 */
export function useXDSLinkComponent(
  as?: XDSLinkComponentType,
): XDSLinkComponentType {
  const ctx = useContext(XDSLinkContext);
  return as ?? ctx?.component ?? 'a';
}
