'use client';

import {createContext, useContext} from 'react';

export type XDSNavHeadingMenuSize = 'sm' | 'md' | 'lg';

export interface XDSNavMenuContextValue {
  closeMenu: () => void;
  size: XDSNavHeadingMenuSize;
}

export const XDSNavMenuContext = createContext<XDSNavMenuContextValue | null>(
  null,
);

export function useXDSNavMenuContext(): XDSNavMenuContextValue | null {
  return useContext(XDSNavMenuContext);
}
