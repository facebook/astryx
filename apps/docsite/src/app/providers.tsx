// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import Link from 'next/link';
import {XDSTheme} from '@xds/core/theme';
import {XDSLinkProvider} from '@xds/core/Link';
import {astryxTheme} from '../themes/astryx';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <XDSTheme theme={astryxTheme}>
      <XDSLinkProvider component={Link}>{children}</XDSLinkProvider>
    </XDSTheme>
  );
}
