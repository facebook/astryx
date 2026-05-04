'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCenter} from '@xds/core/Center';

export default function ProgressBarIndeterminate() {
  return (
    <XDSProgressBar isIndeterminate label="Loading..." style={{width: 300}} />
  );
}
