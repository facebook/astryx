// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createContext, useContext} from 'react';

const CLIENT_PROP_MARKER = 'client-prop' as const;

export interface ClientProp<out T> {
  readonly __clientPropMarker: typeof CLIENT_PROP_MARKER;
  readonly __propName: string;
  readonly __phantomType?: T;
}

export type MaybeClientProp<T> = ClientProp<T> | T;

export type ClientPropKeys<T> = {
  [K in keyof T]: T[K] extends ClientProp<unknown> ? K : never;
}[keyof T];

export type ExtractServerProps<T> = Omit<T, ClientPropKeys<T>>;

export type ExtractClientProps<T> = {
  [K in ClientPropKeys<T>]: T[K] extends ClientProp<infer V> ? V : never;
};

export type MakeOnOpenChangeOptional<T> = Omit<T, 'onOpenChange'> &
  Partial<Pick<T, 'onOpenChange' & keyof T>>;

export const ClientPropContext = createContext<Record<string, unknown>>({});
ClientPropContext.displayName = "ClientPropContext";

export function createClientPropMarker<T>(propName: string): ClientProp<T> {
  return {
    __clientPropMarker: CLIENT_PROP_MARKER,
    __propName: propName,
  };
}

export function isClientProp(prop: unknown): prop is ClientProp<unknown> {
  return (
    prop != null &&
    typeof prop === 'object' &&
    '__clientPropMarker' in prop &&
    (prop as ClientProp<unknown>).__clientPropMarker === CLIENT_PROP_MARKER
  );
}

export function useClientProp<T>(prop: ClientProp<T>): T {
  const ctx = useContext(ClientPropContext);
  return ctx[prop.__propName] as T;
}

export function useMaybeClientProp<T>(
  prop: MaybeClientProp<T> | null | undefined,
): T | null | undefined {
  const ctx = useContext(ClientPropContext);
  if (prop == null) {return prop;}
  if (isClientProp(prop)) {
    return ctx[prop.__propName] as T;
  }
  return prop;
}

export function buildPropsWithClientMarkers(
  serverProps: Record<string, unknown>,
  clientProps: Record<string, unknown>,
): Record<string, unknown> {
  const clientPropsMarkers = Object.fromEntries(
    Object.keys({...clientProps, onOpenChange: null}).map(propName => [
      propName,
      createClientPropMarker(propName),
    ]),
  );
  return {
    ...serverProps,
    ...clientPropsMarkers,
  };
}
