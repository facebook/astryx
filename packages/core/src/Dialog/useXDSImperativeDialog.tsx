'use client';

/**
 * @file useXDSImperativeDialog.tsx
 * @input Uses React, XDSDialog
 * @output Exports useXDSImperativeDialog hook
 * @position Utility hook; wraps XDSDialog with imperative show/hide API
 *
 * Eliminates boilerplate for dialogs that don't need controlled state.
 * Instead of managing isOpen + content state, call show() with content
 * and the dialog handles the rest.
 *
 * @example
 * ```
 * const dialog = useXDSImperativeDialog();
 * <button onClick={() => dialog.show(<MyContent />)}>Open</button>
 * {dialog.element}
 * ```
 */

import {useState, useCallback, useMemo, type ReactNode} from 'react';
import {XDSDialog, type XDSDialogProps} from './XDSDialog';

type DialogOptions = Omit<
  XDSDialogProps,
  'isOpen' | 'onOpenChange' | 'children'
>;

export interface XDSImperativeDialogReturn {
  /** Show the dialog with the given content. */
  show: (content: ReactNode, options?: DialogOptions) => void;
  /** Hide the dialog. */
  hide: () => void;
  /** Whether the dialog is currently open. */
  isOpen: boolean;
  /** Render this in your JSX tree. */
  element: ReactNode;
}

/**
 * Imperative dialog — show/hide without managing state.
 *
 * @example
 * ```
 * const dialog = useXDSImperativeDialog();
 * onClick={() => dialog.show(
 *   <XDSCodeBlock code={output} language="bash" />
 * )}
 * return <>{dialog.element}</>;
 * ```
 */
export function useXDSImperativeDialog(
  defaultOptions?: DialogOptions,
): XDSImperativeDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<DialogOptions | undefined>(
    defaultOptions,
  );

  const show = useCallback(
    (newContent: ReactNode, newOptions?: DialogOptions) => {
      setContent(newContent);
      if (newOptions) setOptions(prev => ({...prev, ...newOptions}));
      setIsOpen(true);
    },
    [],
  );

  const hide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const element = useMemo(
    () => (
      <XDSDialog
        isOpen={isOpen}
        onOpenChange={open => {
          if (!open) setIsOpen(false);
        }}
        {...(defaultOptions ?? {})}
        {...(options ?? {})}>
        {content}
      </XDSDialog>
    ),
    [isOpen, content, options, defaultOptions],
  );

  return {show, hide, isOpen, element};
}
