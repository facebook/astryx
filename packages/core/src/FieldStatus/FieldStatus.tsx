// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FieldStatus.tsx
 * @input Uses React, stylex, theme tokens, useAnnounce
 * @output Exports FieldStatus component, FieldStatusProps
 * @position Core implementation; consumed by Field, Switch, CheckboxInput, and the FieldStatus entrypoint
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/FieldStatus/FieldStatus.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Field/Field.doc.mjs (compat docs when public API changes)
 * - /packages/core/src/FieldStatus/index.ts (exports if types change)
 * - /packages/core/src/Field/index.ts (compat re-export if public API changes)
 * - /packages/cli/templates/blocks/components/FieldStatus/ (showcase blocks)
 */

'use client';

import React, {useEffect} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {useAnnounce} from '../hooks/useAnnounce';
import {mergeProps} from '../utils';
import {
  colorVars,
  radiusVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import type {InputStatusType} from '../Field/types';
import {useEntryAnimation} from '../hooks/useEntryAnimation';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  base: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  attached: {
    marginTop: `calc(-1 * ${spacingVars['--spacing-1-5']})`,
    paddingBlockStart: `calc(${spacingVars['--spacing-1-5']} + ${spacingVars['--spacing-2']})`,
    paddingBlockEnd: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    borderBottomLeftRadius: radiusVars['--radius-element'],
    borderBottomRightRadius: radiusVars['--radius-element'],
  },
  detached: {
    marginTop: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
  },
});

const colorStyles = stylex.create({
  warning: {
    backgroundColor: colorVars['--color-warning-muted'],
    color: colorVars['--color-text-yellow'],
  },
  error: {
    backgroundColor: colorVars['--color-error-muted'],
    color: colorVars['--color-text-red'],
  },
  success: {
    backgroundColor: colorVars['--color-success-muted'],
    color: colorVars['--color-text-green'],
  },
});

/**
 * Extensible variant map for FieldStatus.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/FieldStatus' {
 *   interface FieldStatusVariantMap {
 *     'inline': true;
 *   }
 * }
 * ```
 */
export interface FieldStatusVariantMap {
  attached: true;
  detached: true;
}

/**
 * FieldStatus variant type. Extensible via module augmentation of FieldStatusVariantMap.
 */
export type FieldStatusVariant = keyof FieldStatusVariantMap;

export interface FieldStatusProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The type of status to display.
   */
  type: InputStatusType;
  /**
   * The status message to display.
   */
  message: string;
  /**
   * Visual variant of the status message.
   * - 'attached': Overlaps with input above (used in Field)
   * - 'detached': Floats below with spacing (used in Switch, CheckboxInput)
   * @default 'attached'
   */
  variant?: FieldStatusVariant;
}

/**
 * A status message component for form fields.
 *
 * Screen-reader announcements go through the persistent `useAnnounce` live
 * regions (assertive for errors, polite otherwise) rather than `role`/
 * `aria-live` on the rendered element. Live regions that mount together with
 * their content are not reliably announced by assistive technology, and
 * FieldStatus is almost always conditionally rendered by its callers. The
 * message is announced whenever it appears — including on first mount — and
 * whenever it changes.
 *
 * @example
 * ```
 * <FieldStatus
 *   type="error"
 *   message="This field is required"
 * />
 * <FieldStatus
 *   type="warning"
 *   message="This will be visible to others"
 *   variant="detached"
 * />
 * ```
 */
export function FieldStatus({
  ref,
  type,
  message,
  id,
  variant = 'attached',
  xstyle,
  className,
  style,
  ...rest
}: FieldStatusProps) {
  const entryStyle = useEntryAnimation('slideDown');
  const announce = useAnnounce();

  // Announce the message through the persistently-mounted live regions.
  // Announce-on-mount is intentional: callers conditionally mount FieldStatus
  // when a status appears (and whole forms can mount with a server-side
  // validation error already present), and both cases must be heard.
  useEffect(() => {
    if (message) {
      announce(message, type === 'error' ? 'assertive' : 'polite');
    }
  }, [announce, message, type]);

  return (
    <div
      ref={ref}
      id={id}
      {...rest}
      {...mergeProps(
        themeProps('field-status', {type, variant}),
        stylex.props(
          styles.base,
          entryStyle,
          variant === 'attached' ? styles.attached : styles.detached,
          colorStyles[type],
          xstyle,
        ),
        className,
        style,
      )}>
      {message}
    </div>
  );
}

FieldStatus.displayName = 'FieldStatus';
