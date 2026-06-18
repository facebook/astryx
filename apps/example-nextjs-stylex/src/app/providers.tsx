// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import Link from 'next/link';
import {Theme} from '@xds/core/theme';
import {LinkProvider} from '@xds/core/Link';
import {defaultTheme} from '@xds/theme-default/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <Theme theme={defaultTheme}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
