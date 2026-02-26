/**
 * @file XDSConfirmationModal.tsx
 * @input Uses React, XDSDialog, XDSDialogHeader, XDSLayout, XDSLayoutContent,
 *        XDSLayoutFooter, XDSButton, XDSText, XDSHStack
 * @output Exports XDSConfirmationModal component, XDSConfirmationModalProps,
 *         XDSConfirmationModalVariant types
 * @position Pre-composed confirm/cancel dialog — the most common dialog pattern.
 *           Wraps XDSDialog with opinionated defaults for confirmation flows.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ConfirmationModal/README.md (props table, features)
 * - /packages/core/src/ConfirmationModal/XDSConfirmationModal.test.tsx (tests)
 * - /packages/core/src/ConfirmationModal/index.ts (exports if types change)
 * - /apps/storybook/stories/ConfirmationModal.stories.tsx (storybook stories)
 */

import {useCallback, useId, useRef, useState, type ReactNode} from 'react';
import {XDSDialog} from '../Dialog';
import {XDSDialogHeader} from '../Dialog/XDSDialogHeader';
import {XDSLayout} from '../Layout/XDSLayout';
import {XDSLayoutContent} from '../Layout/XDSLayoutContent';
import {XDSLayoutFooter} from '../Layout/XDSLayoutFooter';
import {XDSButton} from '../Button';
import {XDSText} from '../Text/XDSText';
import {XDSHStack} from '../Stack';

/**
 * Visual variant for the confirmation modal.
 * Controls the appearance of the confirm button.
 */
export type XDSConfirmationModalVariant = 'standard' | 'destructive';

export interface XDSConfirmationModalProps {
  /**
   * Whether the modal is shown.
   */
  isShown: boolean;

  /**
   * Title text displayed at the top of the modal.
   */
  title: string;

  /**
   * Descriptive content explaining what the user is confirming.
   * Can be a string for simple text or ReactNode for rich content.
   */
  description: ReactNode;

  /**
   * Callback fired when the user confirms the action.
   * Can return a Promise for async operations (shows loading state automatically).
   */
  onConfirm: () => void | Promise<void>;

  /**
   * Callback fired when the user cancels or dismisses the modal.
   * Called on cancel button click and Escape key.
   */
  onCancel: () => void;

  /**
   * Label for the confirm button.
   * @default "Confirm"
   */
  confirmLabel?: string;

  /**
   * Label for the cancel button.
   * @default "Cancel"
   */
  cancelLabel?: string;

  /**
   * Visual variant controlling the confirm button appearance.
   * - standard: Primary button styling
   * - destructive: Red/danger button styling for irreversible actions
   * @default "standard"
   */
  variant?: XDSConfirmationModalVariant;

  /**
   * Whether the confirm action is in progress.
   * Disables both buttons and shows a spinner on the confirm button.
   * Use for external loading state control. When `onConfirm` returns a Promise,
   * loading state is managed automatically — use this only for complex flows.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Test ID for the modal container.
   */
  'data-testid'?: string;
}

/**
 * Pre-composed confirmation dialog for confirm/cancel actions.
 *
 * Wraps XDSDialog with `purpose="form"` (Escape cancels, backdrop click blocked)
 * and provides standard confirm/cancel button layout. Supports async confirm
 * with automatic loading state.
 *
 * @example
 * ```tsx
 * <XDSConfirmationModal
 *   isShown={isShown}
 *   title="Delete project?"
 *   description="This action cannot be undone."
 *   onConfirm={handleDelete}
 *   onCancel={() => setIsShown(false)}
 *   variant="destructive"
 *   confirmLabel="Delete"
 * />
 * ```
 */
export function XDSConfirmationModal({
  isShown,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'standard',
  isLoading: externalLoading = false,
  'data-testid': testId,
}: XDSConfirmationModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoadingState = externalLoading || internalLoading;
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleConfirm = useCallback(() => {
    const result = onConfirm();
    if (result instanceof Promise) {
      setInternalLoading(true);
      result
        .catch(() => {
          // Consumer is responsible for error handling.
          // We only manage loading state here.
        })
        .finally(() => {
          setInternalLoading(false);
        });
    }
  }, [onConfirm]);

  return (
    <XDSDialog
      isShown={isShown}
      onHide={onCancel}
      purpose="form"
      width={440}
      role="alertdialog"
      aria-describedby={descriptionId}
      data-testid={testId}>
      <XDSLayout
        header={<XDSDialogHeader title={title} onHide={onCancel} />}
        content={
          <XDSLayoutContent>
            <div id={descriptionId}>
              {typeof description === 'string' ? (
                <XDSText type="body">{description}</XDSText>
              ) : (
                description
              )}
            </div>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap="space2" hAlign="end">
              <XDSButton
                ref={cancelRef}
                label={cancelLabel}
                variant="secondary"
                onClick={onCancel}
                isDisabled={isLoadingState}
              />
              <XDSButton
                label={confirmLabel}
                variant={variant === 'destructive' ? 'destructive' : 'primary'}
                onClick={handleConfirm}
                isLoading={isLoadingState}
              />
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSDialog>
  );
}

XDSConfirmationModal.displayName = 'XDSConfirmationModal';
