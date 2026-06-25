// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {Suspense, lazy} from 'react';
import {XDSTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme/neutral';
import '@astryxdesign/core/reset.css';
import '../tailwind.css';

const params = new URLSearchParams(window.location.search);
const file = params.get('file');

const Component = file
  ? lazy(() => import(/* @vite-ignore */ `../../results/${file}`))
  : null;

export default function Preview({theme}: {theme: string}) {
  if (!Component) {
    return (
      <div>
        No component loaded. Pass <code>?mode=preview&file=&lt;path&gt;</code>{' '}
        to render a result file.
      </div>
    );
  }

  return (
    <XDSTheme theme={neutralTheme} mode={theme === 'dark' ? 'dark' : 'light'}>
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    </XDSTheme>
  );
}
