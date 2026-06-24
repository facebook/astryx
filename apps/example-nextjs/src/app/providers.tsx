// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import Link from 'next/link';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {defaultTheme} from '@astryxdesign/theme-default/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <Theme theme={defaultTheme}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
