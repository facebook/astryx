// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useLinkComponent.ts
 * @input React use, useMemo, createElement, forwardRef, LinkContext, LinkComponentType
 * @output Exports useLinkComponent hook
 * @position Hook for resolving the link component in Astryx components
 *
 * Resolution order: per-component `as` prop > LinkProvider context > native `<a>`.
 *
 * When the resolved component is a custom component (not native `<a>`),
 * wraps it to pass `to={href}` alongside `href`. This enables compatibility
 * with routers that use `to` (React Router, TanStack Router)
 * without requiring an adapter component.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/index.ts
 * - /packages/core/src/Link/Link.doc.mjs
 */

import {use, useMemo, createElement} from 'react';
import {LinkContext} from './LinkContext';
import {isSafeUrl} from '../utils/safeUrl';
import type {LinkComponentType} from './types';

/**
 * Creates a wrapper component that passes both `href` and `to` props
 * to the underlying link component. This enables routers that use `to`
 * (React Router, TanStack Router) to work without an adapter.
 *
 * The wrapper is transparent: it forwards refs and all other props unchanged.
 * Native `<a>` elements ignore the unknown `to` prop harmlessly.
 */
function createLinkWithTo(Component: LinkComponentType): LinkComponentType {
  function LinkWithTo({
    href,
    to,
    ref,
    ...rest
  }: {
    href?: string;
    to?: string;
    ref?: React.Ref<unknown>;
  }) {
    // A native <a> gets its href vetted by React DOM; a custom link component
    // receives raw props and may navigate imperatively, so the same scheme
    // rule applies before the URL leaves the design system — to `href` and
    // `to` alike. `to` is destructured (NOT left in ...rest) so a caller's
    // explicit `to` passes through the same check instead of riding around
    // it; it keeps its precedence over the href-derived value.
    const safeHref = href != null && isSafeUrl(href) ? href : undefined;
    const safeTo = to != null ? (isSafeUrl(to) ? to : undefined) : safeHref;
    return createElement(Component, {
      ref,
      ...rest,
      href: safeHref,
      to: safeTo,
    });
  }
  LinkWithTo.displayName = `LinkWithTo(${
    typeof Component === 'string'
      ? Component
      : Component.displayName || Component.name || 'Component'
  })`;
  return LinkWithTo as LinkComponentType;
}

/**
 * Resolves the link component to use.
 *
 * Priority: `as` prop > `LinkProvider` context > native `<a>`.
 *
 * When the resolved component is a custom component (not the native `<a>`),
 * it is wrapped to receive both `href` and `to` props set to the same value.
 * This allows `to`-based routers (React Router, TanStack Router) to work
 * out of the box without a manual adapter.
 *
 * @param as - Per-component override. If provided, takes highest priority.
 * @returns The resolved link component (with `to` injection for custom components).
 *
 * @example
 * ```
 * function MyComponent({ as }: { as?: LinkComponentType }) {
 *   const LinkComponent = useLinkComponent(as);
 *   return <LinkComponent href="/foo">Click me</LinkComponent>;
 * }
 * ```
 */
export function useLinkComponent(as?: LinkComponentType): LinkComponentType {
  const ctx = use(LinkContext);
  const resolved = as ?? ctx?.component ?? 'a';

  // Memoize the wrapper to maintain referential stability.
  // The wrapper is only created for custom components (not native <a>).
  return useMemo(() => {
    if (resolved === 'a') {
      return 'a';
    }
    return createLinkWithTo(resolved);
  }, [resolved]);
}
