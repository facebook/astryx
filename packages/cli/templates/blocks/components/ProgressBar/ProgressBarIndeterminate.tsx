'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarIndeterminate() {
  return (
    <XDSProgressBar isIndeterminate label="Loading..." style={{width: 300}} />
  );
}
