// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIntl.ts
 * @input IntlContext (via use())
 * @output Exports useIntl hook returning the IntlContextValue
 * @position Client-side hook for translating outside of render (event handlers,
 *   effects, non-component code) while still resolving against the current
 *   provider's locale.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/intl/index.ts
 * - /packages/core/src/intl/IntlProvider.ts
 * - /packages/core/src/intl/IntlContext.ts
 */

import {use} from 'react';
import {IntlContext, type IntlContextValue} from './IntlContext';

/**
 * Returns the IntlContextValue bound to the current provider's locale.
 *
 * @example
 * ```
 * function AstryxCoreComponent() {
 *   const {t} = useIntl();
 *   const onClick = () => announce(translate('@astryx.pagination.pageAnnounce', {current: 1}));
 * }
 * ```
 *
 * @example
 * ```
 * function UserComponent() {
 *   const {messages} = useIntl<MyCatalog>();
 *   const {currency, discount} = messages;
 *   return (
 *     <span>
 *       {price}
 *       {currency}, {discount(percent)}
 *     </span>
 *   );
 * }
 * ```
 */
export function useIntl<
  Messages = Record<string, never>,
>(): IntlContextValue<Messages> {
  return use(IntlContext) as IntlContextValue<Messages>;
}
