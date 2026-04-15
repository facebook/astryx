'use client';

/**
 * @file useXDSImperativeAlertDialog.tsx
 * @input Uses React, XDSAlertDialog
 * @output Exports useXDSImperativeAlertDialog hook
 * @position Utility hook; wraps XDSAlertDialog with imperative show/hide API
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AlertDialog/index.ts (exports)
 * - /packages/core/src/AlertDialog/AlertDialog.doc.mjs
 * - /apps/storybook/stories/AlertDialog.stories.tsx
 */

import {useState, useCallback, useMemo} from 'react';
import {XDSAlertDialog, type XDSAlertDialogProps} from './XDSAlertDialog';
import type {ReactNode} from 'react';

type AlertDialogOptions = Omit<
  XDSAlertDialogProps,
  'isOpen' | 'onOpenChange' | 'onAction'
> & {
  /** Callback fired when the action button is clicked. Call hide() when done. */
  onAction: () => unknown;
};

export interface XDSImperativeAlertDialogReturn {
  /** Show the alert dialog. */
  show: (options: AlertDialogOptions) => void;
  /** Hide the alert dialog. */
  hide: () => void;
  /** Whether the dialog is currently open. */
  isOpen: boolean;
  /** Render this in your JSX tree. */
  element: ReactNode;
}

/**
 * Imperative alert dialog — show/hide without managing state.
 *
 * @example
 * ```
 * const alert = useXDSImperativeAlertDialog();
 *
 * const handleDelete = () => {
 *   alert.show({
 *     title: 'Delete item?',
 *     description: 'This action cannot be undone.',
 *     actionLabel: 'Delete',
 *     onAction: async () => { await deleteItem(); alert.hide(); },
 *   });
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleDelete}>Delete</button>
 *     {alert.element}
 *   </>
 * );
 * ```
 */
export function useXDSImperativeAlertDialog(): XDSImperativeAlertDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertDialogOptions | null>(null);

  const show = useCallback((newOptions: AlertDialogOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  }, []);

  const hide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const element = useMemo(() => {
    if (!options) return null;
    const {onAction, ...rest} = options;
    return (
      <XDSAlertDialog
        {...rest}
        isOpen={isOpen}
        onOpenChange={open => {
          if (!open) setIsOpen(false);
        }}
        onAction={onAction}
      />
    );
  }, [isOpen, options]);

  return {show, hide, isOpen, element};
}
