// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect} from 'react';
import Link from 'next/link';
import {XDSTheme} from '@xds/core/theme';
import {XDSLinkProvider} from '@xds/core/Link';
import {defaultTheme} from '@xds/theme-default/built';

export function Providers({children}: {children: React.ReactNode}) {
  // Belt-and-suspenders: the inline <script> in layout.tsx already sets
  // scrollRestoration = 'manual' synchronously before hydration, but some
  // browsers / Next.js situations still try to restore scroll after
  // hydration kicks in. Forcing scroll back to (0, 0) once we mount
  // guarantees every page load lands at the top.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <XDSTheme theme={defaultTheme}>
      <XDSLinkProvider component={Link}>{children}</XDSLinkProvider>
    </XDSTheme>
  );
}
