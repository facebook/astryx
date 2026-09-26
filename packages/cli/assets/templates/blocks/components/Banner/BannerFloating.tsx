// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Banner} from '@astryxdesign/core/Banner';

export default function BannerFloating() {
  return (
    <Banner
      status="info"
      title="You have unsaved changes"
      description="A raised banner reads as an overlay floating above the page."
      elevation="med"
    />
  );
}
