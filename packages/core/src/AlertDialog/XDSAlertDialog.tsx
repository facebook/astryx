// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSAlertDialog.tsx
 * @input Uses React, XDSDialog, XDSLayout, XDSHeading, XDSText, XDSButton
 * @output Exports XDSAlertDialog component, XDSAlertDialogProps type
 * @position Core implementation; consumed by index.ts, tested by XDSAlertDialog.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AlertDialog/AlertDialog.doc.mjs (props table, features, examples)
 * - /packages/core/src/AlertDialog/XDSAlertDialog.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/AlertDialog/index.ts (exports if types change)
 * - /apps/storybook/stories/AlertDialog.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/AlertDialog/ (showcase blocks)
 */

import React, {useId, useCallback} from 'react';
import {XDSDialog} from '../Dialog';
import {XDSLayout} from '../Layout/XDSLayout';
import {XDSLayoutContent} from '../Layout/XDSLayoutContent';
import {XDSLayoutFooter} from '../Layout/XDSLayoutFooter';
import {XDSHStack} from '../Stack';
import {XDSHeading} from '../Heading/XDSHeading';
import {XDSText} from '../Text/XDSText';
import {XDSButton, type XDSButtonVariant} from '../Button';
import type {XDSBaseProps} from '../XDSBaseProps';
import {mergeProps} from '../utils';
import {xdsThemeProps} from '../utils/xdsThemeProps';

export interface XDSAlertDialogProps extends XDSBaseProps<HTMLDialogElement> {
  ref?: React.Ref<HTMLDialogElement>;
  /**
   * Whether the dialog is open.
   */
  isOpen: boolean;

  /**
   * Renders alert dialog content inline without modal behavior.
   * For documentation previews and showcases only.
   * @default false
   */
  isInline?: boolean;

  /**
   * Callback fired when the dialog visibility changes.
   * Called with `false` when cancel is clicked or Escape is pressed.
   */
  onOpenChange: (isOpen: boolean) => unknown;

  /**
   * Dialog title. Linked to the dialog via `aria-labelledby`.
   */
  title: string;

  /**
   * Consequence description. Linked to the dialog via `aria-describedby`.
   */
  description: string;

  /**
   * Label for the cancel button. Rendered as a ghost XDSButton.
   * Clicking cancel calls `onOpenChange(false)`.
   * @default 'Cancel'
   */
  cancelLabel?: string;

  /**
   * Label for the action button.
   */
  actionLabel: string;

  /**
   * Variant for the action button.
   * @default 'destructive'
   */
  actionVariant?: XDSButtonVariant;

  /**
   * Whether the action button shows a loading spinner.
   */
  isActionLoading?: boolean;

  /**
   * Callback fired when the action button is clicked.
   * The dialog does NOT auto-close — call `onOpenChange(false)` when done.
   */
  onAction: () => unknown;

  /**
   * The width of the dialog.
   * Numbers are treated as pixels, strings are used as-is.
   * @default 400
   */
  width?: number | string;
}

/**
 * A confirmation dialog for destructive or irreversible actions.
 *
 * Uses `role="alertdialog"` and requires explicit user action to dismiss.
 * Cannot be dismissed by clicking outside. Escape key triggers cancel.
 * Initial focus goes to the cancel button (least destructive action).
 *
 * @example
 * ```
 * <XDSAlertDialog
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete item?"
 *   description="This action cannot be undone."
 *   actionLabel="Delete"
 *   onAction={async () => { await deleteItem(); setIsOpen(false); }}
 * />
 * ```
 */
export function XDSAlertDialog({
  ref,
  isOpen,
  isInline,
  onOpenChange,
  title,
  description,
  cancelLabel = 'Cancel',
  actionLabel,
  actionVariant = 'destructive',
  isActionLoading,
  onAction,
  width = 400,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: XDSAlertDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <XDSDialog
      ref={ref}
      isOpen={isOpen}
      isInline={isInline}
      onOpenChange={onOpenChange}
      width={width}
      purpose="form"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      {...mergeProps(xdsThemeProps('alert-dialog'), {className, style})}
      xstyle={xstyle}
      data-testid={testId}>
      <XDSLayout
        content={
          <XDSLayoutContent>
            <XDSHeading level={2} id={titleId}>
              {title}
            </XDSHeading>
            <XDSText type="body" color="secondary" id={descriptionId}>
              {description}
            </XDSText>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton
                variant="ghost"
                label={cancelLabel}
                onClick={handleCancel}
              />
              <XDSButton
                variant={actionVariant}
                label={actionLabel}
                onClick={onAction}
                isLoading={isActionLoading}
              />
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSDialog>
  );
}

XDSAlertDialog.displayName = 'XDSAlertDialog';
