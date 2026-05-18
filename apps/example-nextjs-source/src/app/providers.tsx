// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import Link from 'next/link';
import {XDSTheme} from '@xds/core/theme';
import {XDSLinkProvider} from '@xds/core/Link';
import {defaultTheme} from '@xds/theme-default';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <XDSTheme theme={defaultTheme}>
      <XDSLinkProvider component={Link}>{children}</XDSLinkProvider>
    </XDSTheme>
  );
}
