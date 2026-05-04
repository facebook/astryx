'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCenter} from '@xds/core/Center';
import {XDSVStack} from '@xds/core/Layout';

export default function ProgressBarSemanticVariants() {
  return (
    <XDSVStack gap={4} width="100%" style={{maxWidth: 300}}>
      <XDSProgressBar
        value={60}
        label="Accent"
        variant="accent"
        hasValueLabel
      />
      <XDSProgressBar
        value={80}
        label="Positive"
        variant="positive"
        hasValueLabel
      />
      <XDSProgressBar
        value={50}
        label="Warning"
        variant="warning"
        hasValueLabel
      />
      <XDSProgressBar
        value={92}
        label="Negative"
        variant="negative"
        hasValueLabel
      />
      <XDSProgressBar
        value={35}
        label="Neutral"
        variant="neutral"
        hasValueLabel
      />
    </XDSVStack>
  );
}
