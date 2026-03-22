'use client';

/**
 * @file XDSDialogHeader.tsx
 * @input Uses React, useEffect, useRef, XDSLayoutHeader, XDSButton, XDSIcon, XDSHeading, XDSText
 * @output Exports XDSDialogHeader component and XDSDialogHeaderProps
 * @position Dialog header component; used with XDSDialog and XDSLayout
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Dialog/Dialog.doc.mjs
 * - /packages/core/src/Dialog/XDSDialogHeader.test.tsx
 * - /packages/core/src/Dialog/index.ts
 * - /apps/storybook/stories/Dialog.stories.tsx
 */


import {useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {XDSLayoutHeader} from '../Layout/XDSLayoutHeader';
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';
import {XDSHeading} from '../Text/XDSHeading';
import {XDSText} from '../Text/XDSText';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-3'],
  },
  titleWrapper: {
    flex: 1,
    minWidth: 0,
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
  closeButton: {
    marginTop: `calc(-1 * ${spacingVars['--spacing-2']})`,
    marginRight: `calc(-1 * ${spacingVars['--spacing-2']})`,
  },
});

export interface XDSDialogHeaderProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
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
   * @default true
   */
  hasDivider?: boolean;
}

/**
 * Header component designed specifically for XDSDialog.
 *
 * Renders a title that receives focus when the dialog opens (for screen reader accessibility)
 * and an optional close button. The title is an h2 element with tabIndex={-1} so it can be
 * programmatically focused but doesn't appear in the tab order.
 *
 * Uses XDSLayoutHeader internally for consistent styling with other layout headers.
 *
 * @example
 * ```
 * <XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
 *   <XDSLayout
 *     header={<XDSDialogHeader title="Modal Title" onOpenChange={open => setIsOpen(open)} />}
 *     content={<XDSLayoutContent>Content</XDSLayoutContent>}
 *     footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
 *   />
 * </XDSDialog>
 * ```
 */
export function XDSDialogHeader({
  title,
  subtitle,
  onOpenChange,
  startContent,
  endContent,
  hasDivider = true,
  ref,
}: XDSDialogHeaderProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Auto-focus the title when mounted for screen reader accessibility
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.tabIndex = -1;
      titleRef.current.focus();
    }
  }, []);

  return (
    <XDSLayoutHeader ref={ref} hasDivider={hasDivider}>
      <div {...stylex.props(styles.container)}>
        {startContent && (
          <div {...stylex.props(styles.actions)}>{startContent}</div>
        )}
        <div {...stylex.props(styles.titleWrapper)}>
          <XDSHeading ref={titleRef} level={2} xstyle={styles.titleFocusable}>
            {title}
          </XDSHeading>
          {subtitle && (
            <XDSText type="body" size="sm" color="secondary">
              {subtitle}
            </XDSText>
          )}
        </div>
        {(endContent || onOpenChange) && (
          <div {...stylex.props(styles.actions)}>
            {endContent}
            {onOpenChange && (
              <div {...stylex.props(styles.closeButton)}>
                <XDSButton
                  variant="ghost"
                  label="Close"
                  tooltip="Close"
                  icon={<XDSIcon icon="close" color="inherit" />}
                  onClick={() => onOpenChange?.(false)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </XDSLayoutHeader>
  );
}

XDSDialogHeader.displayName = 'XDSDialogHeader';
