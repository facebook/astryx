'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCenter} from '@xds/core/Center';

export default function ProgressBarIndeterminate() {
  return (
    <XDSCenter width={300}>
      <XDSProgressBar isIndeterminate label="Loading..." />
    </XDSCenter>
  );
}
