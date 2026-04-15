'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarSemanticVariant() {
  return <XDSProgressBar value={92} label="Disk" variant="negative" />;
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: ProgressBarSemanticVariant,
};
