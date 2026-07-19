// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DialogHeader.tsx
 * @input Uses React, useEffect, useRef, LayoutHeader, Button, Icon, Heading, Text, DialogContext
 * @output Exports DialogHeader component and DialogHeaderProps
 * @position Dialog header component; used with Dialog and Layout
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Dialog/Dialog.doc.mjs
 * - /packages/core/src/Dialog/DialogHeader.test.tsx
 * - /packages/core/src/Dialog/index.ts
 * - /apps/storybook/stories/Dialog.stories.tsx
 * - /packages/cli/templates/blocks/components/Dialog/ (showcase blocks)
 */

import {useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars, sizeVars, typeScaleVars} from '../theme/tokens.stylex';
import {LayoutHeader} from '../Layout/LayoutHeader';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Heading} from '../Heading/Heading';
import {Text} from '../Text/Text';
import type {BaseProps} from '../BaseProps';
import {useDialogContext} from './DialogContext';
import {useTranslator} from '../i18n';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-3'],
  },
  // Compensate for the icon button's visual padding on the actions area
  actionsCompensation: {
    marginBlock: `calc(-1 * ${spacingVars['--spacing-2']})`,
    marginInlineEnd: `calc(-1 * ${spacingVars['--spacing-2']})`,
  },
  titleWrapper: {
    flex: 1,
    minWidth: 0,
    // Visual centering: align title center with close button center
    // buttonCenter = size-element-md/2 = 16px (close button midpoint relative to edge)
    // titleCenter = heading-2-size * heading-2-leading / 2 = 14px
    // adjustment = 8 - 14 = -6px
    marginBlock: `calc(${sizeVars['--size-element-md']} / 2 - ${spacingVars['--spacing-2']} - ${typeScaleVars['--text-heading-2-size']} * ${typeScaleVars['--text-heading-2-leading']} / 2)`,
  },
  titleFocusable: {
    outline: 'none',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flexShrink: 0,
  },
});

export interface DialogHeaderProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The title of the dialog.
   * This title receives focus when the dialog opens for screen reader accessibility.
   */
  title: string;

  /**
   * Optional subtitle displayed below the title in smaller, secondary text.
   */
  subtitle?: string;

  /**
   * Callback fired when the dialog visibility changes.
   * Called with `false` when the close button is clicked.
   * If not provided, no close button will be rendered.
   */
  onOpenChange?: (isOpen: boolean) => unknown;

  /**
   * Content to render before the title (e.g., a back button).
   */
  startContent?: ReactNode;

  /**
   * Content to render after the title, before the close button (e.g., action buttons).
   */
  endContent?: ReactNode;

  /**
   * Adds a themed border at the bottom edge.
   * When false, spacing collapse is applied automatically for seamless visual flow.
   * Defaults to the parent Layout's `defaultHasDividers` context value.
   */
  hasDivider?: boolean;
}

/**
 * Header component designed specifically for Dialog.
 *
 * Renders a title that receives focus when a modal dialog opens (for screen reader accessibility)
 * and an optional close button. Inline documentation previews suppress this autofocus.
 * The title is an h2 element with tabIndex={-1} so it can be programmatically focused but
 * doesn't appear in the tab order.
 *
 * Uses LayoutHeader internally for consistent styling with other layout headers.
 *
 * @example
 * ```
 * <Dialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
 *   <Layout
 *     header={<DialogHeader title="Modal Title" onOpenChange={open => setIsOpen(open)} />}
 *     content={<LayoutContent>Content</LayoutContent>}
 *     footer={<LayoutFooter hasDivider>Actions</LayoutFooter>}
 *   />
 * </Dialog>
 * ```
 */
export function DialogHeader({
  title,
  subtitle,
  onOpenChange,
  startContent,
  endContent,
  hasDivider,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DialogHeaderProps) {
  const t = useTranslator();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dialogContext = useDialogContext();
  const shouldAutoFocus = dialogContext?.isInline !== true;

  // Auto-focus the title when mounted for screen reader accessibility.
  // Inline dialogs are documentation/showcase previews, so suppress focus to
  // avoid stealing scroll position from the surrounding page.
  useEffect(() => {
    if (shouldAutoFocus && titleRef.current) {
      titleRef.current.focus();
    }
  }, [shouldAutoFocus]);

  return (
    <LayoutHeader
      ref={ref}
      hasDivider={hasDivider}
      xstyle={xstyle}
      className={className}
      style={style}
      {...rest}>
      <div {...stylex.props(styles.container)}>
        {startContent && (
          <div {...stylex.props(styles.actions)}>{startContent}</div>
        )}
        <div {...stylex.props(styles.titleWrapper)}>
          <Heading
            ref={titleRef}
            level={2}
            tabIndex={-1}
            xstyle={styles.titleFocusable}>
            {title}
          </Heading>
          {subtitle && (
            <Text type="body" size="sm" color="secondary">
              {subtitle}
            </Text>
          )}
        </div>
        {(endContent || onOpenChange) && (
          <div
            {...stylex.props(
              styles.actions,
              onOpenChange && styles.actionsCompensation,
            )}>
            {endContent}
            {onOpenChange && (
              <Button
                variant="ghost"
                label={t('@astryx.dialog.close')}
                tooltip={t('@astryx.dialog.close')}
                icon={<Icon icon="close" color="inherit" />}
                onClick={() => {
                  onOpenChange?.(false);
                }}
                isIconOnly
              />
            )}
          </div>
        )}
      </div>
    </LayoutHeader>
  );
}

DialogHeader.displayName = 'DialogHeader';
