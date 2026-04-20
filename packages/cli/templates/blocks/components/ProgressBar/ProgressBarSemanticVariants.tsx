'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarSemanticVariants() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 300}}>
      <XDSProgressBar value={60} label="Accent" variant="accent" hasValueLabel />
      <XDSProgressBar value={80} label="Positive" variant="positive" hasValueLabel />
      <XDSProgressBar value={50} label="Warning" variant="warning" hasValueLabel />
      <XDSProgressBar value={92} label="Negative" variant="negative" hasValueLabel />
      <XDSProgressBar value={35} label="Neutral" variant="neutral" hasValueLabel />
    </div>
  );
}
