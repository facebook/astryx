'use client';

/**
 * @file XDSAlertDialog.tsx
 * @input Uses React, XDSDialog, XDSLayout, XDSHeading, XDSText
 * @output Exports XDSAlertDialog component, XDSAlertDialogProps type
 * @position Core implementation; consumed by index.ts, tested by XDSAlertDialog.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AlertDialog/AlertDialog.doc.mjs (props table, features, examples)
 * - /packages/core/src/AlertDialog/XDSAlertDialog.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/AlertDialog/index.ts (exports if types change)
 * - /apps/storybook/stories/AlertDialog.stories.tsx (storybook stories)
 */

import {useId, useCallback, useRef, useEffect, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSDialog} from '../Dialog';
import {XDSLayout} from '../Layout/XDSLayout';
import {XDSLayoutContent} from '../Layout/XDSLayoutContent';
import {XDSLayoutFooter} from '../Layout/XDSLayoutFooter';
import {XDSHStack} from '../Stack';
import {XDSHeading} from '../Text/XDSHeading';
import {XDSText} from '../Text/XDSText';
import {xdsClassName} from '../utils';

const styles = stylex.create({
  cancelWrapper: {
    display: 'contents',
  },
});

export interface XDSAlertDialogProps {
  /**
   * Whether the dialog is open.
   */
  isOpen: boolean;

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
   * Cancel action slot. Receives initial focus when the dialog opens.
   * Clicking this automatically calls `onOpenChange(false)`.
   */
  cancel: ReactNode;

  /**
   * Confirm action slot. Does NOT auto-close —
   * the consumer controls when to call `onOpenChange(false)`.
   */
  action: ReactNode;

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
 *   cancel={<XDSButton variant="secondary" label="Cancel" />}
 *   action={
 *     <XDSButton variant="danger" label="Delete"
 *       onClick={async () => { await deleteItem(); setIsOpen(false); }} />
 *   }
 * />
 * ```
 */
export function XDSAlertDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  cancel,
  action,
  width = 400,
}: XDSAlertDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Focus the cancel button when the dialog opens (least destructive action)
  useEffect(() => {
    if (isOpen && cancelRef.current) {
      const focusable = cancelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }
  }, [isOpen]);

  return (
    <XDSDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width={width}
      purpose="form"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      {...xdsClassName('alert-dialog')}>
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
              <div
                ref={cancelRef}
                onClick={handleClose}
                {...stylex.props(styles.cancelWrapper)}>
                {cancel}
              </div>
              {action}
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSDialog>
  );
}

XDSAlertDialog.displayName = 'XDSAlertDialog';
