'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCenter} from '@xds/core/Center';

export default function ProgressBarWithValueLabel() {
  return (
    <XDSCenter width={300}>
      <XDSProgressBar value={75} label="Storage used" hasValueLabel />
    </XDSCenter>
  );
}
