'use client';

import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme-default';

export function Providers({children}: {children: React.ReactNode}) {
  return <XDSTheme theme={defaultTheme}>{children}</XDSTheme>;
}
