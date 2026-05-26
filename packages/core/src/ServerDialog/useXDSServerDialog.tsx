// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  type ReactNode,
  useRef,
  useCallback,
  useState,
  Suspense,
  use,
} from 'react';
import {XDSDialog} from '../Dialog/XDSDialog';
import {XDSSpinner} from '../Spinner';
import {
  type ExtractServerProps,
  type ExtractClientProps,
  type MakeOnOpenChangeOptional,
  ClientPropContext,
  buildPropsWithClientMarkers,
} from './ClientProp';

type ServerDialogFn<TProps> = (props: TProps) => Promise<ReactNode>;

type ServerProps<TProps> = ExtractServerProps<TProps>;

type ClientProps<TProps> = MakeOnOpenChangeOptional<ExtractClientProps<TProps>>;

export type ShowDialogFn<TProps> = (
  serverProps: ServerProps<TProps>,
  clientProps: ClientProps<TProps>,
) => void;

export type PreloadDialogFn<TProps> = (
  serverProps: ServerProps<TProps>,
  clientProps: ClientProps<TProps>,
) => void;

function LoadingDialog() {
  return (
    <XDSDialog isOpen onOpenChange={() => {}} width={400}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 0',
        }}>
        <XDSSpinner size="md" />
      </div>
    </XDSDialog>
  );
}

function DialogRenderer({dialogPromise}: {dialogPromise: Promise<ReactNode>}) {
  const content = use(dialogPromise);
  return <>{content}</>;
}

export function useXDSServerDialog<TProps extends Record<string, unknown>>(
  renderDialog: ServerDialogFn<TProps>,
): [ShowDialogFn<TProps>, PreloadDialogFn<TProps>, ReactNode] {
  const [dialogState, setDialogState] = useState<{
    promise: Promise<ReactNode>;
    clientProps: Record<string, unknown>;
  } | null>(null);

  const cacheRef = useRef<{
    key: string;
    promise: Promise<ReactNode>;
  } | null>(null);

  const getOrFetchDialog = useCallback(
    async (mergedProps: Record<string, unknown>): Promise<ReactNode> => {
      const key = JSON.stringify(mergedProps);
      if (cacheRef.current?.key === key) {
        return cacheRef.current.promise;
      }
      const promise = renderDialog(mergedProps as TProps);
      cacheRef.current = {key, promise};
      return promise;
    },
    [renderDialog],
  );

  const hideDialog = useCallback(() => {
    setDialogState(null);
  }, []);

  const showDialog = useCallback(
    (serverProps: ServerProps<TProps>, clientProps: ClientProps<TProps>) => {
      const userOnOpenChange = (clientProps as Record<string, unknown>)
        .onOpenChange as ((isOpen: boolean) => void) | undefined;

      const clientPropsWithOnOpenChange: Record<string, unknown> = {
        ...(clientProps as Record<string, unknown>),
        onOpenChange: (isOpen: boolean) => {
          if (!isOpen) {
            hideDialog();
            userOnOpenChange?.(false);
          }
        },
      };

      const mergedProps = buildPropsWithClientMarkers(
        serverProps,
        clientPropsWithOnOpenChange,
      );

      const promise = getOrFetchDialog(mergedProps);

      setDialogState({
        promise,
        clientProps: clientPropsWithOnOpenChange,
      });
    },
    [getOrFetchDialog, hideDialog],
  );

  const preloadDialog = useCallback(
    (serverProps: ServerProps<TProps>, clientProps: ClientProps<TProps>) => {
      const clientPropsWithOnOpenChange: Record<string, unknown> = {
        ...(clientProps as Record<string, unknown>),
        onOpenChange: null,
      };

      const mergedProps = buildPropsWithClientMarkers(
        serverProps,
        clientPropsWithOnOpenChange,
      );

      getOrFetchDialog(mergedProps);
    },
    [getOrFetchDialog],
  );

  const element = dialogState ? (
    <ClientPropContext.Provider value={dialogState.clientProps}>
      <Suspense fallback={<LoadingDialog />}>
        <DialogRenderer dialogPromise={dialogState.promise} />
      </Suspense>
    </ClientPropContext.Provider>
  ) : null;

  return [showDialog, preloadDialog, element] as [
    ShowDialogFn<TProps>,
    PreloadDialogFn<TProps>,
    ReactNode,
  ];
}
