'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarHiddenLabel() {
  return <XDSProgressBar value={50} label="Loading" isLabelHidden />;
}
