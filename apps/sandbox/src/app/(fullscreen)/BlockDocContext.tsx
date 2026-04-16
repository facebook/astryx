'use client';

import {createContext, useContext} from 'react';

export interface BlockDocMeta {
  aspectRatio: number;
  scale: number;
}

const BlockDocContext = createContext<BlockDocMeta | null>(null);

export function useBlockDoc() {
  return useContext(BlockDocContext);
}

export function BlockDocProvider({
  meta,
  children,
}: {
  meta: BlockDocMeta;
  children: React.ReactNode;
}) {
  return (
    <BlockDocContext.Provider value={meta}>{children}</BlockDocContext.Provider>
  );
}
