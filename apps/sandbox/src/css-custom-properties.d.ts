// Copyright (c) Meta Platforms, Inc. and affiliates.

import 'react';

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
