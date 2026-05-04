'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarShowcase() {
  return <XDSProgressBar value={60} label="Progress" style={{width: 300}} />;
}
