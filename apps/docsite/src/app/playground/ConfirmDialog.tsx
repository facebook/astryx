// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ConfirmDialog.tsx
 * @input isOpen flag, title, message, confirm/cancel handlers + labels
 * @output A small confirmation dialog (XDSDialog) with Cancel/Continue actions
 * @position Playground — shared confirm prompt for destructive playground
 *   actions (loading templates, applying example themes) that overwrite the
 *   user's current code or theme.
 */

import {type ReactNode} from 'react';
import {XDSButton} from '@xds/core/Button';
import {
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';

export interface ConfirmDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Dialog title shown in the header. */
  title: string;
  /** Body message explaining the consequence of continuing. */
  message: ReactNode;
  /** Label for the confirming action. */
  confirmLabel?: string;
  /** Label for the dismissing action. */
  cancelLabel?: string;
  /** Called when the user confirms the action. */
  onConfirm: () => void;
  /** Called when the user cancels or otherwise dismisses the dialog. */
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <XDSDialog
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) {
          onCancel();
        }
      }}
      purpose="form"
      width={440}>
      <XDSLayout
        header={<XDSDialogHeader title={title} onOpenChange={onCancel} />}
        content={
          <XDSLayoutContent>
            <XDSText type="body" color="secondary">
              {message}
            </XDSText>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} justify="end" width="100%">
              <XDSButton
                variant="secondary"
                label={cancelLabel}
                onClick={onCancel}
              />
              <XDSButton
                variant="primary"
                label={confirmLabel}
                onClick={onConfirm}
              />
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSDialog>
  );
}

ConfirmDialog.displayName = 'ConfirmDialog';
