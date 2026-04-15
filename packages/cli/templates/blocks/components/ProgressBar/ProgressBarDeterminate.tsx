'use client';

import {XDSProgressBar} from '@xds/core/ProgressBar';

export default function ProgressBarDeterminate() {
  return <XDSProgressBar value={75} label="Upload progress" />;
}

export const showcase = {
  aspectRatio: 16 / 4,
  render: ProgressBarDeterminate,
};
