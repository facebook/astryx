// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ConfirmDialog.tsx
 * @input isOpen flag, title, message, confirm/cancel handlers + labels
 * @output A small confirmation dialog (Dialog) with Cancel/Continue actions
 * @position Playground — shared confirm prompt for destructive playground
 *   actions (loading templates, applying example themes) that overwrite the
 *   user's current code or theme.
 */

import {type ReactNode} from 'react';
import {Button} from '@xds/core/Button';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';
import {Dialog, DialogHeader} from '@xds/core/Dialog';

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
    <Dialog
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) {
          onCancel();
        }
      }}
      purpose="form"
      width={440}>
      <Layout
        header={<DialogHeader title={title} onOpenChange={onCancel} />}
        content={
          <LayoutContent>
            <Text type="body" color="secondary">
              {message}
            </Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} justify="end" width="100%">
              <Button
                variant="secondary"
                label={cancelLabel}
                onClick={onCancel}
              />
              <Button
                variant="primary"
                label={confirmLabel}
                onClick={onConfirm}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}

ConfirmDialog.displayName = 'ConfirmDialog';
