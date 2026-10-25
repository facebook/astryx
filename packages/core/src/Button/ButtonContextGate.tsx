// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ButtonContextGate.tsx
 * @input Uses the size, ButtonGroup, InputGroup and LinkProvider contexts,
 *   usePressFeedback, and a lazily loaded client Button
 * @output Exports ButtonContextGate: the client part every server-rendered
 *   Button sits in
 * @position Client part of ButtonShell.tsx. A Server Component cannot read
 *   context, but four client providers change what a Button renders: a size
 *   provider (Toolbar, SideNav, ButtonGroup), a ButtonGroup, an InputGroup and,
 *   for a link, a LinkProvider. Outside them this renders the server-rendered
 *   Button it is given, unchanged. Inside one, it renders the client Button
 *   with the same props, loaded only then. It also installs the shared touch
 *   press controller, as every client Button does.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Button/ButtonShell.tsx
 * - /packages/core/src/Button/Button.tsx (the contexts it reads)
 * - /packages/core/src/__tests__/serverEntryClientParts.ts
 */

import {lazy, Suspense, use, type ReactNode} from 'react';
import {SizeContext} from '../SizeContext/SizeContext';
import {ButtonGroupContext} from '../ButtonGroup/ButtonGroupContext';
import {InputGroupContext} from '../InputGroup/InputGroupContext';
import {LinkContext} from '../Link/LinkContext';
import {usePressFeedback} from '../hooks/usePressFeedback';
import type {ButtonProps} from './Button';

const ClientButton = lazy(async () =>
  import('./Button').then(mod => ({default: mod.Button})),
);

export interface ButtonContextGateProps {
  /** The props the Button was rendered with: data only, no functions. */
  buttonProps: ButtonProps;
  /** The Button as the server rendered it, outside any provider. */
  children: ReactNode;
}

/**
 * Keeps a server-rendered Button when no client provider applies to it, and
 * hands over to the client Button when one does.
 */
export function ButtonContextGate({
  buttonProps,
  children,
}: ButtonContextGateProps): ReactNode {
  usePressFeedback();
  const inheritedSize = use(SizeContext);
  const buttonGroup = use(ButtonGroupContext);
  const inputGroup = use(InputGroupContext);
  const linkContext = use(LinkContext);

  const isProvided =
    // Explicit `size` wins over a provider (component-size-cascade INV3).
    (inheritedSize != null && buttonProps.size == null) ||
    buttonGroup != null ||
    inputGroup != null ||
    // A link resolves `as`, then LinkProvider, then a native anchor; the
    // server rendered the anchor, so a provider's component must take over.
    (linkContext != null &&
      buttonProps.href != null &&
      buttonProps.as == null &&
      buttonProps.isDisabled !== true);

  if (!isProvided) {
    return children;
  }
  // Until the client Button loads, keep the server-rendered one in place. On a
  // server-rendered page that never shows: the HTML was rendered with context
  // and hydration keeps it. On a client render (a soft navigation) it shows
  // standalone styling until the chunk arrives, which beats a missing Button.
  return (
    <Suspense fallback={children}>
      <ClientButton {...buttonProps} />
    </Suspense>
  );
}

ButtonContextGate.displayName = 'ButtonContextGate';
