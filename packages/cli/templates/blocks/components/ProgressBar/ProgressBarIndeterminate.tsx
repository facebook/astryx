// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarIndeterminate() {
  return (<ProgressBar isIndeterminate label="Loading..." style={{width: 300}} />);
}
